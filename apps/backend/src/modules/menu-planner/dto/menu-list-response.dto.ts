// apps\backend\src\modules\menu-planner\dto\menu-list-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { MenuSlotResponseDto } from './menu-slot-response.dto';
import { MenuDayResponseDto } from './menu-day-response.dto';
import { DisplayType } from '../enums/display-type.enum';

export class MenuListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
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

  // ❌ УДАЛЕНО поле deletedAt

  @ApiProperty({ type: [MenuSlotResponseDto], required: false })
  slots?: MenuSlotResponseDto[];

  @ApiProperty({ type: [MenuDayResponseDto], required: false })  // ← Добавить это поле
  days?: MenuDayResponseDto[];

  @ApiProperty({ enum: DisplayType })
  displayType: DisplayType;
}
