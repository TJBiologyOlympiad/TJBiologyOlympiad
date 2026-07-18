import type { ReactNode } from "react";

// Shared marker-style outline wrapper. Children are raw SVG shapes drawn on a
// 0 0 100 100 canvas; color comes from the parent via currentColor.
function Doodle({
  className,
  title,
  children,
}: {
  className?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <span className={`absolute ${className ?? ""}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label={title}
        style={{ filter: "url(#marker-rough)" }}
      >
        {children}
      </svg>
    </span>
  );
}

export default function HeroDoodles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden text-sage"
    >
      {/* Gentle hand-drawn "marker" wobble, referenced by every doodle. */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="marker-rough" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves={2}
              seed={7}
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} />
          </filter>
        </defs>
      </svg>

      {/* Eukaryotic cell — top left */}
      <Doodle title="Cell" className="left-[4%] top-[16%] w-24 rotate-[-6deg] opacity-40 hidden sm:block">
        <circle cx="50" cy="50" r="38" />
        <circle cx="58" cy="45" r="13" />
        <circle cx="61" cy="44" r="3" />
        <ellipse cx="34" cy="65" rx="9" ry="4.5" transform="rotate(-28 34 65)" />
      </Doodle>

      {/* Molecule (benzene ring) — top left-center */}
      <Doodle title="Molecule" className="left-[27%] top-[10%] w-16 rotate-[8deg] opacity-30">
        <path d="M50 14 78 31 78 63 50 80 22 63 22 31Z" />
        <path d="M28 35 44 44 M72 35 56 44 M50 62 50 80 M50 14 50 6 M78 31 86 27 M22 63 14 67" />
      </Doodle>

      {/* DNA double helix — top right */}
      <Doodle title="DNA" className="right-[6%] top-[14%] w-16 rotate-[4deg] opacity-40 hidden sm:block">
        <path d="M40 8 Q80 30 40 52 Q0 74 40 96" />
        <path d="M40 8 Q0 30 40 52 Q80 74 40 96" />
        <path d="M27 17 H53 M20 30 H60 M27 43 H53 M27 61 H53 M20 74 H60 M27 87 H53" />
      </Doodle>

      {/* Microscope — left mid */}
      <Doodle title="Microscope" className="left-[7%] top-[52%] w-20 rotate-[-3deg] opacity-35">
        <path d="M30 86 H70" />
        <path d="M46 86 V46" />
        <path d="M39 63 H67" />
        <path d="M46 46 Q48 28 66 26" />
        <path d="M66 26 74 19" />
        <path d="M62 29 V49" />
      </Doodle>

      {/* Neuron — right mid */}
      <Doodle title="Neuron" className="right-[5%] top-[47%] w-24 rotate-[6deg] opacity-35 hidden sm:block">
        <circle cx="32" cy="52" r="12" />
        <circle cx="32" cy="52" r="3" />
        <path d="M24 44 Q15 37 9 39 M22 60 Q13 64 8 61 M27 41 Q24 32 17 30 M23 51 Q13 50 8 45" />
        <path d="M44 52 H82" />
        <path d="M82 52 90 47 M82 52 90 57 M82 52 91 52" />
      </Doodle>

      {/* Erlenmeyer flask — bottom left */}
      <Doodle title="Flask" className="left-[10%] bottom-[9%] w-16 rotate-[4deg] opacity-40">
        <path d="M42 16 H58" />
        <path d="M45 16 V34 L30 74 A6 6 0 0 0 36 84 H64 A6 6 0 0 0 70 74 L55 34 V16" />
        <path d="M35 66 H65" />
        <circle cx="46" cy="76" r="2.5" />
        <circle cx="57" cy="80" r="2" />
      </Doodle>

      {/* Leaf — bottom center */}
      <Doodle title="Leaf" className="left-[41%] bottom-[6%] w-20 rotate-[-5deg] opacity-30">
        <path d="M22 80 C22 44 54 20 82 18 C80 46 58 80 22 80 Z" />
        <path d="M28 74 74 26" />
        <path d="M40 60 58 44 M46 66 66 44 M34 54 50 38" />
      </Doodle>

      {/* Petri dish — bottom right-center */}
      <Doodle title="Petri dish" className="right-[24%] bottom-[10%] w-20 rotate-[3deg] opacity-30 hidden sm:block">
        <ellipse cx="50" cy="54" rx="38" ry="12" />
        <ellipse cx="50" cy="47" rx="38" ry="12" />
        <circle cx="42" cy="50" r="3" />
        <circle cx="58" cy="52" r="4" />
        <circle cx="51" cy="45" r="2.5" />
      </Doodle>

      {/* Test tube — bottom right */}
      <Doodle title="Test tube" className="right-[6%] bottom-[8%] w-12 rotate-[10deg] opacity-40">
        <path d="M40 12 H60" />
        <path d="M44 12 V66 A6 6 0 0 0 56 66 V12" />
        <path d="M44 50 H56" />
        <circle cx="50" cy="60" r="2" />
      </Doodle>
    </div>
  );
}
