const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.LOCAL_DB_HOST || 'localhost',
  port: parseInt(process.env.LOCAL_DB_PORT) || 5432,
  username: process.env.LOCAL_DB_USERNAME || 'postgres',
  password: process.env.LOCAL_DB_PASSWORD || 'postgres',
  database: process.env.LOCAL_DB_NAME || 'borzolini_clinic',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../database/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
});
