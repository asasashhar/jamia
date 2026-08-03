import { ActionBtn } from "@/components/ui/shared";
import { GraduationCap, ArrowLeft, User, Phone, Mail, Calendar, MapPin, Users } from "lucide-react";

export default function NewStudentPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <ActionBtn href="/admin/students" variant="outline"><ArrowLeft className="w-4 h-4" /> Back</ActionBtn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Student</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Register a new student in the system.</p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Personal Info */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Personal Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">First Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Aisha" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Last Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Binte Umar" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Class <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select class...</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
              <textarea rows={2} placeholder="Full address..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Account & Login</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email <span className="text-red-500">*</span></label>
              <input type="email" placeholder="student@jamia.edu" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password <span className="text-red-500">*</span></label>
              <input type="password" placeholder="Min. 8 characters" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>

        {/* Guardian Info */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Guardian Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Guardian Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Guardian's full name" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Guardian Phone <span className="text-red-500">*</span></label>
              <input type="tel" placeholder="+91 9999999999" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Guardian Email</label>
              <input type="email" placeholder="guardian@example.com" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <ActionBtn href="/admin/students" variant="outline">Cancel</ActionBtn>
          <ActionBtn href="/admin/students"><GraduationCap className="w-4 h-4" /> Save Student</ActionBtn>
        </div>
      </form>
    </div>
  );
}
