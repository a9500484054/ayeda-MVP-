import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecipeIngredientsTable1741032000004 implements MigrationInterface {
  name = 'CreateRecipeIngredientsTable1741032000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "recipe_ingredients" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "recipe_id" uuid NOT NULL,
            "ingredient_id" uuid NOT NULL,
            "amount" numeric(10,2) NOT NULL,
            "notes" text,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_recipe_ingredients" PRIMARY KEY ("id")
        )
    `);

    // Индексы
    await queryRunner.query(`
        CREATE INDEX "IDX_recipe_ingredients_recipe" ON "recipe_ingredients" ("recipe_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_recipe_ingredients_ingredient" ON "recipe_ingredients" ("ingredient_id")
    `);

    // Внешние ключи
    await queryRunner.query(`
        ALTER TABLE "recipe_ingredients"
        ADD CONSTRAINT "FK_recipe_ingredients_recipe"
        FOREIGN KEY ("recipe_id")
        REFERENCES "recipes"("id")
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
        ALTER TABLE "recipe_ingredients"
        ADD CONSTRAINT "FK_recipe_ingredients_ingredient"
        FOREIGN KEY ("ingredient_id")
        REFERENCES "ingredients"("id")
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "FK_recipe_ingredients_ingredient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "FK_recipe_ingredients_recipe"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_recipe_ingredients_ingredient"`);
    await queryRunner.query(`DROP INDEX "IDX_recipe_ingredients_recipe"`);
    await queryRunner.query(`DROP TABLE "recipe_ingredients"`);
  }
}
