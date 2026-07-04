// apps/frontend/app/composables/useDashboardApi.ts
import { useApi } from './useApi'

export interface DashboardStatsItem {
  label: string
  value: number
  icon: string
  trend: string
  color: string
}

export interface DashboardRecentRecipe {
  id: string
  title: string
  author: string
  status: 'moderation' | 'published' | 'draft' | 'rejected'
  date: string
}

export interface DashboardData {
  stats: DashboardStatsItem[]
  recentRecipes: DashboardRecentRecipe[]
  totalUsers: number
  totalRecipes: number
  totalComments: number
  totalIngredients: number
  totalCategories: number
  pendingModeration: number
}

export function useDashboardApi() {
  const api = useApi()

  /**
   * Получить данные для дашборда
   * Требует прав admin или moderator
   */
  async function getDashboard(): Promise<DashboardData> {
    return await api('/dashboard', {
      method: 'GET'
    })
  }

  return {
    getDashboard
  }
}
