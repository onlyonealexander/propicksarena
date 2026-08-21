import { getSiteSettings } from "@/lib/store";
import { SiteSettingsClient } from "@/components/SiteSettingsClient";

export default async function AdminSettingsPage() {
  return <SiteSettingsClient settings={await getSiteSettings()} />;
}
