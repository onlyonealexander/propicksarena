import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { setPaymentMethod, type PaymentMethodKey } from "@/lib/store";

const VALID_KEYS: PaymentMethodKey[] = ["bitcoin", "usdt", "paypal", "skrill", "revolut"];

export async function POST(request: Request, ctx: RouteContext<"/api/admin/payment-methods/[key]">) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { key } = await ctx.params;
  if (!VALID_KEYS.includes(key as PaymentMethodKey)) {
    return NextResponse.json({ error: "Unknown payment method" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const label = String(body?.label ?? "").trim();
  const details = String(body?.details ?? "").trim();
  const network = body?.network ? String(body.network).trim() : undefined;
  const instructions = String(body?.instructions ?? "").trim();
  const enabled = Boolean(body?.enabled);

  if (!label || !details) {
    return NextResponse.json({ error: "Label and account details are required" }, { status: 400 });
  }

  try {
    await setPaymentMethod(key as PaymentMethodKey, { label, details, network, instructions, enabled }, admin.name);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update payment method";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
