import { ApiProperty } from '@nestjs/swagger';
import { ShoppingCategory } from '../entities/shopping-category.entity';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static from(category: ShoppingCategory): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.code = category.code;
    dto.name = category.name;
    dto.icon = category.icon;
    dto.sortOrder = category.sortOrder;
    dto.isActive = category.isActive;
    dto.createdAt = category.createdAt;
    dto.updatedAt = category.updatedAt;
    return dto;
  }
}
