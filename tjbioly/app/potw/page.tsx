"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PotwWeekListItem, PotwRankingRow } from "./types";
import { MoreHorizontal } from "lucide-react";

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
  const [menuWeekId, setMenuWeekId] = useState<number | null>(null);
  const userId = user?.id;
  const isOfficer = !!user?.roles.includes("officer");

  useEffect(() => {
    if (!loading && !authenticated) router.push("/");
  }, [loading, authenticated, router]);

  useEffect(() => {
    if (!authenticated || !userId) return;
    const key = `potw-list:${userId}`;
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const data = JSON.parse(cached);
        queueMicrotask(() => {
          setWeeks(data.weeks || []);
          setRankings(data.rankings || []);
          setFetched(true);
        });
      }
    } catch { /* ignore invalid cache */ }
    Promise.all([fetch("/api/potw/weeks"), fetch("/api/potw/rankings")])
      .then(async ([weeksRes, rankingsRes]) => {
        const freshWeeks = weeksRes.ok ? (await weeksRes.json()).weeks : null;
        const freshRankings = rankingsRes.ok ? (await rankingsRes.json()).rankings : null;
        if (freshWeeks) setWeeks(freshWeeks);
        if (freshRankings) setRankings(freshRankings);
        if (freshWeeks && freshRankings) sessionStorage.setItem(key, JSON.stringify({ weeks: freshWeeks, rankings: freshRankings }));
      }).catch(() => {}).finally(() => setFetched(true));
  }, [authenticated, userId]);

  if (loading || !authenticated) {
    return <div className="pt-28 text-center text-neutral-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Problem of the Week</h1>
        <p className="mt-3 text-neutral-600">Answer each week&apos;s set for instant results, or revisit past weeks anytime.</p>

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
              <div key={w.id} className="flex items-center gap-3 py-4 group">
              <Link href={`/potw/${w.id}`} className="flex flex-1 items-center justify-between min-w-0">
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
              {isOfficer && <div className="relative">
                <button type="button" onClick={() => setMenuWeekId(menuWeekId === w.id ? null : w.id)} aria-label={`Manage ${w.topic}`} aria-haspopup="menu" aria-expanded={menuWeekId === w.id} className="p-2 text-neutral-500 hover:text-neutral-900">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {menuWeekId === w.id && <div role="menu" className="absolute right-0 top-full z-20 w-40 border border-neutral-200 bg-white shadow-sm">
                  <Link role="menuitem" href={`/admin?tab=potw&weekId=${w.id}&mode=edit`} className="block px-3 py-2 text-sm hover:bg-neutral-50">Edit week</Link>
                  <Link role="menuitem" href={`/admin?tab=potw&weekId=${w.id}&mode=review`} className="block px-3 py-2 text-sm hover:bg-neutral-50">Review attempts</Link>
                </div>}
              </div>}
              </div>
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
