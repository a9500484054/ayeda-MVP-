import 'dotenv/config';
import { AppDataSource } from './data-source';

async function run() {
  await AppDataSource.initialize();

  console.log('📦 Running migrations...');
  await AppDataSource.runMigrations();

  await AppDataSource.destroy();
  console.log('✅ Migrations completed');
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
