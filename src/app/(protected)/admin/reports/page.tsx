import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/ui/shared";
import {
  FileText, Download, Users, Wallet, GraduationCap,
  BookOpen, ClipboardList, UserCog, FolderOpen, Calendar, TrendingUp, BarChart3
} from "lucide-react";

const reportCards = [
  {
    id: "students",
    title: "Students Roster",
    desc: "Complete list of all enrolled students with class, guardian and contact info.",
    icon: Users,
    gradient: "from-blue-600 to-blue-400",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    tag: "HR",
  },
  {
    id: "fees",
    title: "Fee Collection",
    desc: "All fee records with paid/pending/overdue amounts and receipts.",
    icon: Wallet,
    gradient: "from-emerald-600 to-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    tag: "Finance",
  },
  {
    id: "teachers",
    title: "Teacher Roster",
    desc: "All teaching staff with designations, qualifications and salary info.",
    icon: GraduationCap,
    gradient: "from-amber-600 to-amber-400",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    tag: "HR",
  },
  {
    id: "results",
    title: "Exam Results",
    desc: "Complete results with grades, percentages and pass/fail status per subject.",
    icon: ClipboardList,
    gradient: "from-violet-600 to-violet-400",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
    tag: "Academic",
  },
  {
    id: "classes",
    title: "Classes Report",
    desc: "All classes with student counts, max capacity and class teacher info.",
    icon: BookOpen,
    gradient: "from-primary to-emerald-600",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    tag: "Academic",
  },
  {
    id: "subjects",
    title: "Subjects List",
    desc: "All subjects with their class, type, marks structure and assigned teacher.",
    icon: BookOpen,
    gradient: "from-teal-600 to-teal-400",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-600",
    tag: "Academic",
  },
  {
    id: "users",
    title: "System Users",
    desc: "All user accounts with roles, emails and join dates.",
    icon: UserCog,
    gradient: "from-rose-600 to-rose-400",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600",
    tag: "Admin",
  },
  {
    id: "documents",
    title: "Documents Registry",
    desc: "Student documents list with type, upload dates and ownership.",
    icon: FolderOpen,
    gradient: "from-orange-600 to-orange-400",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600",
    tag: "Records",
  },
  {
    id: "academic-years",
    title: "Academic Years",
    desc: "All academic year periods with active status and admission settings.",
    icon: Calendar,
    gradient: "from-cyan-600 to-cyan-400",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600",
    tag: "Admin",
  },
];

export default async function AdminReportsPage() {
  const [studentCount, teacherCount, feeCount, resultCount] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.feeRecord.count(),
    prisma.result.count(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Reports & Analytics"
        description="Download comprehensive data reports in PDF or Excel format."
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Students" value={studentCount} icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-600" />
        <StatCard title="Teachers" value={teacherCount} icon={GraduationCap} iconBg="bg-amber-500/10" iconColor="text-amber-600" />
        <StatCard title="Fee Records" value={feeCount} icon={Wallet} iconBg="bg-emerald-500/10" iconColor="text-emerald-600" />
        <StatCard title="Results" value={resultCount} icon={BarChart3} iconBg="bg-violet-500/10" iconColor="text-violet-600" />
      </div>

      {/* Info Banner */}
      <div className="glass-panel rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm mb-1">How to download reports</h3>
          <p className="text-muted-foreground text-sm">
            Click <span className="font-semibold text-red-600">PDF</span> to download a beautifully branded report card with school header and summary statistics,
            or click <span className="font-semibold text-emerald-600">Excel</span> to download a styled spreadsheet for further analysis in Microsoft Excel or Google Sheets.
            All reports are generated in real-time from your live database.
          </p>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map(report => (
          <div
            key={report.id}
            className="glass-panel rounded-2xl overflow-hidden card-hover group"
          >
            {/* Card top gradient bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${report.gradient}`} />

            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-12 h-12 rounded-2xl ${report.iconBg} flex items-center justify-center flex-shrink-0 border border-white/30 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <report.icon className={`w-6 h-6 ${report.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground text-sm leading-tight">{report.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${report.gradient} text-white flex-shrink-0`}>
                      {report.tag}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{report.desc}</p>
                </div>
              </div>

              {/* Download buttons */}
              <div className="flex gap-3">
                <a
                  href={`/api/reports/${report.id}?format=pdf`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all duration-200 border border-red-200/50 dark:border-red-900/50 hover:shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download PDF
                </a>
                <a
                  href={`/api/reports/${report.id}?format=excel`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-all duration-200 border border-emerald-200/50 dark:border-emerald-900/50 hover:shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Excel
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
