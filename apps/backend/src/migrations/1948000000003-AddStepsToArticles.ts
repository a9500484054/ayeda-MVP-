import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStepsToArticles1948000000003 implements MigrationInterface {
  name = 'AddStepsToArticles1948000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле steps (JSONB) в таблицу articles
    await queryRunner.query(`
      ALTER TABLE articles
      ADD COLUMN steps JSONB NULL
    `);

    // Создаем индекс для быстрого поиска по шагам (опционально)
    await queryRunner.query(`
      CREATE INDEX idx_articles_steps ON articles USING GIN (steps)
    `);

    // Также можно сделать поле content NULLABLE, если используем только steps
    await queryRunner.query(`
      ALTER TABLE articles
      ALTER COLUMN content DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индекс
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_articles_steps
    `);

    // Возвращаем NOT NULL для content (если было изменено)
    await queryRunner.query(`
      ALTER TABLE articles
      ALTER COLUMN content SET NOT NULL
    `);

    // Удаляем поле steps
    await queryRunner.query(`
      ALTER TABLE articles
      DROP COLUMN IF EXISTS steps
    `);
  }
}
