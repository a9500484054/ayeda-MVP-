import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShoppingListsTables1793000000002 implements MigrationInterface {
  name = 'CreateShoppingListsTables1793000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // 1. Создаем таблицу shopping_categories
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "shopping_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(50) NOT NULL,
        "name" character varying(100) NOT NULL,
        "icon" character varying(50) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shopping_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_shopping_categories_code" UNIQUE ("code")
      )
    `);

    // Индексы для shopping_categories
    await queryRunner.query(`
      CREATE INDEX "IDX_shopping_categories_code" ON "shopping_categories" ("code");
      CREATE INDEX "IDX_shopping_categories_sort_order" ON "shopping_categories" ("sort_order");
      CREATE INDEX "IDX_shopping_categories_is_active" ON "shopping_categories" ("is_active")
    `);

    // ============================================
    // 2. Создаем таблицу shopping_lists
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "shopping_lists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" character varying(200) NOT NULL,
        "share_token" character varying(64),
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_shopping_lists" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_shopping_lists_share_token" UNIQUE ("share_token"),
        CONSTRAINT "FK_shopping_lists_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Индексы для shopping_lists
    await queryRunner.query(`
      CREATE INDEX "IDX_shopping_lists_user_id" ON "shopping_lists" ("user_id");
      CREATE INDEX "IDX_shopping_lists_share_token" ON "shopping_lists" ("share_token");
      CREATE INDEX "IDX_shopping_lists_deleted_at" ON "shopping_lists" ("deleted_at");
      CREATE INDEX "IDX_shopping_lists_sort_order" ON "shopping_lists" ("user_id", "sort_order")
    `);

    // ============================================
    // 3. Создаем таблицу shopping_list_items
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "shopping_list_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "shopping_list_id" uuid NOT NULL,
        "name" character varying(200) NOT NULL,
        "category_id" uuid,
        "quantity" decimal(10, 2) NOT NULL DEFAULT 1,
        "unit" character varying(20) NOT NULL DEFAULT 'шт',
        "price" decimal(10, 2),
        "is_checked" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "note" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shopping_list_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_shopping_list_items_list" FOREIGN KEY ("shopping_list_id")
          REFERENCES "shopping_lists"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_shopping_list_items_category" FOREIGN KEY ("category_id")
          REFERENCES "shopping_categories"("id") ON DELETE SET NULL
      )
    `);

    // Индексы для shopping_list_items
    await queryRunner.query(`
      CREATE INDEX "IDX_items_shopping_list_id" ON "shopping_list_items" ("shopping_list_id");
      CREATE INDEX "IDX_items_category_id" ON "shopping_list_items" ("category_id");
      CREATE INDEX "IDX_items_is_checked" ON "shopping_list_items" ("is_checked");
      CREATE INDEX "IDX_items_sort_order" ON "shopping_list_items" ("shopping_list_id", "sort_order")
    `);

    // ============================================
    // 4. Добавляем CHECK constraint для количества
    // ============================================
    await queryRunner.query(`
      ALTER TABLE "shopping_list_items"
      ADD CONSTRAINT "CHK_items_quantity_positive"
      CHECK (quantity > 0)
    `);

    // ============================================
    // 5. Создаем триггер для updated_at
    // ============================================

    // Создаем функцию если еще не существует
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Триггер для shopping_categories
    await queryRunner.query(`
      CREATE TRIGGER update_shopping_categories_updated_at
        BEFORE UPDATE ON "shopping_categories"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // Триггер для shopping_lists
    await queryRunner.query(`
      CREATE TRIGGER update_shopping_lists_updated_at
        BEFORE UPDATE ON "shopping_lists"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // Триггер для shopping_list_items
    await queryRunner.query(`
      CREATE TRIGGER update_shopping_list_items_updated_at
        BEFORE UPDATE ON "shopping_list_items"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // ============================================
    // 6. Заполняем начальные категории (seed)
    // ============================================
    await queryRunner.query(`
      INSERT INTO "shopping_categories" (code, name, icon, sort_order, is_active) VALUES
        ('vegetables', 'Овощи', 'carrot', 1, true),
        ('fruits', 'Фрукты', 'apple', 2, true),
        ('meat', 'Мясо и птица', 'beef', 3, true),
        ('fish', 'Рыба и морепродукты', 'fish', 4, true),
        ('dairy', 'Молочные продукты', 'milk', 5, true),
        ('eggs', 'Яйца', 'egg', 6, true),
        ('bakery', 'Хлеб и выпечка', 'bread', 7, true),
        ('grocery', 'Бакалея', 'package', 8, true),
        ('beverages', 'Напитки', 'coffee', 9, true),
        ('sauces', 'Соусы и приправы', 'salt', 10, true),
        ('frozen', 'Замороженные продукты', 'snowflake', 11, true),
        ('ready_meals', 'Готовая еда', 'sandwich', 12, true),
        ('household', 'Для дома', 'home', 13, true),
        ('other', 'Прочее', 'more-horizontal', 99, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // 1. Удаляем CHECK constraints
    // ============================================
    await queryRunner.query(`ALTER TABLE "shopping_list_items" DROP CONSTRAINT IF EXISTS "CHK_items_quantity_positive"`);

    // ============================================
    // 2. Удаляем триггеры
    // ============================================
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_shopping_list_items_updated_at ON "shopping_list_items"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_shopping_lists_updated_at ON "shopping_lists"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_shopping_categories_updated_at ON "shopping_categories"`);

    // ============================================
    // 3. Удаляем таблицы (в правильном порядке)
    // ============================================
    await queryRunner.query(`DROP TABLE IF EXISTS "shopping_list_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shopping_lists"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shopping_categories"`);
  }
}
