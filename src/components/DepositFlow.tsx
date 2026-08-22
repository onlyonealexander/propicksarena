"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentMethod } from "@/lib/store";
import { money } from "@/lib/format";
import { DEFAULT_CURRENCY } from "@/lib/currencies";
import { METHOD_ICON } from "./paymentMethodIcons";
import { useHumanVerification, HumanVerificationCard } from "./HumanVerification";

const CHIPS = [1000, 5000, 10000, 50000];

export function DepositFlow({ methods, currencySymbol = DEFAULT_CURRENCY.symbol }: { methods: PaymentMethod[]; currencySymbol?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"amount" | "method" | "verify" | "instructions">("amount");
  const [amount, setAmount] = useState("5000");
  const [selectedKey, setSelectedKey] = useState<string | null>(methods[0]?.key ?? null);
  const verification = useHumanVerification();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; amount: number } | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const selected = methods.find((m) => m.key === selectedKey) ?? null;
  const enabledMethods = methods.filter((m) => m.enabled);

  function goToMethod() {
    if (!amountNum || amountNum <= 0) return;
    setStep("method");
  }

  function goToVerify() {
    if (!selected) return;
    verification.reset();
    setStep("verify");
  }

  async function confirmVerification() {
    if (!selected) return;
    if (!verification.verify()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: amountNum, method: selected.label + (selected.network ? ` (${selected.network})` : "") }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not start this deposit");
      return;
    }
    setResult({ reference: data.transaction.reference, amount: amountNum });
    setStep("instructions");
    router.refresh();
  }

  function startOver() {
    setStep("amount");
    setResult(null);
    setAmount("5000");
  }

  const progress = useMemo(() => (step === "amount" ? 1 : step === "method" ? 2 : step === "verify" ? 3 : 4), [step]);

  return (
    <div className="min-w-0 flex flex-col gap-[18px] p-6 rounded-2xl bg-surface border border-border-subtle">
      <div className="flex items-center gap-2">
        {["Amount", "Method", "Verify", "Transfer"].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                progress > i ? "bg-accent text-accent-fg" : "bg-surface-2 text-text-tertiary"
              }`}
            >
              {progress > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-[11px] font-semibold hidden sm:inline ${progress >= i + 1 ? "text-text" : "text-text-tertiary"}`}>{label}</span>
            {i < 3 && <span className="flex-1 h-px bg-border-subtle" />}
          </div>
        ))}
      </div>

      {step === "amount" && (
        <>
          <span className="text-sm font-bold">Deposit Funds</span>
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] text-text-tertiary font-semibold">Amount</span>
            <div className="flex items-center gap-2 px-3.5 rounded-lg border border-border bg-bg">
              <span className="text-base text-text-tertiary font-bold">{currencySymbol}</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                className="flex-1 border-none bg-transparent outline-none text-text text-lg font-bold py-3.5 font-display"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setAmount(String(c))}
                className="flex-1 min-w-[72px] py-2.5 rounded-lg border border-border-subtle bg-surface-2 text-[11.5px] sm:text-[12.5px] font-bold whitespace-nowrap"
              >
                {currencySymbol}
                {c.toLocaleString()}
              </button>
            ))}
          </div>
          <button
            onClick={goToMethod}
            disabled={!amountNum}
            className="w-full py-3.5 rounded-lg bg-accent text-accent-fg font-extrabold text-sm disabled:opacity-50"
          >
            Continue — {money(amountNum || 0, currencySymbol)}
          </button>
        </>
      )}

      {step === "method" && (
        <>
          <span className="text-sm font-bold">Choose a payment method</span>
          <div className="flex flex-col gap-2">
            {enabledMethods.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedKey(m.key)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-lg border text-[13px] font-semibold ${
                  selectedKey === m.key ? "border-accent bg-accent/15 text-accent" : "border-border-subtle bg-surface-2 text-text"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {METHOD_ICON[m.key]}
                  {m.label}
                  {m.network && <span className="text-[10.5px] text-text-tertiary font-normal">({m.network})</span>}
                </span>
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedKey === m.key ? "border-accent bg-accent" : "border-border"}`} />
              </button>
            ))}
            {enabledMethods.length === 0 && <p className="text-xs text-text-tertiary">No payment methods are enabled right now — please contact support.</p>}
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep("amount")} className="flex-1 py-3 rounded-lg border border-border text-[13px] font-semibold">
              Back
            </button>
            <button
              onClick={goToVerify}
              disabled={!selected}
              className="flex-1 py-3 rounded-lg bg-accent text-accent-fg font-extrabold text-[13px] disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {step === "verify" && (
        <>
          <HumanVerificationCard challenge={verification.challenge} input={verification.input} onChange={verification.setInput} error={verification.error} />
          {error && <span className="text-xs text-negative font-semibold">{error}</span>}
          <div className="flex gap-2.5">
            <button onClick={() => setStep("method")} className="flex-1 py-3 rounded-lg border border-border text-[13px] font-semibold">
              Back
            </button>
            <button
              onClick={confirmVerification}
              disabled={busy || verification.input === ""}
              className="flex-1 py-3 rounded-lg bg-accent text-accent-fg font-extrabold text-[13px] disabled:opacity-50"
            >
              {busy ? "Verifying…" : "Verify & Continue"}
            </button>
          </div>
        </>
      )}

      {step === "instructions" && result && selected && (
        <>
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            <span className="text-sm font-bold">Reference generated — complete your {selected.label} payment</span>
          </div>
          <div className="flex flex-col gap-3 p-4 rounded-lg bg-surface-2 border border-border-subtle">
            <Row label="Method" value={selected.label + (selected.network ? ` (${selected.network})` : "")} />
            <Row label={selected.key === "bitcoin" || selected.key === "usdt" ? "Wallet Address" : selected.key === "revolut" ? "Revolut Tag" : "Send To"} value={selected.details} mono />
            <Row label="Amount to Send" value={money(result.amount, currencySymbol)} highlight />
            <Row label="Reference" value={result.reference} mono highlight />
          </div>
          <p className="m-0 text-[11.5px] text-text-tertiary leading-relaxed">{selected.instructions}</p>
          <div className="flex gap-2.5 items-start p-3.5 rounded-lg bg-warning/10 border border-border-subtle">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9L2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            <span className="text-[11.5px] text-text-secondary leading-relaxed">
              Your balance updates automatically once our team confirms the payment has arrived — usually within a
              few minutes during business hours. You can track the status any time under Transaction History.
            </span>
          </div>
          <button onClick={startOver} className="w-full py-3 rounded-lg border border-border text-[13px] font-semibold">
            Make another deposit
          </button>
        </>
      )}
    </div>
  );
}

function Row({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11.5px] text-text-tertiary flex-shrink-0">{label}</span>
      <span className={`text-[13px] font-bold text-right break-all ${mono ? "nums" : ""} ${highlight ? "text-accent" : ""}`}>{value}</span>
    </div>
  );
}
