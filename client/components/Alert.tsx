"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

type AlertType = "success" | "info" | "error" | "warning";

interface Alert {
  id: number;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
  hideAlert: (id: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback((message: string, type: AlertType = "info") => {
    const id = Date.now();

    setAlerts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      hideAlert(id);
    }, 3000);
  }, []);

  const hideAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const alertStyles: Record<AlertType, string> = {
    success: "bg-green-500 text-white",
    info: "bg-blue-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-400 text-black",
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      {/* Global Alert UI */}
      <div className="fixed top-5 right-5 space-y-3 z-50">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`min-w-[300px] px-4 py-3 rounded-lg shadow-lg flex justify-between items-center animate-slideIn ${alertStyles[alert.type]}`}
          >
            <span>{alert.message}</span>
            <button
              onClick={() => hideAlert(alert.id)}
              className="ml-4 font-bold text-lg"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
}
