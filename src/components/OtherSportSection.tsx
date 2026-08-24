import { listOtherSportFixtures, SPORTS, type SportFixture } from "@/lib/otherSports";
import { getMarketStatus } from "@/lib/store";
import { OddsButton } from "./OddsButton";

export async function OtherSportSection({ sportId }: { sportId: string }) {
  const fixtures = listOtherSportFixtures(sportId);
  const label = SPORTS.find((s) => s.id === sportId)?.label ?? sportId;
  const scheduled = fixtures.filter((f) => f.status === "scheduled");
  const finished = fixtures.filter((f) => f.status === "finished");

  return (
    <div className="flex flex-col gap-9">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[11px] font-bold uppercase tracking-wide">
          Scheduled Markets
        </span>
        <span className="text-[12.5px] text-text-tertiary font-semibold">{label}</span>
      </div>

      <section className="flex flex-col gap-5">
        <h2 className="m-0 font-display text-[17px] font-bold">Upcoming {label} Markets</h2>
        <div className="flex flex-col gap-3">
          {scheduled.map((f) => (
            <FixtureCard key={f.id} f={f} sportLabel={label} />
          ))}
          {scheduled.length === 0 && <p className="text-text-tertiary text-[13.5px]">No upcoming {label.toLowerCase()} fixtures right now.</p>}
        </div>
      </section>

      {finished.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <h2 className="m-0 font-display text-[17px] font-bold">Recent Results</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {finished.map((f) => (
              <div key={f.id} className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[11px] text-text-tertiary font-semibold">{f.competition}</span>
                <span className="text-[12.5px] font-semibold">{f.title}</span>
                <span className="text-[12px] text-positive font-bold">{f.finalResult}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

async function FixtureCard({ f, sportLabel }: { f: SportFixture; sportLabel: string }) {
  const marketStatus = await getMarketStatus(f.id);
  const disabled = marketStatus !== "Open";
  const wide = f.options.length > 3;
  const league = `${sportLabel}: ${f.competition}`;
  return (
    <div className="flex flex-col gap-3 p-[18px] rounded-2xl bg-surface border border-border-subtle">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[11px] text-text-tertiary font-semibold">{f.competition}</span>
          <span className="text-[14px] font-bold truncate">{f.title}</span>
        </div>
        <span className="text-[11.5px] text-text-tertiary font-semibold flex-shrink-0">{f.startLabel}</span>
      </div>
      <div className={wide ? "flex flex-col gap-2" : "flex gap-2"}>
        {f.options.map((o) => (
          <OddsButton
            key={o.pick}
            matchId={f.id}
            matchLabel={f.title}
            league={league}
            pick={o.pick}
            label={o.label}
            odds={o.odds}
            disabled={disabled}
            grow={!wide}
          />
        ))}
      </div>
    </div>
  );
}
