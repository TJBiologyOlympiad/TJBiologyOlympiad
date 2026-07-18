"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { positionFor } from "@/lib/officers";

export default function ProfilePage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState("");
  const [pfpUrl, setPfpUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && (!authenticated || !user)) {
      router.push("/");
    }
    if (user) {
      setBio(user.bio || "");
      setPfpUrl(user.pfpUrl || null);
    }
  }, [loading, authenticated, user, router]);

  if (loading || !user) {
    return <div className="pt-28 text-center text-neutral-500">Loading…</div>;
  }

  const isOfficer = user.roles.includes("officer");
  const position = positionFor(user.name);

  const initials = (user.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveBio = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setPfpUrl(data.pfpUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Profile</h1>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Name</h3>
            <p className="text-lg text-neutral-900">{user.name || "—"}</p>
          </div>
          {user.username && (
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Username</h3>
              <p className="text-neutral-800 font-mono">{user.username}</p>
            </div>
          )}
          <div>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Roles</h3>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((r) => (
                <span key={r} className="px-2.5 py-0.5 text-sm border border-neutral-300 text-neutral-700">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {isOfficer && (
          <section className="mt-12 border-t border-neutral-200 pt-10">
            <h2 className="text-xl font-semibold tracking-tight inline-block border-b-2 border-sage pb-1 text-neutral-900">
              Officer Profile
            </h2>
            <p className="mt-3 text-sm text-neutral-500">
              Your photo and bio appear on the public About page.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-8">
              <div className="shrink-0">
                {pfpUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pfpUrl} alt={user.name || ""} className="w-50 h-50 object-cover bg-neutral-200" />
                ) : (
                  <div className="w-50 h-50 bg-neutral-200 flex items-center justify-center text-5xl font-semibold text-neutral-500">
                    {initials}
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="mt-3 w-50 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-neutral-300 text-neutral-700 hover:border-sage disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading…" : "Upload photo"}
                </button>
              </div>

              <div className="flex-1">
                {position && (
                  <p className="text-sm font-medium text-neutral-600 mb-3">{position}</p>
                )}
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setSaved(false);
                  }}
                  rows={6}
                  placeholder="Write a short bio…"
                  className="w-full border border-neutral-300 p-3 text-sm outline-none focus:border-sage resize-y"
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={saveBio}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-semibold bg-sage text-neutral-900 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  {saved && <span className="text-sm text-sage">Saved ✓</span>}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
