"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, Sheet, ChevronDown, Loader2 } from "lucide-react";

export function ExportMenu({ type }: { type: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<"pdf" | "excel" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleDownload(fmt: "pdf" | "excel") {
    setLoading(fmt);
    setIsOpen(false);
    // Use anchor trick to trigger download then reset loading after delay
    const link = document.createElement("a");
    link.href = `/api/reports/${type}?format=${fmt}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setLoading(null), 2500);
  }

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!!loading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm glass-panel text-foreground hover:bg-white/60 dark:hover:bg-black/30 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
        ) : (
          <><Download className="w-4 h-4 text-primary" /> Export <ChevronDown className={`w-3.5 h-3.5 ml-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`} /></>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel shadow-xl z-50 overflow-hidden border border-white/30 dark:border-white/10">
          <div className="p-1.5 space-y-0.5">
            <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Download As</p>

            <button
              onClick={() => handleDownload("pdf")}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">PDF Report</p>
                <p className="text-[10px] text-muted-foreground">Branded · Print-ready</p>
              </div>
            </button>

            <button
              onClick={() => handleDownload("excel")}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Sheet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Excel Spreadsheet</p>
                <p className="text-[10px] text-muted-foreground">Styled · Filterable</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
