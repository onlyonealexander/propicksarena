import { DEFAULT_CURRENCY } from "./currencies";

// `symbol` should always come from the specific account/transaction being
// displayed — see lib/currencies.ts. The default here only covers the rare
// case of rendering an amount with no currency context at all (e.g. a
// logged-out shell), and intentionally reuses the platform's single named
// default rather than a symbol hardcoded again at each call site.
export function money(n: number, symbol: string = DEFAULT_CURRENCY.symbol): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}${symbol}${Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function signedMoney(n: number, symbol: string = DEFAULT_CURRENCY.symbol): string {
  return `${n < 0 ? "-" : "+"}${money(Math.abs(n), symbol)}`;
}

// Masks a wallet address / tag / account identifier for on-screen review —
// keeps just enough of each end to be recognizable, hides the rest.
export function maskDestination(value: string): string {
  const v = value.trim();
  if (v.length <= 3) return "*".repeat(v.length || 1);
  return `${v.slice(0, 1)}${"*".repeat(4)}${v.slice(-2)}`;
}

export function maskEmail(value: string): string {
  const v = value.trim();
  const at = v.indexOf("@");
  if (at <= 0) return maskDestination(v);
  const local = v.slice(0, at);
  const domain = v.slice(at);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(3)}${domain}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function kickoffLabel(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now.getTime() + 86400000);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const date = isToday ? "Today" : isTomorrow ? "Tomorrow" : d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}
