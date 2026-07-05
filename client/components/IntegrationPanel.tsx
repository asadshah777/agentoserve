"use client";

import React, { useState } from "react";
import {
  HiOutlineCode,
  HiOutlineLink,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineDeviceMobile,
} from "react-icons/hi";

interface IntegrationPanelProps {
  projectId: string;
}

const IntegrationPanel = ({ projectId }: IntegrationPanelProps) => {
  const [activeTab, setActiveTab] = useState<"api" | "embed" | "native">("api");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const apiUrl = `http://localhost:5080/api/Project/${projectId}/Chat`;

  const embedCode = `<div id="agentoserve-widget-container"></div>
<script>
  (function() {
    const PROJECT_ID = "${projectId || "YOUR_PROJECT_ID"}"; 
    const API_URL = \`http://localhost:5080/api/Project/\${PROJECT_ID}/Chat\`;

    // 1. Inject CSS with animations
    const style = document.createElement('style');
    style.innerHTML = \`
      #as-floating-widget {
        position: fixed; bottom: 20px; right: 20px; width: 350px; height: 500px;
        background: white; border: 1px solid #e5e7eb; border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column;
        font-family: system-ui, -apple-system, sans-serif; overflow: hidden; z-index: 99999;
        transform: translateY(20px); opacity: 0; animation: slideUpFadeIn 0.5s ease-out forwards;
      }
      @keyframes slideUpFadeIn { to { transform: translateY(0); opacity: 1; } }
      #as-chat-header { background: #2563eb; color: white; padding: 16px; font-weight: bold; text-align: center; }
      #as-chat-body { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f8fafc; }
      .as-chips { display: flex; gap: 8px; overflow-x: auto; padding: 0 16px 12px 16px; background: #f8fafc; }
      .as-chip { background: white; border: 1px solid #2563eb; color: #2563eb; padding: 6px 12px; border-radius: 16px; font-size: 12px; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
      .as-chip:hover { background: #2563eb; color: white; }
      #as-chat-input-area { display: flex; padding: 12px; border-top: 1px solid #e5e7eb; background: white; }
      #as-chat-input { flex: 1; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; font-size: 14px; }
      #as-chat-input:focus { border-color: #2563eb; }
      #as-chat-send { background: #2563eb; color: white; border: none; padding: 0 16px; margin-left: 8px; border-radius: 8px; cursor: pointer; font-weight: bold; }
      .as-msg { padding: 10px 14px; border-radius: 12px; max-width: 85%; line-height: 1.4; font-size: 14px; }
      .as-msg.user { background: #2563eb; color: white; align-self: flex-end; border-bottom-right-radius: 2px; }
      .as-msg.bot { background: white; border: 1px solid #e5e7eb; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 2px; }
      .as-typing { display: flex; gap: 4px; padding: 4px 8px; }
      .as-typing span { width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
      .as-typing span:nth-child(1) { animation-delay: -0.32s; }
      .as-typing span:nth-child(2) { animation-delay: -0.16s; }
      @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    \`;
    document.head.appendChild(style);

    // 2. Inject HTML structure
    const container = document.getElementById('agentoserve-widget-container');
    container.innerHTML = \`
      <div id="as-floating-widget">
        <div id="as-chat-header">Support Agent</div>
        <div id="as-chat-body">
          <div class="as-msg bot">Hello! How can I help you today?</div>
        </div>
        <div class="as-chips">
          <div class="as-chip">Tell me more</div>
          <div class="as-chip">Contact Sales</div>
        </div>
        <div id="as-chat-input-area">
          <input id="as-chat-input" type="text" placeholder="Type a message..." />
          <button id="as-chat-send">Send</button>
        </div>
      </div>
    \`;

    // 3. Interaction Logic
    const input = document.getElementById('as-chat-input');
    const sendBtn = document.getElementById('as-chat-send');
    const chatBody = document.getElementById('as-chat-body');
    const chips = document.querySelectorAll('.as-chip');

    async function sendMessage(text) {
      if (!text) return;
      chatBody.innerHTML += \`<div class="as-msg user">\${text}</div>\`;
      input.value = '';
      const typingId = 'typing-' + Date.now();
      chatBody.innerHTML += \`<div id="\${typingId}" class="as-msg bot"><div class="as-typing"><span></span><span></span><span></span></div></div>\`;
      chatBody.scrollTop = chatBody.scrollHeight;

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // ⚠️ IMPORTANT: Replace 'YOUR_API_KEY_HERE' with your secure key generated from your Profile
            'x-api-key': 'YOUR_API_KEY_HERE' 
          },
          body: JSON.stringify({ Query: text, ProjectId: PROJECT_ID })
        });
        const data = await res.json();
        document.getElementById(typingId).outerHTML = \`<div class="as-msg bot">\${data.response || 'No response.'}</div>\`;
      } catch (err) {
        document.getElementById(typingId).outerHTML = \`<div class="as-msg bot" style="color:red;">Connection error.</div>\`;
      }
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    sendBtn.addEventListener('click', () => sendMessage(input.value.trim()));
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(input.value.trim()); });
    chips.forEach(chip => {
      chip.addEventListener('click', () => sendMessage(chip.innerText));
    });
  })();
</script>`;

  const reactNativeCode = `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function AgentoChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hello! How can I help you today?' }]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
    setInput('');

    try {
      const res = await fetch('http://localhost:5080/api/Project/${projectId}/Chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ⚠️ IMPORTANT: Replace 'YOUR_API_KEY_HERE' with a secure key generated from your Profile dashboard
          'x-api-key': 'YOUR_API_KEY_HERE' 
        },
        body: JSON.stringify({ Query: currentInput, ProjectId: '${projectId}' })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatArea}>
        {messages.map((m, i) => (
          <View key={i} style={m.role === 'user' ? styles.userBubble : styles.botBubble}>
            <Text style={m.role === 'user' ? styles.userText : styles.botText}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput value={input} onChangeText={setInput} style={styles.input} placeholder="Type a message..." />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  chatArea: { flex: 1, padding: 16 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2563eb', padding: 12, borderRadius: 16, borderBottomRightRadius: 4, marginVertical: 4, maxWidth: '80%' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff', padding: 12, borderRadius: 16, borderBottomLeftRadius: 4, marginVertical: 4, maxWidth: '80%', borderWidth: 1, borderColor: '#e5e7eb' },
  userText: { color: 'white', fontSize: 15 },
  botText: { color: '#1f2937', fontSize: 15 },
  inputArea: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#e5e7eb' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, backgroundColor: '#f8fafc' },
  sendButton: { justifyContent: 'center', marginLeft: 12, backgroundColor: '#2563eb', borderRadius: 20, paddingHorizontal: 20 },
  sendButtonText: { color: 'white', fontWeight: 'bold' }
});`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/50 shrink-0">
        <h2 className="text-xl font-bold text-gray-900">
          Developer Integrations
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Connect your agent to third-party platforms or embed it directly into
          your apps.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 border-b border-gray-100 gap-6 bg-white shrink-0 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "api"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <HiOutlineLink className="text-lg" />
          API Endpoint
        </button>
        <button
          onClick={() => setActiveTab("embed")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "embed"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <HiOutlineCode className="text-lg" />
          Web Integration
        </button>
        <button
          onClick={() => setActiveTab("native")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "native"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <HiOutlineDeviceMobile className="text-lg" />
          React Native
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 bg-white flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "api" ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-gray-600">
              Use this endpoint to send POST requests from tools like Postman,
              Zapier, or your own custom backend. Make sure to include the{" "}
              <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-xs">
                Query
              </code>{" "}
              parameter in your JSON body.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
                {apiUrl}
              </div>
              <button
                onClick={() => handleCopy(apiUrl, "api")}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm focus:ring-2 focus:ring-blue-100"
              >
                {copiedText === "api" ? (
                  <>
                    <HiOutlineCheck className="text-green-500 text-lg" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <HiOutlineClipboardCopy className="text-gray-400 text-lg" />
                    Copy URL
                  </>
                )}
              </button>
            </div>
          </div>
        ) : activeTab === "embed" ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Copy and paste this snippet just before the closing{" "}
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs">
                  &lt;/body&gt;
                </code>{" "}
                tag on your HTML page.
              </p>
              <button
                onClick={() => handleCopy(embedCode, "embed")}
                className="flex items-center gap-2 shrink-0 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                {copiedText === "embed" ? (
                  <>
                    <HiOutlineCheck className="text-green-500 text-lg" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <HiOutlineClipboardCopy className="text-gray-400 text-lg" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#0f172a] text-gray-300 p-4 rounded-xl text-[13px] font-mono overflow-x-auto leading-relaxed max-h-[400px] custom-scrollbar">
              <code>{embedCode}</code>
            </pre>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Drop this component into your React Native or Expo app. Remember to supply your API Key in the headers.
              </p>
              <button
                onClick={() => handleCopy(reactNativeCode, "native")}
                className="flex items-center gap-2 shrink-0 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                {copiedText === "native" ? (
                  <>
                    <HiOutlineCheck className="text-green-500 text-lg" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <HiOutlineClipboardCopy className="text-gray-400 text-lg" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#0f172a] text-gray-300 p-4 rounded-xl text-[13px] font-mono overflow-x-auto leading-relaxed max-h-[400px] custom-scrollbar">
              <code>{reactNativeCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationPanel;
