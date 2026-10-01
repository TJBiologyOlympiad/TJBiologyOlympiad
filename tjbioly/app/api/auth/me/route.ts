import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { NAV_SESSION_COOKIE, createNavSession, navCookieOptions, parseNavUser } from "@/lib/nav-session";

export async function GET() {
  const cookieStore = await cookies();
  const user = await getCurrentUser();
  if (!user) {
    cookieStore.delete(NAV_SESSION_COOKIE);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  if (!parseNavUser(cookieStore.get(NAV_SESSION_COOKIE)?.value)) {
    cookieStore.set(NAV_SESSION_COOKIE, createNavSession({ id: user.id, name: user.name, roles: user.roles }), navCookieOptions());
  }
  return NextResponse.json({ authenticated: true, user }, { headers: { "Cache-Control": "no-store" } });
}
