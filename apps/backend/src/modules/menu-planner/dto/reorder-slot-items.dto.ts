// apps\backend\src\modules\menu-planner\dto\reorder-slot-items.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SlotItemOrderDto {
  @ApiProperty({ description: 'ID элемента слота' })
  @IsUUID(4, { message: 'id должен быть UUID' })
  id: string;

  @ApiProperty({ description: 'Новый порядок', example: 0 })
  @IsInt({ message: 'order должен быть целым числом' })
  @Min(0, { message: 'order должен быть >= 0' })
  order: number;
}

export class ReorderSlotItemsDto {
  @ApiProperty({ type: [SlotItemOrderDto], description: 'Массив с новым порядком элементов' })
  @IsArray({ message: 'items должен быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => SlotItemOrderDto)
  items: SlotItemOrderDto[];
}
