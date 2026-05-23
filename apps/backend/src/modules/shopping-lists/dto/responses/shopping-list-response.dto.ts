import { ApiProperty } from '@nestjs/swagger';
import { ShoppingItemResponseDto } from './shopping-item-response.dto';

export class ShoppingListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  shareToken: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: 'Общее количество позиций в списке' })
  totalItems: number;

  @ApiProperty({ description: 'Количество отмеченных позиций' })
  checkedItems: number;

  @ApiProperty({ description: 'Прогресс выполнения в процентах', required: false })
  progress?: number;

  @ApiProperty({ type: [ShoppingItemResponseDto], required: false })
  items?: ShoppingItemResponseDto[];
}
