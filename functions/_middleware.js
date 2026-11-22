import { isAuthConfigured, readCookie, verifySession } from "./_auth.js";

const COOKIE_NAME = "bakery_admin_session";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const isAdminPage = path === "/admin" || path.startsWith("/admin/");
  const isAdminApi = path.startsWith("/api/admin/");
  if (!isAdminPage && !isAdminApi) return context.next();

  if (path === "/api/admin/login") return context.next();

  if (!isAuthConfigured(env)) {
    return new Response(
      "لم يتم إعداد حماية لوحة الإدارة بعد. أضف ADMIN_PASSWORD و SESSION_SECRET في إعدادات Cloudflare Pages.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }

  const token = readCookie(request, COOKIE_NAME);
  if (await verifySession(token, env)) {
    const response = await context.next();
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store, private");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  if (isAdminApi) {
    return Response.json({ error: "unauthorized" }, {
      status: 401,
      headers: { "Cache-Control": "no-store" }
    });
  }

  const loginUrl = new URL("/admin-login.html", url.origin);
  loginUrl.searchParams.set("next", path + url.search);
  return new Response(null, { status: 302, headers: { Location: loginUrl.toString(), "Cache-Control": "no-store" } });
}
