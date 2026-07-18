import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

export async function GET() {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("User")
    .select("id, ionId, name, email, username, classYear, roles")
    .order("id");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
  return NextResponse.json({ users: data });
}

export async function PUT(request: Request) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, roles } = await request.json();
    if (!id || !Array.isArray(roles)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("User")
      .update({ roles })
      .eq("id", Number(id))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, user: data });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
