import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#09090b] text-white overflow-hidden font-sans selection:bg-[#22d3ee]/30">
      {/* 
        DashboardLayout now acts as the root provider of the immersive dark theme.
        The Sidebar and other floating elements will be injected by the page/Dashboard component.
      */}
      {children}
    </div>
  );
};