import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUploadsTable1741032000010 implements MigrationInterface {
  name = 'CreateUploadsTable1741032000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "uploads" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "user_id" uuid,
            "path" character varying(512) NOT NULL,
            "original_name" character varying(255) NOT NULL,
            "mime_type" character varying(100) NOT NULL,
            "size" bigint NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_uploads" PRIMARY KEY ("id"),
            CONSTRAINT "CHK_size_positive" CHECK (size >= 0)
        )
    `);

    // Индексы
    await queryRunner.query(`
        CREATE INDEX "IDX_uploads_user" ON "uploads" ("user_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_uploads_mime_type" ON "uploads" ("mime_type")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_uploads_created_at" ON "uploads" ("created_at")
    `);

    // Внешний ключ
    await queryRunner.query(`
        ALTER TABLE "uploads"
        ADD CONSTRAINT "FK_uploads_user"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "uploads" DROP CONSTRAINT "FK_uploads_user"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_uploads_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_uploads_mime_type"`);
    await queryRunner.query(`DROP INDEX "IDX_uploads_user"`);
    await queryRunner.query(`DROP TABLE "uploads"`);
  }
}
