import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable1741032000001 implements MigrationInterface {
  name = 'CreateCategoriesTable1741032000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "categories" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "code" character varying(50) NOT NULL UNIQUE,
            "name" character varying(100) NOT NULL UNIQUE,
            "description" text,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_categories" PRIMARY KEY ("id")
        )
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_categories_code" ON "categories" ("code")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_categories_name" ON "categories" ("name")
    `);

    await queryRunner.query(`
        CREATE TRIGGER trigger_update_categories_updated_at
            BEFORE UPDATE ON "categories"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_update_categories_updated_at ON "categories"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_categories_name"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_code"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
