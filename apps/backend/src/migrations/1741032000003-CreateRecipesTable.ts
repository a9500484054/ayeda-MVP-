import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecipesTable1741032000003 implements MigrationInterface {
  name = 'CreateRecipesTable1741032000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем enum'ы
    await queryRunner.query(`
        CREATE TYPE "public"."recipes_difficulty_enum" AS ENUM('easy', 'medium', 'hard')
    `);

    await queryRunner.query(`
        CREATE TYPE "public"."recipes_status_enum" AS ENUM('draft', 'private', 'pending', 'public', 'rejected')
    `);

    await queryRunner.query(`
        CREATE TYPE "public"."recipes_type_enum" AS ENUM('personal', 'community')
    `);

    // Создаем таблицу recipes с search_vector
    await queryRunner.query(`
        CREATE TABLE "recipes" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "title" character varying(200) NOT NULL,
            "description" text,
            "cooking_time" integer,
            "servings" smallint,
            "calories" integer,
            "difficulty" "public"."recipes_difficulty_enum" NOT NULL DEFAULT 'medium',
            "status" "public"."recipes_status_enum" NOT NULL DEFAULT 'draft',
            "type" "public"."recipes_type_enum" NOT NULL DEFAULT 'personal',
            "photo" jsonb,
            "video" character varying(1024),
            "steps" jsonb,
            "src_path" character varying(120) NOT NULL UNIQUE,
            "likes" integer NOT NULL DEFAULT 0,
            "author_id" uuid NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "published_at" TIMESTAMP WITH TIME ZONE,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            "search_vector" tsvector GENERATED ALWAYS AS (
                setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
                setweight(to_tsvector('russian', coalesce(description, '')), 'B')
            ) STORED,
            CONSTRAINT "PK_recipes" PRIMARY KEY ("id"),
            CONSTRAINT "CHK_title_length" CHECK (length(title) >= 3),
            CONSTRAINT "CHK_servings_positive" CHECK (servings > 0)
        )
    `);

    // Создаем индексы
    await queryRunner.query(`
        CREATE INDEX "IDX_recipes_author" ON "recipes" ("author_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_recipes_status" ON "recipes" ("status")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_recipes_type" ON "recipes" ("type")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_recipes_difficulty" ON "recipes" ("difficulty")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_recipes_created_at" ON "recipes" ("created_at")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_recipes_published_at" ON "recipes" ("published_at")
    `);

    // Индекс для полнотекстового поиска
    await queryRunner.query(`
        CREATE INDEX "IDX_recipes_search_vector" ON "recipes" USING gin ("search_vector")
    `);

    // Добавляем внешний ключ к users
    await queryRunner.query(`
        ALTER TABLE "recipes"
        ADD CONSTRAINT "FK_recipes_author"
        FOREIGN KEY ("author_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
    `);

    // Создаем триггер для published_at
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_published_at()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status = 'public' AND (OLD.status != 'public' OR OLD.status IS NULL) THEN
                NEW.published_at = now();
            END IF;
            RETURN NEW;
        END;
        $$ language 'plpgsql'
    `);

    await queryRunner.query(`
        CREATE TRIGGER trigger_update_published_at
            BEFORE UPDATE ON "recipes"
            FOR EACH ROW
            EXECUTE FUNCTION update_published_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_update_published_at ON "recipes"`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_published_at()`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_update_recipes_updated_at ON "recipes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" DROP CONSTRAINT "FK_recipes_author"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_recipes_search_vector"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_published_at"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_difficulty"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_type"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_status"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_author"`);
    await queryRunner.query(`DROP TABLE "recipes"`);
    await queryRunner.query(`DROP TYPE "public"."recipes_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."recipes_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."recipes_difficulty_enum"`);
  }
}
