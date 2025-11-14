#!/usr/bin/env ts-node

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkAllTables() {
  const logger = new Logger('TableChecker');

  try {
    const configService = new ConfigService();

    const connection = await createConnection({
      type: 'postgres',
      host: configService.get('LOCAL_DB_HOST', 'localhost'),
      port: configService.get('LOCAL_DB_PORT', 5432),
      username: configService.get('LOCAL_DB_USERNAME', 'postgres'),
      password: configService.get('LOCAL_DB_PASSWORD', 'postgres'),
      database: configService.get('LOCAL_DB_NAME', 'borzolini_clinic'),
      synchronize: false,
      logging: false,
    });

    logger.log('✅ Database connected\n');

    // Get all tables in the database
    const tables = await connection.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    logger.log(`📊 Found ${tables.length} tables in database:\n`);

    // Get all migration files
    const migrationsDir = join(__dirname, '../src/database/migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Map migration files to expected table names
    const migrationToTables: Record<string, string[]> = {
      '001-create-user-tables.sql': ['users', 'user_preferences'],
      '003-create-clinics-tables.sql': ['clinics', 'clinic_staff', 'clinic_services', 'clinic_hours'],
      '004-create-ai-health-insights.sql': ['ai_health_insights'],
      '005-create-pets-table.sql': ['pets'],
      '006-create-settings-table.sql': ['settings'],
      '007-create-breeds-table.sql': ['breeds'],
      '008-create-animal-faqs-table.sql': ['animal_faqs'],
      '009-create-pet-cases-tables.sql': ['clinic_pet_cases', 'clinic_case_timeline'],
      '011-create-appointment-reviews-table.sql': ['appointment_reviews'],
      '017-create-user-consents.sql': ['user_consents'],
      '022-create-appointments-table.sql': ['appointments'],
      '023-create-contacts-table.sql': ['contacts'],
      '028-create-household-safety-tables.sql': ['pet_food_items', 'pet_food_safety_by_species', 'pet_food_aliases'],
      '029-create-training-activities.sql': ['training_activities'],
      '035-create-pet-hosting-tables.sql': ['pet_hosts', 'pet_hosting_bookings', 'pet_hosting_availability', 'pet_hosting_reviews', 'pet_hosting_photos'],
      '036-create-resources-table.sql': ['resources'],
      '1731243600000-add-google-oauth.sql': [], // This might not create tables
      '1762890164000-add-origin-history-resources-to-breeds.sql': [], // This modifies existing table
      '1762892230000-create-walk-groups-tables.sql': ['walk_groups', 'walk_group_members'],
      '1762892230001-create-daily-training-assignments.sql': ['daily_training_assignments'],
    };

    const tableNames = tables.map((t: any) => t.table_name);
    const expectedTables = new Set<string>();
    
    // Collect all expected tables from migrations
    Object.values(migrationToTables).forEach(tables => {
      tables.forEach(table => expectedTables.add(table));
    });

    // Check which migrations have been applied
    const appliedMigrations: string[] = [];
    const pendingMigrations: string[] = [];
    const partiallyAppliedMigrations: string[] = [];

    for (const file of migrationFiles) {
      const expectedTablesForMigration = migrationToTables[file] || [];
      
      if (expectedTablesForMigration.length === 0) {
        // Migration doesn't create tables (might be alter/add columns)
        // We'll mark these as unknown
        continue;
      }

      const allTablesExist = expectedTablesForMigration.every(table => tableNames.includes(table));
      const someTablesExist = expectedTablesForMigration.some(table => tableNames.includes(table));

      if (allTablesExist) {
        appliedMigrations.push(file);
      } else if (someTablesExist) {
        partiallyAppliedMigrations.push(file);
      } else {
        pendingMigrations.push(file);
      }
    }

    logger.log('✅ Successfully Applied Migrations:');
    if (appliedMigrations.length > 0) {
      appliedMigrations.forEach(file => {
        const tables = migrationToTables[file] || [];
        logger.log(`   ✓ ${file}`);
        if (tables.length > 0) {
          logger.log(`     Tables: ${tables.join(', ')}`);
        }
      });
    } else {
      logger.log('   (none found via table checking)');
    }
    logger.log('');

    if (partiallyAppliedMigrations.length > 0) {
      logger.warn('⚠️  Partially Applied Migrations:');
      partiallyAppliedMigrations.forEach(file => {
        const tables = migrationToTables[file] || [];
        const existing = tables.filter(t => tableNames.includes(t));
        const missing = tables.filter(t => !tableNames.includes(t));
        logger.warn(`   ⚠ ${file}`);
        logger.warn(`     Existing: ${existing.join(', ')}`);
        logger.warn(`     Missing: ${missing.join(', ')}`);
      });
      logger.log('');
    }

    if (pendingMigrations.length > 0) {
      logger.warn('❌ Pending Migrations (tables not found):');
      pendingMigrations.forEach(file => {
        const tables = migrationToTables[file] || [];
        logger.warn(`   ✗ ${file}`);
        if (tables.length > 0) {
          logger.warn(`     Expected tables: ${tables.join(', ')}`);
        }
      });
      logger.log('');
    }

    // Show all tables that exist but aren't mapped
    const unmappedTables = tableNames.filter((t: string) => 
      !Array.from(expectedTables).includes(t) && 
      t !== 'migrations' && 
      !t.startsWith('pg_') &&
      !t.startsWith('sql_')
    );

    if (unmappedTables.length > 0) {
      logger.log('📋 Other Tables Found (not mapped to migrations):');
      unmappedTables.forEach((table: string) => {
        logger.log(`   - ${table}`);
      });
      logger.log('');
    }

    // Summary
    logger.log('📈 Summary:');
    logger.log(`   Total migration files: ${migrationFiles.length}`);
    logger.log(`   Applied (verified): ${appliedMigrations.length}`);
    logger.log(`   Partially applied: ${partiallyAppliedMigrations.length}`);
    logger.log(`   Pending: ${pendingMigrations.length}`);
    logger.log(`   Total tables in DB: ${tableNames.length}`);
    logger.log(`   Expected tables: ${expectedTables.size}`);

    await connection.close();
    logger.log('\n🎉 Table check completed');
  } catch (error) {
    logger.error('❌ Error checking tables:', error);
    process.exit(1);
  }
}

checkAllTables();

