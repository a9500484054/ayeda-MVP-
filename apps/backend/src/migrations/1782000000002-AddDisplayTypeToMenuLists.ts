import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDisplayTypeToMenuLists1782000000002 implements MigrationInterface {
  name = 'AddDisplayTypeToMenuLists1782000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Создаем ENUM тип для display_type
    await queryRunner.query(`
      CREATE TYPE "public"."menu_lists_display_type_enum" AS ENUM('days', 'calendar')
    `);

    // 2. Добавляем колонку display_type в таблицу menu_lists
    await queryRunner.query(`
      ALTER TABLE "menu_lists"
      ADD COLUMN "display_type" "public"."menu_lists_display_type_enum" NOT NULL DEFAULT 'days'
    `);

    // 3. Создаем индекс для display_type (для быстрой фильтрации)
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_lists_display_type" ON "menu_lists" ("display_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Удаляем индекс
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_lists_display_type"`);

    // 2. Удаляем колонку
    await queryRunner.query(`ALTER TABLE "menu_lists" DROP COLUMN "display_type"`);

    // 3. Удаляем ENUM тип
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."menu_lists_display_type_enum"`);
  }
}
