import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokensTable1741032000000 implements MigrationInterface {
  name = 'CreateRefreshTokensTable1741032000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "refresh_tokens" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "user_id" uuid NOT NULL,
            "token_hash" character varying NOT NULL,
            "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
            "revoked_at" TIMESTAMP WITH TIME ZONE,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
        )
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_refresh_tokens_user_revoked"
        ON "refresh_tokens" ("user_id", "revoked_at")
        WHERE revoked_at IS NULL
    `);

    await queryRunner.query(`
        ALTER TABLE "refresh_tokens"
        ADD CONSTRAINT "FK_refresh_tokens_user"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_user"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_user_revoked"`);
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_expires_at"`);
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
