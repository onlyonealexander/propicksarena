"use client";

import { useState } from "react";
import { useBetslip } from "./BetslipProvider";
import { BetslipPanel } from "./BetslipPanel";

export function MobileBetslip() {
  const { count, totalOdds } = useBetslip();
  const [open, setOpen] = useState(false);

  if (count === 0) return null;

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3.5 right-3.5 bottom-4 z-40 flex items-center justify-between px-4 py-3.5 rounded-2xl bg-accent shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      >
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent-fg/20 text-accent-fg text-[11px] font-extrabold flex items-center justify-center">{count}</span>
          <span className="text-[13px] font-bold text-accent-fg">View Betslip</span>
        </span>
        <span className="nums text-[13.5px] font-extrabold text-accent-fg">{totalOdds.toFixed(2)}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-end" onClick={() => setOpen(false)}>
          <div className="w-full max-h-[85vh] overflow-y-auto rounded-t-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-2.5 pb-1 bg-surface rounded-t-2xl">
              <span className="w-9 h-1 rounded-full bg-border" />
            </div>
            <BetslipPanel onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
