"use client";
import { useState, useEffect, useCallback, Fragment } from "react";
import { Eye, EyeOff, Trash2, Pencil, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { POTWWeekAdmin, POTWProblemAdmin, POTWAttemptAdmin } from "./types";

function emptyProblem(): POTWProblemAdmin {
  return { prompt: "", choices: ["", ""], correctIndex: 0 };
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtAway(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function POTWTab() {
  const [weeks, setWeeks] = useState<POTWWeekAdmin[]>([]);
  const [err, setErr] = useState("");

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [problems, setProblems] = useState<POTWProblemAdmin[]>([emptyProblem()]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<Record<number, POTWAttemptAdmin[]>>({});

  const fetchWeeks = useCallback(async () => {
    try {
      const res = await fetch("/api/potw/admin/weeks");
      if (res.ok) setWeeks((await res.json()).weeks);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  const resetForm = () => {
    setEditingId(null);
    setTopic("");
    setDescription("");
    setPublished(false);
    setProblems([emptyProblem()]);
    setErr("");
  };

  const loadForEdit = async (id: number) => {
    setErr("");
    const res = await fetch(`/api/potw/admin/weeks/${id}`);
    if (!res.ok) {
      setErr("Failed to load week");
      return;
    }
    const data = await res.json();
    setEditingId(id);
    setTopic(data.week.topic);
    setDescription(data.week.description ?? "");
    setPublished(data.week.published);
    setProblems(
      data.problems.length
        ? data.problems.map((p: POTWProblemAdmin) => ({
            prompt: p.prompt,
            choices: p.choices,
            correctIndex: p.correctIndex,
          }))
        : [emptyProblem()]
    );
  };

  const updateProblem = (i: number, updates: Partial<POTWProblemAdmin>) => {
    setProblems((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...updates } : p)));
  };

  const updateChoice = (pIdx: number, cIdx: number, value: string) => {
    setProblems((prev) =>
      prev.map((p, idx) => (idx === pIdx ? { ...p, choices: p.choices.map((c, j) => (j === cIdx ? value : c)) } : p))
    );
  };

  const addChoice = (pIdx: number) => {
    setProblems((prev) => prev.map((p, idx) => (idx === pIdx ? { ...p, choices: [...p.choices, ""] } : p)));
  };

  const removeChoice = (pIdx: number, cIdx: number) => {
    setProblems((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIdx || p.choices.length <= 2) return p;
        const choices = p.choices.filter((_, j) => j !== cIdx);
        const correctIndex = p.correctIndex >= choices.length ? 0 : p.correctIndex === cIdx ? 0 : p.correctIndex;
        return { ...p, choices, correctIndex };
      })
    );
  };

  const addProblem = () => setProblems((prev) => [...prev, emptyProblem()]);
  const removeProblem = (i: number) => setProblems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!topic.trim()) {
      setErr("Topic is required");
      return;
    }
    for (const p of problems) {
      if (!p.prompt.trim()) {
        setErr("Every problem needs a prompt");
        return;
      }
      if (p.choices.some((c) => !c.trim())) {
        setErr("Every choice needs text");
        return;
      }
    }

    const body = { topic: topic.trim(), description: description.trim() || null, published, problems };
    const res = await fetch(editingId ? `/api/potw/admin/weeks/${editingId}` : "/api/potw/admin/weeks", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Failed to save week");
      return;
    }
    resetForm();
    fetchWeeks();
  };

  const togglePublished = async (week: POTWWeekAdmin) => {
    setWeeks((prev) => prev.map((w) => (w.id === week.id ? { ...w, published: !w.published } : w)));
    await fetch(`/api/potw/admin/weeks/${week.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !week.published }),
    });
  };

  const deleteWeek = async (id: number) => {
    await fetch(`/api/potw/admin/weeks/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    fetchWeeks();
  };

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!attempts[id]) {
      const res = await fetch(`/api/potw/admin/weeks/${id}/attempts`);
      if (res.ok) {
        const data = await res.json();
        setAttempts((prev) => ({ ...prev, [id]: data.attempts }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-neutral-200 p-4">
        <h2 className="text-sm font-medium text-neutral-900 mb-3">{editingId ? "Edit Week" : "Create Week"}</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-neutral-500 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Cell respiration"
                className="w-full border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-600 pb-1.5">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Published
            </label>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Other info</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Notes, context, links…"
              className="w-full border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>

          <div className="space-y-4">
            {problems.map((p, pIdx) => (
              <div key={pIdx} className="border border-neutral-200 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={p.prompt}
                    onChange={(e) => updateProblem(pIdx, { prompt: e.target.value })}
                    placeholder={`Problem ${pIdx + 1} prompt`}
                    className="flex-1 border border-neutral-300 px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeProblem(pIdx)}
                    className="p-1.5 text-neutral-400 hover:text-red-500"
                    aria-label="Remove problem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1.5 pl-2">
                  {p.choices.map((c, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${pIdx}`}
                        checked={p.correctIndex === cIdx}
                        onChange={() => updateProblem(pIdx, { correctIndex: cIdx })}
                      />
                      <input
                        type="text"
                        value={c}
                        onChange={(e) => updateChoice(pIdx, cIdx, e.target.value)}
                        placeholder={`Choice ${cIdx + 1}`}
                        className="flex-1 border border-neutral-300 px-2 py-1 text-sm"
                      />
                      {p.choices.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeChoice(pIdx, cIdx)}
                          className="p-1 text-neutral-400 hover:text-red-500"
                          aria-label="Remove choice"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addChoice(pIdx)}
                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-sage"
                  >
                    <Plus className="w-3 h-3" /> Add choice
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addProblem}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-neutral-300 text-neutral-600 hover:border-sage"
            >
              <Plus className="w-3 h-3" /> Add problem
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="px-3 py-1.5 text-sm font-semibold bg-sage text-neutral-900">
              {editingId ? "Save changes" : "Create"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-neutral-500 hover:text-neutral-900">
                Cancel
              </button>
            )}
          </div>
        </form>
        {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
      </div>

      <div className="border border-neutral-200">
        <div className="p-3 border-b border-neutral-200">
          <h2 className="text-sm font-medium text-neutral-900">Weeks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                <th className="p-3 font-medium">Topic</th>
                <th className="p-3 font-medium">Published</th>
                <th className="p-3 font-medium">Problems</th>
                <th className="p-3 font-medium">Attempts</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <Fragment key={w.id}>
                  <tr className="border-b border-neutral-100">
                    <td className="p-3 text-sm text-neutral-900">
                      {w.topic}
                      <div className="text-xs text-neutral-400">{fmtDate(w.createdAt)}</div>
                    </td>
                    <td className="p-3">
                      <button onClick={() => togglePublished(w)} className="text-neutral-500 hover:text-sage" aria-label="Toggle published">
                        {w.published ? <Eye className="w-4 h-4 text-sage" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3 text-sm text-neutral-600">{w.problemCount}</td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleExpand(w.id)}
                        className="flex items-center gap-1 text-sm text-neutral-600 hover:text-sage"
                      >
                        {expandedId === w.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        {w.attemptCount}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadForEdit(w.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs border border-neutral-300 text-neutral-600 hover:border-sage"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => deleteWeek(w.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs border border-neutral-300 text-red-500 hover:border-red-400"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === w.id && (
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <td colSpan={5} className="p-3">
                        {!attempts[w.id] ? (
                          <p className="text-xs text-neutral-400">Loading…</p>
                        ) : attempts[w.id].length === 0 ? (
                          <p className="text-xs text-neutral-400">No attempts yet.</p>
                        ) : (
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-xs text-neutral-500">
                                <th className="py-1 pr-3 font-medium">Name</th>
                                <th className="py-1 pr-3 font-medium">Score</th>
                                <th className="py-1 pr-3 font-medium">Violations</th>
                                <th className="py-1 pr-3 font-medium">Away time</th>
                                <th className="py-1 pr-3 font-medium">Submitted</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attempts[w.id].map((a) => (
                                <tr key={a.id} className="text-sm">
                                  <td className="py-1 pr-3 text-neutral-900">{a.name || a.username}</td>
                                  <td className="py-1 pr-3 text-neutral-600">
                                    {a.score}/{a.totalProblems}
                                  </td>
                                  <td className="py-1 pr-3 text-neutral-600">{a.violationCount}</td>
                                  <td className="py-1 pr-3 text-neutral-600">{fmtAway(a.awayMs)}</td>
                                  <td className="py-1 pr-3 text-neutral-400">{fmtDate(a.submittedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {weeks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-400 text-sm">
                    No weeks created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
