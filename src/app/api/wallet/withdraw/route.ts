import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { requestWithdrawal } from "@/lib/store";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please log in to withdraw" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const destination = String(body?.destination ?? "Bank •••• 4821");
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
  }
  try {
    const tx = await requestWithdrawal(userId, amount, destination);
    return NextResponse.json({ transaction: tx });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not request withdrawal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
