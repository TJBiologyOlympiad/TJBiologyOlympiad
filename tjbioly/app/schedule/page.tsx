"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const RECURRENCES = [
  { value: "none", label: "Does not repeat" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

type EventType = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  recurrence: string;
  until: string | null;
  excludedDates: string[];
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function parseDateOnly(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateInput(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function occursOn(event: EventType, date: Date) {
  const start = parseDateOnly(event.date);
  if (date < start) return false;
  if (event.until && date > parseDateOnly(event.until)) return false;
  if (event.excludedDates?.includes(toDateInput(date))) return false;

  const diffDays = Math.round((date.getTime() - start.getTime()) / 86400000);
  switch (event.recurrence) {
    case "weekly":
      return diffDays % 7 === 0;
    case "biweekly":
      return diffDays % 14 === 0;
    case "monthly":
      return (
        date.getDate() === start.getDate() &&
        date.getFullYear() * 12 + date.getMonth() >= start.getFullYear() * 12 + start.getMonth()
      );
    default:
      return diffDays === 0;
  }
}

const recurrenceLabel = (r: string) => RECURRENCES.find((x) => x.value === r)?.label ?? "";

export default function SchedulePage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const isOfficer = !!user && user.roles.includes("officer");

  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [until, setUntil] = useState("");
  const [err, setErr] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !authenticated) router.push("/");
  }, [loading, authenticated, router]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) setEvents((await res.json()).events);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchEvents();
  }, [authenticated, fetchEvents]);

  if (loading || !authenticated) {
    return <div className="pt-28 text-center text-neutral-500">Loading…</div>;
  }

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const selectedEvents = selected ? events.filter((e) => occursOn(e, selected)) : [];

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setRecurrence("none");
    setUntil("");
    setErr("");
  };

  const openAddForm = () => {
    resetForm();
    setDate(selected ? toDateInput(selected) : toDateInput(today));
    setShowForm(true);
  };

  const openEditForm = (e: EventType) => {
    setEditingId(e.id);
    setTitle(e.title);
    setDescription(e.description ?? "");
    setDate(e.date);
    setRecurrence(e.recurrence);
    setUntil(e.until ?? "");
    setErr("");
    setShowForm(true);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErr("");
    if (!title.trim() || !date) {
      setErr("Title and date are required");
      return;
    }
    const res = await fetch(editingId ? `/api/events/${editingId}` : "/api/events", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        date,
        recurrence,
        until: recurrence !== "none" && until ? until : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Failed to save event");
      return;
    }
    resetForm();
    fetchEvents();
  };

  const deleteEvent = async (id: number, occurrence?: string) => {
    const url = occurrence ? `/api/events/${id}?occurrence=${occurrence}` : `/api/events/${id}`;
    await fetch(url, { method: "DELETE" });
    if (editingId === id) resetForm();
    setConfirmDeleteId(null);
    fetchEvents();
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Schedule</h1>

        <div className="mt-8 border border-neutral-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <button
              onClick={() => setView(new Date(year, month - 1, 1))}
              className="p-1.5 text-neutral-600 hover:text-sage"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-neutral-900">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="p-1.5 text-neutral-600 hover:text-sage"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-neutral-200">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2 text-center text-xs font-semibold text-neutral-400">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cellDate, i) => {
              if (!cellDate) return <div key={i} className="h-20 border-t border-l border-neutral-100" />;
              const isToday = sameDay(cellDate, today);
              const isSelected = selected && sameDay(cellDate, selected);
              const hasEvent = events.some((e) => occursOn(e, cellDate));
              return (
                <button
                  key={i}
                  onClick={() => setSelected(cellDate)}
                  className={`h-20 border-t border-l border-neutral-100 p-2 text-left align-top transition-colors ${
                    isSelected ? "bg-sage/20" : "hover:bg-neutral-50"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-sm ${
                      isToday ? "bg-sage text-neutral-900 font-semibold" : "text-neutral-700"
                    }`}
                  >
                    {cellDate.getDate()}
                  </span>
                  {hasEvent && <span className="block w-1 h-1 rounded-full bg-sage mt-1 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          {selected ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  {MONTHS[selected.getMonth()]} {selected.getDate()}, {selected.getFullYear()}
                </p>
                {isOfficer && !showForm && (
                  <button
                    onClick={openAddForm}
                    className="flex items-center gap-1 text-sm text-sage hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add event
                  </button>
                )}
              </div>

              <div className="mt-3 divide-y divide-neutral-100">
                {selectedEvents.map((e) => (
                  <div key={e.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-neutral-900">{e.title}</p>
                        {e.description && <p className="text-sm text-neutral-500 mt-0.5">{e.description}</p>}
                        {e.recurrence !== "none" && (
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {recurrenceLabel(e.recurrence)}
                            {e.until ? ` until ${e.until}` : ""}
                          </p>
                        )}
                      </div>
                      {isOfficer && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => openEditForm(e)} className="text-neutral-400 hover:text-sage" aria-label="Edit event">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              e.recurrence === "none" ? deleteEvent(e.id) : setConfirmDeleteId(confirmDeleteId === e.id ? null : e.id)
                            }
                            className="text-neutral-400 hover:text-red-500"
                            aria-label="Delete event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {confirmDeleteId === e.id && (
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="text-neutral-500">Delete:</span>
                        <button onClick={() => deleteEvent(e.id, toDateInput(selected))} className="text-red-500 hover:underline">
                          This day only
                        </button>
                        <button onClick={() => deleteEvent(e.id)} className="text-red-500 hover:underline">
                          Entire series
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-neutral-400 hover:text-neutral-700">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {selectedEvents.length === 0 && <p className="py-3 text-sm text-neutral-400">No events.</p>}
              </div>

              {showForm && (
                <form onSubmit={submit} className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event title"
                    className="w-full border border-neutral-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details (optional)"
                    className="w-full border border-neutral-300 px-2 py-1.5 text-sm"
                  />
                  <div className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-neutral-300 px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Repeats</label>
                      <select
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value)}
                        className="border border-neutral-300 px-2 py-1.5 text-sm"
                      >
                        {RECURRENCES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {recurrence !== "none" && (
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Ends (optional)</label>
                        <input
                          type="date"
                          value={until}
                          onChange={(e) => setUntil(e.target.value)}
                          className="border border-neutral-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="submit" className="px-3 py-1.5 text-sm font-semibold bg-sage text-neutral-900">
                      {editingId ? "Save changes" : "Add"}
                    </button>
                    <button type="button" onClick={resetForm} className="text-sm text-neutral-500 hover:text-neutral-900">
                      Cancel
                    </button>
                  </div>
                  {err && <p className="text-red-500 text-xs">{err}</p>}
                </form>
              )}
            </>
          ) : (
            <p className="text-sm text-neutral-500">Select a day to see events.</p>
          )}
        </div>
      </div>
    </div>
  );
}
