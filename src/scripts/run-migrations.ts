#!/usr/bin/env ts-node

import { AppModule } from "../app.module";
import { DataSource } from "typeorm";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

async function runMigrations() {
  const logger = new Logger("MigrationRunner");
  logger.log("🚀 Starting database migrations...");

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    // Wait for database connection
    if (!dataSource.isInitialized) {
      logger.log("⏳ Waiting for database connection...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (!dataSource.isInitialized) {
      throw new Error("Database connection not established");
    }

    logger.log("✅ Database connected, running migrations...");

    // Run pending migrations
    const pendingMigrations = await dataSource.showMigrations();
    if (pendingMigrations) {
      logger.log("📋 Found pending migrations, running them...");
      await dataSource.runMigrations();
      logger.log("✅ All migrations completed successfully");
    } else {
      logger.log("ℹ️ No pending migrations found");
    }

    // Log migration history
    const migrations = await dataSource.query(`
      SELECT name, timestamp 
      FROM migrations 
      ORDER BY timestamp DESC 
      LIMIT 10
    `);

    if (migrations.length > 0) {
      logger.log("📚 Recent migrations:");
      migrations.forEach((migration: any) => {
        logger.log(
          `   - ${migration.name} (${new Date(migration.timestamp).toISOString()})`,
        );
      });
    }

    await app.close();
    logger.log("🎉 Migration process completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Handle process termination
process.on("SIGINT", () => {
  const logger = new Logger("MigrationRunner");
  logger.log("🛑 Migration process interrupted");
  process.exit(0);
});

process.on("SIGTERM", () => {
  const logger = new Logger("MigrationRunner");
  logger.log("🛑 Migration process terminated");
  process.exit(0);
});

runMigrations();
