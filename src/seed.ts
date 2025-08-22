import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { UsersSeeder } from './modules/users/users.seeder';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersSeeder = app.get(UsersSeeder);

    await usersSeeder.seed();

    console.log('✅ Database seeding completed successfully!');
    console.log('🔑 Default password for all users: Password123!');
    console.log('📧 Test users created:');
    console.log('   - admin@borzolini.com (Admin)');
    console.log('   - dr.smith@borzolini.com (Veterinarian)');
    console.log('   - dr.johnson@borzolini.com (Veterinarian)');
    console.log('   - nurse.wilson@borzolini.com (Staff)');
    console.log('   - john.doe@example.com (Patient)');
    console.log('   - jane.smith@example.com (Patient)');
    console.log('   - mike.brown@example.com (Patient)');
    console.log('   - sarah.wilson@example.com (Patient)');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
