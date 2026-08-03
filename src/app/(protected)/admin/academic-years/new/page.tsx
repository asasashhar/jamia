import { ActionBtn } from "@/components/ui/shared";
import { CalendarDays, ArrowLeft } from "lucide-react";

export default function NewAcademicYearPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <ActionBtn href="/admin/academic-years" variant="outline"><ArrowLeft className="w-4 h-4" /> Back</ActionBtn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Academic Year</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create a new academic session.</p>
        </div>
      </div>

      <form className="space-y-6">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Academic Year Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Year Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. 2025–26" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Start Date <span className="text-red-500">*</span></label>
              <input type="date" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">End Date <span className="text-red-500">*</span></label>
              <input type="date" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Set as Active Year</p>
                  <p className="text-xs text-muted-foreground">This will deactivate the current active year</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-4">
          <ActionBtn href="/admin/academic-years" variant="outline">Cancel</ActionBtn>
          <ActionBtn href="/admin/academic-years"><CalendarDays className="w-4 h-4" /> Create Year</ActionBtn>
        </div>
      </form>
    </div>
  );
}
