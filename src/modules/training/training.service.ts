import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { TrainingActivity } from './entities/training-activity.entity';
import { PetSpecies } from '../breeds/entities/breed.entity';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingActivity) private readonly activityRepo: Repository<TrainingActivity>,
  ) {}

  async search(q: string, species?: PetSpecies, tags?: string[], difficulty?: string) {
    const like = `%${q}%`;
    const activities = await this.activityRepo.find({
      where: [{ title: ILike(like) }, { summary: ILike(like) }],
      take: 100,
      relations: ['by_species'],
    });
    let filtered = activities;
    if (species) {
      filtered = filtered.map((a) => ({ ...a, by_species: (a.by_species || []).filter((s) => s.species === species) }));
    }
    if (tags && tags.length) {
      filtered = filtered.filter((a) => (a.tags || []).some((t) => tags.includes(t)));
    }
    if (difficulty) {
      filtered = filtered.filter((a) => a.difficulty === difficulty);
    }
    return filtered;
  }

  async listBySpecies(species: PetSpecies) {
    const activities = await this.activityRepo.find({ relations: ['by_species'], take: 100 });
    return activities.map((a) => ({ ...a, by_species: (a.by_species || []).filter((s) => s.species === species) }));
  }
}


