"use client";

import { useState } from "react";

interface DashboardLayoutWrapperProps {
  sidebar: (isOpen: boolean, onClose: () => void) => React.ReactNode;
  header: (onOpen: () => void) => React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayoutWrapper({
  sidebar,
  header,
  children,
}: DashboardLayoutWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 flex overflow-hidden font-sans antialiased">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      {sidebar(isOpen, () => setIsOpen(false))}

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen relative z-10 w-full transition-all duration-300">
        {header(() => setIsOpen(true))}
        {children}
      </div>
    </div>
  );
}
