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

    // Check if users already exist
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      this.logger.log('Users already exist, skipping seeding');
      return;
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    const users = [
      {
        email: 'admin@borzolini.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash,
        role: 'admin' as const,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1234567890',
        address: '123 Admin Street',
        city: 'Admin City',
        postalCode: '12345',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        gender: 'male' as const,
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+1234567890',
        emergencyContactRelationship: 'Spouse',
      },
      {
        email: 'shayan.araghi@borzolini.com',
        firstName: 'Shayan',
        lastName: 'Araghi',
        passwordHash,
        role: 'admin' as const,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1234567800',
        address: '456 Borzolini Avenue',
        city: 'New York',
        postalCode: '10001',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        gender: 'male' as const,
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+1234567800',
        emergencyContactRelationship: 'Spouse',
      },
      {
        email: 'dr.smith@borzolini.com',
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        passwordHash,
        role: 'veterinarian' as const,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1234567891',
        address: '456 Vet Avenue',
        city: 'Vet City',
        postalCode: '12346',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Chicago',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1985-03-15',
        gender: 'female' as const,
        emergencyContactName: 'Dr. John Smith',
        emergencyContactPhone: '+1234567891',
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
        role: 'veterinarian' as const,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1234567892',
        address: '789 Pet Boulevard',
        city: 'Pet City',
        postalCode: '12347',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Denver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1988-07-22',
        gender: 'male' as const,
        emergencyContactName: 'Lisa Johnson',
        emergencyContactPhone: '+1234567892',
        emergencyContactRelationship: 'Spouse',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },
      {
        email: 'nurse.wilson@borzolini.com',
        firstName: 'Nurse Emily',
        lastName: 'Wilson',
        passwordHash,
        role: 'staff' as const,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1234567893',
        address: '321 Care Lane',
        city: 'Care City',
        postalCode: '12348',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Los_Angeles',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1992-11-08',
        gender: 'female' as const,
        emergencyContactName: 'Robert Wilson',
        emergencyContactPhone: '+1234567893',
        emergencyContactRelationship: 'Father',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash,
        role: 'patient' as const,
        isEmailVerified: true,
        isPhoneVerified: false,
        isActive: true,
        phone: '+1234567894',
        address: '654 Patient Road',
        city: 'Patient City',
        postalCode: '12349',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1990-05-12',
        gender: 'male' as const,
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1234567894',
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
        role: 'patient' as const,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1234567895',
        address: '987 Owner Street',
        city: 'Owner City',
        postalCode: '12350',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Chicago',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1988-09-25',
        gender: 'female' as const,
        emergencyContactName: 'John Smith',
        emergencyContactPhone: '+1234567895',
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
        role: 'patient' as const,
        isEmailVerified: false,
        isPhoneVerified: false,
        isActive: true,
        phone: '+1234567896',
        address: '147 Pet Owner Ave',
        city: 'Pet Owner City',
        postalCode: '12351',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Denver',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1995-12-03',
        gender: 'male' as const,
        emergencyContactName: 'Sarah Brown',
        emergencyContactPhone: '+1234567896',
        emergencyContactRelationship: 'Sister',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },
      {
        email: 'sarah.wilson@example.com',
        firstName: 'Sarah',
        lastName: 'Wilson',
        passwordHash,
        role: 'patient' as const,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1234567897',
        address: '258 Animal Street',
        city: 'Animal City',
        postalCode: '12352',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Los_Angeles',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1991-04-18',
        gender: 'female' as const,
        emergencyContactName: 'Mike Wilson',
        emergencyContactPhone: '+1234567897',
        emergencyContactRelationship: 'Brother',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        insuranceProvider: 'Cigna',
        insurancePolicyNumber: 'CIG345678',
        insuranceGroupNumber: 'GRP123',
        insuranceExpiryDate: '2025-12-31',
      },
      {
        email: 'dr.garcia@borzolini.com',
        firstName: 'Dr. Maria',
        lastName: 'Garcia',
        passwordHash,
        role: 'veterinarian' as const,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1234567898',
        address: '369 Veterinary Plaza',
        city: 'Vet Plaza',
        postalCode: '12353',
        country: 'USA',
        preferredLanguage: 'es',
        timezone: 'America/Phoenix',
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1987-01-30',
        gender: 'female' as const,
        emergencyContactName: 'Carlos Garcia',
        emergencyContactPhone: '+1234567898',
        emergencyContactRelationship: 'Spouse',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
      },
      {
        email: 'alex.chen@example.com',
        firstName: 'Alex',
        lastName: 'Chen',
        passwordHash,
        role: 'patient' as const,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        phone: '+1234567899',
        address: '741 Pet Care Drive',
        city: 'Pet Care City',
        postalCode: '12354',
        country: 'USA',
        preferredLanguage: 'en',
        timezone: 'America/Seattle',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1993-08-14',
        gender: 'prefer-not-to-say' as const,
        emergencyContactName: 'Jennifer Chen',
        emergencyContactPhone: '+1234567899',
        emergencyContactRelationship: 'Roommate',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        medications: 'None',
        insuranceProvider: 'UnitedHealth',
        insurancePolicyNumber: 'UHC901234',
        insuranceGroupNumber: 'GRP567',
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
      this.logger.log('   - nurse.wilson@borzolini.com (Staff)');
      this.logger.log('   - john.doe@example.com (Patient)');
      this.logger.log('   - jane.smith@example.com (Patient)');
      this.logger.log('   - mike.brown@example.com (Patient)');
      this.logger.log('   - sarah.wilson@example.com (Patient)');
      this.logger.log('   - alex.chen@example.com (Patient)');
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
    await this.userActivityRepository.clear();
    await this.userPreferencesRepository.clear();
    await this.userRepository.clear();
    this.logger.log('All users and related data cleared');
  }
}
