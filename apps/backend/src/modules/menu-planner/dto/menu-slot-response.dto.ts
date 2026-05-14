import { ApiProperty } from '@nestjs/swagger';
import { MealType } from '../enums/meal-type.enum';
import { MenuSlotItemResponseDto } from './menu-slot-item-response.dto';

export class MenuSlotResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuListId: string;

  @ApiProperty({ required: false, type: 'string', format: 'date' })
  slotDate?: string | null;

  @ApiProperty({ enum: MealType })
  mealType: MealType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [MenuSlotItemResponseDto], required: false })
  items?: MenuSlotItemResponseDto[];
}
