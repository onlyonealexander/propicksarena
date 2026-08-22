"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_CURRENCY } from "@/lib/currencies";
import { MIN_STAKE } from "@/lib/betting";
import { money } from "@/lib/format";

export type SelectionInput = {
  matchId: string;
  matchLabel: string;
  market: string;
  pick: string;
  label: string;
  odds: number;
};

type BetslipState = {
  selections: Record<string, SelectionInput>;
  stake: string;
  status: "idle" | "submitting" | "success" | "error";
  message: string | null;
};

type BetslipContextValue = BetslipState & {
  toggle: (key: string, sel: SelectionInput) => void;
  remove: (key: string) => void;
  clear: () => void;
  setStake: (v: string) => void;
  totalOdds: number;
  potentialWin: number;
  count: number;
  confirm: () => Promise<void>;
  currencySymbol: string;
};

const BetslipContext = createContext<BetslipContextValue | null>(null);

export function selectionKey(matchId: string, pick: string) {
  return `${matchId}:${pick}`;
}

export function BetslipProvider({ children, currencySymbol = DEFAULT_CURRENCY.symbol }: { children: React.ReactNode; currencySymbol?: string }) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, SelectionInput>>({});
  const [stake, setStake] = useState(String(MIN_STAKE));
  const [status, setStatus] = useState<BetslipState["status"]>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const toggle = useCallback((key: string, sel: SelectionInput) => {
    setStatus("idle");
    setMessage(null);
    setSelections((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = sel;
      return next;
    });
  }, []);

  const remove = useCallback((key: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelections({});
    setStatus("idle");
    setMessage(null);
  }, []);

  const list = Object.values(selections);
  const totalOdds = list.length ? list.reduce((acc, s) => acc * s.odds, 1) : 0;
  const stakeNum = parseFloat(stake) || 0;
  const potentialWin = totalOdds * stakeNum;

  const confirm = useCallback(async () => {
    if (list.length === 0) return;
    if (stakeNum < MIN_STAKE) {
      setStatus("error");
      setMessage(`Minimum stake is ${money(MIN_STAKE, currencySymbol)}`);
      return;
    }
    setStatus("submitting");
    setMessage(null);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          selections: list.map((s) => ({
            matchId: s.matchId,
            matchLabel: s.matchLabel,
            market: s.market,
            pick: s.pick,
            label: s.label,
            odds: s.odds,
          })),
          stake: stakeNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not place bet");
        if (res.status === 401) router.push("/login?next=/");
        return;
      }
      setStatus("success");
      setMessage(`Bet placed — ${data.bet.id}`);
      setSelections({});
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error — please try again");
    }
  }, [list, stakeNum, router, currencySymbol]);

  const value = useMemo<BetslipContextValue>(
    () => ({
      selections,
      stake,
      status,
      message,
      toggle,
      remove,
      clear,
      setStake,
      totalOdds,
      potentialWin,
      count: list.length,
      confirm,
      currencySymbol,
    }),
    [selections, stake, status, message, toggle, remove, clear, totalOdds, potentialWin, list.length, confirm, currencySymbol]
  );

  return <BetslipContext.Provider value={value}>{children}</BetslipContext.Provider>;
}

export function useBetslip() {
  const ctx = useContext(BetslipContext);
  if (!ctx) throw new Error("useBetslip must be used within BetslipProvider");
  return ctx;
}
