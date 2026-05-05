const hits = new Map<string, { count: number; expiresAt: number }>();

export default defineEventHandler((event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
  const now = Date.now();
  const current = hits.get(ip);

  if (!current || current.expiresAt < now) {
    hits.set(ip, { count: 1, expiresAt: now + 60_000 });
    return;
  }

  current.count += 1;

  if (current.count > 180) {
    throw createError({ statusCode: 429, statusMessage: "Too many requests" });
  }
});
