#!/usr/bin/env ts-node

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createConnection } from 'typeorm';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runSqlMigration(migrationFileName: string) {
  const logger = new Logger('SqlMigrationRunner');

  logger.log(`🚀 Running SQL migration: ${migrationFileName}`);

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

    // Read the migration file
    const migrationPath = join(__dirname, '../src/database/migrations', migrationFileName);
    const migrationSql = readFileSync(migrationPath, 'utf-8');

    logger.log(`📄 Executing migration SQL...`);

    // Split the SQL by semicolons and execute each statement
    const statements = migrationSql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        logger.log(`🔄 Executing: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
      }
    }

    logger.log('✅ Migration executed successfully');

    await connection.close();
    logger.log('🎉 Migration process completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Get migration file name from command line arguments
const migrationFileName = process.argv[2];
if (!migrationFileName) {
  console.error('Usage: ts-node scripts/run-sql-migration.ts <migration-file-name>');
  console.error('Example: ts-node scripts/run-sql-migration.ts 018-remove-user-medical-fields.sql');
  process.exit(1);
}

runSqlMigration(migrationFileName);
