import { ApiProperty } from '@nestjs/swagger';
import { MenuSlotResponseDto } from './menu-slot-response.dto';

export class MenuListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ example: 'Семейное меню' })
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;

  @ApiProperty({ type: [MenuSlotResponseDto], required: false })
  slots?: MenuSlotResponseDto[];
}
