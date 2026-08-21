const STYLES: Record<string, string> = {
  Successful: "bg-positive/15 text-positive",
  Won: "bg-positive/15 text-positive",
  Approved: "bg-positive/15 text-positive",
  Active: "bg-positive/15 text-positive",
  Open: "bg-positive/15 text-positive",

  Pending: "bg-warning/15 text-warning",
  "Pending Verification": "bg-warning/15 text-warning",
  Processing: "bg-accent/15 text-accent",
  Suspended: "bg-warning/15 text-warning",

  Failed: "bg-negative/15 text-negative",
  Rejected: "bg-negative/15 text-negative",
  Lost: "bg-negative/15 text-negative",

  Reversed: "bg-text-tertiary/15 text-text-secondary",
  Cancelled: "bg-text-tertiary/15 text-text-secondary",
  Void: "bg-text-tertiary/15 text-text-secondary",
  Refunded: "bg-accent/15 text-accent",
  Closed: "bg-text-tertiary/15 text-text-secondary",
  "Self-Excluded": "bg-text-tertiary/15 text-text-secondary",

  Scheduled: "bg-warning/15 text-warning",
  Live: "bg-negative/15 text-negative",
  Finished: "bg-positive/15 text-positive",
};

export function StatusBadge({ status, minWidth }: { status: string; minWidth?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10.5px] font-bold whitespace-nowrap ${
        minWidth ? "min-w-[66px]" : ""
      } ${STYLES[status] ?? "bg-text-tertiary/15 text-text-secondary"}`}
    >
      {status}
    </span>
  );
}
