import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ReactPDF, { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { auth } from "@/auth";

// ── Palette ──────────────────────────────────────────────────────────────────
const NAVY    = "#0f172a";
const NAVY2   = "#1e293b";
const NAVY3   = "#334155";
const GOLD    = "#D4A017";
const GOLD2   = "#F5C842";
const CREAM   = "#fefce8";
const GRAY    = "#64748b";
const BORDER  = "#e2e8f0";
const WHITE   = "#ffffff";
const PASS    = "#15803d";
const FAIL    = "#dc2626";

function gradeFromPct(pct: number) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  return "F";
}
function gradeColor(g: string) {
  if (g === "F")  return FAIL;
  if (g === "C")  return "#d97706";
  return PASS;
}

const st = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: WHITE, fontSize: 10 },

  // ── Header ──────────────────────────────────────────────────────────────
  headerBand: { backgroundColor: NAVY, paddingHorizontal: 40, paddingTop: 26, paddingBottom: 18 },
  headerRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo:       {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: GOLD, alignItems: "center", justifyContent: "center",
  },
  logoText:   { color: NAVY, fontSize: 26, fontFamily: "Helvetica-Bold" },
  schoolCol:  { flex: 1, paddingLeft: 14 },
  schoolName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: WHITE, letterSpacing: 0.3 },
  schoolSub:  { fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 3, letterSpacing: 0.2 },
  reportBadge:{
    backgroundColor: GOLD, color: NAVY, fontSize: 8,
    fontFamily: "Helvetica-Bold", padding: "5 14", borderRadius: 99, letterSpacing: 1,
  },
  goldLine:   { height: 3, backgroundColor: GOLD, marginTop: 16 },

  // ── Student Meta Strip ────────────────────────────────────────────────────
  metaBand: {
    backgroundColor: CREAM, paddingHorizontal: 40, paddingVertical: 14,
    borderBottomWidth: 2, borderBottomColor: GOLD,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  metaName:  { fontSize: 17, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 6 },
  metaGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  metaItem:  { flexDirection: "row", alignItems: "center" },
  metaLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 5 },
  metaVal:   { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY },
  examBadge: {
    backgroundColor: NAVY, color: GOLD, padding: "7 14",
    borderRadius: 10, fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center",
  },

  // ── Table ─────────────────────────────────────────────────────────────────
  tableWrap: { paddingHorizontal: 40, paddingTop: 20 },
  tableTitle:{ fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  tHead:     { flexDirection: "row", backgroundColor: NAVY2, borderRadius: "6 6 0 0", overflow: "hidden" },
  tHCell:    { padding: "9 10", fontSize: 8.5, fontFamily: "Helvetica-Bold", color: GOLD, textTransform: "uppercase", letterSpacing: 0.4 },
  tRow:      { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  tRowAlt:   { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: "#f8faff" },
  tCell:     { padding: "8 10", fontSize: 9.5, color: NAVY2 },
  tCellBold: { padding: "8 10", fontSize: 9.5, color: NAVY, fontFamily: "Helvetica-Bold" },

  // ── Summary strip ─────────────────────────────────────────────────────────
  sumRow: { flexDirection: "row", paddingHorizontal: 40, paddingTop: 18, paddingBottom: 6, gap: 10 },
  sumCard:{
    flex: 1, borderRadius: 10, padding: "12 16",
    backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: BORDER,
  },
  sumCardDark:{ flex: 1, borderRadius: 10, padding: "12 16", backgroundColor: NAVY },
  sumLabel:{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 },
  sumLabelLight:{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 },
  sumVal:  { fontSize: 22, fontFamily: "Helvetica-Bold", color: NAVY },
  sumValGold:{ fontSize: 22, fontFamily: "Helvetica-Bold", color: GOLD },
  sumNote: { fontSize: 8, color: GRAY, marginTop: 2 },
  sumNoteLight:{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 },

  // ── Signatures ─────────────────────────────────────────────────────────────
  sigRow:  { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 60, marginTop: 14 },
  sigBox:  { alignItems: "center", width: 130 },
  sigLine: { width: 120, borderBottomWidth: 1, borderBottomColor: NAVY3, marginBottom: 6 },
  sigLabel:{ fontSize: 9, color: GRAY },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footerBar:{
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: NAVY, paddingHorizontal: 40, paddingVertical: 10,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  footerL: { fontSize: 8, color: "rgba(255,255,255,0.4)" },
  footerR: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GOLD },
});

// ── Component ─────────────────────────────────────────────────────────────────
const MarksheetPDF = ({ student, results }: { student: any; results: any[] }) => {
  const totalMax  = results.reduce((s: number, r: any) => s + r.subject.max_marks, 0);
  const totalObt  = results.reduce((s: number, r: any) => s + r.marks_obtained, 0);
  const pct       = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(1) : "0.0";
  const grade     = gradeFromPct(parseFloat(pct));
  const passCount = results.filter((r: any) => r.marks_obtained >= r.subject.pass_marks).length;
  const allPassed = passCount === results.length && results.length > 0;
  const examName  = results[0]?.exam?.name ?? "—";
  const examTerm  = results[0]?.exam?.term ?? "";

  return (
    <Document>
      <Page size="A4" style={st.page}>
        {/* ── Header ── */}
        <View style={st.headerBand}>
          <View style={st.headerRow}>
            <View style={st.logo}><Text style={st.logoText}>J</Text></View>
            <View style={st.schoolCol}>
              <Text style={st.schoolName}>Jamia Khadijatul Kubra</Text>
              <Text style={st.schoolSub}>Lil Banat — For Girls · School Management System</Text>
            </View>
            <View style={st.reportBadge}><Text>REPORT CARD</Text></View>
          </View>
          <View style={st.goldLine} />
        </View>

        {/* ── Student meta ── */}
        <View style={st.metaBand}>
          <View style={{ flex: 1 }}>
            <Text style={st.metaName}>{student.first_name} {student.last_name}</Text>
            <View style={st.metaGrid}>
              {[
                ["ENROLLMENT", student.enrollment_id],
                ["CLASS", `${student.class.display_name}${student.class.section ? ` (${student.class.section})` : ""}`],
                ["D.O.B", new Date(student.dob).toLocaleDateString("en-GB")],
                ["ISSUED ON", new Date().toLocaleDateString("en-GB")],
              ].map(([l, v]) => (
                <View key={l} style={st.metaItem}>
                  <Text style={st.metaLabel}>{l}:</Text>
                  <Text style={st.metaVal}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={st.examBadge}>
            <Text>{examName}</Text>
            {examTerm ? <Text style={{ fontSize: 8, marginTop: 3 }}>{examTerm}</Text> : null}
          </View>
        </View>

        {/* ── Table ── */}
        <View style={st.tableWrap}>
          <Text style={st.tableTitle}>Subject-wise Performance</Text>
          <View style={st.tHead}>
            {[["Subject",3],["Max",1],["Pass",1],["Obtained",1],["Pct",1],["Grade",1],["Result",1]].map(([h, f],i) => (
              <View key={i} style={{ ...st.tHCell, flex: f as number }}>
                <Text>{h}</Text>
              </View>
            ))}
          </View>
          {results.map((r: any, i: number) => {
            const p = Math.round((r.marks_obtained / r.subject.max_marks) * 100);
            const g = gradeFromPct(p);
            const passed = r.marks_obtained >= r.subject.pass_marks;
            const row = i % 2 === 0 ? st.tRow : st.tRowAlt;
            return (
              <View key={i} style={row}>
                <View style={{ flex: 3 }}><Text style={st.tCellBold}>{r.subject.name}</Text></View>
                <View style={{ flex: 1 }}><Text style={{ ...st.tCell, textAlign: "center" }}>{r.subject.max_marks}</Text></View>
                <View style={{ flex: 1 }}><Text style={{ ...st.tCell, textAlign: "center" }}>{r.subject.pass_marks}</Text></View>
                <View style={{ flex: 1 }}><Text style={{ ...st.tCellBold, textAlign: "center" }}>{r.marks_obtained}</Text></View>
                <View style={{ flex: 1 }}><Text style={{ ...st.tCell, textAlign: "center", color: GRAY }}>{p}%</Text></View>
                <View style={{ flex: 1 }}><Text style={{ ...st.tCellBold, textAlign: "center", color: gradeColor(g) }}>{g}</Text></View>
                <View style={{ flex: 1 }}><Text style={{ ...st.tCellBold, textAlign: "center", color: passed ? PASS : FAIL }}>{passed ? "PASS" : "FAIL"}</Text></View>
              </View>
            );
          })}
        </View>

        {/* ── Summary cards ── */}
        <View style={st.sumRow}>
          <View style={st.sumCard}>
            <Text style={st.sumLabel}>Total Marks</Text>
            <Text style={st.sumVal}>{totalObt}<Text style={{ fontSize: 13, color: GRAY }}>/{totalMax}</Text></Text>
            <Text style={st.sumNote}>Marks Obtained</Text>
          </View>
          <View style={st.sumCard}>
            <Text style={st.sumLabel}>Percentage</Text>
            <Text style={st.sumVal}>{pct}%</Text>
            <Text style={st.sumNote}>{passCount}/{results.length} subjects passed</Text>
          </View>
          <View style={st.sumCardDark}>
            <Text style={st.sumLabelLight}>Overall Grade</Text>
            <Text style={st.sumValGold}>{grade}</Text>
            <Text style={st.sumNoteLight}>{allPassed ? "✓ All Subjects Passed" : "Some subjects failed"}</Text>
          </View>
        </View>

        {/* ── Signatures ── */}
        <View style={st.sigRow}>
          {["Class Teacher","Academic Registrar","Principal"].map((s) => (
            <View key={s} style={st.sigBox}>
              <View style={st.sigLine} />
              <Text style={st.sigLabel}>{s}</Text>
            </View>
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={st.footerBar} fixed>
          <Text style={st.footerL}>Official Document · Jamia Khadijatul Kubra · Not valid without seal</Text>
          <Text style={st.footerR}>jamia.edu · {new Date().getFullYear()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { studentId } = await params;

  // Students can only download their own marksheet
  if (session.user.role === "STUDENT" && studentId !== "me") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let queryId = studentId;

  // "me" → resolve to actual student id
  if (studentId === "me") {
    const s = await prisma.student.findUnique({ where: { user_id: session.user.id } });
    if (!s) return new NextResponse("Student profile not found", { status: 404 });
    queryId = s.id;
  }

  const student = await prisma.student.findUnique({
    where: { id: queryId },
    include: { class: true },
  });
  if (!student) return new NextResponse("Student not found", { status: 404 });

  const results = await prisma.result.findMany({
    where: { student_id: queryId },
    include: { subject: true, exam: true },
    orderBy: [{ exam: { name: "asc" } }, { subject: { name: "asc" } }],
  });

  const stream = await ReactPDF.renderToStream(
    <MarksheetPDF student={student} results={results} />
  );

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      "Content-Disposition": `attachment; filename="Marksheet_${student.enrollment_id}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
