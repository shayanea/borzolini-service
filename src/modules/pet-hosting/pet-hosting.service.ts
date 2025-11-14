import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Not, Repository } from 'typeorm';

import { Pet, PetSize } from '../pets/entities/pet.entity';
import { User } from '../users/entities/user.entity';
import { ApproveBookingDto } from './dto/approve-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePetHostDto } from './dto/create-pet-host.dto';
import { SearchHostsDto } from './dto/search-hosts.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdatePetHostDto } from './dto/update-pet-host.dto';
import { BookingStatus, PetHostingBooking } from './entities/pet-hosting-booking.entity';
import { PetHostAvailability } from './entities/pet-host-availability.entity';
import { PetHostPhoto, PhotoCategory } from './entities/pet-host-photo.entity';
import { PetHostReview } from './entities/pet-host-review.entity';
import { PetHost } from './entities/pet-host.entity';

export interface HostFilters {
  city?: string;
  state?: string;
  is_verified?: boolean;
  is_active?: boolean;
  is_super_host?: boolean;
  min_rating?: number;
  pet_size?: string;
  search?: string;
}

@Injectable()
export class PetHostingService {
  private readonly logger = new Logger(PetHostingService.name);

  constructor(
    @InjectRepository(PetHost)
    private readonly hostRepository: Repository<PetHost>,
    @InjectRepository(PetHostingBooking)
    private readonly bookingRepository: Repository<PetHostingBooking>,
    @InjectRepository(PetHostAvailability)
    private readonly availabilityRepository: Repository<PetHostAvailability>,
    @InjectRepository(PetHostReview)
    private readonly reviewRepository: Repository<PetHostReview>,
    @InjectRepository(PetHostPhoto)
    private readonly photoRepository: Repository<PetHostPhoto>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>
  ) {}

  // Host Management
  async createHost(createHostDto: CreatePetHostDto, userId: string): Promise<PetHost> {
    // Check if user already has a host profile
    const existingHost = await this.hostRepository.findOne({
      where: { user_id: userId },
    });

    if (existingHost) {
      throw new ConflictException('User already has a host profile');
    }

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const host = this.hostRepository.create({
      ...createHostDto,
      user_id: userId,
      size_pricing_tiers: createHostDto.size_pricing_tiers || {
        small: 1.0,
        medium: 1.2,
        large: 1.5,
        giant: 2.0,
      },
      duration_discounts: createHostDto.duration_discounts || {
        weekly: 0.1,
        monthly: 0.2,
      },
    });

    const savedHost = await this.hostRepository.save(host);
    this.logger.log(`Created host profile ${savedHost.id} for user ${userId}`);

    return savedHost;
  }

  async findAllHosts(
    filters: HostFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    hosts: PetHost[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.hostRepository.createQueryBuilder('host').leftJoinAndSelect('host.photos', 'photos').leftJoinAndSelect('host.user', 'user');

    if (filters.city) {
      queryBuilder.andWhere('host.city ILIKE :city', { city: `%${filters.city}%` });
    }
    if (filters.state) {
      queryBuilder.andWhere('host.state ILIKE :state', { state: `%${filters.state}%` });
    }
    if (filters.is_verified !== undefined) {
      queryBuilder.andWhere('host.is_verified = :isVerified', { isVerified: filters.is_verified });
    }
    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('host.is_active = :isActive', { isActive: filters.is_active });
    }
    if (filters.is_super_host !== undefined) {
      queryBuilder.andWhere('host.is_super_host = :isSuperHost', { isSuperHost: filters.is_super_host });
    }
    if (filters.min_rating !== undefined) {
      queryBuilder.andWhere('host.rating >= :minRating', { minRating: filters.min_rating });
    }
    if (filters.search) {
      queryBuilder.andWhere('(host.bio ILIKE :search OR host.city ILIKE :search OR host.address ILIKE :search)', { search: `%${filters.search}%` });
    }

    queryBuilder.andWhere('host.is_active = :isActive', { isActive: true });
    queryBuilder.orderBy('host.rating', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [hosts, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { hosts, total, page, totalPages };
  }

  async findOneHost(id: string): Promise<PetHost> {
    const host = await this.hostRepository.findOne({
      where: { id },
      relations: ['user', 'photos', 'reviews', 'availability'],
    });

    if (!host) {
      throw new NotFoundException(`Host with ID ${id} not found`);
    }

    return host;
  }

  async findHostByUserId(userId: string): Promise<PetHost | null> {
    return await this.hostRepository.findOne({
      where: { user_id: userId },
      relations: ['photos', 'reviews'],
    });
  }

  async updateHost(id: string, updateHostDto: UpdatePetHostDto, userId: string): Promise<PetHost> {
    const host = await this.findOneHost(id);

    // Check if user owns this host profile
    if (host.user_id !== userId) {
      throw new BadRequestException('You can only update your own host profile');
    }

    Object.assign(host, updateHostDto);
    const updatedHost = await this.hostRepository.save(host);

    this.logger.log(`Updated host profile ${id}`);
    return updatedHost;
  }

  async deleteHost(id: string, userId: string): Promise<void> {
    const host = await this.findOneHost(id);

    if (host.user_id !== userId) {
      throw new BadRequestException('You can only delete your own host profile');
    }

    await this.hostRepository.remove(host);
    this.logger.log(`Deleted host profile ${id}`);
  }

  // Booking Management
  async createBooking(createBookingDto: CreateBookingDto, ownerId: string): Promise<PetHostingBooking> {
    // Verify owner exists
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    // Verify pet exists and belongs to owner
    const pet = await this.petRepository.findOne({
      where: { id: createBookingDto.pet_id, owner_id: ownerId },
    });
    if (!pet) {
      throw new NotFoundException(`Pet not found or does not belong to you`);
    }

    // Verify host exists and is active
    const host = await this.hostRepository.findOne({
      where: { id: createBookingDto.host_id, is_active: true },
    });
    if (!host) {
      throw new NotFoundException(`Host not found or is not active`);
    }

    // Validate dates
    const checkIn = new Date(createBookingDto.check_in_date);
    const checkOut = new Date(createBookingDto.check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    if (checkOut <= checkIn) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    // Check availability
    await this.checkAvailability(host.id, checkIn, checkOut);

    // Check for conflicts
    await this.checkBookingConflicts(createBookingDto.pet_id, checkIn, checkOut);

    // Calculate pricing
    const pricing = await this.calculatePricing(host, pet, checkIn, checkOut, createBookingDto.medication_schedule || []);

    // Create booking
    const bookingData: Partial<PetHostingBooking> = {
      check_in_date: checkIn,
      check_out_date: checkOut,
      host_id: createBookingDto.host_id,
      pet_id: createBookingDto.pet_id,
      owner_id: ownerId,
      status: BookingStatus.PENDING_APPROVAL,
      base_price: pricing.basePrice,
      size_multiplier: pricing.sizeMultiplier,
      duration_discount: pricing.durationDiscount,
      additional_services_fee: pricing.additionalServicesFee,
      total_price: pricing.totalPrice,
      medication_schedule: createBookingDto.medication_schedule || [],
      payment_status: 'pending',
    };

    if (createBookingDto.special_instructions) {
      bookingData.special_instructions = createBookingDto.special_instructions;
    }
    if (createBookingDto.dietary_needs) {
      bookingData.dietary_needs = createBookingDto.dietary_needs;
    }

    const booking = this.bookingRepository.create(bookingData);
    const savedBooking = await this.bookingRepository.save(booking);
    this.logger.log(`Created booking ${savedBooking.id} for pet ${pet.name}`);

    // Update host response metrics (new request received)
    await this.updateHostResponseMetrics(host.id);

    return savedBooking;
  }

  async approveBooking(bookingId: string, approveDto: ApproveBookingDto, hostUserId: string): Promise<PetHostingBooking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['host', 'pet', 'owner'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Verify user owns the host profile
    if (booking.host.user_id !== hostUserId) {
      throw new BadRequestException('You can only approve bookings for your own host profile');
    }

    if (booking.status !== BookingStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`Booking is already ${booking.status}`);
    }

    if (approveDto.approve) {
      booking.status = BookingStatus.APPROVED;
      booking.approved_at = new Date();
      (booking as any).rejected_at = null;
      (booking as any).rejection_reason = null;
    } else {
      if (!approveDto.rejection_reason) {
        throw new BadRequestException('Rejection reason is required when rejecting a booking');
      }
      booking.status = BookingStatus.REJECTED;
      booking.rejected_at = new Date();
      booking.rejection_reason = approveDto.rejection_reason;
      (booking as any).approved_at = null;
    }

    const updatedBooking = await this.bookingRepository.save(booking);
    this.logger.log(`Booking ${bookingId} ${approveDto.approve ? 'approved' : 'rejected'} by host`);

    // Update host response metrics
    await this.updateHostResponseMetrics(booking.host_id);

    return updatedBooking;
  }

  async confirmBooking(bookingId: string, ownerId: string): Promise<PetHostingBooking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['host', 'pet'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.owner_id !== ownerId) {
      throw new BadRequestException('You can only confirm your own bookings');
    }

    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException(`Booking must be approved before confirmation. Current status: ${booking.status}`);
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.payment_status = 'paid';

    const updatedBooking = await this.bookingRepository.save(booking);
    this.logger.log(`Booking ${bookingId} confirmed by owner`);

    return updatedBooking;
  }

  async findAllBookings(
    filters: {
      host_id?: string;
      owner_id?: string;
      pet_id?: string;
      status?: BookingStatus;
    } = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    bookings: PetHostingBooking[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking').leftJoinAndSelect('booking.host', 'host').leftJoinAndSelect('booking.pet', 'pet').leftJoinAndSelect('booking.owner', 'owner');

    if (filters.host_id) {
      queryBuilder.andWhere('booking.host_id = :hostId', { hostId: filters.host_id });
    }
    if (filters.owner_id) {
      queryBuilder.andWhere('booking.owner_id = :ownerId', { ownerId: filters.owner_id });
    }
    if (filters.pet_id) {
      queryBuilder.andWhere('booking.pet_id = :petId', { petId: filters.pet_id });
    }
    if (filters.status) {
      queryBuilder.andWhere('booking.status = :status', { status: filters.status });
    }

    queryBuilder.orderBy('booking.check_in_date', 'ASC');
    queryBuilder.skip(skip).take(limit);

    const [bookings, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { bookings, total, page, totalPages };
  }

  async findOneBooking(id: string): Promise<PetHostingBooking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['host', 'host.user', 'pet', 'owner', 'review'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto, userId: string): Promise<PetHostingBooking> {
    const booking = await this.findOneBooking(id);

    // Check permissions
    if (booking.owner_id !== userId && booking.host.user_id !== userId) {
      throw new BadRequestException('You can only update your own bookings or bookings for your host profile');
    }

    // Only allow updates for pending or approved bookings
    if (![BookingStatus.PENDING_APPROVAL, BookingStatus.APPROVED].includes(booking.status)) {
      throw new BadRequestException(`Cannot update booking with status ${booking.status}`);
    }

    if (updateBookingDto.check_in_date || updateBookingDto.check_out_date) {
      const checkIn = updateBookingDto.check_in_date ? new Date(updateBookingDto.check_in_date) : booking.check_in_date;
      const checkOut = updateBookingDto.check_out_date ? new Date(updateBookingDto.check_out_date) : booking.check_out_date;

      // Recalculate pricing if dates changed
      const host = await this.hostRepository.findOne({ where: { id: booking.host_id } });
      const pet = await this.petRepository.findOne({ where: { id: booking.pet_id } });
      if (host && pet) {
        const pricing = await this.calculatePricing(host, pet, checkIn, checkOut, booking.medication_schedule);
        booking.base_price = pricing.basePrice;
        booking.size_multiplier = pricing.sizeMultiplier;
        booking.duration_discount = pricing.durationDiscount;
        booking.additional_services_fee = pricing.additionalServicesFee;
        booking.total_price = pricing.totalPrice;
      }

      // Check availability and conflicts
      await this.checkAvailability(booking.host_id, checkIn, checkOut);
      await this.checkBookingConflicts(booking.pet_id, checkIn, checkOut, id);
    }

    Object.assign(booking, updateBookingDto);
    const updatedBooking = await this.bookingRepository.save(booking);

    this.logger.log(`Updated booking ${id}`);
    return updatedBooking;
  }

  async cancelBooking(id: string, userId: string): Promise<void> {
    const booking = await this.findOneBooking(id);

    if (booking.owner_id !== userId && booking.host.user_id !== userId) {
      throw new BadRequestException('You can only cancel your own bookings or bookings for your host profile');
    }

    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)) {
      throw new BadRequestException(`Cannot cancel booking with status ${booking.status}`);
    }

    booking.status = BookingStatus.CANCELLED;
    await this.bookingRepository.save(booking);

    this.logger.log(`Cancelled booking ${id}`);
  }

  // Availability Management
  async addAvailability(hostId: string, startDate: Date, endDate: Date, maxPets: number, customRate?: number, isBlocked: boolean = false): Promise<PetHostAvailability> {
    await this.findOneHost(hostId);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const availabilityData: Partial<PetHostAvailability> = {
      host_id: hostId,
      start_date: startDate,
      end_date: endDate,
      max_pets_available: maxPets,
      is_blocked: isBlocked,
    };

    if (customRate !== undefined) {
      availabilityData.custom_daily_rate = customRate;
    }

    const availability = this.availabilityRepository.create(availabilityData);
    return await this.availabilityRepository.save(availability);
  }

  async checkAvailability(hostId: string, checkIn: Date, checkOut: Date): Promise<void> {
    const host = await this.findOneHost(hostId);

    // Check blocked dates
    const blockedDates = await this.availabilityRepository.find({
      where: {
        host_id: hostId,
        is_blocked: true,
        start_date: LessThan(checkOut),
        end_date: MoreThan(checkIn),
      },
    });

    if (blockedDates.length > 0) {
      throw new ConflictException('Host is not available during the requested dates');
    }

    // Check capacity
    const existingBookings = await this.bookingRepository.find({
      where: {
        host_id: hostId,
        status: In([BookingStatus.APPROVED, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]),
        check_in_date: LessThan(checkOut),
        check_out_date: MoreThan(checkIn),
      },
    });

    // Count pets per day (simplified - could be more sophisticated)
    const maxCapacity = host.max_pets;
    if (existingBookings.length >= maxCapacity) {
      throw new ConflictException('Host is at full capacity during the requested dates');
    }
  }

  // Pricing Calculation
  async calculatePricing(
    host: PetHost,
    pet: Pet,
    checkIn: Date,
    checkOut: Date,
    additionalServices: string[] = []
  ): Promise<{
    basePrice: number;
    sizeMultiplier: number;
    durationDiscount: number;
    additionalServicesFee: number;
    totalPrice: number;
  }> {
    const durationDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const baseDailyRate = Number(host.base_daily_rate);

    // Get size multiplier
    const petSize = pet.size || PetSize.MEDIUM;
    const sizePricingTiers = host.size_pricing_tiers as any;
    const sizeMultiplier = sizePricingTiers?.[petSize] || 1.0;

    // Calculate base price
    const basePrice = baseDailyRate * durationDays * sizeMultiplier;

    // Apply duration discounts
    let durationDiscount = 0;
    const durationDiscounts = host.duration_discounts as any;
    if (durationDays >= 30 && durationDiscounts?.monthly) {
      durationDiscount = durationDiscounts.monthly;
    } else if (durationDays >= 7 && durationDiscounts?.weekly) {
      durationDiscount = durationDiscounts.weekly;
    }

    const discountedPrice = basePrice * (1 - durationDiscount);

    // Calculate additional services fees
    let additionalServicesFee = 0;
    if (additionalServices.includes('medication_administration')) {
      additionalServicesFee += 5 * durationDays; // $5 per day
    }
    if (additionalServices.includes('grooming')) {
      additionalServicesFee += 20; // $20 one-time
    }
    if (additionalServices.includes('training')) {
      additionalServicesFee += 15 * durationDays; // $15 per day
    }

    const totalPrice = discountedPrice + additionalServicesFee;

    return {
      basePrice: Number(basePrice.toFixed(2)),
      sizeMultiplier: Number(sizeMultiplier),
      durationDiscount: Number(durationDiscount),
      additionalServicesFee: Number(additionalServicesFee.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
    };
  }

  // Conflict Checking
  async checkBookingConflicts(petId: string, checkIn: Date, checkOut: Date, excludeBookingId?: string): Promise<void> {
    const where: any = {
      pet_id: petId,
      status: In([BookingStatus.PENDING_APPROVAL, BookingStatus.APPROVED, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]),
      check_in_date: LessThan(checkOut),
      check_out_date: MoreThan(checkIn),
    };

    if (excludeBookingId) {
      where.id = Not(excludeBookingId);
    }

    const conflicts = await this.bookingRepository.find({ where });

    if (conflicts.length > 0) {
      throw new ConflictException(`Pet already has a booking during the requested dates`);
    }
  }

  // Search Hosts
  async searchHosts(searchDto: SearchHostsDto): Promise<{
    hosts: PetHost[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.hostRepository.createQueryBuilder('host').leftJoinAndSelect('host.photos', 'photos').leftJoinAndSelect('host.user', 'user').where('host.is_active = :isActive', { isActive: true });

    if (searchDto.search) {
      queryBuilder.andWhere('(host.bio ILIKE :search OR host.city ILIKE :search OR host.address ILIKE :search)', {
        search: `%${searchDto.search}%`,
      });
    }

    if (searchDto.city) {
      queryBuilder.andWhere('host.city ILIKE :city', { city: `%${searchDto.city}%` });
    }

    if (searchDto.state) {
      queryBuilder.andWhere('host.state ILIKE :state', { state: `%${searchDto.state}%` });
    }

    if (searchDto.min_rating !== undefined) {
      queryBuilder.andWhere('host.rating >= :minRating', { minRating: searchDto.min_rating });
    }

    if (searchDto.min_price !== undefined) {
      queryBuilder.andWhere('host.base_daily_rate >= :minPrice', { minPrice: searchDto.min_price });
    }

    if (searchDto.max_price !== undefined) {
      queryBuilder.andWhere('host.base_daily_rate <= :maxPrice', { maxPrice: searchDto.max_price });
    }

    if (searchDto.super_host_only) {
      queryBuilder.andWhere('host.is_super_host = :isSuperHost', { isSuperHost: true });
    }

    if (searchDto.verified_only) {
      queryBuilder.andWhere('host.is_verified = :isVerified', { isVerified: true });
    }

    if (searchDto.min_response_rate !== undefined) {
      queryBuilder.andWhere('host.response_rate >= :minResponseRate', { minResponseRate: searchDto.min_response_rate });
    }

    if (searchDto.pet_size) {
      queryBuilder.andWhere('host.pet_size_preferences @> :petSize', { petSize: JSON.stringify([searchDto.pet_size]) });
    }

    if (searchDto.amenities && searchDto.amenities.length > 0) {
      queryBuilder.andWhere('host.amenities @> :amenities', { amenities: JSON.stringify(searchDto.amenities) });
    }

    // Date availability filtering
    if (searchDto.check_in_date && searchDto.check_out_date) {
      const checkIn = new Date(searchDto.check_in_date);
      const checkOut = new Date(searchDto.check_out_date);

      // Exclude hosts with blocked dates
      const hostsWithBlockedDates = await this.availabilityRepository
        .createQueryBuilder('availability')
        .select('availability.host_id')
        .where('availability.is_blocked = :isBlocked', { isBlocked: true })
        .andWhere('availability.start_date < :checkOut', { checkOut })
        .andWhere('availability.end_date > :checkIn', { checkIn })
        .getRawMany();

      const blockedHostIds = hostsWithBlockedDates.map((a) => a.availability_host_id);
      if (blockedHostIds.length > 0) {
        queryBuilder.andWhere('host.id NOT IN (:...blockedHostIds)', { blockedHostIds });
      }
    }

    // Location-based search
    if (searchDto.latitude && searchDto.longitude) {
      const radiusKm = searchDto.radius_km || 10;
      // Simple distance calculation (could use PostGIS for more accurate results)
      queryBuilder.andWhere(`(6371 * acos(cos(radians(:lat)) * cos(radians(host.latitude)) * cos(radians(host.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(host.latitude)))) <= :radius`, {
        lat: searchDto.latitude,
        lng: searchDto.longitude,
        radius: radiusKm,
      });
    }

    // Sorting
    const sortBy = searchDto.sort_by || 'rating';
    const sortOrder = searchDto.sort_order || 'DESC';
    queryBuilder.orderBy(`host.${sortBy}`, sortOrder);

    queryBuilder.skip(skip).take(limit);

    const [hosts, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { hosts, total, page, totalPages };
  }

  // Review Management
  async createReview(
    hostId: string,
    bookingId: string,
    userId: string,
    ratings: {
      care_quality: number;
      communication: number;
      cleanliness: number;
      value: number;
      overall: number;
    },
    title?: string,
    comment?: string,
    reviewPhotos?: string[]
  ): Promise<PetHostReview> {
    const booking = await this.findOneBooking(bookingId);

    if (booking.host_id !== hostId) {
      throw new BadRequestException('Booking does not belong to this host');
    }

    if (booking.owner_id !== userId) {
      throw new BadRequestException('You can only review your own bookings');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed bookings');
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findOne({
      where: { booking_id: bookingId },
    });

    if (existingReview) {
      throw new ConflictException('Review already exists for this booking');
    }

    const reviewData: Partial<PetHostReview> = {
      host_id: hostId,
      booking_id: bookingId,
      user_id: userId,
      pet_id: booking.pet_id,
      care_quality: ratings.care_quality,
      communication: ratings.communication,
      cleanliness: ratings.cleanliness,
      value: ratings.value,
      overall: ratings.overall,
      review_photos: reviewPhotos || [],
      is_verified: true,
    };

    if (title) {
      reviewData.title = title;
    }
    if (comment) {
      reviewData.comment = comment;
    }

    const review = this.reviewRepository.create(reviewData);
    const savedReview = await this.reviewRepository.save(review);

    // Update host rating
    await this.updateHostRating(hostId);

    this.logger.log(`Created review for host ${hostId}`);
    return savedReview;
  }

  async updateHostRating(hostId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { host_id: hostId, is_verified: true },
    });

    if (reviews.length === 0) {
      await this.hostRepository.update(hostId, {
        rating: 0,
        total_reviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.overall, 0);
    const averageRating = totalRating / reviews.length;

    await this.hostRepository.update(hostId, {
      rating: Math.round(averageRating * 100) / 100,
      total_reviews: reviews.length,
    });

    // Check super host eligibility
    await this.checkSuperHostEligibility(hostId);
  }

  // Trust Metrics
  async updateHostResponseMetrics(hostId: string): Promise<void> {
    const bookings = await this.bookingRepository.find({
      where: { host_id: hostId },
    });

    const totalRequests = bookings.length;
    const respondedRequests = bookings.filter((b) => b.approved_at || b.rejected_at).length;
    const responseRate = totalRequests > 0 ? (respondedRequests / totalRequests) * 100 : 0;

    // Calculate average response time
    const respondedBookings = bookings.filter((b) => b.approved_at || b.rejected_at);
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    for (const booking of respondedBookings) {
      const responseTime = booking.approved_at || booking.rejected_at;
      if (responseTime) {
        const hoursDiff = (responseTime.getTime() - booking.created_at.getTime()) / (1000 * 60 * 60);
        totalResponseTime += hoursDiff;
        responseTimeCount++;
      }
    }

    const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : null;

    const updateData: any = {
      response_rate: Math.round(responseRate * 100) / 100,
    };
    if (avgResponseTime !== null) {
      updateData.response_time_avg_hours = Math.round(avgResponseTime * 100) / 100;
    }
    await this.hostRepository.update(hostId, updateData);
  }

  async updateHostCompletionRate(hostId: string): Promise<void> {
    const bookings = await this.bookingRepository.find({
      where: { host_id: hostId },
    });

    const confirmedBookings = bookings.filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.IN_PROGRESS || b.status === BookingStatus.COMPLETED);
    const completedBookings = bookings.filter((b) => b.status === BookingStatus.COMPLETED);

    const completionRate = confirmedBookings.length > 0 ? (completedBookings.length / confirmedBookings.length) * 100 : 0;

    await this.hostRepository.update(hostId, {
      completion_rate: Math.round(completionRate * 100) / 100,
    });

    // Check super host eligibility
    await this.checkSuperHostEligibility(hostId);
  }

  async checkSuperHostEligibility(hostId: string): Promise<void> {
    const host = await this.findOneHost(hostId);

    if (host.canBecomeSuperHost && !host.is_super_host) {
      await this.hostRepository.update(hostId, {
        is_super_host: true,
      });
      this.logger.log(`Host ${hostId} earned super host badge`);
    }
  }

  // Photo Management
  async addPhoto(hostId: string, photoUrl: string, category: PhotoCategory, caption?: string, isPrimary: boolean = false): Promise<PetHostPhoto> {
    await this.findOneHost(hostId);

    // If this is a primary photo, unset other primary photos
    if (isPrimary) {
      await this.photoRepository.update({ host_id: hostId, is_primary: true }, { is_primary: false });
    }

    const photoData: Partial<PetHostPhoto> = {
      host_id: hostId,
      photo_url: photoUrl,
      category,
      is_primary: isPrimary,
    };

    if (caption) {
      photoData.caption = caption;
    }

    const photo = this.photoRepository.create(photoData);
    return await this.photoRepository.save(photo);
  }

  async removePhoto(photoId: string, hostId: string): Promise<void> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId, host_id: hostId },
    });

    if (!photo) {
      throw new NotFoundException(`Photo not found or does not belong to this host`);
    }

    await this.photoRepository.remove(photo);
  }
}
