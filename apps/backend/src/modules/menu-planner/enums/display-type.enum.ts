import { ApiProperty } from '@nestjs/swagger';

export enum DisplayType {
  DAYS = 'days',
  CALENDAR = 'calendar',
}

export const DisplayTypeLabels: Record<DisplayType, string> = {
  [DisplayType.DAYS]: 'Дни',
  [DisplayType.CALENDAR]: 'Календарь',
};
