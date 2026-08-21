import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { submitSupportMessage } from "@/lib/store";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const subject = String(body?.subject ?? "").trim();
  const message = String(body?.message ?? "").trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Please fill in every field" }, { status: 400 });
  }

  const msg = await submitSupportMessage({ name, email, subject, message, userId: userId ?? undefined });
  return NextResponse.json({ message: msg });
}
