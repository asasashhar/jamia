import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  Users, GraduationCap, BookOpen, Wallet, TrendingUp, ArrowUpRight,
  Calendar, Bell, ClipboardList, FileText, UserCheck, CheckCircle2,
  AlertCircle, BarChart3, School, Award
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  const adminName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const [
    studentCount, teacherCount, classCount, resultCount,
    feeRecords, pendingAdmissions, activeYear
  ] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.result.count(),
    prisma.feeRecord.findMany({ select: { status: true, total_amount: true, paid_amount: true } }),
    prisma.admission.count({ where: { status: "PENDING" } }),
    prisma.academicYear.findFirst({ where: { is_active: true } }),
  ]);

  const totalCollected = feeRecords.reduce((s, f) => s + f.paid_amount, 0);
  const totalPending = feeRecords.reduce((s, f) => s + Math.max(0, f.total_amount - f.paid_amount), 0);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const stats = [
    { name: "Total Students", value: studentCount, icon: GraduationCap, badge: "Enrolled", gradient: "from-emerald-500 to-green-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", iconColor: "text-emerald-600", href: "/admin/students" },
    { name: "Teaching Staff", value: teacherCount, icon: Users, badge: "Active", gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-950/30", iconColor: "text-blue-600", href: "/admin/teachers" },
    { name: "Active Classes", value: classCount, icon: BookOpen, badge: "Running", gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950/30", iconColor: "text-violet-600", href: "/admin/classes" },
    { name: "Fee Collected", value: `₹${totalCollected.toLocaleString("en-IN")}`, icon: Wallet, badge: "This Year", gradient: "from-amber-500 to-yellow-600", bg: "bg-amber-50 dark:bg-amber-950/30", iconColor: "text-amber-600", href: "/admin/fees" },
  ];

  const quickLinks = [
    { href: "/admin/students", label: "Add Student", icon: UserCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
    { href: "/admin/results", label: "Enter Results", icon: ClipboardList, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/30" },
    { href: "/admin/fees", label: "Record Fee", icon: Wallet, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
    { href: "/admin/admissions", label: "Review Admissions", icon: FileText, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
    { href: "/admin/id-cards", label: "Print ID Cards", icon: Award, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
    { href: "/admin/reports", label: "Download Reports", icon: BarChart3, color: "text-primary bg-primary/5" },
  ];

  const alerts = [
    ...(pendingAdmissions > 0 ? [{ type: "warning", text: `${pendingAdmissions} admission application${pendingAdmissions > 1 ? "s" : ""} awaiting review`, href: "/admin/admissions" }] : []),
    ...(totalPending > 0 ? [{ type: "info", text: `₹${totalPending.toLocaleString("en-IN")} in pending fee dues`, href: "/admin/fees" }] : []),
    ...(activeYear?.is_admission_open ? [{ type: "success", text: `Admission open for ${activeYear.year_name}`, href: "/admin/academic-years" }] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0d5e35] to-emerald-700 p-8 text-white">
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute right-32 bottom-0 w-20 h-20 bg-accent/20 rounded-full blur-xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-white/60 text-sm mb-1">{today}</p>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              Assalamu Alaikum, {adminName} 👋
            </h1>
            <p className="text-white/70 text-sm">
              Welcome back to Jamia Khadijatul Kubra — School Management System
            </p>
            {activeYear && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-accent">{activeYear.year_name}</span>
                <span className="text-white/50 text-xs">· Active Year</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center min-w-[90px]">
              <p className="text-3xl font-black text-accent">{studentCount}</p>
              <p className="text-white/60 text-xs mt-1">Students</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center min-w-[90px]">
              <p className="text-3xl font-black text-accent">{teacherCount}</p>
              <p className="text-white/60 text-xs mt-1">Teachers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center min-w-[90px]">
              <p className="text-3xl font-black text-accent">{resultCount}</p>
              <p className="text-white/60 text-xs mt-1">Results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((a, i) => (
            <Link key={i} href={a.href} className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-medium transition-all hover:scale-[1.01] ${
              a.type === "warning" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300" :
              a.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300" :
              "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300"
            }`}>
              {a.type === "warning" ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> :
               a.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> :
               <Bell className="w-4 h-4 flex-shrink-0" />}
              {a.text}
              <ArrowUpRight className="w-4 h-4 ml-auto flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} href={stat.href} className="block">
              <div className="glass-card card-hover rounded-2xl p-5 relative overflow-hidden group cursor-pointer h-full">
                <div className={`absolute -right-6 -top-6 w-28 h-28 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full group-hover:opacity-10 transition-opacity duration-500`} />
                <div className={`absolute -right-2 -top-2 w-16 h-16 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center border border-white/30 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${stat.gradient} text-white`}>
                    {stat.badge}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm font-medium relative z-10">{stat.name}</p>
                <p className="text-3xl font-black text-foreground mt-1 relative z-10">{stat.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links + Fee Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 bg-white/40 dark:bg-black/20 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Quick Actions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Navigate to key management areas</p>
            </div>
            <School className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {quickLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="group">
                  <div className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white/50 dark:bg-black/10 text-center">
                    <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-tight">{link.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Fee Summary */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 bg-white/40 dark:bg-black/20">
            <h2 className="font-semibold text-foreground">Fee Overview</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Collection summary</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-4">
              {[
                { label: "Collected", value: totalCollected, color: "bg-emerald-500", pct: totalCollected + totalPending > 0 ? (totalCollected / (totalCollected + totalPending)) * 100 : 0, textColor: "text-emerald-700 dark:text-emerald-400" },
                { label: "Pending", value: totalPending, color: "bg-amber-400", pct: totalCollected + totalPending > 0 ? (totalPending / (totalCollected + totalPending)) * 100 : 0, textColor: "text-amber-700 dark:text-amber-400" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className={`font-bold ${item.textColor}`}>₹{item.value.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Records</span>
                <span className="font-semibold text-foreground">{feeRecords.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid in Full</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{feeRecords.filter(f => f.status === "PAID").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overdue</span>
                <span className="font-semibold text-red-600">{feeRecords.filter(f => f.status === "OVERDUE").length}</span>
              </div>
            </div>

            <Link href="/admin/fees" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 transition-colors">
              <TrendingUp className="w-4 h-4" /> View Full Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
