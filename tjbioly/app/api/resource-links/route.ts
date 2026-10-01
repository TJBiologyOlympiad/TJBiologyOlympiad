import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

function validUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}

export async function GET() {
  const { data, error } = await supabase.from("ResourceLink").select("id, title, url").order("createdAt");
  if (error) return NextResponse.json({ error: "Failed to load links" }, { status: 500 });
  return NextResponse.json({ links: data });
}

export async function POST(request: Request) {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { title, url } = await request.json();
  if (typeof title !== "string" || !title.trim() || !validUrl(url)) {
    return NextResponse.json({ error: "Enter a title and a valid http or https URL" }, { status: 400 });
  }
  const { data, error } = await supabase.from("ResourceLink").insert({ title: title.trim(), url: url.trim() }).select("id, title, url").single();
  if (error) return NextResponse.json({ error: "Failed to add link" }, { status: 500 });
  return NextResponse.json({ link: data }, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id, title, url } = await request.json();
  if (!Number.isInteger(id) || id <= 0 || typeof title !== "string" || !title.trim() || !validUrl(url)) {
    return NextResponse.json({ error: "Enter a title and a valid http or https URL" }, { status: 400 });
  }
  const { data, error } = await supabase.from("ResourceLink").update({ title: title.trim(), url: url.trim() }).eq("id", id).select("id, title, url").single();
  if (error) return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  return NextResponse.json({ link: data });
}

export async function DELETE(request: Request) {
  if (!(await checkOfficerAccess())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { error } = await supabase.from("ResourceLink").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  return NextResponse.json({ success: true });
}
