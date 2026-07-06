import { useEffect, useState } from "react";
import { http, API } from "@/lib/api";
import { Send, Bot, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiFlyout({ open, onClose, motorId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId] = useState(() => `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (open && motorId) {
      setMessages([{
        role: "assistant",
        content: `Hi — I'm the VangateAI Assistant. Motor ${motorId} is loaded. Ask me about faults, RMS trends, ISO severity, or maintenance actions.`,
      }]);
    }
  }, [open, motorId]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "" }]);
    const q = input;
    setInput("");
    setBusy(true);

    try {
      const token = localStorage.getItem("vg_token");
      const res = await fetch(`${API}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ session_id: sessionId, motor_id: motorId, message: q }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const p of parts) {
          if (!p.startsWith("data:")) continue;
          const payload = p.slice(5).trim();
          if (payload === "[DONE]") continue;
          acc += payload;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        }
      }
    } catch (e) {
      console.warn("Chat stream failed, using client-side mock streaming response");
      const mockReply = `Hello! I am your VangateAI Assistant. Since the backend is currently offline or not configured, I'm running in offline mock mode.

For the selected motor ${motorId || "general query"}, here is the diagnostic summary:
- **Status**: Warning / Critical (simulated)
- **Recommendation**: Inspect the motor housing, coupling, and verify foundation bolt torque.

Please check the environment settings or deploy the FastAPI backend to connect to live AI services.`;
      
      const words = mockReply.split(" ");
      let acc = "";
      for (let i = 0; i < words.length; i++) {
        acc += words[i] + " ";
        const currentAcc = acc;
        await new Promise((r) => setTimeout(r, 40));
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: currentAcc };
          return copy;
        });
      }
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside
        className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-50 flex flex-col slide-in-right"
        style={{ background: "rgba(13,27,61,0.95)", borderLeft: "1px solid var(--vg-border)", backdropFilter: "blur(24px)" }}
        data-testid="ai-flyout"
      >
        <header className="h-14 flex items-center gap-3 px-4 border-b border-[#8799BA]/20">
          <div className="w-8 h-8 rounded-md flex items-center justify-center glow-primary" style={{ background: "var(--vg-primary)" }}>
            <Bot size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">VangateAI Assistant</div>
            <div className="text-xs font-mono" style={{ color: "var(--vg-muted)" }}>
              {motorId ? `Context: ${motorId}` : "General"}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5 text-[#8799BA] hover:text-white" data-testid="ai-close">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 space-y-3" data-testid="ai-messages">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: "#00B4D822", color: "#00B4D8" }}>
                  <Bot size={14} />
                </div>
              )}
              <div
                className="max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap"
                style={{
                  background: m.role === "user" ? "var(--vg-primary)" : "#091628",
                  color: "#fff",
                  border: m.role === "assistant" ? "1px solid var(--vg-border)" : "none",
                }}
              >
                {m.content || <span className="text-[#8799BA]">…</span>}
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-white/10 text-white">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[#8799BA]/20">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about vibration, faults, ISO severity…"
              className="flex-1 bg-[#091628] border border-[#8799BA]/30 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#095FDF]"
              data-testid="ai-input"
              disabled={busy}
            />
            <Button onClick={send} disabled={busy} className="text-white glow-primary" style={{ background: "var(--vg-primary)" }} data-testid="ai-send">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
