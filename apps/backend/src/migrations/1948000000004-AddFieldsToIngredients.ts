import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsToIngredients1948000000004 implements MigrationInterface {
  name = 'AddFieldsToIngredients1948000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем, существуют ли уже поля (для безопасности)
    const tableExists = await queryRunner.hasTable('ingredients');

    if (tableExists) {
      // Добавляем поле description
      const hasDescription = await queryRunner.hasColumn('ingredients', 'description');
      if (!hasDescription) {
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          ADD COLUMN "description" text
        `);
      }

      // Добавляем поле photo
      const hasPhoto = await queryRunner.hasColumn('ingredients', 'photo');
      if (!hasPhoto) {
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          ADD COLUMN "photo" character varying(512)
        `);
      }

      // Добавляем поле seo
      const hasSeo = await queryRunner.hasColumn('ingredients', 'seo');
      if (!hasSeo) {
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          ADD COLUMN "seo" jsonb DEFAULT '{}'
        `);
      }

      // Создаем индекс для seo
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_ingredients_seo" ON "ingredients" USING gin ("seo")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индекс
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_ingredients_seo"
    `);

    // Удаляем поля (если они существуют)
    const tableExists = await queryRunner.hasTable('ingredients');

    if (tableExists) {
      const hasSeo = await queryRunner.hasColumn('ingredients', 'seo');
      if (hasSeo) {
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          DROP COLUMN "seo"
        `);
      }

      const hasPhoto = await queryRunner.hasColumn('ingredients', 'photo');
      if (hasPhoto) {
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          DROP COLUMN "photo"
        `);
      }

      const hasDescription = await queryRunner.hasColumn('ingredients', 'description');
      if (hasDescription) {
        await queryRunner.query(`
          ALTER TABLE "ingredients"
          DROP COLUMN "description"
        `);
      }
    }
  }
}
