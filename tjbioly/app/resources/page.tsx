"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";

const FALLBACK_DRIVE_URL = "https://drive.google.com/drive/folders/1FBV6o4AaeDYvkBAX48-Duq5zFJYkbPiV?usp=sharing";

const TEXTBOOKS = [
  {
    title: "Campbell Biology, 12th Edition",
    cover: "https://covers.openlibrary.org/b/isbn/9780135188743-L.jpg",
    url: "https://www.dropbox.com/scl/fi/9qa8sut959360a34yz30h/Campbell-Biology-12e.pdf?rlkey=f9kvei0oo9cy31s0m41ohpvc2&st=03fe5ipm&dl=0",
  },
  {
    title: "Vander's Human Physiology",
    cover: "https://covers.openlibrary.org/b/isbn/9781260085228-L.jpg",
    url: "https://www.dropbox.com/scl/fi/mcx34rh31r1y95sy94i80/Widmaier-Vanders-Human-Physiology-McGraw-Hill-Education-Medical-2018.pdf?rlkey=g1khbsyanh3vuys22ruiq3mk6&st=weifry1a&dl=0",
  },
  {
    title: "Raven Biology of Plants",
    cover: "https://covers.openlibrary.org/b/isbn/9781429219617-L.jpg",
    url: "https://www.dropbox.com/scl/fi/6d8ascwdkadw9zlow60qe/Ray-F.-Evert-Susan-E.-Eichhorn-Raven-Biology-of-Plants-W.-H.-Freeman-2012.pdf?rlkey=3ux5egfzxo2meon043iotawl2&st=80m3atrw&dl=0",
  },
  {
    title: "Lehninger Principles of Biochemistry",
    cover: "https://covers.openlibrary.org/b/isbn/9781464126116-L.jpg",
    url: "https://www.dropbox.com/scl/fi/lt4jdil576n8ivf7cqx09/Principles-of-Biochemistry-7th-Edition-David-L.-Nelson-Michael-M.-Cox-Lehninger-Principles-of-Biochemistry-1.pdf?rlkey=fuhvx2z01tof6plg75pv4d7bx&st=h5j8rdfi&dl=0",
  },
];

const PAST_CONTESTS = [
  { label: "2022 Winter Contest", href: "https://docs.google.com/document/d/1kVVEGMj9cMirDBPQAI80R1A3yPVDWeaqwZbj9l2b2NM/edit?usp=sharing" },
  { label: "2023 Winter Contest", href: "https://docs.google.com/document/d/1WhZyU7uvX8VC3asmq78bahzYVXppTPVX2JRfUb_DRmA/edit?usp=sharing" },
  { label: "2024 Winter Contest", href: "https://docs.google.com/document/d/15PNnz-XFws0BDAFJLSPcH9V2QqvzPt78KOhV-tNntmA/edit?usp=sharing" },
  { label: "2024 Mock Exam", href: "https://drive.google.com/file/d/1zKiiVQAV-za1pdKduxPLN7ZOAVbeelxW/view?usp=drive_link" },
];

export default function ResourcesPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();

  const [driveUrl, setDriveUrl] = useState(FALLBACK_DRIVE_URL);
  const [editing, setEditing] = useState(false);
  const [draftUrl, setDraftUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const isOfficer = !!user && user.roles.includes("officer");

  useEffect(() => {
    if (!loading && !authenticated) router.push("/");
  }, [loading, authenticated, router]);

  const fetchDriveUrl = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/resources-drive");
      if (res.ok) {
        const data = await res.json();
        if (data.url) setDriveUrl(data.url);
      }
    } catch {
      /* keep fallback */
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchDriveUrl();
  }, [authenticated, fetchDriveUrl]);

  const saveDriveUrl = async () => {
    if (!draftUrl.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings/resources-drive", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: draftUrl.trim() }),
      });
      if (res.ok) {
        setDriveUrl(draftUrl.trim());
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !authenticated) {
    return <div className="pt-28 text-center text-neutral-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Resources</h1>
        <p className="mt-3 text-neutral-600">Study materials, past exams, and club documents.</p>

        <div className="mt-6 flex items-center gap-3">
          {editing ? (
            <>
              <input
                type="text"
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                placeholder="https://drive.google.com/…"
                className="flex-1 border border-neutral-300 px-2 py-1.5 text-sm"
              />
              <button onClick={saveDriveUrl} disabled={saving} className="text-sm text-sage font-semibold">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="text-sm text-neutral-500">
                Cancel
              </button>
            </>
          ) : (
            <>
              <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sage hover:underline">
                Open Drive folder
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {isOfficer && (
                <button
                  onClick={() => {
                    setDraftUrl(driveUrl);
                    setEditing(true);
                  }}
                  className="text-neutral-300 hover:text-sage"
                  aria-label="Edit drive link"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>

        <Link href="/usabo" className="mt-3 inline-flex items-center gap-1.5 text-sage hover:underline">
          USABO page
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <h2 className="text-sm font-medium text-neutral-900 mt-16 mb-4">Textbooks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {TEXTBOOKS.map((book) => (
            <a key={book.title} href={book.url} target="_blank" rel="noopener noreferrer" className="group">
              <img src={book.cover} alt={book.title} className="w-full aspect-[2/3] object-cover" />
              <p className="mt-2 text-sm text-neutral-700 group-hover:text-sage transition-colors">{book.title}</p>
            </a>
          ))}
        </div>

        <h2 className="text-sm font-medium text-neutral-900 mt-16 mb-2">Past Contests</h2>
        <div className="divide-y divide-neutral-100">
          {PAST_CONTESTS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 text-neutral-900 hover:text-sage transition-colors group"
            >
              {c.label}
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-sage" />
            </a>
          ))}
          <Link href="/potw" className="flex items-center justify-between py-3 text-neutral-900 hover:text-sage transition-colors">
            Problem of the Week
            <span className="text-xs text-neutral-400">TBA</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
