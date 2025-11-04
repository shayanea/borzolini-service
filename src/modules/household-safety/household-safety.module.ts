import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseholdSafetyService } from './household-safety.service';
import { HouseholdSafetyController } from './household-safety.controller';
import { FoodItem } from './entities/food-item.entity';
import { FoodSafetyBySpecies } from './entities/food-safety-by-species.entity';
import { FoodAlias } from './entities/food-alias.entity';
import { Plant } from './entities/plant.entity';
import { PlantToxicityBySpecies } from './entities/plant-toxicity-by-species.entity';
import { HouseholdItem } from './entities/household-item.entity';
import { ItemHazardBySpecies } from './entities/item-hazard-by-species.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoodItem,
      FoodSafetyBySpecies,
      FoodAlias,
      Plant,
      PlantToxicityBySpecies,
      HouseholdItem,
      ItemHazardBySpecies,
    ]),
  ],
  controllers: [HouseholdSafetyController],
  providers: [HouseholdSafetyService],
  exports: [HouseholdSafetyService],
})
export class HouseholdSafetyModule {}


