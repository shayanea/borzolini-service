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

  @Column({ type: 'text', nullable: true, name: 'emergency' })
  emergency?: string;

  @Column({ type: 'text', nullable: true, name: 'treatment_info' })
  treatmentInfo?: string;

  @Column({ type: 'jsonb', nullable: true })
  citations?: string[];
}


