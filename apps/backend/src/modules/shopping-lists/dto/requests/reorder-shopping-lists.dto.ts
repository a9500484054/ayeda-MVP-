import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderListItem {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderShoppingListsDto {
  @ApiProperty({ type: [ReorderListItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderListItem)
  lists: ReorderListItem[];
}
