"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How long does a deposit take to reflect?",
    a: "Once you send the bank transfer with your reference code, our team usually confirms it within a few minutes during business hours (9am–9pm WAT), and always same-day.",
  },
  {
    q: "Why do I need to pass a human check before depositing?",
    a: "It's a quick arithmetic check that stops automated bots from spamming deposit requests — it takes two seconds and doesn't collect any personal data.",
  },
  {
    q: "How do withdrawals work?",
    a: "Request a withdrawal from your Wallet page. It shows as Pending while our finance team reviews and releases it to your bank account — you'll see the status update live under Transaction History.",
  },
  {
    q: "How are bets settled?",
    a: "Football bets settle automatically off the real final score from our live data feed. No admin can hand-edit an individual bet's outcome — every settlement is written to the audit log.",
  },
  {
    q: "Can I set limits on my account?",
    a: "Yes — message us with 'Responsible Gaming' in the subject and we'll help you set a deposit limit or a self-exclusion period.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-2.5">
      {FAQS.map((f, i) => (
        <div key={i} className="rounded-xl border border-border-subtle bg-surface overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <span className="text-[13px] font-bold">{f.q}</span>
            <span className="text-text-tertiary flex-shrink-0" style={{ transform: `rotate(${open === i ? 45 : 0}deg)`, transition: "transform .15s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </button>
          {open === i && <p className="m-0 px-5 pb-4 text-[12.5px] text-text-secondary leading-relaxed">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
