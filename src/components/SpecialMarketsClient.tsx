"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomMarket } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { dateTime } from "@/lib/format";
import { SPORTS } from "@/lib/otherSports";

type DraftOption = { label: string; odds: string };

export function SpecialMarketsClient({ markets }: { markets: CustomMarket[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [sport, setSport] = useState("Football");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<DraftOption[]>([
    { label: "", odds: "" },
    { label: "", odds: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settleTarget, setSettleTarget] = useState<CustomMarket | null>(null);
  const [settlePick, setSettlePick] = useState<string | null>(null);
  const [settling, setSettling] = useState(false);

  function updateOption(i: number, field: keyof DraftOption, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)));
  }
  function addOption() {
    setOptions((prev) => [...prev, { label: "", odds: "" }]);
  }
  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function createMarket() {
    setError(null);
    const cleanOptions = options
      .map((o, i) => ({ pick: String.fromCharCode(97 + i), label: o.label.trim(), odds: parseFloat(o.odds) }))
      .filter((o) => o.label && o.odds > 1);
    if (!title.trim() || cleanOptions.length < 2) {
      setError("Add a title and at least two valid options (label + odds above 1.00).");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/custom-markets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sport, title, description, options: cleanOptions }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create market");
      return;
    }
    setShowForm(false);
    setTitle("");
    setDescription("");
    setOptions([{ label: "", odds: "" }, { label: "", odds: "" }]);
    router.refresh();
  }

  async function setStatus(id: string, status: "Open" | "Suspended" | "Closed") {
    await fetch(`/api/admin/custom-markets/${id}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function settle() {
    if (!settleTarget || !settlePick) return;
    setSettling(true);
    await fetch(`/api/admin/custom-markets/${settleTarget.id}/settle`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ winningPick: settlePick }),
    });
    setSettling(false);
    setSettleTarget(null);
    setSettlePick(null);
    router.refresh();
  }

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-border-subtle">
        <div>
          <h1 className="m-0 font-display text-xl font-bold">Special Markets</h1>
          <span className="text-xs text-text-tertiary">Create custom bets on anything — settle with the real, verified outcome once it's known</span>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="self-start sm:self-auto flex-shrink-0 px-4 py-2.5 rounded-lg bg-accent text-accent-fg font-bold text-[12.5px]">
          {showForm ? "Cancel" : "+ New Special Market"}
        </button>
      </header>

      <div className="flex flex-col gap-5 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-[900px]">
        {showForm && (
          <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-surface border border-border-subtle">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-text-tertiary font-semibold">Sport / Category</label>
                <select value={sport} onChange={(e) => setSport(e.target.value)} className="px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-[12.5px] outline-none focus:border-accent">
                  {SPORTS.map((s) => (
                    <option key={s.id} value={s.label}>
                      {s.label}
                    </option>
                  ))}
                  <option value="Special">Special / Promo</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-text-tertiary font-semibold">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-[12.5px] outline-none focus:border-accent" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-text-tertiary font-semibold">Description (shown to users)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-[12.5px] outline-none focus:border-accent resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-text-tertiary font-semibold">Options</label>
              {options.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={o.label}
                    onChange={(e) => updateOption(i, "label", e.target.value)}
                    placeholder={`Option ${i + 1} label`}
                    className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-[12.5px] outline-none focus:border-accent"
                  />
                  <input
                    value={o.odds}
                    onChange={(e) => updateOption(i, "odds", e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="Odds"
                    className="w-24 px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-[12.5px] outline-none focus:border-accent nums"
                  />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="px-2 text-text-tertiary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addOption} className="self-start text-xs font-bold text-accent">
                + Add option
              </button>
            </div>
            {error && <span className="text-xs text-negative font-semibold">{error}</span>}
            <button onClick={createMarket} disabled={busy} className="self-start px-5 py-2.5 rounded-lg bg-accent text-accent-fg font-bold text-[12.5px] disabled:opacity-50">
              {busy ? "Creating…" : "Create Market"}
            </button>
          </div>
        )}

        <div className="flex flex-col rounded-2xl border border-border-subtle bg-surface overflow-hidden">
          {markets.map((m) => (
            <div key={m.id} className="flex flex-col gap-2.5 px-5 py-4 border-t border-border-subtle first:border-t-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[11px] text-text-tertiary font-semibold">
                    {m.sport} &middot; {dateTime(m.createdAt)} &middot; by {m.createdBy}
                  </span>
                  <span className="text-[13.5px] font-bold">{m.title}</span>
                </div>
                <StatusBadge status={m.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                {m.options.map((o) => (
                  <span
                    key={o.pick}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      m.winningPick === o.pick ? "border-positive bg-positive/15 text-positive" : "border-border-subtle text-text-secondary"
                    }`}
                  >
                    {o.label} &middot; {o.odds.toFixed(2)}
                  </span>
                ))}
              </div>
              {m.status !== "Settled" ? (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setStatus(m.id, m.status === "Suspended" ? "Open" : "Suspended")}
                    className="px-3 py-1.5 rounded-md border border-border text-[11px] font-semibold text-text-secondary"
                  >
                    {m.status === "Suspended" ? "Resume" : "Suspend"}
                  </button>
                  <button onClick={() => setStatus(m.id, "Closed")} className="px-3 py-1.5 rounded-md border border-border text-[11px] font-semibold text-text-secondary">
                    Close Betting
                  </button>
                  <button
                    onClick={() => {
                      setSettleTarget(m);
                      setSettlePick(null);
                    }}
                    className="px-3 py-1.5 rounded-md border border-positive bg-positive/15 text-positive text-[11px] font-bold"
                  >
                    Settle With Real Result
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-text-tertiary">
                  Settled {m.settledAt ? dateTime(m.settledAt) : ""} by {m.settledBy}
                </span>
              )}
            </div>
          ))}
          {markets.length === 0 && <div className="px-5 py-10 text-center text-text-tertiary text-[13px]">No special markets yet.</div>}
        </div>
      </div>

      {settleTarget && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm flex flex-col gap-4 p-6 rounded-2xl bg-surface border border-border">
            <span className="text-[14px] font-bold">Settle: {settleTarget.title}</span>
            <p className="m-0 text-[12px] text-text-tertiary leading-relaxed">
              Select the option that actually happened, based on the real, verified outcome. This is final and gets written to the audit log.
            </p>
            <div className="flex flex-col gap-2">
              {settleTarget.options.map((o) => (
                <button
                  key={o.pick}
                  onClick={() => setSettlePick(o.pick)}
                  className={`px-3.5 py-2.5 rounded-lg border text-[13px] font-semibold text-left ${
                    settlePick === o.pick ? "border-positive bg-positive/15 text-positive" : "border-border-subtle bg-surface-2 text-text"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setSettleTarget(null);
                  setSettlePick(null);
                }}
                className="flex-1 py-2.5 rounded-lg border border-border text-[13px] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={settle}
                disabled={!settlePick || settling}
                className="flex-1 py-2.5 rounded-lg bg-positive text-accent-fg font-bold text-[13px] disabled:opacity-50"
              >
                {settling ? "Settling…" : "Confirm Outcome"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

