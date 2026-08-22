"use client";

import { useState } from "react";

type Challenge = { a: number; b: number };

function randomChallenge(): Challenge {
  return { a: 2 + Math.floor(Math.random() * 8), b: 2 + Math.floor(Math.random() * 8) };
}

// The app's one human-verification mechanism — a lightweight arithmetic
// check — shared by every flow that needs it (deposits, withdrawals) so
// there's a single place to swap in a real CAPTCHA/Turnstile later.
export function useHumanVerification() {
  const [challenge, setChallenge] = useState<Challenge>(randomChallenge);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setChallenge(randomChallenge());
    setInput("");
    setError(null);
  }

  function verify(): boolean {
    const ok = parseInt(input, 10) === challenge.a + challenge.b;
    if (!ok) {
      setError("That's not quite right — try again.");
      setChallenge(randomChallenge());
      setInput("");
    }
    return ok;
  }

  return { challenge, input, setInput, error, verify, reset };
}

export function HumanVerificationCard({
  challenge,
  input,
  onChange,
  error,
}: {
  challenge: Challenge;
  input: string;
  onChange: (v: string) => void;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">Quick human check</span>
        <p className="m-0 text-[12.5px] text-text-tertiary leading-relaxed">
          Just confirming there&rsquo;s a person on the other end before we continue.
        </p>
      </div>
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-surface-2 border border-border-subtle">
        <span className="text-[11.5px] text-text-tertiary font-semibold">
          What is {challenge.a} + {challenge.b}?
        </span>
        <input
          value={input}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          autoFocus
          className="px-3.5 py-3 rounded-lg border border-border bg-bg text-text text-lg font-bold font-display outline-none focus:border-accent"
        />
      </div>
      {error && <span className="text-xs text-negative font-semibold">{error}</span>}
    </div>
  );
}
