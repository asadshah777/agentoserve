"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useAlert } from "./Alert";
import { useDashboard } from "@/hooks/useDashboard";

import {
  HiOutlineLightningBolt,
  HiOutlineDocumentText,
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineSparkles,
  HiOutlinePencilAlt,
  HiOutlineChip,
} from "react-icons/hi";
import { FiLoader } from "react-icons/fi";

import gptIcon from "@/public/icons/gpt.png";
import claudeIcon from "@/public/icons/claude.png";
import geminiIcon from "@/public/icons/gemini.png";

const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

export default function NewProjectForm() {
  const [title, setTitle] = useState("");
  const [chatModel, setChatModel] = useState("Meta-Llama-3.1-405B-Instruct");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const { showAlert } = useAlert();
  const { setActiveTab } = useDashboard();

  const chatModelOptions = [
    { value: "gpt-4o", label: "GPT-4o (High Cost)", icon: gptIcon.src },
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Low Cost)", icon: gptIcon.src },
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet (Medium Cost)", icon: claudeIcon.src },
    { value: "claude-3-haiku", label: "Claude 3 Haiku (Low Cost)", icon: claudeIcon.src },
    { value: "Meta-Llama-3.1-405B-Instruct", label: "Llama 3.1 405B (Free/Low Cost)", icon: geminiIcon.src },
    { value: "Mistral-large", label: "Mistral Large (Medium Cost)", icon: geminiIcon.src },
    { value: "Phi-3-medium-4k-instruct", label: "Phi-3 Medium (Free)", icon: geminiIcon.src },
  ];

  // Custom styles to make react-select match Tailwind inputs
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      padding: "2px",
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#3B82F6" : "#E5E7EB",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
      "&:hover": { borderColor: "#3B82F6" },
      backgroundColor: "#ffffff",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#EFF6FF"
        : state.isFocused
          ? "#F8FAFC"
          : "white",
      color: "#1F2937",
      cursor: "pointer",
    }),
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files).filter((file) =>
      ["application/pdf", "text/plain"].includes(file.type),
    );
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("AIModel", chatModel);
    formData.append("SystemPrompt", systemPrompt);
    formData.append("hasFileUploads", files.length > 0 ? "true" : "false");

    files.forEach((file) => {
      formData.append("UploadedFiles", file);
    });

    try {
      const response = await fetch(
        "http://localhost:5080/api/Project/CreateProject",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      const responseJson = await response.json();

      if (responseJson.message === "Project created successfully") {
        showAlert("Project Created", "success");
        setActiveTab("Overview");
      } else {
        showAlert("Project creation failed", "error");
      }
    } catch (error) {
      showAlert("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen p-6 md:p-8 overflow-y-auto text-gray-800">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            New Project
          </h1>
          <p className="text-gray-500 mt-1">
            Configure your workspace and AI settings to get started.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-6 md:p-8 space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <HiOutlinePencilAlt className="text-blue-500 text-lg" />
                Project Title
              </label>
              <input
                type="text"
                placeholder="e.g., Customer Support Bot"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl bg-white px-4 py-3 text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            <hr className="border-gray-100" />

            {/* Model Settings */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <HiOutlineSparkles className="text-blue-500 text-lg" />
                Chat Model
              </label>
              <ReactSelect
                instanceId="chat-model"
                options={chatModelOptions}
                styles={customSelectStyles}
                value={chatModelOptions.find((o) => o.value === chatModel)}
                onChange={(opt: any) => setChatModel(opt?.value)}
                formatOptionLabel={(option: any) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={option.icon}
                      className="w-5 h-5 object-contain"
                      alt=""
                    />
                    <span className="text-sm font-medium">
                      {option.label}
                    </span>
                  </div>
                )}
              />
            </div>

            <hr className="border-gray-100" />

            {/* System Prompt */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <HiOutlineDocumentText className="text-blue-500 text-lg" />
                System Prompt
              </label>
              <textarea
                rows={5}
                placeholder="Enter system instructions to define how the AI should behave..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-y transition-all min-h-[120px]"
              />
            </div>

            <hr className="border-gray-100" />

            {/* Knowledge Base (Upload) */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <HiOutlineUpload className="text-blue-500 text-lg" />
                Knowledge Base Files
              </label>

              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-xl py-8 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:text-blue-500 transition-colors">
                  <HiOutlineUpload className="text-xl text-gray-400 group-hover:text-blue-500" />
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Click to upload files
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Accepts PDF or TXT
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <HiOutlineDocumentText className="text-blue-500 shrink-0" />
                        <span className="text-sm text-gray-700 font-medium truncate">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                      >
                        <HiOutlineX className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setTitle("");
                setChatModel("Meta-Llama-3.1-405B-Instruct");
                setSystemPrompt("");
                setFiles([]);
              }}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors px-4 py-2"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin text-lg" />
                  Creating...
                </>
              ) : (
                <>
                  <HiOutlineLightningBolt className="text-lg" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
