#!/usr/bin/env ts-node

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { createConnection } from 'typeorm';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function verifyTable() {
  const logger = new Logger('TableVerifier');

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

    // Check if resources table exists
    const tableExists = await connection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'resources'
      );
    `);

    if (tableExists[0].exists) {
      logger.log('✅ Resources table exists!');
      
      // Get table structure
      const columns = await connection.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'resources'
        ORDER BY ordinal_position;
      `);

      logger.log('\n📋 Table structure:');
      columns.forEach((col: any) => {
        logger.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });

      // Check indexes
      const indexes = await connection.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'resources';
      `);

      logger.log(`\n📊 Indexes (${indexes.length}):`);
      indexes.forEach((idx: any) => {
        logger.log(`   - ${idx.indexname}`);
      });

      // Check triggers
      const triggers = await connection.query(`
        SELECT trigger_name, event_manipulation, action_timing
        FROM information_schema.triggers
        WHERE event_object_table = 'resources';
      `);

      logger.log(`\n🔔 Triggers (${triggers.length}):`);
      triggers.forEach((trig: any) => {
        logger.log(`   - ${trig.trigger_name} (${trig.action_timing} ${trig.event_manipulation})`);
      });

      // Count rows
      const count = await connection.query('SELECT COUNT(*) as count FROM resources');
      logger.log(`\n📈 Total rows: ${count[0].count}`);
    } else {
      logger.error('❌ Resources table does NOT exist!');
    }

    await connection.close();
    logger.log('\n🎉 Verification completed');
  } catch (error) {
    logger.error('❌ Error verifying table:', error);
    process.exit(1);
  }
}

verifyTable();

