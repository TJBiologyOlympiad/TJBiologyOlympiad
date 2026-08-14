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
    const { title, description, date, recurrence, until } = await request.json();
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
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        date,
        recurrence,
        until: recurrence !== "none" && until ? until : null,
      })
      .eq("id", Number(id))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE /api/events/[id]              -> removes the whole series
// DELETE /api/events/[id]?occurrence=YYYY-MM-DD -> removes just that one occurrence
// (recorded in excludedDates instead of deleting the row, since a recurring
// event is a single row whose occurrences are computed on read)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const occurrence = searchParams.get("occurrence");

    if (occurrence) {
      const { data: existing, error: fetchError } = await supabase
        .from("CalendarEvent")
        .select("recurrence, excludedDates")
        .eq("id", Number(id))
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      if (existing.recurrence === "none") {
        const { error } = await supabase.from("CalendarEvent").delete().eq("id", Number(id));
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      const excludedDates: string[] = existing.excludedDates ?? [];
      if (!excludedDates.includes(occurrence)) {
        const { error } = await supabase
          .from("CalendarEvent")
          .update({ excludedDates: [...excludedDates, occurrence] })
          .eq("id", Number(id));
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from("CalendarEvent").delete().eq("id", Number(id));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
