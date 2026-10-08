"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authenticate } from "./actions";
import { Loader2, Mail, Lock, AlertCircle, ClipboardList, School } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface LoginFormProps {
  isAdmissionOpen?: boolean;
}

export function LoginForm({ isAdmissionOpen }: LoginFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormData) {
    setError(undefined);
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("email", values.email.trim());
      formData.append("password", values.password);
      const res = await authenticate(undefined, formData);
      if (res?.error) {
        setError(res.error);
        setIsPending(false);
      } else {
        const dest = res?.redirectTo || "/admin/dashboard";
        router.push(dest);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <div className="w-full">
      {/* Glassmorphism card */}
      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Gold top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
            <School className="w-8 h-8 text-[#07301A]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
              Jamia Khadijatul Kubra
            </h1>
            <p className="text-amber-300 text-sm font-medium mt-0.5 tracking-wide">
              Lil Banat — School Management System
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-8 h-px bg-white/15 mb-6" />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-white/80 text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="email"
                placeholder="admin@jamia.edu"
                autoComplete="email"
                disabled={isPending}
                {...register("email")}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 transition-all disabled:opacity-60"
              />
            </div>
            {errors.email && (
              <p className="text-red-300 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-white/80 text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isPending}
                {...register("password")}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 transition-all disabled:opacity-60"
              />
            </div>
            {errors.password && (
              <p className="text-red-300 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.password.message}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 text-sm p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-[#07301A] font-bold text-sm shadow-lg hover:shadow-amber-400/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In to Portal"
            )}
          </button>

          {/* Admission Apply Link */}
          {isAdmissionOpen && (
            <div>
              <div className="relative flex items-center my-1">
                <div className="flex-1 h-px bg-white/15" />
                <span className="px-3 text-white/30 text-xs">or</span>
                <div className="flex-1 h-px bg-white/15" />
              </div>
              <a
                href="/admission"
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 font-semibold text-sm hover:bg-amber-400/20 transition-all"
              >
                <ClipboardList className="w-4 h-4" />
                Apply for Admission — Open Now!
              </a>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-white/25 text-xs">
            Secure access powered by Enterprise SMS &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
