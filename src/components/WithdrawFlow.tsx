"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentMethod, PaymentMethodKey } from "@/lib/store";
import { money, maskDestination, maskEmail } from "@/lib/format";
import { computeWithdrawalFee, feeLabel } from "@/lib/fees";
import { METHOD_ICON } from "./paymentMethodIcons";
import { useHumanVerification, HumanVerificationCard } from "./HumanVerification";

type FieldDef = { key: string; label: string; placeholder?: string; type?: "text" | "email"; optional?: boolean; primary?: boolean };

const DETAIL_FIELDS: Record<PaymentMethodKey, FieldDef[]> = {
  bitcoin: [
    { key: "address", label: "Bitcoin Wallet Address", placeholder: "bc1q…", primary: true },
    { key: "fullName", label: "Account / Payment Name", placeholder: "Name on the receiving wallet", optional: true },
  ],
  usdt: [
    { key: "address", label: "USDT Wallet Address", placeholder: "T…", primary: true },
    { key: "fullName", label: "Account / Payment Name", placeholder: "Name on the receiving wallet", optional: true },
  ],
  paypal: [
    { key: "email", label: "PayPal Email", type: "email", placeholder: "you@example.com", primary: true },
    { key: "fullName", label: "Full Name", placeholder: "Name on the PayPal account" },
  ],
  skrill: [
    { key: "email", label: "Skrill Email / Account ID", placeholder: "you@example.com", primary: true },
    { key: "fullName", label: "Full Name", placeholder: "Name on the Skrill account" },
  ],
  revolut: [
    { key: "tag", label: "Revolut Tag or Phone Number", placeholder: "@yourtag", primary: true },
    { key: "fullName", label: "Full Name", placeholder: "Name on the Revolut account" },
  ],
};

const PROCESSING_TIME: Record<PaymentMethodKey, string> = {
  bitcoin: "Within a few hours",
  usdt: "Within a few hours",
  paypal: "Same business day",
  skrill: "Same business day",
  revolut: "Within 24 hours",
};

type Step = "amount" | "method" | "verify" | "details" | "review" | "success";
const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "amount", label: "Amount" },
  { key: "method", label: "Method" },
  { key: "verify", label: "Verify" },
  { key: "details", label: "Details" },
  { key: "review", label: "Review" },
];

export function WithdrawFlow({ methods, available, currencySymbol }: { methods: PaymentMethod[]; available: number; currencySymbol: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [methodKey, setMethodKey] = useState<PaymentMethodKey | null>(null);
  const verification = useHumanVerification();
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; amount: number; methodLabel: string } | null>(null);

  const enabledMethods = methods.filter((m) => m.enabled);
  const amountNum = parseFloat(amount) || 0;
  const method = methods.find((m) => m.key === methodKey) ?? null;
  const fee = method ? computeWithdrawalFee(amountNum, method) : 0;
  const netAmount = Math.max(0, amountNum - fee);
  const fields = methodKey ? DETAIL_FIELDS[methodKey] : [];

  const progress = STEP_LABELS.findIndex((s) => s.key === step) + 1;

  function goToMethod() {
    setAmountError(null);
    if (!amountNum || amountNum <= 0) {
      setAmountError("Enter an amount to withdraw.");
      return;
    }
    if (amountNum > available) {
      setAmountError("Amount exceeds your available balance.");
      return;
    }
    setStep("method");
  }

  function goToVerify() {
    if (!methodKey) return;
    verification.reset();
    setStep("verify");
  }

  function goToDetails() {
    if (!verification.verify()) return;
    setStep("details");
  }

  function detailsComplete() {
    return fields.every((f) => f.optional || (values[f.key] ?? "").trim().length > 0);
  }

  function goToReview() {
    if (!detailsComplete()) return;
    setStep("review");
  }

  function buildDestination(): string {
    if (!method || !methodKey) return "";
    const primary = fields.find((f) => f.primary);
    const parts: string[] = [];
    if (primary) parts.push((values[primary.key] ?? "").trim());
    if (values.fullName?.trim()) parts.push(values.fullName.trim());
    const networkSuffix = methodKey === "usdt" && method.network ? ` (${method.network})` : "";
    return `${method.label}${networkSuffix} — ${parts.join(" — ")}`;
  }

  function maskedPrimary(): string {
    const primary = fields.find((f) => f.primary);
    if (!primary) return "";
    const v = values[primary.key] ?? "";
    return primary.type === "email" ? maskEmail(v) : maskDestination(v);
  }

  function startOver() {
    setStep("amount");
    setAmount("");
    setAmountError(null);
    setMethodKey(null);
    setValues({});
    setResult(null);
    setError(null);
  }

  async function submit() {
    if (!method || !methodKey) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: amountNum, method: methodKey, destination: buildDestination() }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit this withdrawal");
      return;
    }
    setResult({ reference: data.transaction.reference, amount: amountNum, methodLabel: method.label });
    setStep("success");
    router.refresh();
  }

  return (
    <div className="min-w-0 flex flex-col gap-[18px] p-6 rounded-2xl bg-surface border border-border-subtle">
      {step !== "success" && (
        <div className="min-w-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {STEP_LABELS.map(({ key, label }, i) => (
            <div key={key} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 sm:flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  progress > i ? "bg-accent text-accent-fg" : "bg-surface-2 text-text-tertiary"
                }`}
              >
                {progress > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-[10.5px] sm:text-[11px] font-semibold whitespace-nowrap ${progress >= i + 1 ? "text-text" : "text-text-tertiary"}`}>{label}</span>
              {i < STEP_LABELS.length - 1 && <span className="hidden sm:block flex-1 h-px bg-border-subtle" />}
            </div>
          ))}
        </div>
      )}

      {step === "amount" && (
        <>
          <span className="text-sm font-bold">Withdraw Funds</span>
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-surface-2 border border-border-subtle">
            <span className="text-[11.5px] text-text-tertiary font-semibold">Available Balance</span>
            <span className="nums text-[13px] font-bold">{money(available, currencySymbol)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] text-text-tertiary font-semibold">Withdrawal Amount</span>
            <div className="flex items-center gap-2 px-3.5 rounded-lg border border-border bg-bg">
              <span className="text-base text-text-tertiary font-bold">{currencySymbol}</span>
              <input
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                  setAmountError(null);
                }}
                inputMode="decimal"
                placeholder="0.00"
                autoFocus
                className="flex-1 min-w-0 border-none bg-transparent outline-none text-text text-lg font-bold py-3.5 font-display"
              />
            </div>
            {amountError && <span className="text-xs text-negative font-semibold">{amountError}</span>}
          </div>
          <span className="text-[11px] text-text-tertiary leading-relaxed">
            The fee and amount you&rsquo;ll receive depend on the payout method you choose next — shown before you confirm.
          </span>
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
          <span className="text-sm font-bold">Choose a payout method</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {enabledMethods.map((m) => (
              <button
                key={m.key}
                onClick={() => setMethodKey(m.key)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-lg border text-left ${
                  methodKey === m.key ? "border-accent bg-accent/15" : "border-border-subtle bg-surface-2"
                }`}
              >
                <span className={`flex-shrink-0 ${methodKey === m.key ? "text-accent" : "text-text-secondary"}`}>{METHOD_ICON[m.key]}</span>
                <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className={`text-[13px] font-semibold truncate ${methodKey === m.key ? "text-accent" : "text-text"}`}>
                    {m.label}
                    {m.network && <span className="text-text-tertiary font-normal"> · {m.network}</span>}
                  </span>
                  <span className="text-[10.5px] text-text-tertiary">{feeLabel(m, currencySymbol)}</span>
                </span>
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${methodKey === m.key ? "border-accent bg-accent" : "border-border"}`} />
              </button>
            ))}
            {enabledMethods.length === 0 && (
              <p className="text-xs text-text-tertiary sm:col-span-2">No payout methods are enabled right now — please contact support.</p>
            )}
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep("amount")} className="flex-1 py-3 rounded-lg border border-border text-[13px] font-semibold">
              Back
            </button>
            <button
              onClick={goToVerify}
              disabled={!methodKey}
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
          <div className="flex gap-2.5">
            <button onClick={() => setStep("method")} className="flex-1 py-3 rounded-lg border border-border text-[13px] font-semibold">
              Back
            </button>
            <button
              onClick={goToDetails}
              disabled={verification.input === ""}
              className="flex-1 py-3 rounded-lg bg-accent text-accent-fg font-extrabold text-[13px] disabled:opacity-50"
            >
              Verify &amp; Continue
            </button>
          </div>
        </>
      )}

      {step === "details" && method && (
        <>
          <span className="text-sm font-bold">{method.label} payment details</span>
          {methodKey === "usdt" && method.network && (
            <div className="flex gap-2.5 items-start p-3.5 rounded-lg bg-warning/10 border border-border-subtle">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.3 3.9L2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
              <span className="text-[11.5px] text-text-secondary leading-relaxed">
                Only send to a wallet that supports the <b className="text-text">{method.network}</b> network. Using the wrong network can
                permanently lose your funds.
              </span>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="text-[11.5px] text-text-tertiary font-semibold">
                  {f.label}
                  {f.optional && <span className="text-text-tertiary font-normal"> (optional)</span>}
                </label>
                <input
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  type={f.type === "email" ? "email" : "text"}
                  placeholder={f.placeholder}
                  className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep("verify")} className="flex-1 py-3 rounded-lg border border-border text-[13px] font-semibold">
              Back
            </button>
            <button
              onClick={goToReview}
              disabled={!detailsComplete()}
              className="flex-1 py-3 rounded-lg bg-accent text-accent-fg font-extrabold text-[13px] disabled:opacity-50"
            >
              Review Withdrawal
            </button>
          </div>
        </>
      )}

      {step === "review" && method && methodKey && (
        <>
          <span className="text-sm font-bold">Review your withdrawal</span>
          <div className="flex flex-col gap-3 p-4 rounded-lg bg-surface-2 border border-border-subtle">
            <Row label="Amount" value={money(amountNum, currencySymbol)} />
            <Row label="Method" value={method.label} />
            {methodKey === "usdt" && method.network && <Row label="Network" value={method.network} />}
            <Row label="Destination" value={maskedPrimary()} mono />
            {values.fullName?.trim() && <Row label="Name" value={values.fullName.trim()} />}
            <Row label="Fee" value={money(fee, currencySymbol)} />
            <Row label="You'll receive" value={money(netAmount, currencySymbol)} highlight />
            <Row label="Processing time" value={PROCESSING_TIME[methodKey]} />
          </div>
          {error && <span className="text-xs text-negative font-semibold">{error}</span>}
          <div className="flex gap-2.5">
            <button onClick={startOver} className="flex-1 py-3 rounded-lg border border-border text-[13px] font-semibold">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={busy}
              className="flex-1 py-3 rounded-lg bg-accent text-accent-fg font-extrabold text-[13px] disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Confirm Withdrawal"}
            </button>
          </div>
        </>
      )}

      {step === "success" && result && (
        <>
          <div className="flex flex-col items-center gap-2.5 py-2 text-center">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-positive)" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            <span className="text-[15px] font-bold">Withdrawal Request Submitted</span>
            <p className="m-0 text-[12.5px] text-text-tertiary max-w-xs leading-relaxed">
              Your withdrawal request has been received and is being reviewed.
            </p>
          </div>
          <div className="flex flex-col gap-3 p-4 rounded-lg bg-surface-2 border border-border-subtle">
            <Row label="Reference" value={result.reference} mono highlight />
            <Row label="Amount" value={money(result.amount, currencySymbol)} />
            <Row label="Method" value={result.methodLabel} />
          </div>
          <span className="text-[11px] text-text-tertiary text-center">You can track its status any time under Transaction History.</span>
          <button onClick={startOver} className="w-full py-3 rounded-lg border border-border text-[13px] font-semibold">
            Make another withdrawal
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
