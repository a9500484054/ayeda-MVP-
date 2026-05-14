import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuPlannerController } from './menu-planner.controller';
import { MenuPlannerService } from './menu-planner.service';
import { MenuList } from './entities/menu-list.entity';
import { MenuSlot } from './entities/menu-slot.entity';
import { MenuSlotItem } from './entities/menu-slot-item.entity';
import { RecipesModule } from '../recipes/recipes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuList, MenuSlot, MenuSlotItem]),
    RecipesModule,
  ],
  controllers: [MenuPlannerController],
  providers: [MenuPlannerService],
  exports: [MenuPlannerService],
})
export class MenuPlannerModule {}
