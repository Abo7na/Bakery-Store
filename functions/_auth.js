const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\\+/g, "-").replace(/\\//g, "_");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function hmac(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export function isAuthConfigured(env) {
  return typeof env.ADMIN_PASSWORD === "string" &&
    env.ADMIN_PASSWORD.length >= 16 &&
    typeof env.SESSION_SECRET === "string" &&
    env.SESSION_SECRET.length >= 32;
}

export function safeEqual(left, right) {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index++) {
    difference |= (a[index] || 0) ^ (b[index] || 0);
  }
  return difference === 0;
}

export async function createSession(env) {
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  const payload = String(expiresAt);
  const signature = await hmac(payload, env.SESSION_SECRET);
  return `${toBase64Url(encoder.encode(payload))}.${toBase64Url(signature)}`;
}

export async function verifySession(token, env) {
  if (!token || !isAuthConfigured(env)) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  try {
    const payloadBytes = fromBase64Url(parts[0]);
    const signature = fromBase64Url(parts[1]);
    const payload = new TextDecoder().decode(payloadBytes);
    const expiresAt = Number(payload);
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(env.SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify("HMAC", key, signature, encoder.encode(payload));
  } catch {
    return false;
  }
}

export function readCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  for (const item of cookieHeader.split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    if (item.slice(0, separator).trim() === name) {
      return item.slice(separator + 1).trim();
    }
  }
  return "";
}

export function sessionCookie(token, maxAge = 8 * 60 * 60) {
  return `bakery_admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
