import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const targetDate = date || new Date().toISOString().split("T")[0];

  const isStaff = user.roles.includes("officer") || user.roles.includes("sponsor");

  let blocks: Record<string, unknown>[] = [];

  if (isStaff) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data } = await supabase
      .from("AttendanceBlock")
      .select("*")
      .gte("date", weekAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });
    blocks = data || [];
  } else {
    const { data } = await supabase
      .from("AttendanceBlock")
      .select("*")
      .eq("date", targetDate)
      .eq("isClosed", false)
      .order("createdAt");
    blocks = data || [];
  }

  const { data: records } = await supabase
    .from("AttendanceRecord")
    .select("blockId")
    .eq("userId", user.id);

  const submitted = new Set((records || []).map((r) => r.blockId));

  const blocksWithStatus = blocks.map((b) => ({
    ...b,
    submitted: submitted.has((b as { id: number }).id),
  }));

  return NextResponse.json({ blocks: blocksWithStatus, date: targetDate });
}
