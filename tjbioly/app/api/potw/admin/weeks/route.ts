import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

type WeekRow = {
  id: number;
  topic: string;
  description: string | null;
  published: boolean;
  createdAt: string;
  POTWProblem?: { count: number }[];
  POTWAttempt?: { count: number }[];
};

export async function GET() {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("POTWWeek")
    .select("*, POTWProblem(count), POTWAttempt(count)")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch weeks" }, { status: 500 });
  }

  const weeks = (data as WeekRow[]).map((w) => ({
    id: w.id,
    topic: w.topic,
    description: w.description,
    published: w.published,
    createdAt: w.createdAt,
    problemCount: w.POTWProblem?.[0]?.count ?? 0,
    attemptCount: w.POTWAttempt?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ weeks });
}

type ProblemInput = { prompt: string; choices: string[]; correctIndex: number };

function validateProblems(problems: unknown): problems is ProblemInput[] {
  if (!Array.isArray(problems) || problems.length === 0) return false;
  return problems.every(
    (p) =>
      p &&
      typeof p.prompt === "string" &&
      p.prompt.trim().length > 0 &&
      Array.isArray(p.choices) &&
      p.choices.length >= 2 &&
      p.choices.every((c: unknown) => typeof c === "string" && c.trim().length > 0) &&
      Number.isInteger(p.correctIndex) &&
      p.correctIndex >= 0 &&
      p.correctIndex < p.choices.length
  );
}

export async function POST(request: Request) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { topic, description, published, problems } = await request.json();
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    if (!validateProblems(problems)) {
      return NextResponse.json(
        { error: "Each problem needs a prompt, at least 2 choices, and a valid correct choice" },
        { status: 400 }
      );
    }

    const { data: week, error: weekError } = await supabase
      .from("POTWWeek")
      .insert({ topic: topic.trim(), description: description || null, published: !!published })
      .select()
      .single();
    if (weekError) throw weekError;

    const { data: insertedProblems, error: problemsError } = await supabase
      .from("POTWProblem")
      .insert(
        (problems as ProblemInput[]).map((p, i) => ({
          weekId: week.id,
          prompt: p.prompt.trim(),
          choices: p.choices.map((c) => c.trim()),
          correctIndex: p.correctIndex,
          orderIndex: i,
        }))
      )
      .select();
    if (problemsError) throw problemsError;

    return NextResponse.json({ success: true, week, problems: insertedProblems });
  } catch {
    return NextResponse.json({ error: "Failed to create week" }, { status: 500 });
  }
}
