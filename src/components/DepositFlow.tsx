"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentMethod } from "@/lib/store";
import { money } from "@/lib/format";

const CHIPS = [1000, 5000, 10000, 50000];

const METHOD_ICON: Record<string, React.ReactNode> = {
  bitcoin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v16M11 4v16M6 8h9a3 3 0 0 1 0 6H6M6 14h10a3 3 0 0 1 0 6H6" />
    </svg>
  ),
  usdt: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 8h8M12 8v3M9 13.5c0 1.4 1.5 2.5 3.4 2.5.9 0 1.6-.2 2.1-.6M12 11c-2.2 0-4 .8-4 1.8s1.8 1.8 4 1.8 4-.8 4-1.8-1.8-1.8-4-1.8Z" />
    </svg>
  ),
  paypal: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18h2.5l1-6.5H14a4 4 0 0 0 0-8H8L5 18" />
      <path d="M10 11.5h3.5a4 4 0 0 0 0-8" opacity="0.5" />
    </svg>
  ),
  skrill: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 15c1 1 2 1.2 3.5 1.2 2 0 3-.7 3-1.8 0-2.6-6-1-6-4.2 0-1.4 1.5-2.2 3.3-2.2 1.3 0 2.2.3 3.2 1" />
    </svg>
  ),
  revolut: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18V6h5a3.5 3.5 0 0 1 0 7H9M13 13l4 5" />
    </svg>
  ),
};

function randomChallenge() {
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 2 + Math.floor(Math.random() * 8);
  return { a, b };
}

export function DepositFlow({ methods, currencySymbol = "₦" }: { methods: PaymentMethod[]; currencySymbol?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"amount" | "method" | "verify" | "instructions">("amount");
  const [amount, setAmount] = useState("5000");
  const [selectedKey, setSelectedKey] = useState<string | null>(methods[0]?.key ?? null);
  const [challenge, setChallenge] = useState(randomChallenge);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
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
    setChallenge(randomChallenge());
    setCaptchaInput("");
    setCaptchaError(null);
    setStep("verify");
  }

  async function confirmVerification() {
    if (!selected) return;
    if (parseInt(captchaInput, 10) !== challenge.a + challenge.b) {
      setCaptchaError("That's not quite right — try again.");
      setChallenge(randomChallenge());
      setCaptchaInput("");
      return;
    }
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
    <div className="flex flex-col gap-[18px] p-6 rounded-2xl bg-surface border border-border-subtle">
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
          <div className="flex gap-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setAmount(String(c))}
                className="flex-1 py-2.5 rounded-lg border border-border-subtle bg-surface-2 text-[12.5px] font-bold"
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
          <span className="text-sm font-bold">Quick human check</span>
          <p className="m-0 text-[12.5px] text-text-tertiary leading-relaxed">
            Just confirming there&rsquo;s a person on the other end before we generate your transfer reference.
          </p>
          <div className="flex flex-col gap-2 p-4 rounded-lg bg-surface-2 border border-border-subtle">
            <span className="text-[11.5px] text-text-tertiary font-semibold">
              What is {challenge.a} + {challenge.b}?
            </span>
            <input
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              autoFocus
              className="px-3.5 py-3 rounded-lg border border-border bg-bg text-text text-lg font-bold font-display outline-none focus:border-accent"
            />
          </div>
          {captchaError && <span className="text-xs text-negative font-semibold">{captchaError}</span>}
          {error && <span className="text-xs text-negative font-semibold">{error}</span>}
          <div className="flex gap-2.5">
            <button onClick={() => setStep("method")} className="flex-1 py-3 rounded-lg border border-border text-[13px] font-semibold">
              Back
            </button>
            <button
              onClick={confirmVerification}
              disabled={busy || captchaInput === ""}
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
