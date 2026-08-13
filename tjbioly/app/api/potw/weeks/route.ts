import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type WeekRow = {
  id: number;
  topic: string;
  description: string | null;
  createdAt: string;
  POTWProblem?: { count: number }[];
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("POTWWeek")
    .select("id, topic, description, createdAt, POTWProblem(count)")
    .eq("published", true)
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch weeks" }, { status: 500 });
  }

  const { data: attempts } = await supabase
    .from("POTWAttempt")
    .select("weekId, score, totalProblems")
    .eq("userId", user.id);

  const attemptByWeek = new Map((attempts ?? []).map((a) => [a.weekId, a]));

  const weeks = (data as WeekRow[]).map((w) => {
    const attempt = attemptByWeek.get(w.id);
    return {
      id: w.id,
      topic: w.topic,
      description: w.description,
      createdAt: w.createdAt,
      problemCount: w.POTWProblem?.[0]?.count ?? 0,
      attempted: !!attempt,
      score: attempt?.score,
      totalProblems: attempt?.totalProblems,
    };
  });

  return NextResponse.json({ weeks });
}
