"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Plus } from "lucide-react";

interface AddItemModalProps {
  title: string;
  buttonText?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

export function AddItemModal({ title, buttonText = "Add", icon: Icon = Plus, children }: AddItemModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-xl shadow-sm hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <Icon className="w-4 h-4" /> {buttonText}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
        {children}
      </Modal>
    </>
  );
}
