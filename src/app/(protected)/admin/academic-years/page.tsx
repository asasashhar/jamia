import { prisma } from "@/lib/prisma";
import { AddItemModal } from "@/components/ui/AddItemModal";
import { StatCard, PageHeader, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, Avatar, ActionBtn, EmptyState } from "@/components/ui/shared";
import { CalendarDays, CheckCircle2, Clock, Plus, Search } from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ExportMenu } from "@/components/ui/ExportMenu";


export default async function AdminAcademicYearsPage() {
  async function createAcademicYear(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const start_date = new Date(formData.get("start_date") as string);
    const end_date = new Date(formData.get("end_date") as string);
    
    await prisma.academicYear.create({
      data: {
        year_name: name,
        start_date,
        end_date,
        is_active: false
      }
    });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/academic-years");
  }

  const years = await prisma.academicYear.findMany({
    include: { exams: true },
    orderBy: { start_date: "desc" },
  });

  const activeYear = years.find(y => y.is_active);

  return (
    <div className="space-y-6">
      <PageHeader title="Academic Years" description="Manage academic sessions, terms and exam schedules.">
        <ExportMenu type="academic-years" />
        <AddItemModal title="New Academic Year" buttonText="New Academic Year">
          <form action={createAcademicYear} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium text-foreground">Year Name *</label>
                <input type="text" name="name" required placeholder="e.g. 2024-2025" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Start Date *</label>
                <input type="date" name="start_date" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">End Date *</label>
                <input type="date" name="end_date" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" className="px-4 py-2 text-sm font-semibold border border-border rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">Save Year</button>
            </div>
          </form>
        </AddItemModal>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Years" value={years.length} icon={CalendarDays}
          iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Active Year" value={activeYear?.year_name ?? "None"} icon={CheckCircle2}
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
          badge="Current" badgeColor="text-emerald-700 bg-emerald-100" />
        <StatCard title="Total Exams" value={years.reduce((s, y) => s + y.exams.length, 0)} icon={Clock}
          iconBg="bg-blue-50" iconColor="text-blue-600" />
      </div>

      {/* Year cards */}
      {years.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <EmptyState icon={CalendarDays} title="No academic years yet"
            description="Create your first academic year to get started." />
        </div>
      ) : (
        <div className="space-y-4">
          {years.map((year) => (
            <div key={year.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden card-hover">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 ${year.is_active ? "border-l-4 border-l-primary" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${year.is_active ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground text-lg">{year.year_name}</h3>
                      {year.is_active && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          ✓ Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(year.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      {" — "}
                      {new Date(year.end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:flex-shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{year.exams.length}</p>
                    <p className="text-xs text-muted-foreground">Exams</p>
                  </div>
                    <DropdownMenu id={year.id} />
                </div>
              </div>
              {year.exams.length > 0 && (
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                  {year.exams.map(exam => (
                    <span key={exam.id} className="text-xs px-2.5 py-1 bg-muted rounded-full text-muted-foreground font-medium">
                      {exam.name} · {exam.term}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
