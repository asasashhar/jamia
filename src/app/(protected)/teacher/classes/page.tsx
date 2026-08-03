import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StatCard, ActionBtn, EmptyState, ProgressBar } from "@/components/ui/shared";
import { BookOpen, Users, GraduationCap, Plus } from "lucide-react";


export default async function TeacherClassesPage() {
  const session = await auth();
  const teacher = session?.user?.id ? await prisma.teacher.findUnique({
    where: { user_id: session.user.id },
    include: { classes: { include: { students: true, subjects: true } }, subjects: true },
  }) : null;

  const classes = teacher?.classes ?? [];
  const totalStudents = classes.reduce((s, c) => s + c.students.length, 0);

  const gradients = [
    "from-emerald-500 to-green-600", "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600", "from-amber-500 to-yellow-600",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
          <p className="text-muted-foreground text-sm mt-1">Classes you are assigned to teach or manage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Classes" value={classes.length} icon={BookOpen} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Total Students" value={totalStudents} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="My Subjects" value={teacher?.subjects.length ?? 0} icon={GraduationCap} iconBg="bg-violet-50" iconColor="text-violet-600" />
      </div>

      {classes.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <EmptyState icon={BookOpen} title="No classes assigned" description="You haven't been assigned any classes yet." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {classes.map((cls, i) => {
            const occupancy = cls.max_students > 0 ? (cls.students.length / cls.max_students) * 100 : 0;
            const gradient = gradients[i % gradients.length];

            return (
              <div key={cls.id} className="card-hover bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className={`bg-gradient-to-r ${gradient} p-5 text-white`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{cls.display_name}</h3>
                      <p className="text-white/70 text-sm">Section {cls.section} · Year {cls.level_order}</p>
                    </div>
                    <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                      <p className="text-2xl font-bold">{cls.students.length}</p>
                      <p className="text-[10px] text-white/70">students</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Capacity ({cls.students.length}/{cls.max_students})</span>
                      <span className="font-semibold">{Math.round(occupancy)}%</span>
                    </div>
                    <ProgressBar value={occupancy} color={occupancy >= 90 ? "bg-red-500" : "bg-emerald-500"} />
                  </div>

                  {cls.subjects.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cls.subjects.map(sub => (
                          <span key={sub.id} className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <ActionBtn href={`/teacher/students?class=${cls.id}`} variant="outline">
                    <Users className="w-4 h-4" /> View Students
                  </ActionBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
