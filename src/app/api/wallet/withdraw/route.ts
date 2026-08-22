import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { requestWithdrawal, type PaymentMethodKey } from "@/lib/store";

const VALID_METHODS: PaymentMethodKey[] = ["bitcoin", "usdt", "paypal", "skrill", "revolut"];

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please log in to withdraw" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const method = String(body?.method ?? "");
  const destination = String(body?.destination ?? "").trim();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
  }
  if (!VALID_METHODS.includes(method as PaymentMethodKey)) {
    return NextResponse.json({ error: "Choose a payout method" }, { status: 400 });
  }
  if (!destination) {
    return NextResponse.json({ error: "Enter your payment details" }, { status: 400 });
  }
  try {
    const tx = await requestWithdrawal(userId, { amount, method: method as PaymentMethodKey, destination });
    return NextResponse.json({ transaction: tx });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not request withdrawal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
