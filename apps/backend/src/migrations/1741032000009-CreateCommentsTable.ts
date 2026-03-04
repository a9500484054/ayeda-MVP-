import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsTable1741032000009 implements MigrationInterface {
  name = 'CreateCommentsTable1741032000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "comments" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "text" text NOT NULL,
            "recipe_id" uuid NOT NULL,
            "author_id" uuid,
            "is_hidden" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "PK_comments" PRIMARY KEY ("id")
        )
    `);

    // Индексы
    await queryRunner.query(`
        CREATE INDEX "IDX_comments_recipe" ON "comments" ("recipe_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_comments_author" ON "comments" ("author_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_comments_created_at" ON "comments" ("created_at")
    `);

    // Внешние ключи
    await queryRunner.query(`
        ALTER TABLE "comments"
        ADD CONSTRAINT "FK_comments_recipe"
        FOREIGN KEY ("recipe_id")
        REFERENCES "recipes"("id")
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
        ALTER TABLE "comments"
        ADD CONSTRAINT "FK_comments_author"
        FOREIGN KEY ("author_id")
        REFERENCES "users"("id")
        ON DELETE SET NULL
    `);

    // Триггер для updated_at
    await queryRunner.query(`
        CREATE TRIGGER trigger_update_comments_updated_at
            BEFORE UPDATE ON "comments"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON "comments"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_recipe"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_comments_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_author"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_recipe"`);
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
