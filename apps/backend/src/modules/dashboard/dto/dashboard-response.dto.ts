import { ApiProperty } from '@nestjs/swagger';

export class StatItemDto {
  @ApiProperty({ example: 'Рецептов на модерации' })
  label: string;

  @ApiProperty({ example: 12 })
  value: number;

  @ApiProperty({ example: 'i-lucide-clock' })
  icon: string;

  @ApiProperty({ example: '+2' })
  trend: string;

  @ApiProperty({ example: 'warning' })
  color: 'warning' | 'info' | 'success' | 'secondary' | 'primary' | 'neutral' | 'error';
}

export class RecentRecipeDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Борщ с пампушками' })
  title: string;

  @ApiProperty({ example: 'Анна Петрова' })
  author: string;

  @ApiProperty({ example: 'moderation' })
  status: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  date: Date;
}

export class DashboardResponseDto {
  @ApiProperty({ type: [StatItemDto] })
  stats: StatItemDto[];

  @ApiProperty({ type: [RecentRecipeDto] })
  recentRecipes: RecentRecipeDto[];

  @ApiProperty({ example: 1280 })
  totalUsers: number;

  @ApiProperty({ example: 245 })
  totalRecipes: number;

  @ApiProperty({ example: 892 })
  totalComments: number;

  @ApiProperty({ example: 1560 })
  totalIngredients: number;

  @ApiProperty({ example: 24 })
  totalCategories: number;

  @ApiProperty({ example: 12 })
  pendingModeration: number;
}
