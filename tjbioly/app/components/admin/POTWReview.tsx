"use client";
import { useEffect, useState } from "react";
import { POTWAttemptAdmin, POTWWeekAdmin, UserType } from "./types";

function formatTime(ms: number) {
  if (!ms) return "—";
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function flagged(attempt: POTWAttemptAdmin) {
  return attempt.violationCount >= 2 || attempt.awayMs >= 30000 || attempt.copyCount > 0 || attempt.pasteCount > 0;
}

export default function POTWReview({ week, onCreatorChange }: {
  week: POTWWeekAdmin;
  onCreatorChange: (createdById: number | null) => void;
}) {
  const [attempts, setAttempts] = useState<POTWAttemptAdmin[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/potw/admin/weeks/${week.id}/attempts`).then(r => r.json().then(data => ({ ok: r.ok, data }))),
      fetch("/api/admin/users").then(r => r.json().then(data => ({ ok: r.ok, data }))),
    ]).then(([attemptResult, userResult]) => {
      if (!attemptResult.ok || !userResult.ok) setError(attemptResult.data.error || userResult.data.error || "Failed to load review");
      else { setAttempts(attemptResult.data.attempts); setUsers(userResult.data.users); }
    }).catch(() => setError("Failed to load review"))
      .finally(() => setLoading(false));
  }, [week.id]);

  const setBan = async (userId: number, banned: boolean) => {
    setError("");
    const res = await fetch("/api/potw/admin/leaderboard", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, banned }),
    });
    if (!res.ok) { setError((await res.json()).error); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, leaderboardBanned: banned } : u));
    setAttempts(prev => prev.map(a => a.userId === userId ? { ...a, leaderboardBanned: banned } : a));
  };

  const setCreator = async (createdById: number | null) => {
    setError("");
    const res = await fetch(`/api/potw/admin/weeks/${week.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ createdById }),
    });
    if (!res.ok) { setError((await res.json()).error); return; }
    onCreatorChange(createdById);
  };

  const matches = search.trim() ? users.filter(u => `${u.name || ""} ${u.username || ""} ${u.email || ""}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 10) : [];
  const creator = users.find(u => u.id === week.createdById);

  if (loading) return <p className="text-sm text-neutral-500">Loading activity…</p>;
  if (error && !users.length) return <p className="text-sm text-red-600">{error}</p>;
  return <div className="space-y-5">
    <div>
      <h3 className="font-semibold text-neutral-900">Review activity · {week.topic}</h3>
      <p className="mt-1 text-xs text-neutral-500">Red flags: 2+ tab switches, 30+ seconds away, or any copy/paste. make sure kids dont cheat :) </p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead><tr className="border-b text-xs text-neutral-500">
          <th className="py-2 pr-3">Member</th><th className="pr-3">Score</th><th className="pr-3">Time taken</th>
          <th className="pr-3">Tab switches</th><th className="pr-3">Time away</th><th className="pr-3">Copy / paste</th><th>Leaderboard</th>
        </tr></thead>
        <tbody>{attempts.map(a => <tr key={a.id} className={`border-b border-neutral-100 ${flagged(a) ? "text-red-600 font-medium" : "text-neutral-700"}`}>
          <td className="py-2 pr-3">{a.name || a.username || `User ${a.userId}`}</td>
          <td className="pr-3">{a.score}/{a.totalProblems}</td>
          <td className="pr-3">{formatTime(a.durationMs)}</td>
          <td className="pr-3">{a.violationCount}</td>
          <td className="pr-3">{formatTime(a.awayMs)}</td>
          <td className="pr-3">{a.copyCount} / {a.pasteCount}</td>
          <td><button type="button" onClick={() => setBan(a.userId, !a.leaderboardBanned)} className="underline underline-offset-2">{a.leaderboardBanned ? "Unbar" : "Bar"}</button></td>
        </tr>)}</tbody>
      </table>
      {!attempts.length && <p className="py-4 text-sm text-neutral-500">No attempts yet.</p>}
    </div>
    <div className="border-t border-neutral-200 pt-4">
      <p className="text-sm">Week creator: <strong>{creator?.name || creator?.username || "Not assigned"}</strong>{week.createdById !== null && <button type="button" onClick={() => setCreator(null)} className="ml-3 text-xs underline">Clear</button>}</p>
      <label className="mt-3 block text-xs text-neutral-500" htmlFor={`potw-user-${week.id}`}>Find a member by name, username, or email</label>
      <input id={`potw-user-${week.id}`} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members" className="mt-1 w-full max-w-md border border-neutral-300 px-3 py-2 text-sm" />
      {matches.length > 0 && <div className="mt-2 max-w-xl divide-y divide-neutral-100 border border-neutral-200">{matches.map(u => <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 p-2 text-sm">
        <span>{u.name || u.username || `User ${u.id}`} <span className="text-neutral-400">{u.username}</span></span>
        <span className="flex gap-3"><button type="button" onClick={() => setCreator(u.id)} className="text-sage underline">Set creator</button><button type="button" onClick={() => setBan(u.id, !u.leaderboardBanned)} className="text-red-600 underline">{u.leaderboardBanned ? "Unbar" : "Bar"}</button></span>
      </div>)}</div>}
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>;
}
