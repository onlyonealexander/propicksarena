import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { setSiteSettings, type SiteSettings } from "@/lib/store";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Malformed request" }, { status: 400 });

  const settings: SiteSettings = {
    supportEmail: String(body.supportEmail ?? "").trim(),
    supportPhone: String(body.supportPhone ?? "").trim(),
    address: String(body.address ?? "").trim(),
    socials: {
      facebook: String(body.socials?.facebook ?? "").trim(),
      twitter: String(body.socials?.twitter ?? "").trim(),
      instagram: String(body.socials?.instagram ?? "").trim(),
      whatsapp: String(body.socials?.whatsapp ?? "").trim(),
      tiktok: String(body.socials?.tiktok ?? "").trim(),
    },
  };

  if (!settings.supportEmail) {
    return NextResponse.json({ error: "Support email is required" }, { status: 400 });
  }

  await setSiteSettings(settings, admin.name);
  return NextResponse.json({ ok: true });
}
