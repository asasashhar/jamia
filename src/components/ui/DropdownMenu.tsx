"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

export function DropdownMenu({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors focus:outline-none"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-card border border-border shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            <button onClick={() => { setIsOpen(false); alert("View feature coming soon!"); }} className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
              <Eye className="w-4 h-4 mr-2 text-muted-foreground" /> View
            </button>
            <button onClick={() => { setIsOpen(false); alert("Edit feature coming soon!"); }} className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
              <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Edit
            </button>
            <button onClick={() => { setIsOpen(false); alert("Delete feature coming soon!"); }} className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-4 h-4 mr-2 text-destructive" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
