import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppointmentsSeeder } from './modules/appointments/appointments.seeder';
import { BreedsSeeder } from './modules/breeds/breeds.seeder';
import { ClinicsSeeder } from './modules/clinics/clinics.seeder';
import { FaqSeeder } from './modules/faq/faq.seeder';
import { PetsSeeder } from './modules/pets/pets.seeder';
import { UsersSeeder } from './modules/users/users.seeder';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersSeeder = app.get(UsersSeeder);
    const breedsSeeder = app.get(BreedsSeeder);
    const clinicsSeeder = app.get(ClinicsSeeder);
    const petsSeeder = app.get(PetsSeeder);
    const appointmentsSeeder = app.get(AppointmentsSeeder);
    const faqSeeder = app.get(FaqSeeder);

    // Seed in order of dependencies
    console.log('👥 Seeding users...');
    await usersSeeder.seed();

    console.log('🐕 Seeding breeds...');
    await breedsSeeder.seed();

    console.log('🏥 Seeding clinics...');
    await clinicsSeeder.seed();

    console.log('🐕 Seeding pets...');
    await petsSeeder.seed();

    console.log('📅 Seeding appointments...');
    await appointmentsSeeder.seed();

    console.log('❓ Seeding FAQs...');
    await faqSeeder.seed();

    console.log('✅ Database seeding completed successfully!');
    console.log('🔑 Default password for all users: Password123!');
    console.log('📧 Test users created:');
    console.log('   - admin@borzolini.com (Admin)');
    console.log('   - shayan.araghi@borzolini.com (Admin - Clinic Owner)');
    console.log('   - dr.smith@borzolini.com (Veterinarian)');
    console.log('   - dr.johnson@borzolini.com (Veterinarian)');
    console.log('   - dr.garcia@borzolini.com (Veterinarian)');
    console.log('   - nurse.wilson@borzolini.com (Staff)');
    console.log('   - john.doe@example.com (Patient)');
    console.log('   - jane.smith@example.com (Patient)');
    console.log('   - mike.brown@example.com (Patient)');
    console.log('   - sarah.wilson@example.com (Patient)');
    console.log('   - alex.chen@example.com (Patient)');

    console.log('🐕 Sample pets created:');
    console.log('   - Buddy (Golden Retriever) - John Doe');
    console.log('   - Luna (Domestic Shorthair) - John Doe');
    console.log('   - Max (Labrador Retriever) - Jane Smith');
    console.log('   - Whiskers (Persian) - Jane Smith');
    console.log('   - Rocky (German Shepherd) - Mike Brown');
    console.log('   - Bella (Cavalier King Charles Spaniel) - Sarah Wilson');
    console.log('   - Oliver (Maine Coon) - Sarah Wilson');
    console.log('   - Shadow (Border Collie) - Alex Chen');
    console.log('   - Mittens (Ragdoll) - Alex Chen');

    console.log('📅 Sample appointments created:');
    console.log('   - Wellness exams, vaccinations, dental cleanings');
    console.log('   - Emergency consultations, telemedicine visits');
    console.log('   - Follow-up appointments and upcoming schedules');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
