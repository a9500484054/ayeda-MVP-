import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1734567890123 implements MigrationInterface {
  name = 'CreateUsersTable1734567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Включаем uuid-ossp (нужен для генерации UUID)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Создаем enum для ролей
    await queryRunner.query(`
        CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'moderator', 'admin')
    `);

    // Создаем таблицу users
    await queryRunner.query(`
        CREATE TABLE "users" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "email" character varying NOT NULL,
            "password" character varying NOT NULL,
            "username" character varying(50) NOT NULL,
            "first_name" character varying(100),
            "last_name" character varying(100),
            "bio" text,
            "avatar" character varying(512),
            "is_email_verified" boolean NOT NULL DEFAULT false,
            "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
            "last_login_at" TIMESTAMP WITH TIME ZONE,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            "settings" jsonb NOT NULL DEFAULT '{}'::jsonb,
            CONSTRAINT "UQ_email" UNIQUE ("email"),
            CONSTRAINT "UQ_username" UNIQUE ("username"),
            CONSTRAINT "CHK_username_length" CHECK (length(username) >= 3),
            CONSTRAINT "CHK_bio_length" CHECK (bio IS NULL OR length(bio) <= 1200),
            CONSTRAINT "PK_users" PRIMARY KEY ("id")
        )
    `);

    // Создаем индексы для производительности
    await queryRunner.query(`
        CREATE INDEX "IDX_users_email" ON "users" ("email")
        WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_users_username" ON "users" ("username")
        WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_users_role" ON "users" ("role")
        WHERE "deleted_at" IS NULL
    `);

    // Функция для автоматического обновления updated_at
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql'
    `);

    // Триггер для updated_at
    await queryRunner.query(`
        CREATE TRIGGER trigger_update_users_updated_at
            BEFORE UPDATE ON "users"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем триггер
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON "users"`,
    );

    // Удаляем функцию
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column()`,
    );

    // Удаляем индексы
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_username"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);

    // Удаляем таблицу
    await queryRunner.query(`DROP TABLE "users"`);

    // Удаляем enum
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);

    // Примечание: uuid-ossp не удаляем, т.к. может использоваться другими таблицами
  }
}
