import { useUserStore } from "~/stores/userStore";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) {
    return;
  }

  const userStore = useUserStore();
  if (!userStore.user && useCookie("access_token").value) {
    await userStore.fetchMe();
  }

  if (!userStore.isModerator) {
    return navigateTo("/login");
  }
});
