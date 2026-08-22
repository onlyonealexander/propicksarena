"use client";

import { useBetslip, selectionKey } from "./BetslipProvider";
import { money } from "@/lib/format";
import { MIN_STAKE } from "@/lib/betting";

export function BetslipPanel({ onClose }: { onClose?: () => void }) {
  const { selections, remove, clear, stake, setStake, totalOdds, potentialWin, count, status, message, confirm, currencySymbol } = useBetslip();
  const list = Object.entries(selections);
  const stakeNum = parseFloat(stake) || 0;
  const belowMin = stakeNum > 0 && stakeNum < MIN_STAKE;

  return (
    <aside
      className={
        onClose
          ? "flex flex-col bg-surface"
          : "sticky top-24 flex flex-col rounded-2xl border border-border-subtle bg-surface overflow-hidden"
      }
    >
      <div className="flex items-center justify-between px-[18px] py-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <h3 className="font-display font-bold text-[15px] m-0">Betslip</h3>
          <span className="min-w-[19px] h-[19px] px-1.5 rounded-full bg-accent text-accent-fg text-[11px] font-extrabold flex items-center justify-center">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={clear} className="text-text-tertiary text-xs font-semibold">
            Clear all
          </button>
          {onClose && (
            <button onClick={onClose} className="text-text-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center gap-2.5 py-[52px] px-6 text-center">
          {status === "success" && message ? (
            <>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-positive)" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12l3 3 5-6" />
              </svg>
              <span className="text-[13px] text-positive font-semibold leading-relaxed">{message}</span>
            </>
          ) : (
            <>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.6">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" />
              </svg>
              <span className="text-[13px] text-text-tertiary leading-relaxed">
                Select an odd to
                <br />
                get started
              </span>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5 px-[18px] py-3.5 max-h-[340px] overflow-y-auto">
            {list.map(([key, s]) => (
              <div key={key} className="flex flex-col gap-1.5 p-3 rounded-lg bg-surface-2 border border-border-subtle">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12.5px] font-semibold leading-snug">{s.matchLabel}</span>
                  <button onClick={() => remove(key)} className="flex-shrink-0 text-text-tertiary p-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <span className="text-[11px] text-text-tertiary">{s.market}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-bold text-accent">{s.label}</span>
                  <span className="nums text-[13px] font-bold">{s.odds.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 px-[18px] py-4 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-text-secondary font-semibold">Total Odds</span>
              <span className="nums text-[14px] font-extrabold text-accent">{totalOdds.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] text-text-tertiary font-semibold">Stake</span>
                <span className="text-[10.5px] text-text-tertiary">Min {money(MIN_STAKE, currencySymbol)}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 rounded-lg border bg-bg ${belowMin ? "border-negative" : "border-border"}`}>
                <span className="text-[14px] text-text-tertiary font-bold">{currencySymbol}</span>
                <input
                  value={stake}
                  onChange={(e) => setStake(e.target.value.replace(/[^0-9.]/g, ""))}
                  inputMode="decimal"
                  className="flex-1 min-w-0 border-none bg-transparent outline-none text-text text-[15px] font-bold py-2.5 font-display"
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-accent/10">
              <span className="text-xs text-text-secondary font-semibold">Potential Winnings</span>
              <span className="nums text-[15px] font-extrabold text-positive">{money(potentialWin || 0, currencySymbol)}</span>
            </div>
            <button
              onClick={confirm}
              disabled={status === "submitting" || stakeNum < MIN_STAKE}
              className="w-full py-3.5 rounded-lg bg-accent text-accent-fg font-extrabold text-sm disabled:opacity-60"
            >
              {status === "submitting" ? "Placing…" : "Confirm Bet"}
            </button>
            {message && (
              <span className={`text-xs text-center ${status === "error" ? "text-negative" : "text-positive"}`}>{message}</span>
            )}
            <span className="text-[10.5px] text-text-tertiary text-center">By confirming you agree to the betting rules &amp; terms</span>
          </div>
        </>
      )}
    </aside>
  );
}

export { selectionKey };
