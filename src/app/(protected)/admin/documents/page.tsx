import { prisma } from "@/lib/prisma";
import { AddItemModal } from "@/components/ui/AddItemModal";
import { StatCard, PageHeader, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, Avatar, ActionBtn, EmptyState } from "@/components/ui/shared";
import { FileText, File, Search, MoreHorizontal, Plus, Download, FolderOpen } from "lucide-react";
import { ExportMenu } from "@/components/ui/ExportMenu";


const docTypeColors: Record<string, string> = {
  AADHAAR:    "bg-blue-100 text-blue-700",
  TC:         "bg-amber-100 text-amber-700",
  BIRTH_CERT: "bg-emerald-100 text-emerald-700",
};

const docTypeLabels: Record<string, string> = {
  AADHAAR:    "Aadhaar Card",
  TC:         "Transfer Certificate",
  BIRTH_CERT: "Birth Certificate",
};

export default async function AdminDocumentsPage() {
  const documents = await prisma.document.findMany({
    include: { student: { include: { class: true } } },
    orderBy: { uploaded_at: "desc" },
  });

  const students = await prisma.student.findMany({
    select: { id: true, first_name: true, last_name: true, enrollment_id: true }
  });

  async function createDocument(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const doc_type = formData.get("type") as string;
    const student_id = formData.get("student_id") as string;
    
    if (!title || !doc_type || !student_id) return;

    await prisma.document.create({
      data: {
        title,
        doc_type,
        student: { connect: { id: student_id } },
        file_url: "/dummy-file-path.pdf" // Placeholder since we can't upload files directly here
      }
    });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/documents");
  }

  const aadhaarCount = documents.filter(d => d.doc_type === "AADHAAR").length;
  const tcCount = documents.filter(d => d.doc_type === "TC").length;
  const bcCount = documents.filter(d => d.doc_type === "BIRTH_CERT").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Manage student documents, certificates and uploaded files.">
        <ExportMenu type="documents" />
        <AddItemModal title="Upload Document" buttonText="Upload Document">
          <form action={createDocument} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Document Title *</label>
                <input type="text" name="title" required placeholder="e.g. Identity Proof" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Document Type *</label>
                <select name="type" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="AADHAAR">ID Proof (Aadhaar/PAN)</option>
                  <option value="TC">Transfer Certificate</option>
                  <option value="BIRTH_CERT">Birth Certificate</option>
                  <option value="PREVIOUS_MARKSHEET">Previous Marksheet</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Student *</label>
                <select name="student_id" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select Student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.enrollment_id})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Upload File *</label>
                <input type="file" name="file_url" required className="w-full h-10 px-3 py-1.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" className="px-4 py-2 text-sm font-semibold border border-border rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">Upload Document</button>
            </div>
          </form>
        </AddItemModal>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Documents" value={documents.length} icon={FileText}
          iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Aadhaar Cards" value={aadhaarCount} icon={File}
          iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Transfer Certs" value={tcCount} icon={File}
          iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Birth Certs" value={bcCount} icon={File}
          iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search by student or document type..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {documents.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No documents uploaded"
            description="Upload student documents like Aadhaar, TC or Birth Certificates." />
        ) : (
          <>
            <TableWrapper>
              <Table>
                <Thead cols={["Student", "Document Title", "Type", "Uploaded On", "Actions"]} />
                <Tbody>
                  {documents.map(doc => (
                    <Tr key={doc.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={`${doc.student.first_name} ${doc.student.last_name}`} size="sm" />
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {doc.student.first_name} {doc.student.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doc.student.enrollment_id} · {doc.student.class.display_name}
                            </p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-foreground">{doc.title}</p>
                        </div>
                      </Td>
                      <Td>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${docTypeColors[doc.doc_type] ?? "bg-muted text-muted-foreground"}`}>
                          {docTypeLabels[doc.doc_type] ?? doc.doc_type}
                        </span>
                      </Td>
                      <Td>
                        <p className="text-sm text-foreground">
                          {new Date(doc.uploaded_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors">
                            <Download className="w-4 h-4" />
                          </a>
                          <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableWrapper>
            <div className="px-6 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              Showing {documents.length} document{documents.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
