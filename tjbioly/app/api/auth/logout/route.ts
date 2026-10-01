import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NAV_SESSION_COOKIE } from "@/lib/nav-session";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("ion_access_token");
  cookieStore.delete("ion_refresh_token");
  cookieStore.delete(NAV_SESSION_COOKIE);

  return NextResponse.json({ success: true });
}
