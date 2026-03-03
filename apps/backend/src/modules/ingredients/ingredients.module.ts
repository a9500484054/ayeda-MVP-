import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { Ingredient } from './entities/ingredient.entity';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient]),
    UnitsModule, // Нужен для проверки существования unit
  ],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
