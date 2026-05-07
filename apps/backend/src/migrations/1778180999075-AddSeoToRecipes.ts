import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeoToRecipes1778180999075 implements MigrationInterface {
  name = 'AddSeoToRecipes1778180999075';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipes" ADD COLUMN "seo" jsonb NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "seo"`);
  }
}
