"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  HiOutlineFolder,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiOutlineViewGrid,
  HiOutlinePlusCircle,
  HiOutlineCog,
  HiOutlinePencilAlt,
} from "react-icons/hi";

const Sidebar = ({ onMobileClose }: { onMobileClose?: () => void }) => {
  const navigate = useRouter();
  const { activeTab, setActiveTab } = useDashboard();

  // Default to having "Projects" open since it's the main feature
  const [openMenu, setOpenMenu] = useState<string | null>("Projects");

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const subItemClass = (tab: string) =>
    `flex items-center gap-3 pl-11 pr-4 py-2.5 text-sm cursor-pointer rounded-lg mx-2 transition-all duration-200 ${
      activeTab === tab
        ? "bg-blue-50 text-blue-600 font-semibold"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className="w-64 h-full bg-white flex-shrink-0 sticky top-0 border-r border-gray-200 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm tracking-wide">AS</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          Agento<span className="text-blue-600">Serve</span>
        </h2>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-gray-200" />

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {/* PROJECTS SECTION */}
        <div>
          <button
            onClick={() => toggleMenu("Projects")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
              openMenu === "Projects"
                ? "bg-blue-50/50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <HiOutlineFolder
                className={`text-lg transition-colors ${
                  openMenu === "Projects"
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span className="text-sm font-semibold">Projects</span>
            </div>
            <HiOutlineChevronDown
              className={`text-sm transition-transform duration-300 ${
                openMenu === "Projects"
                  ? "rotate-180 text-blue-500"
                  : "text-gray-400"
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openMenu === "Projects"
                ? "max-h-48 opacity-100 mt-1"
                : "max-h-0 opacity-0"
            }`}
          >
            <ul className="space-y-1 mt-1">
              <li
                onClick={() => {
                  setActiveTab("Overview");
                  if (onMobileClose) onMobileClose();
                  navigate.push("/dashboard");
                }}
                className={subItemClass("Overview")}
              >
                <HiOutlineViewGrid className="text-base" />
                Overview
              </li>
              <li
                onClick={() => {
                  setActiveTab("Create Project");
                  if (onMobileClose) onMobileClose();
                  navigate.push("/dashboard/projects/create");
                }}
                className={subItemClass("Create Project")}
              >
                <HiOutlinePlusCircle className="text-base" />
                Create Project
              </li>
            </ul>
          </div>
        </div>

        {/* PROFILE SECTION */}
        <div>
          <button
            onClick={() => toggleMenu("Profile")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
              openMenu === "Profile"
                ? "bg-blue-50/50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
               <HiOutlineUser
                className={`text-lg transition-colors ${
                  openMenu === "Profile"
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span className="text-sm font-semibold">Profile</span>
            </div>
            <HiOutlineChevronDown
              className={`text-sm transition-transform duration-300 ${
                openMenu === "Profile"
                  ? "rotate-180 text-blue-500"
                  : "text-gray-400"
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openMenu === "Profile"
                ? "max-h-24 opacity-100 mt-1"
                : "max-h-0 opacity-0"
            }`}
          >
            <ul className="space-y-1 mt-1">
              <li
                onClick={() => {
                  setActiveTab("Update Profile");
                  if (onMobileClose) onMobileClose();
                  navigate.push("/dashboard/profile");
                }}
                className={subItemClass("Update Profile")}
              >
                <HiOutlinePencilAlt className="text-base" />
                Update Profile
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Divider */}
      <div className="mx-6 h-px bg-gray-200" />

      {/* LOGOUT */}
      <div className="p-4">
        <button
          onClick={() => {
            setActiveTab("Logout");
            if (onMobileClose) onMobileClose();
            navigate.push("/logout");
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
            activeTab === "Logout"
              ? "bg-red-50 text-red-700 font-semibold"
              : "text-gray-700 hover:bg-red-50 hover:text-red-700"
          }`}
        >
          <HiOutlineLogout
            className={`text-lg transition-colors ${
              activeTab === "Logout"
                ? "text-red-600"
                : "text-gray-400 group-hover:text-red-500"
            }`}
          />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
