// plugins/auth.client.ts
import { useAuth } from "~/composables/useAuth";

export default defineNuxtPlugin(async () => {
  const { restoreSession } = useAuth();

  // Восстанавливаем сессию при загрузке приложения (только на клиенте)
  if (process.client) {
    await restoreSession();
  }
});
