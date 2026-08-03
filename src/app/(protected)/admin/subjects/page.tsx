import { prisma } from "@/lib/prisma";
import { StatCard, PageHeader, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, ActionBtn, EmptyState } from "@/components/ui/shared";
import { AddItemModal } from "@/components/ui/AddItemModal";
import { Plus, BookMarked, BookOpen, Award, Search } from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ExportMenu } from "@/components/ui/ExportMenu";


export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({
    include: { class: true, teacher: { include: { user: true } } },
    orderBy: [{ class: { level_order: "asc" } }, { name: "asc" }],
  });

  const classes = await prisma.class.findMany({ orderBy: { level_order: "asc" } });

  async function createSubject(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const class_id = formData.get("class_id") as string;
    
    if (!class_id) return;

    await prisma.subject.create({
      data: {
        name,
        code,
        type: "THEORY",
        max_marks: 100,
        pass_marks: 40,
        class: { connect: { id: class_id } }
      }
    });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/subjects");
  }

  const theoryCount = subjects.filter(s => s.type === "THEORY").length;
  const practicalCount = subjects.filter(s => s.type === "PRACTICAL").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Subjects" description="Manage all subjects, their classes, teachers, and marks structure.">
        <ExportMenu type="subjects" />
        <AddItemModal title="Add Subject" buttonText="Add Subject">
          <form action={createSubject} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Subject Name *</label>
                <input type="text" name="name" required placeholder="e.g. Arabic Grammar" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Subject Code *</label>
                <input type="text" name="code" required placeholder="e.g. ARB101" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium text-foreground">Class *</label>
                <select name="class_id" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.display_name} {c.section}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" className="px-4 py-2 text-sm font-semibold border border-border rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">Save Subject</button>
            </div>
          </form>
        </AddItemModal>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Subjects" value={subjects.length} icon={BookMarked}
          iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Theory Subjects" value={theoryCount} icon={BookOpen}
          iconBg="bg-blue-50" iconColor="text-blue-600" badge="Theory" badgeColor="text-blue-700 bg-blue-100" />
        <StatCard title="Practical Subjects" value={practicalCount} icon={Award}
          iconBg="bg-violet-50" iconColor="text-violet-600" badge="Practical" badgeColor="text-violet-700 bg-violet-100" />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search subjects..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {subjects.length === 0 ? (
          <EmptyState icon={BookMarked} title="No subjects yet"
            description="Add subjects to classes to get started." />
        ) : (
          <>
            <TableWrapper>
              <Table>
                <Thead cols={["Subject", "Code", "Class", "Teacher", "Marks", "Type", ""]} />
                <Tbody>
                  {subjects.map(sub => (
                    <Tr key={sub.id}>
                      <Td>
                        <p className="font-semibold text-foreground text-sm">{sub.name}</p>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg">{sub.code}</span>
                      </Td>
                      <Td>
                        <p className="text-sm text-foreground">{sub.class.display_name}</p>
                        <p className="text-xs text-muted-foreground">Section {sub.class.section}</p>
                      </Td>
                      <Td>
                        <p className="text-sm text-foreground">
                          {sub.teacher?.user?.name ?? sub.teacher?.user?.email?.split("@")[0] ?? "—"}
                        </p>
                      </Td>
                      <Td>
                        <p className="text-sm text-foreground font-medium">{sub.max_marks} max</p>
                        <p className="text-xs text-muted-foreground">{sub.pass_marks} pass</p>
                      </Td>
                      <Td>
                        <StatusBadge
                          label={sub.type}
                          type={sub.type === "THEORY" ? "info" : "warning"}
                        />
                      </Td>
                      <Td className="text-right">
                          <DropdownMenu id={sub.id} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableWrapper>
            <div className="px-6 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              Showing {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
