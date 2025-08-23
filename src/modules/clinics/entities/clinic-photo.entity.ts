import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Clinic } from './clinic.entity';

export enum PhotoCategory {
  FACILITY = 'facility',
  STAFF = 'staff',
  EQUIPMENT = 'equipment',
  WAITING_AREA = 'waiting_area',
  EXAMINATION_ROOM = 'examination_room',
  SURGERY_ROOM = 'surgery_room',
  LABORATORY = 'laboratory',
  RECEPTION = 'reception',
  EXTERIOR = 'exterior',
  OTHER = 'other',
}

@Entity('clinic_photos')
export class ClinicPhoto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  clinic_id!: string;

  @Column({ type: 'text' })
  photo_url!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  caption!: string;

  @Column({ type: 'enum', enum: PhotoCategory })
  category!: PhotoCategory;

  @Column({ type: 'boolean', default: false })
  is_primary!: boolean;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  // Relationships
  @ManyToOne(() => Clinic, (clinic) => clinic.photos)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;
}
