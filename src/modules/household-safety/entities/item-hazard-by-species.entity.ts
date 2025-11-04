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
  @Column({ type: 'enum', enum: HazardSeverity })
  severity!: HazardSeverity;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, nullable: true })
  risks?: string[] | null;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  emergency!: boolean;

  @ApiProperty({ description: 'Array of citations with title/url/org/reviewedAt' })
  @Column({ type: 'jsonb' })
  citations!: Array<{ title: string; url: string; org: string; reviewedAt?: string }>;
}


