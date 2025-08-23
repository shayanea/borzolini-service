import { Injectable, NotFoundException, ConflictException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';
import { Clinic } from './entities/clinic.entity';
import { ClinicStaff } from './entities/clinic-staff.entity';
import { ClinicService } from './entities/clinic-service.entity';
import { ClinicReview } from './entities/clinic-review.entity';
import { ClinicPhoto, PhotoCategory } from './entities/clinic-photo.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { CreateClinicStaffDto } from './dto/create-clinic-staff.dto';
import { CreateClinicServiceDto } from './dto/create-clinic-service.dto';
import { ConfigService } from '@nestjs/config';

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
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
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
    if (!this.clinicRepository || !this.clinicStaffRepository || !this.clinicServiceRepository || 
        !this.clinicReviewRepository || !this.clinicPhotoRepository) {
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

  async create(createClinicDto: CreateClinicDto): Promise<Clinic> {
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
    return savedClinic;
  }

  async findAll(filters: ClinicFilters = {}, options: ClinicSearchOptions = {}): Promise<{ clinics: Clinic[]; total: number }> {
    const { page = 1, limit = 10, sort_by = 'created_at', sort_order = 'DESC' } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.clinicRepository.createQueryBuilder('clinic')
      .leftJoinAndSelect('clinic.staff', 'staff')
      .leftJoinAndSelect('clinic.clinic_services', 'services')
      .leftJoinAndSelect('clinic.photos', 'photos')
      .leftJoinAndSelect('clinic.operating_hours_detail', 'hours');

    // Apply filters
    if (filters.name) {
      queryBuilder.andWhere('clinic.name ILIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.city) {
      queryBuilder.andWhere('clinic.city ILIKE :city', { city: `%${filters.city}%` });
    }

    if (filters.state) {
      queryBuilder.andWhere('clinic.state ILIKE :state', { state: `%${filters.state}%` });
    }

    if (filters.is_verified !== undefined) {
      queryBuilder.andWhere('clinic.is_verified = :is_verified', { is_verified: filters.is_verified });
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('clinic.is_active = :is_active', { is_active: filters.is_active });
    }

    if (filters.services && filters.services.length > 0) {
      queryBuilder.andWhere('clinic.services @> :services', { services: JSON.stringify(filters.services) });
    }

    if (filters.specializations && filters.specializations.length > 0) {
      queryBuilder.andWhere('clinic.specializations @> :specializations', { specializations: JSON.stringify(filters.specializations) });
    }

    if (filters.rating_min !== undefined) {
      queryBuilder.andWhere('clinic.rating >= :rating_min', { rating_min: filters.rating_min });
    }

    if (filters.rating_max !== undefined) {
      queryBuilder.andWhere('clinic.rating <= :rating_max', { rating_max: filters.rating_max });
    }

    // Apply sorting
    queryBuilder.orderBy(`clinic.${sort_by}`, sort_order);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [clinics, total] = await queryBuilder.getManyAndCount();

    return { clinics, total };
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.clinicRepository.findOne({
      where: { id },
      relations: [
        'staff',
        'staff.user',
        'clinic_services',
        'reviews',
        'reviews.user',
        'photos',
        'operating_hours_detail',
        'appointments'
      ],
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

  async update(id: string, updateClinicDto: UpdateClinicDto): Promise<Clinic> {
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

    Object.assign(clinic, updateClinicDto);
    return await this.clinicRepository.save(clinic);
  }

  async remove(id: string): Promise<void> {
    const clinic = await this.findOne(id);
    await this.clinicRepository.remove(clinic);
  }

  async addStaff(createClinicStaffDto: CreateClinicStaffDto): Promise<ClinicStaff> {
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
    return await this.clinicStaffRepository.save(staff);
  }

  async removeStaff(clinicId: string, userId: string): Promise<void> {
    const staff = await this.clinicStaffRepository.findOne({
      where: {
        clinic_id: clinicId,
        user_id: userId,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    await this.clinicStaffRepository.remove(staff);
  }

  async addService(createClinicServiceDto: CreateClinicServiceDto): Promise<ClinicService> {
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
    return await this.clinicServiceRepository.save(service);
  }

  async updateService(id: string, updateServiceDto: Partial<CreateClinicServiceDto>): Promise<ClinicService> {
    const service = await this.clinicServiceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    Object.assign(service, updateServiceDto);
    return await this.clinicServiceRepository.save(service);
  }

  async removeService(id: string): Promise<void> {
    const service = await this.clinicServiceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
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
      await this.clinicPhotoRepository.update(
        { clinic_id: clinicId, is_primary: true },
        { is_primary: false }
      );
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
    const [
      totalStaff,
      totalServices,
      totalReviews,
      averageRating,
      totalAppointments
    ] = await Promise.all([
      this.clinicStaffRepository.count({ where: { clinic_id: clinicId, is_active: true } }),
      this.clinicServiceRepository.count({ where: { clinic_id: clinicId, is_active: true } }),
      this.clinicReviewRepository.count({ where: { clinic_id: clinicId } }),
      this.clinicRepository.findOne({ where: { id: clinicId }, select: ['rating'] }),
      this.clinicRepository.createQueryBuilder('clinic')
        .leftJoin('clinic.appointments', 'appointments')
        .where('clinic.id = :clinicId', { clinicId })
        .getCount(),
    ]);

    return {
      totalStaff,
      totalServices,
      totalReviews,
      averageRating: averageRating?.rating || 0,
      totalAppointments,
    };
  }

  async searchClinics(query: string, options: ClinicSearchOptions = {}): Promise<{ clinics: Clinic[]; total: number }> {
    const { page = 1, limit = 10, sort_by = 'rating', sort_order = 'DESC' } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.clinicRepository.createQueryBuilder('clinic')
      .leftJoinAndSelect('clinic.staff', 'staff')
      .leftJoinAndSelect('clinic.clinic_services', 'services')
      .leftJoinAndSelect('clinic.photos', 'photos')
      .where('clinic.is_active = :isActive', { isActive: true })
      .andWhere(
        '(clinic.name ILIKE :query OR clinic.description ILIKE :query OR clinic.city ILIKE :query OR clinic.specializations::text ILIKE :query)',
        { query: `%${query}%` }
      );

    queryBuilder.orderBy(`clinic.${sort_by}`, sort_order);
    queryBuilder.skip(skip).take(limit);

    const [clinics, total] = await queryBuilder.getManyAndCount();

    return { clinics, total };
  }
}
