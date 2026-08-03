import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StatCard, SectionCard, ProgressBar, StatusBadge } from "@/components/ui/shared";
import { BookOpen, Calendar, Award, Wallet, Clock, TrendingUp, Star } from "lucide-react";


const timetable = [
  { time: "07:00 – 08:00", subject: "Quran Kareem", teacher: "Ustaza Khadija", color: "border-emerald-500 bg-emerald-50" },
  { time: "08:15 – 09:15", subject: "Arabic Grammar", teacher: "Ustaza Fatima", color: "border-blue-500 bg-blue-50" },
  { time: "09:30 – 10:30", subject: "Islamic History", teacher: "Ustaza Maryam", color: "border-violet-500 bg-violet-50" },
  { time: "11:00 – 12:00", subject: "Fiqh", teacher: "Ustaza Zainab", color: "border-amber-500 bg-amber-50" },
];

function gradeFromPct(pct: number) {
  if (pct >= 90) return "A+"; if (pct >= 80) return "A";
  if (pct >= 70) return "B+"; if (pct >= 60) return "B";
  if (pct >= 50) return "C"; return "F";
}

function gradeColor(grade: string) {
  if (grade === "A+" || grade === "A") return "text-emerald-700 bg-emerald-100";
  if (grade === "B+" || grade === "B") return "text-blue-700 bg-blue-100";
  if (grade === "C") return "text-amber-700 bg-amber-100";
  return "text-red-700 bg-red-100";
}

export default async function StudentDashboard() {
  const session = await auth();
  const student = session?.user?.id ? await prisma.student.findUnique({
    where: { user_id: session.user.id },
    include: {
      class: true,
      results: { include: { exam: true, subject: true }, orderBy: { exam: { name: "desc" } } },
      feeRecords: { orderBy: { due_date: "desc" }, take: 3 },
    },
  }) : null;

  const name = student?.first_name ?? session?.user?.name?.split(" ")[0] ?? "Student";
  const latestResult = student?.results[0];
  const latestPct = latestResult ? Math.round((latestResult.marks_obtained / latestResult.subject.max_marks) * 100) : null;
  const latestFee = student?.feeRecords[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="relative bg-gradient-to-br from-primary to-emerald-700 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute inset-0 islamic-pattern" />
          <div className="relative z-10">
          <p className="text-white/60 text-sm mb-1">{today}</p>
          <h1 className="text-2xl font-bold mb-0.5">Assalamu Alaikum, {name} 🌸</h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              📚 {student?.class.display_name ?? "—"}
            </span>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              🎓 {student?.enrollment_id ?? "—"}
            </span>
            <a
              href="/api/marksheet/me"
              target="_blank"
              className="bg-amber-400/90 text-[#07301A] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-amber-300 transition-colors flex items-center gap-1"
            >
              📄 Download Marksheet
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Class" value={student?.class.display_name ?? "—"} icon={BookOpen} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Attendance" value="94.5%" icon={Calendar} iconBg="bg-blue-50" iconColor="text-blue-600"
          badge="This Month" badgeColor="text-blue-700 bg-blue-100" />
        <StatCard title="Latest Score" value={latestPct ? `${latestPct}%` : "—"} icon={Award} iconBg="bg-violet-50" iconColor="text-violet-600"
          footer={latestResult?.subject.name} />
        <StatCard title="Fee Status" value={latestFee?.status ?? "No Records"} icon={Wallet}
          iconBg={latestFee?.status === "PAID" ? "bg-emerald-50" : "bg-amber-50"}
          iconColor={latestFee?.status === "PAID" ? "text-emerald-600" : "text-amber-600"}
          badge={latestFee?.status === "PAID" ? "All Clear ✓" : "Due"}
          badgeColor={latestFee?.status === "PAID" ? "text-emerald-700 bg-emerald-100" : "text-amber-700 bg-amber-100"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results */}
        <div className="lg:col-span-2">
          <SectionCard title="My Results" description="Latest exam performance" noPadding>
            {(student?.results.length ?? 0) === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No results yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {student!.results.slice(0, 6).map(r => {
                  const pct = Math.round((r.marks_obtained / r.subject.max_marks) * 100);
                  const grade = gradeFromPct(pct);
                  return (
                    <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{r.subject.name}</p>
                        <p className="text-xs text-muted-foreground">{r.exam.name} · {r.exam.term}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <ProgressBar value={pct} color={pct >= 50 ? "bg-emerald-500" : "bg-red-500"} />
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-bold text-foreground text-sm">{r.marks_obtained}<span className="text-xs text-muted-foreground">/{r.subject.max_marks}</span></p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(grade)}`}>{grade}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right col */}
        <div className="space-y-5">
          {/* Timetable */}
          <SectionCard title="Today's Timetable">
            <div className="space-y-2">
              {timetable.map((t, i) => (
                <div key={i} className={`p-3 rounded-xl border-l-4 ${t.color}`}>
                  <p className="text-xs font-bold text-foreground">{t.subject}</p>
                  <p className="text-[10px] text-muted-foreground">{t.time}</p>
                  <p className="text-[10px] text-muted-foreground">{t.teacher}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Fee Summary */}
          <SectionCard title="Fee Summary">
            {(student?.feeRecords.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No fee records.</p>
            ) : (
              <div className="space-y-2">
                {student!.feeRecords.map(f => (
                  <div key={f.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{f.fee_type}</p>
                      <p className="text-[10px] text-muted-foreground">Due: {new Date(f.due_date).toLocaleDateString("en-IN")}</p>
                    </div>
                    <StatusBadge label={f.status} type={f.status === "PAID" ? "success" : f.status === "OVERDUE" ? "danger" : "warning"} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
