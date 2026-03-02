import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const isDocker = process.env.DOCKER_ENV === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: isDocker ? 'postgres' : process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432, // везде одинаково
  username: process.env.DB_USERNAME || 'ayeda',
  password: process.env.DB_PASSWORD || 'ayeda',
  database: process.env.DB_DATABASE || 'ayeda_dev',
  synchronize: false,
  logging: true,
  entities: [join(__dirname, '**/*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
});
