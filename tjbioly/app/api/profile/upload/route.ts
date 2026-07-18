import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.roles.includes("officer")) {
    return NextResponse.json({ error: "Officers only" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "bin";
    const filename = `avatars/${user.ionId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("profiles")
      .upload(filename, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: publicUrlData } = admin.storage.from("profiles").getPublicUrl(filename);
    const pfpUrl = publicUrlData.publicUrl;

    await supabase.from("User").update({ pfpUrl }).eq("id", user.id);

    return NextResponse.json({ success: true, pfpUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
