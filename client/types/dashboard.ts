export type ProjectType = {
  id: number;
  img: string;
  title: string;
  lastEdited?: string;
  aiModel?: string;
  hasFileUploads?: boolean;
  uploadedFiles?: any[];

  onClick?: () => void;
};

export type DashboardStateType = {
  projects: ProjectType[] | null;
  setProjects: (projects: ProjectType[] | null) => void;
  openedProject: ProjectType | null;
  setOpenedProject: (project: ProjectType | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  trainingStarted: boolean;
  setTrainingStarted: (started: boolean) => void;
};
