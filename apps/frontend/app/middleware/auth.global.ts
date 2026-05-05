export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/cabinet")) {
    return;
  }

  const token = useCookie<string | null>("access_token");
  if (!token.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
