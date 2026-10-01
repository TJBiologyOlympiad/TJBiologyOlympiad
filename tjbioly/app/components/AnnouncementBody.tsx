import type { ReactNode } from "react";

function linkedText(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)]+|mailto:[^)]+)\)|https?:\/\/[^\s]+|mailto:[^\s]+/g;
  let cursor = 0;
  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(line.slice(cursor, index));
    const href = match[2] || match[0];
    const label = match[1] || match[0];
    parts.push(<a key={index} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"} className="text-sage underline underline-offset-2">{label}</a>);
    cursor = index + match[0].length;
  }
  if (cursor < line.length) parts.push(line.slice(cursor));
  return parts;
}

export default function AnnouncementBody({ body }: { body: string }) {
  return <div className="space-y-3 text-sm leading-relaxed text-neutral-700">
    {body.split("\n").map((line, index) => line.startsWith("## ")
      ? <h4 key={index} className="pt-2 font-semibold text-neutral-900">{line.slice(3)}</h4>
      : line.trim()
        ? <p key={index}>{linkedText(line)}</p>
        : null)}
  </div>;
}
