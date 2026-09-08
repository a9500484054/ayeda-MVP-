import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * R6: articles.type / articles.status — varchar → PG enum.
 * Значения не меняются, API-контракт тот же. Плюс частичный индекс под листинг.
 */
export class NormalizeArticleEnums1948000000008 implements MigrationInterface {
  name = 'NormalizeArticleEnums1948000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // страховка: любое неожиданное значение приводим к дефолту перед кастом
    await queryRunner.query(
      `UPDATE "articles" SET "type" = 'article' WHERE "type" NOT IN ('article', 'tip', 'news') OR "type" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "articles" SET "status" = 'draft' WHERE "status" NOT IN ('draft', 'published') OR "status" IS NULL`,
    );

    await queryRunner.query(
      `CREATE TYPE "articles_type_enum" AS ENUM ('article', 'tip', 'news')`,
    );
    await queryRunner.query(
      `CREATE TYPE "articles_status_enum" AS ENUM ('draft', 'published')`,
    );

    await queryRunner.query(`
      ALTER TABLE "articles"
        ALTER COLUMN "type" DROP DEFAULT,
        ALTER COLUMN "type" TYPE "articles_type_enum" USING "type"::"articles_type_enum",
        ALTER COLUMN "type" SET DEFAULT 'article',
        ALTER COLUMN "type" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "articles"
        ALTER COLUMN "status" DROP DEFAULT,
        ALTER COLUMN "status" TYPE "articles_status_enum" USING "status"::"articles_status_enum",
        ALTER COLUMN "status" SET DEFAULT 'draft',
        ALTER COLUMN "status" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_articles_status_published"
      ON "articles" ("status", "published_at" DESC)
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_articles_status_published"`);

    await queryRunner.query(`
      ALTER TABLE "articles"
        ALTER COLUMN "type" DROP DEFAULT,
        ALTER COLUMN "type" TYPE character varying(20) USING "type"::text,
        ALTER COLUMN "type" SET DEFAULT 'article'
    `);
    await queryRunner.query(`
      ALTER TABLE "articles"
        ALTER COLUMN "status" DROP DEFAULT,
        ALTER COLUMN "status" TYPE character varying(20) USING "status"::text,
        ALTER COLUMN "status" SET DEFAULT 'draft'
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS "articles_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "articles_type_enum"`);
  }
}
