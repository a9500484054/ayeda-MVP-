import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingListsController } from './shopping-lists.controller';
import { SharedController } from './shared.controller';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingList } from './entities/shopping-list.entity';
import { ShoppingListItem } from './entities/shopping-list-item.entity';
import { ShoppingCategoriesModule } from '../shopping-categories/shopping-categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingList, ShoppingListItem]),
    ShoppingCategoriesModule,
  ],
  controllers: [ShoppingListsController, SharedController],
  providers: [ShoppingListsService],
  exports: [ShoppingListsService],
})
export class ShoppingListsModule {}
