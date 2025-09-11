#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { AppointmentsService } from '../modules/appointments/appointments.service';
import { AppointmentType } from '../modules/appointments/entities/appointment.entity';
import { Clinic } from '../modules/clinics/entities/clinic.entity';
import { Pet } from '../modules/pets/entities/pet.entity';
import { User, UserRole } from '../modules/users/entities/user.entity';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const dataSource = app.get(DataSource);
    const usersRepo: Repository<User> = dataSource.getRepository(User);
    const petsRepo: Repository<Pet> = dataSource.getRepository(Pet);
    const clinicsRepo: Repository<Clinic> = dataSource.getRepository(Clinic);
    const appointmentsService = app.get(AppointmentsService);

    const owner = await usersRepo.findOne({ where: { role: UserRole.PATIENT } });
    if (!owner) throw new Error('No patient user found. Seed the database first.');

    const pet = await petsRepo.findOne({ where: { owner_id: owner.id } as any });
    if (!pet) throw new Error('No pet found for the owner.');

    const clinic = await clinicsRepo.findOne({ where: {} });
    if (!clinic) throw new Error('No clinic found.');

    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + 2); // ensure >24h lead time
    scheduled.setHours(10, 0, 0, 0);

    const created = await appointmentsService.create(
      {
        appointment_type: AppointmentType.VACCINATION,
        scheduled_date: scheduled.toISOString(),
        duration_minutes: 30,
        notes: 'Test appointment with pet anxiety mode enabled',
        is_telemedicine: false,
        is_home_visit: true,
        pet_anxiety_mode: true,
        pet_id: (pet as any).id,
        clinic_id: (clinic as any).id,
      } as any,
      owner.id
    );

    const reloaded = await dataSource.getRepository('appointments').findOne({ where: { id: (created as any).id } as any });

    console.log('✅ Created appointment with pet_anxiety_mode:', {
      id: (created as any).id,
      pet_id: (created as any).pet_id,
      clinic_id: (created as any).clinic_id,
      scheduled_date: (created as any).scheduled_date,
      is_home_visit: (created as any).is_home_visit,
      pet_anxiety_mode: (reloaded as any)?.pet_anxiety_mode,
    });
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('❌ Failed to create test appointment:', err);
  process.exit(1);
});
