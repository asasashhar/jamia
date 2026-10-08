import { auth } from "@/auth";
import { SidebarClient } from "./SidebarClient";

export async function Sidebar() {
  const session = await auth();
  const user = session?.user ?? {
    name: "Super Admin",
    email: "admin@jamia.edu",
    role: "SUPER_ADMIN" as const,
  };

  return (
    <SidebarClient
      name={user.name}
      email={user.email}
      role={user.role}
    />
  );
}
