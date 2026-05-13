import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddUnitIdToRecipeIngredients1779132800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Добавляем колонку unit_id
        await queryRunner.addColumn(
            'recipe_ingredients',
            new TableColumn({
                name: 'unit_id',
                type: 'uuid',
                isNullable: true,
            })
        );

        // Добавляем внешний ключ
        await queryRunner.createForeignKey(
            'recipe_ingredients',
            new TableForeignKey({
                columnNames: ['unit_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'units',
                onDelete: 'SET NULL',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Получаем таблицу
        const table = await queryRunner.getTable('recipe_ingredients');

        // Проверяем, что таблица существует
        if (table) {
            // Находим и удаляем foreign key
            const foreignKey = table.foreignKeys.find(
                fk => fk.columnNames.indexOf('unit_id') !== -1
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey('recipe_ingredients', foreignKey);
            }
        }

        // Удаляем колонку
        await queryRunner.dropColumn('recipe_ingredients', 'unit_id');
    }
}
