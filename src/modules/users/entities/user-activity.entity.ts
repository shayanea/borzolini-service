import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "./user.entity";

export enum ActivityType {
  LOGIN = "login",
  LOGOUT = "logout",
  REGISTER = "register",
  PROFILE_UPDATE = "profile_update",
  PASSWORD_CHANGE = "password_change",
  EMAIL_VERIFICATION = "email_verification",
  PHONE_VERIFICATION = "phone_verification",
  APPOINTMENT_BOOKING = "appointment_booking",
  APPOINTMENT_CANCELLATION = "appointment_cancellation",
  PET_ADDED = "pet_added",
  PET_UPDATED = "pet_updated",
  SETTINGS_CHANGED = "settings_changed",
  PREFERENCES_UPDATED = "preferences_updated",
}

export enum ActivityStatus {
  SUCCESS = "success",
  FAILED = "failed",
  PENDING = "pending",
}

@Entity("user_activities")
export class UserActivity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "enum", enum: ActivityType })
  type!: ActivityType;

  @Column({ type: "enum", enum: ActivityStatus })
  status!: ActivityStatus;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: any;

  @Column({ name: "ip_address", nullable: true })
  ipAddress!: string;

  @Column({ name: "user_agent", nullable: true })
  userAgent!: string;

  @Column({ nullable: true })
  location!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  // Helper method to get activity summary
  getActivitySummary(): string {
    switch (this.type) {
      case ActivityType.LOGIN:
        return `User logged in from ${this.location || "unknown location"}`;
      case ActivityType.LOGOUT:
        return "User logged out";
      case ActivityType.REGISTER:
        return "User registered new account";
      case ActivityType.PROFILE_UPDATE:
        return "User updated profile information";
      case ActivityType.PASSWORD_CHANGE:
        return "User changed password";
      case ActivityType.EMAIL_VERIFICATION:
        return "User verified email address";
      case ActivityType.PHONE_VERIFICATION:
        return "User verified phone number";
      case ActivityType.APPOINTMENT_BOOKING:
        return "User booked an appointment";
      case ActivityType.APPOINTMENT_CANCELLATION:
        return "User cancelled an appointment";
      case ActivityType.PET_ADDED:
        return "User added a new pet";
      case ActivityType.PET_UPDATED:
        return "User updated pet information";
      case ActivityType.SETTINGS_CHANGED:
        return "User changed account settings";
      case ActivityType.PREFERENCES_UPDATED:
        return "User updated preferences";
      default:
        return this.description || "Activity performed";
    }
  }
}
