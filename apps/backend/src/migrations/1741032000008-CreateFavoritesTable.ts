import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavoritesTable1741032000008 implements MigrationInterface {
  name = 'CreateFavoritesTable1741032000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "favorites" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "recipe_id" uuid NOT NULL,
            "user_id" uuid NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_favorites" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_favorites_recipe_user" UNIQUE ("recipe_id", "user_id")
        )
    `);

    // Индексы
    await queryRunner.query(`
        CREATE INDEX "IDX_favorites_recipe" ON "favorites" ("recipe_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_favorites_user" ON "favorites" ("user_id")
    `);

    // Внешние ключи
    await queryRunner.query(`
        ALTER TABLE "favorites"
        ADD CONSTRAINT "FK_favorites_recipe"
        FOREIGN KEY ("recipe_id")
        REFERENCES "recipes"("id")
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
        ALTER TABLE "favorites"
        ADD CONSTRAINT "FK_favorites_user"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorites_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorites_recipe"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_favorites_user"`);
    await queryRunner.query(`DROP INDEX "IDX_favorites_recipe"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
  }
}
