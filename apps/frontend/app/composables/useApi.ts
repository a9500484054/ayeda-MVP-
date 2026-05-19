// apps/frontend/app/composables/useApi.ts
import { useUserStore } from "~/stores/userStore";

export function useApi() {
  const config = useRuntimeConfig();
  const accessToken = useCookie<string | null>("access_token");
  const refreshToken = useCookie<string | null>("refresh_token");
  const userStore = useUserStore();

  // Флаги для предотвращения множественных обновлений
  let isRefreshing = false;
  let refreshPromise: Promise<string | null> | null = null;

  // Функция для обновления токена
  const attemptRefresh = async (): Promise<string | null> => {
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    if (!refreshToken.value) {
      return null;
    }

    isRefreshing = true;

    refreshPromise = (async () => {
      try {
        const response = await fetch(`${config.public.apiBase}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: refreshToken.value }),
        });

        if (!response.ok) {
          throw new Error("Refresh failed");
        }

        const data = await response.json();
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        if (newAccessToken) {
          accessToken.value = newAccessToken;
          if (newRefreshToken) {
            refreshToken.value = newRefreshToken;
          }
          return newAccessToken;
        }

        return null;
      } catch (error) {
        console.error("Refresh token error:", error);
        accessToken.value = null;
        refreshToken.value = null;
        userStore.setUser(null);

        if (process.client) {
          await navigateTo("/login");
        }

        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  // Создаем экземпляр $fetch с перехватчиками
  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (accessToken.value) {
        options.headers = new Headers(options.headers);
        options.headers.set("Authorization", `Bearer ${accessToken.value}`);
      }
    },
    async onResponseError({ request, options, response }) {
      if (response.status === 401) {
        const newToken = await attemptRefresh();

        if (newToken) {
          options.headers = new Headers(options.headers);
          options.headers.set("Authorization", `Bearer ${newToken}`);
          return $fetch(request.toString(), options);
        }
      }

      throw response;
    },
  });

  return api;
}
