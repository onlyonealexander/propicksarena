"use client";

import { useMemo, useState } from "react";
import type { AuditEntry } from "@/lib/store";
import { dateTime } from "@/lib/format";

const CATEGORIES = ["All", "Login", "Bets", "Deposits", "Withdrawals", "Account", "Markets", "Settlement", "Permissions", "Security"] as const;

const CATEGORY_STYLE: Record<string, string> = {
  Login: "bg-text-tertiary/15 text-text-secondary",
  Bets: "bg-accent/15 text-accent",
  Deposits: "bg-positive/15 text-positive",
  Withdrawals: "bg-warning/15 text-warning",
  Account: "bg-text-tertiary/15 text-text-secondary",
  Markets: "bg-accent/15 text-accent",
  Settlement: "bg-positive/15 text-positive",
  Permissions: "bg-negative/15 text-negative",
  Security: "bg-negative/15 text-negative",
};

export function AuditClient({ entries }: { entries: AuditEntry[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return entries.filter(
      (e) =>
        (category === "All" || e.category === category) &&
        (!q ||
          e.actor.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          (e.reference ?? "").toLowerCase().includes(q))
    );
  }, [entries, query, category]);

  return (
    <>
      <header className="flex items-center justify-between px-8 py-4 border-b border-border-subtle">
        <div>
          <h1 className="m-0 font-display text-xl font-bold">Audit Log</h1>
          <span className="text-xs text-text-tertiary">Complete, immutable record of platform activity</span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 rounded-lg border border-border bg-surface w-[300px]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actor, action, target, reference…"
            className="flex-1 border-none bg-transparent outline-none text-[13px] py-2.5"
          />
        </div>
      </header>

      <div className="flex flex-col gap-4 px-8 py-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-2 rounded-full border text-xs whitespace-nowrap ${
                category === c ? "border-accent bg-accent/15 text-accent font-bold" : "border-border-subtle text-text-secondary font-semibold"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-col rounded-2xl border border-border-subtle bg-surface overflow-hidden">
          {filtered.map((e) => {
            const open = !!expanded[e.id];
            return (
              <div key={e.id} className="flex flex-col border-t border-border-subtle first:border-t-0">
                <button
                  onClick={() => setExpanded((p) => ({ ...p, [e.id]: !p[e.id] }))}
                  className="grid grid-cols-[150px_150px_1fr_90px] items-center gap-3.5 px-[18px] py-3.5 text-left"
                >
                  <span className="nums text-[11.5px] text-text-tertiary">{dateTime(e.timestamp)}</span>
                  <span className="text-xs font-bold truncate">{e.actor}</span>
                  <span className="text-[12.5px] text-text-secondary truncate">
                    {e.action} &middot; <span className="text-text font-semibold">{e.target}</span>
                  </span>
                  <span className={`justify-self-end inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${CATEGORY_STYLE[e.category] ?? ""}`}>
                    {e.category}
                  </span>
                </button>
                {open && (
                  <div className="grid sm:grid-cols-3 gap-3.5 px-[18px] pb-[18px]">
                    <Box label="Previous State" value={e.previous ?? "—"} tone="negative" />
                    <Box label="New State" value={e.next ?? "—"} tone="positive" />
                    <Box label="Reference" value={e.reference ?? "—"} />
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="px-[18px] py-10 text-center text-text-tertiary text-[13px]">No matching audit entries.</div>}
        </div>
      </div>
    </>
  );
}

function Box({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  const color = tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-text";
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-surface-2 border border-border-subtle min-w-0">
      <span className="text-[10px] font-bold text-text-tertiary uppercase">{label}</span>
      <code className={`nums text-[11.5px] ${color} break-all`}>{value}</code>
    </div>
  );
}
