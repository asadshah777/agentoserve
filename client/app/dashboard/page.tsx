"use client";

import Search from "@/components/Search";
import Project from "@/components/Project";
import gptImg from "@/public/icons/gpt.png";

import { useDashboard } from "@/hooks/useDashboard";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiFilePlus, FiLoader, FiInbox, FiChevronDown } from "react-icons/fi";

const ProjectsPage = () => {
  const navigate = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // UX: Control how many projects are shown initially to prevent clutter
  const [visibleCount, setVisibleCount] = useState<number>(3);

  const { projects, activeTab, setProjects } = useDashboard();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");

  // Retrieve all projects on page load
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5080/api/Project/GetAll`, {
          credentials: "include",
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        setProjects(data.data || []);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!projectId) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [projectId, setProjects]);

  const handleNewProject = () => {
    navigate.push("/dashboard/projects/create");
  };

  const handleLoadMore = () => {
    // Add 4 more to keep the 4-column grid balanced
    setVisibleCount((prev) => prev + 4);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:5080/api/Project/DeleteProject/${projectToDelete}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setProjects(projects.filter((p: any) => p.id !== projectToDelete));
      } else {
        console.error("Failed to delete project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setProjectToDelete(null);
    }
  };

  if (activeTab !== "Overview") return null;

  // Derive visible projects and check if we have more to show
  const visibleProjects = projects?.slice(0, visibleCount) || [];
  const hasMoreProjects = projects && projects?.length > visibleCount;

  return (
    <div className="bg-[#F8FAFC] min-h-screen w-full text-gray-800">
      <div className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-8">
        {/* Header & Search Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Projects
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and access all your recent workspaces.
            </p>
          </div>
          <div className="w-full md:w-96">
            <Search />
          </div>
        </div>

        {/* Project Area */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FiLoader className="text-4xl animate-spin mb-4 text-blue-500" />
              <p>Loading your projects...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Project Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* "Create New" Card (Always Visible) */}
                <button
                  onClick={handleNewProject}
                  className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-6 bg-transparent hover:bg-blue-50/50 hover:border-blue-400 transition-all min-h-[220px] focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <div className="p-4 bg-white shadow-sm text-blue-500 rounded-full group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <FiFilePlus className="text-2xl" />
                  </div>
                  <div className="text-center mt-2">
                    <p className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                      New Project
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Start from a blank canvas
                    </p>
                  </div>
                </button>

                {/* Render Visible Projects */}
                {visibleProjects.length > 0 ? (
                  visibleProjects.map((project: any) => (
                    <div
                      key={project.id}
                      className="transition-transform duration-200 hover:-translate-y-1"
                    >
                      <Project
                        onClick={() =>
                          navigate.push(`/dashboard/projects/${project.id}`)
                        }
                        title={project.title}
                        lastEdited="Just now" // Dynamic data can replace this later
                        id={project.id}
                        img={gptImg.src}
                        onDelete={(id) => setProjectToDelete(id)}
                      />
                    </div>
                  ))
                ) : (
                  /* Empty State (if absolutely no projects exist) */
                  <div className="col-span-1 sm:col-span-1 lg:col-span-2 xl:col-span-3 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-10 bg-white min-h-[220px]">
                    <FiInbox className="text-5xl text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">
                      No recent projects found
                    </p>
                  </div>
                )}
              </div>

              {/* Load More Button */}
              {hasMoreProjects && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleLoadMore}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-full hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    Load More Projects
                    <FiChevronDown className="text-lg" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {projectToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this project? This action cannot be undone and will permanently erase all associated data and files.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center justify-center min-w-[80px] px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-70"
              >
                {deleting ? <FiLoader className="animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
