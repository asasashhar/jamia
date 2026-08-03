import { prisma } from "@/lib/prisma";
import { AddItemModal } from "@/components/ui/AddItemModal";
import { StatCard, PageHeader, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, Avatar, ActionBtn, EmptyState } from "@/components/ui/shared";
import { UserCog, Users, Shield, UserCheck, Plus, Search, Mail, Phone } from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ExportMenu } from "@/components/ui/ExportMenu";


const roleStyles: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-amber-100 text-amber-800" },
  ADMIN:       { label: "Admin",       color: "bg-violet-100 text-violet-800" },
  TEACHER:     { label: "Teacher",     color: "bg-blue-100 text-blue-800" },
  STUDENT:     { label: "Student",     color: "bg-emerald-100 text-emerald-800" },
  GUARDIAN:    { label: "Guardian",    color: "bg-muted text-muted-foreground" },
};

export default async function AdminUsersPage() {
  async function createUser(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const password = formData.get("password") as string;
    
    await prisma.user.create({
      data: {
        email,
        role,
        password,
        name: email.split("@")[0]
      }
    });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/users");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, name: true, role: true,
      phone: true, createdAt: true,
    },
  });

  const adminCount  = users.filter(u => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;
  const teacherCount = users.filter(u => u.role === "TEACHER").length;
  const studentCount = users.filter(u => u.role === "STUDENT").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage all system user accounts and their roles.">
        <ExportMenu type="users" />
        <AddItemModal title="Add User" buttonText="Add User">
          <form action={createUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium text-foreground">Email Address *</label>
                <input type="email" name="email" required placeholder="user@example.com" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Role *</label>
                <select name="role" required className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="ADMIN">Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Password *</label>
                <input type="password" name="password" required placeholder="min 8 characters" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" className="px-4 py-2 text-sm font-semibold border border-border rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">Save User</button>
            </div>
          </form>
        </AddItemModal>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={users.length} icon={Users}
          iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Admins" value={adminCount} icon={Shield}
          iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Teachers" value={teacherCount} icon={UserCheck}
          iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Students" value={studentCount} icon={UserCog}
          iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search users by name or email..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          {/* Role filter pills */}
          <div className="flex flex-wrap gap-2">
            {["All", "Admin", "Teacher", "Student"].map(r => (
              <button key={r}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-background text-foreground hover:bg-muted transition-colors">
                {r}
              </button>
            ))}
          </div>
        </div>

        {users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Add users to manage access to the system." />
        ) : (
          <>
            <TableWrapper>
              <Table>
                <Thead cols={["User", "Role", "Contact", "Joined", "Actions"]} />
                <Tbody>
                  {users.map(user => {
                    const roleInfo = roleStyles[user.role] ?? { label: user.role, color: "bg-muted text-muted-foreground" };
                    return (
                      <Tr key={user.id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name ?? user.email} />
                            <div>
                              <p className="font-semibold text-foreground text-sm">{user.name ?? "—"}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" /> {user.email}
                              </div>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </Td>
                        <Td>
                          {user.phone ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" /> {user.phone}
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </Td>
                        <Td>
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </Td>
                        <Td className="text-right">
                          <DropdownMenu id={user.id} />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableWrapper>
            <div className="px-6 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              Showing {users.length} user{users.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
