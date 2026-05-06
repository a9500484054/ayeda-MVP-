import type { UserDto } from "~/shared/types/domain";
import { useUserStore } from "~/stores/userStore";
import { useApi } from "./useApi";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export function useAuth() {
  const userStore = useUserStore();
  const api = useApi();
  const accessToken = useCookie<string | null>("access_token", { sameSite: "lax" });
  const refreshToken = useCookie<string | null>("refresh_token", { sameSite: "strict" });

  // Реактивные ссылки на данные пользователя
  const user = computed(() => userStore.user);
  const isAuthenticated = computed(() => !!userStore.user);

  async function login(email: string, password: string) {
    try {
      const response = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      console.log("Login response:", response);

      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      userStore.setUser(response.user);

      console.log("User saved to store:", userStore.user);

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async function register(email: string, password: string, username: string) {
    try {
      const response = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: { email, password, username },
      });

      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      userStore.setUser(response.user);

      return response;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      accessToken.value = null;
      refreshToken.value = null;
      userStore.setUser(null);
      await navigateTo("/");
    }
  }

  async function refresh() {
    if (!refreshToken.value) {
      return null;
    }

    try {
      const response = await api<Pick<AuthResponse, "accessToken">>("/auth/refresh", {
        method: "POST",
        body: { refreshToken: refreshToken.value },
      });
      accessToken.value = response.accessToken;
      return response.accessToken;
    } catch (error) {
      console.error("Refresh error:", error);
      return null;
    }
  }

  // Функция для восстановления сессии при загрузке приложения
  async function restoreSession() {
    console.log("Restoring session...");
    console.log("Access token exists:", !!accessToken.value);
    console.log("User already in store:", !!userStore.user);

    if (accessToken.value && !userStore.user) {
      try {
        console.log("Fetching user data...");
        const apiForUser = useApi();
        const user = await apiForUser<UserDto>("/users/me");
        console.log("User data received:", user);
        userStore.setUser(user);
        return user;
      } catch (error) {
        console.error("Restore session error:", error);
        accessToken.value = null;
        refreshToken.value = null;
        return null;
      }
    }
    return userStore.user;
  }

  return {
    login,
    register,
    logout,
    refresh,
    restoreSession,
    user,
    isAuthenticated
  };
}
