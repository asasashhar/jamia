import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const role = session.user.role;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      redirect('/admin/dashboard');
    }
    if (role === 'TEACHER') {
      redirect('/teacher/dashboard');
    }
    if (role === 'STUDENT' || role === 'GUARDIAN') {
      redirect('/student/dashboard');
    }
  }

  // If not logged in, redirect to login
  redirect('/login');
}
