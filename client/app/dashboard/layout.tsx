"use client";

import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

interface ProjectsLayoutProps {
  children: React.ReactNode;
}

const ProjectsLayout: React.FC<ProjectsLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm tracking-wide">AS</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            Agento<span className="text-blue-600">Serve</span>
          </h2>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
        >
          {mobileMenuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Component Container */}
      <div className={`
        fixed md:relative top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <Sidebar onMobileClose={() => setMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 h-full overflow-y-auto mt-16 md:mt-0 relative">
        {children}
      </main>
    </div>
  );
};

export default ProjectsLayout;
