import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FoodItem } from './food-item.entity';

@Entity('pet_food_aliases')
export class FoodAlias {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => FoodItem, (f) => f.aliases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'food_id' })
  food!: FoodItem;

  @ApiProperty()
  @Column({ type: 'text', unique: true })
  alias!: string;
}


