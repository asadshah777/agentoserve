"use client";

import ChatWidget from "@/components/ChatWidget";
import { useDashboard } from "@/hooks/useDashboard";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineArrowRight,
  HiOutlineChip,
  HiOutlineServer,
  HiOutlineClock,
  HiOutlineCode,
  HiOutlineX
} from "react-icons/hi";
import { FiLoader } from "react-icons/fi";
import IntegrationPanel from "@/components/IntegrationPanel";

export type ProjectType = {
  id: number;
  img: string;
  title: string;
  lastEdited?: string;
  aiModel?: string;
  hasFileUploads?: boolean;
  uploadedFiles?: {
    fileName: string;
    filePath: string;
  }[];
};

// Define states that indicate training is actively preventing new sessions
const activeTrainingStates = ["Pending", "Queued", "InProgress", "Running"];

const ProjectSlugPage = () => {
  const { id } = useParams();
  const projectId = id as string;

  const {
    setOpenedProject,
    openedProject,
    setTrainingStarted,
    trainingStarted,
  } = useDashboard();

  const setOpenedProjectRef = useRef(setOpenedProject);
  setOpenedProjectRef.current = setOpenedProject;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [project, setProject] = useState<ProjectType | null>(null);
  const [statusText, setStatusText] = useState<string>("Not Started");
  const [showIntegrations, setShowIntegrations] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    async function fetchProject() {
      setLoading(true);
      setNotFound(false);

      try {
        const res = await fetch(
          `http://localhost:5080/api/Project/GetProject/${projectId}`,
          { credentials: "include" },
        );

        if (!res.ok) {
          if (isMounted) setNotFound(true);
          return;
        }

        const data = await res.json();
        const projectData = data?.data ?? data;

        if (!isMounted) return;

        if (!projectData) {
          setNotFound(true);
        } else {
          const safeProject: ProjectType = {
            id: projectData.id,
            img: projectData.img ?? "/default-project.png",
            title: projectData.title ?? "Untitled Project",
            lastEdited: projectData.lastEdited ?? undefined,
            aiModel: projectData.aiModel ?? "Unknown",
            hasFileUploads: projectData.hasFileUploads ?? false,
            uploadedFiles: data.uploadedFiles || data.UploadedFiles || projectData.uploadedFiles || projectData.UploadedFiles || [],
          };

          setProject(safeProject);
          setOpenedProjectRef.current(safeProject);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  useEffect(() => {
    async function checkTrainingStatus() {
      try {
        const res = await fetch(
          `http://localhost:5080/api/Project/GetTrainingStatus/${projectId}`,
          { credentials: "include" },
        );

        if (!res.ok || res.status === 404) {
          setTrainingStarted(false);
          setStatusText("Not Started");
          return;
        }

        const data = await res.json();
        if (data?.Message === "NOT-RUNNING") {
          setTrainingStarted(false);
          setStatusText("Not Started");
          return;
        }

        const isCurrentlyActive = activeTrainingStates.includes(data.status);
        setTrainingStarted(isCurrentlyActive);
        setStatusText(data.status || "Unknown");
      } catch (err) {
        console.error("Error checking training status:", err);
      }
    }

    if (projectId) {
      checkTrainingStatus();
    }
  }, [projectId, setTrainingStarted]);

  const handleContextTraining = async () => {
    setTrainingStarted(true);
    setStatusText("Pending");

    try {
      const res = await fetch(
        `http://localhost:5080/api/Project/StartTraining/${projectId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Failed to start training");

      // Optionally re-trigger status check here if your backend doesn't socket the response
    } catch (error) {
      console.error("Error starting training:", error);
      setTrainingStarted(false);
      setStatusText("Failed");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen w-full flex items-center justify-center">
        <FiLoader className="text-4xl text-blue-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen w-full flex flex-col items-center justify-center">
        <HiOutlineServer className="text-6xl text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">
          Workspace Not Found
        </h1>
        <p className="text-gray-500 mt-2">
          The project you are looking for does not exist or was deleted.
        </p>
      </div>
    );
  }

  const hasPendingFiles = project?.uploadedFiles?.some(
    (f: any) => !f.isTrained && !f.IsTrained
  );

  const isTrainingDisabled =
    trainingStarted ||
    activeTrainingStates.includes(statusText) ||
    (statusText === "Completed" && !hasPendingFiles);

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-theme(spacing.16))] w-full p-6 md:p-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* LEFT PANE: Project Configuration & Knowledge Base */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {project.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-400 text-sm mt-3">
                  <HiOutlineClock className="text-lg" />
                  <span>
                    {project.lastEdited
                      ? `Edited ${new Date(project.lastEdited).toLocaleDateString()}`
                      : "Newly created"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowIntegrations(true)}
                className="flex items-center gap-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors shrink-0"
              >
                <HiOutlineCode className="text-lg text-blue-500" />
                Integrations
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <HiOutlineChip className="text-blue-500" /> Model
                </span>
                <p className="font-medium text-gray-800 mt-1">
                  {(() => {
                    const models: Record<string, string> = {
                      "gpt-4o": "GPT-4o",
                      "gpt-4o-mini": "GPT-4o Mini",
                      "claude-3-5-sonnet": "Claude 3.5 Sonnet",
                      "claude-3-haiku": "Claude 3 Haiku",
                      "Meta-Llama-3.1-405B-Instruct": "Llama 3.1 405B",
                      "Mistral-large": "Mistral Large",
                      "Phi-3-medium-4k-instruct": "Phi-3 Medium",
                    };
                    const modelKey = project.aiModel || "";
                    return models[modelKey] || (project.aiModel?.toUpperCase() ?? "GPT-4");
                  })()}
                </p>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <HiOutlineServer className="text-blue-500" /> Context
                </span>
                <p className="font-medium text-gray-800 mt-1">
                  {project.hasFileUploads ? `${project.uploadedFiles?.length || 0} File(s) Attached` : "Empty Canvas"}
                </p>
                {project.hasFileUploads && project.uploadedFiles && project.uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                    {project.uploadedFiles.map((file: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-50 border border-gray-100 rounded-md">
                        <span className="truncate text-gray-600 font-medium mr-2">{file.fileName || file.FileName}</span>
                        {file.isTrained || file.IsTrained ? (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold shrink-0">Trained</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold shrink-0">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Training Control Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
              Model Training
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Process your knowledge base to improve the AI's contextual
              accuracy.
            </p>

            {project.hasFileUploads ? (
              <div className="mt-auto">
                <button
                  onClick={handleContextTraining}
                  disabled={isTrainingDisabled}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    statusText === "Completed" && !hasPendingFiles
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                  }`}
                >
                  {trainingStarted ? (
                    <>
                      <FiLoader className="animate-spin text-lg" />
                      {statusText}
                    </>
                  ) : statusText === "Completed" && !hasPendingFiles ? (
                    "Trained"
                  ) : (
                    "Start Training"
                  )}
                  {!isTrainingDisabled && <HiOutlineArrowRight />}
                </button>
                {trainingStarted && (
                  <p className="text-xs text-center text-blue-600 font-medium animate-pulse mt-3">
                    Training is currently running...
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  Upload files to the knowledge base before initiating training.
                </p>
              </div>
            )}
          </div>

          {/* Files Card */}
          {project.uploadedFiles && project.uploadedFiles.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Knowledge Base Files
              </h3>
              <ul className="space-y-2 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                {project.uploadedFiles.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg group hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <HiOutlineDocumentText className="text-blue-500 text-lg shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {file.fileName}
                      </span>
                    </div>
                    <a
                      href={`http://localhost:5080/${file.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Embedded Chat Interface */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[600px] lg:h-[calc(100vh-8rem)] relative lg:sticky lg:top-8">
          <div className="bg-gray-50/80 border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
              <h2 className="text-sm font-bold text-gray-800">Playground</h2>
            </div>
          </div>

          {/* NOTE: For this to look perfect, ensure your <ChatWidget /> component 
            does NOT have 'position: fixed' or 'bottom/right' CSS rules. 
            It should rely on 'flex-1' or 'h-full w-full' to fill this container.
          */}
          <div className="flex-1 relative w-full h-full">
            <ChatWidget
              projectId={projectId}
              apiEndpoint={`http://localhost:5080/api/Project/${projectId}/Chat/Internal`}
            />
          </div>
        </div>
      </div>

      {showIntegrations && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowIntegrations(false)}
              className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-200 rounded-full text-gray-600 transition-colors z-10"
            >
              <HiOutlineX className="text-xl" />
            </button>
            <div className="flex-1 overflow-hidden rounded-2xl">
              <IntegrationPanel projectId={projectId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSlugPage;
