"use client";

import { useState } from "react";
import type { Bet, Selection } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { money, dateTime } from "@/lib/format";

// "Pending" reads as "Processing" for bets specifically — StatusBadge already
// has a distinct accent-colored style for it, separate from the warmer
// "Pending" used for financial transactions awaiting admin review.
function displayStatus(status: string): string {
  return status === "Pending" ? "Processing" : status;
}

function payoutInfo(b: Bet): { headerLabel: string; detailLabel: string; color: string } {
  const symbol = b.currencySymbol;
  const payout = money(b.potentialPayout, symbol);
  const stakeLoss = `-${money(b.stake, symbol)}`;
  if (b.status === "Won") return { headerLabel: payout, detailLabel: payout, color: "text-positive" };
  if (b.status === "Lost") return { headerLabel: stakeLoss, detailLabel: stakeLoss, color: "text-negative" };
  if (b.status === "Pending") return { headerLabel: `Potential ${payout}`, detailLabel: payout, color: "text-text-secondary" };
  return { headerLabel: money(b.stake, symbol), detailLabel: money(b.stake, symbol), color: "text-text-tertiary" };
}

// A leg's own result once it's known; otherwise it inherits the bet's
// overall status (all legs are still "Processing" together, or — for the
// Cancelled/Void/Refunded paths, which don't track legs individually —
// they all just show that same status).
function legStatus(s: Selection, bet: Bet): string {
  if (s.result) return s.result;
  return displayStatus(bet.status);
}

export function BetCard({ bet, defaultOpen = false }: { bet: Bet; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const p = payoutInfo(bet);
  const betNumber = bet.id.replace(/^BET-/, "");

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3 sm:py-4 text-left">
        <span className="hidden sm:block flex-shrink-0">
          <StatusBadge status={displayStatus(bet.status)} />
        </span>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="text-[12.5px] sm:text-[13px] font-bold truncate">Bet #{betNumber}</span>
          <span className="text-[10.5px] sm:text-[11px] text-text-tertiary truncate">
            {bet.selections.length} selection{bet.selections.length > 1 ? "s" : ""} &middot; {dateTime(bet.placedAt)}
          </span>
        </div>
        <div className="hidden md:flex flex-col items-end flex-shrink-0">
          <span className="text-[10px] text-text-tertiary">Stake</span>
          <span className="nums text-[12.5px] font-bold">{money(bet.stake, bet.currencySymbol)}</span>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[10px] text-text-tertiary whitespace-nowrap">{bet.status === "Won" ? "Payout" : "Potential Win"}</span>
          <span className={`nums text-[12px] sm:text-[13px] font-bold whitespace-nowrap ${p.color}`}>{p.headerLabel}</span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-border-subtle px-3.5 sm:px-5 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-border-subtle">
            <MiniStat label="Total Odds" value={bet.totalOdds.toFixed(2)} />
            <MiniStat label="Stake" value={money(bet.stake, bet.currencySymbol)} />
            <MiniStat label={bet.status === "Won" ? "Payout" : "Potential Win"} value={p.detailLabel} className={p.color} />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">Status</span>
              <StatusBadge status={displayStatus(bet.status)} />
            </div>
          </div>

          <div className="flex flex-col divide-y divide-border-subtle">
            {bet.selections.map((s, i) => (
              <div key={`${s.matchId}-${s.pick}-${i}`} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
                <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide truncate">{s.league}</span>
                <span className="text-[13px] sm:text-[13.5px] font-bold break-words">{s.matchLabel}</span>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                  <span className="text-[12px] text-text-secondary break-words">
                    {s.market} &mdash; <b className="text-text">{s.label}</b>
                  </span>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="nums text-[12.5px] font-bold text-accent">{s.odds.toFixed(2)}</span>
                    <StatusBadge status={legStatus(s, bet)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</span>
      <span className={`nums text-[13px] font-bold truncate ${className ?? ""}`}>{value}</span>
    </div>
  );
}
