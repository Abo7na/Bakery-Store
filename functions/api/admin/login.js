import { createSession, isAuthConfigured, safeEqual, sessionCookie } from "../../_auth.js";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
  }

  if (!isAuthConfigured(env)) {
    return Response.json({ error: "auth_not_configured" }, { status: 503 });
  }

  const origin = request.headers.get("Origin");
  if (origin !== new URL(request.url).origin) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return Response.json({ error: "invalid_request" }, { status: 415 });
  }

  const bodyText = await request.text();
  if (bodyText.length > 2048) {
    return Response.json({ error: "invalid_request" }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!safeEqual(password, env.ADMIN_PASSWORD)) {
    return Response.json({ error: "invalid_credentials" }, {
      status: 401,
      headers: { "Cache-Control": "no-store" }
    });
  }

  const token = await createSession(env);
  return Response.json({ ok: true }, {
    headers: {
      "Set-Cookie": sessionCookie(token),
      "Cache-Control": "no-store",
      "Pragma": "no-cache"
    }
  });
}
