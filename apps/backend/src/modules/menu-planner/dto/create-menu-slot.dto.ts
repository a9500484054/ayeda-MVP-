import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { MealType } from '../enums/meal-type.enum';

export class CreateMenuSlotDto {
  @ApiProperty({ description: 'ID списка меню' })
  @IsUUID(4, { message: 'menuListId должен быть UUID' })
  menuListId: string;

  @ApiProperty({ required: false, description: 'Дата слота (YYYY-MM-DD)', example: '2026-05-18' })
  @IsOptional()
  @IsDateString({}, { message: 'slotDate должен быть корректной датой' })
  slotDate?: string;

  @ApiProperty({ enum: MealType, description: 'Прием пищи' })
  @IsEnum(MealType, { message: 'mealType должен быть корректным значением' })
  mealType: MealType;
}
