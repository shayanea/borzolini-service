import { Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseIntPipe, Patch, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ExportService } from '../../common/services/export.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClinicAccessGuard } from '../auth/guards/clinic-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { AppointmentFilters, AppointmentsService, AppointmentStats, TimeSlot, CalendarViewResponse } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, AppointmentStatus, AppointmentType } from './entities/appointment.entity';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly exportService: ExportService
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new appointment',
    description: 'Create a new appointment for the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: Appointment,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid appointment data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pet, clinic, or user not found' })
  @ApiResponse({ status: 409, description: 'Appointment scheduling conflict' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req: any): Promise<Appointment> {
    const ownerId = req.user.id;
    return this.appointmentsService.create(createAppointmentDto, ownerId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get all appointments',
    description: 'Retrieve all appointments with optional filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AppointmentStatus,
    description: 'Filter by appointment status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: AppointmentType,
    description: 'Filter by appointment type',
  })
  @ApiQuery({
    name: 'clinic_id',
    required: false,
    type: String,
    description: 'Filter by clinic ID',
  })
  @ApiQuery({
    name: 'staff_id',
    required: false,
    type: String,
    description: 'Filter by staff ID',
  })
  @ApiQuery({
    name: 'pet_id',
    required: false,
    type: String,
    description: 'Filter by pet ID',
  })
  @ApiQuery({
    name: 'owner_id',
    required: false,
    type: String,
    description: 'Filter by owner ID (admin only)',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Filter by start date (ISO string)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Filter by end date (ISO string)',
  })
  @ApiQuery({
    name: 'is_telemedicine',
    required: false,
    type: Boolean,
    description: 'Filter by telemedicine appointments',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in pet name, owner name, or notes',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (default: scheduled_date)',
    example: 'scheduled_date',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (default: ASC)',
    example: 'ASC',
  })
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('type') type?: AppointmentType,
    @Query('clinic_id') clinic_id?: string,
    @Query('staff_id') staff_id?: string,
    @Query('pet_id') pet_id?: string,
    @Query('owner_id') owner_id?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('is_telemedicine') is_telemedicine?: boolean,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
  ) {
    // Multi-tenancy: clinic_admin, staff, and vets can only see their own clinic's appointments
    // Only ADMIN can see all clinics
    if (req.user.role === UserRole.CLINIC_ADMIN || req.user.role === UserRole.VETERINARIAN || req.user.role === UserRole.STAFF) {
      // Force clinic_id to user's clinic for clinic_admin, staff, and vets
      clinic_id = req.user.clinic_id;
    }

    // Only allow admins to filter by owner_id
    if (owner_id && req.user.role !== UserRole.ADMIN) {
      owner_id = req.user.id; // Force to current user's appointments
    }

    const filters: AppointmentFilters = {
      status,
      type,
      clinic_id,
      staff_id,
      pet_id,
      // Only set owner_id for non-admin users or when explicitly filtering
      owner_id: req.user.role === UserRole.ADMIN ? owner_id : owner_id || req.user.id,
      date_from: date_from ? new Date(date_from) : undefined,
      date_to: date_to ? new Date(date_to) : undefined,
      is_telemedicine,
      search,
    };

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.appointmentsService.findAll(filters, pageNum, limitNum, sortBy, sortOrder);
  }

  @Get('my-appointments')
  @ApiOperation({
    summary: 'Get current user appointments',
    description: 'Retrieve all appointments owned by the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User appointments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyAppointments(@Request() req: any): Promise<Appointment[]> {
    return this.appointmentsService.findByOwner(req.user.id);
  }

  @Get('pet/:petId')
  @ApiOperation({
    summary: 'Get appointments by pet',
    description: 'Retrieve all appointments for a specific pet',
  })
  @ApiResponse({
    status: 200,
    description: 'Pet appointments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'petId', description: 'Pet ID' })
  async findByPet(@Param('petId') petId: string): Promise<Appointment[]> {
    // Check if user owns the pet or is admin/staff
    // This would need additional validation in a real implementation
    return this.appointmentsService.findByPet(petId);
  }

  @Get('clinic/:clinicId')
  @UseGuards(JwtAuthGuard, ClinicAccessGuard)
  @ApiOperation({
    summary: 'Get appointments by clinic',
    description: 'Retrieve all appointments for a specific clinic',
  })
  @ApiResponse({
    status: 200,
    description: 'Clinic appointments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by specific date (ISO string)',
  })
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  async findByClinic(@Param('clinicId') clinicId: string, @Query('date') date?: string): Promise<Appointment[]> {
    const filterDate = date ? new Date(date) : undefined;
    return this.appointmentsService.findByClinic(clinicId, filterDate);
  }

  @Get('staff/:staffId')
  @ApiOperation({
    summary: 'Get appointments by staff member',
    description: 'Retrieve all appointments for a specific staff member',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff appointments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by specific date (ISO string)',
  })
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  async findByStaff(@Param('staffId') staffId: string, @Query('date') date?: string): Promise<Appointment[]> {
    const filterDate = date ? new Date(date) : undefined;
    return this.appointmentsService.findByStaff(staffId, filterDate);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get appointment statistics',
    description: 'Retrieve comprehensive statistics about all appointments',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  async getAppointmentStats(@Request() req: any): Promise<AppointmentStats> {
    // Multi-tenancy: clinic_admin, staff, and vets only see their clinic's stats
    if (req.user.role === UserRole.CLINIC_ADMIN || req.user.role === UserRole.VETERINARIAN || req.user.role === UserRole.STAFF) {
      return this.appointmentsService.getAppointmentStats(req.user.clinic_id);
    }
    // ADMIN can see all stats
    return this.appointmentsService.getAppointmentStats();
  }

  @Get('available-slots/:clinicId')
  @UseGuards(JwtAuthGuard, ClinicAccessGuard)
  @ApiOperation({
    summary: 'Get available time slots',
    description: 'Get available time slots for a specific clinic and date',
  })
  @ApiResponse({
    status: 200,
    description: 'Available time slots retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Date to check (ISO string)',
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    type: Number,
    description: 'Duration in minutes (default: 30)',
  })
  async getAvailableTimeSlots(
    @Param('clinicId') clinicId: string,
    @Query('date') date: string,
    @Query('duration', new ParseIntPipe({ optional: true }))
    duration: number = 30
  ): Promise<TimeSlot[]> {
    const checkDate = new Date(date);
    return this.appointmentsService.getAvailableTimeSlots(clinicId, checkDate, duration);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get appointment by ID',
    description: 'Retrieve a specific appointment by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async findOne(@Param('id') id: string, @Request() req: any): Promise<Appointment> {
    const appointment = await this.appointmentsService.findOne(id);

    // Check if user owns the appointment or is admin/staff
    if (appointment.owner_id !== req.user.id && ![UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF].includes(req.user.role)) {
      throw new Error('Access denied');
    }

    return appointment;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update appointment',
    description: 'Update a specific appointment by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    type: Appointment,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid update data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Appointment scheduling conflict' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto, @Request() req: any): Promise<Appointment> {
    return this.appointmentsService.update(id, updateAppointmentDto, req.user.id, req.user.role);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update appointment status',
    description: 'Update the status of a specific appointment',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment status updated successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiQuery({
    name: 'status',
    required: true,
    enum: AppointmentStatus,
    description: 'New appointment status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Query('status', new ParseEnumPipe(AppointmentStatus))
    status: AppointmentStatus,
    @Request() req: any
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(id, status, req.user.id, req.user.role);
  }

  @Patch(':id/reschedule')
  @ApiOperation({
    summary: 'Reschedule appointment',
    description: 'Reschedule a specific appointment to a new date/time',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment rescheduled successfully',
    type: Appointment,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid new date' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({
    status: 409,
    description: 'New time conflicts with existing appointment',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiQuery({
    name: 'new_date',
    required: true,
    type: String,
    description: 'New appointment date (ISO string)',
  })
  async rescheduleAppointment(@Param('id') id: string, @Query('new_date') newDate: string, @Request() req: any): Promise<Appointment> {
    const rescheduleDate = new Date(newDate);
    return this.appointmentsService.rescheduleAppointment(id, rescheduleDate, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel appointment',
    description: 'Cancel a specific appointment by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<{ message: string }> {
    await this.appointmentsService.remove(id, req.user.id, req.user.role);
    return { message: 'Appointment cancelled successfully' };
  }

  @Get('today')
  @ApiOperation({
    summary: 'Get today appointments',
    description: 'Get all appointments scheduled for today',
  })
  @ApiResponse({
    status: 200,
    description: 'Today appointments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'clinic_id',
    required: false,
    type: String,
    description: 'Filter by clinic ID',
  })
  async getTodayAppointments(@Request() req: any, @Query('clinic_id') clinicId?: string): Promise<Appointment[]> {
    const today = new Date();
    const filters: AppointmentFilters = {
      date_from: today,
      date_to: today,
      owner_id: req.user.role === UserRole.ADMIN ? undefined : req.user.id,
      clinic_id: clinicId,
    };

    const result = await this.appointmentsService.findAll(filters, 1, 1000);
    return result.appointments;
  }

  @Get('upcoming')
  @ApiOperation({
    summary: 'Get upcoming appointments',
    description: 'Get all upcoming appointments',
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming appointments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days ahead to look (default: 7)',
  })
  async getUpcomingAppointments(@Query('days', new ParseIntPipe({ optional: true })) days: number = 7, @Request() req: any): Promise<Appointment[]> {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + days);

    const filters: AppointmentFilters = {
      date_from: fromDate,
      date_to: toDate,
      owner_id: req.user.role === UserRole.ADMIN ? undefined : req.user.id,
    };

    const result = await this.appointmentsService.findAll(filters, 1, 1000);
    return result.appointments.filter((apt) => apt.scheduled_date > new Date());
  }

  @Get('calendar')
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get calendar view',
    description: 'Returns appointments grouped by day and staff for calendar timeline views',
  })
  @ApiResponse({ status: 200, description: 'Calendar data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'clinic_id', required: false, type: String, description: 'Filter by clinic ID' })
  @ApiQuery({ name: 'staff_id', required: false, type: String, description: 'Filter by specific staff ID' })
  @ApiQuery({ name: 'date_from', required: true, type: String, description: 'Start of range (ISO string)' })
  @ApiQuery({ name: 'date_to', required: true, type: String, description: 'End of range (ISO string)' })
  async getCalendar(@Request() req: any, @Query('clinic_id') clinic_id?: string, @Query('staff_id') staff_id?: string, @Query('date_from') date_from?: string, @Query('date_to') date_to?: string): Promise<CalendarViewResponse> {
    // Multi-tenancy: restrict to user's clinic for clinic_admin/staff/vets
    if (req.user.role === UserRole.CLINIC_ADMIN || req.user.role === UserRole.VETERINARIAN || req.user.role === UserRole.STAFF) {
      clinic_id = req.user.clinic_id;
    }

    const filters: AppointmentFilters = {
      clinic_id,
      staff_id,
      owner_id: req.user.role === UserRole.ADMIN ? undefined : req.user.id,
      date_from: date_from ? new Date(date_from) : undefined,
      date_to: date_to ? new Date(date_to) : undefined,
    };

    return this.appointmentsService.getCalendarView(filters);
  }

  // Export endpoints
  @Get('export/csv')
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Export appointments to CSV',
    description: 'Export all appointments to CSV format with optional filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10000)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AppointmentStatus,
    description: 'Filter by appointment status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: AppointmentType,
    description: 'Filter by appointment type',
  })
  @ApiQuery({
    name: 'clinic_id',
    required: false,
    type: String,
    description: 'Filter by clinic ID',
  })
  @ApiQuery({
    name: 'staff_id',
    required: false,
    type: String,
    description: 'Filter by staff ID',
  })
  @ApiQuery({
    name: 'pet_id',
    required: false,
    type: String,
    description: 'Filter by pet ID',
  })
  @ApiQuery({
    name: 'owner_id',
    required: false,
    type: String,
    description: 'Filter by owner ID (admin only)',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Filter by start date (ISO string)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Filter by end date (ISO string)',
  })
  @ApiQuery({
    name: 'is_telemedicine',
    required: false,
    type: Boolean,
    description: 'Filter by telemedicine appointments',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in pet name, owner name, or notes',
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
  async exportAppointmentsToCsv(
    @Res() res: Response,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('type') type?: AppointmentType,
    @Query('clinic_id') clinic_id?: string,
    @Query('staff_id') staff_id?: string,
    @Query('pet_id') pet_id?: string,
    @Query('owner_id') owner_id?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('is_telemedicine') is_telemedicine?: boolean,
    @Query('search') search?: string
  ) {
    // Only allow admins to filter by owner_id
    if (owner_id && req.user.role !== UserRole.ADMIN) {
      owner_id = req.user.id; // Force to current user's appointments
    }

    const filters: AppointmentFilters = {
      status,
      type,
      clinic_id,
      staff_id,
      pet_id,
      // Only set owner_id for non-admin users or when explicitly filtering
      owner_id: req.user.role === UserRole.ADMIN ? owner_id : owner_id || req.user.id,
      date_from: date_from ? new Date(date_from) : undefined,
      date_to: date_to ? new Date(date_to) : undefined,
      is_telemedicine,
      search,
    };

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10000;

    const result = await this.appointmentsService.findAll(filters, pageNum, limitNum);
    const transformedData = this.exportService.transformAppointmentData(result.appointments);

    await this.exportService.exportData(transformedData, 'csv', 'appointments', res);
  }

  @Get('export/excel')
  @Roles(UserRole.ADMIN, UserRole.CLINIC_ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Export appointments to Excel',
    description: 'Export all appointments to Excel format with optional filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10000)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AppointmentStatus,
    description: 'Filter by appointment status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: AppointmentType,
    description: 'Filter by appointment type',
  })
  @ApiQuery({
    name: 'clinic_id',
    required: false,
    type: String,
    description: 'Filter by clinic ID',
  })
  @ApiQuery({
    name: 'staff_id',
    required: false,
    type: String,
    description: 'Filter by staff ID',
  })
  @ApiQuery({
    name: 'pet_id',
    required: false,
    type: String,
    description: 'Filter by pet ID',
  })
  @ApiQuery({
    name: 'owner_id',
    required: false,
    type: String,
    description: 'Filter by owner ID (admin only)',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Filter by start date (ISO string)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Filter by end date (ISO string)',
  })
  @ApiQuery({
    name: 'is_telemedicine',
    required: false,
    type: Boolean,
    description: 'Filter by telemedicine appointments',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in pet name, owner name, or notes',
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
  async exportAppointmentsToExcel(
    @Res() res: Response,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('type') type?: AppointmentType,
    @Query('clinic_id') clinic_id?: string,
    @Query('staff_id') staff_id?: string,
    @Query('pet_id') pet_id?: string,
    @Query('owner_id') owner_id?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('is_telemedicine') is_telemedicine?: boolean,
    @Query('search') search?: string
  ) {
    // Only allow admins to filter by owner_id
    if (owner_id && req.user.role !== UserRole.ADMIN) {
      owner_id = req.user.id; // Force to current user's appointments
    }

    const filters: AppointmentFilters = {
      status,
      type,
      clinic_id,
      staff_id,
      pet_id,
      // Only set owner_id for non-admin users or when explicitly filtering
      owner_id: req.user.role === UserRole.ADMIN ? owner_id : owner_id || req.user.id,
      date_from: date_from ? new Date(date_from) : undefined,
      date_to: date_to ? new Date(date_to) : undefined,
      is_telemedicine,
      search,
    };

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10000;

    const result = await this.appointmentsService.findAll(filters, pageNum, limitNum);
    const transformedData = this.exportService.transformAppointmentData(result.appointments);

    await this.exportService.exportData(transformedData, 'excel', 'appointments', res);
  }
}
