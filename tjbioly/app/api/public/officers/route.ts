import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// Public: returns a { [name]: { pfpUrl, bio } } map for users with the officer
// role who have set a photo or bio. The About page overlays this onto its
// static officer cards, matched by name.
export async function GET() {
  const { data, error } = await supabase
    .from("User")
    .select("name, roles, pfpUrl, bio")
    .contains("roles", ["officer"]);

  if (error) {
    return NextResponse.json({ officers: {} });
  }

  const officers: Record<string, { pfpUrl: string | null; bio: string | null }> = {};
  for (const u of data || []) {
    if (u.name && (u.pfpUrl || u.bio)) {
      officers[u.name] = { pfpUrl: u.pfpUrl ?? null, bio: u.bio ?? null };
    }
  }

  return NextResponse.json({ officers });
}
