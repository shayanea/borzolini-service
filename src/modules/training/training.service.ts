import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { TrainingActivity } from './entities/training-activity.entity';
import { DailyTrainingAssignment } from './entities/daily-training-assignment.entity';
import { PetSpecies } from '../breeds/entities/breed.entity';
import { CreateTrainingAssignmentDto, CompleteTrainingDto, DailyTrainingStatsDto } from './dto/daily-training-assignment.dto';
import {
  CreateTrainingActivityDto,
  TrainingActivityResponseDto,
  UpdateTrainingActivityDto,
} from './dto/training-activity-admin.dto';

@Injectable()
export class TrainingService {
  private readonly logger = new Logger(TrainingService.name);

  constructor(
    @InjectRepository(TrainingActivity) private readonly activityRepo: Repository<TrainingActivity>,
    @InjectRepository(DailyTrainingAssignment) private readonly assignmentRepo: Repository<DailyTrainingAssignment>,
  ) {}

  async search(q: string, species?: PetSpecies, tags?: string[], difficulty?: string) {
    const like = `%${q}%`;
    const activities = await this.activityRepo.find({
      where: [{ title: ILike(like) }, { summary: ILike(like) }],
      take: 100,
      relations: ['by_species'],
    });
    let filtered = activities;
    if (species) {
      filtered = filtered.map((a) => ({ ...a, by_species: (a.by_species || []).filter((s) => s.species === species) }));
    }
    if (tags && tags.length) {
      filtered = filtered.filter((a) => (a.tags || []).some((t) => tags.includes(t)));
    }
    if (difficulty) {
      filtered = filtered.filter((a) => a.difficulty === difficulty);
    }
    return filtered;
  }

  async listBySpecies(species: PetSpecies) {
    const activities = await this.activityRepo.find({ relations: ['by_species'], take: 100 });
    return activities.map((a) => ({ ...a, by_species: (a.by_species || []).filter((s) => s.species === species) }));
  }

  /**
   * Get all training activities with pagination, filtering, and sorting (Admin only)
   */
  async findAllActivities(options: {
    page: number;
    limit: number;
    search?: string;
    species?: PetSpecies;
    difficulty?: string;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }): Promise<{ activities: TrainingActivity[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.activityRepo.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.by_species', 'species');

    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (options.search) {
      conditions.push('(activity.title ILIKE :search OR activity.summary ILIKE :search)');
      params.search = `%${options.search}%`;
    }

    if (options.difficulty) {
      conditions.push('activity.difficulty = :difficulty');
      params.difficulty = options.difficulty;
    }

    if (conditions.length > 0) {
      queryBuilder.where(conditions.join(' AND '), params);
    }

    if (options.species) {
      // Use EXISTS subquery to filter by species without excluding activities without species relationships
      if (conditions.length > 0) {
        queryBuilder.andWhere(
          'EXISTS (SELECT 1 FROM training_activity_species tas WHERE tas.activity_id = activity.id AND tas.species = :species)',
          { species: options.species }
        );
      } else {
        queryBuilder.where(
          'EXISTS (SELECT 1 FROM training_activity_species tas WHERE tas.activity_id = activity.id AND tas.species = :species)',
          { species: options.species }
        );
      }
    }

    const total = await queryBuilder.getCount();

    // Validate sortBy to prevent SQL injection
    const validSortFields = ['created_at', 'updated_at', 'title', 'difficulty', 'avg_duration_minutes'];
    const sortBy = validSortFields.includes(options.sortBy) ? options.sortBy : 'created_at';
    const sortOrder = options.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder
      .orderBy(`activity.${sortBy}`, sortOrder)
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    const activities = await queryBuilder.getMany();

    return {
      activities,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  /**
   * Admin: create a new training activity
   */
  async createActivity(dto: CreateTrainingActivityDto): Promise<TrainingActivityResponseDto> {
    this.logger.log(`Creating training activity: ${dto.title}`);

    const activity = this.activityRepo.create({
      ...dto,
      tags: dto.tags ?? [],
      risks: dto.risks ?? [],
      enrichment: dto.enrichment ?? [],
    });

    const saved = await this.activityRepo.save(activity);
    return TrainingActivityResponseDto.fromEntity(saved);
  }

  /**
   * Admin: update an existing training activity
   */
  async updateActivity(id: string, dto: UpdateTrainingActivityDto): Promise<TrainingActivityResponseDto> {
    this.logger.log(`Updating training activity: ${id}`);

    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException('Training activity not found');
    }

    Object.assign(activity, dto);
    const updated = await this.activityRepo.save(activity);
    return TrainingActivityResponseDto.fromEntity(updated);
  }

  /**
   * Admin: delete a training activity
   */
  async deleteActivity(id: string): Promise<void> {
    this.logger.log(`Deleting training activity: ${id}`);

    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException('Training activity not found');
    }

    await this.activityRepo.remove(activity);
  }

  // Daily Training Assignment Methods

  /**
   * Get today's training assignments for a user
   */
  async getTodayAssignments(userId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const assignments = await this.assignmentRepo.find({
      where: {
        user_id: userId,
        assignment_date: today,
      },
      relations: ['activity', 'pet'],
      order: { created_at: 'ASC' },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      pet_id: assignment.pet_id,
      activity_id: assignment.activity_id,
      assignment_date: assignment.assignment_date,
      is_completed: assignment.is_completed,
      completed_at: assignment.completed_at,
      notes: assignment.notes,
      feedback: assignment.feedback,
      difficulty_progression: assignment.difficulty_progression,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      pet: assignment.pet ? {
        id: assignment.pet.id,
        name: assignment.pet.name,
        species: assignment.pet.species,
        breed: assignment.pet.breed,
      } : undefined,
      activity: {
        id: assignment.activity.id,
        title: assignment.activity.title,
        summary: assignment.activity.summary,
        difficulty: assignment.activity.difficulty,
        avg_duration_minutes: assignment.activity.avg_duration_minutes,
        content_markdown: assignment.activity.content_markdown,
        tags: assignment.activity.tags,
      },
    }));
  }

  /**
   * Create a manual training assignment
   */
  async createAssignment(userId: string, dto: CreateTrainingAssignmentDto): Promise<any> {
    // Check if activity exists
    const activity = await this.activityRepo.findOne({ where: { id: dto.activity_id } });
    if (!activity) {
      throw new NotFoundException('Training activity not found');
    }

    // Check for existing assignment to prevent duplicates
    const whereClause: { user_id: string; pet_id?: string | null; activity_id: string; assignment_date: Date } = {
      user_id: userId,
      activity_id: dto.activity_id,
      assignment_date: dto.assignment_date ? new Date(dto.assignment_date) : new Date(),
    };
    if (dto.pet_id !== undefined && dto.pet_id !== null) {
      whereClause.pet_id = dto.pet_id;
    } else if (dto.pet_id === null) {
      whereClause.pet_id = null;
    }
    const existing = await this.assignmentRepo.findOne({
      where: whereClause as any,
    });

    if (existing) {
      throw new BadRequestException('Assignment already exists for this activity and date');
    }

    const assignmentData: { user_id: string; pet_id: string | null; activity_id: string; assignment_date: Date; notes?: string | null } = {
      user_id: userId,
      pet_id: dto.pet_id || null,
      activity_id: dto.activity_id,
      assignment_date: dto.assignment_date ? new Date(dto.assignment_date) : new Date(),
    };
    if (dto.notes !== undefined) {
      assignmentData.notes = dto.notes || null;
    }
    const assignment = this.assignmentRepo.create(assignmentData);

    const saved = await this.assignmentRepo.save(assignment);
    return this.getAssignmentWithRelations(saved.id);
  }

  /**
   * Complete a training assignment
   */
  async completeAssignment(assignmentId: string, userId: string, dto: CompleteTrainingDto): Promise<any> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId, user_id: userId },
    });

    if (!assignment) {
      throw new NotFoundException('Training assignment not found');
    }

    if (assignment.is_completed) {
      throw new BadRequestException('Assignment is already completed');
    }

    assignment.is_completed = true;
    assignment.completed_at = new Date();
    if (dto.notes !== undefined) {
      assignment.notes = dto.notes;
    }
    if (dto.feedback !== undefined) {
      assignment.feedback = dto.feedback;
    }

    const updated = await this.assignmentRepo.save(assignment);
    return this.getAssignmentWithRelations(updated.id);
  }

  /**
   * Get training history for a user
   */
  async getTrainingHistory(userId: string, limit = 50): Promise<any[]> {
    const assignments = await this.assignmentRepo.find({
      where: { user_id: userId },
      relations: ['activity', 'pet'],
      order: { assignment_date: 'DESC', created_at: 'DESC' },
      take: limit,
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      pet_id: assignment.pet_id,
      activity_id: assignment.activity_id,
      assignment_date: assignment.assignment_date,
      is_completed: assignment.is_completed,
      completed_at: assignment.completed_at,
      notes: assignment.notes,
      feedback: assignment.feedback,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      pet: assignment.pet ? {
        id: assignment.pet.id,
        name: assignment.pet.name,
        species: assignment.pet.species,
        breed: assignment.pet.breed,
      } : undefined,
      activity: {
        id: assignment.activity.id,
        title: assignment.activity.title,
        summary: assignment.activity.summary,
        difficulty: assignment.activity.difficulty,
      },
    }));
  }

  /**
   * Get training statistics for a user
   */
  async getTrainingStats(userId: string): Promise<DailyTrainingStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Today's stats
    const todayAssignments = await this.assignmentRepo.find({
      where: { user_id: userId, assignment_date: today },
    });

    const completedToday = todayAssignments.filter(a => a.is_completed).length;
    const totalToday = todayAssignments.length;
    const pendingToday = totalToday - completedToday;
    const completionRateToday = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

    // This week's stats
    const weekAssignments = await this.assignmentRepo.find({
      where: {
        user_id: userId,
        assignment_date: Between(weekAgo, tomorrow),
      },
    });

    const completedThisWeek = weekAssignments.filter(a => a.is_completed).length;
    const totalThisWeek = weekAssignments.length;
    const avgCompletionRateWeek = totalThisWeek > 0 ? (completedThisWeek / totalThisWeek) * 100 : 0;

    return {
      total_today: totalToday,
      completed_today: completedToday,
      pending_today: pendingToday,
      completion_rate_today: Math.round(completionRateToday * 100) / 100,
      total_this_week: totalThisWeek,
      completed_this_week: completedThisWeek,
      avg_completion_rate_week: Math.round(avgCompletionRateWeek * 100) / 100,
    };
  }

  /**
   * Automatically assign daily training (called by scheduler)
   */
  async assignDailyTraining(userId: string): Promise<void> {
    try {
      // For now, assign 1-2 activities per day
      // In a real implementation, this would consider pet breeds, ages, training history, etc.
      const activities = await this.activityRepo.find({ take: 5 });

      if (activities.length === 0) {
        this.logger.warn(`No training activities available for user ${userId}`);
        return;
      }

      // Randomly select 1-2 activities
      const numToAssign = Math.min(2, activities.length);
      const selectedActivities = activities
        .sort(() => 0.5 - Math.random())
        .slice(0, numToAssign);

      for (const activity of selectedActivities) {
        // Check if assignment already exists
        const existing = await this.assignmentRepo.findOne({
          where: {
            user_id: userId,
            activity_id: activity.id,
            assignment_date: new Date(),
          },
        });

        if (!existing) {
          await this.assignmentRepo.save({
            user_id: userId,
            activity_id: activity.id,
            assignment_date: new Date(),
          });
        }
      }

      this.logger.log(`Assigned ${numToAssign} daily training activities to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to assign daily training for user ${userId}:`, error);
    }
  }

  /**
   * Helper method to get assignment with relations
   */
  private async getAssignmentWithRelations(assignmentId: string): Promise<any> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['activity', 'pet'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return {
      id: assignment.id,
      pet_id: assignment.pet_id,
      activity_id: assignment.activity_id,
      assignment_date: assignment.assignment_date,
      is_completed: assignment.is_completed,
      completed_at: assignment.completed_at,
      notes: assignment.notes,
      feedback: assignment.feedback,
      difficulty_progression: assignment.difficulty_progression,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      pet: assignment.pet ? {
        id: assignment.pet.id,
        name: assignment.pet.name,
        species: assignment.pet.species,
        breed: assignment.pet.breed,
      } : undefined,
      activity: {
        id: assignment.activity.id,
        title: assignment.activity.title,
        summary: assignment.activity.summary,
        difficulty: assignment.activity.difficulty,
        avg_duration_minutes: assignment.activity.avg_duration_minutes,
        content_markdown: assignment.activity.content_markdown,
        tags: assignment.activity.tags,
      },
    };
  }
}


