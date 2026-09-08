import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  synchronize: false,
  logging: ['error', 'warn'],

  // Миграции пишутся вручную и не требуют загрузки сущностей.
  // entities не подключаем — иначе ts-node CLI спотыкается на path-алиасах.
  entities: [],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
