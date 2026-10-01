import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

export async function PATCH(request: Request) {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { userId, banned } = await request.json();
  if (!Number.isInteger(userId) || userId <= 0 || typeof banned !== "boolean") {
    return NextResponse.json({ error: "Invalid user or ban status" }, { status: 400 });
  }
  const { data, error } = await supabase.from("User")
    .update({ leaderboardBanned: banned }).eq("id", userId)
    .select("id, leaderboardBanned").single();
  if (error) return NextResponse.json({ error: "Failed to update leaderboard status" }, { status: 500 });
  return NextResponse.json({ user: data });
}
