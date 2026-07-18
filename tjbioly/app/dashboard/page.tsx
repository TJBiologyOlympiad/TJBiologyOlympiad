"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Loader2, Download, Trash2 } from "lucide-react";

type AttendanceBlock = {
  id: number;
  blockType: string;
  date: string;
  code: string;
  isClosed: boolean;
  submitted: boolean;
};

type ManagedBlock = {
  id: number;
  blockType: string;
  date: string;
  code: string;
  isClosed: boolean;
  _count?: { records: number };
};

const BLOCK_TYPES = ["8A", "8B"];

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const [blocks, setBlocks] = useState<AttendanceBlock[]>([]);
  const [managed, setManaged] = useState<ManagedBlock[]>([]);
  const [codeInputs, setCodeInputs] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, { ok: boolean; msg: string }>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const [newBlock, setNewBlock] = useState({
    blockType: "8B",
    date: new Date().toISOString().split("T")[0],
    code: "",
  });
  const [blockErr, setBlockErr] = useState("");

  const isStaff = !!user && (user.roles.includes("officer") || user.roles.includes("sponsor"));

  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance/today");
      if (res.ok) setBlocks((await res.json()).blocks);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchManaged = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance/blocks");
      if (res.ok) setManaged((await res.json()).blocks);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!authenticated || !user) {
        router.push("/");
      } else {
        fetchBlocks();
      }
    }
  }, [loading, authenticated, user, router, fetchBlocks]);

  useEffect(() => {
    if (isStaff) fetchManaged();
  }, [isStaff, fetchManaged]);

  const handleSubmit = async (blockId: number) => {
    const code = codeInputs[blockId];
    if (!code) return;
    setSubmitting(blockId);
    try {
      const res = await fetch("/api/attendance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults((p) => ({ ...p, [blockId]: { ok: true, msg: "Marked present!" } }));
        setBlocks((p) => p.map((b) => (b.id === blockId ? { ...b, submitted: true } : b)));
      } else {
        setResults((p) => ({ ...p, [blockId]: { ok: false, msg: data.error || "Failed" } }));
      }
    } catch {
      setResults((p) => ({ ...p, [blockId]: { ok: false, msg: "Failed" } }));
    } finally {
      setSubmitting(null);
    }
  };

  const createBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockErr("");
    if (!newBlock.code.trim()) {
      setBlockErr("Code is required");
      return;
    }
    const res = await fetch("/api/attendance/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlock),
    });
    if (res.ok) {
      setNewBlock((p) => ({ ...p, code: "" }));
      fetchManaged();
      fetchBlocks();
    } else {
      setBlockErr("Failed to create block");
    }
  };

  const closeBlock = async (id: number, isClosed: boolean) => {
    await fetch("/api/attendance/blocks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isClosed: !isClosed }),
    });
    fetchManaged();
  };

  const deleteBlock = async (id: number) => {
    if (!confirm("Delete this block?")) return;
    await fetch(`/api/attendance/blocks?id=${id}`, { method: "DELETE" });
    fetchManaged();
    fetchBlocks();
  };

  const exportCSV = (id?: number) => {
    window.open(id ? `/api/attendance/export?blockId=${id}` : "/api/attendance/export", "_blank");
  };

  if (loading || !user) {
    return <div className="pt-28 text-center text-neutral-500">Loading…</div>;
  }

  const openForMe = blocks.filter((b) => !b.submitted);
  const submittedBlocks = blocks.filter((b) => b.submitted);

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Roles: {user.roles.join(", ") || "user"}</p>

        {/* Mark attendance */}
        <section className="mt-10 border border-neutral-200">
          <div className="px-4 py-3 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">Attendance</h2>
          </div>
          <div className="p-4 space-y-3">
            {openForMe.length === 0 && submittedBlocks.length === 0 && (
              <p className="text-sm text-neutral-500">No attendance blocks open right now.</p>
            )}
            {openForMe.map((b) => (
              <div key={b.id} className="border border-neutral-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">
                    {b.blockType} · {fmtDate(b.date)}
                  </span>
                  {b.isClosed && <span className="text-xs text-neutral-500">Closed</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInputs[b.id] || ""}
                    onChange={(e) => setCodeInputs((p) => ({ ...p, [b.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(b.id)}
                    placeholder="Enter code"
                    className="flex-1 border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-sage"
                  />
                  <button
                    onClick={() => handleSubmit(b.id)}
                    disabled={submitting === b.id}
                    className="px-4 py-1.5 text-sm font-semibold bg-sage text-neutral-900 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                  </button>
                </div>
                {results[b.id] && (
                  <p className={`text-sm mt-1.5 ${results[b.id].ok ? "text-sage" : "text-red-500"}`}>
                    {results[b.id].msg}
                  </p>
                )}
              </div>
            ))}
            {submittedBlocks.map((b) => (
              <div key={b.id} className="border border-neutral-200 p-3 flex items-center justify-between">
                <span className="text-sm text-neutral-700">
                  {b.blockType} · {fmtDate(b.date)}
                </span>
                <span className="text-sm text-sage font-medium">Marked present ✓</span>
              </div>
            ))}
          </div>
        </section>

        {/* Staff: manage blocks */}
        {isStaff && (
          <section className="mt-8 border border-neutral-200">
            <div className="px-4 py-3 border-b border-neutral-200">
              <h2 className="font-semibold text-neutral-900">Manage Blocks</h2>
            </div>
            <div className="p-4 space-y-4">
              <form onSubmit={createBlock} className="flex flex-wrap gap-2 items-end">
                <select
                  value={newBlock.blockType}
                  onChange={(e) => setNewBlock((p) => ({ ...p, blockType: e.target.value }))}
                  className="border border-neutral-300 px-2 py-1.5 text-sm"
                >
                  {BLOCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newBlock.date}
                  onChange={(e) => setNewBlock((p) => ({ ...p, date: e.target.value }))}
                  className="border border-neutral-300 px-2 py-1.5 text-sm"
                />
                <input
                  type="text"
                  value={newBlock.code}
                  onChange={(e) => setNewBlock((p) => ({ ...p, code: e.target.value }))}
                  placeholder="Code"
                  className="border border-neutral-300 px-2 py-1.5 text-sm"
                />
                <button className="px-3 py-1.5 text-sm font-semibold bg-sage text-neutral-900">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => exportCSV()}
                  className="px-3 py-1.5 text-sm border border-neutral-300 text-neutral-700 hover:border-sage flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Export all
                </button>
              </form>
              {blockErr && <p className="text-red-500 text-sm">{blockErr}</p>}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                      <th className="py-2 pr-3">Block</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Code</th>
                      <th className="py-2 pr-3">Present</th>
                      <th className="py-2 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managed.map((b) => (
                      <tr key={b.id} className="border-b border-neutral-100">
                        <td className="py-2 pr-3">{b.blockType}</td>
                        <td className="py-2 pr-3 text-neutral-500">{fmtDate(b.date)}</td>
                        <td className="py-2 pr-3 font-mono text-neutral-600">{b.code}</td>
                        <td className="py-2 pr-3">{b._count?.records ?? 0}</td>
                        <td className="py-2 pr-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => closeBlock(b.id, b.isClosed)}
                              className="text-xs border border-neutral-300 px-2 py-0.5 hover:border-sage"
                            >
                              {b.isClosed ? "Reopen" : "Close"}
                            </button>
                            <button
                              onClick={() => exportCSV(b.id)}
                              className="text-xs border border-neutral-300 px-2 py-0.5 hover:border-sage flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> CSV
                            </button>
                            <button
                              onClick={() => deleteBlock(b.id)}
                              className="text-xs border border-neutral-300 px-2 py-0.5 text-red-500 hover:border-red-400 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {managed.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-neutral-400">
                          No blocks yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
