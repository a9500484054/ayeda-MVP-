import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddViewsCountToRecipes1948000000002 implements MigrationInterface {
  name = 'AddViewsCountToRecipes1948000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле views_count в таблицу recipes
    await queryRunner.query(`
      ALTER TABLE recipes
      ADD COLUMN views_count INTEGER NOT NULL DEFAULT 0
    `);

    // Создаем индекс для быстрой сортировки по популярности
    await queryRunner.query(`
      CREATE INDEX idx_recipes_views_count ON recipes(views_count DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индекс
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_recipes_views_count
    `);

    // Удаляем поле views_count
    await queryRunner.query(`
      ALTER TABLE recipes
      DROP COLUMN IF EXISTS views_count
    `);
  }
}
