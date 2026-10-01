import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blockId, code } = await request.json();
    if (!blockId || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: block } = await supabase
      .from("AttendanceBlock")
      .select("*")
      .eq("id", Number(blockId))
      .maybeSingle();

    if (!block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    if (block.date < today) {
      return NextResponse.json({ error: "This attendance date has passed" }, { status: 400 });
    }

    const isStaff = user.roles.includes("officer") || user.roles.includes("sponsor");
    if (block.isClosed && !isStaff) {
      return NextResponse.json({ error: "Block is closed" }, { status: 400 });
    }

    if (block.code !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("AttendanceRecord")
      .select("id")
      .eq("blockId", Number(blockId))
      .eq("userId", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already marked present" }, { status: 400 });
    }

    const { data: record, error } = await supabase
      .from("AttendanceRecord")
      .insert({ blockId: Number(blockId), userId: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, record });
  } catch {
    return NextResponse.json({ error: "Failed to submit attendance" }, { status: 500 });
  }
}
