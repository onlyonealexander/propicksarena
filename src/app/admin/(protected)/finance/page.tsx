import { listAllTransactions, getPaymentMethods } from "@/lib/store";
import { FinanceClient } from "@/components/FinanceClient";

export default async function AdminFinancePage() {
  const transactions = await listAllTransactions();
  const methods = await getPaymentMethods();
  return <FinanceClient transactions={transactions} methods={methods} />;
}
