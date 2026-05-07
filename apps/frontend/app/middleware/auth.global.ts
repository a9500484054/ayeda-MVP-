// middleware/auth.global.ts
import { useAuth } from "~/composables/useAuth";
import { useUserStore } from "~/stores/userStore";

export default defineNuxtRouteMiddleware(async (to) => {
  // Проверяем только protected маршруты
  const protectedRoutes = ['/cabinet'];
  const isProtected = protectedRoutes.some(route => to.path.startsWith(route));

  // Если маршрут не защищен - пропускаем
  if (!isProtected) {
    return;
  }

  const token = useCookie<string | null>("access_token");
  const userStore = useUserStore();

  // Если нет токена - редирект на логин
  if (!token.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // Если есть токен, но нет user - пытаемся восстановить
  if (token.value && !userStore.user) {
    const { restoreSession } = useAuth();
    await restoreSession();

    // Если после восстановления все еще нет пользователя
    if (!userStore.user) {
      token.value = null;
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
  }
});
