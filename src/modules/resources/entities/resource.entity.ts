import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

export enum ResourceType {
  VIDEO = 'video',
  DISCORD = 'discord',
  AUDIO = 'audio',
}

@Entity('resources')
export class Resource {
  @ApiProperty({ description: 'Unique identifier for the resource' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Type of resource', enum: ResourceType })
  @Column({ type: 'varchar', length: 50 })
  type!: ResourceType;

  @ApiProperty({ description: 'Title of the resource' })
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ApiProperty({ description: 'Description of the resource', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'URL to the resource' })
  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @ApiProperty({ description: 'Whether this resource is active and should be displayed' })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ description: 'Cover image URL or file path', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  cover?: string;

  @ApiProperty({ description: 'When this resource was created' })
  @CreateDateColumn()
  created_at!: Date;

  @ApiProperty({ description: 'When this resource was last updated' })
  @UpdateDateColumn()
  updated_at!: Date;
}

