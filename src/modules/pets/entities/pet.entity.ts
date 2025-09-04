import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { AiHealthInsight } from '../../ai-health/entities/ai-health-insight.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Breed } from '../../breeds/entities/breed.entity';
import { ClinicPetCase } from '../../clinics/entities/pet-case.entity';
import { User } from '../../users/entities/user.entity';

export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  FISH = 'fish',
  REPTILE = 'reptile',
  HORSE = 'horse',
  OTHER = 'other',
}

export enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

export enum PetSize {
  TINY = 'tiny', // < 5 lbs
  SMALL = 'small', // 5-20 lbs
  MEDIUM = 'medium', // 20-50 lbs
  LARGE = 'large', // 50-100 lbs
  GIANT = 'giant', // > 100 lbs
}

@Entity('pets')
export class Pet {
  @ApiProperty({ description: 'Unique identifier for the pet' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Name of the pet' })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @ApiProperty({ description: 'Species of the pet', enum: PetSpecies })
  @Column({ type: 'enum', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ description: 'Breed of the pet (legacy field)' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  breed?: string;

  @ApiProperty({ description: 'Gender of the pet', enum: PetGender })
  @Column({ type: 'enum', enum: PetGender, default: PetGender.UNKNOWN })
  gender!: PetGender;

  @ApiProperty({ description: 'Date of birth of the pet' })
  @Column({ type: 'date', nullable: true })
  date_of_birth?: Date;

  @ApiProperty({ description: 'Weight of the pet in pounds' })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @ApiProperty({ description: 'Size category of the pet', enum: PetSize })
  @Column({ type: 'enum', enum: PetSize, nullable: true })
  size?: PetSize;

  @ApiProperty({ description: 'Color/markings of the pet' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  color?: string;

  @ApiProperty({ description: 'Microchip number if available' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  microchip_number?: string;

  @ApiProperty({ description: 'Whether the pet is spayed/neutered' })
  @Column({ type: 'boolean', default: false })
  is_spayed_neutered!: boolean;

  @ApiProperty({ description: 'Whether the pet is vaccinated' })
  @Column({ type: 'boolean', default: false })
  is_vaccinated!: boolean;

  @ApiProperty({ description: 'Medical history and notes' })
  @Column({ type: 'text', nullable: true })
  medical_history?: string;

  @ApiProperty({ description: 'Behavioral notes' })
  @Column({ type: 'text', nullable: true })
  behavioral_notes?: string;

  @ApiProperty({ description: 'Special dietary requirements' })
  @Column({ type: 'text', nullable: true })
  dietary_requirements?: string;

  @ApiProperty({ description: 'Allergies and sensitivities' })
  @Column({ type: 'jsonb', default: [] })
  allergies!: string[];

  @ApiProperty({ description: 'Current medications' })
  @Column({ type: 'jsonb', default: [] })
  medications!: string[];

  @ApiProperty({ description: 'Emergency contact information' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  emergency_contact?: string;

  @ApiProperty({ description: 'Emergency phone number' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_phone?: string;

  @ApiProperty({ description: 'Profile photo URL' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  photo_url?: string;

  @ApiProperty({ description: 'Whether the pet is active' })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ApiProperty({ description: 'Date when the pet was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ApiProperty({ description: 'Date when the pet was last updated' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // Foreign Keys-+
  @ApiProperty({ description: 'ID of the pet owner' })
  @Column({ type: 'uuid' })
  owner_id!: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.pets)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @ManyToOne(() => Breed, (breed) => breed.pets, { nullable: true })
  @JoinColumn({ name: 'breed_id' })
  breed_relation?: Breed;

  @OneToMany(() => Appointment, (appointment) => appointment.pet)
  appointments!: Appointment[];

  @OneToMany(() => AiHealthInsight, (insight) => insight.pet)
  ai_insights!: AiHealthInsight[];

  @OneToMany(() => ClinicPetCase, (petCase) => petCase.pet)
  clinic_cases!: ClinicPetCase[];

  // Computed properties (not stored in database)
  get age(): number | null {
    if (!this.date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  get ageInMonths(): number | null {
    if (!this.date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    const yearDiff = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    return yearDiff * 12 + monthDiff;
  }
}
