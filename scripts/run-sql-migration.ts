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

    // Remove comments and split by semicolons, but preserve function definitions
    // First, remove single-line comments
    let cleanedSql = migrationSql
      .split('\n')
      .map(line => {
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n');

    // Split by semicolons, but be careful with function definitions
    // We'll split by semicolons that are not inside $$ blocks
    const statements: string[] = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarTag = '';

    for (let i = 0; i < cleanedSql.length; i++) {
      const char = cleanedSql[i];

      // Check for dollar quoting start/end
      if (char === '$' && !inDollarQuote) {
        // Look ahead to find the dollar tag
        let tagEnd = cleanedSql.indexOf('$', i + 1);
        if (tagEnd > i) {
          dollarTag = cleanedSql.substring(i, tagEnd + 1);
          inDollarQuote = true;
          currentStatement += dollarTag;
          i = tagEnd;
          continue;
        }
      } else if (inDollarQuote && cleanedSql.substring(i).startsWith(dollarTag)) {
        currentStatement += dollarTag;
        i += dollarTag.length - 1;
        inDollarQuote = false;
        dollarTag = '';
        continue;
      }

      currentStatement += char;

      // If we're not in a dollar quote and we hit a semicolon, it's a statement end
      if (!inDollarQuote && char === ';') {
        const trimmed = currentStatement.trim();
        if (trimmed.length > 0) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }

    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        logger.log(`🔄 Executing: ${statement.substring(0, 50).replace(/\s+/g, ' ')}...`);
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
