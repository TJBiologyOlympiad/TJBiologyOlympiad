"use client";
import { useCallback, useEffect, useState } from "react";
import AnnouncementBody from "@/app/components/AnnouncementBody";

type Announcement = { id: number; title: string; body: string; startsAt: string; endsAt: string };

export default function AnnouncementsTab() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const res = await fetch("/api/announcements?manage=1");
    const data = await res.json();
    if (res.ok) setItems(data.announcements);
    else setError(data.error);
  }, []);
  useEffect(() => {
    fetch("/api/announcements?manage=1").then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => { if (ok) setItems(data.announcements); else setError(data.error); })
      .catch(() => setError("Failed to load announcements"));
  }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/announcements", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setTitle(""); setBody(""); setStartsAt(""); setEndsAt("");
    await reload();
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    if (res.ok) await reload();
    else setError((await res.json()).error);
  };

  return <div className="space-y-6">
    <form onSubmit={create} className="border border-neutral-200 p-4 space-y-3">
      <h2 className="font-medium">Create announcement</h2>
      <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full border border-neutral-300 p-2 text-sm" />
      <textarea required value={body} onChange={e => setBody(e.target.value)} placeholder="Message" rows={4} className="w-full border border-neutral-300 p-2 text-sm" />
      <div className="flex flex-wrap gap-3">
        <label className="text-sm">Show from <input required type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="block border border-neutral-300 p-2" /></label>
        <label className="text-sm">Show until <input required type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} className="block border border-neutral-300 p-2" /></label>
      </div>
      <button className="bg-sage px-4 py-2 text-sm font-semibold">Create</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
    <div className="space-y-3">{items.map(item => <div key={item.id} className="border border-neutral-200 p-4">
      <div className="flex justify-between gap-4"><h3 className="font-semibold">{item.title}</h3><button onClick={() => remove(item.id)} className="text-sm text-red-600">Delete</button></div>
      <div className="mt-2"><AnnouncementBody body={item.body} /></div>
      <p className="mt-3 text-xs text-neutral-500">{new Date(item.startsAt).toLocaleString()} – {new Date(item.endsAt).toLocaleString()}</p>
    </div>)}</div>
  </div>;
}
