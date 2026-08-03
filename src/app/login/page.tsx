import { LoginForm } from "./login-form";
import { prisma } from "@/lib/prisma";

export default async function LoginPage() {
  // Check if admission is currently open
  const activeYear = await prisma.academicYear.findFirst({
    where: { is_active: true },
  });
  const isAdmissionOpen = activeYear?.is_admission_open ?? false;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated deep green gradient background */}
      <div className="absolute inset-0 gradient-animated islamic-pattern" />

      {/* Radial glow overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/30 rounded-full blur-3xl" />
      </div>

      {/* Decorative calligraphy-inspired arcs */}
      <div className="absolute top-0 right-0 opacity-10">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
          <circle cx="400" cy="0" r="300" stroke="white" strokeWidth="0.5" />
          <circle cx="400" cy="0" r="200" stroke="white" strokeWidth="0.5" />
          <circle cx="400" cy="0" r="100" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 opacity-10">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
          <circle cx="0" cy="400" r="300" stroke="white" strokeWidth="0.5" />
          <circle cx="0" cy="400" r="200" stroke="white" strokeWidth="0.5" />
          <circle cx="0" cy="400" r="100" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <LoginForm isAdmissionOpen={isAdmissionOpen} />
      </div>
    </div>
  );
}
