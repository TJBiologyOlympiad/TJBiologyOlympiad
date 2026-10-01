import { createHmac, timingSafeEqual } from "node:crypto";

export const NAV_SESSION_COOKIE = "nav_session";

export type NavUser = { id: number; name: string | null; roles: string[] };

function secret() {
  return process.env.SESSION_SECRET || process.env.ION_CLIENT_SECRET || process.env.NEXT_CLIENT_SECRET;
}

export function createNavSession(user: NavUser): string {
  const key = secret();
  if (!key) throw new Error("Session signing secret is not configured");
  const payload = Buffer.from(JSON.stringify({ ...user, expiresAt: Date.now() + 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function parseNavUser(value: string | undefined): NavUser | null {
  if (!value) return null;
  try {
    const key = secret();
    if (!key) return null;
    const [payload, signature, extra] = value.split(".");
    if (!payload || !signature || extra) return null;
    const actual = Buffer.from(signature, "base64url");
    const expected = createHmac("sha256", key).update(payload).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!Number.isInteger(user.id) || user.id <= 0 ||
        !Number.isFinite(user.expiresAt) || user.expiresAt <= Date.now() ||
        (user.name !== null && typeof user.name !== "string") ||
        !Array.isArray(user.roles) || !user.roles.every((role: unknown) => typeof role === "string")) return null;
    return { id: user.id, name: user.name, roles: user.roles };
  } catch { return null; }
}

export function navCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60,
    path: "/",
  };
}
