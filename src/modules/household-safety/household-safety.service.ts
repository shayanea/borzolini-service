import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { FoodItem } from './entities/food-item.entity';
import { FoodAlias } from './entities/food-alias.entity';
import { Plant } from './entities/plant.entity';
import { HouseholdItem } from './entities/household-item.entity';
import { PetSpecies } from '../breeds/entities/breed.entity';

@Injectable()
export class HouseholdSafetyService {
  constructor(
    @InjectRepository(FoodItem) private readonly foodRepo: Repository<FoodItem>,
    @InjectRepository(FoodAlias) private readonly aliasRepo: Repository<FoodAlias>,
    @InjectRepository(Plant) private readonly plantRepo: Repository<Plant>,
    @InjectRepository(HouseholdItem) private readonly itemRepo: Repository<HouseholdItem>,
  ) {}

  async searchAll(query: string, species?: PetSpecies) {
    const q = `%${query}%`;
    const [foods, plants, items] = await Promise.all([
      this.foodRepo.find({
        where: [{ canonical_name: ILike(q) }, { scientific_name: ILike(q) }],
        take: 25,
        relations: ['safety_by_species'],
      }),
      this.plantRepo.find({
        where: [{ canonical_name: ILike(q) }, { scientific_name: ILike(q) }],
        take: 25,
        relations: ['toxicity_by_species'],
      }),
      this.itemRepo.find({ where: { canonical_name: ILike(q) }, take: 25, relations: ['hazards_by_species'] }),
    ]);

    const filterBySpecies = (arr: any[], key: string) =>
      species
        ? arr.map((a) => ({ ...a, [key]: (a[key] || []).filter((s: any) => s.species === species) }))
        : arr;

    return {
      foods: filterBySpecies(foods, 'safety_by_species'),
      plants: filterBySpecies(plants, 'toxicity_by_species'),
      items: filterBySpecies(items, 'hazards_by_species'),
    };
  }

  async listFoods(species?: PetSpecies) {
    const foods = await this.foodRepo.find({ relations: ['safety_by_species'], take: 100 });
    return species ? foods.map((f) => ({ ...f, safety_by_species: (f.safety_by_species || []).filter((s) => s.species === species) })) : foods;
  }

  async listPlants(species?: PetSpecies) {
    const plants = await this.plantRepo.find({ relations: ['toxicity_by_species'], take: 100 });
    return species
      ? plants.map((p) => ({ ...p, toxicity_by_species: (p.toxicity_by_species || []).filter((t) => t.species === species) }))
      : plants;
  }

  async listItems(species?: PetSpecies) {
    const items = await this.itemRepo.find({ relations: ['hazards_by_species'], take: 100 });
    return species
      ? items.map((i) => ({ ...i, hazards_by_species: (i.hazards_by_species || []).filter((h) => h.species === species) }))
      : items;
  }

  async resolveFoodAlias(alias: string) {
    const record = await this.aliasRepo.findOne({ where: { alias: ILike(alias) }, relations: ['food'] });
    return record?.food ?? null;
  }
}


