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
  submittedAt: string;
  User: { name: string | null; username: string | null } | null;
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { data, error } = await supabase
    .from("POTWAttempt")
    .select("id, userId, score, totalProblems, violationCount, awayMs, submittedAt, User(name, username)")
    .eq("weekId", Number(id))
    .order("score", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
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
    submittedAt: a.submittedAt,
  }));

  return NextResponse.json({ attempts });
}
