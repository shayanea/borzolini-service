import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { QueryUtils, ValidationUtils } from '../../common/utils';

import { ClinicService } from '../clinics/entities/clinic-service.entity';
import { ClinicStaff } from '../clinics/entities/clinic-staff.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { Pet } from '../pets/entities/pet.entity';
import { SettingsConfigService } from '../settings/settings-config.service';
import { User } from '../users/entities/user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, AppointmentPriority, AppointmentStatus, AppointmentType } from './entities/appointment.entity';

export interface AppointmentFilters {
  status?: AppointmentStatus | undefined;
  type?: AppointmentType | undefined;
  clinic_id?: string | undefined;
  staff_id?: string | undefined;
  pet_id?: string | undefined;
  owner_id?: string | undefined;
  date_from?: Date | undefined;
  date_to?: Date | undefined;
  is_telemedicine?: boolean | undefined;
  search?: string | undefined;
}

export interface AppointmentStats {
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  byType: Record<AppointmentType, number>;
  telemedicine: number;
  averageDuration: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  appointmentId?: string | undefined;
}

export interface CalendarStaffGroup {
  staff_id: string | null;
  staff_name?: string | undefined;
  appointments: Appointment[];
}

export interface CalendarDayGroup {
  date: string; // YYYY-MM-DD
  staff: CalendarStaffGroup[];
}

export interface CalendarViewResponse {
  days: CalendarDayGroup[];
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(ClinicStaff)
    private readonly staffRepository: Repository<ClinicStaff>,
    @InjectRepository(ClinicService)
    private readonly serviceRepository: Repository<ClinicService>,
    private readonly settingsConfigService: SettingsConfigService
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, ownerId: string): Promise<Appointment> {
    // Verify owner exists
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    // Verify pet exists and belongs to owner
    const pet = await this.petRepository.findOne({
      where: { id: createAppointmentDto.pet_id, owner_id: ownerId },
    });
    if (!pet) {
      throw new NotFoundException(`Pet not found or does not belong to you`);
    }

    // Verify clinic exists
    const clinic = await this.clinicRepository.findOne({
      where: { id: createAppointmentDto.clinic_id },
    });
    if (!clinic) {
      throw new NotFoundException(`Clinic not found`);
    }

    // Verify staff if provided
    if (createAppointmentDto.staff_id) {
      const staff = await this.staffRepository.findOne({
        where: {
          id: createAppointmentDto.staff_id,
          clinic_id: createAppointmentDto.clinic_id,
        },
      });
      if (!staff) {
        throw new NotFoundException(`Staff member not found at this clinic`);
      }
    }

    // Verify service if provided
    if (createAppointmentDto.service_id) {
      const service = await this.serviceRepository.findOne({
        where: {
          id: createAppointmentDto.service_id,
          clinic_id: createAppointmentDto.clinic_id,
        },
      });
      if (!service) {
        throw new NotFoundException(`Service not found at this clinic`);
      }
    }

    // Check for scheduling conflicts
    const scheduledDate = new Date(createAppointmentDto.scheduled_date);
    const duration = createAppointmentDto.duration_minutes || (await this.settingsConfigService.getDefaultAppointmentDuration());
    const endTime = new Date(scheduledDate.getTime() + duration * 60000);

    // Validate booking lead time
    const bookingValidation = await this.settingsConfigService.canBookAppointment(scheduledDate);
    if (!bookingValidation.canBook) {
      throw new BadRequestException(bookingValidation.reason);
    }

    const conflicts = await this.appointmentRepository.find({
      where: [
        {
          pet_id: createAppointmentDto.pet_id,
          status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
          scheduled_date: Between(scheduledDate, endTime),
        },
        {
          pet_id: createAppointmentDto.pet_id,
          status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
          scheduled_date: LessThan(scheduledDate),
          duration_minutes: MoreThan(0),
        },
      ],
    });

    if (conflicts.length > 0) {
      throw new ConflictException(`Appointment conflicts with existing appointment at ${conflicts[0]?.scheduled_date || 'unknown time'}`);
    }

    // Create appointment
    const appointmentData = {
      appointment_type: createAppointmentDto.appointment_type,
      status: createAppointmentDto.status || AppointmentStatus.PENDING,
      priority: createAppointmentDto.priority || AppointmentPriority.NORMAL,
      scheduled_date: scheduledDate,
      duration_minutes: duration,
      notes: createAppointmentDto.notes || '',
      prescriptions: [],
      payment_status: 'pending',
      is_telemedicine: createAppointmentDto.is_telemedicine || false,
      is_home_visit: createAppointmentDto.is_home_visit || false,
      pet_anxiety_mode: createAppointmentDto.pet_anxiety_mode || false,
      reminder_settings: {},
      is_active: true,
      owner_id: ownerId,
      pet_id: createAppointmentDto.pet_id,
      clinic_id: createAppointmentDto.clinic_id,
    };

    const appointmentToCreate: Partial<Appointment> = {
      ...appointmentData,
      ...(createAppointmentDto.staff_id && { staff_id: createAppointmentDto.staff_id }),
      ...(createAppointmentDto.service_id && { service_id: createAppointmentDto.service_id }),
    };

    const appointment = this.appointmentRepository.create(appointmentToCreate);

    const savedAppointment = await this.appointmentRepository.save(appointment);
    this.logger.log(`Created appointment ${savedAppointment.id} for pet ${pet.name}`);

    return savedAppointment;
  }

  async findAll(
    filters?: AppointmentFilters,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'scheduled_date',
    sortOrder: 'ASC' | 'DESC' = 'ASC'
  ): Promise<{
    appointments: Appointment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Build query
    let query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.pet', 'pet')
      .leftJoinAndSelect('appointment.clinic', 'clinic')
      .leftJoinAndSelect('appointment.staff', 'staff')
      .leftJoinAndSelect('appointment.service', 'service');

    // Apply filters
    if (filters?.status) {
      query = query.andWhere('appointment.status = :status', { status: filters.status });
    }
    if (filters?.type) {
      query = query.andWhere('appointment.appointment_type = :type', { type: filters.type });
    }
    if (filters?.clinic_id) {
      query = query.andWhere('appointment.clinic_id = :clinicId', { clinicId: filters.clinic_id });
    }
    if (filters?.staff_id) {
      query = query.andWhere('appointment.staff_id = :staffId', { staffId: filters.staff_id });
    }
    if (filters?.pet_id) {
      query = query.andWhere('appointment.pet_id = :petId', { petId: filters.pet_id });
    }
    if (filters?.owner_id) {
      query = query.andWhere('appointment.owner_id = :ownerId', { ownerId: filters.owner_id });
    }
    if (filters?.is_telemedicine !== undefined) {
      query = query.andWhere('appointment.is_telemedicine = :isTelemedicine', { isTelemedicine: filters.is_telemedicine });
    }

    // Apply date filters
    if (filters?.date_from) {
      query = query.andWhere('appointment.scheduled_date >= :dateFrom', {
        dateFrom: filters.date_from,
      });
    }
    if (filters?.date_to) {
      query = query.andWhere('appointment.scheduled_date <= :dateTo', {
        dateTo: filters.date_to,
      });
    }

    // Apply search filter
    if (filters?.search) {
      query = query.andWhere('(pet.name ILIKE :search OR appointment.notes ILIKE :search)', { search: `%${filters.search}%` });
    }

    // Get total count
    const total = await query.getCount();

    // Apply sorting
    query = query.orderBy(`appointment.${sortBy}`, sortOrder);

    // Apply pagination
    const appointments = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      appointments,
      total,
      page,
      totalPages,
    };
  }

  async getCalendarView(filters: AppointmentFilters): Promise<CalendarViewResponse> {
    // Ensure required dates are present
    if (!filters?.date_from || !filters?.date_to) {
      throw new BadRequestException('date_from and date_to are required for calendar view');
    }

    // Fetch all matching appointments within range (high limit for calendar windows)
    const { appointments } = await this.findAll({ ...filters }, 1, 5000, 'scheduled_date', 'ASC');

    // Group by day (YYYY-MM-DD) then by staff
    const byDay: Map<string, Map<string | null, Appointment[]>> = new Map();

    for (const apt of appointments) {
      const d = new Date(apt.scheduled_date);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const staffKey = (apt as any).staff_id || null;

      if (!byDay.has(dayKey)) byDay.set(dayKey, new Map());
      const staffMap = byDay.get(dayKey)!;
      if (!staffMap.has(staffKey)) staffMap.set(staffKey, []);
      staffMap.get(staffKey)!.push(apt);
    }

    // Build response with optional staff names if relation is loaded
    const days: CalendarDayGroup[] = Array.from(byDay.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, staffMap]) => {
        const staff: CalendarStaffGroup[] = Array.from(staffMap.entries())
          .map(([staffId, apts]) => ({
            staff_id: staffId,
            staff_name: apts[0]?.staff ? `${(apts[0] as any).staff.first_name || ''} ${(apts[0] as any).staff.last_name || ''}`.trim() : undefined,
            appointments: apts,
          }))
          .sort((a, b) => {
            if (a.staff_id === b.staff_id) return 0;
            if (a.staff_id === null) return 1; // null staff to the end
            if (b.staff_id === null) return -1;
            return String(a.staff_id).localeCompare(String(b.staff_id));
          });

        return { date, staff } as CalendarDayGroup;
      });

    return { days };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['clinic', 'staff', 'service', 'pet'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async findByOwner(ownerId: string): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { owner_id: ownerId },
      relations: ['pet', 'clinic', 'staff', 'service'],
      order: { scheduled_date: 'ASC' },
    });

    return appointments;
  }

  async findByPet(petId: string): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { pet_id: petId },
      relations: ['clinic', 'staff', 'service'],
      order: { scheduled_date: 'ASC' },
    });

    return appointments;
  }

  async findByClinic(clinicId: string, date?: Date): Promise<Appointment[]> {
    const where = QueryUtils.createWhereCondition({ clinic_id: clinicId }, 'scheduled_date', date);

    const findOptions = QueryUtils.createFindOptions<Appointment>(where, ['pet', 'staff', 'service'], 'scheduled_date', 'ASC');

    return this.appointmentRepository.find(findOptions);
  }

  async findByStaff(staffId: string, date?: Date): Promise<Appointment[]> {
    const where = QueryUtils.createWhereCondition({ staff_id: staffId }, 'scheduled_date', date);

    const findOptions = QueryUtils.createFindOptions<Appointment>(where, ['pet', 'clinic', 'service'], 'scheduled_date', 'ASC');

    return this.appointmentRepository.find(findOptions);
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, userId: string, userRole: string): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Check permissions
    ValidationUtils.checkPermission({
      userId,
      userRole,
      ownerId: appointment.owner_id,
      allowedRoles: ['admin', 'veterinarian', 'staff'],
      resourceName: 'appointments',
    });

    // Handle date conversion
    if (updateAppointmentDto.scheduled_date) {
      (updateAppointmentDto as any).scheduled_date = new Date(updateAppointmentDto.scheduled_date);
    }

    // Check for scheduling conflicts if date/time is being changed
    if (updateAppointmentDto.scheduled_date || updateAppointmentDto.duration_minutes) {
      const scheduledDate = (updateAppointmentDto.scheduled_date as any) || appointment.scheduled_date;
      const duration = updateAppointmentDto.duration_minutes || appointment.duration_minutes;
      const endTime = new Date(scheduledDate.getTime() + duration * 60000);

      const conflicts = await this.appointmentRepository.find({
        where: [
          {
            id: Not(id),
            pet_id: appointment.pet_id,
            status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
            scheduled_date: Between(scheduledDate as any, endTime),
          },
        ],
      });

      if (conflicts.length > 0) {
        throw new ConflictException(`Appointment conflicts with existing appointment`);
      }
    }

    Object.assign(appointment, updateAppointmentDto);
    const updatedAppointment = await this.appointmentRepository.save(appointment);

    this.logger.log(`Updated appointment ${id}`);
    return updatedAppointment;
  }

  async updateStatus(id: string, status: AppointmentStatus, userId: string, userRole: string): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Check permissions
    if (appointment.owner_id !== userId && !['admin', 'veterinarian', 'staff'].includes(userRole)) {
      throw new BadRequestException('You can only update your own appointments');
    }

    // Update status
    appointment.status = status;

    // Update status
    appointment.status = status;

    const updatedAppointment = await this.appointmentRepository.save(appointment);
    this.logger.log(`Updated appointment ${id} status to ${status}`);

    return updatedAppointment;
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const appointment = await this.findOne(id);

    // Check permissions
    if (appointment.owner_id !== userId && !['admin', 'veterinarian', 'staff'].includes(userRole)) {
      throw new BadRequestException('You can only cancel your own appointments');
    }

    // Check cancellation policy (only for non-admin users)
    if (!['admin', 'veterinarian', 'staff'].includes(userRole)) {
      const cancellationValidation = await this.settingsConfigService.canCancelAppointment(appointment.scheduled_date);
      if (!cancellationValidation.canCancel) {
        throw new BadRequestException(cancellationValidation.reason);
      }
    }

    // Cancel appointment
    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepository.save(appointment);

    this.logger.log(`Cancelled appointment ${id}`);
  }

  async getAppointmentStats(clinicId?: string): Promise<AppointmentStats> {
    // Use query builder for better performance with optional clinic filtering
    let queryBuilder = this.appointmentRepository.createQueryBuilder('appointment').select(['appointment.status', 'appointment.appointment_type', 'appointment.is_telemedicine', 'appointment.duration_minutes']);

    // Filter by clinic if clinicId provided
    if (clinicId) {
      queryBuilder = queryBuilder.where('appointment.clinic_id = :clinicId', { clinicId });
    }

    const appointments = await queryBuilder.getMany();

    const stats: AppointmentStats = {
      total: appointments.length,
      byStatus: {
        [AppointmentStatus.PENDING]: 0,
        [AppointmentStatus.CONFIRMED]: 0,
        [AppointmentStatus.IN_PROGRESS]: 0,
        [AppointmentStatus.COMPLETED]: 0,
        [AppointmentStatus.CANCELLED]: 0,
        [AppointmentStatus.NO_SHOW]: 0,
        [AppointmentStatus.RESCHEDULED]: 0,
        [AppointmentStatus.WAITING]: 0,
      },
      byType: {
        [AppointmentType.CONSULTATION]: 0,
        [AppointmentType.VACCINATION]: 0,
        [AppointmentType.SURGERY]: 0,
        [AppointmentType.FOLLOW_UP]: 0,
        [AppointmentType.EMERGENCY]: 0,
        [AppointmentType.WELLNESS_EXAM]: 0,
        [AppointmentType.DENTAL_CLEANING]: 0,
        [AppointmentType.LABORATORY_TEST]: 0,
        [AppointmentType.IMAGING]: 0,
        [AppointmentType.THERAPY]: 0,
        [AppointmentType.GROOMING]: 0,
        [AppointmentType.BEHAVIORAL_TRAINING]: 0,
        [AppointmentType.NUTRITION_CONSULTATION]: 0,
        [AppointmentType.PHYSICAL_THERAPY]: 0,
        [AppointmentType.SPECIALIST_CONSULTATION]: 0,
      },
      telemedicine: 0,
      averageDuration: 0,
    };

    let totalDuration = 0;
    let appointmentsWithDuration = 0;

    appointments.forEach((appointment) => {
      // Count by status
      stats.byStatus[appointment.status]++;

      // Count by type
      stats.byType[appointment.appointment_type]++;

      // Count special types
      if (appointment.is_telemedicine) stats.telemedicine++;

      // Calculate average duration
      if (appointment.duration_minutes) {
        totalDuration += appointment.duration_minutes;
        appointmentsWithDuration++;
      }
    });

    stats.averageDuration = appointmentsWithDuration > 0 ? Math.round(totalDuration / appointmentsWithDuration) : 0;

    return stats;
  }

  async getAvailableTimeSlots(clinicId: string, date: Date, duration: number = 30): Promise<TimeSlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(8, 0, 0, 0); // Start at 8 AM

    const endOfDay = new Date(date);
    endOfDay.setHours(18, 0, 0, 0); // End at 6 PM

    // Get existing appointments for the day
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        clinic_id: clinicId,
        scheduled_date: Between(startOfDay, endOfDay),
        status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
      },
      order: { scheduled_date: 'ASC' },
    });

    // Generate time slots
    const timeSlots: TimeSlot[] = [];
    const currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);

      if (slotEnd <= endOfDay) {
        const conflictingAppointment = existingAppointments.find((apt) => {
          const aptEnd = new Date(apt.scheduled_date.getTime() + apt.duration_minutes * 60000);
          return (currentTime >= apt.scheduled_date && currentTime < aptEnd) || (slotEnd > apt.scheduled_date && slotEnd <= aptEnd) || (currentTime <= apt.scheduled_date && slotEnd >= aptEnd);
        });

        timeSlots.push({
          start: new Date(currentTime),
          end: slotEnd,
          available: !conflictingAppointment,
          appointmentId: conflictingAppointment?.id,
        });
      }

      currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute intervals
    }

    return timeSlots;
  }

  async rescheduleAppointment(id: string, newDate: Date, userId: string, userRole: string): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Check permissions
    if (appointment.owner_id !== userId && !['admin', 'veterinarian', 'staff'].includes(userRole)) {
      throw new BadRequestException('You can only reschedule your own appointments');
    }

    // Check for conflicts
    const endTime = new Date(newDate.getTime() + appointment.duration_minutes * 60000);
    const conflicts = await this.appointmentRepository.find({
      where: [
        {
          id: Not(id),
          pet_id: appointment.pet_id,
          status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
          scheduled_date: Between(newDate, endTime),
        },
      ],
    });

    if (conflicts.length > 0) {
      throw new ConflictException(`New time conflicts with existing appointment`);
    }

    // Update appointment
    appointment.scheduled_date = newDate;
    appointment.status = AppointmentStatus.RESCHEDULED;
    appointment.updated_at = new Date();

    const updatedAppointment = await this.appointmentRepository.save(appointment);
    this.logger.log(`Rescheduled appointment ${id} to ${newDate}`);

    return updatedAppointment;
  }
}
