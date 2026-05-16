// apps\backend\src\modules\menu-planner\dto\create-menu-slot.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsUUID, IsInt, Min } from 'class-validator';
import { SlotType } from '../enums/slot-type.enum';
import { MealType } from '../enums/meal-type.enum';

export class CreateMenuSlotDto {
  @ApiProperty({ description: 'ID списка меню' })
  @IsUUID()
  menuListId: string;

  @ApiProperty({ enum: SlotType, description: 'Тип слота' })
  @IsEnum(SlotType)
  slotType: SlotType;

  @ApiProperty({ required: false, description: 'ID дня (для slot_type = day)' })
  @IsOptional()
  @IsUUID()
  dayId?: string;

  @ApiProperty({ required: false, description: 'Дата слота (для slot_type = calendar)' })
  @IsOptional()
  @IsDateString()
  slotDate?: string;

  @ApiProperty({ enum: MealType, required: false, description: 'Прием пищи (для day и calendar)' })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiProperty({ required: false, default: 0, description: 'Порядок (для banquet)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
