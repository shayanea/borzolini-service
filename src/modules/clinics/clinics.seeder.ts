import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../pets/entities/pet.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ClinicOperatingHours, DayOfWeek } from './entities/clinic-operating-hours.entity';
import { ClinicPhoto, PhotoCategory } from './entities/clinic-photo.entity';
import { ClinicService, ServiceCategory } from './entities/clinic-service.entity';
import { ClinicStaff, StaffRole } from './entities/clinic-staff.entity';
import { Clinic } from './entities/clinic.entity';
import { CasePriority, CaseStatus, CaseType, ClinicPetCase } from './entities/pet-case.entity';

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
  instagram_url?: string;
  tiktok_url?: string;
  owner_id?: string;
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

interface PetCaseData {
  case_number: string;
  clinic_id: string;
  pet_id: string;
  owner_id: string;
  vet_id?: string;
  case_type: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  title: string;
  description: string;
  initial_symptoms: string[];
  current_symptoms: string[];
  vital_signs?: any;
  diagnosis?: string;
  treatment_plan?: any;
  ai_insights?: any;
  timeline: any[];
  attachments: any[];
  notes?: string;
  resolution_notes?: string;
  resolved_at?: Date;
  closed_at?: Date;
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
    @InjectRepository(ClinicPetCase)
    private readonly petCaseRepository: Repository<ClinicPetCase>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    private readonly usersService: UsersService
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting clinics seeding...');

    try {
      // Validate database connection
      await this.validateDatabaseConnection();

      // Clear existing clinics first for fresh data
      await this.clear();

      // Validate that required users exist
      const requiredUsers = await this.validateRequiredUsers();
      if (!requiredUsers) {
        throw new Error('Required users not found. Please run users seeder first.');
      }

      this.logger.log('Creating sample clinics...');
      const clinics = await this.createSampleClinics(requiredUsers);

      // Create sample staff, services, photos, operating hours for each clinic
      // Note: Pet cases are created separately after pets are seeded
      for (const clinic of clinics) {
        this.logger.log(`Setting up clinic: ${clinic.name}`);

        await this.createSampleStaff(clinic.id, requiredUsers);
        await this.createSampleServices(clinic.id);
        await this.createSamplePhotos(clinic.id);
        await this.createSampleOperatingHours(clinic.id);
      }

      this.logger.log(`✅ Clinics seeding completed! Created ${clinics.length} clinics`);
      this.logger.log('📝 Note: Pet cases will be created after pets are seeded');
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

  private async validateRequiredUsers(): Promise<{
    admin: User;
    clinicOwner: User;
    veterinarian: User;
    staff?: User;
  } | null> {
    try {
      // Get all users and filter by role (with high limit to get all users)
      const allUsersResult = await this.usersService.findAll(undefined, { limit: 1000 });
      const allUsers = allUsersResult.users;

      // Debug logging
      this.logger.log(`Total users found: ${allUsers.length}`);
      allUsers.forEach((user) => {
        this.logger.log(`User: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
      });

      const adminUsers = allUsers.filter((user) => user.role === UserRole.ADMIN && user.isActive);
      const veterinarianUsers = allUsers.filter((user) => user.role === UserRole.VETERINARIAN && user.isActive);
      const staffUsers = allUsers.filter((user) => user.role === UserRole.STAFF && user.isActive);

      // Find Shayan Araghi as the clinic owner
      const clinicOwner = allUsers.find((user) => user.email === 'shayan.araghi@borzolini.com' && user.isActive);

      if (adminUsers.length === 0 || veterinarianUsers.length === 0 || !clinicOwner) {
        this.logger.warn('Insufficient users for clinic staff creation');
        this.logger.warn(`Found: ${adminUsers.length} admins, ${veterinarianUsers.length} veterinarians, ${staffUsers.length} staff, clinic owner: ${clinicOwner ? 'found' : 'not found'}`);
        return null;
      }

      // Return a mapping of user types for easy access
      const result: { admin: User; clinicOwner: User; veterinarian: User; staff?: User } = {
        admin: adminUsers[0]!,
        clinicOwner,
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

  private async createSampleClinics(users: { admin: User; clinicOwner: User; veterinarian: User; staff?: User }): Promise<Clinic[]> {
    const clinicData: ClinicData[] = [
      {
        name: 'Borzolini Pet Clinic',
        description: 'Leading veterinary clinic providing comprehensive pet care with state-of-the-art facilities and experienced staff. Specializing in advanced diagnostics, surgery, and emergency care.',
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
        services: ['vaccinations', 'surgery', 'dental_care', 'emergency_care', 'wellness_exams', 'diagnostic_imaging', 'laboratory_tests'],
        specializations: ['feline_medicine', 'canine_medicine', 'exotic_pets', 'emergency_medicine', 'surgery', 'cardiology'],
        payment_methods: ['cash', 'credit_card', 'insurance', 'payment_plans'],
        insurance_providers: ['PetCare Insurance', 'VetHealth Plus', 'Paws & Claws Insurance'],
        emergency_contact: 'Dr. Sarah Smith',
        emergency_phone: '+1-555-9999',
        operating_hours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '16:00', closed: false },
          sunday: { open: '10:00', close: '15:00', closed: false },
        },
        instagram_url: 'https://www.instagram.com/borzoliniclinic/',
        tiktok_url: 'https://www.tiktok.com/@borzoliniclinic',
        owner_id: users.clinicOwner.id,
      },
      {
        name: 'Happy Paws Veterinary Center',
        description: 'Family-friendly veterinary center specializing in preventive care and wellness programs. Committed to providing compassionate care for pets and their families.',
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
        services: ['preventive_care', 'vaccinations', 'wellness_exams', 'nutrition_counseling', 'behavioral_consultation', 'grooming'],
        specializations: ['preventive_medicine', 'nutrition', 'behavioral_medicine', 'geriatric_care'],
        payment_methods: ['cash', 'credit_card', 'debit_card', 'insurance'],
        insurance_providers: ['PetWell Insurance', 'Healthy Paws'],
        emergency_contact: 'Dr. Michael Johnson',
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
        description: '24/7 emergency veterinary hospital providing critical care and emergency surgery. Equipped with advanced life support systems and experienced emergency veterinarians.',
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
        services: ['emergency_care', 'critical_care', 'emergency_surgery', 'trauma_treatment', 'intensive_care', 'blood_transfusions'],
        specializations: ['emergency_medicine', 'critical_care', 'trauma_surgery', 'toxicology'],
        payment_methods: ['cash', 'credit_card', 'insurance', 'payment_plans'],
        insurance_providers: ['Emergency Pet Insurance', 'Critical Care Plus', 'Pet Emergency Fund'],
        emergency_contact: 'Dr. Maria Garcia',
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
      {
        name: 'Coastal Veterinary Clinic',
        description: 'Full-service veterinary clinic serving the Miami area with comprehensive pet care services. Specializing in tropical pet diseases and marine animal care.',
        address: '321 Ocean Drive',
        city: 'Miami',
        state: 'FL',
        postal_code: '33101',
        country: 'USA',
        phone: '+1-555-0321',
        email: 'info@coastalvet.com',
        website: 'https://coastalvet.com',
        is_verified: true,
        is_active: true,
        services: ['wellness_exams', 'vaccinations', 'dental_care', 'surgery', 'exotic_pet_care', 'marine_animal_care'],
        specializations: ['exotic_pets', 'marine_medicine', 'tropical_diseases', 'avian_medicine'],
        payment_methods: ['cash', 'credit_card', 'insurance'],
        insurance_providers: ['Exotic Pet Insurance', 'Marine Animal Care'],
        emergency_contact: 'Dr. David Wilson',
        emergency_phone: '+1-555-7777',
        operating_hours: {
          monday: { open: '07:00', close: '19:00', closed: false },
          tuesday: { open: '07:00', close: '19:00', closed: false },
          wednesday: { open: '07:00', close: '19:00', closed: false },
          thursday: { open: '07:00', close: '19:00', closed: false },
          friday: { open: '07:00', close: '19:00', closed: false },
          saturday: { open: '08:00', close: '17:00', closed: false },
          sunday: { open: '09:00', close: '15:00', closed: false },
        },
      },
      {
        name: 'Pacific Northwest Animal Hospital',
        description: 'Modern veterinary hospital serving the Seattle area with cutting-edge technology and compassionate care. Specializing in large animal medicine and holistic treatments.',
        address: '654 Rainier Avenue',
        city: 'Seattle',
        state: 'WA',
        postal_code: '98101',
        country: 'USA',
        phone: '+1-555-0654',
        email: 'care@pacificnwanimal.com',
        website: 'https://pacificnwanimal.com',
        is_verified: true,
        is_active: true,
        services: ['wellness_exams', 'surgery', 'diagnostic_imaging', 'physical_therapy', 'holistic_medicine', 'large_animal_care'],
        specializations: ['large_animal_medicine', 'holistic_medicine', 'physical_therapy', 'equine_medicine'],
        payment_methods: ['cash', 'credit_card', 'insurance', 'payment_plans'],
        insurance_providers: ['Large Animal Insurance', 'Holistic Pet Care'],
        emergency_contact: 'Dr. Emily Brown',
        emergency_phone: '+1-555-6666',
        operating_hours: {
          monday: { open: '08:00', close: '17:00', closed: false },
          tuesday: { open: '08:00', close: '17:00', closed: false },
          wednesday: { open: '08:00', close: '17:00', closed: false },
          thursday: { open: '08:00', close: '17:00', closed: false },
          friday: { open: '08:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '15:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true },
        },
      },
      // Real Veterinary Clinics with Social Media
      {
        name: 'Banfield Pet Hospital - Downtown',
        description: 'Full-service veterinary hospital providing comprehensive pet care with a focus on preventive medicine. Part of the Banfield network with over 1,000 locations nationwide.',
        address: '1234 Main Street',
        city: 'Portland',
        state: 'OR',
        postal_code: '97201',
        country: 'USA',
        phone: '+1-503-555-0123',
        email: 'downtown@banfield.com',
        website: 'https://www.banfield.com',
        is_verified: true,
        is_active: true,
        services: ['preventive_care', 'vaccinations', 'wellness_exams', 'dental_care', 'surgery', 'emergency_care', 'microchipping'],
        specializations: ['preventive_medicine', 'internal_medicine', 'surgery', 'dentistry'],
        payment_methods: ['cash', 'credit_card', 'insurance', 'banfield_wellness_plan'],
        insurance_providers: ['Banfield Wellness Plan', 'Pet Insurance Partners'],
        emergency_contact: 'Dr. Sarah Johnson',
        emergency_phone: '+1-503-555-9999',
        operating_hours: {
          monday: { open: '07:00', close: '19:00', closed: false },
          tuesday: { open: '07:00', close: '19:00', closed: false },
          wednesday: { open: '07:00', close: '19:00', closed: false },
          thursday: { open: '07:00', close: '19:00', closed: false },
          friday: { open: '07:00', close: '19:00', closed: false },
          saturday: { open: '08:00', close: '17:00', closed: false },
          sunday: { open: '09:00', close: '16:00', closed: false },
        },
        instagram_url: 'https://www.instagram.com/banfieldpethospital/',
        tiktok_url: 'https://www.tiktok.com/@banfieldpethospital',
        owner_id: users.clinicOwner.id,
      },
      {
        name: 'BluePearl Specialty & Emergency Pet Hospital',
        description: 'Advanced specialty and emergency veterinary hospital providing 24/7 critical care, specialized surgery, and advanced diagnostics. Part of the Mars Veterinary Health family.',
        address: '5678 Emergency Way',
        city: 'Tampa',
        state: 'FL',
        postal_code: '33607',
        country: 'USA',
        phone: '+1-813-555-0456',
        email: 'tampa@bluepearlvet.com',
        website: 'https://bluepearlvet.com',
        is_verified: true,
        is_active: true,
        services: ['emergency_care', 'specialty_surgery', 'oncology', 'cardiology', 'neurology', 'critical_care', 'advanced_imaging'],
        specializations: ['emergency_medicine', 'surgical_specialties', 'oncology', 'cardiology', 'neurology'],
        payment_methods: ['cash', 'credit_card', 'insurance', 'care_credit'],
        insurance_providers: ['Pet Insurance Partners', 'Emergency Care Coverage'],
        emergency_contact: 'Dr. Michael Rodriguez',
        emergency_phone: '+1-813-555-0000',
        operating_hours: {
          monday: { open: '00:00', close: '23:59', closed: false },
          tuesday: { open: '00:00', close: '23:59', closed: false },
          wednesday: { open: '00:00', close: '23:59', closed: false },
          thursday: { open: '00:00', close: '23:59', closed: false },
          friday: { open: '00:00', close: '23:59', closed: false },
          saturday: { open: '00:00', close: '23:59', closed: false },
          sunday: { open: '00:00', close: '23:59', closed: false },
        },
        instagram_url: 'https://www.instagram.com/bluepearlvet/',
        tiktok_url: 'https://www.tiktok.com/@bluepearlvet',
        owner_id: users.clinicOwner.id,
      },
      {
        name: 'The Vets - Mobile Veterinary Service',
        description: 'Revolutionary mobile veterinary service bringing comprehensive pet care directly to your home. Focused on convenience, comfort, and personalized care for pets and their families.',
        address: 'Mobile Service - Serving Greater Austin Area',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701',
        country: 'USA',
        phone: '+1-512-555-0789',
        email: 'austin@thevets.com',
        website: 'https://www.thevets.com',
        is_verified: true,
        is_active: true,
        services: ['home_visits', 'wellness_exams', 'vaccinations', 'dental_care', 'minor_surgery', 'euthanasia', 'telemedicine'],
        specializations: ['mobile_veterinary_medicine', 'preventive_care', 'geriatric_care', 'fear_free_medicine'],
        payment_methods: ['cash', 'credit_card', 'mobile_payment', 'insurance'],
        insurance_providers: ['Pet Insurance Partners', 'Mobile Care Coverage'],
        emergency_contact: 'Dr. Emily Chen',
        emergency_phone: '+1-512-555-9111',
        operating_hours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false },
        },
        instagram_url: 'https://www.instagram.com/thevets_official/',
        tiktok_url: 'https://www.tiktok.com/@thevets_official',
        owner_id: users.clinicOwner.id,
      },
      {
        name: 'Dr. Hunter Finn Veterinary Clinic',
        description: 'Modern veterinary clinic led by Dr. Hunter Finn, known for his engaging social media presence and innovative approach to pet care. Specializing in preventive medicine and pet education.',
        address: '9876 Innovation Drive',
        city: 'Dallas',
        state: 'TX',
        postal_code: '75201',
        country: 'USA',
        phone: '+1-214-555-0321',
        email: 'info@drhunterfinn.com',
        website: 'https://www.drhunterfinn.com',
        is_verified: true,
        is_active: true,
        services: ['wellness_exams', 'vaccinations', 'dental_care', 'behavioral_consultation', 'nutrition_counseling', 'telemedicine', 'educational_content'],
        specializations: ['preventive_medicine', 'behavioral_medicine', 'nutrition', 'pet_education', 'social_media_outreach'],
        payment_methods: ['cash', 'credit_card', 'digital_wallet', 'insurance'],
        insurance_providers: ['Pet Insurance Partners', 'Educational Pet Care'],
        emergency_contact: 'Dr. Hunter Finn',
        emergency_phone: '+1-214-555-7777',
        operating_hours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '15:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true },
        },
        instagram_url: 'https://www.instagram.com/dr.hunterfinn/',
        tiktok_url: 'https://www.tiktok.com/@dr.hunterfinn',
        owner_id: users.clinicOwner.id,
      },
      {
        name: 'Dr. Lisa Lippman Veterinary Practice',
        description: 'Boutique veterinary practice led by Dr. Lisa Lippman, focusing on personalized pet care and owner education. Known for her expertise in feline medicine and pet health advocacy.',
        address: '5432 Feline Avenue',
        city: 'New York',
        state: 'NY',
        postal_code: '10028',
        country: 'USA',
        phone: '+1-212-555-0654',
        email: 'hello@drlisalippman.com',
        website: 'https://www.drlisalippman.com',
        is_verified: true,
        is_active: true,
        services: ['wellness_exams', 'feline_medicine', 'vaccinations', 'dental_care', 'behavioral_consultation', 'nutrition_counseling', 'telemedicine'],
        specializations: ['feline_medicine', 'preventive_care', 'behavioral_medicine', 'nutrition', 'pet_health_education'],
        payment_methods: ['cash', 'credit_card', 'insurance'],
        insurance_providers: ['Pet Insurance Partners', 'Feline Health Coverage'],
        emergency_contact: 'Dr. Lisa Lippman',
        emergency_phone: '+1-212-555-6666',
        operating_hours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '10:00', close: '14:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true },
        },
        instagram_url: 'https://www.instagram.com/drlisalippman/',
        tiktok_url: 'https://www.tiktok.com/@drlisalippman',
        owner_id: users.clinicOwner.id,
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

  private async createSampleStaff(clinicId: string, users: { admin: User; clinicOwner: User; veterinarian: User; staff?: User }): Promise<void> {
    // Get all veterinarians and staff from the database
    const allUsersResult = await this.usersService.findAll();
    const allUsers = allUsersResult.users;
    const veterinarians = allUsers.filter((user) => user.role === UserRole.VETERINARIAN && user.isActive);
    const staffMembers = allUsers.filter((user) => user.role === UserRole.STAFF && user.isActive);

    const staffData: StaffData[] = [];

    // Add admin to Borzolini Pet Clinic only
    const borzoliniClinic = await this.clinicRepository.findOne({ where: { name: 'Borzolini Pet Clinic' } });
    if (clinicId === borzoliniClinic?.id) {
      staffData.push({
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
      });

      // Add clinic owner to Borzolini Pet Clinic only (if different from admin)
      if (users.clinicOwner.id !== users.admin.id) {
        staffData.push({
          clinic_id: clinicId,
          user_id: users.clinicOwner.id,
          role: StaffRole.ADMIN,
          specialization: 'Clinic Ownership',
          license_number: 'OWN-001',
          experience_years: 10,
          education: ['Business Administration', 'Veterinary Practice Management'],
          bio: 'Clinic owner with extensive experience in veterinary business management.',
          hire_date: '2022-01-01',
          is_active: true,
        });
      }
    }

    // Assign veterinarians to different clinics
    const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });
    if (clinic) {
      let assignedVet: User | undefined;

      switch (clinic.name) {
        case 'Borzolini Pet Clinic':
          assignedVet = veterinarians.find((v) => v.email === 'dr.smith@borzolini.com');
          break;
        case 'Happy Paws Veterinary Center':
          assignedVet = veterinarians.find((v) => v.email === 'dr.johnson@borzolini.com');
          break;
        case 'Emergency Pet Hospital':
          assignedVet = veterinarians.find((v) => v.email === 'dr.garcia@borzolini.com');
          break;
        case 'Coastal Veterinary Clinic':
          assignedVet = veterinarians.find((v) => v.email === 'dr.wilson@borzolini.com');
          break;
        case 'Pacific Northwest Animal Hospital':
          assignedVet = veterinarians.find((v) => v.email === 'dr.brown@borzolini.com');
          break;
        default:
          assignedVet = veterinarians[0];
      }

      if (assignedVet) {
        staffData.push({
          clinic_id: clinicId,
          user_id: assignedVet.id,
          role: StaffRole.DOCTOR,
          specialization: this.getSpecializationForClinic(clinic.name),
          license_number: `VET-${assignedVet.id.substring(0, 8).toUpperCase()}`,
          experience_years: this.getExperienceYears(assignedVet.email),
          education: this.getEducationForVet(assignedVet.email),
          bio: this.getBioForVet(assignedVet.email, clinic.name),
          hire_date: '2023-01-15',
          is_active: true,
        });
      }

      // Add staff members to clinics
      if (staffMembers.length > 0) {
        const staffMember = staffMembers[0];
        if (staffMember) {
          staffData.push({
            clinic_id: clinicId,
            user_id: staffMember.id,
            role: StaffRole.ASSISTANT,
            specialization: 'Veterinary Nursing',
            license_number: `NUR-${staffMember.id.substring(0, 8).toUpperCase()}`,
            experience_years: 3,
            education: ['Veterinary Technology', 'Animal Nursing'],
            bio: 'Dedicated veterinary nurse with experience in patient care and support.',
            hire_date: '2023-02-01',
            is_active: true,
          });
        }
      }
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
      {
        clinic_id: clinicId,
        name: 'Emergency Care',
        description: '24/7 emergency veterinary care and treatment',
        category: ServiceCategory.EMERGENCY,
        duration_minutes: 90,
        price: 200.0,
        currency: 'USD',
        is_active: true,
        requires_appointment: false,
      },
      {
        clinic_id: clinicId,
        name: 'Surgery',
        description: 'General and specialized surgical procedures',
        category: ServiceCategory.SURGICAL,
        duration_minutes: 120,
        price: 500.0,
        currency: 'USD',
        is_active: true,
        requires_appointment: true,
      },
      {
        clinic_id: clinicId,
        name: 'Laboratory Tests',
        description: 'Blood work, urinalysis, and diagnostic testing',
        category: ServiceCategory.DIAGNOSTIC,
        duration_minutes: 30,
        price: 85.0,
        currency: 'USD',
        is_active: true,
        requires_appointment: true,
      },
      {
        clinic_id: clinicId,
        name: 'X-Ray Imaging',
        description: 'Digital radiography for diagnostic imaging',
        category: ServiceCategory.DIAGNOSTIC,
        duration_minutes: 45,
        price: 120.0,
        currency: 'USD',
        is_active: true,
        requires_appointment: true,
      },
      {
        clinic_id: clinicId,
        name: 'Behavioral Consultation',
        description: 'Professional behavioral assessment and training recommendations',
        category: ServiceCategory.THERAPY,
        duration_minutes: 60,
        price: 95.0,
        currency: 'USD',
        is_active: true,
        requires_appointment: true,
      },
      {
        clinic_id: clinicId,
        name: 'Nutrition Consultation',
        description: 'Dietary assessment and personalized nutrition plans',
        category: ServiceCategory.WELLNESS,
        duration_minutes: 45,
        price: 65.0,
        currency: 'USD',
        is_active: true,
        requires_appointment: true,
      },
      {
        clinic_id: clinicId,
        name: 'Grooming',
        description: 'Professional pet grooming and hygiene services',
        category: ServiceCategory.WELLNESS,
        duration_minutes: 90,
        price: 75.0,
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

  async seedPetCases(): Promise<void> {
    try {
      // Get all clinics and required users
      const requiredUsers = await this.validateRequiredUsers();
      if (!requiredUsers) {
        throw new Error('Required users not found. Please run users seeder first.');
      }

      const clinics = await this.clinicRepository.find({ where: { is_active: true } });
      
      if (clinics.length === 0) {
        this.logger.warn('No clinics found for creating pet cases');
        return;
      }

      this.logger.log('Creating pet cases for all clinics...');
      
      for (const clinic of clinics) {
        await this.createSamplePetCases(clinic.id, requiredUsers);
      }

      this.logger.log(`✅ Pet cases seeding completed for ${clinics.length} clinics`);
    } catch (error) {
      this.logger.error('❌ Error seeding pet cases:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async createSamplePetCases(clinicId: string, users: { admin: User; clinicOwner: User; veterinarian: User; staff?: User }): Promise<void> {
    try {
      // Get all pets from the database
      const allPets = await this.petRepository.find({
        relations: ['owner'],
        where: { is_active: true },
      });

      if (allPets.length === 0) {
        this.logger.warn(`No pets found for creating cases for clinic ${clinicId}`);
        return;
      }

      // Create sample pet cases
      const petCaseData: PetCaseData[] = [
        {
          case_number: `CASE-${clinicId.substring(0, 8).toUpperCase()}-001`,
          clinic_id: clinicId,
          pet_id: allPets[0]!.id,
          owner_id: allPets[0]!.owner_id,
          vet_id: users.veterinarian.id,
          case_type: CaseType.CONSULTATION,
          status: CaseStatus.OPEN,
          priority: CasePriority.NORMAL,
          title: 'Routine Wellness Check',
          description: 'Annual wellness examination and vaccination update for the pet.',
          initial_symptoms: ['No symptoms reported'],
          current_symptoms: ['No current symptoms'],
          vital_signs: {
            temperature: '101.5°F',
            heart_rate: '120 bpm',
            respiratory_rate: '20 breaths/min',
            weight: '25.5 lbs',
          },
          diagnosis: 'Healthy pet, no issues found',
          treatment_plan: {
            vaccinations: ['Rabies', 'DHPP'],
            follow_up: 'Next appointment in 12 months',
            recommendations: ['Continue current diet', 'Regular exercise'],
          },
          ai_insights: {
            health_score: 95,
            recommendations: ['Maintain current care routine'],
            risk_factors: [],
          },
          timeline: [
            {
              timestamp: new Date(),
              event_type: 'case_created',
              description: 'Case created for routine wellness check',
              user_id: users.veterinarian.id,
              user_name: `${users.veterinarian.firstName} ${users.veterinarian.lastName}`,
            },
          ],
          attachments: [],
          notes: 'Pet is in excellent health condition',
          is_active: true,
        },
        {
          case_number: `CASE-${clinicId.substring(0, 8).toUpperCase()}-002`,
          clinic_id: clinicId,
          pet_id: allPets[1]?.id || allPets[0]!.id,
          owner_id: allPets[1]?.owner_id || allPets[0]!.owner_id,
          vet_id: users.veterinarian.id,
          case_type: CaseType.EMERGENCY,
          status: CaseStatus.IN_PROGRESS,
          priority: CasePriority.HIGH,
          title: 'Emergency Visit - Injury',
          description: 'Pet presented with limping and visible injury to front leg.',
          initial_symptoms: ['Limping', 'Swelling', 'Pain when touched'],
          current_symptoms: ['Limping', 'Mild swelling', 'Favoring leg'],
          vital_signs: {
            temperature: '102.1°F',
            heart_rate: '140 bpm',
            respiratory_rate: '25 breaths/min',
            weight: '22.3 lbs',
          },
          diagnosis: 'Suspected soft tissue injury',
          treatment_plan: {
            immediate_care: ['Rest', 'Ice application', 'Pain management'],
            medications: ['Anti-inflammatory', 'Pain relief'],
            follow_up: 'Recheck in 3 days',
            restrictions: ['Limited activity', 'No jumping'],
          },
          ai_insights: {
            health_score: 75,
            recommendations: ['Monitor for improvement', 'Follow rest protocol'],
            risk_factors: ['Activity level', 'Age'],
          },
          timeline: [
            {
              timestamp: new Date(),
              event_type: 'case_created',
              description: 'Emergency case created for leg injury',
              user_id: users.veterinarian.id,
              user_name: `${users.veterinarian.firstName} ${users.veterinarian.lastName}`,
            },
            {
              timestamp: new Date(Date.now() - 3600000), // 1 hour ago
              event_type: 'examination',
              description: 'Initial examination completed',
              user_id: users.veterinarian.id,
              user_name: `${users.veterinarian.firstName} ${users.veterinarian.lastName}`,
            },
          ],
          attachments: [
            {
              type: 'xray',
              url: 'https://example.com/xray-leg.jpg',
              description: 'X-ray of injured leg',
            },
          ],
          notes: 'Pet is responding well to initial treatment',
          is_active: true,
        },
        {
          case_number: `CASE-${clinicId.substring(0, 8).toUpperCase()}-003`,
          clinic_id: clinicId,
          pet_id: allPets[2]?.id || allPets[0]!.id,
          owner_id: allPets[2]?.owner_id || allPets[0]!.owner_id,
          vet_id: users.veterinarian.id,
          case_type: CaseType.FOLLOW_UP,
          status: CaseStatus.PENDING_CONSULTATION,
          priority: CasePriority.NORMAL,
          title: 'Post-Surgery Follow-up',
          description: 'Follow-up appointment after spay surgery to check healing progress.',
          initial_symptoms: ['Post-surgical recovery'],
          current_symptoms: ['Healing incision', 'Normal activity'],
          vital_signs: {
            temperature: '100.8°F',
            heart_rate: '110 bpm',
            respiratory_rate: '18 breaths/min',
            weight: '28.2 lbs',
          },
          diagnosis: 'Normal post-surgical recovery',
          treatment_plan: {
            wound_care: ['Keep incision clean and dry'],
            activity: ['Gradual increase in activity'],
            follow_up: 'Final check in 2 weeks',
            medications: ['Antibiotics as prescribed'],
          },
          ai_insights: {
            health_score: 88,
            recommendations: ['Continue current care', 'Monitor incision'],
            risk_factors: ['Infection risk'],
          },
          timeline: [
            {
              timestamp: new Date(Date.now() - 86400000), // 1 day ago
              event_type: 'case_created',
              description: 'Follow-up case created',
              user_id: users.veterinarian.id,
              user_name: `${users.veterinarian.firstName} ${users.veterinarian.lastName}`,
            },
          ],
          attachments: [],
          notes: 'Recovery is progressing well',
          is_active: true,
        },
        {
          case_number: `CASE-${clinicId.substring(0, 8).toUpperCase()}-004`,
          clinic_id: clinicId,
          pet_id: allPets[3]?.id || allPets[0]!.id,
          owner_id: allPets[3]?.owner_id || allPets[0]!.owner_id,
          vet_id: users.veterinarian.id,
          case_type: CaseType.BEHAVIORAL,
          status: CaseStatus.OPEN,
          priority: CasePriority.LOW,
          title: 'Behavioral Consultation',
          description: 'Pet showing signs of anxiety and destructive behavior when left alone.',
          initial_symptoms: ['Destructive behavior', 'Excessive barking', 'Anxiety'],
          current_symptoms: ['Mild anxiety', 'Some destructive behavior'],
          vital_signs: {
            temperature: '101.2°F',
            heart_rate: '115 bpm',
            respiratory_rate: '22 breaths/min',
            weight: '30.1 lbs',
          },
          diagnosis: 'Separation anxiety',
          treatment_plan: {
            behavior_modification: ['Gradual desensitization', 'Positive reinforcement'],
            environmental_changes: ['Interactive toys', 'Safe space creation'],
            follow_up: 'Progress check in 2 weeks',
            medications: ['Anxiety medication if needed'],
          },
          ai_insights: {
            health_score: 82,
            recommendations: ['Consistent routine', 'Behavioral training'],
            risk_factors: ['Stress triggers', 'Environment changes'],
          },
          timeline: [
            {
              timestamp: new Date(Date.now() - 172800000), // 2 days ago
              event_type: 'case_created',
              description: 'Behavioral consultation case created',
              user_id: users.veterinarian.id,
              user_name: `${users.veterinarian.firstName} ${users.veterinarian.lastName}`,
            },
          ],
          attachments: [],
          notes: 'Owner committed to following behavioral plan',
          is_active: true,
        },
        {
          case_number: `CASE-${clinicId.substring(0, 8).toUpperCase()}-005`,
          clinic_id: clinicId,
          pet_id: allPets[4]?.id || allPets[0]!.id,
          owner_id: allPets[4]?.owner_id || allPets[0]!.owner_id,
          vet_id: users.veterinarian.id,
          case_type: CaseType.CHRONIC_CONDITION,
          status: CaseStatus.UNDER_OBSERVATION,
          priority: CasePriority.HIGH,
          title: 'Diabetes Management',
          description: 'Ongoing management of diabetes with regular monitoring and insulin therapy.',
          initial_symptoms: ['Excessive thirst', 'Frequent urination', 'Weight loss'],
          current_symptoms: ['Well-controlled with medication'],
          vital_signs: {
            temperature: '100.5°F',
            heart_rate: '105 bpm',
            respiratory_rate: '20 breaths/min',
            weight: '26.8 lbs',
            blood_glucose: '120 mg/dL',
          },
          diagnosis: 'Diabetes mellitus - well controlled',
          treatment_plan: {
            medications: ['Insulin twice daily', 'Blood glucose monitoring'],
            diet: ['Prescription diabetic diet', 'Regular feeding schedule'],
            monitoring: ['Weekly glucose checks', 'Monthly vet visits'],
            follow_up: 'Monthly check-up',
          },
          ai_insights: {
            health_score: 78,
            recommendations: ['Maintain current treatment', 'Monitor glucose levels'],
            risk_factors: ['Blood sugar fluctuations', 'Complications'],
          },
          timeline: [
            {
              timestamp: new Date(Date.now() - 2592000000), // 30 days ago
              event_type: 'case_created',
              description: 'Diabetes management case created',
              user_id: users.veterinarian.id,
              user_name: `${users.veterinarian.firstName} ${users.veterinarian.lastName}`,
            },
            {
              timestamp: new Date(Date.now() - 1209600000), // 14 days ago
              event_type: 'treatment_update',
              description: 'Insulin dosage adjusted based on glucose levels',
              user_id: users.veterinarian.id,
              user_name: `${users.veterinarian.firstName} ${users.veterinarian.lastName}`,
            },
          ],
          attachments: [
            {
              type: 'lab_results',
              url: 'https://example.com/lab-results.pdf',
              description: 'Recent blood work results',
            },
          ],
          notes: 'Pet is responding well to treatment, glucose levels stable',
          is_active: true,
        },
      ];

      for (const data of petCaseData) {
        try {
          const petCase = this.petCaseRepository.create(data);
          await this.petCaseRepository.save(petCase);
          this.logger.log(`Created pet case: ${data.case_number} for clinic ${clinicId}`);
        } catch (error) {
          this.logger.error(`Failed to create pet case ${data.case_number} for clinic ${clinicId}:`, error);
          // Continue with other cases even if one fails
        }
      }

      this.logger.log(`Created ${petCaseData.length} pet cases for clinic ${clinicId}`);
    } catch (error) {
      this.logger.error(`Error creating pet cases for clinic ${clinicId}:`, error);
      // Don't throw error to prevent stopping the entire seeding process
    }
  }

  private getSpecializationForClinic(clinicName: string): string {
    switch (clinicName) {
      case 'Borzolini Pet Clinic':
        return 'General Veterinary Medicine & Surgery';
      case 'Happy Paws Veterinary Center':
        return 'Preventive Medicine & Wellness';
      case 'Emergency Pet Hospital':
        return 'Emergency Medicine & Critical Care';
      case 'Coastal Veterinary Clinic':
        return 'Exotic Pet Medicine & Marine Animals';
      case 'Pacific Northwest Animal Hospital':
        return 'Large Animal Medicine & Holistic Care';
      default:
        return 'General Veterinary Medicine';
    }
  }

  private getExperienceYears(email: string): number {
    switch (email) {
      case 'dr.smith@borzolini.com':
        return 8;
      case 'dr.johnson@borzolini.com':
        return 6;
      case 'dr.garcia@borzolini.com':
        return 10;
      case 'dr.wilson@borzolini.com':
        return 7;
      case 'dr.brown@borzolini.com':
        return 5;
      default:
        return 5;
    }
  }

  private getEducationForVet(email: string): string[] {
    switch (email) {
      case 'dr.smith@borzolini.com':
        return ['Doctor of Veterinary Medicine', 'Small Animal Surgery Residency', 'Emergency Medicine Certification'];
      case 'dr.johnson@borzolini.com':
        return ['Doctor of Veterinary Medicine', 'Preventive Medicine Fellowship', 'Nutritional Medicine Certification'];
      case 'dr.garcia@borzolini.com':
        return ['Doctor of Veterinary Medicine', 'Emergency Medicine Residency', 'Critical Care Specialist'];
      case 'dr.wilson@borzolini.com':
        return ['Doctor of Veterinary Medicine', 'Exotic Animal Medicine', 'Marine Biology Degree'];
      case 'dr.brown@borzolini.com':
        return ['Doctor of Veterinary Medicine', 'Large Animal Medicine', 'Holistic Medicine Certification'];
      default:
        return ['Doctor of Veterinary Medicine'];
    }
  }

  private getBioForVet(email: string, clinicName: string): string {
    switch (email) {
      case 'dr.smith@borzolini.com':
        return `Experienced veterinarian specializing in general practice and surgery. Committed to providing comprehensive care for pets at ${clinicName}.`;
      case 'dr.johnson@borzolini.com':
        return `Dedicated to preventive medicine and wellness programs. Passionate about helping pets live their healthiest lives at ${clinicName}.`;
      case 'dr.garcia@borzolini.com':
        return `Emergency medicine specialist with extensive experience in critical care. Available 24/7 to provide life-saving treatment at ${clinicName}.`;
      case 'dr.wilson@borzolini.com':
        return `Exotic animal specialist with expertise in marine animals and tropical diseases. Providing specialized care for unique pets at ${clinicName}.`;
      case 'dr.brown@borzolini.com':
        return `Holistic medicine practitioner specializing in large animals and alternative treatments. Combining traditional and modern approaches at ${clinicName}.`;
      default:
        return `Experienced veterinarian providing compassionate care for pets at ${clinicName}.`;
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing all clinics and related data...');
    try {
      // Use query builder to delete all records
      await this.petCaseRepository.createQueryBuilder().delete().execute();
      await this.clinicOperatingHoursRepository.createQueryBuilder().delete().execute();
      await this.clinicPhotoRepository.createQueryBuilder().delete().execute();
      await this.clinicServiceRepository.createQueryBuilder().delete().execute();
      await this.clinicStaffRepository.createQueryBuilder().delete().execute();
      await this.clinicRepository.createQueryBuilder().delete().execute();
      this.logger.log('All clinics and related data cleared');
    } catch (error) {
      this.logger.error('Error clearing clinics data:', error);
      throw error;
    }
  }
}
