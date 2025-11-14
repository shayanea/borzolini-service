#!/usr/bin/env ts-node

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkMigrations() {
  const logger = new Logger('MigrationChecker');

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

    logger.log('✅ Database connected');

    // Get all migration files
    const migrationsDir = join(__dirname, '../src/database/migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    logger.log(`📋 Found ${migrationFiles.length} migration files`);

    // Check if migrations table exists
    const migrationsTableExists = await connection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);

    if (!migrationsTableExists[0].exists) {
      logger.warn('⚠️  Migrations table does not exist. This might mean migrations are tracked differently.');
      await connection.close();
      return;
    }

    // Get executed migrations
    const executedMigrations = await connection.query(`
      SELECT name, timestamp 
      FROM migrations 
      ORDER BY timestamp ASC;
    `);

    logger.log(`\n📊 Migration Status:\n`);
    logger.log(`Executed: ${executedMigrations.length} migrations`);
    logger.log(`Total files: ${migrationFiles.length} migrations\n`);

    // Check which migrations have been executed
    const executedNames = executedMigrations.map((m: any) => m.name);
    const pendingMigrations: string[] = [];
    const executedMigrationsList: string[] = [];

    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');
      if (executedNames.includes(migrationName)) {
        executedMigrationsList.push(file);
      } else {
        pendingMigrations.push(file);
      }
    }

    if (executedMigrationsList.length > 0) {
      logger.log('✅ Executed migrations:');
      executedMigrationsList.forEach(file => {
        logger.log(`   ✓ ${file}`);
      });
      logger.log('');
    }

    if (pendingMigrations.length > 0) {
      logger.warn('⚠️  Pending migrations:');
      pendingMigrations.forEach(file => {
        logger.warn(`   ✗ ${file}`);
      });
      logger.log('');
    } else {
      logger.log('✅ All migrations have been executed!\n');
    }

    // Show recent migrations
    if (executedMigrations.length > 0) {
      logger.log('📚 Recent migrations (last 10):');
      const recent = executedMigrations.slice(-10).reverse();
      recent.forEach((migration: any) => {
        const date = new Date(migration.timestamp).toISOString();
        logger.log(`   - ${migration.name} (${date})`);
      });
    }

    await connection.close();
    logger.log('\n🎉 Migration check completed');
  } catch (error) {
    logger.error('❌ Error checking migrations:', error);
    process.exit(1);
  }
}

checkMigrations();

