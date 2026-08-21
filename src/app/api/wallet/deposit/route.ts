import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { requestDeposit } from "@/lib/store";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please log in to deposit" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const method = String(body?.method ?? "Bank Transfer");
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
  }
  const tx = await requestDeposit(userId, amount, method);
  return NextResponse.json({ transaction: tx });
}
