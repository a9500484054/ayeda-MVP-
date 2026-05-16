import { ApiProperty } from '@nestjs/swagger';

export enum DisplayType {
  DAYS = 'days',
  CALENDAR = 'calendar',
  BANQUET = 'banquet',
}

export const DisplayTypeLabels: Record<DisplayType, string> = {
  [DisplayType.DAYS]: 'Дни',
  [DisplayType.CALENDAR]: 'Календарь',
  [DisplayType.BANQUET]: 'Банкет',
};

export const DisplayTypeOptions = [
  { value: DisplayType.DAYS, label: 'Дни' },
  { value: DisplayType.CALENDAR, label: 'Календарь' },
  { value: DisplayType.BANQUET, label: 'Банкет' },
];
