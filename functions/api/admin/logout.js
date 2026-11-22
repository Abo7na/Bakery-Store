import { readCookie, sessionCookie, verifySession } from "../../_auth.js";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
  }

  const origin = request.headers.get("Origin");
  if (origin !== new URL(request.url).origin) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const token = readCookie(request, "bakery_admin_session");
  if (!(await verifySession(token, env))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  return Response.json({ ok: true }, {
    headers: {
      "Set-Cookie": sessionCookie("", 0),
      "Cache-Control": "no-store"
    }
  });
}
