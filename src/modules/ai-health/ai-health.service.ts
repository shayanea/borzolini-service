import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Repository } from 'typeorm';

import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Pet, PetSpecies } from '../pets/entities/pet.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { GenerateRecommendationsDto } from './dto/generate-recommendations.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';
import { AiHealthInsight, InsightCategory, InsightType, UrgencyLevel } from './entities/ai-health-insight.entity';

export interface PetHealthProfile {
  pet: Pet;
  owner: User;
  appointments: Appointment[];
  recentSymptoms: string[];
  healthTrends: any;
  riskFactors: string[];
}

export interface AiRecommendation {
  title: string;
  description: string;
  category: InsightCategory;
  type: InsightType;
  urgency: UrgencyLevel;
  suggestedAction: string;
  context: string;
  confidenceScore: number;
  supportingData: any;
}

@Injectable()
export class AiHealthService {
  private readonly logger = new Logger(AiHealthService.name);
  private openai!: OpenAI;

  constructor(
    @InjectRepository(AiHealthInsight)
    private readonly aiInsightRepository: Repository<AiHealthInsight>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OpenAI API key not found. AI features will be limited.');
    }
  }

  /**
   * Generate comprehensive AI recommendations for a pet
   */
  async generateRecommendations(dto: GenerateRecommendationsDto): Promise<AiHealthInsight[]> {
    try {
      // Get pet and related data
      const petProfile = await this.buildPetHealthProfile(dto.pet_id);
      if (!petProfile) {
        throw new NotFoundException(`Pet with ID ${dto.pet_id} not found`);
      }

      // Generate AI recommendations
      const recommendations = await this.generateAiRecommendations(petProfile, dto);

      // Save recommendations to database
      const savedInsights: AiHealthInsight[] = [];
      for (const rec of recommendations) {
        const insight = this.aiInsightRepository.create({
          pet_id: dto.pet_id,
          insight_type: rec.type,
          category: rec.category,
          title: rec.title,
          description: rec.description,
          confidence_score: rec.confidenceScore,
          urgency_level: rec.urgency,
          suggested_action: rec.suggestedAction,
          context: rec.context,
          supporting_data: rec.supportingData,
        });

        const savedInsight = await this.aiInsightRepository.save(insight);
        savedInsights.push(savedInsight);
      }

      this.logger.log(`Generated ${savedInsights.length} AI insights for pet ${dto.pet_id}`);
      return savedInsights;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to generate recommendations: ${errorMessage}`, errorStack);
      throw new BadRequestException('Failed to generate AI recommendations');
    }
  }

  /**
   * Get all insights for a specific pet
   */
  async getPetInsights(petId: string, includeDismissed: boolean = false): Promise<AiHealthInsight[]> {
    const query = this.aiInsightRepository.createQueryBuilder('insight').where('insight.pet_id = :petId', { petId }).orderBy('insight.created_at', 'DESC');

    if (!includeDismissed) {
      query.andWhere('insight.dismissed = :dismissed', { dismissed: false });
    }

    return await query.getMany();
  }

  /**
   * Get up to `limit` combined recommendations across all pets owned by a user
   * Ordered by urgency (URGENT > HIGH > MEDIUM > LOW) then recent first
   */
  async getCombinedRecommendationsForUser(userId: string, limit: number = 5): Promise<AiHealthInsight[]> {
    if (!userId) {
      throw new BadRequestException('Missing authenticated user id');
    }

    // Find pet ids for this user
    const petIds = (await this.petRepository.createQueryBuilder('pet').leftJoin('pet.owner', 'owner').where('owner.id = :userId', { userId }).select(['pet.id']).getMany()).map((p) => p.id);

    if (petIds.length === 0) {
      return [];
    }

    // Urgency ordering map (higher first)
    // TypeORM can't order by enum weight easily across all DBs, so we map via CASE
    const urgencyOrderCase = `CASE 
      WHEN insight.urgency_level::text = 'urgent' THEN 4
      WHEN insight.urgency_level::text = 'high' THEN 3
      WHEN insight.urgency_level::text = 'medium' THEN 2
      WHEN insight.urgency_level::text = 'low' THEN 1
      ELSE 0 END`;

    const insights = await this.aiInsightRepository
      .createQueryBuilder('insight')
      .where('insight.pet_id IN (:...petIds)', { petIds })
      .andWhere('insight.dismissed = :dismissed', { dismissed: false })
      .andWhere('insight.insight_type = :type', { type: InsightType.RECOMMENDATION })
      .orderBy(urgencyOrderCase, 'DESC')
      .addOrderBy('insight.created_at', 'DESC')
      .limit(limit)
      .getMany();

    return insights;
  }

  /**
   * Get insights by category for a pet
   */
  async getInsightsByCategory(petId: string, category: InsightCategory): Promise<AiHealthInsight[]> {
    return await this.aiInsightRepository.find({
      where: {
        pet_id: petId,
        category,
        dismissed: false,
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Update insight with owner feedback
   */
  async updateInsight(insightId: string, updateDto: UpdateInsightDto): Promise<AiHealthInsight> {
    const insight = await this.aiInsightRepository.findOne({
      where: { id: insightId },
    });

    if (!insight) {
      throw new NotFoundException(`Insight with ID ${insightId} not found`);
    }

    // Update fields
    if (updateDto.dismissed !== undefined) {
      insight.dismissed = updateDto.dismissed;
      insight.dismissed_at = updateDto.dismissed ? new Date() : null;
    }

    if (updateDto.acted_upon !== undefined) {
      insight.acted_upon = updateDto.acted_upon;
      insight.acted_upon_at = updateDto.acted_upon ? new Date() : null;
    }

    if (updateDto.owner_feedback !== undefined) {
      insight.owner_feedback = updateDto.owner_feedback;
    }

    if (updateDto.owner_rating !== undefined) {
      insight.owner_rating = updateDto.owner_rating;
    }

    return await this.aiInsightRepository.save(insight);
  }

  /**
   * Get urgent insights for a pet
   */
  async getUrgentInsights(petId: string): Promise<AiHealthInsight[]> {
    return await this.aiInsightRepository.find({
      where: {
        pet_id: petId,
        urgency_level: UrgencyLevel.URGENT,
        dismissed: false,
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get insights summary for dashboard
   */
  async getInsightsSummary(petId: string): Promise<{
    total: number;
    urgent: number;
    recommendations: number;
    alerts: number;
    recent: AiHealthInsight[];
  }> {
    const [total, urgent, recommendations, alerts, recent] = await Promise.all([
      this.aiInsightRepository.count({
        where: { pet_id: petId, dismissed: false },
      }),
      this.aiInsightRepository.count({
        where: {
          pet_id: petId,
          urgency_level: UrgencyLevel.URGENT,
          dismissed: false,
        },
      }),
      this.aiInsightRepository.count({
        where: {
          pet_id: petId,
          insight_type: InsightType.RECOMMENDATION,
          dismissed: false,
        },
      }),
      this.aiInsightRepository.count({
        where: {
          pet_id: petId,
          insight_type: InsightType.ALERT,
          dismissed: false,
        },
      }),
      this.aiInsightRepository.find({
        where: { pet_id: petId, dismissed: false },
        order: { created_at: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      total,
      urgent,
      recommendations,
      alerts,
      recent,
    };
  }

  /**
   * Build comprehensive pet health profile for AI analysis
   */
  private async buildPetHealthProfile(petId: string): Promise<PetHealthProfile | null> {
    const pet = await this.petRepository.findOne({
      where: { id: petId },
      relations: ['owner'],
    });

    if (!pet) return null;

    const appointments = await this.appointmentRepository.find({
      where: { pet_id: petId },
      order: { scheduled_date: 'DESC' },
      take: 20, // Last 20 appointments
    });

    // Extract recent symptoms and health data
    const recentSymptoms = appointments
      .filter((apt) => apt.symptoms)
      .map((apt) => apt.symptoms!)
      .slice(0, 10);

    // Analyze health trends
    const healthTrends = this.analyzeHealthTrends(appointments, pet);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(pet, appointments);

    return {
      pet,
      owner: pet.owner,
      appointments,
      recentSymptoms,
      healthTrends,
      riskFactors,
    };
  }

  /**
   * Generate AI recommendations using OpenAI
   */
  private async generateAiRecommendations(profile: PetHealthProfile, dto: GenerateRecommendationsDto): Promise<AiRecommendation[]> {
    if (!this.openai) {
      // Fallback to rule-based recommendations if OpenAI is not available
      return this.generateFallbackRecommendations(profile, dto);
    }

    try {
      const prompt = this.buildAiPrompt(profile, dto);

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL', 'gpt-4'),
        messages: [
          {
            role: 'system',
            content: `You are an expert veterinary AI assistant. Generate personalized, actionable recommendations for pet owners based on their pet's profile, health history, and specific needs. Focus on practical, evidence-based advice that improves pet health and wellbeing.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseAiResponse(response, profile, dto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`OpenAI API error: ${errorMessage}`);
      // Fallback to rule-based recommendations
      return this.generateFallbackRecommendations(profile, dto);
    }
  }

  /**
   * Build comprehensive prompt for AI analysis
   */
  private buildAiPrompt(profile: PetHealthProfile, dto: GenerateRecommendationsDto): string {
    const { pet, owner, appointments, recentSymptoms, healthTrends, riskFactors } = profile;

    return `
Generate personalized pet care recommendations for ${pet.name}, a ${pet.age || 'unknown age'} year old ${pet.gender} ${pet.breed || pet.species}.

PET PROFILE:
- Species: ${pet.species}
- Breed: ${pet.breed || 'Unknown'}
- Age: ${pet.age || 'Unknown'} years
- Weight: ${pet.weight || 'Unknown'} lbs
- Size: ${pet.size || 'Unknown'}
- Spayed/Neutered: ${pet.is_spayed_neutered ? 'Yes' : 'No'}
- Vaccinated: ${pet.is_vaccinated ? 'Yes' : 'No'}
- Allergies: ${pet.allergies?.join(', ') || 'None known'}
- Current Medications: ${pet.medications?.join(', ') || 'None'}
- Dietary Requirements: ${pet.dietary_requirements || 'Standard diet'}
- Medical History: ${pet.medical_history || 'None significant'}

HEALTH HISTORY:
- Recent Symptoms: ${recentSymptoms.join('; ') || 'None reported'}
- Appointment Types: ${appointments.map((apt) => apt.appointment_type).join(', ')}
- Health Trends: ${JSON.stringify(healthTrends)}

RISK FACTORS:
${riskFactors.map((factor) => `- ${factor}`).join('\n')}

OWNER CONTEXT:
- Owner Experience: ${owner.role === UserRole.PATIENT ? 'Pet owner' : 'Veterinary professional'}
- Location: ${owner.city || 'Unknown'}, ${owner.country || 'Unknown'}

REQUIREMENTS:
- Categories: ${dto.categories?.join(', ') || 'All categories'}
- Types: ${dto.insight_types?.join(', ') || 'All types'}
- Include Emergency Alerts: ${dto.include_emergency_alerts}
- Include Preventive Care: ${dto.include_preventive_care}
- Include Lifestyle Tips: ${dto.include_lifestyle_tips}
- Custom Context: ${dto.custom_context || 'None'}

Generate 5-8 personalized recommendations covering:
1. Preventive care and vaccinations
2. Nutrition and diet
3. Exercise and lifestyle
4. Behavioral training
5. Grooming and hygiene
6. Emergency preparedness
7. Breed-specific considerations
8. Seasonal care tips

Format each recommendation as JSON with: title, description, category, type, urgency, suggestedAction, context, confidenceScore (0.0-1.0), supportingData.
    `;
  }

  /**
   * Parse AI response into structured recommendations
   */
  private parseAiResponse(response: string, profile: PetHealthProfile, dto: GenerateRecommendationsDto): AiRecommendation[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        return recommendations.map((rec: any) => ({
          title: rec.title || 'AI Recommendation',
          description: rec.description || 'Personalized pet care advice',
          category: rec.category || InsightCategory.HEALTH,
          type: rec.type || InsightType.RECOMMENDATION,
          urgency: rec.urgency || UrgencyLevel.LOW,
          suggestedAction: rec.suggestedAction || 'Consult with your veterinarian',
          context: rec.context || 'AI-generated recommendation',
          confidenceScore: rec.confidenceScore || 0.8,
          supportingData: rec.supportingData || {},
        }));
      }
    } catch (error) {
      this.logger.warn('Failed to parse AI response as JSON, using fallback');
    }

    // Fallback parsing or return basic recommendations
    return this.generateFallbackRecommendations(profile, dto);
  }

  /**
   * Generate rule-based recommendations when AI is unavailable
   */
  private generateFallbackRecommendations(profile: PetHealthProfile, _dto: GenerateRecommendationsDto): AiRecommendation[] {
    const { pet } = profile;
    const recommendations: AiRecommendation[] = [];

    // Age-based recommendations
    if (pet.age && pet.age < 1) {
      recommendations.push({
        title: 'Puppy/Kitten Vaccination Schedule',
        description: `${pet.name} is young and needs regular vaccinations. Follow your veterinarian's recommended schedule.`,
        category: InsightCategory.PREVENTIVE_CARE,
        type: InsightType.RECOMMENDATION,
        urgency: UrgencyLevel.MEDIUM,
        suggestedAction: 'Schedule vaccination appointments according to age milestones',
        context: 'Age-based preventive care',
        confidenceScore: 0.9,
        supportingData: { age: pet.age, species: pet.species },
      });
    }

    // Weight-based recommendations
    if (pet.weight && pet.weight > 50) {
      recommendations.push({
        title: 'Large Breed Exercise Needs',
        description: `${pet.name} is a large breed that requires regular exercise and joint health monitoring.`,
        category: InsightCategory.LIFESTYLE,
        type: InsightType.RECOMMENDATION,
        urgency: UrgencyLevel.LOW,
        suggestedAction: 'Ensure daily exercise and consider joint supplements',
        context: 'Size-based lifestyle recommendations',
        confidenceScore: 0.8,
        supportingData: { weight: pet.weight, size: pet.size },
      });
    }

    // Vaccination status
    if (!pet.is_vaccinated) {
      recommendations.push({
        title: 'Vaccination Required',
        description: `${pet.name} needs to be vaccinated to protect against common diseases.`,
        category: InsightCategory.PREVENTIVE_CARE,
        type: InsightType.ALERT,
        urgency: UrgencyLevel.HIGH,
        suggestedAction: 'Schedule vaccination appointment immediately',
        context: 'Missing vaccinations',
        confidenceScore: 0.95,
        supportingData: { vaccinationStatus: false },
      });
    }

    // Spay/neuter recommendations
    if (!pet.is_spayed_neutered && pet.age && pet.age > 6) {
      recommendations.push({
        title: 'Consider Spaying/Neutering',
        description: `${pet.name} is old enough for spaying/neutering, which provides health benefits.`,
        category: InsightCategory.HEALTH,
        type: InsightType.RECOMMENDATION,
        urgency: UrgencyLevel.MEDIUM,
        suggestedAction: 'Discuss spaying/neutering with your veterinarian',
        context: 'Reproductive health',
        confidenceScore: 0.85,
        supportingData: { age: pet.age, spayedNeutered: false },
      });
    }

    // Seasonal recommendations
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 3 && currentMonth <= 8) {
      recommendations.push({
        title: 'Flea and Tick Prevention',
        description: 'Warmer months require increased flea and tick prevention measures.',
        category: InsightCategory.PREVENTIVE_CARE,
        type: InsightType.REMINDER,
        urgency: UrgencyLevel.MEDIUM,
        suggestedAction: 'Ensure flea and tick prevention is current',
        context: 'Seasonal care',
        confidenceScore: 0.9,
        supportingData: { season: 'spring/summer', currentMonth },
      });
    }

    return recommendations;
  }

  /**
   * Analyze health trends from appointment data
   */
  private analyzeHealthTrends(appointments: Appointment[], _pet: Pet): any {
    const completedAppointments = appointments.filter((apt) => apt.status === AppointmentStatus.COMPLETED);

    if (completedAppointments.length === 0) {
      return { message: 'No completed appointments to analyze' };
    }

    const trends = {
      totalAppointments: completedAppointments.length,
      commonTypes: this.getMostFrequent(completedAppointments.map((apt) => apt.appointment_type)),
      recentSymptoms: this.getMostFrequent(completedAppointments.filter((apt) => apt.symptoms).map((apt) => apt.symptoms)),
      averageCost: completedAppointments.reduce((sum, apt) => sum + (apt.cost || 0), 0) / completedAppointments.length,
      lastVisit: completedAppointments[0]?.scheduled_date,
    };

    return trends;
  }

  /**
   * Identify risk factors for the pet
   */
  private identifyRiskFactors(pet: Pet, _appointments: Appointment[]): string[] {
    const riskFactors: string[] = [];

    // Age-related risks
    if (pet.age && pet.age > 7) {
      riskFactors.push('Senior pet - increased health monitoring needed');
    }

    if (pet.age && pet.age < 1) {
      riskFactors.push('Young pet - requires frequent veterinary care');
    }

    // Weight-related risks
    if (pet.weight && pet.weight > 80) {
      riskFactors.push('Large breed - joint and heart health monitoring');
    }

    if (pet.weight && pet.weight < 5) {
      riskFactors.push('Small breed - hypoglycemia risk, frequent feeding needed');
    }

    // Medical history risks
    if (pet.allergies && pet.allergies.length > 0) {
      riskFactors.push('Known allergies - careful ingredient monitoring required');
    }

    if (pet.medications && pet.medications.length > 0) {
      riskFactors.push('On medications - requires regular monitoring');
    }

    // Vaccination risks
    if (!pet.is_vaccinated) {
      riskFactors.push('Unvaccinated - high disease risk');
    }

    // Breed-specific risks
    if (pet.breed) {
      const breedRisks = this.getBreedSpecificRisks(pet.breed, pet.species);
      riskFactors.push(...breedRisks);
    }

    return riskFactors;
  }

  /**
   * Get breed-specific health risks
   */
  private getBreedSpecificRisks(breed: string, species: PetSpecies): string[] {
    const risks: string[] = [];
    const breedLower = breed.toLowerCase();

    if (species === PetSpecies.DOG) {
      if (breedLower.includes('bulldog') || breedLower.includes('pug')) {
        risks.push('Brachycephalic breed - respiratory issues, heat sensitivity');
      }
      if (breedLower.includes('german shepherd') || breedLower.includes('labrador')) {
        risks.push('Large breed - hip dysplasia risk');
      }
      if (breedLower.includes('golden retriever')) {
        risks.push('Cancer-prone breed - regular screening recommended');
      }
    }

    if (species === PetSpecies.CAT) {
      if (breedLower.includes('persian')) {
        risks.push('Brachycephalic breed - respiratory and dental issues');
      }
      if (breedLower.includes('siamese')) {
        risks.push('Prone to dental disease and kidney issues');
      }
    }

    return risks;
  }

  /**
   * Get most frequent items from array
   */
  private getMostFrequent<T>(items: T[]): T[] {
    const frequency: Map<T, number> = new Map();

    items.forEach((item) => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });

    return Array.from(frequency.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([item]) => item);
  }
}
