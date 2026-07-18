import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Officer edits their own bio.
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.roles.includes("officer")) {
    return NextResponse.json({ error: "Officers only" }, { status: 403 });
  }

  try {
    const { bio } = await request.json();
    const { error } = await supabase
      .from("User")
      .update({ bio: typeof bio === "string" ? bio : null })
      .eq("id", user.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
