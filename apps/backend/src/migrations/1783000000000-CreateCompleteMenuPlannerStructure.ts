import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompleteMenuPlannerStructure1703000000000 implements MigrationInterface {
  name = 'CreateCompleteMenuPlannerStructure1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // 1. Создаем ENUM типы
    // ============================================

    // ENUM для типа отображения меню
    await queryRunner.query(`
      CREATE TYPE "public"."menu_lists_display_type_enum" AS ENUM('days', 'calendar', 'banquet')
    `);

    // ENUM для типа слота
    await queryRunner.query(`
      CREATE TYPE "public"."menu_slots_slot_type_enum" AS ENUM('day', 'calendar', 'banquet')
    `);

    // ENUM для типов приемов пищи
    await queryRunner.query(`
      CREATE TYPE "public"."menu_slots_meal_type_enum" AS ENUM('breakfast', 'lunch', 'dinner', 'snack')
    `);

    // ============================================
    // 2. Создаем таблицу menu_lists
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "menu_lists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" character varying(100) NOT NULL,
        "description" text,
        "icon" character varying(50),
        "display_type" "public"."menu_lists_display_type_enum" NOT NULL DEFAULT 'days',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_menu_lists" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_lists_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Индексы для menu_lists
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_lists_user_id" ON "menu_lists" ("user_id") WHERE "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_lists_is_active" ON "menu_lists" ("is_active") WHERE "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_lists_display_type" ON "menu_lists" ("display_type") WHERE "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_lists_user_active" ON "menu_lists" ("user_id", "is_active") WHERE "deleted_at" IS NULL
    `);

    // ============================================
    // 3. Создаем таблицу menu_days (только для режима DAYS)
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "menu_days" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "menu_list_id" uuid NOT NULL,
        "day_order" integer NOT NULL,
        "title" character varying(100) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_menu_days" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_days_menu_list" FOREIGN KEY ("menu_list_id")
          REFERENCES "menu_lists"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_menu_days_list_order" UNIQUE ("menu_list_id", "day_order")
      )
    `);

    // Индексы для menu_days
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_days_menu_list_id" ON "menu_days" ("menu_list_id") WHERE "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_days_day_order" ON "menu_days" ("day_order") WHERE "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_days_list_order" ON "menu_days" ("menu_list_id", "day_order") WHERE "deleted_at" IS NULL
    `);

    // ============================================
    // 4. Создаем таблицу menu_slots (универсальная)
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "menu_slots" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "menu_list_id" uuid NOT NULL,
        "slot_type" "public"."menu_slots_slot_type_enum" NOT NULL,
        "day_id" uuid,
        "slot_date" date,
        "meal_type" "public"."menu_slots_meal_type_enum",
        "order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_menu_slots" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_slots_menu_list" FOREIGN KEY ("menu_list_id")
          REFERENCES "menu_lists"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_menu_slots_day" FOREIGN KEY ("day_id")
          REFERENCES "menu_days"("id") ON DELETE CASCADE
      )
    `);

    // Индексы для menu_slots
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_slots_menu_list_id" ON "menu_slots" ("menu_list_id") WHERE "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_slots_slot_type" ON "menu_slots" ("slot_type") WHERE "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_slots_day_id" ON "menu_slots" ("day_id") WHERE "slot_type" = 'day' AND "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_slots_slot_date" ON "menu_slots" ("slot_date") WHERE "slot_type" = 'calendar' AND "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_slots_meal_type" ON "menu_slots" ("meal_type") WHERE "slot_type" IN ('day', 'calendar') AND "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_slots_order" ON "menu_slots" ("order") WHERE "slot_type" = 'banquet' AND "deleted_at" IS NULL
    `);

    // Частичные уникальные индексы
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_menu_slots_day_meal" ON "menu_slots" ("day_id", "meal_type")
      WHERE "slot_type" = 'day' AND "day_id" IS NOT NULL AND "meal_type" IS NOT NULL AND "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_menu_slots_calendar" ON "menu_slots" ("menu_list_id", "slot_date", "meal_type")
      WHERE "slot_type" = 'calendar' AND "slot_date" IS NOT NULL AND "meal_type" IS NOT NULL AND "deleted_at" IS NULL
    `);

    // ============================================
    // 5. Создаем таблицу menu_slot_items (рецепты в слотах)
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "menu_slot_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slot_id" uuid NOT NULL,
        "recipe_id" uuid NOT NULL,
        "order" integer NOT NULL DEFAULT 0,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_menu_slot_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_slot_items_slot" FOREIGN KEY ("slot_id")
          REFERENCES "menu_slots"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_menu_slot_items_recipe" FOREIGN KEY ("recipe_id")
          REFERENCES "recipes"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_menu_slot_items_slot_recipe" UNIQUE ("slot_id", "recipe_id")
      )
    `);

    // Индексы для menu_slot_items
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_slot_items_slot_id" ON "menu_slot_items" ("slot_id") WHERE "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_slot_items_recipe_id" ON "menu_slot_items" ("recipe_id") WHERE "deleted_at" IS NULL;
      CREATE INDEX "IDX_menu_slot_items_order" ON "menu_slot_items" ("slot_id", "order") WHERE "deleted_at" IS NULL
    `);

    // ============================================
    // 6. Создаем функцию для updated_at триггера
    // ============================================
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // ============================================
    // 7. Добавляем триггеры для всех таблиц
    // ============================================
    await queryRunner.query(`
      CREATE TRIGGER update_menu_lists_updated_at
        BEFORE UPDATE ON "menu_lists"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_menu_days_updated_at
        BEFORE UPDATE ON "menu_days"
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

    // ============================================
    // 8. Добавляем CHECK constraints для валидации
    // ============================================

    // Для DAYS: обязательно заполнены day_id и meal_type
    await queryRunner.query(`
      ALTER TABLE "menu_slots" ADD CONSTRAINT "CK_menu_slots_days" CHECK (
        (slot_type = 'day' AND day_id IS NOT NULL AND meal_type IS NOT NULL AND slot_date IS NULL) OR
        (slot_type != 'day')
      )
    `);

    // Для CALENDAR: обязательно заполнены slot_date и meal_type
    await queryRunner.query(`
      ALTER TABLE "menu_slots" ADD CONSTRAINT "CK_menu_slots_calendar" CHECK (
        (slot_type = 'calendar' AND slot_date IS NOT NULL AND meal_type IS NOT NULL AND day_id IS NULL) OR
        (slot_type != 'calendar')
      )
    `);

    // Для BANQUET: day_id, slot_date, meal_type должны быть NULL
    await queryRunner.query(`
      ALTER TABLE "menu_slots" ADD CONSTRAINT "CK_menu_slots_banquet" CHECK (
        (slot_type = 'banquet' AND day_id IS NULL AND slot_date IS NULL AND meal_type IS NULL) OR
        (slot_type != 'banquet')
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // 1. Удаляем CHECK constraints
    // ============================================
    await queryRunner.query(`ALTER TABLE "menu_slots" DROP CONSTRAINT IF EXISTS "CK_menu_slots_banquet"`);
    await queryRunner.query(`ALTER TABLE "menu_slots" DROP CONSTRAINT IF EXISTS "CK_menu_slots_calendar"`);
    await queryRunner.query(`ALTER TABLE "menu_slots" DROP CONSTRAINT IF EXISTS "CK_menu_slots_days"`);

    // ============================================
    // 2. Удаляем триггеры
    // ============================================
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_menu_slot_items_updated_at ON "menu_slot_items"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_menu_slots_updated_at ON "menu_slots"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_menu_days_updated_at ON "menu_days"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_menu_lists_updated_at ON "menu_lists"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // ============================================
    // 3. Удаляем таблицы в правильном порядке
    // ============================================
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_slot_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_slots"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_days"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_lists"`);

    // ============================================
    // 4. Удаляем ENUM типы
    // ============================================
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."menu_slots_meal_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."menu_slots_slot_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."menu_lists_display_type_enum"`);
  }
}
