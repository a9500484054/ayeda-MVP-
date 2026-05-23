// apps/backend/src/modules/shopping-lists/dto/requests/copy-shopping-list.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CopyShoppingListDto {
  @ApiProperty({
    description: 'Новое название для копии списка (опционально)',
    required: false,
    example: 'Копия: Продукты на неделю',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
