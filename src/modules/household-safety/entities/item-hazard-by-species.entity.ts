import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HouseholdItem, HazardSeverity } from './household-item.entity';
import { PetSpecies } from '../../breeds/entities/breed.entity';

@Entity('household_item_hazards_by_species')
export class ItemHazardBySpecies {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => HouseholdItem, (i) => i.hazards_by_species, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: HouseholdItem;

  @ApiProperty({ enum: PetSpecies })
  @Column({ type: 'enum', enum: PetSpecies })
  species!: PetSpecies;

  @ApiProperty({ enum: HazardSeverity })
  @Column({ 
    type: 'enum', 
    enum: HazardSeverity,
    enumName: 'hazard_severity'  // Explicit enum name for PostgreSQL
  })
  severity!: HazardSeverity;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, nullable: true })
  risks?: string[] | null;

  @Column({ type: 'text', nullable: true, name: 'emergency' })
  emergency?: string;

  @Column({ type: 'text', nullable: true, name: 'treatment_info' })
  treatmentInfo?: string;

  @Column({ type: 'jsonb', nullable: true })
  citations?: string[];
}


