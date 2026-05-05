import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIngredientsTable1741032000002 implements MigrationInterface {
  name = 'CreateIngredientsTable1741032000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу ingredients
    await queryRunner.query(`
        CREATE TABLE "ingredients" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "code" character varying(50) NOT NULL UNIQUE,
            "name" character varying(100) NOT NULL,
            "unit_id" uuid NOT NULL,
            "nutrition_info" jsonb NOT NULL DEFAULT '{}',
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_ingredients" PRIMARY KEY ("id")
        )
    `);

    // Создаем индексы
    await queryRunner.query(`
        CREATE INDEX "IDX_ingredients_code" ON "ingredients" ("code")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_ingredients_name" ON "ingredients" ("name")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_ingredients_unit" ON "ingredients" ("unit_id")
    `);

    // Создаем GIN индекс для JSONB (для быстрого поиска по полям nutrition_info)
    await queryRunner.query(`
        CREATE INDEX "IDX_ingredients_nutrition" ON "ingredients" USING gin ("nutrition_info")
    `);

    // Добавляем внешний ключ к таблице units
    await queryRunner.query(`
        ALTER TABLE "ingredients"
        ADD CONSTRAINT "FK_ingredients_unit"
        FOREIGN KEY ("unit_id")
        REFERENCES "units"("id")
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешний ключ
    await queryRunner.query(`
        ALTER TABLE "ingredients" DROP CONSTRAINT "FK_ingredients_unit"
    `);

    // Удаляем индексы
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ingredients_nutrition"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ingredients_unit"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ingredients_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ingredients_code"`);

    // Удаляем таблицу
    await queryRunner.query(`DROP TABLE IF EXISTS "ingredients"`);
  }
}
