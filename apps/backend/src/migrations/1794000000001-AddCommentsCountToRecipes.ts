import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentsCountToRecipes1794000000001 implements MigrationInterface {
  name = 'AddCommentsCountToRecipes1794000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле comments_count в таблицу recipes
    await queryRunner.query(`
      ALTER TABLE recipes
      ADD COLUMN comments_count INTEGER NOT NULL DEFAULT 0
    `);

    // Создаем индекс для быстрого доступа (опционально)
    await queryRunner.query(`
      CREATE INDEX idx_recipes_comments_count ON recipes(comments_count)
    `);

    // Обновляем счетчики для существующих рецептов
    await queryRunner.query(`
      UPDATE recipes r
      SET comments_count = (
        SELECT COUNT(*)
        FROM comments c
        WHERE c.recipe_id = r.id
        AND c.deleted_at IS NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индекс
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_recipes_comments_count
    `);

    // Удаляем поле comments_count
    await queryRunner.query(`
      ALTER TABLE recipes
      DROP COLUMN IF EXISTS comments_count
    `);
  }
}
