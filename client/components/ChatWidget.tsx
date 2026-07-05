"use client";
import { useState, useRef, useEffect } from "react";
import { HiOutlineUser, HiOutlineSparkles, HiArrowUp } from "react-icons/hi";

interface ChatWidgetProps {
  apiEndpoint: string;
  projectId?: string | number;
}

interface Message {
  type: "user" | "recipient";
  query: string;
  projectId: string | number;
}

export default function ChatWidget({
  apiEndpoint,
  projectId,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;

    // 1. Immediately add user message to UI
    setMessages((prev) => [
      ...prev,
      { type: "user", query: userMessage, projectId: projectId || "general" },
    ]);

    // 2. Clear input and set loading state
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Query: userMessage, ProjectId: projectId }),
        credentials: "include",
      });

      const data = await res.json();

      // 3. Add AI response to UI
      setMessages((prev) => [
        ...prev,
        {
          type: "recipient",
          query:
            data?.response || "I received a blank response from the server.",
          projectId: projectId || "general",
        },
      ]);
    } catch (error: any) {
      console.error("Chat API Error: ", error?.message);
      setMessages((prev) => [
        ...prev,
        {
          type: "recipient",
          query: "Error: Could not connect to the AI model. Please try again.",
          projectId: projectId || "general",
        },
      ]);
    } finally {
      // 4. Always turn off loading state
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Message History Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <HiOutlineSparkles className="text-4xl text-gray-300" />
            <p className="text-sm font-medium">
              Send a message to start testing your model.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${
                  msg.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 border border-gray-200 text-blue-500"
                  }`}
                >
                  {msg.type === "user" ? (
                    <HiOutlineUser className="text-sm" />
                  ) : (
                    <HiOutlineSparkles className="text-sm" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm shadow-sm"
                      : "bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.query}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex gap-3 max-w-[85%] flex-row">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-blue-500 flex items-center justify-center shrink-0 mt-1">
                <HiOutlineSparkles className="text-sm" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all p-2">
          <input
            className="flex-1 max-h-32 bg-transparent p-3 outline-none text-gray-800 placeholder-gray-400 text-[15px] resize-none"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={isLoading}
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-xl flex items-center justify-center transition-colors mb-1 mr-1"
          >
            <HiArrowUp className="text-lg" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          AI models can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
