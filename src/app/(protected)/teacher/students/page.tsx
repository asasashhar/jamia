import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StatCard, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, Avatar, ActionBtn, EmptyState } from "@/components/ui/shared";
import { Users, BookOpen, Calendar, Search, MoreHorizontal, GraduationCap } from "lucide-react";


export default async function TeacherStudentsPage() {
  const session = await auth();
  const teacher = session?.user?.id ? await prisma.teacher.findUnique({
    where: { user_id: session.user.id },
    include: { classes: { include: { students: { include: { user: true } } } } },
  }) : null;

  const students = teacher?.classes.flatMap(c => c.students.map(s => ({ ...s, className: c.display_name, classSection: c.section }))) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Students</h1>
          <p className="text-muted-foreground text-sm mt-1">Students enrolled in your classes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={students.length} icon={Users} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="My Classes" value={teacher?.classes.length ?? 0} icon={BookOpen} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Enrolled" value={students.filter(s => s.status === "ENROLLED").length} icon={GraduationCap}
          iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex gap-3 items-center bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search students..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {students.length === 0 ? (
          <EmptyState icon={Users} title="No students found" description="You don't have any students in your classes yet." />
        ) : (
          <>
            <TableWrapper>
              <Table>
                <Thead cols={["Student", "Class", "Guardian", "Date of Birth", "Status"]} />
                <Tbody>
                  {students.map(student => (
                    <Tr key={student.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={`${student.first_name} ${student.last_name}`} />
                          <div>
                            <p className="font-semibold text-foreground text-sm">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-muted-foreground">{student.user.email}</p>
                            <p className="text-xs text-muted-foreground/70 font-mono">{student.enrollment_id}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <p className="text-sm text-foreground">{(student as any).className}</p>
                        <p className="text-xs text-muted-foreground">Section {(student as any).classSection}</p>
                      </Td>
                      <Td>
                        <p className="text-sm text-foreground">{student.guardian_name}</p>
                        <p className="text-xs text-muted-foreground">{student.guardian_phone}</p>
                      </Td>
                      <Td><p className="text-sm text-muted-foreground">{new Date(student.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></Td>
                      <Td><StatusBadge label={student.status} type={student.status === "ENROLLED" ? "success" : "warning"} /></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableWrapper>
            <div className="px-6 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              Showing {students.length} students
            </div>
          </>
        )}
      </div>
    </div>
  );
}
