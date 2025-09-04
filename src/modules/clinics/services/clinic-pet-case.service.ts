import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';
import { CreatePetCaseDto } from '../dto/create-pet-case.dto';
import { UpdatePetCaseDto } from '../dto/update-pet-case.dto';
import { ClinicCaseTimeline, TimelineEventType } from '../entities/case-timeline.entity';
import { Clinic } from '../entities/clinic.entity';
import { CasePriority, CaseStatus, CaseType, ClinicPetCase } from '../entities/pet-case.entity';

export interface CaseFilters {
  status?: CaseStatus[] | undefined;
  priority?: CasePriority[] | undefined;
  case_type?: CaseType[] | undefined;
  pet_id?: string | undefined;
  owner_id?: string | undefined;
  vet_id?: string | undefined;
  is_urgent?: boolean | undefined;
  is_resolved?: boolean | undefined;
  date_from?: Date | undefined;
  date_to?: Date | undefined;
}

@Injectable()
export class ClinicPetCaseService {
  private readonly logger = new Logger(ClinicPetCaseService.name);

  constructor(
    @InjectRepository(ClinicPetCase)
    private readonly petCaseRepository: Repository<ClinicPetCase>,
    @InjectRepository(ClinicCaseTimeline)
    private readonly timelineRepository: Repository<ClinicCaseTimeline>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>
  ) {}

  async createCase(clinicId: string, createCaseDto: CreatePetCaseDto, ownerId: string): Promise<ClinicPetCase> {
    // Validate clinic exists
    const clinic = await this.clinicRepository.findOne({
      where: { id: clinicId, is_active: true },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found or inactive');
    }

    // Validate pet exists and belongs to owner
    const pet = await this.petRepository.findOne({
      where: { id: createCaseDto.pet_id, owner_id: ownerId },
      relations: ['owner', 'breed_relation'],
    });

    if (!pet) {
      throw new NotFoundException('Pet not found or does not belong to user');
    }

    // Validate vet exists if provided
    if (createCaseDto.vet_id) {
      const vet = await this.userRepository.findOne({
        where: { id: createCaseDto.vet_id },
      });
      if (!vet) {
        throw new NotFoundException('Veterinarian not found');
      }
    }

    // Generate case number
    const caseNumber = await this.generateCaseNumber(clinicId);

    // Create case
    const petCase = this.petCaseRepository.create({
      ...createCaseDto,
      clinic_id: clinicId,
      owner_id: ownerId,
      case_number: caseNumber,
      timeline: [
        {
          timestamp: new Date(),
          event_type: TimelineEventType.CASE_CREATED,
          description: `Case created for ${pet.name}`,
          user_id: ownerId,
          user_name: `${pet.owner.firstName  } ${  pet.owner.lastName}`,
        },
      ],
    });

    const savedCase = await this.petCaseRepository.save(petCase);

    // Add timeline event
    await this.addTimelineEvent(savedCase.id, {
      event_type: TimelineEventType.CASE_CREATED,
      title: 'Case Created',
      description: `New case created for ${pet.name}: ${createCaseDto.title}`,
      created_by: ownerId,
    });

    this.logger.log(`Created pet case ${savedCase.case_number} for clinic ${clinicId}`);
    return savedCase;
  }

  async getCasesByClinic(clinicId: string, filters: CaseFilters = {}, page: number = 1, limit: number = 10) {
    const query = this.petCaseRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.pet', 'pet')
      .leftJoinAndSelect('case.owner', 'owner')
      .leftJoinAndSelect('case.veterinarian', 'vet')
      .where('case.clinic_id = :clinicId', { clinicId })
      .andWhere('case.is_active = :isActive', { isActive: true });

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query.andWhere('case.status IN (:...statuses)', { statuses: filters.status });
    }

    if (filters.priority && filters.priority.length > 0) {
      query.andWhere('case.priority IN (:...priorities)', { priorities: filters.priority });
    }

    if (filters.case_type && filters.case_type.length > 0) {
      query.andWhere('case.case_type IN (:...caseTypes)', { caseTypes: filters.case_type });
    }

    if (filters.pet_id) {
      query.andWhere('case.pet_id = :petId', { petId: filters.pet_id });
    }

    if (filters.owner_id) {
      query.andWhere('case.owner_id = :ownerId', { ownerId: filters.owner_id });
    }

    if (filters.vet_id) {
      query.andWhere('case.vet_id = :vetId', { vetId: filters.vet_id });
    }

    if (filters.is_urgent) {
      query.andWhere('case.priority IN (:...urgentPriorities)', {
        urgentPriorities: [CasePriority.URGENT, CasePriority.EMERGENCY],
      });
    }

    if (filters.is_resolved) {
      query.andWhere('case.status IN (:...resolvedStatuses)', {
        resolvedStatuses: [CaseStatus.RESOLVED, CaseStatus.CLOSED],
      });
    }

    if (filters.date_from) {
      query.andWhere('case.created_at >= :dateFrom', { dateFrom: filters.date_from });
    }

    if (filters.date_to) {
      query.andWhere('case.created_at <= :dateTo', { dateTo: filters.date_to });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination and sorting
    const cases = await query
      .orderBy('case.priority', 'DESC')
      .addOrderBy('case.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      cases,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCaseById(clinicId: string, caseId: string): Promise<ClinicPetCase> {
    const petCase = await this.petCaseRepository.findOne({
      where: { id: caseId, clinic_id: clinicId, is_active: true },
      relations: ['pet', 'owner', 'veterinarian', 'appointments'],
    });

    if (!petCase) {
      throw new NotFoundException('Pet case not found');
    }

    return petCase;
  }

  async updateCase(clinicId: string, caseId: string, updateDto: UpdatePetCaseDto, userId: string): Promise<ClinicPetCase> {
    const petCase = await this.getCaseById(clinicId, caseId);

    // Track changes for timeline
    const changes: string[] = [];

    if (updateDto.status && updateDto.status !== petCase.status) {
      changes.push(`Status changed from ${petCase.status} to ${updateDto.status}`);
    }

    if (updateDto.priority && updateDto.priority !== petCase.priority) {
      changes.push(`Priority changed from ${petCase.priority} to ${updateDto.priority}`);
    }

    if (updateDto.current_symptoms) {
      changes.push('Symptoms updated');
    }

    if (updateDto.diagnosis) {
      changes.push('Diagnosis added');
    }

    if (updateDto.treatment_plan) {
      changes.push('Treatment plan updated');
    }

    // Update case
    Object.assign(petCase, updateDto);
    const updatedCase = await this.petCaseRepository.save(petCase);

    // Add timeline events for changes
    for (const change of changes) {
      await this.addTimelineEvent(caseId, {
        event_type: TimelineEventType.STATUS_CHANGED,
        title: 'Case Updated',
        description: change,
        created_by: userId,
      });
    }

    this.logger.log(`Updated pet case ${petCase.case_number} in clinic ${clinicId}`);
    return updatedCase;
  }

  async addTimelineEvent(
    caseId: string,
    eventData: {
      event_type: TimelineEventType;
      title: string;
      description: string;
      created_by?: string;
      metadata?: any;
    }
  ): Promise<ClinicCaseTimeline> {
    const timelineEvent = this.timelineRepository.create({
      case_id: caseId,
      ...eventData,
    });

    return await this.timelineRepository.save(timelineEvent);
  }

  async getCaseTimeline(caseId: string): Promise<ClinicCaseTimeline[]> {
    return await this.timelineRepository.find({
      where: { case_id: caseId },
      order: { occurred_at: 'ASC' },
      relations: ['creator'],
    });
  }

  async getCaseStats(clinicId: string): Promise<any> {
    const query = this.petCaseRepository.createQueryBuilder('case').where('case.clinic_id = :clinicId', { clinicId }).andWhere('case.is_active = :isActive', { isActive: true });

    const cases = await query.getMany();

    const stats = {
      total: cases.length,
      byStatus: {} as Record<CaseStatus, number>,
      byPriority: {} as Record<CasePriority, number>,
      byType: {} as Record<CaseType, number>,
      urgent: 0,
      resolved: 0,
      averageResolutionTime: 0,
    };

    // Initialize counters
    Object.values(CaseStatus).forEach((status) => {
      stats.byStatus[status] = 0;
    });
    Object.values(CasePriority).forEach((priority) => {
      stats.byPriority[priority] = 0;
    });
    Object.values(CaseType).forEach((type) => {
      stats.byType[type] = 0;
    });

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    cases.forEach((case_) => {
      stats.byStatus[case_.status]++;
      stats.byPriority[case_.priority]++;
      stats.byType[case_.case_type]++;

      if (case_.isUrgent) {
        stats.urgent++;
      }

      if (case_.isResolved) {
        stats.resolved++;
        if (case_.resolved_at) {
          const resolutionTime = case_.resolved_at.getTime() - case_.created_at.getTime();
          totalResolutionTime += resolutionTime;
          resolvedCount++;
        }
      }
    });

    if (resolvedCount > 0) {
      stats.averageResolutionTime = Math.round(totalResolutionTime / resolvedCount / (1000 * 60 * 60 * 24)); // days
    }

    return stats;
  }

  private async generateCaseNumber(clinicId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CASE-${year}`;

    const lastCase = await this.petCaseRepository
      .createQueryBuilder('case')
      .where('case.clinic_id = :clinicId', { clinicId })
      .andWhere('case.case_number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('case.case_number', 'DESC')
      .getOne();

    if (!lastCase) {
      return `${prefix}-0001`;
    }

    const caseNumber = lastCase.case_number || '';
    const parts = caseNumber.split('-');
    const lastNumber = parts.length >= 3 && parts[2] ? parseInt(parts[2]) : 0;
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');

    return `${prefix}-${nextNumber}`;
  }
}
