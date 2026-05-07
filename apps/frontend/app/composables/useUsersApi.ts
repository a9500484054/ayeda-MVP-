import type { UserDto } from "~/shared/types/domain";

export interface CreateUserDto {
  email: string;
  password: string;
  username: string;
}

export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  role?: 'user' | 'moderator' | 'admin';
}

export interface UsersResponse {
  data: UserDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function useUsersApi() {
  const config = useRuntimeConfig();
  const accessToken = useCookie<string | null>("access_token");

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // if (accessToken.value) {
    //   headers['Authorization'] = `Bearer ${accessToken.value}`;
    // }

    const response = await fetch(`${config.public.apiBase}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  return {
    // Получить список пользователей с пагинацией
    async getUsers(page: number = 1, limit: number = 10): Promise<UsersResponse> {
      return await fetchWithAuth(`/users?page=${page}&limit=${limit}`, {
        method: 'GET',
      });
    },

    // Получить текущего авторизованного пользователя
    async getCurrentUser(): Promise<UserDto> {
      return await fetchWithAuth('/users/me', {
        method: 'GET',
      });
    },

    // Получить пользователя по ID
    async getUserById(id: string): Promise<UserDto> {
      return await fetchWithAuth(`/users/${id}`, {
        method: 'GET',
      });
    },

    // Создать пользователя
    async createUser(data: CreateUserDto): Promise<UserDto> {
      return await fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Обновить пользователя
    async updateUser(id: string, data: UpdateUserDto): Promise<UserDto> {
      return await fetchWithAuth(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    // Удалить пользователя (soft delete)
    async deleteUser(id: string): Promise<void> {
      await fetchWithAuth(`/users/${id}`, {
        method: 'DELETE',
      });
    }
  };
}
