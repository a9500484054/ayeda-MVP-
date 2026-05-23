import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateShoppingItemDto } from './create-shopping-item.dto';

export class CreateShoppingListDto {
  @ApiProperty({ description: 'Название списка' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Порядок сортировки', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({
    description: 'Позиции списка (опционально)',
    type: [CreateShoppingItemDto],
    required: false,
    example: [
      { name: 'Молоко', quantity: 2, unit: 'л' },
      { name: 'Хлеб', quantity: 1, unit: 'шт' },
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShoppingItemDto)
  items?: CreateShoppingItemDto[];
}
