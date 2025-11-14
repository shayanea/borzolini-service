import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PetHost } from './pet-host.entity';

export enum PhotoCategory {
  PROFILE = 'profile',
  FACILITY = 'facility',
  OUTDOOR_SPACE = 'outdoor_space',
  INDOOR_SPACE = 'indoor_space',
  AMENITIES = 'amenities',
}

@Entity('pet_host_photos')
export class PetHostPhoto {
  @ApiProperty({ description: 'Unique identifier for the photo' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID of the host' })
  @Column({ type: 'uuid' })
  host_id!: string;

  @ApiProperty({ description: 'Photo URL' })
  @Column({ type: 'text' })
  photo_url!: string;

  @ApiProperty({ description: 'Photo caption' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  caption?: string;

  @ApiProperty({ description: 'Photo category', enum: PhotoCategory })
  @Column({ type: 'enum', enum: PhotoCategory })
  category!: PhotoCategory;

  @ApiProperty({ description: 'Whether this is the primary photo' })
  @Column({ type: 'boolean', default: false })
  is_primary!: boolean;

  @ApiProperty({ description: 'Whether the photo is active' })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ description: 'Date when the photo was uploaded' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  // Relationships
  @ManyToOne(() => PetHost, (host) => host.photos)
  @JoinColumn({ name: 'host_id' })
  host!: PetHost;
}

