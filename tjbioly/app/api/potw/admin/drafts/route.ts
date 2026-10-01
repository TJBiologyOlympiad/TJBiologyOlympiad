import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

export async function GET() {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { data, error } = await supabase.from("POTWDraft").select("id, topic, description, problems, updatedAt").order("updatedAt", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed to load drafts" }, { status: 500 });
  return NextResponse.json({ drafts: data });
}

function validDraft(topic: unknown, description: unknown, problems: unknown) {
  return typeof topic === "string" && typeof description === "string" && Array.isArray(problems) &&
    problems.every(p => p && typeof p.prompt === "string" && Array.isArray(p.choices) &&
      p.choices.every((c: unknown) => typeof c === "string") && Number.isInteger(p.correctIndex));
}

export async function POST(request: Request) {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { topic, description, problems } = await request.json();
  if (!validDraft(topic, description, problems)) return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
  const { data, error } = await supabase.from("POTWDraft").insert({ topic, description, problems }).select("id, topic, description, problems, updatedAt").single();
  if (error) return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  return NextResponse.json({ draft: data }, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id, topic, description, problems } = await request.json();
  if (!Number.isInteger(id) || !validDraft(topic, description, problems)) return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
  const { data, error } = await supabase.from("POTWDraft").update({ topic, description, problems, updatedAt: new Date().toISOString() }).eq("id", id).select("id, topic, description, problems, updatedAt").single();
  if (error) return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  return NextResponse.json({ draft: data });
}

export async function DELETE(request: Request) {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { error } = await supabase.from("POTWDraft").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
  return NextResponse.json({ success: true });
}
