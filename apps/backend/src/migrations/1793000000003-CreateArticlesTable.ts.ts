import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticlesTable1793000000003 implements MigrationInterface {
  name = 'CreateArticlesTable1793000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу articles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt VARCHAR(500),
        featured_image VARCHAR(500),
        categories TEXT[],
        type VARCHAR(20) DEFAULT 'article',
        status VARCHAR(20) DEFAULT 'draft',
        views INTEGER DEFAULT 0,
        seo JSONB,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);

    // Создаем индексы
    await queryRunner.query(`
      CREATE INDEX idx_articles_user ON articles(user_id);
      CREATE INDEX idx_articles_slug ON articles(slug);
      CREATE INDEX idx_articles_categories ON articles USING GIN(categories);
      CREATE INDEX idx_articles_type_status ON articles(type, status, published_at DESC);
    `);

    // Добавляем внешний ключ
    await queryRunner.query(`
      ALTER TABLE articles
      ADD CONSTRAINT fk_articles_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешний ключ
    await queryRunner.query(`
      ALTER TABLE articles DROP CONSTRAINT IF EXISTS fk_articles_user;
    `);

    // Удаляем индексы
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_articles_user;
      DROP INDEX IF EXISTS idx_articles_slug;
      DROP INDEX IF EXISTS idx_articles_categories;
      DROP INDEX IF EXISTS idx_articles_type_status;
    `);

    // Удаляем таблицу
    await queryRunner.query(`
      DROP TABLE IF EXISTS articles;
    `);
  }
}
