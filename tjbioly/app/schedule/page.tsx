"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function SchedulePage() {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading && !authenticated) router.push("/");
  }, [loading, authenticated, router]);

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
            {cells.map((date, i) => {
              if (!date) return <div key={i} className="h-20 border-t border-l border-neutral-100" />;
              const isToday = sameDay(date, today);
              const isSelected = selected && sameDay(date, selected);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(date)}
                  className={`h-20 border-t border-l border-neutral-100 p-2 text-left align-top transition-colors ${
                    isSelected ? "bg-sage/20" : "hover:bg-neutral-50"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-sm ${
                      isToday ? "bg-sage text-neutral-900 font-semibold" : "text-neutral-700"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          {selected
            ? `Selected: ${MONTHS[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}`
            : "Select a day. Events coming soon."}
        </p>
      </div>
    </div>
  );
}
