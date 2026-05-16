import { ApiProperty } from '@nestjs/swagger';
import { MenuSlotResponseDto } from './menu-slot-response.dto';

export class MenuDayResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuListId: string;

  @ApiProperty()
  dayOrder: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [MenuSlotResponseDto], required: false })
  slots?: MenuSlotResponseDto[];
}
