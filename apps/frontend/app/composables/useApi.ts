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
      console.log("No refresh token available");
      return null;
    }

    isRefreshing = true;

    refreshPromise = (async () => {
      try {
        console.log("🔄 Attempting to refresh tokens...");

        const response = await fetch(`${config.public.apiBase}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: refreshToken.value }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Refresh failed:", response.status, errorText);
          throw new Error("Refresh failed");
        }

        const data = await response.json();
        console.log("✅ Refresh response:", { hasAccessToken: !!data.accessToken, hasRefreshToken: !!data.refreshToken });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        if (newAccessToken) {
          accessToken.value = newAccessToken;
          if (newRefreshToken) {
            refreshToken.value = newRefreshToken;
          }
          console.log("✅ Tokens updated successfully");
          return newAccessToken;
        }

        return null;
      } catch (error) {
        console.error("❌ Refresh token error:", error);
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

  // Функция для выполнения запроса с автоматическим ретраем при 401
  const fetchWithRetry = async (url: string, options: any = {}, retryCount = 0): Promise<any> => {
    const maxRetries = 1;

    // Подготавливаем headers
    const headers = new Headers(options.headers || {});
    if (accessToken.value && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${accessToken.value}`);
    }
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const fetchOptions = {
      ...options,
      headers,
    };

    // Если body не FormData и не строка - преобразуем в JSON
    if (fetchOptions.body && typeof fetchOptions.body === "object" && !(fetchOptions.body instanceof FormData)) {
      fetchOptions.body = JSON.stringify(fetchOptions.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      // Если 401 и есть ретраи
      if (response.status === 401 && retryCount < maxRetries) {
        console.log(`⚠️ Got 401, attempting refresh (attempt ${retryCount + 1})...`);

        const newToken = await attemptRefresh();

        if (newToken) {
          console.log("✅ Token refreshed, retrying original request...");
          // Обновляем headers с новым токеном
          headers.set("Authorization", `Bearer ${newToken}`);
          const retryOptions = {
            ...options,
            headers,
          };

          if (retryOptions.body && typeof retryOptions.body === "object" && !(retryOptions.body instanceof FormData)) {
            retryOptions.body = JSON.stringify(retryOptions.body);
          }

          const retryResponse = await fetch(url, retryOptions);

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          // Парсим ответ в зависимости от Content-Type
          const contentType = retryResponse.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            return await retryResponse.json();
          }
          return retryResponse;
        }
      }

      // Если не 401 или ретраи закончились
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      // Парсим ответ
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }

      return response;
    } catch (error) {
      console.error("❌ API request failed:", error);
      throw error;
    }
  };

  // Создаем обертку с методами
  const api = async (endpoint: string, options: any = {}) => {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${config.public.apiBase}${endpoint}`;

    return fetchWithRetry(url, options);
  };

  // Добавляем удобные методы
  api.get = (endpoint: string, options?: any) => api(endpoint, { ...options, method: "GET" });
  api.post = (endpoint: string, body?: any, options?: any) => api(endpoint, { ...options, method: "POST", body });
  api.put = (endpoint: string, body?: any, options?: any) => api(endpoint, { ...options, method: "PUT", body });
  api.patch = (endpoint: string, body?: any, options?: any) => api(endpoint, { ...options, method: "PATCH", body });
  api.delete = (endpoint: string, options?: any) => api(endpoint, { ...options, method: "DELETE" });

  return api;
}
