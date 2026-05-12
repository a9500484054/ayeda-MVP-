
import { useApi } from "./useApi";
export interface Unit {
  id: string;
  code: string;
  name: string;
  short: string;
  type: 'mass' | 'volume' | 'count' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitDto {
  code: string;
  name: string;
  description: string;
}

export interface UpdateUnitDto {
  code?: string;
  name?: string;
  description?: string;
}

export interface UnitsResponse {
  data: Unit[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function useUnitsApi() {
  const api = useApi();

  return {
    // Получить список единиц измерения
    async getUnits(page: number = 1, limit: number = 10): Promise<UnitsResponse> {
      return await api('/units', {
        method: 'GET',
        params: { page, limit }
      });
    },

    // Получить единицу измерения по ID
    async getUnitById(id: string): Promise<Unit> {
      return await api(`/units/${id}`);
    },

    // Создать единицу измерения
    async createUnit(data: CreateUnitDto): Promise<Unit> {
      return await api('/units', {
        method: 'POST',
        body: data
      });
    },

    // Обновить единицу измерения
    async updateUnit(id: string, data: UpdateUnitDto): Promise<Unit> {
      return await api(`/units/${id}`, {
        method: 'PATCH',
        body: data
      });
    },

    // Удалить единицу измерения
    async deleteUnit(id: string): Promise<void> {
      await api(`/units/${id}`, {
        method: 'DELETE'
      });
    }
  };
}
