import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkStaffAccess } from "@/lib/auth";

function csvEscape(v: unknown) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  if (!(await checkStaffAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const blockId = searchParams.get("blockId");

  let query = supabase
    .from("AttendanceRecord")
    .select("timestamp, AttendanceBlock(blockType, date, code), User(name, username)")
    .order("timestamp", { ascending: false });

  if (blockId) query = query.eq("blockId", Number(blockId));

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }

  type Row = {
    timestamp: string;
    AttendanceBlock: { blockType: string; date: string; code: string } | null;
    User: { name: string | null; username: string | null } | null;
  };

  function lastNameKey(name: string | null | undefined): string {
    const trimmed = (name ?? "").trim();
    if (!trimmed) return "";
    const parts = trimmed.split(/\s+/);
    return parts[parts.length - 1].toLowerCase();
  }

  const rows = (data as unknown as Row[]) || [];
  rows.sort((a, b) => {
    const an = lastNameKey(a.User?.name);
    const bn = lastNameKey(b.User?.name);
    if (an === "" && bn === "") return 0;
    if (an === "") return 1;
    if (bn === "") return -1;
    return an.localeCompare(bn);
  });

  const header = ["Name", "Username", "Block", "Date", "Code", "Marked At"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.User?.name),
        csvEscape(r.User?.username),
        csvEscape(r.AttendanceBlock?.blockType),
        csvEscape(r.AttendanceBlock?.date),
        csvEscape(r.AttendanceBlock?.code),
        csvEscape(r.timestamp),
      ].join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="attendance${blockId ? `-block-${blockId}` : ""}.csv"`,
    },
  });
}
