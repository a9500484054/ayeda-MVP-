export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const path = event.context.params?._ ?? "";

  return await proxyRequest(event, `${config.public.apiBase}/${path}`);
});
