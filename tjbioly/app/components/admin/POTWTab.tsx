"use client";
import { useState, useEffect, useCallback, Fragment } from "react";
import { Eye, EyeOff, Trash2, Pencil, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { POTWWeekAdmin, POTWProblemAdmin } from "./types";
import POTWReview from "./POTWReview";

function emptyProblem(): POTWProblemAdmin {
  return { prompt: "", choices: ["", ""], correctIndex: 0 };
}

type Draft = { id: number; topic: string; description: string | null; problems: POTWProblemAdmin[]; updatedAt: string };

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function POTWTab() {
  const [weeks, setWeeks] = useState<POTWWeekAdmin[]>([]);
  const [err, setErr] = useState("");

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [problems, setProblems] = useState<POTWProblemAdmin[]>([emptyProblem()]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftId, setDraftId] = useState<number | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const saved = Number(sessionStorage.getItem("potw-review-week"));
    if (Number.isInteger(saved) && saved > 0) queueMicrotask(() => setExpandedId(saved));
  }, []);

  const fetchWeeks = useCallback(async () => {
    try {
      const res = await fetch("/api/potw/admin/weeks");
      if (res.ok) setWeeks((await res.json()).weeks);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => { void fetchWeeks(); });
  }, [fetchWeeks]);

  const fetchDrafts = useCallback(async () => {
    const res = await fetch("/api/potw/admin/drafts");
    if (res.ok) setDrafts((await res.json()).drafts);
    else setErr((await res.json()).error);
  }, []);
  useEffect(() => {
    fetch("/api/potw/admin/drafts").then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => { if (ok) setDrafts(data.drafts); else setErr(data.error); })
      .catch(() => setErr("Failed to load drafts"));
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setDraftId(null);
    setTopic("");
    setDescription("");
    setPublished(false);
    setProblems([emptyProblem()]);
    setErr("");
  };

  const loadForEdit = useCallback(async (id: number) => {
    setErr("");
    const res = await fetch(`/api/potw/admin/weeks/${id}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Failed to load week");
      return;
    }
    const data = await res.json();
    setEditingId(id);
    setDraftId(null);
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
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const weekId = Number(query.get("weekId"));
    if (!Number.isInteger(weekId) || weekId <= 0) return;
    if (query.get("mode") === "edit") queueMicrotask(() => { void loadForEdit(weekId); });
    if (query.get("mode") === "review") {
      sessionStorage.setItem("potw-review-week", String(weekId));
      queueMicrotask(() => setExpandedId(weekId));
    }
  }, [loadForEdit]);

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

  const loadDraft = (id: number) => {
    const draft = drafts.find(d => d.id === id);
    if (!draft) return;
    setEditingId(null);
    setDraftId(id);
    setTopic(draft.topic);
    setDescription(draft.description || "");
    setPublished(false);
    setProblems(draft.problems.length ? draft.problems : [emptyProblem()]);
    setErr("");
  };

  const saveDraft = async () => {
    setErr("");
    const res = await fetch("/api/potw/admin/drafts", {
      method: draftId === null ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draftId, topic, description, problems }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error); return; }
    setDraftId(data.draft.id);
    await fetchDrafts();
  };

  const deleteDraft = async () => {
    if (draftId === null) return;
    const res = await fetch(`/api/potw/admin/drafts?id=${draftId}`, { method: "DELETE" });
    if (!res.ok) { setErr((await res.json()).error); return; }
    resetForm();
    await fetchDrafts();
  };

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
    if (draftId !== null) {
      await fetch(`/api/potw/admin/drafts?id=${draftId}`, { method: "DELETE" });
      await fetchDrafts();
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
    const next = expandedId === id ? null : id;
    setExpandedId(next);
    if (next === null) sessionStorage.removeItem("potw-review-week");
    else sessionStorage.setItem("potw-review-week", String(next));
  };

  return (
    <div className="space-y-6">
      <div className="border border-neutral-200 p-4">
        <h2 className="text-sm font-medium text-neutral-900 mb-3">{editingId ? "Edit Week" : "Create Week"}</h2>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label htmlFor="potw-drafts" className="text-sm text-neutral-600">Shared drafts</label>
          <select id="potw-drafts" value={draftId ?? ""} onChange={e => e.target.value ? loadDraft(Number(e.target.value)) : resetForm()} className="border border-neutral-300 px-2 py-1.5 text-sm">
            <option value="">New draft</option>
            {drafts.map(d => <option key={d.id} value={d.id}>{d.topic || "Untitled draft"} · {new Date(d.updatedAt).toLocaleString()}</option>)}
          </select>
        </div>
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
            <button type="button" onClick={saveDraft} className="px-3 py-1.5 text-sm border border-neutral-300">Save draft</button>
            {draftId !== null && <button type="button" onClick={deleteDraft} className="text-sm text-red-600">Delete draft</button>}
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
                <th className="p-3 font-medium">Review</th>
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
                        Review activity ({w.attemptCount})
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
                        <POTWReview week={w} onCreatorChange={createdById => setWeeks(prev => prev.map(item => item.id === w.id ? { ...item, createdById } : item))} />
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
