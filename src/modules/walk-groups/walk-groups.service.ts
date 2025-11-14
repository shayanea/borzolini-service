import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../../common/common.service';
import { Pet } from '../pets/entities/pet.entity';
import { CreateWalkGroupDto } from './dto/create-walk-group.dto';
import { JoinWalkGroupByCodeDto, JoinWalkGroupDto } from './dto/join-walk-group.dto';
import { ParticipantResponseDto, WalkGroupResponseDto } from './dto/walk-group-response.dto';
import { UpdateWalkGroupDto } from './dto/update-walk-group.dto';
import { CompatibilityRules, WalkGroup, WalkGroupStatus, WalkGroupVisibility } from './entities/walk-group.entity';
import { ParticipantStatus, WalkGroupParticipant } from './entities/walk-group-participant.entity';

@Injectable()
export class WalkGroupsService {
  constructor(
    @InjectRepository(WalkGroup)
    private readonly walkGroupRepository: Repository<WalkGroup>,
    @InjectRepository(WalkGroupParticipant)
    private readonly participantRepository: Repository<WalkGroupParticipant>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new walk group
   */
  async create(userId: string, createWalkGroupDto: CreateWalkGroupDto): Promise<WalkGroupResponseDto> {
    // Validate scheduled date is in future
    const scheduledDate = new Date(createWalkGroupDto.scheduled_date);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    // Validate compatibility rules
    if (!createWalkGroupDto.compatibility_rules.allowed_species || createWalkGroupDto.compatibility_rules.allowed_species.length === 0) {
      throw new BadRequestException('At least one species must be allowed');
    }

    // Validate pet exists and belongs to user
    const pet = await this.petRepository.findOne({
      where: { id: createWalkGroupDto.pet_id, owner_id: userId, is_active: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found or does not belong to you');
    }

    // Check pet compatibility (organizer's pet must be compatible)
    const compatibilityRules: CompatibilityRules = {
      allowed_species: createWalkGroupDto.compatibility_rules.allowed_species,
      allowed_sizes: createWalkGroupDto.compatibility_rules.allowed_sizes || [],
      restricted_temperaments: createWalkGroupDto.compatibility_rules.restricted_temperaments || [],
      require_vaccinated: createWalkGroupDto.compatibility_rules.require_vaccinated ?? true,
      require_spayed_neutered: createWalkGroupDto.compatibility_rules.require_spayed_neutered ?? false,
    };
    const compatibilityErrors = this.checkPetCompatibility(pet, compatibilityRules);
    if (compatibilityErrors.length > 0) {
      throw new BadRequestException(`Your pet does not meet the compatibility requirements: ${compatibilityErrors.join(', ')}`);
    }

    // Generate unique invite code
    const inviteCode = await this.generateInviteCode();
    const inviteUrl = this.generateInviteUrl(inviteCode);

    // Create walk group
    const walkGroup = this.walkGroupRepository.create({
      ...createWalkGroupDto,
      scheduled_date: scheduledDate,
      organizer_id: userId,
      invite_code: inviteCode,
      invite_url: inviteUrl,
      compatibility_rules: {
        allowed_species: createWalkGroupDto.compatibility_rules.allowed_species || [],
        allowed_sizes: createWalkGroupDto.compatibility_rules.allowed_sizes || [],
        restricted_temperaments: createWalkGroupDto.compatibility_rules.restricted_temperaments || [],
        require_vaccinated: createWalkGroupDto.compatibility_rules.require_vaccinated ?? true,
        require_spayed_neutered: createWalkGroupDto.compatibility_rules.require_spayed_neutered ?? false,
      },
      visibility: createWalkGroupDto.visibility || WalkGroupVisibility.PUBLIC,
      max_participants: createWalkGroupDto.max_participants || 10,
      duration_minutes: createWalkGroupDto.duration_minutes || 60,
      country: createWalkGroupDto.country || 'USA',
    });

    const savedWalkGroup = await this.walkGroupRepository.save(walkGroup);

    // Add organizer's pet as first participant
    await this.participantRepository.save({
      walk_group_id: savedWalkGroup.id,
      user_id: userId,
      pet_id: createWalkGroupDto.pet_id,
      status: ParticipantStatus.JOINED,
    });

    // Load the walk group with relations for response
    const walkGroupWithRelations = await this.walkGroupRepository
      .createQueryBuilder('walkGroup')
      .leftJoinAndSelect('walkGroup.organizer', 'organizer')
      .leftJoinAndSelect('walkGroup.participants', 'participants')
      .leftJoinAndSelect('participants.pet', 'pet')
      .leftJoinAndSelect('participants.user', 'user')
      .where('walkGroup.id = :id', { id: savedWalkGroup.id })
      .getOne();

    if (!walkGroupWithRelations) {
      throw new NotFoundException('Walk group not found after creation');
    }

    return this.mapToResponseDto(walkGroupWithRelations, userId);
  }

  /**
   * Get all walk groups with optional filters
   */
  async findAll(
    userId: string,
    filters?: {
      city?: string;
      state?: string;
      country?: string;
      status?: WalkGroupStatus;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<WalkGroupResponseDto[]> {
    const queryBuilder = this.walkGroupRepository
      .createQueryBuilder('walkGroup')
      .leftJoinAndSelect('walkGroup.organizer', 'organizer')
      .leftJoinAndSelect('walkGroup.participants', 'participants')
      .leftJoinAndSelect('participants.pet', 'pet')
      .leftJoinAndSelect('participants.user', 'user')
      .where('walkGroup.is_active = :isActive', { isActive: true });

    if (filters?.city) {
      queryBuilder.andWhere('walkGroup.city = :city', { city: filters.city });
    }

    if (filters?.state) {
      queryBuilder.andWhere('walkGroup.state = :state', { state: filters.state });
    }

    if (filters?.country) {
      queryBuilder.andWhere('walkGroup.country = :country', { country: filters.country });
    }

    if (filters?.status) {
      queryBuilder.andWhere('walkGroup.status = :status', { status: filters.status });
    }

    if (filters?.dateFrom) {
      queryBuilder.andWhere('walkGroup.scheduled_date >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      queryBuilder.andWhere('walkGroup.scheduled_date <= :dateTo', { dateTo: filters.dateTo });
    }

    queryBuilder.orderBy('walkGroup.scheduled_date', 'ASC');

    const walkGroups = await queryBuilder.getMany();
    return walkGroups.map((wg) => this.mapToResponseDto(wg, userId));
  }

  /**
   * Get a single walk group by ID
   */
  async findOne(id: string, userId: string): Promise<WalkGroupResponseDto> {
    const walkGroup = await this.walkGroupRepository
      .createQueryBuilder('walkGroup')
      .leftJoinAndSelect('walkGroup.organizer', 'organizer')
      .leftJoinAndSelect('walkGroup.participants', 'participants')
      .leftJoinAndSelect('participants.pet', 'pet')
      .leftJoinAndSelect('participants.user', 'user')
      .where('walkGroup.id = :id', { id })
      .andWhere('walkGroup.is_active = :isActive', { isActive: true })
      .getOne();

    if (!walkGroup) {
      throw new NotFoundException(`Walk group with ID ${id} not found`);
    }

    return this.mapToResponseDto(walkGroup, userId);
  }

  /**
   * Update a walk group (organizer only)
   */
  async update(id: string, userId: string, updateWalkGroupDto: UpdateWalkGroupDto): Promise<WalkGroupResponseDto> {
    const walkGroup = await this.walkGroupRepository.findOne({
      where: { id, is_active: true },
    });

    if (!walkGroup) {
      throw new NotFoundException(`Walk group with ID ${id} not found`);
    }

    if (walkGroup.organizer_id !== userId) {
      throw new ForbiddenException('Only the organizer can update this walk group');
    }

    if (walkGroup.status === WalkGroupStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed walk group');
    }

    // Validate scheduled date if being updated
    if (updateWalkGroupDto.scheduled_date) {
      const scheduledDate = new Date(updateWalkGroupDto.scheduled_date);
      if (scheduledDate <= new Date()) {
        throw new BadRequestException('Scheduled date must be in the future');
      }
    }

    // Update compatibility rules if provided
    if (updateWalkGroupDto.compatibility_rules) {
      if (!updateWalkGroupDto.compatibility_rules.allowed_species || updateWalkGroupDto.compatibility_rules.allowed_species.length === 0) {
        throw new BadRequestException('At least one species must be allowed');
      }

      // Check all current participants still meet compatibility
      const participants = await this.participantRepository.find({
        where: { walk_group_id: id, status: ParticipantStatus.JOINED },
        relations: ['pet'],
      });

      const compatibilityRules: CompatibilityRules = {
        allowed_species: updateWalkGroupDto.compatibility_rules.allowed_species,
        allowed_sizes: updateWalkGroupDto.compatibility_rules.allowed_sizes || [],
        restricted_temperaments: updateWalkGroupDto.compatibility_rules.restricted_temperaments || [],
        require_vaccinated: updateWalkGroupDto.compatibility_rules.require_vaccinated ?? true,
        require_spayed_neutered: updateWalkGroupDto.compatibility_rules.require_spayed_neutered ?? false,
      };
      for (const participant of participants) {
        const errors = this.checkPetCompatibility(participant.pet, compatibilityRules);
        if (errors.length > 0) {
          throw new BadRequestException(
            `Cannot update compatibility rules: Pet ${participant.pet.name} no longer meets requirements (${errors.join(', ')})`,
          );
        }
      }
    }

    Object.assign(walkGroup, updateWalkGroupDto);
    if (updateWalkGroupDto.scheduled_date) {
      walkGroup.scheduled_date = new Date(updateWalkGroupDto.scheduled_date);
    }

    await this.walkGroupRepository.save(walkGroup);

    // Reload with relations
    const updatedWalkGroup = await this.walkGroupRepository
      .createQueryBuilder('walkGroup')
      .leftJoinAndSelect('walkGroup.organizer', 'organizer')
      .leftJoinAndSelect('walkGroup.participants', 'participants')
      .leftJoinAndSelect('participants.pet', 'pet')
      .leftJoinAndSelect('participants.user', 'user')
      .where('walkGroup.id = :id', { id })
      .getOne();

    if (!updatedWalkGroup) {
      throw new NotFoundException(`Walk group with ID ${id} not found after update`);
    }

    return this.mapToResponseDto(updatedWalkGroup, userId);
  }

  /**
   * Cancel/delete a walk group (organizer only)
   */
  async remove(id: string, userId: string): Promise<void> {
    const walkGroup = await this.walkGroupRepository.findOne({
      where: { id, is_active: true },
    });

    if (!walkGroup) {
      throw new NotFoundException(`Walk group with ID ${id} not found`);
    }

    if (walkGroup.organizer_id !== userId) {
      throw new ForbiddenException('Only the organizer can cancel this walk group');
    }

    walkGroup.status = WalkGroupStatus.CANCELLED;
    walkGroup.is_active = false;
    await this.walkGroupRepository.save(walkGroup);
  }

  /**
   * Join a walk group with a pet
   */
  async join(id: string, userId: string, joinDto: JoinWalkGroupDto): Promise<WalkGroupResponseDto> {
    const walkGroup = await this.walkGroupRepository.findOne({
      where: { id, is_active: true },
      relations: ['participants', 'participants.pet'],
    });

    if (!walkGroup) {
      throw new NotFoundException(`Walk group with ID ${id} not found`);
    }

    if (walkGroup.status !== WalkGroupStatus.SCHEDULED) {
      throw new BadRequestException('Cannot join a walk group that is not scheduled');
    }

    // Check if event has started
    if (new Date() >= new Date(walkGroup.scheduled_date)) {
      throw new BadRequestException('Cannot join a walk group that has already started');
    }

    // Check if full
    const currentParticipants = walkGroup.participants.filter((p) => p.status === ParticipantStatus.JOINED);
    if (currentParticipants.length >= walkGroup.max_participants) {
      throw new BadRequestException('Walk group is full');
    }

    // Validate pet exists and belongs to user
    const pet = await this.petRepository.findOne({
      where: { id: joinDto.pet_id, owner_id: userId, is_active: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found or does not belong to you');
    }

    // Check if pet is already a participant
    const existingParticipant = walkGroup.participants.find((p) => p.pet_id === joinDto.pet_id && p.status === ParticipantStatus.JOINED);
    if (existingParticipant) {
      throw new ConflictException('Pet is already a participant in this walk group');
    }

    // Check pet compatibility
    const compatibilityErrors = this.checkPetCompatibility(pet, walkGroup.compatibility_rules);
    if (compatibilityErrors.length > 0) {
      throw new BadRequestException(`Pet does not meet compatibility requirements: ${compatibilityErrors.join(', ')}`);
    }

    // Add participant
    await this.participantRepository.save({
      walk_group_id: id,
      user_id: userId,
      pet_id: joinDto.pet_id,
      status: ParticipantStatus.JOINED,
    });

    return this.findOne(id, userId);
  }

  /**
   * Join a walk group using invite code
   */
  async joinByCode(userId: string, joinByCodeDto: JoinWalkGroupByCodeDto): Promise<WalkGroupResponseDto> {
    // Find walk group by invite code (case-insensitive)
    const walkGroup = await this.walkGroupRepository
      .createQueryBuilder('walkGroup')
      .where('LOWER(walkGroup.invite_code) = LOWER(:inviteCode)', { inviteCode: joinByCodeDto.invite_code })
      .andWhere('walkGroup.is_active = :isActive', { isActive: true })
      .leftJoinAndSelect('walkGroup.participants', 'participants')
      .leftJoinAndSelect('participants.pet', 'pet')
      .getOne();

    if (!walkGroup) {
      throw new NotFoundException('Walk group not found with the provided invite code');
    }

    return this.join(walkGroup.id, userId, { pet_id: joinByCodeDto.pet_id });
  }

  /**
   * Leave a walk group
   */
  async leave(id: string, userId: string, petId: string): Promise<void> {
    const walkGroup = await this.walkGroupRepository.findOne({
      where: { id, is_active: true },
    });

    if (!walkGroup) {
      throw new NotFoundException(`Walk group with ID ${id} not found`);
    }

    // Cannot leave if organizer (organizer should cancel the group instead)
    if (walkGroup.organizer_id === userId) {
      throw new BadRequestException('Organizer cannot leave the walk group. Please cancel it instead.');
    }

    const participant = await this.participantRepository.findOne({
      where: {
        walk_group_id: id,
        user_id: userId,
        pet_id: petId,
        status: ParticipantStatus.JOINED,
      },
    });

    if (!participant) {
      throw new NotFoundException('You are not a participant in this walk group');
    }

    participant.status = ParticipantStatus.CANCELLED;
    await this.participantRepository.save(participant);
  }

  /**
   * Get participants of a walk group
   */
  async getParticipants(id: string, userId: string): Promise<ParticipantResponseDto[]> {
    const walkGroup = await this.walkGroupRepository.findOne({
      where: { id, is_active: true },
    });

    if (!walkGroup) {
      throw new NotFoundException(`Walk group with ID ${id} not found`);
    }

    // Only organizer and participants can view participants list
    const isParticipant = await this.participantRepository.findOne({
      where: { walk_group_id: id, user_id: userId },
    });

    if (walkGroup.organizer_id !== userId && !isParticipant) {
      throw new ForbiddenException('Only organizer and participants can view the participants list');
    }

    const participants = await this.participantRepository.find({
      where: { walk_group_id: id },
      relations: ['pet', 'user'],
      order: { joined_at: 'ASC' },
    });

    return participants.map((p) => {
      const participant: ParticipantResponseDto = {
        id: p.id,
        user_id: p.user_id,
        pet_id: p.pet_id,
        pet_name: p.pet.name,
        owner_name: `${p.user.firstName} ${p.user.lastName}`,
        status: p.status,
        joined_at: p.joined_at,
      };
      if (p.notes !== undefined && p.notes !== null) {
        participant.notes = p.notes;
      }
      return participant;
    });
  }

  /**
   * Remove a participant (organizer only)
   */
  async removeParticipant(id: string, participantId: string, userId: string): Promise<void> {
    const walkGroup = await this.walkGroupRepository.findOne({
      where: { id, is_active: true },
    });

    if (!walkGroup) {
      throw new NotFoundException(`Walk group with ID ${id} not found`);
    }

    if (walkGroup.organizer_id !== userId) {
      throw new ForbiddenException('Only the organizer can remove participants');
    }

    const participant = await this.participantRepository.findOne({
      where: { id: participantId, walk_group_id: id },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    participant.status = ParticipantStatus.CANCELLED;
    await this.participantRepository.save(participant);
  }

  /**
   * Get user's walk groups (organized and joined)
   */
  async getMyGroups(userId: string): Promise<{ organized: WalkGroupResponseDto[]; joined: WalkGroupResponseDto[] }> {
    // Get organized groups
    const organizedGroups = await this.walkGroupRepository
      .createQueryBuilder('walkGroup')
      .leftJoinAndSelect('walkGroup.organizer', 'organizer')
      .leftJoinAndSelect('walkGroup.participants', 'participants')
      .leftJoinAndSelect('participants.pet', 'pet')
      .leftJoinAndSelect('participants.user', 'user')
      .where('walkGroup.organizer_id = :userId', { userId })
      .andWhere('walkGroup.is_active = :isActive', { isActive: true })
      .orderBy('walkGroup.scheduled_date', 'ASC')
      .getMany();

    // Get joined groups (where user is a participant but not organizer)
    const participantRecords = await this.participantRepository
      .createQueryBuilder('participant')
      .leftJoinAndSelect('participant.walk_group', 'walkGroup')
      .leftJoinAndSelect('walkGroup.organizer', 'organizer')
      .leftJoinAndSelect('walkGroup.participants', 'participants')
      .leftJoinAndSelect('participants.pet', 'pet')
      .leftJoinAndSelect('participants.user', 'user')
      .where('participant.user_id = :userId', { userId })
      .andWhere('participant.status = :status', { status: ParticipantStatus.JOINED })
      .andWhere('walkGroup.is_active = :isActive', { isActive: true })
      .getMany();

    const joinedGroups = participantRecords
      .filter((p) => p.walk_group.organizer_id !== userId)
      .map((p) => p.walk_group);

    return {
      organized: organizedGroups.map((wg) => this.mapToResponseDto(wg, userId)),
      joined: joinedGroups.map((wg) => this.mapToResponseDto(wg, userId)),
    };
  }

  /**
   * Check pet compatibility with walk group rules
   */
  checkPetCompatibility(pet: Pet, rules: WalkGroup['compatibility_rules']): string[] {
    const errors: string[] = [];

    // Check species
    if (rules.allowed_species && rules.allowed_species.length > 0) {
      if (!rules.allowed_species.includes(pet.species)) {
        errors.push(`Species ${pet.species} is not allowed (allowed: ${rules.allowed_species.join(', ')})`);
      }
    }

    // Check size
    if (rules.allowed_sizes && rules.allowed_sizes.length > 0 && pet.size) {
      if (!rules.allowed_sizes.includes(pet.size)) {
        errors.push(`Size ${pet.size} is not allowed (allowed: ${rules.allowed_sizes.join(', ')})`);
      }
    }

    // Check restricted temperaments
    if (rules.restricted_temperaments && rules.restricted_temperaments.length > 0 && pet.behavioral_notes) {
      const behavioralNotes = pet.behavioral_notes.toLowerCase();
      for (const restricted of rules.restricted_temperaments) {
        if (behavioralNotes.includes(restricted.toLowerCase())) {
          errors.push(`Pet has restricted temperament: ${restricted}`);
        }
      }
    }

    // Check vaccination requirement
    if (rules.require_vaccinated && !pet.is_vaccinated) {
      errors.push('Pet must be vaccinated');
    }

    // Check spay/neuter requirement
    if (rules.require_spayed_neutered && !pet.is_spayed_neutered) {
      errors.push('Pet must be spayed/neutered');
    }

    return errors;
  }

  /**
   * Generate unique invite code
   */
  private async generateInviteCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.commonService.generateRandomString(8).toUpperCase();
      const existing = await this.walkGroupRepository.findOne({
        where: { invite_code: code },
      });

      if (!existing) {
        return code;
      }

      attempts++;
    } while (attempts < maxAttempts);

    throw new Error('Failed to generate unique invite code after multiple attempts');
  }

  /**
   * Generate invite URL
   */
  private generateInviteUrl(inviteCode: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    return `${frontendUrl}/walk-groups/join/${inviteCode}`;
  }

  /**
   * Map walk group entity to response DTO
   */
  private mapToResponseDto(walkGroup: WalkGroup, _userId: string): WalkGroupResponseDto {
    const currentParticipants = walkGroup.participants?.filter((p) => p.status === ParticipantStatus.JOINED) || [];

    const participants: ParticipantResponseDto[] = currentParticipants.map((p) => {
      const participant: ParticipantResponseDto = {
        id: p.id,
        user_id: p.user_id,
        pet_id: p.pet_id,
        pet_name: p.pet?.name || 'Unknown',
        owner_name: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Unknown',
        status: p.status,
        joined_at: p.joined_at,
      };
      if (p.notes !== undefined && p.notes !== null) {
        participant.notes = p.notes;
      }
      return participant;
    });

    const dto: WalkGroupResponseDto = {
      id: walkGroup.id,
      name: walkGroup.name,
      scheduled_date: walkGroup.scheduled_date,
      duration_minutes: walkGroup.duration_minutes,
      address: walkGroup.address,
      country: walkGroup.country,
      max_participants: walkGroup.max_participants,
      current_participants: currentParticipants.length,
      visibility: walkGroup.visibility,
      invite_code: walkGroup.invite_code,
      invite_url: walkGroup.invite_url,
      compatibility_rules: walkGroup.compatibility_rules,
      status: walkGroup.status,
      is_active: walkGroup.is_active,
      organizer_id: walkGroup.organizer_id,
      organizer_name: walkGroup.organizer ? `${walkGroup.organizer.firstName} ${walkGroup.organizer.lastName}` : 'Unknown',
      created_at: walkGroup.created_at,
      updated_at: walkGroup.updated_at,
      is_upcoming: walkGroup.isUpcoming,
      is_full: walkGroup.isFull,
    };
    if (walkGroup.description !== undefined && walkGroup.description !== null) {
      dto.description = walkGroup.description;
    }
    if (walkGroup.location_name !== undefined && walkGroup.location_name !== null) {
      dto.location_name = walkGroup.location_name;
    }
    if (walkGroup.latitude !== undefined && walkGroup.latitude !== null) {
      dto.latitude = Number(walkGroup.latitude);
    }
    if (walkGroup.longitude !== undefined && walkGroup.longitude !== null) {
      dto.longitude = Number(walkGroup.longitude);
    }
    if (walkGroup.city !== undefined && walkGroup.city !== null) {
      dto.city = walkGroup.city;
    }
    if (walkGroup.state !== undefined && walkGroup.state !== null) {
      dto.state = walkGroup.state;
    }
    if (walkGroup.postal_code !== undefined && walkGroup.postal_code !== null) {
      dto.postal_code = walkGroup.postal_code;
    }
    if (participants.length > 0) {
      dto.participants = participants;
    }
    return dto;
  }
}

