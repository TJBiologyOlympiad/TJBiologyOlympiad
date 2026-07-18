"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FolderOpen, ExternalLink } from "lucide-react";

// TODO: replace with the club's public Google Drive folder URL.
const PUBLIC_DRIVE_URL = "https://drive.google.com/";

export default function ResourcesPage() {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) router.push("/");
  }, [loading, authenticated, router]);

  if (loading || !authenticated) {
    return <div className="pt-28 text-center text-neutral-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Resources</h1>
        <p className="mt-3 text-neutral-600">
          Study materials, past exams, and club documents live in our public drive.
        </p>

        <a
          href={PUBLIC_DRIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 border border-neutral-300 px-5 py-4 hover:border-sage transition-colors"
        >
          <FolderOpen className="w-6 h-6 text-sage" />
          <span>
            <span className="block font-semibold text-neutral-900">Public Drive</span>
            <span className="block text-sm text-neutral-500">Open in Google Drive</span>
          </span>
          <ExternalLink className="w-4 h-4 text-neutral-400 ml-2" />
        </a>
      </div>
    </div>
  );
}
