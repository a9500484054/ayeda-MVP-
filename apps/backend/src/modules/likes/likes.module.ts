import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesController, UserLikesController } from './likes.controller';
import { Like } from './entities/like.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Recipe])],
  controllers: [LikesController, UserLikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
