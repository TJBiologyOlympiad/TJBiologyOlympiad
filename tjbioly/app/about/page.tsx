"use client";
import { useState, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { OFFICERS } from "@/lib/officers";

type Overlay = { pfpUrl: string | null; bio: string | null };

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Photo({ name, pfpUrl }: { name: string; pfpUrl?: string | null }) {
  if (pfpUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={pfpUrl} alt={name} className="w-50 h-50 shrink-0 object-cover bg-neutral-200" />;
  }
  return (
    <div className="w-50 h-50 shrink-0 bg-neutral-200 flex items-center justify-center text-5xl font-semibold text-neutral-500 select-none">
      {initials(name)}
    </div>
  );
}

function PositionBar({ name, position }: { name: string; position: string }) {
  return (
    <div className="w-50 bg-sage text-neutral-900 text-center py-2.5 px-2">
      <p className="text-lg">{name}</p>
      <p>{position}</p>
    </div>
  );
}

export default function AboutPage() {
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const [overlay, setOverlay] = useState<Record<string, Overlay>>({});

  useEffect(() => {
    fetch("/api/public/officers")
      .then((r) => (r.ok ? r.json() : { officers: {} }))
      .then((d) => setOverlay(d.officers || {}))
      .catch(() => setOverlay({}));
  }, []);

  const toggle = (i: number) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
          About
        </h1>
        <p className="mt-4">
          We are a club at Thomas Jefferson High School that prepares students
          for competitive biology competitions. We help administer several
          competitions, including the British Biology Olympiad, University of
          Toronto National Biology Competition, and notably the USA Biology
          Olympiad.
        </p>
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight inline-block border-b-2 border-sage pb-1 text-neutral-900">
            Officers
          </h2>

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {OFFICERS.map((o, i) => {
              const isOpen = openIds.has(i);
              const Icon = isOpen ? Minimize2 : Maximize2;
              const data = overlay[o.name];
              const bio =
                data?.bio ||
                `${o.name} serves as ${o.position} for TJ Biology Olympiad. A short bio is coming soon.`;

              if (isOpen) {
                return (
                  <div
                    key={o.name}
                    role="button"
                    tabIndex={0}
                    aria-expanded
                    aria-label={`Collapse ${o.name}`}
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(i);
                      }
                    }}
                    className="basis-full relative flex flex-col sm:flex-row gap-6 rounded-xl border border-neutral-200 shadow-sm bg-white overflow-hidden cursor-pointer"
                  >
                    <Icon className="absolute top-3 right-3 w-4 h-4 text-neutral-500 pointer-events-none" />
                    <div className="shrink-0 mx-auto sm:mx-0">
                      <Photo name={o.name} pfpUrl={data?.pfpUrl} />
                      <PositionBar name={o.name} position={o.position} />
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="text-2xl font-semibold text-neutral-900">{o.name}</h3>
                      <p className="text-sm font-medium text-neutral-600">{o.position}</p>
                      <p className="mt-4 text-neutral-700 leading-relaxed">{bio}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={o.name}
                  role="button"
                  tabIndex={0}
                  aria-expanded={false}
                  aria-label={`Expand ${o.name}`}
                  onClick={() => toggle(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(i);
                    }
                  }}
                  className="w-50 relative rounded-xl border border-neutral-200 shadow-sm bg-white overflow-hidden cursor-pointer"
                >
                  <Icon className="absolute top-2 right-2 w-4 h-4 text-neutral-500 pointer-events-none" />
                  <Photo name={o.name} pfpUrl={data?.pfpUrl} />
                  <PositionBar name={o.name} position={o.position} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
