export default defineEventHandler((event) => {
  const baseUrl = getRequestURL(event).origin;
  const urls = ["", "/recipes", "/about", "/policy", "/offer", "/blog"];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${baseUrl}${url}</loc></url>`).join("\n")}
</urlset>`;

  setHeader(event, "content-type", "application/xml");
  return body;
});
