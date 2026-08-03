import { ActionBtn } from "@/components/ui/shared";
import { BookOpen, ArrowLeft, Users, GraduationCap } from "lucide-react";

export default function NewClassPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <ActionBtn href="/admin/classes" variant="outline"><ArrowLeft className="w-4 h-4" /> Back</ActionBtn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Class</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create a new class or section.</p>
        </div>
      </div>

      <form className="space-y-6">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Class Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Internal Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. ula_a" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Display Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Ula (1st Year)" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Section <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. A" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Level / Year Order <span className="text-red-500">*</span></label>
              <input type="number" placeholder="1" min="1" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Max Students</label>
              <input type="number" placeholder="40" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Class Teacher</label>
              <select className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Assign later...</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-4">
          <ActionBtn href="/admin/classes" variant="outline">Cancel</ActionBtn>
          <ActionBtn href="/admin/classes"><BookOpen className="w-4 h-4" /> Save Class</ActionBtn>
        </div>
      </form>
    </div>
  );
}
