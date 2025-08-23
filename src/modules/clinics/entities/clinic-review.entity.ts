import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from './clinic.entity';
import { User } from '../../users/entities/user.entity';

@Entity('clinic_reviews')
export class ClinicReview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  clinic_id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @Column({ type: 'int', default: 0 })
  is_helpful_count!: number;

  @Column({ type: 'boolean', default: false })
  is_reported!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => Clinic, (clinic) => clinic.reviews)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;

  @ManyToOne(() => User, (user) => user.clinic_reviews)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
