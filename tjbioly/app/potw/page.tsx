"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PotwWeekListItem, PotwRankingRow } from "./types";

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function POTWPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<"weeks" | "rankings">("weeks");
  const [weeks, setWeeks] = useState<PotwWeekListItem[]>([]);
  const [rankings, setRankings] = useState<PotwRankingRow[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!loading && !authenticated) router.push("/");
  }, [loading, authenticated, router]);

  const fetchAll = useCallback(async () => {
    try {
      const [weeksRes, rankingsRes] = await Promise.all([fetch("/api/potw/weeks"), fetch("/api/potw/rankings")]);
      if (weeksRes.ok) setWeeks((await weeksRes.json()).weeks);
      if (rankingsRes.ok) setRankings((await rankingsRes.json()).rankings);
    } finally {
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchAll();
  }, [authenticated, fetchAll]);

  if (loading || !authenticated) {
    return <div className="pt-28 text-center text-neutral-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Problem of the Week</h1>
        <p className="mt-3 text-neutral-600">Answer each week's set for instant results, or revisit past weeks anytime.</p>

        <div className="flex gap-6 mt-8 text-sm">
          <button
            onClick={() => setView("weeks")}
            className={view === "weeks" ? "text-sage font-semibold" : "text-neutral-500 hover:text-neutral-900"}
          >
            Weeks
          </button>
          <button
            onClick={() => setView("rankings")}
            className={view === "rankings" ? "text-sage font-semibold" : "text-neutral-500 hover:text-neutral-900"}
          >
            Rankings
          </button>
        </div>

        {view === "weeks" && (
          <div className="mt-6 divide-y divide-neutral-100">
            {fetched && weeks.length === 0 && <p className="py-8 text-center text-neutral-400 text-sm">No weeks published yet.</p>}
            {weeks.map((w) => (
              <Link key={w.id} href={`/potw/${w.id}`} className="flex items-center justify-between py-4 group">
                <div>
                  <p className="text-neutral-900 group-hover:text-sage transition-colors">{w.topic}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {fmtDate(w.createdAt)} · {w.problemCount} problem{w.problemCount === 1 ? "" : "s"}
                  </p>
                </div>
                {w.attempted ? (
                  <span className="text-sm text-sage">
                    {w.score}/{w.totalProblems}
                  </span>
                ) : (
                  <span className="text-sm text-neutral-400 group-hover:text-sage">Attempt</span>
                )}
              </Link>
            ))}
          </div>
        )}

        {view === "rankings" && (
          <div className="mt-6 divide-y divide-neutral-100">
            {fetched && rankings.length === 0 && <p className="py-8 text-center text-neutral-400 text-sm">No attempts yet.</p>}
            {rankings.map((r, i) => (
              <div
                key={r.userId}
                className={`flex items-center justify-between py-3 ${r.userId === user?.id ? "text-sage" : "text-neutral-900"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-400 w-5">{i + 1}</span>
                  <span>{r.name || r.username}</span>
                </div>
                <span className="text-sm">
                  {r.totalScore}/{r.totalPossible}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
