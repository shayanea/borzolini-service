import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApproveBookingDto } from './dto/approve-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePetHostDto } from './dto/create-pet-host.dto';
import { HostResponseDto } from './dto/host-response.dto';
import { SearchHostsDto } from './dto/search-hosts.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdatePetHostDto } from './dto/update-pet-host.dto';
import { BookingStatus, PetHostingBooking } from './entities/pet-hosting-booking.entity';
import { PetHost } from './entities/pet-host.entity';
import { PetHostPhoto, PhotoCategory } from './entities/pet-host-photo.entity';
import { PetHostReview } from './entities/pet-host-review.entity';
import { HostFilters, PetHostingService } from './pet-hosting.service';

@ApiTags('Pet Hosting')
@Controller('pet-hosting')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PetHostingController {
  constructor(private readonly petHostingService: PetHostingService) {}

  // Host Management
  @Post('hosts')
  @ApiOperation({ summary: 'Create a new host profile', description: 'Create a pet host profile for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Host profile created successfully', type: PetHost })
  @ApiResponse({ status: 400, description: 'Bad request - invalid host data' })
  @ApiResponse({ status: 409, description: 'User already has a host profile' })
  async createHost(@Body() createHostDto: CreatePetHostDto, @Request() req: any): Promise<PetHost> {
    const userId = req.user.id;
    return this.petHostingService.createHost(createHostDto, userId);
  }

  @Get('hosts')
  @ApiOperation({ summary: 'Get all hosts', description: 'Retrieve all active hosts with optional filtering' })
  @ApiResponse({ status: 200, description: 'Hosts retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'city', required: false, type: String, description: 'Filter by city' })
  @ApiQuery({ name: 'state', required: false, type: String, description: 'Filter by state' })
  @ApiQuery({ name: 'is_verified', required: false, type: Boolean, description: 'Filter by verified status' })
  @ApiQuery({ name: 'is_super_host', required: false, type: Boolean, description: 'Filter by super host status' })
  @ApiQuery({ name: 'min_rating', required: false, type: Number, description: 'Minimum rating' })
  async findAllHosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('is_verified') isVerified?: string,
    @Query('is_super_host') isSuperHost?: string,
    @Query('min_rating') minRating?: string
  ): Promise<{ hosts: PetHost[]; total: number; page: number; totalPages: number }> {
    const filters: HostFilters = {};
    if (city) filters.city = city;
    if (state) filters.state = state;
    if (isVerified === 'true') filters.is_verified = true;
    if (isVerified === 'false') filters.is_verified = false;
    if (isSuperHost === 'true') filters.is_super_host = true;
    if (isSuperHost === 'false') filters.is_super_host = false;
    if (minRating) filters.min_rating = parseFloat(minRating);
    return this.petHostingService.findAllHosts(filters, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
  }

  @Get('hosts/search')
  @ApiOperation({ summary: 'Search hosts', description: 'Search hosts with advanced filtering options' })
  @ApiResponse({ status: 200, description: 'Hosts retrieved successfully' })
  async searchHosts(@Query() searchDto: SearchHostsDto): Promise<{ hosts: PetHost[]; total: number; page: number; totalPages: number }> {
    return this.petHostingService.searchHosts(searchDto);
  }

  @Get('hosts/:id')
  @ApiOperation({ summary: 'Get host by ID', description: 'Retrieve a specific host profile' })
  @ApiParam({ name: 'id', description: 'Host ID' })
  @ApiResponse({ status: 200, description: 'Host retrieved successfully', type: PetHost })
  @ApiResponse({ status: 404, description: 'Host not found' })
  async findOneHost(@Param('id', ParseUUIDPipe) id: string): Promise<HostResponseDto> {
    const host = await this.petHostingService.findOneHost(id);
    return {
      host,
      trust_score: host.trustScore,
      has_minimum_reviews: host.hasMinimumReviews,
      can_become_super_host: host.canBecomeSuperHost,
    };
  }

  @Get('hosts/user/me')
  @ApiOperation({ summary: 'Get current user host profile', description: 'Retrieve the host profile for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Host profile retrieved successfully', type: PetHost })
  @ApiResponse({ status: 404, description: 'Host profile not found' })
  async findMyHost(@Request() req: any): Promise<PetHost> {
    const userId = req.user.id;
    const host = await this.petHostingService.findHostByUserId(userId);
    if (!host) {
      throw new Error('Host profile not found');
    }
    return host;
  }

  @Patch('hosts/:id')
  @ApiOperation({ summary: 'Update host profile', description: 'Update a host profile (only owner can update)' })
  @ApiParam({ name: 'id', description: 'Host ID' })
  @ApiResponse({ status: 200, description: 'Host profile updated successfully', type: PetHost })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Host not found' })
  async updateHost(@Param('id', ParseUUIDPipe) id: string, @Body() updateHostDto: UpdatePetHostDto, @Request() req: any): Promise<PetHost> {
    const userId = req.user.id;
    return this.petHostingService.updateHost(id, updateHostDto, userId);
  }

  @Delete('hosts/:id')
  @ApiOperation({ summary: 'Delete host profile', description: 'Delete a host profile (only owner can delete)' })
  @ApiParam({ name: 'id', description: 'Host ID' })
  @ApiResponse({ status: 200, description: 'Host profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Host not found' })
  async deleteHost(@Param('id', ParseUUIDPipe) id: string, @Request() req: any): Promise<void> {
    const userId = req.user.id;
    return this.petHostingService.deleteHost(id, userId);
  }

  // Booking Management
  @Post('bookings')
  @ApiOperation({ summary: 'Create a new booking', description: 'Create a booking request for pet hosting' })
  @ApiResponse({ status: 201, description: 'Booking created successfully', type: PetHostingBooking })
  @ApiResponse({ status: 400, description: 'Bad request - invalid booking data' })
  @ApiResponse({ status: 409, description: 'Booking conflict or host not available' })
  async createBooking(@Body() createBookingDto: CreateBookingDto, @Request() req: any): Promise<PetHostingBooking> {
    const ownerId = req.user.id;
    return this.petHostingService.createBooking(createBookingDto, ownerId);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings', description: 'Retrieve bookings with optional filtering' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'host_id', required: false, type: String })
  @ApiQuery({ name: 'owner_id', required: false, type: String })
  @ApiQuery({ name: 'pet_id', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  async findAllBookings(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('host_id') hostId?: string,
    @Query('owner_id') ownerId?: string,
    @Query('pet_id') petId?: string,
    @Query('status') status?: BookingStatus
  ): Promise<{ bookings: PetHostingBooking[]; total: number; page: number; totalPages: number }> {
    const filters: { host_id?: string; owner_id?: string; pet_id?: string; status?: BookingStatus } = {};
    if (hostId) filters.host_id = hostId;
    if (ownerId) filters.owner_id = ownerId;
    if (petId) filters.pet_id = petId;
    if (status) filters.status = status;
    return this.petHostingService.findAllBookings(filters, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
  }

  @Get('bookings/my-bookings')
  @ApiOperation({ summary: 'Get my bookings', description: 'Retrieve bookings for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async findMyBookings(@Request() req: any): Promise<{ bookings: PetHostingBooking[]; total: number; page: number; totalPages: number }> {
    const userId = req.user.id;
    return this.petHostingService.findAllBookings({ owner_id: userId }, 1, 100);
  }

  @Get('bookings/host/my-bookings')
  @ApiOperation({ summary: 'Get bookings for my host profile', description: 'Retrieve bookings for the authenticated user host profile' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async findMyHostBookings(@Request() req: any): Promise<{ bookings: PetHostingBooking[]; total: number; page: number; totalPages: number }> {
    const userId = req.user.id;
    const host = await this.petHostingService.findHostByUserId(userId);
    if (!host) {
      return { bookings: [], total: 0, page: 1, totalPages: 0 };
    }
    return this.petHostingService.findAllBookings({ host_id: host.id }, 1, 100);
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get booking by ID', description: 'Retrieve a specific booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully', type: PetHostingBooking })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOneBooking(@Param('id', ParseUUIDPipe) id: string): Promise<BookingResponseDto> {
    const booking = await this.petHostingService.findOneBooking(id);
    return {
      booking,
      duration_days: booking.durationDays,
      can_be_reviewed: booking.canBeReviewed,
    };
  }

  @Post('bookings/:id/approve')
  @ApiOperation({ summary: 'Approve or reject booking', description: 'Host approves or rejects a booking request' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking approved/rejected successfully', type: PetHostingBooking })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async approveBooking(@Param('id', ParseUUIDPipe) id: string, @Body() approveDto: ApproveBookingDto, @Request() req: any): Promise<PetHostingBooking> {
    const hostUserId = req.user.id;
    return this.petHostingService.approveBooking(id, approveDto, hostUserId);
  }

  @Post('bookings/:id/confirm')
  @ApiOperation({ summary: 'Confirm booking', description: 'Owner confirms payment and finalizes approved booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully', type: PetHostingBooking })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async confirmBooking(@Param('id', ParseUUIDPipe) id: string, @Request() req: any): Promise<PetHostingBooking> {
    const ownerId = req.user.id;
    return this.petHostingService.confirmBooking(id, ownerId);
  }

  @Patch('bookings/:id')
  @ApiOperation({ summary: 'Update booking', description: 'Update a booking (only owner or host can update)' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully', type: PetHostingBooking })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateBooking(@Param('id', ParseUUIDPipe) id: string, @Body() updateBookingDto: UpdateBookingDto, @Request() req: any): Promise<PetHostingBooking> {
    const userId = req.user.id;
    return this.petHostingService.updateBooking(id, updateBookingDto, userId);
  }

  @Delete('bookings/:id')
  @ApiOperation({ summary: 'Cancel booking', description: 'Cancel a booking (only owner or host can cancel)' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(@Param('id', ParseUUIDPipe) id: string, @Request() req: any): Promise<void> {
    const userId = req.user.id;
    return this.petHostingService.cancelBooking(id, userId);
  }

  // Review Management
  @Post('hosts/:hostId/reviews')
  @ApiOperation({ summary: 'Create review', description: 'Create a review for a completed booking' })
  @ApiParam({ name: 'hostId', description: 'Host ID' })
  @ApiResponse({ status: 201, description: 'Review created successfully', type: PetHostReview })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Review already exists' })
  async createReview(
    @Param('hostId', ParseUUIDPipe) hostId: string,
    @Body()
    reviewData: {
      booking_id: string;
      care_quality: number;
      communication: number;
      cleanliness: number;
      value: number;
      overall: number;
      title?: string;
      comment?: string;
      review_photos?: string[];
    },
    @Request() req: any
  ): Promise<PetHostReview> {
    const userId = req.user.id;
    return this.petHostingService.createReview(
      hostId,
      reviewData.booking_id,
      userId,
      {
        care_quality: reviewData.care_quality,
        communication: reviewData.communication,
        cleanliness: reviewData.cleanliness,
        value: reviewData.value,
        overall: reviewData.overall,
      },
      reviewData.title,
      reviewData.comment,
      reviewData.review_photos
    );
  }

  // Photo Management
  @Post('hosts/:hostId/photos')
  @ApiOperation({ summary: 'Add photo to host profile', description: 'Add a photo to a host profile' })
  @ApiParam({ name: 'hostId', description: 'Host ID' })
  @ApiResponse({ status: 201, description: 'Photo added successfully', type: PetHostPhoto })
  async addPhoto(
    @Param('hostId', ParseUUIDPipe) hostId: string,
    @Body()
    photoData: {
      photo_url: string;
      category: PhotoCategory;
      caption?: string;
      is_primary?: boolean;
    },
    @Request() req: any
  ): Promise<PetHostPhoto> {
    const userId = req.user.id;
    const host = await this.petHostingService.findHostByUserId(userId);
    if (!host || host.id !== hostId) {
      throw new Error('You can only add photos to your own host profile');
    }
    return this.petHostingService.addPhoto(hostId, photoData.photo_url, photoData.category, photoData.caption, photoData.is_primary);
  }

  @Delete('hosts/:hostId/photos/:photoId')
  @ApiOperation({ summary: 'Remove photo from host profile', description: 'Remove a photo from a host profile' })
  @ApiParam({ name: 'hostId', description: 'Host ID' })
  @ApiParam({ name: 'photoId', description: 'Photo ID' })
  @ApiResponse({ status: 200, description: 'Photo removed successfully' })
  async removePhoto(@Param('hostId', ParseUUIDPipe) hostId: string, @Param('photoId', ParseUUIDPipe) photoId: string, @Request() req: any): Promise<void> {
    const userId = req.user.id;
    const host = await this.petHostingService.findHostByUserId(userId);
    if (!host || host.id !== hostId) {
      throw new Error('You can only remove photos from your own host profile');
    }
    return this.petHostingService.removePhoto(photoId, hostId);
  }
}

