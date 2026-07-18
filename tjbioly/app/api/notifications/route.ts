import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ notifications: [] });
  }

  const { data } = await supabase
    .from("Notification")
    .select("*")
    .eq("userId", user.id)
    .order("createdAt", { ascending: false })
    .limit(30);

  return NextResponse.json({ notifications: data || [] });
}
