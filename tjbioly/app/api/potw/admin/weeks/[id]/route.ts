import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const weekId = Number(id);

  const { data: week, error: weekError } = await supabase
    .from("POTWWeek")
    .select("id, topic, description, published, createdAt")
    .eq("id", weekId)
    .maybeSingle();
  if (weekError || !week) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: problems } = await supabase
    .from("POTWProblem")
    .select("id, prompt, choices, correctIndex, orderIndex")
    .eq("weekId", weekId)
    .order("orderIndex");

  return NextResponse.json({ week, problems: problems ?? [] });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const weekId = Number(id);
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
      .update({ topic: topic.trim(), description: description || null, published: !!published })
      .eq("id", weekId)
      .select()
      .single();
    if (weekError) throw weekError;

    const { error: deleteError } = await supabase.from("POTWProblem").delete().eq("weekId", weekId);
    if (deleteError) throw deleteError;

    const { data: insertedProblems, error: problemsError } = await supabase
      .from("POTWProblem")
      .insert(
        (problems as ProblemInput[]).map((p, i) => ({
          weekId,
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
    return NextResponse.json({ error: "Failed to update week" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const { published } = await request.json();
    const { data, error } = await supabase
      .from("POTWWeek")
      .update({ published: !!published })
      .eq("id", Number(id))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, week: data });
  } catch {
    return NextResponse.json({ error: "Failed to update week" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const { error } = await supabase.from("POTWWeek").delete().eq("id", Number(id));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete week" }, { status: 500 });
  }
}
