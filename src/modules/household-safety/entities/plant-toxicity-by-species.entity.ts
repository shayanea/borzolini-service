import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Plant, PlantToxicityLevel } from './plant.entity';
import { PetSpecies } from '../../breeds/entities/breed.entity';

@Entity('household_plant_toxicity_by_species')
export class PlantToxicityBySpecies {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Plant, (p) => p.toxicity_by_species, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plant_id' })
  plant!: Plant;

  @ApiProperty({ enum: PetSpecies })
  @Column({ type: 'enum', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ enum: PlantToxicityLevel })
  @Column({ 
    type: 'enum', 
    enum: PlantToxicityLevel,
    enumName: 'plant_toxicity_level'  // Explicit enum name for PostgreSQL
  })
  toxicity!: PlantToxicityLevel;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, nullable: true })
  clinical_signs?: string[] | null;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  emergency!: boolean;

  @ApiProperty({ description: 'Array of citations with title/url/org/reviewedAt' })
  @Column({ type: 'jsonb' })
  citations!: Array<{ title: string; url: string; org: string; reviewedAt?: string }>;
}


