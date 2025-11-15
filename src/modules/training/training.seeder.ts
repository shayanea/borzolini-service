import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingActivity, ActivityDifficulty } from './entities/training-activity.entity';
import { TrainingActivitySpecies } from './entities/training-activity-species.entity';
import { PetSpecies } from '../breeds/entities/breed.entity';
import * as crypto from 'crypto';

@Injectable()
export class TrainingSeeder {
  private readonly logger = new Logger(TrainingSeeder.name);

  constructor(
    @InjectRepository(TrainingActivity) private readonly activityRepo: Repository<TrainingActivity>,
    @InjectRepository(TrainingActivitySpecies) private readonly activitySpeciesRepo: Repository<TrainingActivitySpecies>,
  ) {}

  private createHash(data: string): Buffer {
    return crypto.createHash('sha256').update(data).digest();
  }

  async seed() {
    this.logger.log('🌱 Starting training activities seeding...');
    await this.seedActivities();
    this.logger.log('✅ Training activities seeding completed.');
  }

  async clear() {
    this.logger.log('🧹 Clearing training activities data...');
    // Clear dependent table first
    await this.activitySpeciesRepo.query('DELETE FROM "training_activity_species"');
    // Clear parent table
    await this.activityRepo.query('DELETE FROM "training_activities"');
  }

  async seedActivities() {
    const activities = [
      {
        title: 'Sit Command',
        summary: 'Teach your pet to sit on command.',
        content_markdown: '1. Hold a treat near your pet\'s nose.\n2. Move your hand up, allowing their head to follow the treat and causing their bottom to lower.\n3. Once they’re in a sitting position, say “Sit,” give them the treat, and share affection.',
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 5,
        tags: ['obedience', 'basic'],
        species_info: [
          { species: PetSpecies.DOG, suitability: 'Great for all ages.' },
          { species: PetSpecies.CAT, suitability: 'Best for curious and food-motivated cats.' },
        ],
      },
      {
        title: 'Foraging Box for Birds',
        summary: 'Encourage natural foraging behavior in your bird.',
        content_markdown: '1. Get a small, bird-safe cardboard box.\n2. Fill it with bird-safe materials like shredded paper, wooden beads, and hay.\n3. Hide some of their favorite treats inside.\n4. Let your bird explore and find the treats.',
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 15,
        tags: ['enrichment', 'foraging'],
        species_info: [
          { species: PetSpecies.BIRD, suitability: 'Excellent for parrots and other intelligent birds.' },
        ],
      },
    ];

    for (const activityData of activities) {
      const { species_info, ...itemData } = activityData;
      const activity = this.activityRepo.create({
        ...itemData,
        hash: this.createHash(activityData.title),
      });
      const savedActivity = await this.activityRepo.save(activity);

      if (species_info) {
        for (const info of species_info) {
          const speciesData = this.activitySpeciesRepo.create({
            ...info,
            activity: savedActivity,
          });
          await this.activitySpeciesRepo.save(speciesData);
        }
      }
    }
  }
}
