import { NextResponse } from "next/server";
import { setCurrentUserId } from "@/lib/auth";
import { createUser } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const username = String(body?.username ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const password = String(body?.password ?? "");

  if (!name || !username || !email || !phone || !password) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  try {
    const user = await createUser({ name, username, email, phone, password });
    await setCurrentUserId(user.id);
    return NextResponse.json({ user: { id: user.id, name: user.name } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create your account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
