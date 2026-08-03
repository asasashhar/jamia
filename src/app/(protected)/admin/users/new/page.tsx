import { ActionBtn } from "@/components/ui/shared";
import { UserCog, ArrowLeft, Mail, Shield } from "lucide-react";

export default function NewUserPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <ActionBtn href="/admin/users" variant="outline"><ArrowLeft className="w-4 h-4" /> Back</ActionBtn>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New User</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create a new system user account.</p>
        </div>
      </div>

      <form className="space-y-6">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">User Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="User's full name" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email <span className="text-red-500">*</span></label>
              <input type="email" placeholder="user@jamia.edu" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input type="tel" placeholder="+91 9999999999" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Role <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
                <option value="GUARDIAN">Guardian</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password <span className="text-red-500">*</span></label>
              <input type="password" placeholder="Min. 8 characters" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-4">
          <ActionBtn href="/admin/users" variant="outline">Cancel</ActionBtn>
          <ActionBtn href="/admin/users"><UserCog className="w-4 h-4" /> Create User</ActionBtn>
        </div>
      </form>
    </div>
  );
}
