import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabase
    .from("Notification")
    .update({ read: true })
    .eq("id", Number(id))
    .eq("userId", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
