import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Этап 7 харденинга: чистка индексов.
 * - Убираем индексы, дублирующие UNIQUE-констрейнты (UNIQUE сам создаёт индекс).
 * - Убираем одиночные низкоселективные индексы по enum рецепта.
 * - Добавляем составной индекс под основной листинг рецептов и под поиск
 *   refresh-токена по (user_id, token_hash).
 */
export class TidyIndexes1948000000007 implements MigrationInterface {
  name = 'TidyIndexes1948000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Дубликаты UNIQUE-индексов
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_units_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ingredients_code"`);

    // Низкоселективные одиночные индексы по enum
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_recipes_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_recipes_difficulty"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_recipes_status"`);

    // Основной листинг: WHERE status = ? ... ORDER BY created_at DESC
    await queryRunner.query(`
      CREATE INDEX "IDX_recipes_status_created"
      ON "recipes" ("status", "created_at" DESC)
      WHERE "deleted_at" IS NULL
    `);

    // Поиск refresh-токена одним запросом по (user_id, token_hash)
    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_user_hash"
      ON "refresh_tokens" ("user_id", "token_hash")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_refresh_tokens_user_hash"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_recipes_status_created"`);

    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_status" ON "recipes" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_difficulty" ON "recipes" ("difficulty")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_type" ON "recipes" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ingredients_code" ON "ingredients" ("code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_name" ON "categories" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_code" ON "categories" ("code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_units_code" ON "units" ("code")`,
    );
  }
}
