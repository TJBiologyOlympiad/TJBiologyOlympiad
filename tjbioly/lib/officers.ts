// The canonical officer roster (names + positions). Photos and bios are
// overlaid from the database (set by each officer on their profile), matched
// by name. Used by both the profile editor and the public About page.
export type OfficerEntry = { name: string; position: string };

export const OFFICERS: OfficerEntry[] = [
  { name: "Lauren Zhong", position: "Captain" },
  { name: "Jessy Lin", position: "Captain" },
  { name: "Ariana Choi", position: "Teaching Coordinator" },
  { name: "Yenna Kang", position: "Teaching Coordinator" },
  { name: "Aashika Pesaladinne", position: "Treasurer" },
  { name: "Yanling Lin", position: "Competition Coordinator" },
  { name: "Elijah Feldman", position: "Webmaster" },
];

export function positionFor(name: string | null | undefined): string | null {
  if (!name) return null;
  return OFFICERS.find((o) => o.name.toLowerCase() === name.toLowerCase())?.position ?? null;
}
