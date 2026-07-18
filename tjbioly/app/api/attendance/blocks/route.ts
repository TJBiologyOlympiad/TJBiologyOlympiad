import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkStaffAccess } from "@/lib/auth";

type BlockRow = {
  id: number;
  blockType: string;
  date: string;
  code: string;
  isClosed: boolean;
  createdAt: string;
  AttendanceRecord?: { count: number }[];
};

// GET — list all blocks with a present count (staff only)
export async function GET() {
  if (!(await checkStaffAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("AttendanceBlock")
    .select("*, AttendanceRecord(count)")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch blocks" }, { status: 500 });
  }

  const blocks = (data as BlockRow[]).map((b) => ({
    id: b.id,
    blockType: b.blockType,
    date: b.date,
    code: b.code,
    isClosed: b.isClosed,
    createdAt: b.createdAt,
    _count: { records: b.AttendanceRecord?.[0]?.count ?? 0 },
  }));

  return NextResponse.json({ blocks });
}

export async function POST(request: Request) {
  if (!(await checkStaffAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { blockType, date, code } = await request.json();
    if (!blockType || !date || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("AttendanceBlock")
      .insert({ blockType, date, code })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, block: data });
  } catch {
    return NextResponse.json({ error: "Failed to create block" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await checkStaffAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id, blockType, date, code } = await request.json();
    if (!id || !blockType || !date || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("AttendanceBlock")
      .update({ blockType, date, code })
      .eq("id", Number(id))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, block: data });
  } catch {
    return NextResponse.json({ error: "Failed to update block" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await checkStaffAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id, isClosed } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing block id" }, { status: 400 });
    const { data, error } = await supabase
      .from("AttendanceBlock")
      .update({ isClosed })
      .eq("id", Number(id))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, block: data });
  } catch {
    return NextResponse.json({ error: "Failed to update block" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await checkStaffAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing block id" }, { status: 400 });
    const { error } = await supabase.from("AttendanceBlock").delete().eq("id", Number(id));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete block" }, { status: 500 });
  }
}
