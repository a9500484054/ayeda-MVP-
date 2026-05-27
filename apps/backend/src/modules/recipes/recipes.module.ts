import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { RecipeCategory } from './entities/recipe-category.entity';
import { UsersModule } from '../users/users.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { CategoriesModule } from '../categories/categories.module';
import { UnitsModule } from '../units/units.module';
import { FavoritesModule } from '../favorites/favorites.module'; // Добавить импорт
import { Favorite } from '../favorites/entities/favorite.entity'; // Добавить импорт

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, RecipeIngredient, RecipeCategory, Favorite]),
    UsersModule,
    IngredientsModule,
    CategoriesModule,
    UnitsModule,
    FavoritesModule,
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
