// migration: RemoveDeletedAtFromMenuDays
import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDeletedAtFromMenuDays1703000000005 implements MigrationInterface {
  name = 'RemoveDeletedAtFromMenuDays1703000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Удаляем колонку deleted_at из таблицы menu_days
    await queryRunner.query(`
      ALTER TABLE "menu_days" DROP COLUMN IF EXISTS "deleted_at"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Восстанавливаем колонку deleted_at при откате
    await queryRunner.query(`
      ALTER TABLE "menu_days"
      ADD COLUMN "deleted_at" TIMESTAMP WITH TIME ZONE
    `);
  }
}
