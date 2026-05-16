import { ApiProperty } from '@nestjs/swagger';
import { SlotType } from '../enums/slot-type.enum';
import { MealType } from '../enums/meal-type.enum';
import { MenuSlotItemResponseDto } from './menu-slot-item-response.dto';

export class MenuSlotResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuListId: string;

  @ApiProperty({ enum: SlotType })
  slotType: SlotType;

  @ApiProperty({ required: false })
  dayId?: string;

  @ApiProperty({ required: false, type: 'string', format: 'date' })
  slotDate?: string | null;

  @ApiProperty({ enum: MealType, required: false, nullable: true })  // ← Добавить nullable: true
  mealType?: MealType | null;  // ← Изменить тип на MealType | null

  @ApiProperty()
  order: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [MenuSlotItemResponseDto], required: false })
  items?: MenuSlotItemResponseDto[];
}
