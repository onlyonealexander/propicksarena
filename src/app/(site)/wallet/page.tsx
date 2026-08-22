import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getBalances, getUserTransactions, getPaymentMethods, getUser } from "@/lib/store";
import { WalletClient } from "@/components/WalletClient";
import { money } from "@/lib/format";

export default async function WalletPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/wallet");
  const user = (await getUser(userId))!;
  const balances = await getBalances(userId);
  const transactions = await getUserTransactions(userId);
  const methods = await getPaymentMethods();
  const symbol = user.currencySymbol;

  const deposits = transactions.filter((t) => t.type === "Deposit" && t.status === "Successful").reduce((a, t) => a + t.amount, 0);
  const withdrawals = transactions.filter((t) => t.type === "Withdrawal" && t.status === "Successful").reduce((a, t) => a + Math.abs(t.amount), 0);

  return (
    <div className="max-w-[1180px] w-full mx-auto px-6 md:px-8 py-8 flex flex-col gap-7">
      <div>
        <h1 className="m-0 mb-1 font-display text-2xl font-bold">Wallet</h1>
        <p className="m-0 text-[13.5px] text-text-tertiary">Manage your deposits, withdrawals and transaction history.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex flex-col gap-2 p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.03_195)] to-[oklch(0.19_0.02_250)] border border-border-subtle min-w-0">
          <span className="text-[11.5px] text-text-secondary font-semibold">Available Balance</span>
          <span className="nums text-lg sm:text-2xl font-bold truncate">{money(balances.available, symbol)}</span>
        </div>
        <div className="flex flex-col gap-2 p-3.5 sm:p-5 rounded-2xl bg-surface border border-border-subtle min-w-0">
          <span className="text-[11.5px] text-text-tertiary font-semibold">Pending Balance</span>
          <span className="nums text-lg sm:text-[22px] font-bold text-warning truncate">{money(balances.pending, symbol)}</span>
        </div>
        <div className="flex flex-col gap-2 p-3.5 sm:p-5 rounded-2xl bg-surface border border-border-subtle min-w-0">
          <span className="text-[11.5px] text-text-tertiary font-semibold">Total Deposits</span>
          <span className="nums text-lg sm:text-[22px] font-bold truncate">{money(deposits, symbol)}</span>
        </div>
        <div className="flex flex-col gap-2 p-3.5 sm:p-5 rounded-2xl bg-surface border border-border-subtle min-w-0">
          <span className="text-[11.5px] text-text-tertiary font-semibold">Total Withdrawals</span>
          <span className="nums text-lg sm:text-[22px] font-bold truncate">{money(withdrawals, symbol)}</span>
        </div>
      </div>

      <WalletClient transactions={transactions} available={balances.available} methods={methods} currencySymbol={symbol} />
    </div>
  );
}
