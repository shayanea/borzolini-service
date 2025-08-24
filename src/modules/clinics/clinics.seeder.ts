import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';
import { ClinicStaff } from './entities/clinic-staff.entity';
import { ClinicService } from './entities/clinic-service.entity';
import { ClinicPhoto } from './entities/clinic-photo.entity';
import { ClinicOperatingHours } from './entities/clinic-operating-hours.entity';
import { StaffRole } from './entities/clinic-staff.entity';
import { ServiceCategory } from './entities/clinic-service.entity';
import { PhotoCategory } from './entities/clinic-photo.entity';
import { DayOfWeek } from './entities/clinic-operating-hours.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

interface ClinicData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  is_verified: boolean;
  is_active: boolean;
  services: string[];
  specializations: string[];
  payment_methods: string[];
  insurance_providers: string[];
  emergency_contact: string;
  emergency_phone: string;
  operating_hours: Record<string, { open: string; close: string; closed: boolean }>;
}

interface StaffData {
  clinic_id: string;
  user_id: string;
  role: StaffRole;
  specialization: string;
  license_number: string;
  experience_years: number;
  education: string[];
  bio: string;
  hire_date: string;
  is_active: boolean;
}

@Injectable()
export class ClinicsSeeder {
  private readonly logger = new Logger(ClinicsSeeder.name);

  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(ClinicStaff)
    private readonly clinicStaffRepository: Repository<ClinicStaff>,
    @InjectRepository(ClinicService)
    private readonly clinicServiceRepository: Repository<ClinicService>,
    @InjectRepository(ClinicPhoto)
    private readonly clinicPhotoRepository: Repository<ClinicPhoto>,
    @InjectRepository(ClinicOperatingHours)
    private readonly clinicOperatingHoursRepository: Repository<ClinicOperatingHours>,
    private readonly usersService: UsersService
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting clinics seeding...');

    try {
      // Validate database connection
      await this.validateDatabaseConnection();

      // Check if clinics already exist
      const existingClinics = await this.clinicRepository.count();
      if (existingClinics > 0) {
        this.logger.log('Clinics already seeded, skipping...');
        return;
      }

      // Validate that required users exist
      const requiredUsers = await this.validateRequiredUsers();
      if (!requiredUsers) {
        throw new Error('Required users not found. Please run users seeder first.');
      }

      this.logger.log('Creating sample clinics...');
      const clinics = await this.createSampleClinics();

      // Create sample staff, services, photos, and operating hours for each clinic
      for (const clinic of clinics) {
        this.logger.log(`Setting up clinic: ${clinic.name}`);

        await this.createSampleStaff(clinic.id, requiredUsers);
        await this.createSampleServices(clinic.id);
        await this.createSamplePhotos(clinic.id);
        await this.createSampleOperatingHours(clinic.id);
      }

      this.logger.log(`✅ Clinics seeding completed! Created ${clinics.length} clinics`);
    } catch (error) {
      this.logger.error('❌ Error seeding clinics:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async validateDatabaseConnection(): Promise<void> {
    try {
      await this.clinicRepository.query('SELECT 1');
      this.logger.log('Database connection validated');
    } catch (error) {
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async validateRequiredUsers(): Promise<{ admin: User; veterinarian: User; staff?: User } | null> {
    try {
      // Get all users and filter by role
      const allUsers = await this.usersService.findAll();
      const adminUsers = allUsers.filter((user) => user.role === UserRole.ADMIN && user.isActive);
      const veterinarianUsers = allUsers.filter((user) => user.role === UserRole.VETERINARIAN && user.isActive);
      const staffUsers = allUsers.filter((user) => user.role === UserRole.STAFF && user.isActive);

      if (adminUsers.length === 0 || veterinarianUsers.length === 0) {
        this.logger.warn('Insufficient users for clinic staff creation');
        this.logger.warn(`Found: ${adminUsers.length} admins, ${veterinarianUsers.length} veterinarians, ${staffUsers.length} staff`);
        return null;
      }

      // Return a mapping of user types for easy access
      const result: { admin: User; veterinarian: User; staff?: User } = {
        admin: adminUsers[0]!,
        veterinarian: veterinarianUsers[0]!,
      };

      // Add staff if available
      if (staffUsers[0]) {
        result.staff = staffUsers[0];
      } else if (veterinarianUsers[1]) {
        result.staff = veterinarianUsers[1];
      } else if (adminUsers[1]) {
        result.staff = adminUsers[1];
      }

      return result;
    } catch (error) {
      this.logger.error('Error validating required users:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private async createSampleClinics(): Promise<Clinic[]> {
    const clinicData: ClinicData[] = [
      {
        name: 'Borzolini Pet Clinic',
        description: 'Leading veterinary clinic providing comprehensive pet care with state-of-the-art facilities and experienced staff.',
        address: '123 Pet Care Avenue',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
        phone: '+1-555-0123',
        email: 'info@borzolini.com',
        website: 'https://borzolini.com',
        is_verified: true,
        is_active: true,
        services: ['vaccinations', 'surgery', 'dental_care', 'emergency_care', 'wellness_exams'],
        specializations: ['feline_medicine', 'canine_medicine', 'exotic_pets', 'emergency_medicine'],
        payment_methods: ['cash', 'credit_card', 'insurance'],
        insurance_providers: ['PetCare Insurance', 'VetHealth Plus'],
        emergency_contact: 'Dr. Smith',
        emergency_phone: '+1-555-9999',
        operating_hours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '10:00', close: '15:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true },
        },
      },
      {
        name: 'Happy Paws Veterinary Center',
        description: 'Family-friendly veterinary center specializing in preventive care and wellness programs.',
        address: '456 Animal Wellness Drive',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90210',
        country: 'USA',
        phone: '+1-555-0456',
        email: 'hello@happypaws.com',
        website: 'https://happypaws.com',
        is_verified: true,
        is_active: true,
        services: ['preventive_care', 'vaccinations', 'wellness_exams', 'nutrition_counseling'],
        specializations: ['preventive_medicine', 'nutrition', 'behavioral_medicine'],
        payment_methods: ['cash', 'credit_card', 'debit_card', 'insurance'],
        insurance_providers: ['PetWell Insurance'],
        emergency_contact: 'Dr. Johnson',
        emergency_phone: '+1-555-8888',
        operating_hours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '16:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true },
        },
      },
      {
        name: 'Emergency Pet Hospital',
        description: '24/7 emergency veterinary hospital providing critical care and emergency surgery.',
        address: '789 Emergency Lane',
        city: 'Chicago',
        state: 'IL',
        postal_code: '60601',
        country: 'USA',
        phone: '+1-555-0789',
        email: 'emergency@petemergency.com',
        website: 'https://petemergency.com',
        is_verified: true,
        is_active: true,
        services: ['emergency_care', 'critical_care', 'emergency_surgery', 'trauma_treatment'],
        specializations: ['emergency_medicine', 'critical_care', 'trauma_surgery'],
        payment_methods: ['cash', 'credit_card', 'insurance', 'payment_plans'],
        insurance_providers: ['Emergency Pet Insurance', 'Critical Care Plus'],
        emergency_contact: 'Dr. Emergency',
        emergency_phone: '+1-555-0000',
        operating_hours: {
          monday: { open: '00:00', close: '23:59', closed: false },
          tuesday: { open: '00:00', close: '23:59', closed: false },
          wednesday: { open: '00:00', close: '23:59', closed: false },
          thursday: { open: '00:00', close: '23:59', closed: false },
          friday: { open: '00:00', close: '23:59', closed: false },
          saturday: { open: '00:00', close: '23:59', closed: false },
          sunday: { open: '00:00', close: '23:59', closed: false },
        },
      },
    ];

    const clinics: Clinic[] = [];
    for (const data of clinicData) {
      try {
        const clinic = this.clinicRepository.create(data);
        const savedClinic = await this.clinicRepository.save(clinic);
        clinics.push(savedClinic);
        this.logger.log(`Created clinic: ${savedClinic.name} (ID: ${savedClinic.id})`);
      } catch (error) {
        this.logger.error(`Failed to create clinic ${data.name}:`, error);
        throw error;
      }
    }

    return clinics;
  }

  private async createSampleStaff(clinicId: string, users: { admin: User; veterinarian: User; staff?: User }): Promise<void> {
    const staffData: StaffData[] = [
      {
        clinic_id: clinicId,
        user_id: users.admin.id,
        role: StaffRole.ADMIN,
        specialization: 'Clinic Management',
        license_number: 'ADM-001',
        experience_years: 5,
        education: ['Veterinary Business Administration', 'Healthcare Management'],
        bio: 'Experienced clinic administrator with expertise in veterinary practice management.',
        hire_date: '2023-01-01',
        is_active: true,
      },
      {
        clinic_id: clinicId,
        user_id: users.veterinarian.id,
        role: StaffRole.DOCTOR,
        specialization: 'General Veterinary Medicine',
        license_number: 'VET-001',
        experience_years: 8,
        education: ['Doctor of Veterinary Medicine', 'Small Animal Surgery'],
        bio: 'Experienced veterinarian with expertise in general practice and surgery.',
        hire_date: '2023-01-15',
        is_active: true,
      },
    ];

    // Add staff member if available
    if (users.staff && users.staff.id !== users.veterinarian.id) {
      staffData.push({
        clinic_id: clinicId,
        user_id: users.staff.id,
        role: StaffRole.ASSISTANT,
        specialization: 'Veterinary Nursing',
        license_number: 'NUR-001',
        experience_years: 3,
        education: ['Veterinary Technology', 'Animal Nursing'],
        bio: 'Dedicated veterinary nurse with experience in patient care and support.',
        hire_date: '2023-02-01',
        is_active: true,
      });
    }

    for (const data of staffData) {
      try {
        const staff = this.clinicStaffRepository.create(data);
        await this.clinicStaffRepository.save(staff);
        this.logger.log(`Created staff member: ${data.role} for clinic ${clinicId}`);
      } catch (error) {
        this.logger.error(`Failed to create staff member for clinic ${clinicId}:`, error);
        throw error;
      }
    }
  }

  private async createSampleServices(clinicId: string): Promise<void> {
    const serviceData = [
      {
        clinic_id: clinicId,
        name: 'Wellness Exam',
        description: 'Comprehensive health checkup including physical examination and vaccinations',
        category: ServiceCategory.PREVENTIVE,
        duration_minutes: 45,
        price: 75.0,
        currency: 'USD',
        is_active: true,
        requires_appointment: true,
      },
      {
        clinic_id: clinicId,
        name: 'Vaccination',
        description: 'Core and non-core vaccinations for pets',
        category: ServiceCategory.PREVENTIVE,
        duration_minutes: 30,
        price: 45.0,
        currency: 'USD',
        is_active: true,
        requires_appointment: true,
      },
      {
        clinic_id: clinicId,
        name: 'Dental Cleaning',
        description: 'Professional dental cleaning and oral health assessment',
        category: ServiceCategory.DENTAL,
        duration_minutes: 60,
        price: 150.0,
        currency: 'USD',
        is_active: true,
        requires_appointment: true,
      },
    ];

    for (const data of serviceData) {
      try {
        const service = this.clinicServiceRepository.create(data);
        await this.clinicServiceRepository.save(service);
      } catch (error) {
        this.logger.error(`Failed to create service ${data.name} for clinic ${clinicId}:`, error);
        throw error;
      }
    }
  }

  private async createSamplePhotos(clinicId: string): Promise<void> {
    const photoData = [
      {
        clinic_id: clinicId,
        photo_url: 'https://example.com/clinic-exterior.jpg',
        caption: 'Clinic Exterior',
        category: PhotoCategory.EXTERIOR,
        is_primary: true,
        is_active: true,
      },
      {
        clinic_id: clinicId,
        photo_url: 'https://example.com/waiting-area.jpg',
        caption: 'Comfortable Waiting Area',
        category: PhotoCategory.WAITING_AREA,
        is_primary: false,
        is_active: true,
      },
      {
        clinic_id: clinicId,
        photo_url: 'https://example.com/examination-room.jpg',
        caption: 'Examination Room',
        category: PhotoCategory.EXAMINATION_ROOM,
        is_primary: false,
        is_active: true,
      },
    ];

    for (const data of photoData) {
      try {
        const photo = this.clinicPhotoRepository.create(data);
        await this.clinicPhotoRepository.save(photo);
      } catch (error) {
        this.logger.error(`Failed to create photo for clinic ${clinicId}:`, error);
        throw error;
      }
    }
  }

  private async createSampleOperatingHours(clinicId: string): Promise<void> {
    const days = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

    for (const day of days) {
      try {
        let hours: Partial<ClinicOperatingHours>;

        if (day === DayOfWeek.SUNDAY) {
          hours = {
            clinic_id: clinicId,
            day_of_week: day,
            open_time: '00:00',
            close_time: '00:00',
            is_closed: true,
          };
        } else if (day === DayOfWeek.SATURDAY) {
          hours = {
            clinic_id: clinicId,
            day_of_week: day,
            open_time: '10:00',
            close_time: '15:00',
            is_closed: false,
          };
        } else {
          hours = {
            clinic_id: clinicId,
            day_of_week: day,
            open_time: '09:00',
            close_time: '17:00',
            is_closed: false,
          };
        }

        const operatingHours = this.clinicOperatingHoursRepository.create(hours);
        await this.clinicOperatingHoursRepository.save(operatingHours);
      } catch (error) {
        this.logger.error(`Failed to create operating hours for ${day} for clinic ${clinicId}:`, error);
        throw error;
      }
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing all clinics and related data...');
    try {
      await this.clinicOperatingHoursRepository.clear();
      await this.clinicPhotoRepository.clear();
      await this.clinicServiceRepository.clear();
      await this.clinicStaffRepository.clear();
      await this.clinicRepository.clear();
      this.logger.log('All clinics and related data cleared');
    } catch (error) {
      this.logger.error('Error clearing clinics data:', error);
      throw error;
    }
  }
}
