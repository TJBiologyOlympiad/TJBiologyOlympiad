"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef, use } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { PotwWeekDetail, PotwProblem, PotwAnswer } from "../types";

export default function POTWWeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  const [detail, setDetail] = useState<PotwWeekDetail | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // Silent proctoring: tracked in refs so they never trigger re-renders or
  // any visible feedback to the person taking the attempt.
  const violationCountRef = useRef(0);
  const awayMsRef = useRef(0);
  const awayStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loading && !authenticated) router.push("/");
  }, [loading, authenticated, router]);

  const fetchWeek = useCallback(async () => {
    const res = await fetch(`/api/potw/weeks/${id}`);
    if (res.ok) setDetail(await res.json());
  }, [id]);

  useEffect(() => {
    if (authenticated) fetchWeek();
  }, [authenticated, fetchWeek]);

  useEffect(() => {
    if (!detail || detail.attempted) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (awayStartRef.current === null) {
          awayStartRef.current = Date.now();
          violationCountRef.current += 1;
        }
      } else if (awayStartRef.current !== null) {
        awayMsRef.current += Date.now() - awayStartRef.current;
        awayStartRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [detail]);

  const submit = async () => {
    if (!detail) return;
    setErr("");
    setSubmitting(true);
    if (awayStartRef.current !== null) {
      awayMsRef.current += Date.now() - awayStartRef.current;
      awayStartRef.current = null;
    }
    try {
      const res = await fetch(`/api/potw/weeks/${id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(selected).map(([problemId, selectedIndex]) => ({
            problemId: Number(problemId),
            selectedIndex,
          })),
          violationCount: violationCountRef.current,
          awayMs: awayMsRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Failed to submit");
        return;
      }
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              attempted: true,
              attempt: { score: data.score, totalProblems: data.totalProblems, answers: data.answers, submittedAt: data.submittedAt },
              problems: data.problems,
            }
          : prev
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !authenticated || !detail) {
    return <div className="pt-28 text-center text-neutral-500">Loading…</div>;
  }

  const { week, attempted, attempt, problems } = detail;
  const allAnswered = problems.length > 0 && problems.every((p) => selected[p.id] !== undefined);
  const answerByProblem = new Map((attempt?.answers ?? []).map((a: PotwAnswer) => [a.problemId, a]));

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <Link href="/potw" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-sage">
          <ArrowLeft className="w-3.5 h-3.5" /> Problem of the Week
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mt-4">{week.topic}</h1>
        {week.description && <p className="mt-2 text-neutral-600">{week.description}</p>}

        {attempted && attempt && (
          <p className="mt-6 text-sage font-semibold">
            Score: {attempt.score}/{attempt.totalProblems}
          </p>
        )}

        <div className="mt-8 space-y-8">
          {problems.map((p: PotwProblem, i: number) => {
            const graded = attempted ? answerByProblem.get(p.id) : undefined;
            return (
              <div key={p.id}>
                <p className="text-neutral-900">
                  {i + 1}. {p.prompt}
                </p>
                <div className="mt-3 space-y-1.5">
                  {p.choices.map((choice, cIdx) => {
                    if (attempted) {
                      const isCorrect = cIdx === p.correctIndex;
                      const isSelected = graded?.selectedIndex === cIdx;
                      return (
                        <div
                          key={cIdx}
                          className={`flex items-center gap-2 py-1.5 px-2 ${
                            isCorrect ? "text-sage" : isSelected ? "text-red-500" : "text-neutral-500"
                          }`}
                        >
                          {isCorrect ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : isSelected ? (
                            <X className="w-3.5 h-3.5" />
                          ) : (
                            <span className="w-3.5 h-3.5" />
                          )}
                          {choice}
                        </div>
                      );
                    }
                    const isSelected = selected[p.id] === cIdx;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setSelected((prev) => ({ ...prev, [p.id]: cIdx }))}
                        className={`block w-full text-left py-1.5 px-2 border transition-colors ${
                          isSelected ? "border-sage text-neutral-900" : "border-transparent text-neutral-600 hover:border-neutral-200"
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {!attempted && (
          <div className="mt-8">
            <button
              onClick={submit}
              disabled={!allAnswered || submitting}
              className="px-4 py-2 text-sm font-semibold bg-sage text-neutral-900 disabled:opacity-40"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
            {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
