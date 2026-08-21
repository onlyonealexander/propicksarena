import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { createCustomMarket, type CustomMarketOption } from "@/lib/store";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const sport = String(body?.sport ?? "").trim();
  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const options: CustomMarketOption[] = Array.isArray(body?.options)
    ? body.options
        .map((o: CustomMarketOption, i: number) => ({
          pick: String(o.pick ?? String.fromCharCode(97 + i)),
          label: String(o.label ?? "").trim(),
          odds: Number(o.odds),
        }))
        .filter((o: CustomMarketOption) => o.label && o.odds > 1)
    : [];

  if (!sport || !title || options.length < 2) {
    return NextResponse.json({ error: "Sport, title, and at least two options are required" }, { status: 400 });
  }

  const market = await createCustomMarket({ sport, title, description, options }, admin.name);
  return NextResponse.json({ market });
}
