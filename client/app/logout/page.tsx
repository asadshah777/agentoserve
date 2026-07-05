"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function performLogout() {
      try {
        await fetch("http://localhost:5080/api/User/Logout", {
          method: "POST",
          credentials: "include"
        });
      } catch (err) {
        console.error("Logout failed", err);
      }
      
      // Fallback: clear the frontend cookie string just in case
      document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Redirect to login using full window reload to clear any cached states
      window.location.href = "/auth/login";
    }

    performLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Logging out...</p>
      </div>
    </div>
  );
}
