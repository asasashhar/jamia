import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function TeacherResultsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
    include: {
      subjects: { include: { class: true } },
      classes: true,
    },
  });

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="p-8 max-w-md w-full bg-white rounded-2xl shadow-xl text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Access Denied</h2>
          <p className="text-gray-500">No teacher profile found for your account. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  const exams = await prisma.exam.findMany({
    orderBy: { name: 'asc' },
    include: { academic_year: true }
  });

  const selectedSubjectId = searchParams?.subjectId as string | undefined;
  const selectedExamId = searchParams?.examId as string | undefined;

  let students: any[] = [];
  let existingResults: any[] = [];
  let selectedSubject = null;
  let selectedExam = null;

  if (selectedSubjectId) {
    selectedSubject = teacher.subjects.find((s) => s.id === selectedSubjectId);
    if (selectedSubject) {
      students = await prisma.student.findMany({
        where: { class_id: selectedSubject.class_id },
        include: { user: true },
        orderBy: { first_name: 'asc' }
      });

      if (selectedExamId) {
        selectedExam = exams.find((e) => e.id === selectedExamId);
        existingResults = await prisma.result.findMany({
          where: {
            subject_id: selectedSubjectId,
            exam_id: selectedExamId,
            student_id: { in: students.map((s) => s.id) },
          },
        });
      }
    }
  }

  async function saveMarks(formData: FormData) {
    "use server";
    const subjectId = formData.get("subjectId") as string;
    const examId = formData.get("examId") as string;
    
    if (!subjectId || !examId) return;

    const keys = Array.from(formData.keys());
    const mutations = [];
    
    for (const key of keys) {
      if (key.startsWith("marks_")) {
        const studentId = key.replace("marks_", "");
        const marksStr = formData.get(key) as string;
        const remarks = formData.get(`remarks_${studentId}`) as string;
        
        if (marksStr !== null && marksStr !== "") {
          const marks = parseFloat(marksStr);
          
          const existing = await prisma.result.findFirst({
            where: { subject_id: subjectId, exam_id: examId, student_id: studentId }
          });
          
          if (existing) {
            mutations.push(
              prisma.result.update({
                where: { id: existing.id },
                data: { marks_obtained: marks, remarks: remarks || null }
              })
            );
          } else {
            mutations.push(
              prisma.result.create({
                data: {
                  subject_id: subjectId,
                  exam_id: examId,
                  student_id: studentId,
                  marks_obtained: marks,
                  remarks: remarks || null,
                }
              })
            );
          }
        }
      }
    }
    
    if (mutations.length > 0) {
      await prisma.$transaction(mutations);
    }
    
    revalidatePath("/teacher/results");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Results</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload and edit exam marks for your assigned subjects</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl">
          <BookOpen className="w-4 h-4" />
          {teacher.subjects.length} Subjects Assigned
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Selection Form */}
        <div className="p-6 border-b border-border/50 bg-white/40 dark:bg-black/20">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Select Configuration</h3>
          <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700">Assigned Subject</label>
              <div className="relative">
                <select
                  name="subjectId"
                  id="subjectId"
                  defaultValue={selectedSubjectId || ""}
                  className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl shadow-sm appearance-none bg-white border cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <option value="" disabled>-- Select a Subject --</option>
                  {teacher.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code}) - {sub.class?.display_name || sub.class?.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="examId" className="block text-sm font-medium text-gray-700">Select Exam</label>
              <div className="relative">
                <select
                  name="examId"
                  id="examId"
                  defaultValue={selectedExamId || ""}
                  className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl shadow-sm appearance-none bg-white border cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <option value="" disabled>-- Select an Exam --</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} ({exam.term}) - {exam.academic_year.year_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Load Students
              </button>
            </div>
          </form>
        </div>

        {/* Results Entry Form */}
        {selectedSubjectId && selectedExamId && selectedSubject && selectedExam && (
          <div className="p-0 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-indigo-50 p-5 border-b border-indigo-100 flex justify-between items-center px-6">
              <div>
                <h4 className="text-indigo-900 font-semibold text-lg flex items-center gap-2">
                  <span>{selectedSubject.name}</span>
                  <span className="text-indigo-300">•</span>
                  <span>{selectedSubject.class?.display_name || selectedSubject.class?.name}</span>
                </h4>
                <p className="text-indigo-700/70 text-sm mt-0.5 font-medium">{selectedExam.name} ({selectedExam.term}) - {selectedExam.academic_year.year_name}</p>
              </div>
              <div className="text-right bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100/50">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">Max Marks</span>
                <span className="text-2xl font-black text-indigo-600 leading-none">{selectedSubject.max_marks}</span>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 border border-gray-100 mb-5 shadow-sm">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">No Students Found</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">There are no students enrolled in the class associated with this subject.</p>
              </div>
            ) : (
              <form action={saveMarks} className="block">
                <input type="hidden" name="subjectId" value={selectedSubjectId} />
                <input type="hidden" name="examId" value={selectedExamId} />
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs font-bold tracking-wider uppercase">
                        <th className="px-6 py-4">Student Info</th>
                        <th className="px-6 py-4">Enrollment ID</th>
                        <th className="px-6 py-4 w-48 text-indigo-700">Marks Obtained</th>
                        <th className="px-6 py-4">Remarks (Optional)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {students.map((student) => {
                        const existingResult = existingResults.find((r) => r.student_id === student.id);
                        return (
                          <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200 shadow-sm">
                                  {student.first_name[0]}{student.last_name[0]}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                    {student.first_name} {student.last_name}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    DOB: {new Date(student.dob).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 font-mono text-xs border border-gray-200 font-medium">
                                {student.enrollment_id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative group/input">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={selectedSubject.max_marks}
                                  name={`marks_${student.id}`}
                                  defaultValue={existingResult?.marks_obtained ?? ""}
                                  className="block w-full rounded-xl border-gray-300 bg-white border focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 transition-all placeholder:text-gray-300 shadow-sm hover:border-gray-400 font-medium text-gray-900"
                                  placeholder="0.00"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-hover/input:opacity-100 transition-opacity">
                                  <span className="text-xs font-semibold text-gray-400">/{selectedSubject.max_marks}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                name={`remarks_${student.id}`}
                                defaultValue={existingResult?.remarks || ""}
                                className="block w-full rounded-xl border-gray-300 bg-white border focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 transition-all placeholder:text-gray-300 shadow-sm hover:border-gray-400"
                                placeholder="E.g., Excellent performance..."
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-4 rounded-b-2xl">
                  <a 
                    href="/teacher/dashboard" 
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                  >
                    Cancel
                  </a>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save All Marks
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Empty State when no config selected */}
        {(!selectedSubjectId || !selectedExamId) && (
          <div className="p-16 text-center bg-white border-t border-gray-100">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-full flex items-center justify-center border border-indigo-100/50 shadow-inner">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Enter Marks?</h3>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
              Please select a Subject and an Exam from the configuration above and click <span className="font-semibold text-gray-700">"Load Students"</span> to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
