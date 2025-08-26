import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Clinic } from "./clinic.entity";
import { User } from "../../users/entities/user.entity";
import { Appointment } from "../../appointments/entities/appointment.entity";

export enum StaffRole {
  ADMIN = "admin",
  DOCTOR = "doctor",
  ASSISTANT = "assistant",
  RECEPTIONIST = "receptionist",
  TECHNICIAN = "technician",
}

@Entity("clinic_staff")
export class ClinicStaff {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  clinic_id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({ type: "enum", enum: StaffRole })
  role!: StaffRole;

  @Column({ type: "varchar", length: 255, nullable: true })
  specialization!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  license_number!: string;

  @Column({ type: "int", nullable: true })
  experience_years!: number;

  @Column({ type: "text", array: true, default: [] })
  education!: string[];

  @Column({ type: "text", array: true, default: [] })
  certifications!: string[];

  @Column({ type: "text", nullable: true })
  bio!: string;

  @Column({ type: "text", nullable: true })
  profile_photo_url!: string;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @Column({ type: "date", nullable: true })
  hire_date!: Date;

  @Column({ type: "date", nullable: true })
  termination_date!: Date;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Clinic, (clinic) => clinic.staff)
  @JoinColumn({ name: "clinic_id" })
  clinic!: Clinic;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => Appointment, (appointment) => appointment.staff)
  appointments!: Appointment[];
}
