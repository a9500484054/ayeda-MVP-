import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'Номер страницы',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Количество элементов на странице',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

export class PaginatedResponseDto<T> {
  data: T[];

  @ApiProperty({ example: 100, description: 'Всего элементов' })
  total: number;

  @ApiProperty({ example: 1, description: 'Текущая страница' })
  page: number;

  @ApiProperty({ example: 10, description: 'Элементов на странице' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Всего страниц' })
  pages: number;

  @ApiProperty({ example: true, description: 'Есть следующая страница' })
  hasNext: boolean;

  @ApiProperty({ example: false, description: 'Есть предыдущая страница' })
  hasPrev: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.pages = Math.ceil(total / limit);
    this.hasNext = page < this.pages;
    this.hasPrev = page > 1;
  }
}
