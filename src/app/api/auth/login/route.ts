import { NextResponse } from "next/server";
import { setCurrentUserId } from "@/lib/auth";
import { verifyCredentials, addAudit } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = String(body?.identifier ?? "").trim();
  const password = String(body?.password ?? "");
  const remember = body?.remember !== false;

  if (!identifier || !password) {
    return NextResponse.json({ error: "Enter your username/email and password." }, { status: 400 });
  }

  const user = await verifyCredentials(identifier, password);
  if (!user) {
    return NextResponse.json({ error: "Incorrect username/email or password." }, { status: 401 });
  }

  await setCurrentUserId(user.id, remember);
  await addAudit({ actor: user.name, action: "Signed in", target: "Propicks Arena", category: "Login" });
  return NextResponse.json({ user: { id: user.id, name: user.name } });
}
