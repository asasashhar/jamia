import { auth } from "@/auth";
import { SidebarClient } from "./SidebarClient";

export async function Sidebar() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <SidebarClient
      name={session.user.name}
      email={session.user.email}
      role={session.user.role}
    />
  );
}
