import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";
import ReactPDF, { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { auth } from "@/auth";

// ──────────────────────────────────────────────────────────────────────────────
//  BEAUTIFUL PDF TEMPLATE — Navy / Gold Palette
// ──────────────────────────────────────────────────────────────────────────────
const G     = "#0f172a";   // navy primary
const G2    = "#1e293b";   // navy mid
const G3    = "#334155";   // navy light
const GOLD  = "#D4A017";   // accent gold
const LIGHT = "#fefce8";   // cream
const GRAY  = "#64748b";
const BORDER= "#e2e8f0";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, backgroundColor: "#fff" },

  // ── Header ──
  headerBand: { backgroundColor: G, paddingHorizontal: 40, paddingTop: 28, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoBox: { width: 44, height: 44, backgroundColor: GOLD, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoLetter: { color: G, fontSize: 24, fontFamily: "Helvetica-Bold" },
  schoolBlock: { flex: 1, paddingLeft: 12 },
  schoolName: { fontSize: 17, fontFamily: "Helvetica-Bold", color: "#fff", letterSpacing: 0.3 },
  schoolSub: { fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  reportTag: { backgroundColor: GOLD, color: G, fontSize: 8, fontFamily: "Helvetica-Bold", padding: "4 12", borderRadius: 99, letterSpacing: 1 },
  goldBar: { height: 3, backgroundColor: GOLD, marginTop: 16 },

  // ── Meta strip ──
  metaStrip: { flexDirection: "row", justifyContent: "space-between", backgroundColor: LIGHT, paddingHorizontal: 40, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: GOLD },
  metaItem: { alignItems: "center" },
  metaLabel: { fontSize: 7.5, color: GRAY, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: G },

  // ── Table ──
  tableSection: { paddingHorizontal: 40, paddingTop: 20 },
  tableHead: { flexDirection: "row", backgroundColor: G2, borderRadius: "6 6 0 0", overflow: "hidden" },
  tableHeadCell: { paddingVertical: 9, paddingHorizontal: 10, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: GOLD, textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowAlt: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: "#f8faff" },
  tableCell: { paddingVertical: 8, paddingHorizontal: 10, fontSize: 9.5, color: G2 },
  tableCellBold: { paddingVertical: 8, paddingHorizontal: 10, fontSize: 9.5, color: G, fontFamily: "Helvetica-Bold" },

  // ── Footer ──
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: G, paddingHorizontal: 40, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerLeft: { fontSize: 8, color: "rgba(255,255,255,0.4)" },
  footerRight: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GOLD },

  // ── Summary ──
  summaryRow: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 24 },
  summaryCard: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 8, padding: "10 14", borderWidth: 1, borderColor: BORDER },
  summaryCardDark: { flex: 1, backgroundColor: G, borderRadius: 8, padding: "10 14" },
  summaryLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  summaryLabelLight: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontFamily: "Helvetica-Bold", color: G },
  summaryValueLight: { fontSize: 20, fontFamily: "Helvetica-Bold", color: GOLD },
});

function colFlex(count: number) {
  return { flex: 1 / count };
}

function ReportPDF({ title, reportType, columns, rows, summaries }: {
  title: string;
  reportType: string;
  columns: string[];
  rows: string[][];
  summaries?: { label: string; value: string; dark?: boolean }[];
}) {
  const generated = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const colWidth = { flex: 1 / columns.length };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.headerBand}>
          <View style={s.headerRow}>
            <View style={s.logoBox}><Text style={s.logoLetter}>J</Text></View>
            <View style={s.schoolBlock}>
              <Text style={s.schoolName}>Jamia Khadijatul Kubra</Text>
              <Text style={s.schoolSub}>Lil Banat — For Girls · School Management System</Text>
            </View>
            <View style={s.reportTag}><Text>{reportType.toUpperCase()}</Text></View>
          </View>
          <View style={s.goldBar} />
        </View>

        {/* ── Meta strip ── */}
        <View style={s.metaStrip}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Report</Text>
            <Text style={s.metaValue}>{title}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Total Records</Text>
            <Text style={s.metaValue}>{rows.length}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Generated On</Text>
            <Text style={s.metaValue}>{generated}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Academic Year</Text>
            <Text style={s.metaValue}>2025–26</Text>
          </View>
        </View>

        {/* ── Summary Cards ── */}
        {summaries && summaries.length > 0 && (
          <View style={{ ...s.summaryRow, paddingHorizontal: 40, marginTop: 16 }}>
            {summaries.map((sum, i) =>
              sum.dark
                ? <View key={i} style={s.summaryCardDark}><Text style={s.summaryLabelLight}>{sum.label}</Text><Text style={s.summaryValueLight}>{sum.value}</Text></View>
                : <View key={i} style={s.summaryCard}><Text style={s.summaryLabel}>{sum.label}</Text><Text style={s.summaryValue}>{sum.value}</Text></View>
            )}
          </View>
        )}

        {/* ── Table ── */}
        <View style={s.tableSection}>
          <View style={s.tableHead}>
            {columns.map((col, i) => (
              <View key={i} style={{ ...s.tableHeadCell, ...colWidth }}>
                <Text>{col}</Text>
              </View>
            ))}
          </View>
          {rows.map((row, ri) => (
            <View key={ri} style={ri % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              {row.map((cell, ci) => (
                <View key={ci} style={colWidth}>
                  <Text style={ci === 0 ? s.tableCellBold : s.tableCell}>{cell ?? "—"}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>This document is system-generated · Jamia Khadijatul Kubra</Text>
          <Text style={s.footerRight}>jamia.edu · {new Date().getFullYear()}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
//  XLSX STYLING HELPER
// ──────────────────────────────────────────────────────────────────────────────
function buildExcel(title: string, columns: string[], data: Record<string, unknown>[]) {
  const ws = xlsx.utils.json_to_sheet(data);

  // Header row styling
  const range = xlsx.utils.decode_range(ws["!ref"] || "A1");
  ws["!cols"] = columns.map(() => ({ wch: 22 }));

  // Bold + color header cells
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = xlsx.utils.encode_cell({ r: 0, c });
    if (!ws[cell]) continue;
    ws[cell].s = {
      font: { bold: true, color: { rgb: "D4A017" }, sz: 11 },
      fill: { fgColor: { rgb: "1e293b" }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "1e293b" } },
        bottom: { style: "thin", color: { rgb: "1e293b" } },
        left: { style: "thin", color: { rgb: "1e293b" } },
        right: { style: "thin", color: { rgb: "1e293b" } },
      },
    };
  }

  // Data rows
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = xlsx.utils.encode_cell({ r, c });
      if (!ws[cell]) continue;
      ws[cell].s = {
        fill: { fgColor: { rgb: r % 2 === 0 ? "f8faff" : "ffffff" }, patternType: "solid" },
        border: {
          top: { style: "hair", color: { rgb: "e2e8f0" } },
          bottom: { style: "hair", color: { rgb: "e2e8f0" } },
          left: { style: "hair", color: { rgb: "e2e8f0" } },
          right: { style: "hair", color: { rgb: "e2e8f0" } },
        },
        alignment: { vertical: "center" },
      };
    }
  }

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, title.substring(0, 31));
  return xlsx.write(wb, { type: "buffer", bookType: "xlsx", cellStyles: true });
}

// ──────────────────────────────────────────────────────────────────────────────
//  MAIN HANDLER
// ──────────────────────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role ?? "")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { type } = await params;
  const fmt = req.nextUrl.searchParams.get("format") || "excel";

  let columns: string[] = [];
  let rows: string[][] = [];
  let data: Record<string, unknown>[] = [];
  let title = "Report";
  let summaries: { label: string; value: string; dark?: boolean }[] = [];

  // ── Students ──────────────────────────────────────────────────────────────
  if (type === "students") {
    title = "Students Roster";
    const students = await prisma.student.findMany({
      include: { class: true },
      orderBy: { first_name: "asc" },
    });
    const enrolled = students.filter(s => s.status === "ENROLLED").length;
    const applicants = students.filter(s => s.status === "APPLICANT").length;
    summaries = [
      { label: "Total Students", value: students.length.toString() },
      { label: "Enrolled", value: enrolled.toString() },
      { label: "Applicants", value: applicants.toString() },
      { label: "Alumni", value: (students.length - enrolled - applicants).toString(), dark: true },
    ];
    columns = ["Enrollment ID", "Full Name", "Class", "Section", "Status", "Guardian", "Phone", "DOB"];
    rows = students.map(s => [
      s.enrollment_id,
      `${s.first_name} ${s.last_name}`,
      s.class.display_name,
      s.class.section || "—",
      s.status,
      s.guardian_name,
      s.guardian_phone,
      new Date(s.dob).toLocaleDateString("en-IN"),
    ]);
    data = students.map(s => ({
      "Enrollment ID": s.enrollment_id,
      "First Name": s.first_name,
      "Last Name": s.last_name,
      "Class": s.class.display_name,
      "Section": s.class.section || "—",
      "Status": s.status,
      "Guardian Name": s.guardian_name,
      "Guardian Phone": s.guardian_phone,
      "Guardian Email": s.guardian_email || "—",
      "Address": s.address || "—",
      "DOB": new Date(s.dob).toLocaleDateString("en-IN"),
    }));

  // ── Fees ────────────────────────────────────────────────────────────────
  } else if (type === "fees") {
    title = "Fee Collection Report";
    const fees = await prisma.feeRecord.findMany({
      include: { student: { include: { class: true } } },
      orderBy: { due_date: "desc" },
    });
    const totalCollected = fees.reduce((s, f) => s + f.paid_amount, 0);
    const totalPending = fees.reduce((s, f) => s + Math.max(0, f.total_amount - f.paid_amount), 0);
    summaries = [
      { label: "Total Collected", value: `₹${totalCollected.toLocaleString("en-IN")}` },
      { label: "Pending", value: `₹${totalPending.toLocaleString("en-IN")}` },
      { label: "Total Records", value: fees.length.toString() },
      { label: "Paid in Full", value: fees.filter(f => f.status === "PAID").length.toString(), dark: true },
    ];
    columns = ["Receipt", "Student", "Class", "Fee Type", "Total Amt", "Paid", "Due Date", "Status"];
    rows = fees.map(f => [
      f.receipt_number || "—",
      `${f.student.first_name} ${f.student.last_name}`,
      f.student.class?.display_name || "—",
      f.fee_type,
      `₹${f.total_amount.toLocaleString("en-IN")}`,
      `₹${f.paid_amount.toLocaleString("en-IN")}`,
      new Date(f.due_date).toLocaleDateString("en-IN"),
      f.status,
    ]);
    data = fees.map(f => ({
      "Receipt No": f.receipt_number || "—",
      "Student": `${f.student.first_name} ${f.student.last_name}`,
      "Class": f.student.class?.display_name || "—",
      "Fee Type": f.fee_type,
      "Total Amount (₹)": f.total_amount,
      "Paid Amount (₹)": f.paid_amount,
      "Balance (₹)": Math.max(0, f.total_amount - f.paid_amount),
      "Due Date": new Date(f.due_date).toLocaleDateString("en-IN"),
      "Status": f.status,
      "Payment Date": f.payment_date ? new Date(f.payment_date).toLocaleDateString("en-IN") : "—",
    }));

  // ── Teachers ──────────────────────────────────────────────────────────────
  } else if (type === "teachers") {
    title = "Teacher Roster";
    const teachers = await prisma.teacher.findMany({
      include: { user: true, subjects: true, classes: true },
      orderBy: { staff_id: "asc" },
    });
    const active = teachers.filter(t => t.status === "ACTIVE").length;
    summaries = [
      { label: "Total Teachers", value: teachers.length.toString() },
      { label: "Active", value: active.toString() },
      { label: "On Leave", value: (teachers.length - active).toString() },
      { label: "Avg Salary", value: teachers.length ? `₹${Math.round(teachers.reduce((s, t) => s + t.salary, 0) / teachers.length).toLocaleString("en-IN")}` : "—", dark: true },
    ];
    columns = ["Staff ID", "Name", "Title", "Designation", "Qualifications", "Salary", "Status", "Subjects"];
    rows = teachers.map(t => [
      t.staff_id,
      t.user.name || t.user.email,
      t.title,
      t.designation,
      t.qualifications,
      `₹${t.salary.toLocaleString("en-IN")}`,
      t.status,
      t.subjects.length.toString(),
    ]);
    data = teachers.map(t => ({
      "Staff ID": t.staff_id,
      "Name": t.user.name || "—",
      "Email": t.user.email,
      "Title": t.title,
      "Designation": t.designation,
      "Qualifications": t.qualifications,
      "Salary (₹)": t.salary,
      "Status": t.status,
      "No. of Subjects": t.subjects.length,
      "No. of Classes": t.classes.length,
    }));

  // ── Classes ──────────────────────────────────────────────────────────────
  } else if (type === "classes") {
    title = "Classes Report";
    const classes = await prisma.class.findMany({
      include: { class_teacher: { include: { user: true } }, students: true, subjects: true },
      orderBy: { level_order: "asc" },
    });
    summaries = [
      { label: "Total Classes", value: classes.length.toString() },
      { label: "Total Students", value: classes.reduce((s, c) => s + c.students.length, 0).toString() },
      { label: "Total Subjects", value: classes.reduce((s, c) => s + c.subjects.length, 0).toString() },
      { label: "Avg Class Size", value: classes.length ? Math.round(classes.reduce((s, c) => s + c.students.length, 0) / classes.length).toString() : "—", dark: true },
    ];
    columns = ["Class", "Section", "Level", "Class Teacher", "Students", "Max Students", "Subjects"];
    rows = classes.map(c => [
      c.display_name,
      c.section || "—",
      c.level_order.toString(),
      c.class_teacher?.user.name || "—",
      c.students.length.toString(),
      c.max_students.toString(),
      c.subjects.length.toString(),
    ]);
    data = classes.map(c => ({
      "Class Name": c.display_name,
      "Section": c.section || "—",
      "Level Order": c.level_order,
      "Class Teacher": c.class_teacher?.user.name || "—",
      "Students Enrolled": c.students.length,
      "Max Students": c.max_students,
      "No. of Subjects": c.subjects.length,
    }));

  // ── Subjects ──────────────────────────────────────────────────────────────
  } else if (type === "subjects") {
    title = "Subjects Report";
    const subjects = await prisma.subject.findMany({
      include: { class: true, teacher: { include: { user: true } } },
      orderBy: [{ class: { level_order: "asc" } }, { name: "asc" }],
    });
    summaries = [
      { label: "Total Subjects", value: subjects.length.toString() },
      { label: "Theory", value: subjects.filter(s => s.type === "THEORY").length.toString() },
      { label: "Practical", value: subjects.filter(s => s.type === "PRACTICAL").length.toString() },
      { label: "Avg Max Marks", value: subjects.length ? Math.round(subjects.reduce((s, sub) => s + sub.max_marks, 0) / subjects.length).toString() : "—", dark: true },
    ];
    columns = ["Subject", "Code", "Class", "Type", "Max Marks", "Pass Marks", "Teacher"];
    rows = subjects.map(s => [
      s.name,
      s.code,
      s.class.display_name,
      s.type,
      s.max_marks.toString(),
      s.pass_marks.toString(),
      s.teacher?.user.name || "—",
    ]);
    data = subjects.map(s => ({
      "Subject Name": s.name,
      "Code": s.code,
      "Class": s.class.display_name,
      "Type": s.type,
      "Max Marks": s.max_marks,
      "Pass Marks": s.pass_marks,
      "Teacher": s.teacher?.user.name || "—",
    }));

  // ── Results ──────────────────────────────────────────────────────────────
  } else if (type === "results") {
    title = "Exam Results Report";
    const results = await prisma.result.findMany({
      include: { student: { include: { class: true } }, exam: true, subject: true },
      orderBy: [{ exam: { name: "asc" } }, { student: { first_name: "asc" } }],
    });
    const passCount = results.filter(r => r.marks_obtained >= r.subject.pass_marks).length;
    summaries = [
      { label: "Total Results", value: results.length.toString() },
      { label: "Passed", value: passCount.toString() },
      { label: "Failed", value: (results.length - passCount).toString() },
      { label: "Pass Rate", value: results.length ? `${Math.round(passCount / results.length * 100)}%` : "—", dark: true },
    ];
    columns = ["Student", "Class", "Exam", "Subject", "Marks", "Max", "Grade", "Status"];
    rows = results.map(r => {
      const pct = (r.marks_obtained / r.subject.max_marks) * 100;
      const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : pct >= 50 ? "C" : "F";
      const passed = r.marks_obtained >= r.subject.pass_marks;
      return [
        `${r.student.first_name} ${r.student.last_name}`,
        r.student.class.display_name,
        r.exam.name,
        r.subject.name,
        r.marks_obtained.toString(),
        r.subject.max_marks.toString(),
        grade,
        passed ? "Passed" : "Failed",
      ];
    });
    data = results.map(r => {
      const pct = Math.round((r.marks_obtained / r.subject.max_marks) * 100);
      const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : pct >= 50 ? "C" : "F";
      return {
        "Student": `${r.student.first_name} ${r.student.last_name}`,
        "Enrollment ID": r.student.enrollment_id,
        "Class": r.student.class.display_name,
        "Exam": r.exam.name,
        "Term": r.exam.term,
        "Subject": r.subject.name,
        "Marks Obtained": r.marks_obtained,
        "Max Marks": r.subject.max_marks,
        "Percentage (%)": pct,
        "Grade": grade,
        "Result": r.marks_obtained >= r.subject.pass_marks ? "Passed" : "Failed",
        "Remarks": r.remarks || "—",
      };
    });

  // ── Users ──────────────────────────────────────────────────────────────────
  } else if (type === "users") {
    title = "System Users Report";
    const users = await prisma.user.findMany({ orderBy: { role: "asc" } });
    summaries = [
      { label: "Total Users", value: users.length.toString() },
      { label: "Admins", value: users.filter(u => u.role.includes("ADMIN")).length.toString() },
      { label: "Teachers", value: users.filter(u => u.role === "TEACHER").length.toString() },
      { label: "Students", value: users.filter(u => u.role === "STUDENT").length.toString(), dark: true },
    ];
    columns = ["Name", "Email", "Role", "Phone", "Joined"];
    rows = users.map(u => [
      u.name || "—",
      u.email,
      u.role,
      u.phone || "—",
      new Date(u.createdAt).toLocaleDateString("en-IN"),
    ]);
    data = users.map(u => ({
      "Name": u.name || "—",
      "Email": u.email,
      "Role": u.role,
      "Phone": u.phone || "—",
      "Joined": new Date(u.createdAt).toLocaleDateString("en-IN"),
    }));

  // ── Documents ──────────────────────────────────────────────────────────────
  } else if (type === "documents") {
    title = "Documents Registry";
    const docs = await prisma.document.findMany({
      include: { student: true },
      orderBy: { uploaded_at: "desc" },
    });
    summaries = [
      { label: "Total Documents", value: docs.length.toString() },
    ];
    columns = ["Title", "Type", "Student", "Uploaded On"];
    rows = docs.map(d => [
      d.title,
      d.doc_type,
      d.student ? `${d.student.first_name} ${d.student.last_name}` : "—",
      new Date(d.uploaded_at).toLocaleDateString("en-IN"),
    ]);
    data = docs.map(d => ({
      "Title": d.title,
      "Type": d.doc_type,
      "Student": d.student ? `${d.student.first_name} ${d.student.last_name}` : "—",
      "File URL": d.file_url,
      "Uploaded At": new Date(d.uploaded_at).toLocaleDateString("en-IN"),
    }));

  // ── Academic Years ──────────────────────────────────────────────────────────
  } else if (type === "academic-years") {
    title = "Academic Years";
    const years = await prisma.academicYear.findMany({ orderBy: { start_date: "desc" } });
    summaries = [
      { label: "Total Years", value: years.length.toString() },
      { label: "Active", value: years.filter(y => y.is_active).length.toString(), dark: true },
    ];
    columns = ["Year Name", "Start Date", "End Date", "Active", "Admission Open"];
    rows = years.map(y => [
      y.year_name,
      new Date(y.start_date).toLocaleDateString("en-IN"),
      new Date(y.end_date).toLocaleDateString("en-IN"),
      y.is_active ? "Yes" : "No",
      y.is_admission_open ? "Open" : "Closed",
    ]);
    data = years.map(y => ({
      "Year Name": y.year_name,
      "Start Date": new Date(y.start_date).toLocaleDateString("en-IN"),
      "End Date": new Date(y.end_date).toLocaleDateString("en-IN"),
      "Is Active": y.is_active ? "Yes" : "No",
      "Admission Open": y.is_admission_open ? "Open" : "Closed",
    }));

  } else {
    return new NextResponse("Report type not found", { status: 404 });
  }

  // ── Generate output ──────────────────────────────────────────────────────
  const safeTitle = title.replace(/\s+/g, "_");

  if (fmt === "excel") {
    const buf = buildExcel(title, columns, data);
    return new NextResponse(buf, {
      headers: {
        "Content-Disposition": `attachment; filename="${safeTitle}_${new Date().toISOString().slice(0, 10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  }

  if (fmt === "pdf") {
    const stream = await ReactPDF.renderToStream(
      <ReportPDF title={title} reportType={type} columns={columns} rows={rows} summaries={summaries} />
    );
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Disposition": `attachment; filename="${safeTitle}_${new Date().toISOString().slice(0, 10)}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  }

  return new NextResponse("Invalid format", { status: 400 });
}
