// Скопировать в apps/backend/src/migrations/ под именем
// Create<Feature>Table<Date.now()>.ts и синхронно переименовать класс.
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWidgetsTable1730000000000 implements MigrationInterface {
  name = 'CreateWidgetsTable1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "widgets_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "widgets" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title"       character varying(200) NOT NULL,
        "description" text,
        "status"      "widgets_status_enum" NOT NULL DEFAULT 'draft',
        "owner_id"    uuid NOT NULL,
        "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_widgets" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_widgets_title_len" CHECK (length("title") >= 3),
        CONSTRAINT "FK_widgets_owner" FOREIGN KEY ("owner_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_widgets_owner_created" ON "widgets" ("owner_id", "created_at" DESC)
      WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_widgets_status_created" ON "widgets" ("status", "created_at" DESC)
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_widgets_status_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_widgets_owner_created"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "widgets"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "widgets_status_enum"`);
  }
}
