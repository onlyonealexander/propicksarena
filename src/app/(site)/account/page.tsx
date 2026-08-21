import { redirect } from "next/navigation";
import { getCurrentUserId, clearCurrentUserId } from "@/lib/auth";
import { getUser, getBalances, getUserTransactions, listBets, addAudit } from "@/lib/store";
import { AccountClient } from "@/components/AccountClient";

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account");
  const user = (await getUser(userId))!;
  const balances = await getBalances(userId);
  const transactions = await getUserTransactions(userId);
  const bets = await listBets(userId);
  const params = await searchParams;
  const initialTab = params.tab === "history" ? "History" : "Overview";

  async function logout() {
    "use server";
    const uid = await getCurrentUserId();
    const current = uid ? await getUser(uid) : null;
    await clearCurrentUserId();
    if (current) await addAudit({ actor: current.name, action: "Signed out", target: "Propicks Arena", category: "Login" });
    redirect("/");
  }

  return (
    <div className="max-w-[1280px] w-full mx-auto px-6 md:px-8 py-8">
      <AccountClient user={user} balances={balances} transactions={transactions} bets={bets} initialTab={initialTab} logoutAction={logout} />
    </div>
  );
}
