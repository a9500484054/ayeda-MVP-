import type { UserDto } from "~/shared/types/domain";
import { useApi } from "~/composables/useApi";

export const useUserStore = defineStore("user", () => {
  const user = ref<UserDto | null>(null);
  const isAuthenticated = computed(() => Boolean(user.value));
  const isAdmin = computed(() => user.value?.role === "admin");
  const isModerator = computed(() => user.value?.role === "admin" || user.value?.role === "moderator");

  function setUser(value: UserDto | null) {
    user.value = value;
  }

  async function fetchMe() {
    const api = useApi();
    try {
      user.value = await api<UserDto>("/users/me");
    } catch {
      user.value = null;
    }
  }

  return { user, isAuthenticated, isAdmin, isModerator, setUser, fetchMe };
});
