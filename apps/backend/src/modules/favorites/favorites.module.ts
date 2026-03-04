import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesService } from './favorites.service';
import {
  RecipeFavoritesController,
  UserFavoritesController,
} from './favorites.controller';
import { Favorite } from './entities/favorite.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Recipe])],
  controllers: [RecipeFavoritesController, UserFavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
