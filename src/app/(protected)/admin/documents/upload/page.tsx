import { ActionBtn } from "@/components/ui/shared";
import { FileText, ArrowLeft, Upload } from "lucide-react";

export default function UploadDocumentPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <ActionBtn href="/admin/documents" variant="outline"><ArrowLeft className="w-4 h-4" /> Back</ActionBtn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Document</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Upload a document for a student.</p>
        </div>
      </div>

      <form className="space-y-6">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Document Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Student <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select student...</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Document Type <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="TC">Transfer Certificate</option>
                <option value="BIRTH_CERT">Birth Certificate</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Document Title <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Aadhaar Card – Aisha Binte Umar" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Upload File <span className="text-red-500">*</span></label>
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground/60">PDF, JPG, PNG up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-4">
          <ActionBtn href="/admin/documents" variant="outline">Cancel</ActionBtn>
          <ActionBtn href="/admin/documents"><Upload className="w-4 h-4" /> Upload Document</ActionBtn>
        </div>
      </form>
    </div>
  );
}
