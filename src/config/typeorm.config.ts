import * as path from 'path';

import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('LOCAL_DB_HOST', 'localhost'),
  port: configService.get('LOCAL_DB_PORT', 5432),
  username: configService.get('LOCAL_DB_USERNAME', 'postgres'),
  password: configService.get('LOCAL_DB_PASSWORD', 'postgres'),
  database: configService.get('LOCAL_DB_NAME', 'borzolini_clinic'),
  entities: [path.join(process.cwd(), 'src/**/*.entity{.ts,.js}')],
  migrations: [path.join(process.cwd(), 'src/database/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
});
