import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Clinic } from "./clinic.entity";

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

@Entity("clinic_operating_hours")
export class ClinicOperatingHours {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  clinic_id!: string;

  @Column({ type: "enum", enum: DayOfWeek })
  day_of_week!: DayOfWeek;

  @Column({ type: "time" })
  open_time!: string;

  @Column({ type: "time" })
  close_time!: string;

  @Column({ type: "boolean", default: false })
  is_closed!: boolean;

  @Column({ type: "time", nullable: true })
  break_start!: string;

  @Column({ type: "time", nullable: true })
  break_end!: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Clinic, (clinic) => clinic.operating_hours_detail)
  @JoinColumn({ name: "clinic_id" })
  clinic!: Clinic;
}
