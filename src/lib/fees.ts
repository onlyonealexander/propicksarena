// Withdrawal fee math — kept separate from lib/store.ts (server-only, reads
// fs/sql) so this pure function can also run client-side for live fee
// previews without pulling server-only code into the browser bundle.

export type FeeSchedule = { feeType: "flat" | "percent"; feeValue: number };

export function computeWithdrawalFee(amount: number, schedule: FeeSchedule): number {
  if (!amount || amount <= 0) return 0;
  const raw = schedule.feeType === "percent" ? (amount * schedule.feeValue) / 100 : schedule.feeValue;
  return Math.round(Math.min(raw, amount) * 100) / 100;
}

export function feeLabel(schedule: FeeSchedule, symbol: string): string {
  if (schedule.feeType === "percent") return `${schedule.feeValue}% fee`;
  return `${symbol}${schedule.feeValue.toFixed(2)} flat fee`;
}
