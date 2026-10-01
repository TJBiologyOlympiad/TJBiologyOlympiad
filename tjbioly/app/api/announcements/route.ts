import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

export async function GET(request: Request) {
  const manage = new URL(request.url).searchParams.get("manage") === "1";
  if (manage && !(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  let query = supabase.from("Announcement").select("id, title, body, startsAt, endsAt").order("startsAt", { ascending: false });
  if (!manage) {
    const now = new Date().toISOString();
    query = query.lte("startsAt", now).gt("endsAt", now);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to load announcements" }, { status: 500 });
  return NextResponse.json({ announcements: data });
}

export async function POST(request: Request) {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { title, body, startsAt, endsAt } = await request.json();
  if (typeof title !== "string" || !title.trim() || typeof body !== "string" || !body.trim() ||
      !Number.isFinite(Date.parse(startsAt)) || !Number.isFinite(Date.parse(endsAt)) || Date.parse(endsAt) <= Date.parse(startsAt)) {
    return NextResponse.json({ error: "Enter a title, message, and valid start and end times" }, { status: 400 });
  }
  const { data, error } = await supabase.from("Announcement")
    .insert({ title: title.trim(), body: body.trim(), startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() })
    .select("id, title, body, startsAt, endsAt").single();
  if (error) return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  return NextResponse.json({ announcement: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { error } = await supabase.from("Announcement").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  return NextResponse.json({ success: true });
}
