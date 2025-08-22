import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from './user.entity';

export interface NotificationSettings {
  email: {
    appointments: boolean;
    reminders: boolean;
    healthAlerts: boolean;
    marketing: boolean;
    newsletter: boolean;
  };
  sms: {
    appointments: boolean;
    reminders: boolean;
    healthAlerts: boolean;
  };
  push: {
    appointments: boolean;
    reminders: boolean;
    healthAlerts: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showPhone: boolean;
  showAddress: boolean;
  showEmail: boolean;
  allowContact: boolean;
}

export interface CommunicationPreferences {
  preferredLanguage: string;
  preferredContactMethod: 'email' | 'sms' | 'phone';
  timezone: string;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
}

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'jsonb',
    default: {
      email: {
        appointments: true,
        reminders: true,
        healthAlerts: true,
        marketing: false,
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
    } as NotificationSettings,
  })
  notificationSettings: NotificationSettings;

  @Column({
    type: 'jsonb',
    default: {
      profileVisibility: 'public',
      showPhone: true,
      showAddress: false,
      showEmail: false,
      allowContact: true,
    } as PrivacySettings,
  })
  privacySettings: PrivacySettings;

  @Column({
    type: 'jsonb',
    default: {
      preferredLanguage: 'en',
      preferredContactMethod: 'email',
      timezone: 'UTC',
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
    } as CommunicationPreferences,
  })
  communicationPreferences: CommunicationPreferences;

  @Column({ type: 'varchar', length: 100, nullable: true })
  theme: 'light' | 'dark' | 'auto';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
