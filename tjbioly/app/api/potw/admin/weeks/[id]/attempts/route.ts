import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

type AttemptRow = {
  id: number;
  userId: number;
  score: number;
  totalProblems: number;
  violationCount: number;
  awayMs: number;
  durationMs: number;
  copyCount: number;
  pasteCount: number;
  submittedAt: string;
  User: { name: string | null; username: string | null; leaderboardBanned: boolean } | null;
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { data, error } = await supabase
    .from("POTWAttempt")
    .select("id, userId, score, totalProblems, violationCount, awayMs, durationMs, copyCount, pasteCount, submittedAt, User(name, username, leaderboardBanned)")
    .eq("weekId", Number(id))
    .order("score", { ascending: false });

  if (error) {
    console.error("POTW attempts review failed", error);
    return NextResponse.json({ error: error.code === "42703" ? "Database schema update required; rerun supabase/schema.sql" : "Failed to fetch attempts" }, { status: 500 });
  }

  const attempts = (data as unknown as AttemptRow[]).map((a) => ({
    id: a.id,
    userId: a.userId,
    name: a.User?.name ?? null,
    username: a.User?.username ?? null,
    score: a.score,
    totalProblems: a.totalProblems,
    violationCount: a.violationCount,
    awayMs: a.awayMs,
    durationMs: a.durationMs,
    copyCount: a.copyCount,
    pasteCount: a.pasteCount,
    leaderboardBanned: a.User?.leaderboardBanned ?? false,
    submittedAt: a.submittedAt,
  }));

  return NextResponse.json({ attempts });
}
