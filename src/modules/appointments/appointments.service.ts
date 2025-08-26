import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThan, MoreThan, In, Not } from "typeorm";

import {
  Appointment,
  AppointmentType,
  AppointmentStatus,
  AppointmentPriority,
} from "./entities/appointment.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { User } from "../users/entities/user.entity";
import { Pet } from "../pets/entities/pet.entity";
import { Clinic } from "../clinics/entities/clinic.entity";
import { ClinicStaff } from "../clinics/entities/clinic-staff.entity";
import { ClinicService } from "../clinics/entities/clinic-service.entity";

export interface AppointmentFilters {
  status?: AppointmentStatus | undefined;
  type?: AppointmentType | undefined;
  priority?: AppointmentPriority | undefined;
  clinic_id?: string | undefined;
  staff_id?: string | undefined;
  pet_id?: string | undefined;
  owner_id?: string | undefined;
  date_from?: Date | undefined;
  date_to?: Date | undefined;
  is_telemedicine?: boolean | undefined;
  is_home_visit?: boolean | undefined;
  search?: string | undefined;
}

export interface AppointmentStats {
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  byType: Record<AppointmentType, number>;
  byPriority: Record<AppointmentPriority, number>;
  today: number;
  upcoming: number;
  overdue: number;
  telemedicine: number;
  homeVisits: number;
  averageDuration: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  appointmentId?: string | undefined;
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
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    ownerId: string,
  ): Promise<Appointment> {
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
    const duration = createAppointmentDto.duration_minutes || 30;
    const endTime = new Date(scheduledDate.getTime() + duration * 60000);

    const conflicts = await this.appointmentRepository.find({
      where: [
        {
          pet_id: createAppointmentDto.pet_id,
          status: In([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.WAITING,
          ]),
          scheduled_date: Between(scheduledDate, endTime),
        },
        {
          pet_id: createAppointmentDto.pet_id,
          status: In([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.WAITING,
          ]),
          scheduled_date: LessThan(scheduledDate),
          duration_minutes: MoreThan(0),
        },
      ],
    });

    if (conflicts.length > 0) {
      throw new ConflictException(
        `Appointment conflicts with existing appointment at ${conflicts[0]?.scheduled_date || "unknown time"}`,
      );
    }

    // Create appointment
    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      owner_id: ownerId,
      scheduled_date: scheduledDate,
      status: createAppointmentDto.status || AppointmentStatus.PENDING,
      priority: createAppointmentDto.priority || AppointmentPriority.NORMAL,
      duration_minutes: duration,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);
    this.logger.log(
      `Created appointment ${savedAppointment.id} for pet ${pet.name}`,
    );

    return savedAppointment;
  }

  async findAll(
    filters?: AppointmentFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    appointments: Appointment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: any = { is_active: true };

    // Apply filters
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.appointment_type = filters.type;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.clinic_id) where.clinic_id = filters.clinic_id;
    if (filters?.staff_id) where.staff_id = filters.staff_id;
    if (filters?.pet_id) where.pet_id = filters.pet_id;
    if (filters?.owner_id) where.owner_id = filters.owner_id;
    if (filters?.is_telemedicine !== undefined)
      where.is_telemedicine = filters.is_telemedicine;
    if (filters?.is_home_visit !== undefined)
      where.is_home_visit = filters.is_home_visit;

    // Build query
    let query = this.appointmentRepository
      .createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.owner", "owner")
      .leftJoinAndSelect("appointment.pet", "pet")
      .leftJoinAndSelect("appointment.clinic", "clinic")
      .leftJoinAndSelect("appointment.staff", "staff")
      .leftJoinAndSelect("appointment.service", "service")
      .where(where);

    // Apply date filters
    if (filters?.date_from) {
      query = query.andWhere("appointment.scheduled_date >= :dateFrom", {
        dateFrom: filters.date_from,
      });
    }
    if (filters?.date_to) {
      query = query.andWhere("appointment.scheduled_date <= :dateTo", {
        dateTo: filters.date_to,
      });
    }

    // Apply search filter
    if (filters?.search) {
      query = query.andWhere(
        "(pet.name ILIKE :search OR owner.first_name ILIKE :search OR owner.last_name ILIKE :search OR appointment.notes ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const appointments = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("appointment.scheduled_date", "ASC")
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      appointments,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, is_active: true },
      relations: ["owner", "pet", "clinic", "staff", "service"],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async findByOwner(ownerId: string): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { owner_id: ownerId, is_active: true },
      relations: ["pet", "clinic", "staff", "service"],
      order: { scheduled_date: "ASC" },
    });

    return appointments;
  }

  async findByPet(petId: string): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { pet_id: petId, is_active: true },
      relations: ["owner", "clinic", "staff", "service"],
      order: { scheduled_date: "ASC" },
    });

    return appointments;
  }

  async findByClinic(clinicId: string, date?: Date): Promise<Appointment[]> {
    const where: any = { clinic_id: clinicId, is_active: true };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.scheduled_date = Between(startOfDay, endOfDay);
    }

    const appointments = await this.appointmentRepository.find({
      where,
      relations: ["owner", "pet", "staff", "service"],
      order: { scheduled_date: "ASC" },
    });

    return appointments;
  }

  async findByStaff(staffId: string, date?: Date): Promise<Appointment[]> {
    const where: any = { staff_id: staffId, is_active: true };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.scheduled_date = Between(startOfDay, endOfDay);
    }

    const appointments = await this.appointmentRepository.find({
      where,
      relations: ["owner", "pet", "clinic", "service"],
      order: { scheduled_date: "ASC" },
    });

    return appointments;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    userId: string,
    userRole: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Check permissions
    if (
      appointment.owner_id !== userId &&
      !["admin", "veterinarian", "staff"].includes(userRole)
    ) {
      throw new BadRequestException(
        "You can only update your own appointments",
      );
    }

    // Handle date conversion
    if (updateAppointmentDto.scheduled_date) {
      (updateAppointmentDto as any).scheduled_date = new Date(
        updateAppointmentDto.scheduled_date,
      );
    }

    // Check for scheduling conflicts if date/time is being changed
    if (
      updateAppointmentDto.scheduled_date ||
      updateAppointmentDto.duration_minutes
    ) {
      const scheduledDate =
        (updateAppointmentDto.scheduled_date as any) ||
        appointment.scheduled_date;
      const duration =
        updateAppointmentDto.duration_minutes || appointment.duration_minutes;
      const endTime = new Date(scheduledDate.getTime() + duration * 60000);

      const conflicts = await this.appointmentRepository.find({
        where: [
          {
            id: Not(id),
            pet_id: appointment.pet_id,
            status: In([
              AppointmentStatus.PENDING,
              AppointmentStatus.CONFIRMED,
              AppointmentStatus.WAITING,
            ]),
            scheduled_date: Between(scheduledDate as any, endTime),
          },
        ],
      });

      if (conflicts.length > 0) {
        throw new ConflictException(
          `Appointment conflicts with existing appointment`,
        );
      }
    }

    Object.assign(appointment, updateAppointmentDto);
    const updatedAppointment =
      await this.appointmentRepository.save(appointment);

    this.logger.log(`Updated appointment ${id}`);
    return updatedAppointment;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    userId: string,
    userRole: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Check permissions
    if (
      appointment.owner_id !== userId &&
      !["admin", "veterinarian", "staff"].includes(userRole)
    ) {
      throw new BadRequestException(
        "You can only update your own appointments",
      );
    }

    // Update status
    appointment.status = status;

    // Set actual times based on status
    if (
      status === AppointmentStatus.IN_PROGRESS &&
      !appointment.actual_start_time
    ) {
      appointment.actual_start_time = new Date();
    } else if (
      status === AppointmentStatus.COMPLETED &&
      !appointment.actual_end_time
    ) {
      appointment.actual_end_time = new Date();
    }

    const updatedAppointment =
      await this.appointmentRepository.save(appointment);
    this.logger.log(`Updated appointment ${id} status to ${status}`);

    return updatedAppointment;
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const appointment = await this.findOne(id);

    // Check permissions
    if (
      appointment.owner_id !== userId &&
      !["admin", "veterinarian", "staff"].includes(userRole)
    ) {
      throw new BadRequestException(
        "You can only cancel your own appointments",
      );
    }

    // Soft delete by setting is_active to false
    appointment.is_active = false;
    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepository.save(appointment);

    this.logger.log(`Cancelled appointment ${id}`);
  }

  async getAppointmentStats(): Promise<AppointmentStats> {
    const appointments = await this.appointmentRepository.find({
      where: { is_active: true },
    });

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
      byPriority: {
        [AppointmentPriority.LOW]: 0,
        [AppointmentPriority.NORMAL]: 0,
        [AppointmentPriority.HIGH]: 0,
        [AppointmentPriority.URGENT]: 0,
        [AppointmentPriority.EMERGENCY]: 0,
      },
      today: 0,
      upcoming: 0,
      overdue: 0,
      telemedicine: 0,
      homeVisits: 0,
      averageDuration: 0,
    };

    let totalDuration = 0;
    let appointmentsWithDuration = 0;

    appointments.forEach((appointment) => {
      // Count by status
      stats.byStatus[appointment.status]++;

      // Count by type
      stats.byType[appointment.appointment_type]++;

      // Count by priority
      stats.byPriority[appointment.priority]++;

      // Count special types
      if (appointment.is_telemedicine) stats.telemedicine++;
      if (appointment.is_home_visit) stats.homeVisits++;

      // Count by date
      if (appointment.isToday) stats.today++;
      if (appointment.isUpcoming) stats.upcoming++;
      if (appointment.isOverdue) stats.overdue++;

      // Calculate average duration
      if (appointment.duration_minutes) {
        totalDuration += appointment.duration_minutes;
        appointmentsWithDuration++;
      }
    });

    stats.averageDuration =
      appointmentsWithDuration > 0
        ? Math.round(totalDuration / appointmentsWithDuration)
        : 0;

    return stats;
  }

  async getAvailableTimeSlots(
    clinicId: string,
    date: Date,
    duration: number = 30,
  ): Promise<TimeSlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(8, 0, 0, 0); // Start at 8 AM

    const endOfDay = new Date(date);
    endOfDay.setHours(18, 0, 0, 0); // End at 6 PM

    // Get existing appointments for the day
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        clinic_id: clinicId,
        scheduled_date: Between(startOfDay, endOfDay),
        status: In([
          AppointmentStatus.PENDING,
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.WAITING,
        ]),
        is_active: true,
      },
      order: { scheduled_date: "ASC" },
    });

    // Generate time slots
    const timeSlots: TimeSlot[] = [];
    const currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);

      if (slotEnd <= endOfDay) {
        const conflictingAppointment = existingAppointments.find((apt) => {
          const aptEnd = new Date(
            apt.scheduled_date.getTime() + apt.duration_minutes * 60000,
          );
          return (
            (currentTime >= apt.scheduled_date && currentTime < aptEnd) ||
            (slotEnd > apt.scheduled_date && slotEnd <= aptEnd) ||
            (currentTime <= apt.scheduled_date && slotEnd >= aptEnd)
          );
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

  async rescheduleAppointment(
    id: string,
    newDate: Date,
    userId: string,
    userRole: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Check permissions
    if (
      appointment.owner_id !== userId &&
      !["admin", "veterinarian", "staff"].includes(userRole)
    ) {
      throw new BadRequestException(
        "You can only reschedule your own appointments",
      );
    }

    // Check for conflicts
    const endTime = new Date(
      newDate.getTime() + appointment.duration_minutes * 60000,
    );
    const conflicts = await this.appointmentRepository.find({
      where: [
        {
          id: Not(id),
          pet_id: appointment.pet_id,
          status: In([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.WAITING,
          ]),
          scheduled_date: Between(newDate, endTime),
        },
      ],
    });

    if (conflicts.length > 0) {
      throw new ConflictException(
        `New time conflicts with existing appointment`,
      );
    }

    // Update appointment
    appointment.scheduled_date = newDate;
    appointment.status = AppointmentStatus.RESCHEDULED;
    appointment.updated_at = new Date();

    const updatedAppointment =
      await this.appointmentRepository.save(appointment);
    this.logger.log(`Rescheduled appointment ${id} to ${newDate}`);

    return updatedAppointment;
  }
}
