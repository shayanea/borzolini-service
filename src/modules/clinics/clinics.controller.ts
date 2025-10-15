import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { ExportService } from '../../common/services/export.service';
import { RequiredStaffRoles } from '../auth/decorators/required-staff-roles.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClinicAccessGuard } from '../auth/guards/clinic-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ClinicFilters, ClinicSearchOptions, ClinicsService } from './clinics.service';
import { CreateClinicServiceDto } from './dto/create-clinic-service.dto';
import { CreateClinicStaffDto } from './dto/create-clinic-staff.dto';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { ClinicPhoto } from './entities/clinic-photo.entity';
import { ClinicReview } from './entities/clinic-review.entity';
import { ClinicService } from './entities/clinic-service.entity';
import { ClinicStaff, StaffRole } from './entities/clinic-staff.entity';
import { Clinic } from './entities/clinic.entity';
// ClinicPetCase and ClinicCaseTimeline are not directly used in controller
import { CreatePetCaseDto } from './dto/create-pet-case.dto';
import { UpdatePetCaseDto } from './dto/update-pet-case.dto';
import { CaseFilters, ClinicPetCaseService } from './services/clinic-pet-case.service';

@ApiTags('Clinics')
@Controller('clinics')
export class ClinicsController {
  constructor(
    private readonly clinicsService: ClinicsService,
    private readonly clinicPetCaseService: ClinicPetCaseService,
    private readonly exportService: ExportService
  ) {}

  @Post('public/register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Public: Register a new clinic (rate-limited)' })
  @ApiBody({ type: CreateClinicDto })
  @ApiResponse({ status: 201, description: 'Clinic registered successfully', type: Clinic })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async publicRegister(@Body() createClinicDto: CreateClinicDto): Promise<Clinic> {
    return await this.clinicsService.create(createClinicDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new clinic' })
  @ApiResponse({
    status: 201,
    description: 'Clinic created successfully',
    type: Clinic,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Conflict - Clinic already exists' })
  async create(@Body() createClinicDto: CreateClinicDto, @Request() req: any): Promise<Clinic> {
    return await this.clinicsService.create(createClinicDto, req.user?.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF, UserRole.PATIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all clinics with filtering and pagination' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by clinic name',
  })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({ name: 'state', required: false, description: 'Filter by state' })
  @ApiQuery({
    name: 'is_verified',
    required: false,
    description: 'Filter by verification status',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'services',
    required: false,
    description: 'Filter by services offered',
  })
  @ApiQuery({
    name: 'specializations',
    required: false,
    description: 'Filter by specializations',
  })
  @ApiQuery({
    name: 'rating_min',
    required: false,
    description: 'Minimum rating filter',
  })
  @ApiQuery({
    name: 'rating_max',
    required: false,
    description: 'Maximum rating filter',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    description: 'Sort field',
    example: 'rating',
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    description: 'Sort order',
    example: 'DESC',
  })
  @ApiResponse({
    status: 200,
    description: 'Clinics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        clinics: {
          type: 'array',
          items: { $ref: '#/components/schemas/Clinic' },
        },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query('name') name?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('is_verified') isVerified?: boolean,
    @Query('is_active') isActive?: boolean,
    @Query('services') services?: string,
    @Query('specializations') specializations?: string,
    @Query('rating_min') ratingMin?: number,
    @Query('rating_max') ratingMax?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: 'ASC' | 'DESC'
  ) {
    const filters: ClinicFilters = {
      ...(name && { name }),
      ...(city && { city }),
      ...(state && { state }),
      ...(isVerified !== undefined && { is_verified: isVerified }),
      ...(isActive !== undefined && { is_active: isActive }),
      ...(services && { services: services.split(',') }),
      ...(specializations && { specializations: specializations.split(',') }),
      ...(ratingMin !== undefined && { rating_min: ratingMin }),
      ...(ratingMax !== undefined && { rating_max: ratingMax }),
    };

    const options: ClinicSearchOptions = {
      ...(page && { page }),
      ...(limit && { limit }),
      ...(sortBy && { sort_by: sortBy }),
      ...(sortOrder && { sort_order: sortOrder }),
    };

    return await this.clinicsService.findAll(filters, options);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search clinics by query string' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    description: 'Sort field',
    example: 'rating',
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    description: 'Sort order',
    example: 'DESC',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        clinics: {
          type: 'array',
          items: { $ref: '#/components/schemas/Clinic' },
        },
        total: { type: 'number' },
      },
    },
  })
  async search(@Query('q') query: string, @Query('page') page?: number, @Query('limit') limit?: number, @Query('sort_by') sortBy?: string, @Query('sort_order') sortOrder?: 'ASC' | 'DESC') {
    const options: ClinicSearchOptions = {
      ...(page && { page }),
      ...(limit && { limit }),
      ...(sortBy && { sort_by: sortBy }),
      ...(sortOrder && { sort_order: sortOrder }),
    };

    return await this.clinicsService.searchClinics(query, options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a clinic by ID' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 200,
    description: 'Clinic retrieved successfully',
    type: Clinic,
  })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  async findOne(@Param('id') id: string): Promise<Clinic> {
    return await this.clinicsService.findOne(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get clinics by name' })
  @ApiParam({ name: 'name', description: 'Clinic name' })
  @ApiResponse({
    status: 200,
    description: 'Clinics retrieved successfully',
    type: [Clinic],
  })
  async findByName(@Param('name') name: string): Promise<Clinic[]> {
    return await this.clinicsService.findByName(name);
  }

  @Get('city/:city')
  @ApiOperation({ summary: 'Get clinics by city' })
  @ApiParam({ name: 'city', description: 'City name' })
  @ApiResponse({
    status: 200,
    description: 'Clinics retrieved successfully',
    type: [Clinic],
  })
  async findByCity(@Param('city') city: string): Promise<Clinic[]> {
    return await this.clinicsService.findByCity(city);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 200,
    description: 'Clinic updated successfully',
    type: Clinic,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Clinic name already exists',
  })
  async update(@Param('id') id: string, @Body() updateClinicDto: UpdateClinicDto, @Request() req: any): Promise<Clinic> {
    return await this.clinicsService.update(id, updateClinicDto, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({ status: 204, description: 'Clinic deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.clinicsService.remove(id, req.user?.id);
  }

  // Staff Management
  @Get(':id/staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List staff members for a clinic',
    description: 'Retrieve staff members for a specific clinic. Admin users can view staff from any clinic, while staff/veterinarians can only view colleagues from their own clinic.',
  })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by staff role' })
  @ApiQuery({ name: 'is_active', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'specialization', required: false, description: 'Filter by specialization (ILIKE match)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in staff bio or user name' })
  @ApiQuery({ name: 'experience_min', required: false, description: 'Minimum experience (years)' })
  @ApiQuery({ name: 'experience_max', required: false, description: 'Maximum experience (years)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort field', example: 'created_at' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order', example: 'DESC' })
  @ApiResponse({
    status: 200,
    description: 'Staff list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        staff: { type: 'array', items: { $ref: '#/components/schemas/ClinicStaff' } },
        total: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only view staff from clinics where you are a member' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  async listClinicStaff(
    @Param('id') clinicId: string,
    @Request() req: any,
    @Query('role') role?: string,
    @Query('is_active') isActive?: boolean,
    @Query('specialization') specialization?: string,
    @Query('search') search?: string,
    @Query('experience_min') experienceMin?: number,
    @Query('experience_max') experienceMax?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: 'ASC' | 'DESC'
  ) {
    // For non-admin users, check if they are staff at this clinic
    if (req.user.role !== UserRole.ADMIN) {
      const isStaffAtClinic = await this.clinicsService.isUserStaffAtClinic(req.user.id, clinicId);
      if (!isStaffAtClinic) {
        throw new ForbiddenException('Access denied: You can only view staff from clinics where you are a member');
      }
    }

    const filters = {
      ...(role && { role }),
      ...(isActive !== undefined && { is_active: isActive }),
      ...(specialization && { specialization }),
      ...(search && { search }),
      ...(experienceMin !== undefined && { experience_min: experienceMin }),
      ...(experienceMax !== undefined && { experience_max: experienceMax }),
    } as any;

    const options = {
      ...(page && { page }),
      ...(limit && { limit }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    } as any;

    return await this.clinicsService.listStaff(clinicId, filters, options);
  }

  @Post(':id/staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add staff member to clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 201,
    description: 'Staff member added successfully',
    type: ClinicStaff,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already staff member',
  })
  async addStaff(@Param('id') clinicId: string, @Body() createClinicStaffDto: CreateClinicStaffDto, @Request() req: any): Promise<ClinicStaff> {
    createClinicStaffDto.clinic_id = clinicId;
    return await this.clinicsService.addStaff(createClinicStaffDto, req.user?.id);
  }

  @Delete(':clinicId/staff/:userId')
  @UseGuards(JwtAuthGuard, ClinicAccessGuard)
  @RequiredStaffRoles(StaffRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove staff member from clinic' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'Staff member removed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStaff(@Param('clinicId') clinicId: string, @Param('userId') userId: string, @Request() req: any): Promise<void> {
    await this.clinicsService.removeStaff(clinicId, userId, req.user?.id);
  }

  // Service Management
  @Post(':id/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add service to clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 201,
    description: 'Service added successfully',
    type: ClinicService,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Service already exists',
  })
  async addService(@Param('id') clinicId: string, @Body() createClinicServiceDto: CreateClinicServiceDto, @Request() req: any): Promise<ClinicService> {
    createClinicServiceDto.clinic_id = clinicId;
    return await this.clinicsService.addService(createClinicServiceDto, req.user?.id);
  }

  @Patch('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update clinic service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: ClinicService,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async updateService(@Param('id') id: string, @Body() updateServiceDto: Partial<CreateClinicServiceDto>, @Request() req: any): Promise<ClinicService> {
    return await this.clinicsService.updateService(id, updateServiceDto, req.user?.id);
  }

  @Delete('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete clinic service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({ status: 204, description: 'Service deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeService(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.clinicsService.removeService(id, req.user?.id);
  }

  // Review Management
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add review to clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 201,
    description: 'Review added successfully',
    type: ClinicReview,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already reviewed this clinic',
  })
  async addReview(@Param('id') clinicId: string, @Request() req: any, @Body() reviewData: { rating: number; title?: string; comment?: string }): Promise<ClinicReview> {
    const { rating, title, comment } = reviewData;
    return await this.clinicsService.addReview(clinicId, req.user.id, rating, title, comment);
  }

  // Photo Management
  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add photo to clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 201,
    description: 'Photo added successfully',
    type: ClinicPhoto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  async addPhoto(
    @Param('id') clinicId: string,
    @Body()
    photoData: {
      photo_url: string;
      caption?: string;
      category?: string;
      is_primary?: boolean;
    }
  ): Promise<ClinicPhoto> {
    const { photo_url, caption, category, is_primary } = photoData;
    return await this.clinicsService.addPhoto(clinicId, photo_url, caption, category, is_primary);
  }

  @Delete('photos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete clinic photo' })
  @ApiParam({ name: 'id', description: 'Photo ID' })
  @ApiResponse({ status: 204, description: 'Photo deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Photo not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePhoto(@Param('id') id: string): Promise<void> {
    await this.clinicsService.removePhoto(id);
  }

  // Statistics
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get clinic statistics' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalStaff: { type: 'number' },
        totalServices: { type: 'number' },
        totalReviews: { type: 'number' },
        averageRating: { type: 'number' },
        totalAppointments: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  async getClinicStats(@Param('id') id: string) {
    return await this.clinicsService.getClinicStats(id);
  }

  @Get('with-appointments-pets-staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get clinics with appointments, pets, and staff',
    description: 'Retrieve all active clinics that have at least one appointment, one pet case, and one staff member. Includes statistics for each clinic.',
  })
  @ApiResponse({
    status: 200,
    description: 'Clinics with appointments, pets, and staff retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clinic: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              rating: { type: 'number' },
              is_verified: { type: 'boolean' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
          stats: {
            type: 'object',
            properties: {
              appointments: { type: 'number' },
              pets: { type: 'number' },
              staff: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async getClinicsWithAppointmentsPetsAndStaff() {
    return await this.clinicsService.getClinicsWithAppointmentsPetsAndStaff();
  }

  // Clinic Verification and Status Management
  @Post(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 200,
    description: 'Clinic verified successfully',
    type: Clinic,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  @ApiResponse({ status: 409, description: 'Clinic already verified' })
  async verifyClinic(@Param('id') clinicId: string, @Request() req: any): Promise<Clinic> {
    return await this.clinicsService.verifyClinic(clinicId, req.user?.id);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 200,
    description: 'Clinic activated successfully',
    type: Clinic,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  @ApiResponse({ status: 409, description: 'Clinic already active' })
  async activateClinic(@Param('id') clinicId: string, @Request() req: any): Promise<Clinic> {
    return await this.clinicsService.activateClinic(clinicId, req.user?.id);
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({
    status: 200,
    description: 'Clinic deactivated successfully',
    type: Clinic,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  @ApiResponse({ status: 409, description: 'Clinic already inactive' })
  async deactivateClinic(@Param('id') clinicId: string, @Request() req: any): Promise<Clinic> {
    return await this.clinicsService.deactivateClinic(clinicId, req.user?.id);
  }

  // Staff Status Management
  @Patch('staff/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff member status' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff status updated successfully',
    type: ClinicStaff,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  @ApiResponse({ status: 409, description: 'Staff already has this status' })
  async updateStaffStatus(@Param('id') staffId: string, @Body() statusData: { isActive: boolean }, @Request() req: any): Promise<ClinicStaff> {
    return await this.clinicsService.updateStaffStatus(staffId, statusData.isActive, req.user?.id);
  }

  // Service Status Management
  @Patch('services/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service status' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'Service status updated successfully',
    type: ClinicService,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 409, description: 'Service already has this status' })
  async updateServiceStatus(@Param('id') serviceId: string, @Body() statusData: { isActive: boolean }, @Request() req: any): Promise<ClinicService> {
    return await this.clinicsService.updateServiceStatus(serviceId, statusData.isActive, req.user?.id);
  }

  // Admin Review Management Endpoints
  @Get('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews with filtering and pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'clinicId', required: false, description: 'Filter by clinic ID' })
  @ApiQuery({ name: 'isVerified', required: false, description: 'Filter by verification status' })
  @ApiQuery({ name: 'isReported', required: false, description: 'Filter by reported status' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field', example: 'created_at' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order', example: 'DESC' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        reviews: {
          type: 'array',
          items: { $ref: '#/components/schemas/ClinicReview' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getAllReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('clinicId') clinicId?: string,
    @Query('isVerified') isVerified?: boolean,
    @Query('isReported') isReported?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
  ) {
    const options = {
      ...(page && { page }),
      ...(limit && { limit }),
      ...(clinicId && { clinicId }),
      ...(isVerified !== undefined && { isVerified }),
      ...(isReported !== undefined && { isReported }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    };

    return await this.clinicsService.getAllReviews(options);
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review (Admin only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: ClinicReview,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async updateReview(@Param('id') reviewId: string, @Body() updateData: { rating?: number; title?: string; comment?: string; is_verified?: boolean }, @Request() req: any): Promise<ClinicReview> {
    return await this.clinicsService.updateReview(reviewId, updateData, req.user?.id);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review (Admin only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(@Param('id') reviewId: string, @Request() req: any): Promise<void> {
    await this.clinicsService.deleteReview(reviewId, req.user?.id);
  }

  @Post('reviews/:id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a review (Admin only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review verified successfully',
    type: ClinicReview,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 409, description: 'Review already verified' })
  async verifyReview(@Param('id') reviewId: string, @Request() req: any): Promise<ClinicReview> {
    return await this.clinicsService.verifyReview(reviewId, req.user?.id);
  }

  @Post('reviews/:id/unverify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unverify a review (Admin only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review unverified successfully',
    type: ClinicReview,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 409, description: 'Review already unverified' })
  async unverifyReview(@Param('id') reviewId: string, @Request() req: any): Promise<ClinicReview> {
    return await this.clinicsService.unverifyReview(reviewId, req.user?.id);
  }

  // Export endpoints
  @Get('export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export clinics to CSV' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by clinic name',
  })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({ name: 'state', required: false, description: 'Filter by state' })
  @ApiQuery({
    name: 'is_verified',
    required: false,
    description: 'Filter by verification status',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'services',
    required: false,
    description: 'Filter by services offered',
  })
  @ApiQuery({
    name: 'specializations',
    required: false,
    description: 'Filter by specializations',
  })
  @ApiQuery({
    name: 'rating_min',
    required: false,
    description: 'Minimum rating filter',
  })
  @ApiQuery({
    name: 'rating_max',
    required: false,
    description: 'Maximum rating filter',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file generated successfully',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async exportClinicsToCsv(
    @Res() res: Response,
    @Query('name') name?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('is_verified') isVerified?: boolean,
    @Query('is_active') isActive?: boolean,
    @Query('services') services?: string,
    @Query('specializations') specializations?: string,
    @Query('rating_min') ratingMin?: number,
    @Query('rating_max') ratingMax?: number
  ) {
    const filters: ClinicFilters = {
      ...(name && { name }),
      ...(city && { city }),
      ...(state && { state }),
      ...(isVerified !== undefined && { is_verified: isVerified }),
      ...(isActive !== undefined && { is_active: isActive }),
      ...(services && { services: services.split(',') }),
      ...(specializations && { specializations: specializations.split(',') }),
      ...(ratingMin !== undefined && { rating_min: ratingMin }),
      ...(ratingMax !== undefined && { rating_max: ratingMax }),
    };

    const options: ClinicSearchOptions = {
      page: 1,
      limit: 10000, // Large limit to get all records
    };

    const result = await this.clinicsService.findAll(filters, options);
    const transformedData = this.exportService.transformClinicData(result.clinics);

    await this.exportService.exportData(transformedData, 'csv', 'clinics', res);
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export clinics to Excel' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by clinic name',
  })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({ name: 'state', required: false, description: 'Filter by state' })
  @ApiQuery({
    name: 'is_verified',
    required: false,
    description: 'Filter by verification status',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'services',
    required: false,
    description: 'Filter by services offered',
  })
  @ApiQuery({
    name: 'specializations',
    required: false,
    description: 'Filter by specializations',
  })
  @ApiQuery({
    name: 'rating_min',
    required: false,
    description: 'Minimum rating filter',
  })
  @ApiQuery({
    name: 'rating_max',
    required: false,
    description: 'Maximum rating filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Excel file generated successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async exportClinicsToExcel(
    @Res() res: Response,
    @Query('name') name?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('is_verified') isVerified?: boolean,
    @Query('is_active') isActive?: boolean,
    @Query('services') services?: string,
    @Query('specializations') specializations?: string,
    @Query('rating_min') ratingMin?: number,
    @Query('rating_max') ratingMax?: number
  ) {
    const filters: ClinicFilters = {
      ...(name && { name }),
      ...(city && { city }),
      ...(state && { state }),
      ...(isVerified !== undefined && { is_verified: isVerified }),
      ...(isActive !== undefined && { is_active: isActive }),
      ...(services && { services: services.split(',') }),
      ...(specializations && { specializations: specializations.split(',') }),
      ...(ratingMin !== undefined && { rating_min: ratingMin }),
      ...(ratingMax !== undefined && { rating_max: ratingMax }),
    };

    const options: ClinicSearchOptions = {
      page: 1,
      limit: 10000, // Large limit to get all records
    };

    const result = await this.clinicsService.findAll(filters, options);
    const transformedData = this.exportService.transformClinicData(result.clinics);

    await this.exportService.exportData(transformedData, 'excel', 'clinics', res);
  }

  // Pet Case Management Endpoints
  @Post(':id/cases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pet case for clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({ status: 201, description: 'Pet case created successfully' })
  async createPetCase(@Param('id') clinicId: string, @Body() createCaseDto: CreatePetCaseDto, @Request() req: any) {
    return await this.clinicPetCaseService.createCase(clinicId, createCaseDto, req.user.id);
  }

  @Get(':id/cases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pet cases for clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({ status: 200, description: 'Pet cases retrieved successfully' })
  async getClinicPetCases(
    @Param('id') clinicId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('case_type') case_type?: string,
    @Query('pet_id') pet_id?: string,
    @Query('owner_id') owner_id?: string,
    @Query('vet_id') vet_id?: string,
    @Query('is_urgent') is_urgent?: boolean,
    @Query('is_resolved') is_resolved?: boolean
  ) {
    const filters: CaseFilters = {
      status: status ? (status.split(',') as any) : undefined,
      priority: priority ? (priority.split(',') as any) : undefined,
      case_type: case_type ? (case_type.split(',') as any) : undefined,
      pet_id,
      owner_id,
      vet_id,
      is_urgent,
      is_resolved,
    };

    return await this.clinicPetCaseService.getCasesByClinic(clinicId, filters, page, limit);
  }

  @Get(':id/cases/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get case statistics for clinic' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiResponse({ status: 200, description: 'Case statistics retrieved successfully' })
  async getCaseStats(@Param('id') clinicId: string) {
    return await this.clinicPetCaseService.getCaseStats(clinicId);
  }

  @Get(':id/cases/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pet case by ID' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'Pet case retrieved successfully' })
  async getPetCaseById(@Param('id') clinicId: string, @Param('caseId') caseId: string) {
    return await this.clinicPetCaseService.getCaseById(clinicId, caseId);
  }

  @Put(':id/cases/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pet case' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'Pet case updated successfully' })
  async updatePetCase(@Param('id') clinicId: string, @Param('caseId') caseId: string, @Body() updateDto: UpdatePetCaseDto, @Request() req: any) {
    return await this.clinicPetCaseService.updateCase(clinicId, caseId, updateDto, req.user.id);
  }

  @Get(':id/cases/:caseId/timeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get case timeline' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'Case timeline retrieved successfully' })
  async getCaseTimeline(@Param('id') _clinicId: string, @Param('caseId') caseId: string) {
    return await this.clinicPetCaseService.getCaseTimeline(caseId);
  }

  @Post(':id/cases/:caseId/timeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add timeline event to case' })
  @ApiParam({ name: 'id', description: 'Clinic ID' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 201, description: 'Timeline event added successfully' })
  async addTimelineEvent(@Param('id') _clinicId: string, @Param('caseId') caseId: string, @Body() eventData: any, @Request() req: any) {
    return await this.clinicPetCaseService.addTimelineEvent(caseId, {
      ...eventData,
      created_by: req.user.id,
    });
  }
}
