import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type SubmittedAnswer = { problemId: number; selectedIndex: number };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const weekId = Number(id);
    const { answers, violationCount, awayMs } = await request.json();

    const { data: week } = await supabase
      .from("POTWWeek")
      .select("id, published")
      .eq("id", weekId)
      .maybeSingle();
    if (!week || !week.published) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from("POTWAttempt")
      .select("id")
      .eq("weekId", weekId)
      .eq("userId", user.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Already attempted" }, { status: 409 });
    }

    // Grade server-side — never trust client-submitted correctness.
    const { data: problems, error: problemsError } = await supabase
      .from("POTWProblem")
      .select("id, prompt, choices, correctIndex, orderIndex")
      .eq("weekId", weekId)
      .order("orderIndex");
    if (problemsError || !problems || problems.length === 0) {
      return NextResponse.json({ error: "No problems found for this week" }, { status: 404 });
    }

    const submitted = new Map(
      (Array.isArray(answers) ? (answers as SubmittedAnswer[]) : []).map((a) => [a.problemId, a.selectedIndex])
    );

    const gradedAnswers = problems.map((p) => {
      const selectedIndex = submitted.has(p.id) ? Number(submitted.get(p.id)) : -1;
      return {
        problemId: p.id,
        selectedIndex,
        correct: selectedIndex === p.correctIndex,
      };
    });

    const score = gradedAnswers.filter((a) => a.correct).length;
    const totalProblems = problems.length;

    const { data: attempt, error: insertError } = await supabase
      .from("POTWAttempt")
      .insert({
        weekId,
        userId: user.id,
        score,
        totalProblems,
        answers: gradedAnswers,
        violationCount: Number.isFinite(violationCount) ? Math.max(0, Math.trunc(violationCount)) : 0,
        awayMs: Number.isFinite(awayMs) ? Math.max(0, Math.trunc(awayMs)) : 0,
      })
      .select()
      .single();
    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      score,
      totalProblems,
      answers: gradedAnswers,
      problems,
      submittedAt: attempt.submittedAt,
    });
  } catch {
    return NextResponse.json({ error: "Failed to submit attempt" }, { status: 500 });
  }
}
