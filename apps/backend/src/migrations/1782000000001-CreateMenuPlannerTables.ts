import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenuPlannerTables1782000000001 implements MigrationInterface {
  name = 'CreateMenuPlannerTables1782000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Создаем ENUM для типов приемов пищи
    await queryRunner.query(`
      CREATE TYPE "public"."menu_slots_meal_type_enum" AS ENUM('breakfast', 'lunch', 'dinner', 'snack')
    `);

    // 2. Создаем таблицу menu_lists
    await queryRunner.query(`
      CREATE TABLE "menu_lists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" character varying(100) NOT NULL,
        "description" text,
        "icon" character varying(50),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_menu_lists" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_lists_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // 3. Создаем индексы для menu_lists
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_lists_user_id" ON "menu_lists" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_lists_is_active" ON "menu_lists" ("is_active")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_lists_user_active" ON "menu_lists" ("user_id", "is_active")
    `);

    // 4. Создаем таблицу menu_slots
    await queryRunner.query(`
      CREATE TABLE "menu_slots" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "menu_list_id" uuid NOT NULL,
        "slot_date" date,
        "meal_type" "public"."menu_slots_meal_type_enum" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_slots" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_slots_menu_list" FOREIGN KEY ("menu_list_id")
          REFERENCES "menu_lists"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_menu_slots_unique" UNIQUE ("menu_list_id", "slot_date", "meal_type")
      )
    `);

    // 5. Создаем индексы для menu_slots
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_slots_menu_list_id" ON "menu_slots" ("menu_list_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_slots_slot_date" ON "menu_slots" ("slot_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_slots_meal_type" ON "menu_slots" ("meal_type")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_slots_date_meal" ON "menu_slots" ("menu_list_id", "slot_date", "meal_type")
    `);

    // 6. Создаем таблицу menu_slot_items
    await queryRunner.query(`
      CREATE TABLE "menu_slot_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slot_id" uuid NOT NULL,
        "recipe_id" uuid NOT NULL,
        "order" integer NOT NULL DEFAULT 0,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_slot_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_slot_items_slot" FOREIGN KEY ("slot_id")
          REFERENCES "menu_slots"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_menu_slot_items_recipe" FOREIGN KEY ("recipe_id")
          REFERENCES "recipes"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_menu_slot_items_slot_recipe" UNIQUE ("slot_id", "recipe_id")
      )
    `);

    // 7. Создаем индексы для menu_slot_items
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_slot_items_slot_id" ON "menu_slot_items" ("slot_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_slot_items_recipe_id" ON "menu_slot_items" ("recipe_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_slot_items_order" ON "menu_slot_items" ("slot_id", "order")
    `);

    // 8. Создаем триггер для обновления updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // 9. Применяем триггеры ко всем таблицам
    await queryRunner.query(`
      CREATE TRIGGER update_menu_lists_updated_at
        BEFORE UPDATE ON "menu_lists"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_menu_slots_updated_at
        BEFORE UPDATE ON "menu_slots"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_menu_slot_items_updated_at
        BEFORE UPDATE ON "menu_slot_items"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем триггеры
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_menu_slot_items_updated_at ON "menu_slot_items"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_menu_slots_updated_at ON "menu_slots"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_menu_lists_updated_at ON "menu_lists"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // Удаляем таблицы в правильном порядке
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_slot_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_slots"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_lists"`);

    // Удаляем ENUM
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."menu_slots_meal_type_enum"`);
  }
}
