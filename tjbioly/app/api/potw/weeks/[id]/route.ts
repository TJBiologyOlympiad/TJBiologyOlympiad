import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const weekId = Number(id);

  const { data: week } = await supabase
    .from("POTWWeek")
    .select("id, topic, description, createdAt, published")
    .eq("id", weekId)
    .maybeSingle();

  const isOfficer = user.roles.includes("officer");
  if (!week || (!week.published && !isOfficer)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: attempt } = await supabase
    .from("POTWAttempt")
    .select("score, totalProblems, answers, submittedAt")
    .eq("weekId", weekId)
    .eq("userId", user.id)
    .maybeSingle();

  if (attempt) {
    const { data: problems } = await supabase
      .from("POTWProblem")
      .select("id, prompt, choices, correctIndex, orderIndex")
      .eq("weekId", weekId)
      .order("orderIndex");

    return NextResponse.json({
      week: { id: week.id, topic: week.topic, description: week.description, createdAt: week.createdAt },
      attempted: true,
      attempt,
      problems: problems ?? [],
    });
  }

  const { data: problems } = await supabase
    .from("POTWProblem")
    .select("id, prompt, choices, orderIndex")
    .eq("weekId", weekId)
    .order("orderIndex");

  return NextResponse.json({
    week: { id: week.id, topic: week.topic, description: week.description, createdAt: week.createdAt },
    attempted: false,
    problems: problems ?? [],
  });
}
