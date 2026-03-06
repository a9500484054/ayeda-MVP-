import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUnitsTable1741032000000 implements MigrationInterface {
  name = 'CreateUnitsTable1741032000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем enum для типа единиц
    await queryRunner.query(`
        CREATE TYPE "public"."units_type_enum" AS ENUM('mass', 'volume', 'piece', 'other')
    `);

    // Создаем таблицу units
    await queryRunner.query(`
        CREATE TABLE "units" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "code" character varying(20) NOT NULL UNIQUE,
            "name" character varying(50) NOT NULL,
            "short" character varying(10) NOT NULL,
            "type" "public"."units_type_enum" NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_units" PRIMARY KEY ("id")
        )
    `);

    // Создаем индексы
    await queryRunner.query(`
        CREATE INDEX "IDX_units_code" ON "units" ("code")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_units_type" ON "units" ("type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_units_type"`);
    await queryRunner.query(`DROP INDEX "IDX_units_code"`);
    await queryRunner.query(`DROP TABLE "units"`);
    await queryRunner.query(`DROP TYPE "public"."units_type_enum"`);
  }
}
