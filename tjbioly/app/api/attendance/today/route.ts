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
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const targetDate = date && date >= today ? date : today;

  const { data } = await supabase
    .from("AttendanceBlock")
    .select("id, blockType, date, isClosed, createdAt")
    .eq("date", targetDate)
    .eq("isClosed", false)
    .order("createdAt");
  const blocks = data || [];

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
