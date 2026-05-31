// apps/frontend/composables/useShoppingCategoriesApi.ts

import { useApi } from "./useApi"

export interface ShoppingCategory {
  id: string
  code: string
  name: string
  icon: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateShoppingCategoryDto {
  code: string
  name: string
  icon: string
  sortOrder?: number
}

export interface UpdateShoppingCategoryDto {
  code?: string           // 👈 Добавляем code в DTO обновления
  name?: string
  icon?: string
  sortOrder?: number
  isActive?: boolean
}

export const useShoppingCategoriesApi = () => {
  const api = useApi()

  const getCategories = async (activeOnly: boolean = true) => {
    const query = activeOnly ? '' : '?all=true'
    return await api.get<ShoppingCategory[]>(`/shopping-categories${query}`)
  }

  const getAllForAdmin = async () => {
    return await api.get<ShoppingCategory[]>('/shopping-categories?all=true')
  }

  const getCategory = async (id: string) => {
    return await api.get<ShoppingCategory>(`/shopping-categories/${id}`)
  }

  const createCategory = async (data: CreateShoppingCategoryDto) => {
    return await api.post<ShoppingCategory>('/shopping-categories', data)
  }

  const updateCategory = async (id: string, data: UpdateShoppingCategoryDto) => {
    return await api.patch<ShoppingCategory>(`/shopping-categories/${id}`, data)
  }

  const deleteCategory = async (id: string) => {
    return await api.delete(`/shopping-categories/${id}`)
  }

  return {
    getCategories,
    getAllForAdmin,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
