import { CallHandler, ExecutionContext, Injectable, NestInterceptor, OnModuleInit } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';
import { DatabaseService } from './database.service';

@Injectable()
export class DatabaseInitInterceptor implements NestInterceptor, OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly databaseService: DatabaseService
  ) {}

  async onModuleInit() {
    // Wait for TypeORM to be fully initialized
    await this.waitForTypeORM();

    // Set the data source in the database service
    this.databaseService.setDataSource(this.dataSource);

    // Test the connection
    const isHealthy = await this.databaseService.testConnection();
    if (!isHealthy) {
      throw new Error('Database connection health check failed during initialization');
    }
  }

  private async waitForTypeORM(): Promise<void> {
    const maxRetries = 30; // 30 seconds max wait
    const retryDelay = 1000;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      if (this.dataSource?.isInitialized) {
        return;
      }

      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }

    throw new Error('TypeORM failed to initialize within expected timeframe');
  }

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle();
  }
}
