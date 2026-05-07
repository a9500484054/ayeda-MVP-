// stores/userStore.ts
import type { UserDto } from "~/shared/types/domain";

export const useUserStore = defineStore("user", () => {
  const user = ref<UserDto | null>(null);
  const isAuthenticated = computed(() => Boolean(user.value));
  const isAdmin = computed(() => user.value?.role === "admin");
  const isModerator = computed(() => user.value?.role === "admin" || user.value?.role === "moderator");

  function setUser(value: UserDto | null) {
    user.value = value;
  }

  return { user, isAuthenticated, isAdmin, isModerator, setUser };
});
