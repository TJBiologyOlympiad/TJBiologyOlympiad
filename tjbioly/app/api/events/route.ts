import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser, checkOfficerAccess } from "@/lib/auth";

const RECURRENCES = ["none", "weekly", "biweekly", "monthly"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("CalendarEvent")
    .select("id, title, description, date, recurrence")
    .order("date");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
  return NextResponse.json({ events: data });
}

export async function POST(request: Request) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
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
      .insert({ title: title.trim(), description: description?.trim() || null, date, recurrence })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, event: data });
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
