"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/store";

export function SiteSettingsClient({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function field<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }
  function social<K extends keyof SiteSettings["socials"]>(key: K, value: string) {
    setForm((f) => ({ ...f, socials: { ...f.socials, [key]: value } }));
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    await fetch("/api/admin/site-settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-border-subtle">
        <div>
          <h1 className="m-0 font-display text-xl font-bold">Site Settings</h1>
          <span className="text-xs text-text-tertiary">Contact details and social links shown across the public site</span>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-2xl">
        <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-surface border border-border-subtle">
          <span className="text-[13px] font-bold">Support Contact</span>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Support Email" value={form.supportEmail} onChange={(v) => field("supportEmail", v)} />
            <Field label="Support Phone" value={form.supportPhone} onChange={(v) => field("supportPhone", v)} />
          </div>
          <Field label="Office Address" value={form.address} onChange={(v) => field("address", v)} />
        </div>

        <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-surface border border-border-subtle">
          <span className="text-[13px] font-bold">Social Links</span>
          <p className="m-0 text-[11.5px] text-text-tertiary">Leave any field blank to hide that icon from the footer.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Facebook" value={form.socials.facebook} onChange={(v) => social("facebook", v)} />
            <Field label="X / Twitter" value={form.socials.twitter} onChange={(v) => social("twitter", v)} />
            <Field label="Instagram" value={form.socials.instagram} onChange={(v) => social("instagram", v)} />
            <Field label="WhatsApp" value={form.socials.whatsapp} onChange={(v) => social("whatsapp", v)} />
            <Field label="TikTok" value={form.socials.tiktok} onChange={(v) => social("tiktok", v)} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-lg bg-accent text-accent-fg font-bold text-[12.5px] disabled:opacity-50">
            {busy ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span className="text-xs text-positive font-semibold">Saved — live on the site now</span>}
        </div>
      </div>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-text-tertiary font-semibold">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-[12.5px] outline-none focus:border-accent"
      />
    </div>
  );
}
