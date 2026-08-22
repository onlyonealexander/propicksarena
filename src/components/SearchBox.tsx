"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Result = { label: string; sub: string; href: string };

export function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        aria-label="Search"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 10);
        }}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-border-subtle bg-surface text-text-secondary flex-shrink-0"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </button>

      {open && (
        <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-[64px] sm:top-11 w-auto sm:w-[320px] max-w-full max-h-[min(400px,calc(100vh-84px))] flex flex-col rounded-2xl border border-border bg-surface shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50">
          <div className="p-2.5 border-b border-border-subtle flex-shrink-0">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams, matches…"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[13px] outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {loading && <div className="px-4 py-6 text-center text-[12.5px] text-text-tertiary">Searching…</div>}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <div className="px-4 py-6 text-center text-[12.5px] text-text-tertiary">No matches found for &ldquo;{query}&rdquo;</div>
            )}
            {!loading && query.trim().length < 2 && (
              <div className="px-4 py-6 text-center text-[12.5px] text-text-tertiary">Type at least 2 characters</div>
            )}
            {results.map((r, i) => (
              <button key={i} onClick={() => go(r.href)} className="w-full flex flex-col items-start gap-0.5 px-4 py-2.5 text-left hover:bg-surface-2 border-t border-border-subtle first:border-t-0">
                <span className="text-[13px] font-semibold">{r.label}</span>
                <span className="text-[11px] text-text-tertiary">{r.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
