"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  children: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Open sidebar menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white flex flex-col z-50 border-r border-slate-200 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-6 right-4 z-50">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col h-full" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      </aside>
    </>
  );
}
