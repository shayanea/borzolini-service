import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PetHost } from './pet-host.entity';

@Entity('pet_host_availability')
export class PetHostAvailability {
  @ApiProperty({ description: 'Unique identifier for the availability entry' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID of the host' })
  @Column({ type: 'uuid' })
  host_id!: string;

  @ApiProperty({ description: 'Start date of availability period' })
  @Column({ type: 'date' })
  start_date!: Date;

  @ApiProperty({ description: 'End date of availability period' })
  @Column({ type: 'date' })
  end_date!: Date;

  @ApiProperty({ description: 'Maximum pets available during this period' })
  @Column({ type: 'int', default: 1 })
  max_pets_available!: number;

  @ApiProperty({ description: 'Custom daily rate override (optional)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  custom_daily_rate?: number;

  @ApiProperty({ description: 'Whether this period is blocked' })
  @Column({ type: 'boolean', default: false })
  is_blocked!: boolean;

  @ApiProperty({ description: 'Date when the availability was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the availability was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => PetHost, (host) => host.availability)
  @JoinColumn({ name: 'host_id' })
  host!: PetHost;

  // Computed properties
  get durationDays(): number {
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  get isAvailable(): boolean {
    return !this.is_blocked && this.max_pets_available > 0;
  }

  includesDate(date: Date): boolean {
    const checkDate = new Date(date);
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    return checkDate >= start && checkDate <= end;
  }
}

