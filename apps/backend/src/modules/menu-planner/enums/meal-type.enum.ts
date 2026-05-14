import { ApiProperty } from '@nestjs/swagger';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export const MealTypeLabels: Record<MealType, string> = {
  [MealType.BREAKFAST]: 'Завтрак',
  [MealType.LUNCH]: 'Обед',
  [MealType.DINNER]: 'Ужин',
  [MealType.SNACK]: 'Перекус',
};
