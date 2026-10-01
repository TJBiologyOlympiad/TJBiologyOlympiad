"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import AnnouncementBody from "./AnnouncementBody";

type Announcement = { id: number; title: string; body: string };

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [openedId, setOpenedId] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/announcements").then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setItems(data.announcements); }).catch(() => {});
  }, []);
  if (!items.length) return null;
  return <section aria-label="Announcements" className="space-y-4">
    <h2 className="text-xl font-semibold tracking-tight inline-block border-b-2 border-sage pb-1">Announcements</h2>
    {items.map(item => <article key={item.id} className="border border-neutral-200 bg-white p-4 sm:p-5">
      <button type="button" onClick={() => setOpenedId(openedId === item.id ? null : item.id)} aria-expanded={openedId === item.id} className="flex w-full items-start justify-between gap-3 text-left">
        <span><span className="block font-semibold text-neutral-900">{item.title}</span>
          {openedId !== item.id && <span className="mt-1 block line-clamp-1 text-sm text-neutral-500">{item.body.replace(/^## .*/gm, "").trim().split("\n")[0]}</span>}
        </span>
        <ChevronDown className={`mt-0.5 h-5 w-5 shrink-0 text-sage transition-transform ${openedId === item.id ? "rotate-180" : ""}`} />
      </button>
      {openedId === item.id && <div className="mt-5 border-t border-neutral-100 pt-4"><AnnouncementBody body={item.body} /></div>}
    </article>)}
  </section>;
}
