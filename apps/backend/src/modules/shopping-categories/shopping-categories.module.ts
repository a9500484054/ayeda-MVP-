import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCategoriesController } from './shopping-categories.controller';
import { ShoppingCategoriesService } from './shopping-categories.service';
import { ShoppingCategory } from './entities/shopping-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingCategory])],
  controllers: [ShoppingCategoriesController],
  providers: [ShoppingCategoriesService],
  exports: [ShoppingCategoriesService],
})
export class ShoppingCategoriesModule {}
