"use client";

import { useBetslip, selectionKey } from "./BetslipProvider";

export function OddsButton({
  matchId,
  matchLabel,
  league,
  market = "Match Winner",
  pick,
  label,
  odds,
  disabled,
  size = "md",
  grow = true,
}: {
  matchId: string;
  matchLabel: string;
  league: string;
  market?: string;
  pick: string;
  label: string;
  odds: number;
  disabled?: boolean;
  size?: "sm" | "md";
  grow?: boolean;
}) {
  const { selections, toggle } = useBetslip();
  const key = selectionKey(matchId, pick);
  const selected = !!selections[key];

  const pad = size === "sm" ? "py-1.5 px-1" : "py-2 px-1";
  const valueSize = size === "sm" ? "text-[11.5px]" : "text-[13px]";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => toggle(key, { matchId, matchLabel, league, market, pick, label, odds })}
      className={`${grow ? "flex-1" : ""} flex flex-col items-center justify-center gap-0.5 rounded-lg border ${pad} transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        selected
          ? "border-accent bg-accent/15 text-accent"
          : "border-border-subtle bg-surface-2 text-text hover:border-border"
      }`}
    >
      <span className="text-[9.5px] font-semibold opacity-65 whitespace-nowrap px-1">{label}</span>
      <span className={`nums font-bold ${valueSize}`}>{disabled ? "—" : odds.toFixed(2)}</span>
    </button>
  );
}
