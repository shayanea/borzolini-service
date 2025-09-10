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

    // Get current date for realistic scheduling
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const appointmentData: AppointmentData[] = [
      // Past appointments (completed) - Real medical issues
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Buddy',
        owner_email: 'john.doe@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.COMPLETED,
        scheduled_date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        duration_minutes: 45,
        notes: 'Annual wellness checkup completed. Golden Retriever showing signs of early hip dysplasia. X-rays taken, joint supplements prescribed. Weight management plan discussed.',
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
        scheduled_date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
        duration_minutes: 30,
        notes: 'Core vaccinations administered successfully. Domestic Shorthair cat showing signs of dental tartar buildup. Dental cleaning recommended for next visit.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Max',
        owner_email: 'jane.smith@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.COMPLETED,
        scheduled_date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
        duration_minutes: 45,
        notes: 'Labrador Retriever presenting with chronic ear infections. Otitis externa diagnosed, medicated ear drops prescribed. Allergy testing recommended.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Whiskers',
        owner_email: 'jane.smith@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Dental Cleaning',
        appointment_type: AppointmentType.DENTAL_CLEANING,
        status: AppointmentStatus.COMPLETED,
        scheduled_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        duration_minutes: 60,
        notes: 'Persian cat dental cleaning completed. Severe gingivitis found, two teeth extracted. Antibiotics prescribed, follow-up in 2 weeks.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Rocky',
        owner_email: 'mike.brown@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Emergency Care',
        appointment_type: AppointmentType.EMERGENCY,
        status: AppointmentStatus.COMPLETED,
        scheduled_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        duration_minutes: 90,
        notes: 'German Shepherd emergency visit for acute gastric dilatation-volvulus (bloat). Emergency surgery performed successfully. Recovery monitoring required.',
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
        scheduled_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        duration_minutes: 45,
        notes: 'Cavalier King Charles Spaniel annual checkup with focus on heart murmur monitoring. Breed-specific cardiac screening scheduled.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Shadow',
        owner_email: 'alex.chen@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Vaccination',
        appointment_type: AppointmentType.VACCINATION,
        status: AppointmentStatus.CONFIRMED,
        scheduled_date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        duration_minutes: 30,
        notes: 'Border Collie annual vaccinations and working dog fitness assessment. Behavioral consultation for anxiety issues.',
        is_telemedicine: false,
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
        scheduled_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        duration_minutes: 45,
        notes: 'Ragdoll cat telemedicine consultation for chronic urinary tract issues. Behavioral assessment for inappropriate urination.',
        is_telemedicine: true,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Coco',
        owner_email: 'lisa.garcia@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.CONFIRMED,
        scheduled_date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
        duration_minutes: 45,
        notes: 'Chihuahua telemedicine consultation for dental care and weight management. Small breed health optimization plan.',
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
        scheduled_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        duration_minutes: 30,
        notes: 'Follow-up on ear infection treatment. Allergy testing results review and long-term management plan.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Whiskers',
        owner_email: 'jane.smith@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        duration_minutes: 30,
        notes: 'Post-dental surgery follow-up. Check healing progress and adjust pain management if needed.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Rocky',
        owner_email: 'mike.brown@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
        duration_minutes: 45,
        notes: 'Post-surgery follow-up for bloat recovery. Monitor healing, adjust diet, and assess return to normal activity.',
        is_telemedicine: false,
      },

      // Future appointments (1-2 months ahead) - All at Borzolini Clinic
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Buddy',
        owner_email: 'john.doe@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: oneMonthFromNow.toISOString(),
        duration_minutes: 45,
        notes: 'Hip dysplasia monitoring follow-up. X-ray review and joint health assessment. Physical therapy evaluation.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Luna',
        owner_email: 'john.doe@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Dental Cleaning',
        appointment_type: AppointmentType.DENTAL_CLEANING,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(oneMonthFromNow.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        notes: 'Scheduled dental cleaning for tartar removal. Pre-anesthetic blood work required.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Bella',
        owner_email: 'sarah.wilson@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(oneMonthFromNow.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        notes: 'Cardiac screening follow-up for Cavalier King Charles Spaniel. Echocardiogram and heart monitoring.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Oliver',
        owner_email: 'sarah.wilson@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(oneMonthFromNow.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        notes: 'Maine Coon growth monitoring and health assessment. Large breed cat development evaluation.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Shadow',
        owner_email: 'alex.chen@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(oneMonthFromNow.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        notes: 'Border Collie behavioral consultation follow-up. Anxiety management plan review and adjustment.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Mittens',
        owner_email: 'alex.chen@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(oneMonthFromNow.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        notes: 'Ragdoll cat urinary tract health follow-up. Monitor for recurring UTI symptoms and dietary adjustments.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Coco',
        owner_email: 'lisa.garcia@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(oneMonthFromNow.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        notes: 'Chihuahua weight management follow-up. Small breed nutrition consultation and exercise plan.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Simba',
        owner_email: 'lisa.garcia@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(oneMonthFromNow.getTime() + 24 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        notes: 'Siamese cat vocal behavior assessment. Breed-specific health screening and behavioral evaluation.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Duke',
        owner_email: 'david.miller@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(oneMonthFromNow.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        notes: 'Great Dane bloat prevention monitoring. Large breed health assessment and dietary consultation.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Princess',
        owner_email: 'david.miller@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: twoMonthsFromNow.toISOString(),
        duration_minutes: 45,
        notes: 'British Shorthair coat care consultation. Dense coat maintenance and grooming recommendations.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Buddy',
        owner_email: 'john.doe@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Vaccination',
        appointment_type: AppointmentType.VACCINATION,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(twoMonthsFromNow.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 30,
        notes: 'Annual booster vaccinations and comprehensive health check. Senior dog wellness panel.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Max',
        owner_email: 'jane.smith@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(twoMonthsFromNow.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        notes: 'Labrador Retriever allergy management follow-up. Environmental allergy testing and immunotherapy planning.',
        is_telemedicine: false,
      },
      {
        clinic_name: 'Borzolini Pet Clinic',
        pet_name: 'Rocky',
        owner_email: 'mike.brown@example.com',
        staff_email: 'dr.smith@borzolini.com',
        service_name: 'Wellness Exam',
        appointment_type: AppointmentType.WELLNESS_EXAM,
        status: AppointmentStatus.PENDING,
        scheduled_date: new Date(twoMonthsFromNow.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        notes: 'German Shepherd post-surgery recovery assessment. Return to full activity evaluation and long-term health plan.',
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
