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

  @ApiProperty({ type: [ShoppingItemResponseDto], required: false })
  items?: ShoppingItemResponseDto[];
}
