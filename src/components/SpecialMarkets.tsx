import { listCustomMarkets } from "@/lib/store";
import { OddsButton } from "./OddsButton";

export async function SpecialMarkets() {
  const markets = (await listCustomMarkets()).filter((m) => m.status === "Open");
  if (markets.length === 0) return null;

  return (
    <section id="special" className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/15 text-warning text-[11px] font-bold uppercase tracking-wide">
          Special
        </span>
        <h2 className="m-0 font-display text-[17px] font-bold">Featured Bets</h2>
      </div>
      <div className="flex flex-col gap-3">
        {markets.map((m) => (
          <div key={m.id} className="flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.03_195)] to-[oklch(0.19_0.02_250)] border border-border-subtle">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-accent font-semibold">{m.sport}</span>
              <span className="text-[14.5px] font-bold">{m.title}</span>
              {m.description && <span className="text-[12px] text-text-secondary leading-relaxed">{m.description}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {m.options.map((o) => (
                <OddsButton key={o.pick} matchId={m.id} matchLabel={m.title} market={m.sport} pick={o.pick} label={o.label} odds={o.odds} grow={false} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
