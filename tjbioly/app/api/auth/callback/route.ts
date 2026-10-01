import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { NAV_SESSION_COOKIE, createNavSession, navCookieOptions } from "@/lib/nav-session";

const ion_client_id = process.env.ION_CLIENT_ID || process.env.NEXT_CLIENT_ID;
const ion_client_secret = process.env.ION_CLIENT_SECRET || process.env.NEXT_CLIENT_SECRET;
const ion_redirect_uri = process.env.ION_REDIRECT_URI;

function extractUsername(email: string | null): string | null {
  if (!email) return null;
  return email.split("@")[0];
}

function extractClassYear(email: string | null): string | null {
  if (!email) return null;
  const match = email.match(/^(\d{4})/);
  return match ? match[1] : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || !ion_client_id || !ion_client_secret || !ion_redirect_uri) {
    return NextResponse.json({ error: "Missing code or OAuth config" }, { status: 400 });
  }

  let stage = "token exchange";
  try {
    const tokenRes = await fetch("https://ion.tjhsst.edu/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: ion_client_id,
        client_secret: ion_client_secret,
        redirect_uri: ion_redirect_uri,
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.status}`);
    }

    const token = await tokenRes.json();

    stage = "Ion profile";
    const profileRes = await fetch("https://ion.tjhsst.edu/api/profile", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!profileRes.ok) {
      throw new Error("Failed to fetch Ion profile");
    }

    const profileData = await profileRes.json();
    if (profileData.id == null) throw new Error("Ion profile has no id");
    const ionId = String(profileData.id);
    const email = profileData.tj_email || profileData.email || null;
    const name = profileData.full_name || profileData.first_name || null;
    const username = extractUsername(email);
    const classYear = extractClassYear(email);

    const isAutoOfficer = username === "2028efeldman";

    stage = "user lookup";
    const { data: existing, error: lookupError } = await supabase
      .from('User')
      .select("id, roles")
      .eq("ionId", ionId)
      .maybeSingle();
    if (lookupError) throw lookupError;

    let userId: number;
    let finalRoles: string[];

    if (existing) {
      userId = existing.id;
      finalRoles = isAutoOfficer && !existing.roles.includes("officer")
        ? [...existing.roles, "officer"]
        : existing.roles;

      stage = "user update";
      const { error: updateError } = await supabase
        .from('User')
        .update({ email, name, username, classYear, roles: finalRoles })
        .eq("id", userId);
      if (updateError) throw updateError;
    } else {
      finalRoles = isAutoOfficer ? ["user", "officer"] : ["user"];

      stage = "user creation";
      const { data: inserted, error: insertError } = await supabase
        .from('User')
        .insert({ ionId, email, name, username, classYear, roles: finalRoles })
        .select("id, roles")
        .single();

      if (insertError) throw new Error(`Failed to insert user: ${insertError.message}`);
      if (!inserted) throw new Error("Failed to insert user: no data returned");
      userId = inserted.id;
    }

    stage = "session cookie";
    const cookieStore = await cookies();
    cookieStore.set("ion_access_token", token.access_token as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: (token.expires_in as number) || 3600,
      path: "/",
    });

    if (token.refresh_token) {
      cookieStore.set("ion_refresh_token", token.refresh_token as string, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    cookieStore.set(NAV_SESSION_COOKIE, createNavSession({ id: userId, name, roles: finalRoles }), navCookieOptions());

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error(`OAuth callback failed during ${stage}`, error);
    return NextResponse.json({ error: `Authentication failed during ${stage}` }, { status: 500 });
  }
}
