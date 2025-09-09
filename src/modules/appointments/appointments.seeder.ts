import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicService } from '../clinics/entities/clinic-service.entity';
import { ClinicStaff } from '../clinics/entities/clinic-staff.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { Pet } from '../pets/entities/pet.entity';
import { User } from '../users/entities/user.entity';
import { Appointment, AppointmentPriority, AppointmentStatus, AppointmentType } from './entities/appointment.entity';

interface AppointmentData {
  clinic_name: string;
  pet_name: string;
  owner_email: string;
  staff_email: string;
  service_name: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  scheduled_date: string;
  duration_minutes: number;
  notes: string;
  is_telemedicine: boolean;
  address?: string;
}

@Injectable()
export class AppointmentsSeeder {
  private readonly logger = new Logger(AppointmentsSeeder.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(ClinicStaff)
    private readonly clinicStaffRepository: Repository<ClinicStaff>,
    @InjectRepository(ClinicService)
    private readonly clinicServiceRepository: Repository<ClinicService>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting appointments seeding...');

    try {
      // Clear existing appointments first for fresh data
      await this.clear();

      // Validate that required data exists
      const requiredData = await this.validateRequiredData();
      if (!requiredData) {
        throw new Error('Required data not found. Please run users, clinics, and pets seeders first.');
      }

      this.logger.log('Creating sample appointments...');
      const appointments = await this.createSampleAppointments(requiredData);

      this.logger.log(`✅ Appointments seeding completed! Created ${appointments.length} appointments`);
    } catch (error) {
      this.logger.error('❌ Error seeding appointments:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async validateRequiredData(): Promise<{
    clinics: Clinic[];
    pets: Pet[];
    staff: ClinicStaff[];
    services: ClinicService[];
    users: User[];
  } | null> {
    try {
      const clinics = await this.clinicRepository.find({ where: { is_active: true } });
      const pets = await this.petRepository.find({ where: { is_active: true } });
      const staff = await this.clinicStaffRepository.find({ where: { is_active: true } });
      const services = await this.clinicServiceRepository.find({ where: { is_active: true } });
      const users = await this.userRepository.find();

      if (clinics.length === 0 || pets.length === 0 || staff.length === 0 || services.length === 0) {
        this.logger.warn('Insufficient data for appointment creation');
        this.logger.warn(`Found: ${clinics.length} clinics, ${pets.length} pets, ${staff.length} staff, ${services.length} services`);
        return null;
      }

      return { clinics, pets, staff, services, users };
    } catch (error) {
      this.logger.error('Error validating required data:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private async createSampleAppointments(requiredData: { clinics: Clinic[]; pets: Pet[]; staff: ClinicStaff[]; services: ClinicService[]; users: User[] }): Promise<Appointment[]> {
    const { clinics, pets, staff, services, users } = requiredData;
    const appointmentData: AppointmentData[] = [
      // Past appointments (completed)
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Buddy',
        owner_email: 'john.doe@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.COMPLETED,
        scheduled_date: '2024-01-10T10:00:00Z',
        duration_minutes: 45,
        notes: 'Annual wellness checkup completed. Pet is healthy, vaccinations up to date.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Luna',
        owner_email: 'john.doe@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Vaccination',
        appointment_type: AppointmentType.VACCINATION,
        status: AppointmentStatus.COMPLETED,
        scheduled_date: '2024-01-12T11:00:00Z',
        duration_minutes: 30,
        notes: 'Core vaccinations administered successfully. Microchip verified.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Happy Paws Veterinary Center',
        pet_name: 'Max',
        owner_email: 'jane.smith@example.com',
        staff_email: 'dr.johnson@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.COMPLETED,
        scheduled_date: '2024-01-15T14:00:00Z',
        duration_minutes: 45,
        notes: 'Hip dysplasia monitoring. X-rays show mild arthritis, joint supplements recommended.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Whiskers',
        owner_email: 'jane.smith@example.com',
        staff_email: 'dr.johnson@borzolini.com',
        service_name: 'Dental Cleaning',
        appointment_type: AppointmentType.DENTAL_CLEANING,
        status: AppointmentStatus.COMPLETED,
        scheduled_date: '2024-01-18T13:00:00Z',
        duration_minutes: 60,
        notes: 'Professional dental cleaning completed. Eye care routine reviewed.',
        is_telemedicine: false,
      },

      // Current appointments (confirmed/in-progress)
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Bella',
        owner_email: 'sarah.wilson@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.CONFIRMED,
        scheduled_date: '2024-01-25T09:00:00Z',
        duration_minutes: 45,
        notes: 'Annual wellness checkup, heart monitoring due to breed predisposition',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Happy Paws Veterinary Center',
        pet_name: 'Shadow',
        owner_email: 'alex.chen@example.com',
        staff_email: 'dr.johnson@borzolini.com',
        service_name: 'Vaccination',
        appointment_type: AppointmentType.VACCINATION,
        status: AppointmentStatus.CONFIRMED,
        scheduled_date: '2024-01-26T15:00:00Z',
        duration_minutes: 30,
        notes: 'Annual vaccinations, working dog fitness assessment',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Emergency Pet Hospital',
        pet_name: 'Rocky',
        owner_email: 'mike.brown@example.com',
        staff_email: 'dr.garcia@borzolini.com',
        service_name: 'Emergency Care',
        appointment_type: AppointmentType.EMERGENCY,
        status: AppointmentStatus.IN_PROGRESS,
        scheduled_date: '2024-01-24T22:30:00Z',
        duration_minutes: 90,
        notes: 'Emergency consultation for service dog training injury. X-rays taken.',
        is_telemedicine: false,
        address: 'Home visit - 789 Pine Street, Chicago, IL 60602',
      },

      // Telemedicine appointments
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Mittens',
        owner_email: 'alex.chen@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.CONFIRMED,
        scheduled_date: '2024-01-27T16:00:00Z',
        duration_minutes: 45,
        notes: 'Telemedicine wellness checkup, behavioral consultation for separation anxiety',
        is_telemedicine: true,
      },
      {
        clinic_name: 'Coastal Veterinary Clinic',
        pet_name: 'Coco',
        owner_email: 'lisa.garcia@example.com',
        staff_email: 'dr.wilson@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.CONFIRMED,
        scheduled_date: '2024-01-28T14:00:00Z',
        duration_minutes: 45,
        notes: 'Telemedicine consultation for small breed dental care',
        is_telemedicine: true,
      },

      // Follow-up appointments
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Max',
        owner_email: 'jane.smith@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.PENDING,
        scheduled_date: '2024-02-05T14:30:00Z',
        duration_minutes: 30,
        notes: 'Follow-up on hip dysplasia treatment, review exercise recommendations',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Pacific Northwest Animal Hospital',
        pet_name: 'Duke',
        owner_email: 'david.miller@example.com',
        staff_email: 'dr.brown@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.PENDING,
        scheduled_date: '2024-02-08T10:00:00Z',
        duration_minutes: 45,
        notes: 'Follow-up on bloat monitoring, review joint health supplements',
        is_telemedicine: false,
      },

      // Upcoming appointments
      {
        clinic_name: 'Happy Paws Veterinary Center',
        pet_name: 'Buddy',
        owner_email: 'john.doe@example.com',
        staff_email: 'dr.johnson@borzolini.com',
        service_name: 'Vaccination',
        appointment_type: AppointmentType.VACCINATION,
        status: AppointmentStatus.PENDING,
        scheduled_date: '2024-02-12T10:00:00Z',
        duration_minutes: 30,
        notes: 'Booster vaccinations, health check and weight monitoring',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Oliver',
        owner_email: 'sarah.wilson@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Dental Cleaning',
        appointment_type: AppointmentType.DENTAL_CLEANING,
        status: AppointmentStatus.PENDING,
        scheduled_date: '2024-02-15T10:00:00Z',
        duration_minutes: 60,
        notes: 'Dental cleaning for large breed cat, monitoring growth',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Coastal Veterinary Clinic',
        pet_name: 'Simba',
        owner_email: 'lisa.garcia@example.com',
        staff_email: 'dr.wilson@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: '2024-02-18T09:00:00Z',
        duration_minutes: 45,
        notes: 'Annual wellness checkup for Siamese cat, vocal behavior assessment',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Pacific Northwest Animal Hospital',
        pet_name: 'Princess',
        owner_email: 'david.miller@example.com',
        staff_email: 'dr.brown@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: '2024-02-20T11:00:00Z',
        duration_minutes: 45,
        notes: 'Holistic wellness checkup, coat care recommendations',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Emergency Pet Hospital',
        pet_name: 'Rocky',
        owner_email: 'mike.brown@example.com',
        staff_email: 'dr.garcia@borzolini.com',
        service_name: 'Emergency Care',
        appointment_type: AppointmentType.EMERGENCY,
        status: AppointmentStatus.PENDING,
        scheduled_date: '2024-02-22T20:00:00Z',
        duration_minutes: 90,
        notes: 'Follow-up emergency visit for service dog injury recovery',
        is_telemedicine: false,
      },
    ];

    const appointments: Appointment[] = [];
    for (const data of appointmentData) {
      try {
        // Find the required entities
        const clinic = clinics.find((c: Clinic) => c.name === data.clinic_name);
        const pet = pets.find((p: Pet) => p.name === data.pet_name);
        const owner = users.find((u: User) => u.email === data.owner_email);
        const staffMember = staff.find((s: ClinicStaff) => s.user_id === users.find((u: User) => u.email === data.staff_email)?.id);
        const service = services.find((s: ClinicService) => s.name === data.service_name);

        if (!clinic || !pet || !owner || !staffMember || !service) {
          this.logger.warn(`Required data not found for appointment: ${data.pet_name} - ${data.appointment_type}`);
          continue;
        }

        // Create appointment data
        const appointmentDataToSave: Partial<Appointment> = {
          clinic_id: clinic.id,
          pet_id: pet.id,
          owner_id: owner.id,
          staff_id: staffMember.id,
          service_id: service.id,
          appointment_type: data.appointment_type,
          status: data.status,
          priority: AppointmentPriority.NORMAL,
          scheduled_date: new Date(data.scheduled_date),
          duration_minutes: data.duration_minutes,
          notes: data.notes,
          prescriptions: [],
          payment_status: 'pending',
          is_telemedicine: data.is_telemedicine,
          is_home_visit: data.address ? true : false,
          ...(data.address && { home_visit_address: data.address }),
          reminder_settings: {},
          is_active: true,
        };

        const appointment = this.appointmentRepository.create(appointmentDataToSave);
        const savedAppointment = await this.appointmentRepository.save(appointment);

        // Ensure we're working with a single appointment, not an array
        const appointmentToAdd = Array.isArray(savedAppointment) ? savedAppointment[0] : savedAppointment;
        if (appointmentToAdd) {
          appointments.push(appointmentToAdd);
        }

        this.logger.log(`Created appointment: ${data.pet_name} - ${data.appointment_type} at ${clinic.name}`);
      } catch (error) {
        this.logger.error(`Failed to create appointment for ${data.pet_name}:`, error);
        throw error;
      }
    }

    return appointments;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing all appointments...');
    try {
      // Use query builder to delete all records
      await this.appointmentRepository.createQueryBuilder().delete().execute();
      this.logger.log('All appointments cleared');
    } catch (error) {
      this.logger.error('Error clearing appointments:', error);
      throw error;
    }
  }
}
