import { prisma } from "@/lib/prisma";
import { StatCard, PageHeader, SectionCard, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, Avatar, ActionBtn, EmptyState } from "@/components/ui/shared";
import { AddItemModal } from "@/components/ui/AddItemModal";
import { Lock, Unlock, Plus, Search, Filter, GraduationCap, Users, UserCheck } from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ExportMenu } from "@/components/ui/ExportMenu";


export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    include: { class: true, user: true },
    orderBy: { first_name: "asc" },
  });

  const classes = await prisma.class.findMany({ orderBy: { level_order: "asc" } });

  async function createStudent(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const dob = new Date(formData.get("dob") as string);
    const father_name = formData.get("father_name") as string || "";
    const father_phone = formData.get("father_phone") as string || "";
    const mother_name = formData.get("mother_name") as string || "";
    const class_id = formData.get("class_id") as string;
    const address = formData.get("address") as string || "";

    if (!name || !class_id) return;
    
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const enrollment_id = `ENR-${randomSuffix}`;
    const email = `student${randomSuffix}@jamia.edu`;
    const [first, ...rest] = name.split(" ");
    
    await prisma.student.create({
      data: {
        first_name: first,
        last_name: rest.join(" ") || "",
        dob,
        guardian_name: father_name || mother_name,
        guardian_phone: father_phone,
        address,
        class: { connect: { id: class_id } },
        status: "ENROLLED",
        enrollment_id,
        user: {
          create: {
            email,
            password: "password123",
            role: "STUDENT",
            name
          }
        }
      }
    });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/students");
  }

  async function toggleProfileEdit(formData: FormData) {
    "use server";
    const student_id = formData.get("student_id") as string;
    const current = formData.get("current") === "true";
    await prisma.student.update({
      where: { id: student_id },
      data: { can_edit_profile: !current },
    });
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/students");
  }

  const enrolledCount = students.filter(s => s.status === "ENROLLED").length;
  const applicantCount = students.filter(s => s.status === "APPLICANT").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Students" description="Manage student records, enrollments and academic progress.">
        <AddItemModal title="Add Student" buttonText="Add Student">
          <form action={createStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input type="text" name="name" required placeholder="e.g. Ayesha Khan" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Date of Birth *</label>
                <input type="date" name="dob" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Father's Name</label>
                <input type="text" name="father_name" placeholder="Father's name" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Father's Phone</label>
                <input type="tel" name="father_phone" placeholder="+91 xxxxx xxxxx" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Mother's Name</label>
                <input type="text" name="mother_name" placeholder="Mother's name" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Class</label>
                <select name="class_id" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.display_name} {c.section}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium text-foreground">Complete Address</label>
                <textarea name="address" rows={2} placeholder="Full residential address" className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"></textarea>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" className="px-4 py-2 text-sm font-semibold border border-border rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">Save Student</button>
            </div>
          </form>
        </AddItemModal>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={students.length} icon={Users}
          iconBg="bg-primary/10" iconColor="text-primary" badge="All Time" badgeColor="text-muted-foreground bg-muted" />
        <StatCard title="Enrolled" value={enrolledCount} icon={UserCheck}
          iconBg="bg-emerald-50" iconColor="text-emerald-600" badge="Active" badgeColor="text-emerald-700 bg-emerald-100" />
        <StatCard title="Applicants" value={applicantCount} icon={GraduationCap}
          iconBg="bg-amber-50" iconColor="text-amber-600" badge="Pending" badgeColor="text-amber-700 bg-amber-100" />
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search students..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <ExportMenu type="students" />
          </div>
        </div>

        {students.length === 0 ? (
          <EmptyState icon={Users} title="No students yet" description="Add your first student to get started." />
        ) : (
          <>
            <TableWrapper>
              <Table>
                <Thead cols={["Student", "Class", "Guardian", "Status", "Profile Edit", "Actions"]} />
                <Tbody>
                  {students.map(student => (
                    <Tr key={student.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={`${student.first_name} ${student.last_name}`} />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-muted-foreground">{student.user.email}</p>
                            <p className="text-xs text-muted-foreground/70 font-mono">{student.enrollment_id}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <p className="font-medium text-foreground text-sm">{student.class.display_name}</p>
                        <p className="text-xs text-muted-foreground">Section {student.class.section}</p>
                      </Td>
                      <Td>
                        <p className="text-sm text-foreground">{student.guardian_name}</p>
                        <p className="text-xs text-muted-foreground">{student.guardian_phone}</p>
                      </Td>
                      <Td>
                        <StatusBadge
                          label={student.status}
                          type={student.status === "ENROLLED" ? "success" : student.status === "APPLICANT" ? "warning" : "neutral"}
                        />
                      </Td>
                      <Td>
                        <form action={toggleProfileEdit}>
                          <input type="hidden" name="student_id" value={student.id} />
                          <input type="hidden" name="current" value={student.can_edit_profile ? "true" : "false"} />
                          <button
                            type="submit"
                            title={student.can_edit_profile ? "Click to lock profile editing" : "Click to allow profile editing"}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                              student.can_edit_profile
                                ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 border border-red-500/15"
                            }`}
                          >
                            {student.can_edit_profile ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {student.can_edit_profile ? "Allowed" : "Locked"}
                          </button>
                        </form>
                      </Td>
                      <Td className="text-right">
                        <DropdownMenu id={student.id} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableWrapper>
            <div className="px-6 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              Showing {students.length} student{students.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
