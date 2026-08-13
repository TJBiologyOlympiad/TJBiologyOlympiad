import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

const RECURRENCES = ["none", "weekly", "biweekly", "monthly"];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const { title, description, date, recurrence } = await request.json();
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    if (!RECURRENCES.includes(recurrence)) {
      return NextResponse.json({ error: "Invalid recurrence" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("CalendarEvent")
      .update({ title: title.trim(), description: description?.trim() || null, date, recurrence })
      .eq("id", Number(id))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, event: data });
  } catch {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const { error } = await supabase.from("CalendarEvent").delete().eq("id", Number(id));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
