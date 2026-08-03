"use client";

import { useState, useTransition } from "react";
import { Plus, ChevronDown, Loader2, CheckCircle2, BookOpen, Users, X } from "lucide-react";

type ClassWithStudentsAndSubjects = {
  id: string;
  display_name: string;
  section: string;
  subjects: { id: string; name: string; code: string; max_marks: number; pass_marks: number }[];
  students: { id: string; first_name: string; last_name: string; enrollment_id: string }[];
};

type Exam = {
  id: string;
  name: string;
  term: string;
  academic_year: { year_name: string };
};

interface Props {
  classes: ClassWithStudentsAndSubjects[];
  exams: Exam[];
}

export function AdminResultForm({ classes, exams }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedClass, setSelectedClass] = useState<ClassWithStudentsAndSubjects | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<ClassWithStudentsAndSubjects["subjects"][0] | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  function handleClose() {
    setIsOpen(false);
    setStep(1);
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedExam(null);
    setMarks({});
    setRemarks({});
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubject || !selectedExam || !selectedClass) return;
    startTransition(async () => {
      const entries = Object.entries(marks).filter(([, v]) => v !== "");
      const body = {
        examId: selectedExam.id,
        subjectId: selectedSubject.id,
        entries: entries.map(([studentId, m]) => ({
          studentId,
          marks: parseFloat(m),
          remarks: remarks[studentId] || null,
        })),
      };
      const res = await fetch("/api/results/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          window.location.reload();
        }, 2000);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm hover-lift transition-all duration-300"
      >
        <Plus className="w-4 h-4" /> Add Results
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div>
                <h2 className="text-lg font-bold text-foreground">Add Exam Results</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Step {step} of 3</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Results Saved!</h3>
                  <p className="text-sm text-muted-foreground">All marks have been recorded successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* STEP 1: Select Exam + Class */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" /> Select Exam &amp; Class
                      </h3>

                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">Select Exam *</label>
                        <div className="relative">
                          <select
                            className="w-full h-11 pl-4 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                            value={selectedExam?.id || ""}
                            onChange={e => setSelectedExam(exams.find(ex => ex.id === e.target.value) || null)}
                          >
                            <option value="">-- Choose an Exam --</option>
                            {exams.map(ex => (
                              <option key={ex.id} value={ex.id}>
                                {ex.name} ({ex.term}) — {ex.academic_year.year_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">Select Class *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {classes.map(cls => (
                            <button
                              key={cls.id}
                              type="button"
                              onClick={() => { setSelectedClass(cls); setSelectedSubject(null); }}
                              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                selectedClass?.id === cls.id
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border hover:border-primary/40 hover:bg-muted/30"
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                selectedClass?.id === cls.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}>
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-foreground">{cls.display_name}</p>
                                <p className="text-xs text-muted-foreground">{cls.students.length} students · {cls.subjects.length} subjects</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={!selectedExam || !selectedClass}
                          onClick={() => setStep(2)}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50 transition-all"
                        >
                          Next: Select Subject →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Select Subject */}
                  {step === 2 && selectedClass && (
                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" /> Select Subject — {selectedClass.display_name}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedClass.subjects.map(sub => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSelectedSubject(sub)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                              selectedSubject?.id === sub.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/30"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              selectedSubject?.id === sub.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              <span className="text-xs font-bold">{sub.code?.slice(0, 3) || "SUB"}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{sub.name}</p>
                              <p className="text-xs text-muted-foreground">Max: {sub.max_marks} · Pass: {sub.pass_marks}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-between">
                        <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors">
                          ← Back
                        </button>
                        <button
                          type="button"
                          disabled={!selectedSubject}
                          onClick={() => setStep(3)}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50 transition-all"
                        >
                          Next: Enter Marks →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Enter Marks */}
                  {step === 3 && selectedClass && selectedSubject && selectedExam && (
                    <div className="space-y-5">
                      <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            {selectedSubject.name} — {selectedClass.display_name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{selectedExam.name} · Max Marks: {selectedSubject.max_marks}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-primary">{selectedClass.students.length}</p>
                          <p className="text-xs text-muted-foreground">students</p>
                        </div>
                      </div>

                      {selectedClass.students.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8 text-sm">No students enrolled in this class.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-border">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Student</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-36">
                                  Marks <span className="normal-case text-primary">/{selectedSubject.max_marks}</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Remarks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {selectedClass.students.map(student => (
                                <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {student.first_name[0]}{student.last_name[0]}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-foreground">{student.first_name} {student.last_name}</p>
                                        <p className="text-xs text-muted-foreground">{student.enrollment_id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      min={0}
                                      max={selectedSubject.max_marks}
                                      step="0.5"
                                      placeholder="0"
                                      value={marks[student.id] ?? ""}
                                      onChange={e => setMarks(prev => ({ ...prev, [student.id]: e.target.value }))}
                                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      placeholder="Optional..."
                                      value={remarks[student.id] ?? ""}
                                      onChange={e => setRemarks(prev => ({ ...prev, [student.id]: e.target.value }))}
                                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors">
                          ← Back
                        </button>
                        <button
                          type="submit"
                          disabled={isPending || Object.keys(marks).length === 0}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-emerald-600 text-white disabled:opacity-50 flex items-center gap-2 transition-all"
                        >
                          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4" /> Save All Marks</>}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
