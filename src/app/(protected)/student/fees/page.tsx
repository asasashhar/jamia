import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StatCard, PageHeader, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, EmptyState } from "@/components/ui/shared";
import { Wallet, CheckCircle2, Clock, AlertCircle, Receipt, Download } from "lucide-react";


export default async function StudentFeesPage() {
  const session = await auth();
  const student = session?.user?.id ? await prisma.student.findUnique({
    where: { user_id: session.user.id },
    include: { feeRecords: { orderBy: { due_date: "desc" } } },
  }) : null;

  const fees = student?.feeRecords ?? [];
  const totalFees = fees.reduce((s, f) => s + f.total_amount, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paid_amount, 0);
  const outstanding = totalFees - totalPaid;
  const allPaid = outstanding === 0 && fees.length > 0;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Fee Status" description="Your fee payment history and outstanding dues." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Fees" value={fmt(totalFees)} icon={Wallet} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Total Paid" value={fmt(totalPaid)} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          badge="Cleared" badgeColor="text-emerald-700 bg-emerald-100" />
        <StatCard title="Outstanding" value={fmt(outstanding)} icon={outstanding > 0 ? AlertCircle : CheckCircle2}
          iconBg={outstanding > 0 ? "bg-red-50" : "bg-emerald-50"}
          iconColor={outstanding > 0 ? "text-red-600" : "text-emerald-600"}
          badge={outstanding > 0 ? "Due" : "Cleared"} badgeColor={outstanding > 0 ? "text-red-700 bg-red-100" : "text-emerald-700 bg-emerald-100"} />
      </div>

      {/* All cleared banner */}
      {allPaid && (
        <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-800">All Fees Cleared! 🎉</h3>
            <p className="text-sm text-emerald-700">You have no pending fee dues. Keep it up!</p>
          </div>
        </div>
      )}

      {/* Pending alert */}
      {outstanding > 0 && (
        <div className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-800">Outstanding Balance: {fmt(outstanding)}</h3>
            <p className="text-sm text-amber-700">Please pay your dues before the due date to avoid late fees.</p>
          </div>
        </div>
      )}

      {/* Fee table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h2 className="font-semibold text-foreground">Payment History</h2>
            <p className="text-sm text-muted-foreground">All fee records and receipts</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>

        {fees.length === 0 ? (
          <EmptyState icon={Wallet} title="No fee records" description="No fee records found for your account." />
        ) : (
          <>
            <TableWrapper>
              <Table>
                <Thead cols={["Fee Type", "Total", "Paid", "Balance", "Due Date", "Payment Date", "Receipt", "Status"]} />
                <Tbody>
                  {fees.map(fee => {
                    const balance = fee.total_amount - fee.paid_amount;
                    return (
                      <Tr key={fee.id}>
                        <Td><p className="font-medium text-foreground text-sm">{fee.fee_type}</p></Td>
                        <Td><p className="text-sm font-semibold text-foreground">{fmt(fee.total_amount)}</p></Td>
                        <Td><p className="text-sm text-emerald-600 font-medium">{fmt(fee.paid_amount)}</p></Td>
                        <Td><p className={`text-sm font-semibold ${balance > 0 ? "text-red-600" : "text-emerald-600"}`}>{fmt(balance)}</p></Td>
                        <Td><p className="text-sm text-foreground">{new Date(fee.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></Td>
                        <Td><p className="text-sm text-muted-foreground">{fee.payment_date ? new Date(fee.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p></Td>
                        <Td>
                          {fee.receipt_number ? (
                            <div className="flex items-center gap-1.5">
                              <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-mono text-xs text-muted-foreground">{fee.receipt_number}</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </Td>
                        <Td>
                          <StatusBadge label={fee.status}
                            type={fee.status === "PAID" ? "success" : fee.status === "OVERDUE" ? "danger" : fee.status === "PARTIAL" ? "info" : "warning"} />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableWrapper>
            <div className="px-6 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              {fees.length} fee record{fees.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
