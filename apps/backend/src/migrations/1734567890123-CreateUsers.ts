import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1734567890123 implements MigrationInterface {
    name = 'CreateUsers1734567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" varchar NOT NULL UNIQUE,
                "passwordHash" varchar NOT NULL,
                "name" varchar,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
