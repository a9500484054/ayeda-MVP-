import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../../shopping-categories/dto/category-response.dto';

export class ShoppingItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: CategoryResponseDto })
  category: CategoryResponseDto | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit: string;

  @ApiProperty({ nullable: true })
  price: number | null;

  @ApiProperty()
  isChecked: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ nullable: true })
  note: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
