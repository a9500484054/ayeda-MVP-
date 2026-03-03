import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecipeCategoriesTable1741032000005 implements MigrationInterface {
  name = 'CreateRecipeCategoriesTable1741032000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "recipe_categories" (
            "recipe_id" uuid NOT NULL,
            "category_id" uuid NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_recipe_categories" PRIMARY KEY ("recipe_id", "category_id")
        )
    `);

    // Индексы
    await queryRunner.query(`
        CREATE INDEX "IDX_recipe_categories_recipe" ON "recipe_categories" ("recipe_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_recipe_categories_category" ON "recipe_categories" ("category_id")
    `);

    // Внешние ключи
    await queryRunner.query(`
        ALTER TABLE "recipe_categories"
        ADD CONSTRAINT "FK_recipe_categories_recipe"
        FOREIGN KEY ("recipe_id")
        REFERENCES "recipes"("id")
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
        ALTER TABLE "recipe_categories"
        ADD CONSTRAINT "FK_recipe_categories_category"
        FOREIGN KEY ("category_id")
        REFERENCES "categories"("id")
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipe_categories" DROP CONSTRAINT "FK_recipe_categories_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_categories" DROP CONSTRAINT "FK_recipe_categories_recipe"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_recipe_categories_category"`);
    await queryRunner.query(`DROP INDEX "IDX_recipe_categories_recipe"`);
    await queryRunner.query(`DROP TABLE "recipe_categories"`);
  }
}
