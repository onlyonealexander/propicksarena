import { listUsers, getBalances, userSummary, getUserTransactions, listBets } from "@/lib/store";
import { UsersClient } from "@/components/UsersClient";

export default async function AdminUsersPage() {
  const allUsers = await listUsers();
  const users = await Promise.all(
    allUsers.map(async (u) => {
      const balances = await getBalances(u.id);
      const summary = await userSummary(u.id);
      const transactions = await getUserTransactions(u.id);
      const bets = await listBets(u.id);
      return {
        ...u,
        balance: balances.available,
        deposits: summary.deposits,
        withdrawals: summary.withdrawals,
        betsCount: summary.betsCount,
        transactions: transactions.slice(0, 5),
        bets: bets.slice(0, 5),
      };
    })
  );

  return <UsersClient users={users} />;
}
