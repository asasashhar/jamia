import { ActionBtn } from "@/components/ui/shared";
import { BookMarked, ArrowLeft } from "lucide-react";

export default function NewSubjectPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <ActionBtn href="/admin/subjects" variant="outline"><ArrowLeft className="w-4 h-4" /> Back</ActionBtn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Subject</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create a subject and assign it to a class.</p>
        </div>
      </div>

      <form className="space-y-6">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Subject Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Subject Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Quran Kareem" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Subject Code <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. QRN-101" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Class <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select class...</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Type <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="THEORY">Theory</option>
                <option value="PRACTICAL">Practical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Max Marks <span className="text-red-500">*</span></label>
              <input type="number" placeholder="100" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Pass Marks <span className="text-red-500">*</span></label>
              <input type="number" placeholder="40" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Assign Teacher</label>
              <select className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Assign later...</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-4">
          <ActionBtn href="/admin/subjects" variant="outline">Cancel</ActionBtn>
          <ActionBtn href="/admin/subjects"><BookMarked className="w-4 h-4" /> Save Subject</ActionBtn>
        </div>
      </form>
    </div>
  );
}
