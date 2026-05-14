import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSlotItemNotesDto {
  @ApiProperty({ description: 'Заметки к рецепту в слоте' })
  @IsString({ message: 'notes должен быть строкой' })
  notes: string;
}
