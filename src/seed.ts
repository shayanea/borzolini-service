import { AppModule } from './app.module';
import { AppointmentsSeeder } from './modules/appointments/appointments.seeder';
import { BreedsSeeder } from './modules/breeds/breeds.seeder';
import { ClinicsSeeder } from './modules/clinics/clinics.seeder';
import { FaqSeeder } from './modules/faq/faq.seeder';
import { NestFactory } from '@nestjs/core';
import { PetsSeeder } from './modules/pets/pets.seeder';
import { ReviewsSeeder } from './modules/reviews/reviews.seeder';
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
    const reviewsSeeder = app.get(ReviewsSeeder);
    const faqSeeder = app.get(FaqSeeder);

    // Clear existing data first for fresh seeding (in correct order due to foreign key constraints)
    console.log('🧹 Clearing existing data...');
    // Clear in dependency order: child tables first, parent tables last
    await reviewsSeeder.clear(); // Clear reviews first (references appointments)
    await appointmentsSeeder.clear(); // Clear appointments second (references pets)
    await petsSeeder.clear(); // Clear pets third (references users, but has ai_health_insights referencing it)
    await clinicsSeeder.clear(); // Clear clinics fourth (references users)
    await usersSeeder.clear(); // Clear users last (referenced by others)
    await faqSeeder.clear();
    await breedsSeeder.clear();

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

    console.log('⭐ Seeding reviews...');
    await reviewsSeeder.seed();

    console.log('❓ Seeding FAQs...');
    await faqSeeder.seed();

    console.log('✅ Database seeding completed successfully!');
    console.log('🔑 Default password for all users: Password123!');
    console.log('');
    console.log('📧 Test users created (16 total):');
    console.log('   👨‍💼 Admins:');
    console.log('   - admin@borzolini.com (Admin)');
    console.log('   - shayan.araghi@borzolini.com (Admin - Clinic Owner)');
    console.log('   👩‍⚕️ Veterinarians:');
    console.log('   - dr.smith@borzolini.com (Dr. Sarah Smith)');
    console.log('   - dr.johnson@borzolini.com (Dr. Michael Johnson)');
    console.log('   - dr.garcia@borzolini.com (Dr. Maria Garcia)');
    console.log('   - dr.wilson@borzolini.com (Dr. David Wilson)');
    console.log('   - dr.brown@borzolini.com (Dr. Emily Brown)');
    console.log('   👩‍⚕️ Staff:');
    console.log('   - nurse.wilson@borzolini.com (Nurse Emily Wilson)');
    console.log('   - receptionist.martinez@borzolini.com (Sofia Martinez)');
    console.log('   👥 Patients:');
    console.log('   - john.doe@example.com (John Doe)');
    console.log('   - jane.smith@example.com (Jane Smith)');
    console.log('   - mike.brown@example.com (Mike Brown)');
    console.log('   - sarah.wilson@example.com (Sarah Wilson)');
    console.log('   - alex.chen@example.com (Alex Chen)');
    console.log('   - lisa.garcia@example.com (Lisa Garcia)');
    console.log('   - david.miller@example.com (David Miller)');
    console.log('');
    console.log('🏥 Clinics created (5 total):');
    console.log('   - Borzolini Pet Clinic (New York) - Main clinic');
    console.log('   - Happy Paws Veterinary Center (Los Angeles) - Preventive care');
    console.log('   - Emergency Pet Hospital (Chicago) - 24/7 emergency');
    console.log('   - Coastal Veterinary Clinic (Miami) - Exotic pets');
    console.log('   - Pacific Northwest Animal Hospital (Seattle) - Holistic care');
    console.log('');
    console.log('🐕 Sample pets created (12 total):');
    console.log('   - Buddy (Golden Retriever) - John Doe');
    console.log('   - Luna (Domestic Shorthair) - John Doe');
    console.log('   - Max (Labrador Retriever) - Jane Smith');
    console.log('   - Whiskers (Persian) - Jane Smith');
    console.log('   - Rocky (German Shepherd) - Mike Brown');
    console.log('   - Bella (Cavalier King Charles Spaniel) - Sarah Wilson');
    console.log('   - Oliver (Maine Coon) - Sarah Wilson');
    console.log('   - Shadow (Border Collie) - Alex Chen');
    console.log('   - Mittens (Ragdoll) - Alex Chen');
    console.log('   - Coco (Chihuahua) - Lisa Garcia');
    console.log('   - Simba (Siamese) - Lisa Garcia');
    console.log('   - Duke (Great Dane) - David Miller');
    console.log('   - Princess (British Shorthair) - David Miller');
    console.log('');
    console.log('📅 Sample appointments created (25 total):');
    console.log('   - Past appointments (completed) with real medical issues');
    console.log('   - Current appointments (confirmed/in-progress)');
    console.log('   - Telemedicine visits');
    console.log('   - Follow-up appointments');
    console.log('   - Future appointments (1-2 months ahead) at Borzolini Clinic');
    console.log('   - Emergency consultations and surgeries');
    console.log('');
    console.log('⭐ Sample reviews created (5 total):');
    console.log('   - Detailed reviews for completed appointments');
    console.log('   - Realistic feedback on medical treatments');
    console.log('   - Clinic responses to reviews');
    console.log('   - Verified reviews with photos');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
