import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

const KEY = "resourcesDriveUrl";

export async function GET() {
  const { data } = await supabase.from("AppSetting").select("value").eq("key", KEY).maybeSingle();
  return NextResponse.json({ url: data?.value ?? null });
}

export async function PUT(request: Request) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { url } = await request.json();
    if (typeof url !== "string" || !url.trim() || !/^https?:\/\//.test(url.trim())) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    const { error } = await supabase
      .from("AppSetting")
      .upsert({ key: KEY, value: url.trim(), updatedAt: new Date().toISOString() });
    if (error) throw error;
    return NextResponse.json({ success: true, url: url.trim() });
  } catch {
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }
}
