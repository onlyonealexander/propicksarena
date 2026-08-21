"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentMethod } from "@/lib/store";

export function PaymentMethodsSettings({ methods }: { methods: PaymentMethod[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <span className="text-[13px] font-bold">Payment Methods</span>
        <p className="m-0 text-[11.5px] text-text-tertiary mt-1">
          These are the receiving details shown to users when they deposit, and the payout options offered for withdrawals.
        </p>
      </div>
      {methods.map((m) => (
        <MethodRow key={m.key} method={m} open={openKey === m.key} onToggle={() => setOpenKey(openKey === m.key ? null : m.key)} />
      ))}
    </div>
  );
}

function MethodRow({ method, open, onToggle }: { method: PaymentMethod; open: boolean; onToggle: () => void }) {
  const router = useRouter();
  const [label, setLabel] = useState(method.label);
  const [details, setDetails] = useState(method.details);
  const [network, setNetwork] = useState(method.network ?? "");
  const [instructions, setInstructions] = useState(method.instructions);
  const [enabled, setEnabled] = useState(method.enabled);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setSaved(false);
    await fetch(`/api/admin/payment-methods/${method.key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label, details, network: network || undefined, instructions, enabled }),
    });
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="border-t border-border-subtle first:border-t-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${method.enabled ? "bg-positive" : "bg-text-tertiary"}`}
            title={method.enabled ? "Enabled" : "Disabled"}
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold">
              {method.label}
              {method.network && <span className="text-text-tertiary font-normal"> · {method.network}</span>}
            </span>
            <span className="text-[11px] text-text-tertiary font-mono">{method.details}</span>
          </div>
        </div>
        <span className="text-text-tertiary flex-shrink-0" style={{ transform: `rotate(${open ? 90 : 0}deg)` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-3 px-5 pb-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Display Label" value={label} onChange={setLabel} />
            <Field label="Network (optional)" value={network} onChange={setNetwork} />
          </div>
          <Field label={method.key === "bitcoin" || method.key === "usdt" ? "Wallet Address" : "Account / Handle"} value={details} onChange={setDetails} mono />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-text-tertiary font-semibold">Instructions shown to users</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              className="px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-[12.5px] outline-none focus:border-accent resize-none"
            />
          </div>
          <label className="flex items-center gap-2 text-[12px] font-semibold">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Enabled — visible to users
          </label>
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={busy} className="px-4 py-2.5 rounded-lg bg-accent text-accent-fg font-bold text-[12.5px] disabled:opacity-50">
              {busy ? "Saving…" : "Save"}
            </button>
            {saved && <span className="text-xs text-positive font-semibold">Saved</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-text-tertiary font-semibold">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-[12.5px] outline-none focus:border-accent ${mono ? "nums" : ""}`}
      />
    </div>
  );
}
