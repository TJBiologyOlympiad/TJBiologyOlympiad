import { cookies } from "next/headers";
import { supabase } from "@/lib/db";

export type AppUser = {
  id: number;
  ionId: string;
  name: string | null;
  username: string | null;
  classYear: string | null;
  roles: string[];
  pfpUrl: string | null;
  bio: string | null;
};

async function lookupUser(token: string): Promise<AppUser | null> {
  const profileRes = await fetch("https://ion.tjhsst.edu/api/profile", {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!profileRes.ok) return null;

  const profileData = await profileRes.json();
  const ionId = String(profileData.id);

  const { data: user } = await supabase
    .from("User")
    .select("id, ionId, name, username, classYear, roles, pfpUrl, bio")
    .eq("ionId", ionId)
    .maybeSingle();

  return (user as AppUser) ?? null;
}

async function currentUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ion_access_token")?.value;
  if (!token) return null;
  try {
    return await lookupUser(token);
  } catch {
    return null;
  }
}

// officer = full admin access (+ role editing + officer profile features)
export async function checkOfficerAccess(): Promise<boolean> {
  const user = await currentUser();
  return !!user && user.roles.includes("officer");
}

// staff = officer or sponsor (admin panel + attendance management)
export async function checkStaffAccess(): Promise<boolean> {
  const user = await currentUser();
  return !!user && (user.roles.includes("officer") || user.roles.includes("sponsor"));
}

export async function getCurrentUser(): Promise<AppUser | null> {
  return currentUser();
}

export async function getCurrentUserIonId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ion_access_token")?.value;
  if (!token) return null;
  try {
    const profileRes = await fetch("https://ion.tjhsst.edu/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!profileRes.ok) return null;
    const profileData = await profileRes.json();
    return String(profileData.id);
  } catch {
    return null;
  }
}
