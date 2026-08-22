"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Transaction, PaymentMethod } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { money, signedMoney, dateTime } from "@/lib/format";
import { DEFAULT_CURRENCY } from "@/lib/currencies";
import { DepositFlow } from "./DepositFlow";

const FILTERS = ["All", "Pending", "Processing", "Successful", "Rejected", "Reversed"] as const;

export function WalletClient({
  transactions,
  available,
  methods,
  currencySymbol = DEFAULT_CURRENCY.symbol,
}: {
  transactions: Transaction[];
  available: number;
  methods: PaymentMethod[];
  currencySymbol?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"Deposit" | "Withdraw" | "History">("Deposit");
  const [withdrawAmount, setWithdrawAmount] = useState("15000");
  const [destinationKey, setDestinationKey] = useState(methods[0]?.key ?? "");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const enabledMethods = methods.filter((m) => m.enabled);
  const destination = methods.find((m) => m.key === destinationKey);

  async function submitWithdraw() {
    const amount = parseFloat(withdrawAmount);
    if (!amount || !destination) return;
    setBusy(true);
    setNotice(null);
    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount, destination: `${destination.label}${destination.network ? ` (${destination.network})` : ""} — ${destination.details}` }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setNotice(data.error ?? "Withdrawal request failed");
      return;
    }
    setNotice(`Withdrawal request for ${money(amount, currencySymbol)} submitted (reference ${data.transaction.reference})`);
    setTab("History");
    router.refresh();
  }

  const filtered = transactions.filter((t) => filter === "All" || t.status === filter);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 border-b border-border-subtle">
        {(["Deposit", "Withdraw", "History"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setNotice(null);
            }}
            className={`px-1 py-3 mr-5 -mb-px border-b-2 text-[13px] ${
              tab === t ? "border-accent text-text font-bold" : "border-transparent text-text-tertiary font-semibold"
            }`}
          >
            {t === "History" ? "Transaction History" : t}
          </button>
        ))}
      </div>

      {tab === "Deposit" && (
        <div className="grid md:grid-cols-2 gap-5">
          <DepositFlow methods={methods} currencySymbol={currencySymbol} />
          <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-surface border border-border-subtle h-fit">
            <span className="text-sm font-bold">How it works</span>
            {[
              "Enter an amount and pass a quick human check.",
              "Choose Bitcoin, USDT, PayPal, Skrill, or Revolut and we'll show you where to send it.",
              "Send the exact amount using the reference we generate as your payment note.",
              "Our team confirms the payment landed and your balance updates — every step stays on your Transaction History.",
            ].map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-[26px] h-[26px] rounded-full bg-accent/15 text-accent text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-[12.5px] text-text-secondary leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Withdraw" && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-[18px] p-6 rounded-2xl bg-surface border border-border-subtle">
            <span className="text-sm font-bold">Request Withdrawal</span>
            <div className="flex flex-col gap-2">
              <span className="text-[11.5px] text-text-tertiary font-semibold">Amount</span>
              <div className="flex items-center gap-2 px-3.5 rounded-lg border border-border bg-bg">
                <span className="text-base text-text-tertiary font-bold">{currencySymbol}</span>
                <input
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="flex-1 border-none bg-transparent outline-none text-text text-lg font-bold py-3.5 font-display"
                />
              </div>
              <span className="text-[11px] text-text-tertiary">Available to withdraw: {money(available, currencySymbol)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11.5px] text-text-tertiary font-semibold">Payout Method</span>
              <div className="grid grid-cols-2 gap-2">
                {enabledMethods.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setDestinationKey(m.key)}
                    className={`px-3 py-2.5 rounded-lg border text-[12.5px] font-semibold text-left ${
                      destinationKey === m.key ? "border-accent bg-accent/15 text-accent" : "border-border-subtle bg-surface-2 text-text"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={submitWithdraw}
              disabled={busy || !destination}
              className="w-full py-3.5 rounded-lg bg-accent text-accent-fg font-extrabold text-sm disabled:opacity-60"
            >
              {busy ? "Submitting…" : `Request Withdrawal ${currencySymbol}${withdrawAmount || "0"}`}
            </button>
            {notice && <span className="text-xs text-center text-positive">{notice}</span>}
          </div>
          <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-surface border border-border-subtle">
            <span className="text-sm font-bold">Processing Times</span>
            {[
              ["Bitcoin / USDT", "Within a few hours"],
              ["PayPal / Skrill", "Same business day"],
              ["Revolut", "Within 24 hours"],
            ].map(([label, time]) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                <span className="text-[12.5px] text-text-secondary">{label}</span>
                <span className="text-[12.5px] font-bold">{time}</span>
              </div>
            ))}
            <span className="text-[11.5px] text-text-tertiary leading-relaxed">
              Withdrawal requests are held as Pending until an admin reviews and approves them — you&rsquo;ll see the status update here.
            </span>
          </div>
        </div>
      )}

      {tab === "History" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-full border text-xs whitespace-nowrap ${
                  filter === f ? "border-accent bg-accent/15 text-accent font-bold" : "border-border-subtle text-text-secondary font-semibold"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border-subtle bg-surface px-3.5 py-8 text-center text-text-tertiary text-[13px]">
              No transactions match this filter.
            </div>
          ) : (
            <>
              {/* mobile: card list */}
              <div className="flex flex-col gap-2.5 sm:hidden">
                {filtered.map((t) => (
                  <div key={t.id} className="flex flex-col gap-2 p-3.5 rounded-xl border border-border-subtle bg-surface">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13px] font-semibold">{t.type}</span>
                        <span className="text-[11px] text-text-tertiary">{dateTime(t.createdAt)}</span>
                      </div>
                      <span className={`nums text-[14px] font-bold whitespace-nowrap flex-shrink-0 ${t.amount < 0 ? "text-text" : "text-positive"}`}>
                        {signedMoney(t.amount, t.currencySymbol)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle">
                      <span className="nums text-[11px] text-text-tertiary truncate">{t.reference}</span>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>

              {/* desktop: table */}
              <div className="hidden sm:block rounded-2xl border border-border-subtle bg-surface overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {["Transaction ID", "Date/Time", "Type", "Amount", "Status", "Reference"].map((h) => (
                        <th key={h} className="text-left text-[10.5px] font-bold text-text-tertiary uppercase tracking-wide px-3.5 pb-2.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-t border-border-subtle">
                        <td className="nums px-3.5 py-3 text-[12.5px] text-text-secondary whitespace-nowrap">{t.id}</td>
                        <td className="px-3.5 py-3 text-[12.5px] text-text-secondary whitespace-nowrap">{dateTime(t.createdAt)}</td>
                        <td className="px-3.5 py-3 text-[12.5px] font-semibold whitespace-nowrap">{t.type}</td>
                        <td className={`nums px-3.5 py-3 text-[12.5px] font-bold whitespace-nowrap ${t.amount < 0 ? "text-text" : "text-positive"}`}>
                          {signedMoney(t.amount, t.currencySymbol)}
                        </td>
                        <td className="px-3.5 py-3">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="nums px-3.5 py-3 text-[11.5px] text-text-tertiary whitespace-nowrap">{t.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
