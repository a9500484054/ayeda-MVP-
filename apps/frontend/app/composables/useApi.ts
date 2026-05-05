export function useApi() {
  const config = useRuntimeConfig();
  const accessToken = useCookie<string | null>("access_token");

  return $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (!accessToken.value) {
        return;
      }

      options.headers = new Headers(options.headers);
      options.headers.set("Authorization", `Bearer ${accessToken.value}`);
    },
  });
}
