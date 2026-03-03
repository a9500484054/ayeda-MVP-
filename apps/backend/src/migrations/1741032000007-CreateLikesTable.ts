import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLikesTable1741032000007 implements MigrationInterface {
  name = 'CreateLikesTable1741032000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "likes" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "recipe_id" uuid NOT NULL,
            "user_id" uuid,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_likes" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_likes_recipe_user" UNIQUE ("recipe_id", "user_id")
        )
    `);

    // Индексы
    await queryRunner.query(`
        CREATE INDEX "IDX_likes_recipe" ON "likes" ("recipe_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_likes_user" ON "likes" ("user_id")
    `);

    // Внешние ключи
    await queryRunner.query(`
        ALTER TABLE "likes"
        ADD CONSTRAINT "FK_likes_recipe"
        FOREIGN KEY ("recipe_id")
        REFERENCES "recipes"("id")
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
        ALTER TABLE "likes"
        ADD CONSTRAINT "FK_likes_user"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT "FK_likes_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT "FK_likes_recipe"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_likes_user"`);
    await queryRunner.query(`DROP INDEX "IDX_likes_recipe"`);
    await queryRunner.query(`DROP TABLE "likes"`);
  }
}
