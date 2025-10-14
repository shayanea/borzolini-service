#!/usr/bin/env ts-node

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../app.module';

async function applySqlMigration() {
  const logger = new Logger('SqlMigrationRunner');
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    logger.error('❌ Please provide a migration file path as an argument');
    logger.log('Usage: pnpm tsx src/scripts/apply-sql-migration.ts <migration-file>');
    process.exit(1);
  }

  try {
    logger.log(`🚀 Applying SQL migration: ${migrationFile}`);

    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    if (!dataSource.isInitialized) {
      logger.log('⏳ Waiting for database connection...');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (!dataSource.isInitialized) {
      throw new Error('Database connection not established');
    }

    logger.log('✅ Database connected');

    // Read migration file
    const migrationPath = path.resolve(migrationFile);
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
    logger.log('📄 Migration file loaded successfully');

    // Execute migration
    logger.log('⚡ Executing migration...');
    await dataSource.query(sqlContent);
    logger.log('✅ Migration applied successfully');

    await app.close();
    logger.log('🎉 Migration process completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applySqlMigration();
