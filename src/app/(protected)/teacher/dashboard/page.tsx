import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StatCard, SectionCard, ProgressBar } from "@/components/ui/shared";
import { BookOpen, Users, Calendar, Clock, CheckCircle2, ArrowRight, Bell, Zap } from "lucide-react";


const schedule = [
  { time: "07:00 – 08:00", subject: "Quran Kareem", class: "Ula – A", room: "Room 1", color: "border-emerald-500 bg-emerald-50" },
  { time: "08:15 – 09:15", subject: "Arabic Grammar", class: "Thania – B", room: "Room 3", color: "border-blue-500 bg-blue-50" },
  { time: "10:00 – 11:00", subject: "Islamic History", class: "Saalisa – A", room: "Room 5", color: "border-violet-500 bg-violet-50" },
  { time: "11:30 – 12:30", subject: "Fiqh", class: "Rabia – A", room: "Room 2", color: "border-amber-500 bg-amber-50" },
];

const notices = [
  { type: "Urgent", typeColor: "bg-red-100 text-red-700", title: "Annual Exam Schedule Released", body: "Mid-term exams start November 10. Please prepare students.", time: "2h ago" },
  { type: "Academic", typeColor: "bg-blue-100 text-blue-700", title: "Syllabus Update for Quran Kareem", body: "Updated syllabus for Ula class has been uploaded to the portal.", time: "Yesterday" },
  { type: "General", typeColor: "bg-muted text-muted-foreground", title: "Staff Meeting – Friday 2 PM", body: "Monthly staff meeting in Conference Room A.", time: "2 days ago" },
];

const quickActions = [
  { icon: CheckCircle2, title: "Mark Attendance", desc: "Record today's class attendance", href: "#", color: "bg-emerald-50 text-emerald-600" },
  { icon: Bell, title: "Upload Results", desc: "Submit exam marks for your classes", href: "#", color: "bg-blue-50 text-blue-600" },
  { icon: Calendar, title: "View Timetable", desc: "See your full weekly schedule", href: "#", color: "bg-violet-50 text-violet-600" },
];

export default async function TeacherDashboard() {
  const session = await auth();
  const teacher = session?.user?.id ? await prisma.teacher.findUnique({
    where: { user_id: session.user.id },
    include: { classes: { include: { students: true } }, subjects: true },
  }) : null;

  const name = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Teacher";
  const totalStudents = teacher?.classes.reduce((s, c) => s + c.students.length, 0) ?? 0;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="relative bg-gradient-to-br from-primary to-emerald-700 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute inset-0 islamic-pattern" />
        <div className="relative z-10">
          <p className="text-white/60 text-sm mb-1">{today}</p>
          <h1 className="text-2xl font-bold mb-0.5">Assalamu Alaikum, {teacher?.title ?? ""} {name.split(" ")[0]} 👋</h1>
          <p className="text-white/70 text-sm">You have {schedule.length} classes today. Have a blessed and productive day.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Classes" value={teacher?.classes.length ?? 0} icon={BookOpen} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="My Students" value={totalStudents} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Today's Classes" value={schedule.length} icon={Calendar} iconBg="bg-violet-50" iconColor="text-violet-600" />
        <StatCard title="My Subjects" value={teacher?.subjects.length ?? 0} icon={Zap} iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <SectionCard title="Today's Schedule" description="Your classes for today">
            <div className="space-y-3">
              {schedule.map((s, i) => (
                <div key={i} className={`flex gap-4 p-4 rounded-xl border-l-4 ${s.color}`}>
                  <div className="text-center flex-shrink-0 min-w-[80px]">
                    <p className="text-xs font-bold text-foreground">{s.time.split("–")[0].trim()}</p>
                    <p className="text-[10px] text-muted-foreground">– {s.time.split("–")[1].trim()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{s.subject}</p>
                    <p className="text-xs text-muted-foreground">{s.class}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs bg-white/70 border border-border px-2 py-1 rounded-lg">{s.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a key={action.title} href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                    <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{action.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </SectionCard>

          {/* Notices */}
          <SectionCard title="Notices">
            <div className="space-y-3">
              {notices.map((n, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/40 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.typeColor}`}>{n.type}</span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground">{n.body}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
