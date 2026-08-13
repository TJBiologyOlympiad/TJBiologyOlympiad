import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type AttemptRow = {
  userId: number;
  score: number;
  totalProblems: number;
  User: { name: string | null; username: string | null } | null;
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("POTWAttempt")
    .select("userId, score, totalProblems, User(name, username)");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch rankings" }, { status: 500 });
  }

  const byUser = new Map<
    number,
    { userId: number; name: string | null; username: string | null; totalScore: number; totalPossible: number; attempts: number }
  >();

  for (const a of data as unknown as AttemptRow[]) {
    const existing = byUser.get(a.userId);
    if (existing) {
      existing.totalScore += a.score;
      existing.totalPossible += a.totalProblems;
      existing.attempts += 1;
    } else {
      byUser.set(a.userId, {
        userId: a.userId,
        name: a.User?.name ?? null,
        username: a.User?.username ?? null,
        totalScore: a.score,
        totalPossible: a.totalProblems,
        attempts: 1,
      });
    }
  }

  const rankings = Array.from(byUser.values()).sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.totalPossible !== a.totalPossible) return b.totalPossible - a.totalPossible;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });

  return NextResponse.json({ rankings });
}
