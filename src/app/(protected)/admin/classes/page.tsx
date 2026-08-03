import { prisma } from "@/lib/prisma";
import { StatCard, PageHeader, ActionBtn, EmptyState, ProgressBar } from "@/components/ui/shared";
import { AddItemModal } from "@/components/ui/AddItemModal";
import { Plus, BookOpen, Users, GraduationCap } from "lucide-react";
import { ExportMenu } from "@/components/ui/ExportMenu";


export default async function AdminClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      class_teacher: { include: { user: true } },
      subjects: true,
      students: true,
    },
    orderBy: { level_order: "asc" },
  });

  async function createClass(formData: FormData) {
    "use server";
    const display_name = formData.get("display_name") as string;
    const level_order = parseInt(formData.get("level_order") as string);
    const section = formData.get("section") as string || "";
    const max_students = parseInt(formData.get("max_students") as string) || 40;
    const class_teacher_id = formData.get("class_teacher_id") as string || null;
    
    await prisma.class.create({
      data: {
        name: `${display_name} ${section}`.trim(),
        display_name,
        level_order,
        section,
        max_students,
        ...(class_teacher_id ? { class_teacher: { connect: { id: class_teacher_id } } } : {})
      }
    });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/classes");
  }

  const totalSubjects = classes.reduce((s, c) => s + c.subjects.length, 0);

  const classColors = [
    "from-emerald-500 to-green-600",
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-amber-500 to-yellow-600",
    "from-rose-500 to-pink-600",
    "from-teal-500 to-cyan-600",
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Classes" description="Manage classes, sections and subject assignments.">
        <ExportMenu type="classes" />
        <AddItemModal title="Add Class" buttonText="Add Class">
          <form action={createClass} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Class Level (Order)</label>
                <input type="number" name="level_order" required placeholder="e.g. 1" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Display Name *</label>
                <input type="text" name="display_name" required placeholder="e.g. Class 1" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Section</label>
                <input type="text" name="section" placeholder="e.g. A" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Max Students</label>
                <input type="number" name="max_students" defaultValue={40} className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium text-foreground">Class Teacher</label>
                <select name="class_teacher_id" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select Teacher (Optional)</option>
                  <option value="1">Ustaza Ayesha</option>
                  <option value="2">Maulana Ahmad</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" className="px-4 py-2 text-sm font-semibold border border-border rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">Save Class</button>
            </div>
          </form>
        </AddItemModal>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Classes" value={classes.length} icon={BookOpen} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Total Subjects" value={totalSubjects} icon={GraduationCap} iconBg="bg-blue-50" iconColor="text-blue-600" />
      </div>

      {classes.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <EmptyState icon={BookOpen} title="No classes yet" description="Create your first class to get started." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {classes.map((cls, i) => {
            const occupancy = cls.max_students > 0 ? (cls.students.length / cls.max_students) * 100 : 0;
            const gradient = classColors[i % classColors.length];
            const teacherName = cls.class_teacher?.user?.name
              ?? cls.class_teacher?.user?.email?.split("@")[0]
              ?? "Unassigned";

            return (
              <div key={cls.id} className="card-hover bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Colored header */}
                <div className={`bg-gradient-to-r ${gradient} p-5 text-white`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{cls.display_name}</h3>
                      <p className="text-white/70 text-sm">Section {cls.section}</p>
                    </div>
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Yr {cls.level_order}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    {cls.students.length} / {cls.max_students} students
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Occupancy */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground font-medium">Capacity</span>
                      <span className="font-semibold text-foreground">{Math.round(occupancy)}%</span>
                    </div>
                    <ProgressBar value={occupancy} color={occupancy >= 90 ? "bg-red-500" : occupancy >= 70 ? "bg-amber-500" : "bg-emerald-500"} />
                  </div>

                  {/* Class teacher */}
                  <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Class Teacher</p>
                      <p className="text-xs font-semibold text-foreground">{teacherName}</p>
                    </div>
                  </div>

                  {/* Subjects */}
                  {cls.subjects.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cls.subjects.map(sub => (
                          <span key={sub.id} className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="w-full py-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg border border-primary/20 transition-colors">
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
