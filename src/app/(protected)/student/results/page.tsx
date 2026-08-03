import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StatCard, PageHeader, SectionCard, ProgressBar, EmptyState } from "@/components/ui/shared";
import { Award, TrendingUp, ClipboardList, Star, CheckCircle2, XCircle } from "lucide-react";


function gradeFromPct(pct: number) {
  if (pct >= 90) return { label: "A+", color: "text-emerald-700 bg-emerald-100" };
  if (pct >= 80) return { label: "A", color: "text-emerald-700 bg-emerald-100" };
  if (pct >= 70) return { label: "B+", color: "text-blue-700 bg-blue-100" };
  if (pct >= 60) return { label: "B", color: "text-blue-700 bg-blue-100" };
  if (pct >= 50) return { label: "C", color: "text-amber-700 bg-amber-100" };
  return { label: "F", color: "text-red-700 bg-red-100" };
}

export default async function StudentResultsPage() {
  const session = await auth();
  const student = session?.user?.id ? await prisma.student.findUnique({
    where: { user_id: session.user.id },
    include: { results: { include: { exam: true, subject: true }, orderBy: { exam: { name: "desc" } } } },
  }) : null;

  const results = student?.results ?? [];
  const passCount = results.filter(r => r.marks_obtained >= r.subject.pass_marks).length;
  const failCount = results.length - passCount;
  const avgPct = results.length > 0
    ? Math.round(results.reduce((s, r) => s + (r.marks_obtained / r.subject.max_marks) * 100, 0) / results.length)
    : 0;

  // Group by exam
  const byExam = results.reduce<Record<string, typeof results>>((acc, r) => {
    const key = `${r.exam.name} — ${r.exam.term}`;
    acc[key] = acc[key] ?? [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="My Results" description="View your academic performance and exam results.">
        {student && (
          <a
            href={`/api/marksheet/${student.id}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-emerald-600 rounded-xl shadow-md hover:shadow-lg hover-lift transition-all duration-300"
          >
            <ClipboardList className="w-4 h-4" /> Download Marksheet PDF
          </a>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Subjects" value={results.length} icon={ClipboardList} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Passed" value={passCount} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Failed" value={failCount} icon={XCircle} iconBg="bg-red-50" iconColor="text-red-600" />
        <StatCard title="Average" value={`${avgPct}%`} icon={TrendingUp} iconBg="bg-violet-50" iconColor="text-violet-600"
          badge={gradeFromPct(avgPct).label} badgeColor={gradeFromPct(avgPct).color} />
      </div>

      {Object.keys(byExam).length === 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <EmptyState icon={Award} title="No results yet" description="Your exam results will appear here once published." />
        </div>
      ) : (
        Object.entries(byExam).map(([examName, examResults]) => {
          const examPct = Math.round(examResults.reduce((s, r) => s + (r.marks_obtained / r.subject.max_marks) * 100, 0) / examResults.length);
          const examGrade = gradeFromPct(examPct);
          return (
            <div key={examName} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Exam header */}
              <div className="px-6 py-4 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-foreground">{examName}</h2>
                  <p className="text-xs text-muted-foreground">{examResults.length} subject{examResults.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{examPct}%</p>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${examGrade.color}`}>
                    {examGrade.label}
                  </span>
                </div>
              </div>

              {/* Subject rows */}
              <div className="divide-y divide-border">
                {examResults.map(r => {
                  const pct = Math.round((r.marks_obtained / r.subject.max_marks) * 100);
                  const passed = r.marks_obtained >= r.subject.pass_marks;
                  const grade = gradeFromPct(pct);
                  return (
                    <div key={r.id} className="px-6 py-4 flex flex-wrap sm:flex-nowrap items-center gap-4 hover:bg-muted/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{r.subject.name}</p>
                        {r.remarks && <p className="text-xs text-muted-foreground mt-0.5">{r.remarks}</p>}
                        <div className="mt-2 w-full max-w-xs">
                          <ProgressBar value={pct} color={passed ? "bg-emerald-500" : "bg-red-500"} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-foreground">{r.marks_obtained}<span className="text-xs text-muted-foreground font-normal">/{r.subject.max_marks}</span></p>
                          <p className="text-xs text-muted-foreground">{pct}%</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-bold ${grade.color}`}>{grade.label}</span>
                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold ${passed ? "text-emerald-700 bg-emerald-100" : "text-red-700 bg-red-100"}`}>
                          {passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
