import { ReactNode } from "react";
import Link from "next/link";
import { School } from "lucide-react";

export default function AdmissionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-[#0B4A2A] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <School className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide">JAMIA KHADIJATUL KUBRA</h1>
              <p className="text-xs text-green-100 opacity-90">Lil Banat (For Girls)</p>
            </div>
          </Link>
          <Link href="/login" className="text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors">
            Staff / Student Login
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Jamia Khadijatul Kubra Lil Banat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
