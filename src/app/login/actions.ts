"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<{ success: boolean; error?: string; redirectTo?: string; session?: any }> {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = (formData.get("password") as string || "").trim();

  if (!email || !password) {
    return { success: false, error: "Please enter your email and password." };
  }

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { success: false, error: "No account found with this email." };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { success: false, error: "Invalid password. Please check your credentials." };
  }

  // Determine target dashboard based on user role
  let target = "/admin/dashboard";
  if (user.role === "TEACHER") {
    target = "/teacher/dashboard";
  } else if (user.role === "STUDENT" || user.role === "GUARDIAN") {
    target = "/student/dashboard";
  }

  // Set the session cookie
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "jamia_session",
      value: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name ?? user.email.split("@")[0],
        role: user.role,
      }),
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (e) {
    console.error("Failed to set jamia_session cookie:", e);
  }

  // Also invoke NextAuth signIn to initialize NextAuth session
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.warn("NextAuth warning:", error.message);
    }
  }

  return {
    success: true,
    redirectTo: target,
    session: {
      id: user.id,
      email: user.email,
      name: user.name ?? user.email.split("@")[0],
      role: user.role,
    },
  };
}
