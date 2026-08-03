import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/shared";
import { PrintButton } from "./PrintButton";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { GraduationCap } from "lucide-react";

// ─── Design tokens ─────────────────────────────────────────────────────────
const NAVY = "#0f172a";
const NAVY_MID = "#1e293b";
const NAVY_LIGHT = "#334155";
const GOLD = "#D4A017";
const GOLD_LIGHT = "#F5C842";
const GOLD_PALE = "#fef9e7";

export default async function IDCardsPage() {
  const students = await prisma.student.findMany({
    where: { status: "ENROLLED" },
    include: { class: true, user: true },
    orderBy: [{ class: { level_order: "asc" } }, { first_name: "asc" }],
  });

  const initials = (first: string, last: string) =>
    `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

  // Unique avatar color per student based on name
  const avatarPalettes = [
    { from: "#6366f1", to: "#4f46e5" },
    { from: "#ec4899", to: "#db2777" },
    { from: "#0ea5e9", to: "#0284c7" },
    { from: "#f59e0b", to: "#d97706" },
    { from: "#10b981", to: "#059669" },
    { from: "#8b5cf6", to: "#7c3aed" },
  ];
  const palette = (name: string) =>
    avatarPalettes[name.charCodeAt(0) % avatarPalettes.length];

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader title="Student ID Cards" description="Generate and print official student identity cards.">
          <ExportMenu type="students" />
          <PrintButton />
        </PageHeader>
      </div>

      {students.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No Enrolled Students</h3>
          <p className="text-sm text-muted-foreground">Enroll students first to generate ID cards.</p>
        </div>
      ) : (
        <div
          className="grid gap-6 print:gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}
        >
          {students.map((student) => {
            const p = palette(student.first_name);
            const init = initials(student.first_name, student.last_name);

            return (
              <div
                key={student.id}
                className="print:break-inside-avoid"
                style={{
                  width: "100%",
                  maxWidth: 360,
                  margin: "0 auto",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(15,23,42,0.25), 0 4px 16px rgba(15,23,42,0.15)",
                  background: "white",
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                }}
              >
                {/* ── TOP HEADER ── */}
                <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`, padding: "18px 20px 14px" }}>
                  {/* School branding */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    {/* Logo mark */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 4px 12px ${GOLD}55`,
                    }}>
                      <GraduationCap style={{ width: 22, height: 22, color: NAVY }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#ffffff", fontWeight: 800, fontSize: 13, lineHeight: 1.2, margin: 0 }}>
                        Jamia Khadijatul Kubra
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9.5, margin: "2px 0 0", letterSpacing: "0.04em" }}>
                        Lil Banat · Est. 1990
                      </p>
                    </div>
                  </div>

                  {/* STUDENT ID CARD label strip */}
                  <div style={{
                    background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
                    borderRadius: 6, padding: "4px 12px", display: "inline-block",
                  }}>
                    <p style={{ color: NAVY, fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", margin: 0 }}>
                      STUDENT IDENTITY CARD
                    </p>
                  </div>
                </div>

                {/* ── DECORATIVE DIAMOND STRIP ── */}
                <div style={{ height: 6, background: `linear-gradient(90deg, ${NAVY}, ${NAVY_MID}, ${GOLD}, ${NAVY_MID}, ${NAVY})` }} />

                {/* ── BODY ── */}
                <div style={{ padding: "18px 20px 16px", background: "white" }}>
                  <div style={{ display: "flex", gap: 14 }}>
                    {/* Photo / Avatar */}
                    <div style={{ flexShrink: 0 }}>
                      <div style={{
                        width: 86, height: 100, borderRadius: 14,
                        background: student.user.avatar_url
                          ? "transparent"
                          : `linear-gradient(135deg, ${p.from}, ${p.to})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden",
                        border: `3px solid ${GOLD}`,
                        boxShadow: `0 4px 16px ${GOLD}33`,
                      }}>
                        {student.user.avatar_url ? (
                          <img
                            src={student.user.avatar_url}
                            alt={`${student.first_name} ${student.last_name}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ color: "white", fontWeight: 900, fontSize: 30, letterSpacing: "-0.03em" }}>
                            {init}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: 15, fontWeight: 800, color: NAVY, margin: "0 0 4px",
                        textTransform: "uppercase", letterSpacing: "0.03em", lineHeight: 1.2,
                      }}>
                        {student.first_name} {student.last_name}
                      </h3>

                      {/* Enrollment chip */}
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
                        padding: "3px 10px", borderRadius: 99, marginBottom: 10,
                      }}>
                        <span style={{ color: NAVY, fontSize: 10, fontWeight: 800 }}>
                          {student.enrollment_id}
                        </span>
                      </div>

                      {/* Info rows */}
                      {[
                        { label: "CLASS", val: `${student.class.display_name}${student.class.section ? ` · ${student.class.section}` : ""}` },
                        { label: "D.O.B", val: new Date(student.dob).toLocaleDateString("en-GB") },
                        { label: "PHONE", val: student.guardian_phone },
                      ].map(({ label, val }) => (
                        <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 8, fontWeight: 800, color: NAVY_LIGHT, letterSpacing: "0.08em", minWidth: 36, flexShrink: 0 }}>
                            {label}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: NAVY_MID, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── FOOTER STRIP ── */}
                <div style={{
                  background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
                  padding: "10px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  {/* Barcode decoration */}
                  <div style={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} style={{
                        width: i % 4 === 0 ? 2.5 : 1.5,
                        height: i % 7 === 0 ? 18 : i % 3 === 0 ? 14 : 10,
                        background: i % 2 === 0 ? GOLD : "rgba(255,255,255,0.2)",
                        borderRadius: 1,
                      }} />
                    ))}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: GOLD, fontSize: 9, fontWeight: 700, margin: 0, letterSpacing: "0.06em" }}>
                      AY 2024–25
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 8, margin: "2px 0 0" }}>
                      Valid Card
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
