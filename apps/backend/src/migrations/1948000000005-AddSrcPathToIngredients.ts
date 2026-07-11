import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSrcPathToIngredients1948000000005 implements MigrationInterface {
  name = 'AddSrcPathToIngredients1948000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем, существует ли таблица ingredients
    const tableExists = await queryRunner.hasTable('ingredients');

    if (tableExists) {
      // Проверяем, существует ли колонка src_path
      const columnExists = await queryRunner.hasColumn('ingredients', 'src_path');

      if (!columnExists) {
        // Добавляем колонку src_path (временно с дефолтным значением)
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          ADD COLUMN "src_path" character varying(120)
        `);

        // Генерируем src_path для существующих записей на основе name
        await queryRunner.query(`
          UPDATE "ingredients"
          SET "src_path" = LOWER(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  TRANSLATE("name",
                    'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
                    'abvgdeejzijklmnoprstufhctcssyeyuya'
                  ),
                  '[^a-z0-9]', '-', 'g'
                ),
                '-+', '-', 'g'
              ),
              '^-|-$', '', 'g'
            )
          )
          WHERE "name" IS NOT NULL AND "name" != ''
        `);

        // Для записей где src_path стал пустым или null - генерируем из id
        await queryRunner.query(`
          UPDATE "ingredients"
          SET "src_path" = 'ingredient-' || SUBSTRING("id"::text, 1, 8)
          WHERE "src_path" IS NULL OR "src_path" = ''
        `);

        // Делаем колонку NOT NULL
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          ALTER COLUMN "src_path" SET NOT NULL
        `);

        // Добавляем уникальное ограничение
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          ADD CONSTRAINT "UQ_ingredients_src_path" UNIQUE ("src_path")
        `);

        // Создаем индекс для быстрого поиска по src_path
        await queryRunner.query(`
          CREATE INDEX "IDX_ingredients_src_path" ON "ingredients" ("src_path")
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('ingredients');

    if (tableExists) {
      const columnExists = await queryRunner.hasColumn('ingredients', 'src_path');

      if (columnExists) {
        // Удаляем индекс
        await queryRunner.query(`
          DROP INDEX IF EXISTS "IDX_ingredients_src_path"
        `);

        // Удаляем уникальное ограничение
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          DROP CONSTRAINT IF EXISTS "UQ_ingredients_src_path"
        `);

        // Удаляем колонку
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          DROP COLUMN IF EXISTS "src_path"
        `);
      }
    }
  }
}
