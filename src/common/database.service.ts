import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  timestamp: Date;
  connectionCount: number;
  isConnected: boolean;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private dataSource!: DataSource; // Use definite assignment assertion
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('Initializing database service...');
    await this.waitForDatabaseConnection();
    this.isInitialized = true;
    this.logger.log('Database service initialized successfully');
  }

  /**
   * Wait for database connection to be established
   */
  private async waitForDatabaseConnection(): Promise<void> {
    const maxRetries = 10;
    const retryDelay = 2000;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Wait for TypeORM to establish connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we can get the data source
        if (this.dataSource?.isInitialized) {
          this.logger.log('Database connection established');
          return;
        }
        
        retryCount++;
        this.logger.warn(`Database connection not ready, retrying... (${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } catch (error) {
        this.logger.error(`Database connection attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount >= maxRetries) {
          throw new Error('Failed to establish database connection after maximum retries');
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Set the data source after TypeORM initialization
   */
  setDataSource(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.logger.log('Data source set successfully');
  }

  /**
   * Check database health and connection status
   */
  async checkHealth(): Promise<DatabaseHealth> {
    if (!this.isInitialized) {
      return {
        status: 'unhealthy',
        message: 'Database service not initialized',
        timestamp: new Date(),
        connectionCount: 0,
        isConnected: false,
      };
    }

    try {
      if (!this.dataSource?.isInitialized) {
        return {
          status: 'unhealthy',
          message: 'Database connection not established',
          timestamp: new Date(),
          connectionCount: 0,
          isConnected: false,
        };
      }

      // Test connection with a simple query
      await this.dataSource.query('SELECT 1 as test');
      const connectionCount = (this.dataSource as any).driver?.pool?.size || 0;

      return {
        status: 'healthy',
        message: 'Database connection is healthy',
        timestamp: new Date(),
        connectionCount,
        isConnected: true,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        connectionCount: 0,
        isConnected: false,
      };
    }
  }

  /**
   * Test database connection with retry logic
   */
  async testConnection(maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const health = await this.checkHealth();
        if (health.status === 'healthy') {
          this.logger.log(`Database connection test successful on attempt ${attempt}`);
          return true;
        }
        
        if (attempt < maxRetries) {
          this.logger.warn(`Database connection test failed on attempt ${attempt}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        this.logger.error(`Database connection test attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    this.logger.error('Database connection test failed after all retry attempts');
    return false;
  }

  /**
   * Get database connection statistics
   */
  async getConnectionStats(): Promise<any> {
    if (!this.dataSource?.isInitialized) {
      return { error: 'Database not connected' };
    }

    try {
      const driver = (this.dataSource as any).driver;
      const pool = driver?.pool;
      
      return {
        isConnected: this.dataSource.isInitialized,
        database: this.configService.get('SUPABASE_DB_NAME'),
        host: this.configService.get('SUPABASE_DB_HOST'),
        port: this.configService.get('SUPABASE_DB_PORT'),
        poolSize: pool?.size || 0,
        maxPoolSize: pool?.max || 0,
        minPoolSize: pool?.min || 0,
        idleConnections: pool?.idle || 0,
        activeConnections: pool?.active || 0,
        waitingConnections: pool?.waiting || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get connection stats:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Generate a database-friendly slug
   */
  generateSlug(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[;'"\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  /**
   * Format date for database storage
   */
  formatDateForDB(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse date from database
   */
  parseDateFromDB(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Execute a database transaction
   */
  async executeTransaction<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.dataSource?.isInitialized) {
      throw new Error('Database not connected');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation();
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
