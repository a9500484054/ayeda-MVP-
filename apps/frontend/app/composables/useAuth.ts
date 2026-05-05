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

  async function login(email: string, password: string) {
    const response = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    accessToken.value = response.accessToken;
    refreshToken.value = response.refreshToken;
    userStore.setUser(response.user);
    await navigateTo("/cabinet/my-recipes");
  }

  async function register(email: string, password: string, username: string) {
    const response = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: { email, password, username },
    });

    accessToken.value = response.accessToken;
    refreshToken.value = response.refreshToken;
    userStore.setUser(response.user);
    await navigateTo("/cabinet/my-recipes");
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
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

    const response = await api<Pick<AuthResponse, "accessToken">>("/auth/refresh", {
      method: "POST",
      body: { refreshToken: refreshToken.value },
    });
    accessToken.value = response.accessToken;
    return response.accessToken;
  }

  return { login, register, logout, refresh };
}
