import { prisma } from "@/lib/prisma";
import { StatCard, PageHeader, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, Avatar, ActionBtn, EmptyState } from "@/components/ui/shared";
import { AddItemModal } from "@/components/ui/AddItemModal";
import { Plus, Search, Users, UserCheck, Briefcase, Mail, Phone } from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ExportMenu } from "@/components/ui/ExportMenu";


export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true, subjects: true, classes: true },
    orderBy: { staff_id: "asc" },
  });

  async function createTeacher(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const title = formData.get("title") as string || "";
    const email = formData.get("email") as string;
    const designation = formData.get("designation") as string || "";
    const qualifications = formData.get("qualifications") as string || "";
    const salary = parseFloat(formData.get("salary") as string) || 0;

    if (!name || !email) return;
    
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const staff_id = `TCH-${randomSuffix}`;
    
    await prisma.teacher.create({
      data: {
        title,
        designation,
        qualifications,
        salary,
        status: "ACTIVE",
        staff_id,
        user: {
          create: {
            email,
            password: "password123",
            role: "TEACHER",
            name
          }
        }
      }
    });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/teachers");
  }

  const activeCount = teachers.filter(t => t.status === "ACTIVE").length;
  const onLeaveCount = teachers.filter(t => t.status === "ON_LEAVE").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Teachers" description="Manage staff records, assignments and payroll.">
        <ExportMenu type="teachers" />
        <AddItemModal title="Add Teacher" buttonText="Add Teacher">
          <form action={createTeacher} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Title</label>
                <select name="title" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="Maulana">Maulana</option>
                  <option value="Hafiz">Hafiz</option>
                  <option value="Mufti">Mufti</option>
                  <option value="Qari">Qari</option>
                  <option value="Alimah">Alimah</option>
                  <option value="Ustaza">Ustaza</option>
                  <option value="Mr">Mr.</option>
                  <option value="Mrs">Mrs.</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input type="text" name="name" required placeholder="e.g. Ahmad Reza" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Email Address *</label>
                <input type="email" name="email" required placeholder="ahmad@example.com" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <input type="tel" name="phone" placeholder="+91 xxxxx xxxxx" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Designation</label>
                <input type="text" name="designation" placeholder="e.g. Senior Arabic Teacher" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Qualifications</label>
                <input type="text" name="qualifications" placeholder="e.g. MA Islamic Studies" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium text-foreground">Join Date</label>
                <input type="date" name="join_date" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" className="px-4 py-2 text-sm font-semibold border border-border rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">Save Teacher</button>
            </div>
          </form>
        </AddItemModal>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Teachers" value={teachers.length} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Active" value={activeCount} icon={UserCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          badge="Active" badgeColor="text-emerald-700 bg-emerald-100" />
        <StatCard title="On Leave" value={onLeaveCount} icon={Briefcase} iconBg="bg-amber-50" iconColor="text-amber-600"
          badge={onLeaveCount > 0 ? "Absent" : "All Present"} badgeColor={onLeaveCount > 0 ? "text-amber-700 bg-amber-100" : "text-emerald-700 bg-emerald-100"} />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search teachers..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {teachers.length === 0 ? (
          <EmptyState icon={Users} title="No teachers yet" description="Add your first teacher to get started." />
        ) : (
          <>
            <TableWrapper>
              <Table>
                <Thead cols={["Teacher", "Staff ID", "Designation", "Contact", "Salary", "Subjects", "Status", ""]} />
                <Tbody>
                  {teachers.map(teacher => (
                    <Tr key={teacher.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={teacher.user.name ?? teacher.user.email} />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm">{teacher.title} {teacher.user.name ?? teacher.user.email.split("@")[0]}</p>
                            <p className="text-xs text-muted-foreground">{teacher.qualifications}</p>
                          </div>
                        </div>
                      </Td>
                      <Td><span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg">{teacher.staff_id}</span></Td>
                      <Td><p className="text-sm text-foreground">{teacher.designation}</p></Td>
                      <Td>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" /> {teacher.user.email}
                          </div>
                          {teacher.user.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" /> {teacher.user.phone}
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td><p className="text-sm font-medium text-foreground">₹{teacher.salary.toLocaleString("en-IN")}</p></Td>
                      <Td>
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {teacher.subjects.length} subjects
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge label={teacher.status === "ACTIVE" ? "Active" : "On Leave"}
                          type={teacher.status === "ACTIVE" ? "success" : "warning"} />
                      </Td>
                      <Td className="text-right">
                        <DropdownMenu id={teacher.id} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableWrapper>
            <div className="px-6 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              Showing {teachers.length} teacher{teachers.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
