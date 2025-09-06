import { ConflictException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
import { ActivityLoggerUtils, ValidationUtils } from '../../common/utils';
import { ActivityStatus, ActivityType } from '../users/entities/user-activity.entity';
import { UsersService } from '../users/users.service';
import { CreateClinicServiceDto } from './dto/create-clinic-service.dto';
import { CreateClinicStaffDto } from './dto/create-clinic-staff.dto';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { ClinicPhoto, PhotoCategory } from './entities/clinic-photo.entity';
import { ClinicReview } from './entities/clinic-review.entity';
import { ClinicService } from './entities/clinic-service.entity';
import { ClinicStaff, StaffRole } from './entities/clinic-staff.entity';
import { Clinic } from './entities/clinic.entity';

export interface ClinicFilters {
  name?: string;
  city?: string;
  state?: string;
  is_verified?: boolean;
  is_active?: boolean;
  services?: string[];
  specializations?: string[];
  rating_min?: number;
  rating_max?: number;
}

export interface ClinicSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ClinicStaffFilters {
  role?: StaffRole;
  is_active?: boolean;
  specialization?: string;
  search?: string;
  experience_min?: number;
  experience_max?: number;
}

export interface StaffSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class ClinicsService implements OnModuleInit {
  private readonly logger = new Logger(ClinicsService.name);
  private isInitialized = false;

  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(ClinicStaff)
    private readonly clinicStaffRepository: Repository<ClinicStaff>,
    @InjectRepository(ClinicService)
    private readonly clinicServiceRepository: Repository<ClinicService>,
    @InjectRepository(ClinicReview)
    private readonly clinicReviewRepository: Repository<ClinicReview>,
    @InjectRepository(ClinicPhoto)
    private readonly clinicPhotoRepository: Repository<ClinicPhoto>,
    private configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly activityLogger: ActivityLoggerUtils
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Clinics service...');

    try {
      await this.validateDependencies();
      await this.validateConfiguration();

      this.isInitialized = true;
      this.logger.log('Clinics service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Clinics service:', error);
      throw error;
    }
  }

  private async validateDependencies(): Promise<void> {
    // Check if repositories are available
    if (!this.clinicRepository || !this.clinicStaffRepository || !this.clinicServiceRepository || !this.clinicReviewRepository || !this.clinicPhotoRepository) {
      throw new Error('Required repositories not available');
    }

    this.logger.log('Clinics service dependencies validated successfully');
  }

  private async validateConfiguration(): Promise<void> {
    // Check for any clinic-specific configuration
    const requiredVars: string[] = [];
    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      const value = this.configService.get(varName);
      if (!value) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    this.logger.log('Clinics service configuration validated successfully');
  }

  async create(createClinicDto: CreateClinicDto, userId?: string): Promise<Clinic> {
    if (!this.isInitialized) {
      throw new Error('Clinics service not initialized');
    }

    // Check if clinic with same name and city already exists
    const existingClinic = await this.clinicRepository.findOne({
      where: {
        name: createClinicDto.name,
        city: createClinicDto.city,
      },
    });

    if (existingClinic) {
      throw new ConflictException('A clinic with this name already exists in this city');
    }

    const clinic = this.clinicRepository.create(createClinicDto);
    const savedClinic = await this.clinicRepository.save(clinic);

    this.logger.log(`Created clinic: ${savedClinic.name} in ${savedClinic.city}`);

    // Log user activity if userId is provided
    if (userId) {
      await this.usersService.logUserActivity(userId, ActivityType.CLINIC_CREATED, ActivityStatus.SUCCESS, {
        clinicId: savedClinic.id,
        clinicName: savedClinic.name,
        clinicCity: savedClinic.city,
        clinicData: createClinicDto,
      });
    }

    return savedClinic;
  }

  async findAll(filters: ClinicFilters = {}, options: ClinicSearchOptions = {}): Promise<{ clinics: Clinic[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const skip = (page - 1) * limit;

    try {
      this.logger.log(`Finding clinics with filters: ${JSON.stringify(filters)}, options: ${JSON.stringify(options)}`);

      // Test basic repository functionality
      const totalCount = await this.clinicRepository.count();
      this.logger.log(`Total clinics in database: ${totalCount}`);

      // Try a simple query first without joins to debug
      const queryBuilder = this.clinicRepository.createQueryBuilder('clinic');

      // Apply sorting
      queryBuilder.orderBy(`clinic.${sortBy}`, sortOrder);

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      const [clinics, total] = await queryBuilder.getManyAndCount();

      this.logger.log(`Found ${total} clinics, returning ${clinics.length} clinics`);

      const totalPages = Math.ceil(total / limit);

      return { clinics, total, page, totalPages };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error in findAll method: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.clinicRepository.findOne({
      where: { id },
      relations: ['staff', 'staff.user', 'clinic_services', 'reviews', 'reviews.user', 'photos', 'operating_hours_detail', 'appointments'],
    });

    if (!clinic) {
      throw new NotFoundException(`Clinic with ID ${id} not found`);
    }

    return clinic;
  }

  async findByName(name: string): Promise<Clinic[]> {
    return await this.clinicRepository.find({
      where: { name: Like(`%${name}%`) },
      relations: ['staff', 'clinic_services', 'photos'],
    });
  }

  async findByCity(city: string): Promise<Clinic[]> {
    return await this.clinicRepository.find({
      where: { city: Like(`%${city}%`) },
      relations: ['staff', 'clinic_services', 'photos'],
    });
  }

  async update(id: string, updateClinicDto: UpdateClinicDto, userId?: string): Promise<Clinic> {
    const clinic = await this.findOne(id);

    // Check if updating name/city combination would create a conflict
    if (updateClinicDto.name || updateClinicDto.city) {
      const newName = updateClinicDto.name || clinic.name;
      const newCity = updateClinicDto.city || clinic.city;

      if (newName !== clinic.name || newCity !== clinic.city) {
        const existingClinic = await this.clinicRepository.findOne({
          where: {
            name: newName,
            city: newCity,
            id: Not(id),
          },
        });

        if (existingClinic) {
          throw new ConflictException('A clinic with this name already exists in this city');
        }
      }
    }

    const originalData = { ...clinic };
    Object.assign(clinic, updateClinicDto);
    const updatedClinic = await this.clinicRepository.save(clinic);

    // Log user activity if userId is provided
    if (userId) {
      await this.usersService.logUserActivity(userId, ActivityType.CLINIC_UPDATED, ActivityStatus.SUCCESS, {
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicCity: clinic.city,
        originalData,
        updatedData: updateClinicDto,
        changes: Object.keys(updateClinicDto),
      });
    }

    return updatedClinic;
  }

  async remove(id: string, userId?: string): Promise<void> {
    const clinic = await this.findOne(id);

    // Log user activity if userId is provided
    if (userId) {
      await this.usersService.logUserActivity(userId, ActivityType.CLINIC_DELETED, ActivityStatus.SUCCESS, {
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicCity: clinic.city,
        clinicData: {
          name: clinic.name,
          city: clinic.city,
          address: clinic.address,
          phone: clinic.phone,
          email: clinic.email,
        },
      });
    }

    await this.clinicRepository.remove(clinic);
  }

  async addStaff(createClinicStaffDto: CreateClinicStaffDto, userId?: string): Promise<ClinicStaff> {
    // Check if user is already staff at this clinic
    const existingStaff = await this.clinicStaffRepository.findOne({
      where: {
        clinic_id: createClinicStaffDto.clinic_id,
        user_id: createClinicStaffDto.user_id,
      },
    });

    if (existingStaff) {
      throw new ConflictException('User is already staff at this clinic');
    }

    // Check if clinic exists
    const clinic = await this.clinicRepository.findOne({
      where: { id: createClinicStaffDto.clinic_id },
    });

    if (!clinic) {
      throw new NotFoundException(`Clinic with ID ${createClinicStaffDto.clinic_id} not found`);
    }

    const staff = this.clinicStaffRepository.create(createClinicStaffDto);
    const savedStaff = await this.clinicStaffRepository.save(staff);

    // Log user activity if userId is provided
    if (userId) {
      await this.usersService.logUserActivity(userId, ActivityType.STAFF_ADDED, ActivityStatus.SUCCESS, {
        clinicId: createClinicStaffDto.clinic_id,
        clinicName: clinic.name,
        staffUserId: createClinicStaffDto.user_id,
        staffRole: createClinicStaffDto.role,
        staffSpecialization: createClinicStaffDto.specialization,
        staffData: createClinicStaffDto,
      });
    }

    return savedStaff;
  }

  async removeStaff(clinicId: string, userId: string, adminUserId?: string): Promise<void> {
    const staff = await this.clinicStaffRepository.findOne({
      where: {
        clinic_id: clinicId,
        user_id: userId,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Get clinic info for logging
    const clinic = await this.clinicRepository.findOne({
      where: { id: clinicId },
    });

    // Log user activity if adminUserId is provided
    if (adminUserId) {
      await this.usersService.logUserActivity(adminUserId, ActivityType.STAFF_REMOVED, ActivityStatus.SUCCESS, {
        clinicId,
        clinicName: clinic?.name || 'Unknown',
        removedStaffUserId: userId,
        removedStaffRole: staff.role,
        removedStaffSpecialization: staff.specialization,
        staffData: {
          role: staff.role,
          specialization: staff.specialization,
          licenseNumber: staff.license_number,
          experienceYears: staff.experience_years,
          hireDate: staff.hire_date,
          terminationDate: staff.termination_date,
        },
      });
    }

    await this.clinicStaffRepository.remove(staff);
  }

  async listStaff(clinicId: string, filters: ClinicStaffFilters = {}, options: StaffSearchOptions = {}): Promise<{ staff: ClinicStaff[]; total: number; page: number; totalPages: number }> {
    // Coerce pagination/sorting defensively to avoid NaN reaching the DB
    const pageNum = Number.isFinite(Number(options.page)) && Number(options.page) > 0 ? Number(options.page) : 1;
    const limitNum = Number.isFinite(Number(options.limit)) && Number(options.limit) > 0 ? Number(options.limit) : 10;
    const sortByField = options.sortBy && typeof options.sortBy === 'string' ? options.sortBy : 'created_at';
    const sortOrderVal: 'ASC' | 'DESC' = options.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const skip = (pageNum - 1) * limitNum;

    const queryBuilder = this.clinicStaffRepository.createQueryBuilder('staff').leftJoinAndSelect('staff.user', 'user').where('staff.clinic_id = :clinicId', { clinicId });

    if (filters.role && Object.values(StaffRole).includes(filters.role)) {
      queryBuilder.andWhere('staff.role = :role', { role: filters.role });
    }
    if (typeof filters.is_active === 'boolean') {
      queryBuilder.andWhere('staff.is_active = :isActive', { isActive: filters.is_active });
    }
    if (filters.specialization) {
      queryBuilder.andWhere('staff.specialization ILIKE :spec', { spec: `%${filters.specialization}%` });
    }
    if (Number.isFinite(Number(filters.experience_min))) {
      queryBuilder.andWhere('staff.experience_years >= :expMin', { expMin: Number(filters.experience_min) });
    }
    if (Number.isFinite(Number(filters.experience_max))) {
      queryBuilder.andWhere('staff.experience_years <= :expMax', { expMax: Number(filters.experience_max) });
    }
    if (filters.search) {
      // Basic search on user name fields if available
      queryBuilder.andWhere('(user.firstName ILIKE :q OR user.lastName ILIKE :q OR staff.bio ILIKE :q)', { q: `%${filters.search}%` });
    }

    queryBuilder.orderBy(`staff.${sortByField}` as any, sortOrderVal);
    queryBuilder.skip(skip).take(limitNum);

    const [staff, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limitNum);

    return { staff, total, page: pageNum, totalPages };
  }

  /**
   * Check if a user is staff member of a specific clinic
   * @param userId - The user ID to check
   * @param clinicId - The clinic ID to check against
   * @returns Promise<boolean> - True if user is staff at the clinic
   */
  async isUserStaffAtClinic(userId: string, clinicId: string): Promise<boolean> {
    const staffMember = await this.clinicStaffRepository.findOne({
      where: {
        user_id: userId,
        clinic_id: clinicId,
        is_active: true, // Only check active staff members
      },
    });

    return !!staffMember;
  }

  /**
   * Get all clinic IDs where a user is a staff member
   * @param userId - The user ID to check
   * @returns Promise<string[]> - Array of clinic IDs where user is staff
   */
  async getUserClinicIds(userId: string): Promise<string[]> {
    const staffMemberships = await this.clinicStaffRepository.find({
      where: {
        user_id: userId,
        is_active: true, // Only active staff memberships
      },
      select: ['clinic_id'],
    });

    return staffMemberships.map((membership) => membership.clinic_id);
  }

  /**
   * Get clinics that have appointments, pets, and staff
   * @returns Promise<Array<{clinic: Clinic, stats: {appointments: number, pets: number, staff: number}}>>
   */
  async getClinicsWithAppointmentsPetsAndStaff(): Promise<
    Array<{
      clinic: Clinic;
      stats: {
        appointments: number;
        pets: number;
        staff: number;
      };
    }>
  > {
    const queryBuilder = this.clinicRepository
      .createQueryBuilder('clinic')
      .leftJoin('clinic.appointments', 'appointments')
      .leftJoin('clinic.pet_cases', 'pet_cases')
      .leftJoin('clinic.staff', 'staff')
      .leftJoin('pet_cases.pet', 'pet')
      .where('clinic.is_active = :isActive', { isActive: true })
      .groupBy('clinic.id')
      .having('COUNT(DISTINCT appointments.id) > 0')
      .andHaving('COUNT(DISTINCT pet.id) > 0')
      .andHaving('COUNT(DISTINCT staff.id) > 0')
      .select(['clinic.id', 'clinic.name', 'clinic.city', 'clinic.state', 'clinic.rating', 'clinic.is_verified', 'clinic.created_at', 'clinic.updated_at'])
      .addSelect('COUNT(DISTINCT appointments.id)', 'appointmentCount')
      .addSelect('COUNT(DISTINCT pet.id)', 'petCount')
      .addSelect('COUNT(DISTINCT staff.id)', 'staffCount');

    const results = await queryBuilder.getRawMany();

    return results.map((result) => ({
      clinic: {
        id: result.clinic_id,
        name: result.clinic_name,
        city: result.clinic_city,
        state: result.clinic_state,
        rating: result.clinic_rating,
        is_verified: result.clinic_is_verified,
        created_at: result.clinic_created_at,
        updated_at: result.clinic_updated_at,
      } as Clinic,
      stats: {
        appointments: parseInt(result.appointmentCount) || 0,
        pets: parseInt(result.petCount) || 0,
        staff: parseInt(result.staffCount) || 0,
      },
    }));
  }

  async addService(createClinicServiceDto: CreateClinicServiceDto, userId?: string): Promise<ClinicService> {
    // Check if service with same name already exists at this clinic
    const existingService = await this.clinicServiceRepository.findOne({
      where: {
        clinic_id: createClinicServiceDto.clinic_id,
        name: createClinicServiceDto.name,
      },
    });

    if (existingService) {
      throw new ConflictException('A service with this name already exists at this clinic');
    }

    // Check if clinic exists
    const clinic = await this.clinicRepository.findOne({
      where: { id: createClinicServiceDto.clinic_id },
    });

    if (!clinic) {
      throw new NotFoundException(`Clinic with ID ${createClinicServiceDto.clinic_id} not found`);
    }

    const service = this.clinicServiceRepository.create(createClinicServiceDto);
    const savedService = await this.clinicServiceRepository.save(service);

    // Log user activity if userId is provided
    if (userId) {
      await this.usersService.logUserActivity(userId, ActivityType.SERVICE_ADDED, ActivityStatus.SUCCESS, {
        clinicId: createClinicServiceDto.clinic_id,
        clinicName: clinic.name,
        serviceId: savedService.id,
        serviceName: savedService.name,
        serviceCategory: savedService.category,
        serviceData: createClinicServiceDto,
      });
    }

    return savedService;
  }

  async updateService(id: string, updateServiceDto: Partial<CreateClinicServiceDto>, userId?: string): Promise<ClinicService> {
    const service = await this.clinicServiceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const originalData = { ...service };
    Object.assign(service, updateServiceDto);
    const updatedService = await this.clinicServiceRepository.save(service);

    // Log user activity if userId is provided
    if (userId) {
      await this.usersService.logUserActivity(userId, ActivityType.SERVICE_UPDATED, ActivityStatus.SUCCESS, {
        serviceId: service.id,
        serviceName: service.name,
        clinicId: service.clinic_id,
        originalData,
        updatedData: updateServiceDto,
        changes: Object.keys(updateServiceDto),
      });
    }

    return updatedService;
  }

  async removeService(id: string, userId?: string): Promise<void> {
    const service = await this.clinicServiceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Get clinic info for logging
    const clinic = await this.clinicRepository.findOne({
      where: { id: service.clinic_id },
    });

    // Log user activity if userId is provided
    if (userId) {
      await this.usersService.logUserActivity(userId, ActivityType.SERVICE_DELETED, ActivityStatus.SUCCESS, {
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category,
        clinicId: service.clinic_id,
        clinicName: clinic?.name || 'Unknown',
        serviceData: {
          name: service.name,
          description: service.description,
          category: service.category,
          durationMinutes: service.duration_minutes,
          price: service.price,
          currency: service.currency,
          requiresAppointment: service.requires_appointment,
        },
      });
    }

    await this.clinicServiceRepository.remove(service);
  }

  async addReview(clinicId: string, userId: string, rating: number, title?: string, comment?: string): Promise<ClinicReview> {
    // Check if user has already reviewed this clinic
    const existingReview = await this.clinicReviewRepository.findOne({
      where: {
        clinic_id: clinicId,
        user_id: userId,
      },
    });

    if (existingReview) {
      throw new ConflictException('User has already reviewed this clinic');
    }

    // Check if clinic exists
    const clinic = await this.clinicRepository.findOne({
      where: { id: clinicId },
    });

    if (!clinic) {
      throw new NotFoundException(`Clinic with ID ${clinicId} not found`);
    }

    const review = this.clinicReviewRepository.create({
      clinic_id: clinicId,
      user_id: userId,
      rating,
      ...(title && { title }),
      ...(comment && { comment }),
    });

    const savedReview = await this.clinicReviewRepository.save(review);

    // Update clinic rating and total reviews
    await this.updateClinicRating(clinicId);

    return savedReview;
  }

  async updateClinicRating(clinicId: string): Promise<void> {
    const reviews = await this.clinicReviewRepository.find({
      where: { clinic_id: clinicId },
    });

    if (reviews.length === 0) {
      await this.clinicRepository.update(clinicId, {
        rating: 0,
        total_reviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.clinicRepository.update(clinicId, {
      rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      total_reviews: reviews.length,
    });
  }

  async addPhoto(clinicId: string, photoUrl: string, caption?: string, category?: string, isPrimary: boolean = false): Promise<ClinicPhoto> {
    // Check if clinic exists
    const clinic = await this.clinicRepository.findOne({
      where: { id: clinicId },
    });

    if (!clinic) {
      throw new NotFoundException(`Clinic with ID ${clinicId} not found`);
    }

    // If this is a primary photo, unset other primary photos
    if (isPrimary) {
      await this.clinicPhotoRepository.update({ clinic_id: clinicId, is_primary: true }, { is_primary: false });
    }

    const photo = this.clinicPhotoRepository.create({
      clinic_id: clinicId,
      photo_url: photoUrl,
      ...(caption && { caption }),
      ...(category && { category: category as PhotoCategory }),
      is_primary: isPrimary,
    });

    return await this.clinicPhotoRepository.save(photo);
  }

  async removePhoto(id: string): Promise<void> {
    const photo = await this.clinicPhotoRepository.findOne({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }

    await this.clinicPhotoRepository.remove(photo);
  }

  async getClinicStats(clinicId: string): Promise<{
    totalStaff: number;
    totalServices: number;
    totalReviews: number;
    averageRating: number;
    totalAppointments: number;
  }> {
    const [totalStaff, totalServices, totalReviews, averageRating, totalAppointments] = await Promise.all([
      this.clinicStaffRepository.count({
        where: { clinic_id: clinicId, is_active: true },
      }),
      this.clinicServiceRepository.count({
        where: { clinic_id: clinicId, is_active: true },
      }),
      this.clinicReviewRepository.count({ where: { clinic_id: clinicId } }),
      this.clinicRepository.findOne({
        where: { id: clinicId },
        select: ['rating'],
      }),
      this.clinicRepository.createQueryBuilder('clinic').leftJoin('clinic.appointments', 'appointments').where('clinic.id = :clinicId', { clinicId }).getCount(),
    ]);

    return {
      totalStaff,
      totalServices,
      totalReviews,
      averageRating: averageRating?.rating || 0,
      totalAppointments,
    };
  }

  async searchClinics(query: string, options: ClinicSearchOptions = {}): Promise<{ clinics: Clinic[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'rating', sortOrder = 'DESC' } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.clinicRepository
      .createQueryBuilder('clinic')
      .leftJoinAndSelect('clinic.staff', 'staff')
      .leftJoinAndSelect('clinic.clinic_services', 'services')
      .leftJoinAndSelect('clinic.photos', 'photos')
      .where('clinic.is_active = :isActive', { isActive: true })
      .andWhere('(clinic.name ILIKE :query OR clinic.description ILIKE :query OR clinic.city ILIKE :query OR clinic.specializations::text ILIKE :query)', { query: `%${query}%` });

    queryBuilder.orderBy(`clinic.${sortBy}`, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const [clinics, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return { clinics, total, page, totalPages };
  }

  // Generic method for changing clinic status with logging
  private async changeClinicStatus(clinicId: string, userId: string, statusField: keyof Clinic, targetStatus: boolean, activityType: ActivityType, conflictMessage: string, additionalLogData: Record<string, any> = {}): Promise<Clinic> {
    const clinic = await this.findOne(clinicId);

    ValidationUtils.validateStatusChange({
      entity: clinic,
      currentStatus: clinic[statusField] as boolean,
      targetStatus,
      statusField,
      conflictMessage,
    });

    (clinic as any)[statusField] = targetStatus;
    const updatedClinic = await this.clinicRepository.save(clinic);

    // Log activity
    await this.activityLogger.logClinicActivity(clinic.id, clinic.name, clinic.city, activityType, userId, additionalLogData);

    return updatedClinic;
  }

  // Clinic verification and status management methods with logging
  async verifyClinic(clinicId: string, userId: string): Promise<Clinic> {
    return this.changeClinicStatus(clinicId, userId, 'is_verified', true, ActivityType.CLINIC_VERIFIED, 'Clinic is already verified', { verificationDate: new Date() });
  }

  async activateClinic(clinicId: string, userId: string): Promise<Clinic> {
    return this.changeClinicStatus(clinicId, userId, 'is_active', true, ActivityType.CLINIC_ACTIVATED, 'Clinic is already active', { activationDate: new Date() });
  }

  async deactivateClinic(clinicId: string, userId: string): Promise<Clinic> {
    return this.changeClinicStatus(clinicId, userId, 'is_active', false, ActivityType.CLINIC_DEACTIVATED, 'Clinic is already inactive', { deactivationDate: new Date() });
  }

  async updateStaffStatus(staffId: string, isActive: boolean, userId: string): Promise<ClinicStaff> {
    const staff = await this.clinicStaffRepository.findOne({
      where: { id: staffId },
      relations: ['clinic'],
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    if (staff.is_active === isActive) {
      throw new ConflictException(`Staff member is already ${isActive ? 'active' : 'inactive'}`);
    }

    staff.is_active = isActive;
    const updatedStaff = await this.clinicStaffRepository.save(staff);

    // Log status change activity
    const activityType = isActive ? ActivityType.STAFF_ACTIVATED : ActivityType.STAFF_DEACTIVATED;
    await this.usersService.logUserActivity(userId, activityType, ActivityStatus.SUCCESS, {
      staffId: staff.id,
      staffUserId: staff.user_id,
      staffRole: staff.role,
      clinicId: staff.clinic_id,
      clinicName: staff.clinic?.name || 'Unknown',
      statusChange: isActive ? 'activated' : 'deactivated',
      changeDate: new Date(),
    });

    return updatedStaff;
  }

  async updateServiceStatus(serviceId: string, isActive: boolean, userId: string): Promise<ClinicService> {
    const service = await this.clinicServiceRepository.findOne({
      where: { id: serviceId },
      relations: ['clinic'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.is_active === isActive) {
      throw new ConflictException(`Service is already ${isActive ? 'active' : 'inactive'}`);
    }

    service.is_active = isActive;
    const updatedService = await this.clinicServiceRepository.save(service);

    // Log status change activity
    const activityType = isActive ? ActivityType.SERVICE_ACTIVATED : ActivityType.SERVICE_DEACTIVATED;
    await this.usersService.logUserActivity(userId, activityType, ActivityStatus.SUCCESS, {
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.category,
      clinicId: service.clinic_id,
      clinicName: service.clinic?.name || 'Unknown',
      statusChange: isActive ? 'activated' : 'deactivated',
      changeDate: new Date(),
    });

    return updatedService;
  }

  // Admin Review Management Methods
  async getAllReviews(
    options: { page?: number; limit?: number; clinicId?: string; isVerified?: boolean; isReported?: boolean; sortBy?: string; sortOrder?: 'ASC' | 'DESC' } = {}
  ): Promise<{ reviews: ClinicReview[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, clinicId, isVerified, isReported, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.clinicReviewRepository.createQueryBuilder('review').leftJoinAndSelect('review.clinic', 'clinic').leftJoinAndSelect('review.user', 'user');

    // Apply filters
    if (clinicId) {
      queryBuilder.andWhere('review.clinic_id = :clinicId', { clinicId });
    }
    if (isVerified !== undefined) {
      queryBuilder.andWhere('review.is_verified = :isVerified', { isVerified });
    }
    if (isReported !== undefined) {
      queryBuilder.andWhere('review.is_reported = :isReported', { isReported });
    }

    // Apply sorting
    queryBuilder.orderBy(`review.${sortBy}`, sortOrder);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { reviews, total, page, totalPages };
  }

  async updateReview(reviewId: string, updateData: { rating?: number; title?: string; comment?: string; is_verified?: boolean }, userId: string): Promise<ClinicReview> {
    const review = await this.clinicReviewRepository.findOne({
      where: { id: reviewId },
      relations: ['clinic', 'user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const originalData = { ...review };
    Object.assign(review, updateData);
    const updatedReview = await this.clinicReviewRepository.save(review);

    // Update clinic rating if rating was changed
    if (updateData.rating !== undefined && updateData.rating !== originalData.rating) {
      await this.updateClinicRating(review.clinic_id);
    }

    // Log user activity
    await this.usersService.logUserActivity(userId, ActivityType.REVIEW_UPDATED, ActivityStatus.SUCCESS, {
      reviewId: review.id,
      clinicId: review.clinic_id,
      clinicName: review.clinic?.name || 'Unknown',
      userId: review.user_id,
      userName: `${review.user?.firstName} ${review.user?.lastName}` || 'Unknown',
      originalData,
      updatedData: updateData,
      changes: Object.keys(updateData),
    });

    return updatedReview;
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.clinicReviewRepository.findOne({
      where: { id: reviewId },
      relations: ['clinic', 'user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const clinicId = review.clinic_id;

    // Log user activity before deletion
    await this.usersService.logUserActivity(userId, ActivityType.REVIEW_DELETED, ActivityStatus.SUCCESS, {
      reviewId: review.id,
      clinicId: review.clinic_id,
      clinicName: review.clinic?.name || 'Unknown',
      userId: review.user_id,
      userName: `${review.user?.firstName} ${review.user?.lastName}` || 'Unknown',
      reviewData: {
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerified: review.is_verified,
        isReported: review.is_reported,
        helpfulCount: review.is_helpful_count,
      },
    });

    await this.clinicReviewRepository.remove(review);

    // Update clinic rating after deletion
    await this.updateClinicRating(clinicId);
  }

  async verifyReview(reviewId: string, userId: string): Promise<ClinicReview> {
    const review = await this.clinicReviewRepository.findOne({
      where: { id: reviewId },
      relations: ['clinic', 'user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.is_verified) {
      throw new ConflictException('Review is already verified');
    }

    review.is_verified = true;
    const updatedReview = await this.clinicReviewRepository.save(review);

    // Log user activity
    await this.usersService.logUserActivity(userId, ActivityType.REVIEW_VERIFIED, ActivityStatus.SUCCESS, {
      reviewId: review.id,
      clinicId: review.clinic_id,
      clinicName: review.clinic?.name || 'Unknown',
      userId: review.user_id,
      userName: `${review.user?.firstName} ${review.user?.lastName}` || 'Unknown',
      verificationDate: new Date(),
    });

    return updatedReview;
  }

  async unverifyReview(reviewId: string, userId: string): Promise<ClinicReview> {
    const review = await this.clinicReviewRepository.findOne({
      where: { id: reviewId },
      relations: ['clinic', 'user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (!review.is_verified) {
      throw new ConflictException('Review is already unverified');
    }

    review.is_verified = false;
    const updatedReview = await this.clinicReviewRepository.save(review);

    // Log user activity
    await this.usersService.logUserActivity(userId, ActivityType.REVIEW_UNVERIFIED, ActivityStatus.SUCCESS, {
      reviewId: review.id,
      clinicId: review.clinic_id,
      clinicName: review.clinic?.name || 'Unknown',
      userId: review.user_id,
      userName: `${review.user?.firstName} ${review.user?.lastName}` || 'Unknown',
      unverificationDate: new Date(),
    });

    return updatedReview;
  }
}
