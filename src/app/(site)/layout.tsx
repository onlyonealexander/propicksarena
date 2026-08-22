import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BetslipProvider } from "@/components/BetslipProvider";
import { getCurrentUserId } from "@/lib/auth";
import { getUser, getBalances, getSiteSettings } from "@/lib/store";
import { DEFAULT_CURRENCY } from "@/lib/currencies";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  const user = userId ? await getUser(userId) : null;
  const available = userId ? (await getBalances(userId)).available : 0;
  const siteSettings = await getSiteSettings();
  const currencySymbol = user?.currencySymbol ?? DEFAULT_CURRENCY.symbol;

  return (
    <BetslipProvider currencySymbol={currencySymbol}>
      <Header userName={user?.name ?? null} available={available} currencySymbol={currencySymbol} />
      <div className="flex-1 w-full flex flex-col">{children}</div>
      <Footer settings={siteSettings} />
    </BetslipProvider>
  );
}
