import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { ActivityStatus, ActivityType, UserActivity } from './entities/user-activity.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersSeeder {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepository: Repository<UserPreferences>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>
  ) {}

  async seed() {
    this.logger.log('Starting user seeding...');

    // Clear existing users first for fresh data
    await this.clear();

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    const users = [
      // Admin Users
      {
        email: 'admin@borzolini.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash,
        role: UserRole.ADMIN,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0100',
        address: '123 Admin Street',
        city: 'New York',
        postalCode: '10001',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        gender: 'male' as const,
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+1-555-0100',
        emergencyContactRelationship: 'Spouse',
      },
      {
        email: 'shayan.araghi@borzolini.com',
        firstName: 'Shayan',
        lastName: 'Araghi',
        passwordHash,
        role: UserRole.ADMIN,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0101',
        address: '456 Borzolini Avenue',
        city: 'New York',
        postalCode: '10001',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        gender: 'male' as const,
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+1-555-0101',
        emergencyContactRelationship: 'Spouse',
      },

      // Veterinarians
      {
        email: 'dr.smith@borzolini.com',
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        passwordHash,
        role: UserRole.VETERINARIAN,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0200',
        address: '789 Veterinary Drive',
        city: 'New York',
        postalCode: '10002',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1985-03-15',
        gender: 'female' as const,
        emergencyContactName: 'Dr. John Smith',
        emergencyContactPhone: '+1-555-0200',
        emergencyContactRelationship: 'Spouse',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },
      {
        email: 'dr.johnson@borzolini.com',
        firstName: 'Dr. Michael',
        lastName: 'Johnson',
        passwordHash,
        role: UserRole.VETERINARIAN,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0201',
        address: '321 Pet Care Boulevard',
        city: 'Los Angeles',
        postalCode: '90210',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Los_Angeles',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1988-07-22',
        gender: 'male' as const,
        emergencyContactName: 'Lisa Johnson',
        emergencyContactPhone: '+1-555-0201',
        emergencyContactRelationship: 'Spouse',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },
      {
        email: 'dr.garcia@borzolini.com',
        firstName: 'Dr. Maria',
        lastName: 'Garcia',
        passwordHash,
        role: UserRole.VETERINARIAN,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0202',
        address: '654 Animal Wellness Plaza',
        city: 'Chicago',
        postalCode: '60601',
        country: 'USA',
        preferredLanguage: 'es',
        timezone: 'America/Chicago',
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1987-01-30',
        gender: 'female' as const,
        emergencyContactName: 'Carlos Garcia',
        emergencyContactPhone: '+1-555-0202',
        emergencyContactRelationship: 'Spouse',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },
      {
        email: 'dr.wilson@borzolini.com',
        firstName: 'Dr. David',
        lastName: 'Wilson',
        passwordHash,
        role: UserRole.VETERINARIAN,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0203',
        address: '987 Emergency Lane',
        city: 'Miami',
        postalCode: '33101',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1983-11-12',
        gender: 'male' as const,
        emergencyContactName: 'Jennifer Wilson',
        emergencyContactPhone: '+1-555-0203',
        emergencyContactRelationship: 'Spouse',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },
      {
        email: 'dr.brown@borzolini.com',
        firstName: 'Dr. Emily',
        lastName: 'Brown',
        passwordHash,
        role: UserRole.VETERINARIAN,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0204',
        address: '147 Veterinary Center',
        city: 'Seattle',
        postalCode: '98101',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Los_Angeles',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1990-05-08',
        gender: 'female' as const,
        emergencyContactName: 'Robert Brown',
        emergencyContactPhone: '+1-555-0204',
        emergencyContactRelationship: 'Father',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },

      // Staff Members
      {
        email: 'nurse.wilson@borzolini.com',
        firstName: 'Nurse Emily',
        lastName: 'Wilson',
        passwordHash,
        role: UserRole.STAFF,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0300',
        address: '321 Care Lane',
        city: 'New York',
        postalCode: '10003',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1992-11-08',
        gender: 'female' as const,
        emergencyContactName: 'Robert Wilson',
        emergencyContactPhone: '+1-555-0300',
        emergencyContactRelationship: 'Father',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },
      {
        email: 'receptionist.martinez@borzolini.com',
        firstName: 'Sofia',
        lastName: 'Martinez',
        passwordHash,
        role: UserRole.STAFF,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0301',
        address: '654 Front Desk Street',
        city: 'Los Angeles',
        postalCode: '90211',
        country: 'USA',
        preferredLanguage: 'es',
        timezone: 'America/Los_Angeles',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1995-08-15',
        gender: 'female' as const,
        emergencyContactName: 'Carlos Martinez',
        emergencyContactPhone: '+1-555-0301',
        emergencyContactRelationship: 'Brother',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },

      // Patient Users
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash,
        role: UserRole.PATIENT,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0400',
        address: '123 Maple Street',
        city: 'New York',
        postalCode: '10004',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1990-05-12',
        gender: 'male' as const,
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1-555-0400',
        emergencyContactRelationship: 'Spouse',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        insuranceProvider: 'Blue Cross Blue Shield',
        insurancePolicyNumber: 'BCBS123456',
        insuranceGroupNumber: 'GRP789',
        insuranceExpiryDate: '2025-12-31',
      },
      {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        passwordHash,
        role: UserRole.PATIENT,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0401',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        postalCode: '90212',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Los_Angeles',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1988-09-25',
        gender: 'female' as const,
        emergencyContactName: 'John Smith',
        emergencyContactPhone: '+1-555-0401',
        emergencyContactRelationship: 'Spouse',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        insuranceProvider: 'Aetna',
        insurancePolicyNumber: 'AET789012',
        insuranceGroupNumber: 'GRP456',
        insuranceExpiryDate: '2025-12-31',
      },
      {
        email: 'mike.brown@example.com',
        firstName: 'Mike',
        lastName: 'Brown',
        passwordHash,
        role: UserRole.PATIENT,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0402',
        address: '789 Pine Street',
        city: 'Chicago',
        postalCode: '60602',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Chicago',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1995-12-03',
        gender: 'male' as const,
        emergencyContactName: 'Sarah Brown',
        emergencyContactPhone: '+1-555-0402',
        emergencyContactRelationship: 'Sister',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        insuranceProvider: 'Cigna',
        insurancePolicyNumber: 'CIG345678',
        insuranceGroupNumber: 'GRP123',
        insuranceExpiryDate: '2025-12-31',
      },
      {
        email: 'sarah.wilson@example.com',
        firstName: 'Sarah',
        lastName: 'Wilson',
        passwordHash,
        role: UserRole.PATIENT,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0403',
        address: '321 Elm Drive',
        city: 'Miami',
        postalCode: '33102',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1991-04-18',
        gender: 'female' as const,
        emergencyContactName: 'Mike Wilson',
        emergencyContactPhone: '+1-555-0403',
        emergencyContactRelationship: 'Brother',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        insuranceProvider: 'UnitedHealth',
        insurancePolicyNumber: 'UHC901234',
        insuranceGroupNumber: 'GRP567',
        insuranceExpiryDate: '2025-12-31',
      },
      {
        email: 'alex.chen@example.com',
        firstName: 'Alex',
        lastName: 'Chen',
        passwordHash,
        role: UserRole.PATIENT,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0404',
        address: '654 Cedar Lane',
        city: 'Seattle',
        postalCode: '98102',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Los_Angeles',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1993-08-14',
        gender: 'prefer-not-to-say' as const,
        emergencyContactName: 'Jennifer Chen',
        emergencyContactPhone: '+1-555-0404',
        emergencyContactRelationship: 'Roommate',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        insuranceProvider: 'Kaiser Permanente',
        insurancePolicyNumber: 'KP567890',
        insuranceGroupNumber: 'GRP890',
        insuranceExpiryDate: '2025-12-31',
      },
      {
        email: 'lisa.garcia@example.com',
        firstName: 'Lisa',
        lastName: 'Garcia',
        passwordHash,
        role: UserRole.PATIENT,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0405',
        address: '987 Birch Street',
        city: 'Phoenix',
        postalCode: '85001',
        country: 'USA',
        preferredLanguage: 'es',
        timezone: 'America/Phoenix',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1987-02-28',
        gender: 'female' as const,
        emergencyContactName: 'Carlos Garcia',
        emergencyContactPhone: '+1-555-0405',
        emergencyContactRelationship: 'Spouse',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        insuranceProvider: 'Humana',
        insurancePolicyNumber: 'HUM123789',
        insuranceGroupNumber: 'GRP234',
        insuranceExpiryDate: '2025-12-31',
      },
      {
        email: 'david.miller@example.com',
        firstName: 'David',
        lastName: 'Miller',
        passwordHash,
        role: UserRole.PATIENT,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1-555-0406',
        address: '147 Spruce Avenue',
        city: 'Denver',
        postalCode: '80201',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Denver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1985-11-20',
        gender: 'male' as const,
        emergencyContactName: 'Susan Miller',
        emergencyContactPhone: '+1-555-0406',
        emergencyContactRelationship: 'Wife',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        insuranceProvider: 'Anthem',
        insurancePolicyNumber: 'ANT456123',
        insuranceGroupNumber: 'GRP345',
        insuranceExpiryDate: '2025-12-31',
      },
    ];

    try {
      for (const userData of users) {
        const user = new User();
        Object.assign(user, userData);
        const savedUser = await this.userRepository.save(user);

        // Create user preferences
        await this.createUserPreferences(savedUser);

        // Create sample activities
        await this.createSampleActivities(savedUser);

        // Calculate and update profile completion percentage
        const profileCompletionPercentage = await this.calculateProfileCompletion(savedUser);
        await this.userRepository.update(savedUser.id, {
          profileCompletionPercentage,
        });

        this.logger.log(`Created user: ${savedUser.email} (${savedUser.role}) - Profile completion: ${profileCompletionPercentage}%`);
      }

      this.logger.log(`Successfully seeded ${users.length} users`);
      this.logger.log(`Default password for all users: ${defaultPassword}`);
      this.logger.log('📧 Test users created:');
      this.logger.log('   - admin@borzolini.com (Admin)');
      this.logger.log('   - shayan.araghi@borzolini.com (Admin - Clinic Owner)');
      this.logger.log('   - dr.smith@borzolini.com (Veterinarian)');
      this.logger.log('   - dr.johnson@borzolini.com (Veterinarian)');
      this.logger.log('   - dr.garcia@borzolini.com (Veterinarian)');
      this.logger.log('   - dr.wilson@borzolini.com (Veterinarian)');
      this.logger.log('   - dr.brown@borzolini.com (Veterinarian)');
      this.logger.log('   - nurse.wilson@borzolini.com (Staff)');
      this.logger.log('   - receptionist.martinez@borzolini.com (Staff)');
      this.logger.log('   - john.doe@example.com (Patient)');
      this.logger.log('   - jane.smith@example.com (Patient)');
      this.logger.log('   - mike.brown@example.com (Patient)');
      this.logger.log('   - sarah.wilson@example.com (Patient)');
      this.logger.log('   - alex.chen@example.com (Patient)');
      this.logger.log('   - lisa.garcia@example.com (Patient)');
      this.logger.log('   - david.miller@example.com (Patient)');
    } catch (error) {
      this.logger.error('Error seeding users:', error);
      throw error;
    }
  }

  private async createUserPreferences(user: User): Promise<void> {
    const preferences = this.userPreferencesRepository.create({
      userId: user.id,
      isActive: true,
      theme: 'auto',
      notificationSettings: {
        email: {
          appointments: true,
          reminders: true,
          healthAlerts: true,
          marketing: user.role === UserRole.PATIENT,
          newsletter: true,
        },
        sms: {
          appointments: true,
          reminders: true,
          healthAlerts: true,
        },
        push: {
          appointments: true,
          reminders: true,
          healthAlerts: true,
        },
      },
      privacySettings: {
        profileVisibility: user.role === UserRole.VETERINARIAN ? 'public' : 'public',
        showPhone: user.role === UserRole.VETERINARIAN || user.role === UserRole.STAFF,
        showAddress: user.role === UserRole.VETERINARIAN || user.role === UserRole.STAFF,
        showEmail: user.role === UserRole.VETERINARIAN || user.role === UserRole.STAFF,
        allowContact: true,
      },
      communicationPreferences: {
        preferredLanguage: user.preferredLanguage || 'en',
        preferredContactMethod: 'email',
        timezone: user.timezone || 'UTC',
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
      },
    });

    await this.userPreferencesRepository.save(preferences);
  }

  private async createSampleActivities(user: User): Promise<void> {
    const activities = [
      {
        type: ActivityType.REGISTER,
        status: ActivityStatus.SUCCESS,
        description: 'User registered successfully',
        metadata: { email: user.email, role: user.role },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, USA',
      },
      {
        type: ActivityType.LOGIN,
        status: ActivityStatus.SUCCESS,
        description: 'User logged in successfully',
        metadata: { method: 'password' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, USA',
      },
    ];

    // Add role-specific activities
    if (user.role === UserRole.VETERINARIAN || user.role === UserRole.STAFF) {
      activities.push({
        type: ActivityType.PROFILE_UPDATE,
        status: ActivityStatus.SUCCESS,
        description: 'Professional profile updated',
        metadata: { updatedFields: ['avatar', 'address'] } as any,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, USA',
      });
    }

    if (user.role === UserRole.PATIENT) {
      activities.push({
        type: ActivityType.PREFERENCES_UPDATED,
        status: ActivityStatus.SUCCESS,
        description: 'User preferences updated',
        metadata: { updatedFields: ['notificationSettings'] } as any,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, USA',
      });
    }

    for (const activityData of activities) {
      const activity = this.userActivityRepository.create({
        userId: user.id,
        ...activityData,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      });
      await this.userActivityRepository.save(activity);
    }
  }

  private async calculateProfileCompletion(user: User): Promise<number> {
    // Define field weights and categories (same logic as in service)
    const requiredFields = [
      { field: 'firstName' as keyof User, weight: 10 },
      { field: 'lastName' as keyof User, weight: 10 },
      { field: 'email' as keyof User, weight: 15 },
      { field: 'phone' as keyof User, weight: 10 },
      { field: 'dateOfBirth' as keyof User, weight: 8 },
      { field: 'address' as keyof User, weight: 8 },
      { field: 'city' as keyof User, weight: 5 },
      { field: 'country' as keyof User, weight: 5 },
    ];

    const importantFields = [
      { field: 'gender' as keyof User, weight: 5 },
      { field: 'emergencyContactName' as keyof User, weight: 8 },
      { field: 'emergencyContactPhone' as keyof User, weight: 8 },
      { field: 'emergencyContactRelationship' as keyof User, weight: 3 },
      { field: 'avatar' as keyof User, weight: 3 },
    ];

    const medicalFields = [
      { field: 'medicalHistory' as keyof User, weight: 3 },
      { field: 'allergies' as keyof User, weight: 3 },
      { field: 'medications' as keyof User, weight: 3 },
    ];

    const insuranceFields = [
      { field: 'insuranceProvider' as keyof User, weight: 2 },
      { field: 'insurancePolicyNumber' as keyof User, weight: 2 },
      { field: 'insuranceGroupNumber' as keyof User, weight: 2 },
      { field: 'insuranceExpiryDate' as keyof User, weight: 2 },
    ];

    const allFields = [...requiredFields, ...importantFields, ...medicalFields, ...insuranceFields];
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Calculate scores for each field category
    for (const fieldInfo of allFields) {
      const { field, weight } = fieldInfo;
      maxPossibleScore += weight;

      const value = user[field];
      if (value) {
        // Check if the field has meaningful content
        if (typeof value === 'string' && value.trim().length > 0) {
          totalScore += weight;
        } else if (typeof value === 'object' && value !== null) {
          totalScore += weight;
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          totalScore += weight;
        }
      }
    }

    // Calculate percentage and ensure it's between 0 and 100
    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    return Math.min(Math.max(percentage, 0), 100);
  }

  async clear() {
    this.logger.log('Clearing all users and related data...');
    // Use query builder to delete all records
    await this.userActivityRepository.createQueryBuilder().delete().execute();
    await this.userPreferencesRepository.createQueryBuilder().delete().execute();
    await this.userRepository.createQueryBuilder().delete().execute();
    this.logger.log('All users and related data cleared');
  }
}
