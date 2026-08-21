"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NormalizedMatch } from "@/lib/sportsdata";
import type { MarketStatus } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { kickoffLabel } from "@/lib/format";

type Group = { league: { code: string; name: string; country: string }; matches: NormalizedMatch[] };

const MARKET_LABEL = "Match Winner";

export function MatchesClient({ groups, overrides }: { groups: Group[]; overrides: Record<string, MarketStatus> }) {
  const router = useRouter();
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map((g) => [g.league.code, true]))
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function setStatus(match: NormalizedMatch, status: MarketStatus) {
    setBusy(match.id);
    await fetch(`/api/admin/markets/${match.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, matchLabel: `${match.home} vs ${match.away}` }),
    });
    setBusy(null);
    router.refresh();
  }

  async function syncAndSettle() {
    setSyncing(true);
    setSyncMessage(null);
    const res = await fetch("/api/admin/settle", { method: "POST" });
    const data = await res.json();
    setSyncing(false);
    setSyncMessage(data.settled ? `Settled ${data.settled} bet${data.settled > 1 ? "s" : ""} off real results.` : "No pending bets had a finished result yet.");
    router.refresh();
  }

  return (
    <>
      <header className="flex items-center justify-between px-8 py-4 border-b border-border-subtle">
        <div>
          <h1 className="m-0 font-display text-xl font-bold">Matches &amp; Markets</h1>
          <span className="text-xs text-text-tertiary">Live fixture feed &middot; suspend/close markets &middot; settle off real results</span>
        </div>
        <button
          onClick={syncAndSettle}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-fg font-bold text-[12.5px] disabled:opacity-60"
        >
          {syncing ? "Syncing…" : "Sync & Settle Finished Bets"}
        </button>
      </header>

      <div className="flex flex-col gap-4 px-8 py-6 max-w-[1000px]">
        {syncMessage && <div className="px-4 py-3 rounded-lg bg-accent/10 text-[12.5px] text-text-secondary">{syncMessage}</div>}

        {groups.map(({ league, matches }) => (
          <div key={league.code} className="flex flex-col rounded-2xl border border-border-subtle bg-surface overflow-hidden">
            <button
              onClick={() => setExpandedLeagues((p) => ({ ...p, [league.code]: !p[league.code] }))}
              className="flex items-center gap-3 px-[18px] py-4 text-left"
            >
              <Chevron open={!!expandedLeagues[league.code]} />
              <div className="w-[30px] h-[30px] rounded-lg bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M9 14l-2 7 5-3 5 3-2-7" />
                </svg>
              </div>
              <span className="text-[13.5px] font-bold flex-1">
                {league.name} <span className="text-text-tertiary font-normal">&middot; {league.country}</span>
              </span>
              <span className="text-[11.5px] text-text-tertiary">{matches.length} tracked</span>
            </button>

            {expandedLeagues[league.code] && (
              <div className="flex flex-col border-t border-border-subtle">
                {matches.map((m) => {
                  const status = overrides[m.id] ?? "Open";
                  const { date, time } = kickoffLabel(m.kickoff);
                  return (
                    <div key={m.id} className="flex flex-col gap-2 px-[18px] py-3.5 border-t border-border-subtle first:border-t-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[12.5px] font-bold flex-1">
                          {m.home} vs {m.away}
                        </span>
                        <span className="text-[11px] text-text-tertiary">
                          {m.status === "live" ? `LIVE ${m.minute}'` : m.status === "finished" ? `FT ${m.homeScore}-${m.awayScore}` : `${date} ${time}`}
                        </span>
                        <StatusBadge status={m.status === "live" ? "Live" : m.status === "finished" ? "Finished" : "Scheduled"} />
                      </div>
                      <div className="flex items-center gap-2.5 pl-0">
                        <span className="text-[11.5px] text-text-tertiary flex-1">{MARKET_LABEL}</span>
                        <span className="min-w-[70px] flex justify-center">
                          <StatusBadge status={status} minWidth />
                        </span>
                        <button
                          disabled={busy === m.id || m.status === "finished"}
                          onClick={() => setStatus(m, status === "Suspended" ? "Open" : "Suspended")}
                          className="px-2.5 py-1.5 rounded-md border border-border text-[11px] font-semibold text-text-secondary disabled:opacity-40"
                        >
                          {status === "Suspended" ? "Resume" : "Suspend"}
                        </button>
                        <button
                          disabled={busy === m.id || m.status === "finished"}
                          onClick={() => setStatus(m, "Closed")}
                          className="px-2.5 py-1.5 rounded-md border border-border text-[11px] font-semibold text-text-secondary disabled:opacity-40"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  );
                })}
                {matches.length === 0 && <div className="px-[18px] py-6 text-center text-text-tertiary text-[13px]">No tracked fixtures right now.</div>}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2.5 items-start p-4 rounded-lg bg-warning/10 border border-border-subtle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.9L2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
          <span className="text-xs text-text-secondary leading-relaxed">
            Settlement always follows the real final score from the live fixture feed — no admin can hand-edit an
            individual bet&rsquo;s outcome. Suspending or closing a market only stops new bets; it never changes
            existing ones.
          </span>
        </div>
      </div>
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span className="text-text-tertiary transition-transform" style={{ transform: `rotate(${open ? 90 : 0}deg)` }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </span>
  );
}
