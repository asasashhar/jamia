import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN", "TEACHER"].includes(session.user?.role ?? "")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { examId, subjectId, entries } = await req.json() as {
    examId: string;
    subjectId: string;
    entries: { studentId: string; marks: number; remarks: string | null }[];
  };

  if (!examId || !subjectId || !Array.isArray(entries)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const mutations = [];
  for (const entry of entries) {
    const { studentId, marks, remarks } = entry;
    const existing = await prisma.result.findFirst({
      where: { exam_id: examId, subject_id: subjectId, student_id: studentId },
    });
    if (existing) {
      mutations.push(
        prisma.result.update({
          where: { id: existing.id },
          data: { marks_obtained: marks, remarks: remarks ?? null },
        })
      );
    } else {
      mutations.push(
        prisma.result.create({
          data: { exam_id: examId, subject_id: subjectId, student_id: studentId, marks_obtained: marks, remarks: remarks ?? null },
        })
      );
    }
  }

  if (mutations.length > 0) {
    await prisma.$transaction(mutations);
  }

  return NextResponse.json({ ok: true, saved: mutations.length });
}
