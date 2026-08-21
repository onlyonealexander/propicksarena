import Link from "next/link";
import { SPORTS } from "@/lib/otherSports";

const ICONS: Record<string, React.ReactNode> = {
  "circle-dot": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v3M12 18v3M21 12h-3M6 12H3" />
    </svg>
  ),
  basketball: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  ),
  cricket: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="16" r="3" />
      <path d="M11 13L20 4M16.5 5.5l2 2" />
    </svg>
  ),
  hockey: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="2.4" />
      <path d="M20 4l-9 9M20 4c-3 0-5.5.8-7 2.5" />
    </svg>
  ),
  boxing: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12a4 4 0 0 1 8 0v2a3 3 0 0 1-3 3H9" />
      <path d="M9 17v2a2 2 0 0 0 2 2h2" />
    </svg>
  ),
  badminton: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10l9 9M17 21l2-2" />
    </svg>
  ),
  "table-tennis": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="5" />
      <circle cx="17" cy="17" r="1.4" />
      <path d="M12.5 12.5L16 16" />
    </svg>
  ),
  baseball: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M6 7c2 2 2 8 0 10M18 7c-2 2-2 8 0 10" />
    </svg>
  ),
  golf: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21V4l9 3.5L6 11" />
      <ellipse cx="6" cy="21" rx="4" ry="1.2" />
    </svg>
  ),
  chess: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20h6M10 20V16c0-1.2-1-1.3-1-3 0-1.5 1.3-2 1.3-3.5S9 7 9 7a3 3 0 0 1 6 0s-1.3.5-1.3 2.5S15 11 15 12.5c0 1.7-1 1.8-1 3v4.5" />
    </svg>
  ),
};

export function SportTabs({ active }: { active: string }) {
  return (
    <div id="sports" className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {SPORTS.map((s) => {
        const isActive = s.id === active;
        return (
          <Link
            key={s.id}
            href={s.id === "football" ? "/" : `/?sport=${s.id}#sports`}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[12.5px] font-bold whitespace-nowrap ${
              isActive ? "border-accent bg-accent/15 text-accent" : "border-border-subtle text-text-secondary font-semibold"
            }`}
          >
            {ICONS[s.icon]}
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
