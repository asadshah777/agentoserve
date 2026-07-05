import { DashboardStateType } from "@/types/dashboard";
import gptimg from "@/public/icons/gpt.png";
import { create } from "zustand";

export const useDashboard = create<DashboardStateType>((set, get) => ({
  projects: [],
  setProjects: (projects) => set({ projects: projects }),

  openedProject: null,

  setOpenedProject: (project) => set({ openedProject: project }),

  activeTab: "Overview",
  setActiveTab: (tab: string) => set({ activeTab: tab }),

  trainingStarted: false,
  setTrainingStarted: (started: boolean) => set({ trainingStarted: started }),
}));
