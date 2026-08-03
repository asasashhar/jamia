import { prisma } from "@/lib/prisma";
import { StatCard, PageHeader, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, Avatar, ActionBtn, EmptyState } from "@/components/ui/shared";
import { AddItemModal } from "@/components/ui/AddItemModal";
import { Plus, Wallet, CheckCircle2, Clock, AlertCircle, Search } from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ExportMenu } from "@/components/ui/ExportMenu";


export default async function AdminFeesPage() {
  const feeRecords = await prisma.feeRecord.findMany({
    include: { student: { include: { class: true } } },
    orderBy: { due_date: "desc" },
  });

  const students = await prisma.student.findMany({
    select: { id: true, first_name: true, last_name: true, enrollment_id: true }
  });

  async function createFee(formData: FormData) {
    "use server";
    const student_id = formData.get("student_id") as string;
    const fee_type = formData.get("fee_type") as string;
    const total_amount = parseFloat(formData.get("total_amount") as string);
    const due_date = new Date(formData.get("due_date") as string);
    
    if (!student_id || !fee_type || !total_amount || !due_date) return;

    await prisma.feeRecord.create({
      data: {
        student: { connect: { id: student_id } },
        fee_type,
        total_amount,
        paid_amount: 0,
        due_date,
        status: "PENDING"
      }
    });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/fees");
  }

  const totalCollected = feeRecords.reduce((sum, r) => sum + r.paid_amount, 0);
  const totalPending = feeRecords.filter(f => f.status === "PENDING").reduce((s, f) => s + (f.total_amount - f.paid_amount), 0);
  const totalOverdue = feeRecords.filter(f => f.status === "OVERDUE").reduce((s, f) => s + (f.total_amount - f.paid_amount), 0);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Fee Management" description="Track collections, pending dues and receipts.">
        <ExportMenu type="fees" />
        <AddItemModal title="Collect Fee" buttonText="Collect Fee">
          <form action={createFee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium text-foreground">Select Student *</label>
                <select name="student_id" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.enrollment_id})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Fee Type *</label>
                <select name="fee_type" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="TUITION">Tuition Fee</option>
                  <option value="EXAM">Exam Fee</option>
                  <option value="HOSTEL">Hostel Fee</option>
                  <option value="TRANSPORT">Transport Fee</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Total Amount (₹) *</label>
                <input type="number" name="total_amount" required placeholder="0.00" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Paid Amount (₹)</label>
                <input type="number" name="paid_amount" defaultValue={0} className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Due Date *</label>
                <input type="date" name="due_date" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" className="px-4 py-2 text-sm font-semibold border border-border rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">Collect Fee</button>
            </div>
          </form>
        </AddItemModal>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Collected" value={fmt(totalCollected)} icon={CheckCircle2}
          iconBg="bg-emerald-50" iconColor="text-emerald-600" badge="This Year" badgeColor="text-emerald-700 bg-emerald-100" />
        <StatCard title="Pending Dues" value={fmt(totalPending)} icon={Clock}
          iconBg="bg-amber-50" iconColor="text-amber-600" badge="Due Soon" badgeColor="text-amber-700 bg-amber-100" />
        <StatCard title="Overdue" value={fmt(totalOverdue)} icon={AlertCircle}
          iconBg="bg-red-50" iconColor="text-red-600" badge={totalOverdue > 0 ? "Action Needed" : "Clear"} badgeColor={totalOverdue > 0 ? "text-red-700 bg-red-100" : "text-emerald-700 bg-emerald-100"} />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search by student or receipt..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {feeRecords.length === 0 ? (
          <EmptyState icon={Wallet} title="No fee records yet" description="Start collecting fees to see records here." />
        ) : (
          <>
            <TableWrapper>
              <Table>
                <Thead cols={["Student", "Fee Type", "Amount", "Due Date", "Receipt", "Status", ""]} />
                <Tbody>
                  {feeRecords.map(fee => (
                    <Tr key={fee.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={`${fee.student.first_name} ${fee.student.last_name}`} size="sm" />
                          <div>
                            <p className="font-semibold text-foreground text-sm">{fee.student.first_name} {fee.student.last_name}</p>
                            <p className="text-xs text-muted-foreground">{fee.student.enrollment_id} · {fee.student.class.display_name}</p>
                          </div>
                        </div>
                      </Td>
                      <Td><p className="text-sm text-foreground">{fee.fee_type}</p></Td>
                      <Td>
                        <p className="text-sm font-semibold text-foreground">{fmt(fee.total_amount)}</p>
                        <p className="text-xs text-emerald-600">Paid: {fmt(fee.paid_amount)}</p>
                      </Td>
                      <Td><p className="text-sm text-foreground">{new Date(fee.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></Td>
                      <Td><span className="font-mono text-xs text-muted-foreground">{fee.receipt_number ?? "—"}</span></Td>
                      <Td>
                        <StatusBadge label={fee.status}
                          type={fee.status === "PAID" ? "success" : fee.status === "OVERDUE" ? "danger" : fee.status === "PARTIAL" ? "info" : "warning"} />
                      </Td>
                      <Td className="text-right">
                          <DropdownMenu id={fee.id} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableWrapper>
            <div className="px-6 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              Showing {feeRecords.length} records
            </div>
          </>
        )}
      </div>
    </div>
  );
}
