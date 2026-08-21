import { listCustomMarkets } from "@/lib/store";
import { SpecialMarketsClient } from "@/components/SpecialMarketsClient";

export default async function AdminSpecialMarketsPage() {
  return <SpecialMarketsClient markets={await listCustomMarkets()} />;
}
