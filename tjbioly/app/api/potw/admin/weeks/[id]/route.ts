import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { checkOfficerAccess } from "@/lib/auth";

type ProblemInput = { prompt: string; choices: string[]; correctIndex: number; imageUrl?: string | null };

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
      p.correctIndex < p.choices.length &&
      (p.imageUrl == null || typeof p.imageUrl === "string")
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkOfficerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const weekId = Number(id);

  let { data: week, error: weekError } = await supabase
    .from("POTWWeek")
    .select("id, topic, description, published, createdAt, createdById")
    .eq("id", weekId)
    .maybeSingle();
  if (weekError?.code === "42703") {
    const legacy = await supabase.from("POTWWeek")
      .select("id, topic, description, published, createdAt")
      .eq("id", weekId).maybeSingle();
    week = legacy.data ? { ...legacy.data, createdById: null } : null;
    weekError = legacy.error;
  }
  if (weekError) {
    console.error("POTW week edit lookup failed", weekError);
    return NextResponse.json({ error: weekError.code === "42703" ? "Database schema update required; rerun supabase/schema.sql" : "Failed to load week" }, { status: 500 });
  }
  if (!week) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: problems, error: problemsError } = await supabase
    .from("POTWProblem")
    .select("id, prompt, choices, correctIndex, imageUrl, orderIndex")
    .eq("weekId", weekId)
    .order("orderIndex");
  if (problemsError) {
    console.error("POTW problems edit lookup failed", problemsError);
    return NextResponse.json({ error: "Failed to load problems" }, { status: 500 });
  }

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
          imageUrl: p.imageUrl || null,
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
    const payload = await request.json();
    const updates: { published?: boolean; createdById?: number | null } = {};
    if (typeof payload.published === "boolean") updates.published = payload.published;
    if ("createdById" in payload) {
      if (payload.createdById !== null && (!Number.isInteger(payload.createdById) || payload.createdById <= 0)) {
        return NextResponse.json({ error: "Invalid creator" }, { status: 400 });
      }
      updates.createdById = payload.createdById;
    }
    if (!Object.keys(updates).length) return NextResponse.json({ error: "No changes" }, { status: 400 });
    const { data, error } = await supabase
      .from("POTWWeek")
      .update(updates)
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
