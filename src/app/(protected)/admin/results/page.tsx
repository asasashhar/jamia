import { prisma } from "@/lib/prisma";
import { PageHeader, SectionCard, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, Avatar, EmptyState, StatCard } from "@/components/ui/shared";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { ClipboardList, CheckCircle2, XCircle, Plus, Search } from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { AdminResultForm } from "./AdminResultForm";

function gradeFromPct(pct: number) {
  if (pct >= 90) return { label: "A+", color: "text-emerald-700 bg-emerald-100" };
  if (pct >= 80) return { label: "A",  color: "text-emerald-700 bg-emerald-100" };
  if (pct >= 70) return { label: "B+", color: "text-blue-700 bg-blue-100" };
  if (pct >= 60) return { label: "B",  color: "text-blue-700 bg-blue-100" };
  if (pct >= 50) return { label: "C",  color: "text-amber-700 bg-amber-100" };
  return { label: "F", color: "text-red-700 bg-red-100" };
}

export default async function AdminResultsPage() {
  const [results, classes, exams] = await Promise.all([
    prisma.result.findMany({
      include: { student: { include: { class: true } }, exam: true, subject: true },
      orderBy: [{ exam: { name: "desc" } }, { student: { first_name: "asc" } }],
    }),
    prisma.class.findMany({
      include: { subjects: true, students: true },
      orderBy: { level_order: "asc" },
    }),
    prisma.exam.findMany({
      include: { academic_year: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const passCount = results.filter(r => r.marks_obtained >= r.subject.pass_marks).length;
  const failCount = results.length - passCount;

  return (
    <div className="space-y-6">
      <PageHeader title="Results" description="Manage exam scores, publish results and generate report cards.">
        <ExportMenu type="results" />
        <AdminResultForm classes={classes} exams={exams} />
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Records" value={results.length} icon={ClipboardList} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Passed" value={passCount} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          badge={results.length ? `${Math.round(passCount / results.length * 100)}%` : "0%"} badgeColor="text-emerald-700 bg-emerald-100" />
        <StatCard title="Failed" value={failCount} icon={XCircle} iconBg="bg-red-50" iconColor="text-red-600"
          badge={results.length ? `${Math.round(failCount / results.length * 100)}%` : "0%"} badgeColor={failCount > 0 ? "text-red-700 bg-red-100" : "text-emerald-700 bg-emerald-100"} />
      </div>

      <SectionCard title="All Results" description={`${results.length} total records`} noPadding>
        {results.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={ClipboardList} title="No Results Yet" description="Add exam results using the 'Add Results' button above." />
          </div>
        ) : (
          <TableWrapper>
            <Table>
              <Thead cols={["Student", "Class", "Exam", "Subject", "Marks", "Grade", "Status"]} />
              <Tbody>
                {results.map(r => {
                  const pct = Math.round((r.marks_obtained / r.subject.max_marks) * 100);
                  const passed = r.marks_obtained >= r.subject.pass_marks;
                  const grade = gradeFromPct(pct);
                  return (
                    <Tr key={r.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={`${r.student.first_name} ${r.student.last_name}`} />
                          <div>
                            <p className="font-semibold text-sm text-foreground">{r.student.first_name} {r.student.last_name}</p>
                            <p className="text-xs text-muted-foreground">{r.student.enrollment_id}</p>
                          </div>
                        </div>
                      </Td>
                      <Td className="text-sm text-muted-foreground">{r.student.class.display_name}</Td>
                      <Td>
                        <p className="text-sm font-medium text-foreground">{r.exam.name}</p>
                        <p className="text-xs text-muted-foreground">{r.exam.term}</p>
                      </Td>
                      <Td className="text-sm font-medium text-foreground">{r.subject.name}</Td>
                      <Td>
                        <p className="font-bold text-foreground text-sm">{r.marks_obtained}<span className="text-xs text-muted-foreground font-normal">/{r.subject.max_marks}</span></p>
                        <p className="text-xs text-muted-foreground">{pct}%</p>
                      </Td>
                      <Td>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${grade.color}`}>{grade.label}</span>
                      </Td>
                      <Td>
                        <StatusBadge label={passed ? "Passed" : "Failed"} type={passed ? "success" : "danger"} />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableWrapper>
        )}
      </SectionCard>
    </div>
  );
}
