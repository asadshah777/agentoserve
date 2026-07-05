"use client";

import React, { useState, useEffect } from "react";
import { HiOutlineKey, HiOutlineTrash, HiOutlinePlus, HiOutlineClipboardCopy, HiOutlineCheck, HiOutlineUser } from "react-icons/hi";
import { FiLoader } from "react-icons/fi";

export default function ProfilePage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [addingKey, setAddingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch("http://localhost:5080/api/User/ApiKeys", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    setAddingKey(true);
    setGeneratedKey(null);
    try {
      const res = await fetch("http://localhost:5080/api/User/ApiKeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ KeyName: newKeyName }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedKey(data.key);
        setNewKeyName("");
        fetchApiKeys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingKey(false);
    }
  };

  const handleDeleteKey = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5080/api/User/ApiKeys/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchApiKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage("");
    
    try {
      const res = await fetch("http://localhost:5080/api/User/UpdateProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: profileUsername, Password: profilePassword }),
        credentials: "include"
      });
      if (res.ok) {
        setProfileMessage("Profile updated successfully!");
        setProfileUsername("");
        setProfilePassword("");
      } else {
        const errData = await res.json();
        setProfileMessage(errData.Message || "Failed to update profile.");
      }
    } catch (err) {
      setProfileMessage("An error occurred while updating.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen p-6 md:p-8 overflow-y-auto text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile & Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences and API integrations.</p>
        </div>

        {/* Profile Update Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <HiOutlineUser className="text-lg" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Account Details</h2>
            </div>
            
            <p className="text-sm text-gray-500">
              Update your username or password. Leave password blank if you don't want to change it.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">New Username</label>
                  <input
                    type="text"
                    placeholder="Enter new username"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    className="w-full rounded-xl bg-gray-50 px-4 py-3 text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full rounded-xl bg-gray-50 px-4 py-3 text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingProfile || (!profileUsername && !profilePassword)}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {updatingProfile ? <FiLoader className="animate-spin" /> : null}
                  Update Profile
                </button>
              </div>
              
              {profileMessage && (
                <p className={`text-sm mt-2 ${profileMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {profileMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <HiOutlineKey className="text-lg" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">API Keys</h2>
            </div>
            
            <p className="text-sm text-gray-500">
              Generate API keys to integrate our chat services into your external applications (e.g., your mobile app, website, or custom backend).
            </p>

            {/* List of keys */}
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <FiLoader className="animate-spin" /> Loading keys...
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 text-center text-gray-500 text-sm">
                No API keys generated yet.
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl group hover:border-gray-200 transition-colors">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{key.keyName}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">{key.keyValue.substring(0, 10)}••••••••</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Key"
                    >
                      <HiOutlineTrash className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Add new key form */}
            <form onSubmit={handleAddKey} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Generate New Key</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Key Name (e.g. Production Mobile App)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={addingKey || !newKeyName}
                  className="shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {addingKey ? <FiLoader className="animate-spin" /> : <HiOutlinePlus />}
                  Generate Key
                </button>
              </div>
            </form>

            {generatedKey && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-green-800 font-semibold mb-2">Key generated successfully! Please copy it now as you won't be able to see it again.</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-green-200 rounded-lg p-3 font-mono text-sm text-gray-800 overflow-x-auto whitespace-nowrap">
                    {generatedKey}
                  </div>
                  <button
                    onClick={copyKey}
                    className="flex items-center gap-2 shrink-0 bg-white border border-green-200 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    {copied ? (
                      <>
                        <HiOutlineCheck className="text-lg" /> Copied
                      </>
                    ) : (
                      <>
                        <HiOutlineClipboardCopy className="text-lg" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
