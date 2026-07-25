import { useEffect, useRef, useState } from "react";
import { Send, User, Sun, Moon, MessageCircle, X, Mic, MicOff, PhoneOff } from "lucide-react";
import { MediaHandler } from "../../handlers/media-handler";
import { InterviewSocket } from "../../handlers/interview-socket";
import { useTheme } from "../../lib/theme-context";
import { useNavigate, useParams } from "react-router-dom";
type Message = {
  sender: "me" | "ai";
  text: string;
};
type AiState = "idle" | "thinking" | "speaking";
export default function InterviewPage() {
  const {interviewId}=useParams()
  const timeref=useRef<number|null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<InterviewSocket | null>(null);
  const endRequestedRef = useRef(false);
  const [input, setInput] = useState("");
  const [aiState, setAiState] = useState<AiState>("idle");
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Whenever you're ready, tell me a bit about yourself and the role you're preparing for.",
    },
  ]);
  const [pendingAiMessage, setPendingAiMessage] = useState("");
  const navigate=useNavigate()
  // UI-only state (no business logic)
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const isDark = theme === "dark";


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, aiState]);
  //for ui 
  function sendMessage() {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "me", text }]);
    setInput("");
    setAiState("thinking");
    setPendingAiMessage("");

    if (socketRef.current) {
      socketRef.current.sendText(text);
    }
  }
  function base64ToArrayBuffer(base64: string) {
    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
function Endcall(){
  if (endRequestedRef.current) return;
  endRequestedRef.current = true;
  if(timeref.current){
    clearTimeout(timeref.current)
  }
  socketRef.current?.send(
  JSON.stringify({
    type: "End Call",
  })
);
  }


useEffect(() => {
  const mediaHandler = new MediaHandler();
  const socket = new InterviewSocket({
    InterviewID:interviewId,
    role: localStorage.getItem("interviewRole") || "General",
    onOpen: () => {
      console.log("Connected to backend");
    },
    onMessage: (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "Message list") {
        const incomingMessages = msg.data || [];
        const convertedMessages = incomingMessages.map((m: any) => ({
          sender: m.Sender === "AI" ? "ai" : "me",
          text: m.Messages
        }));
        setMessages(convertedMessages);
      }
      if (msg.type === "transcript") {
        const transcript = msg.text?.trim();
        if (transcript) {
          setPendingAiMessage((prev) => prev + (prev ? " " : "") + transcript);
          setAiState("speaking");
        }
      }

      if (msg.type === "audio") {
        const arrayBuffer = base64ToArrayBuffer(msg.data);
        mediaHandler.playAudio(arrayBuffer);
      }
      if(msg.type=="Interview ended"){
        navigate("/about")
      }
    },
    onClose: () => {
      console.log("Closed");
    },
    onError: (err) => {
      console.error(err);
    },
  });
  socketRef.current = socket;
  socket.connect();
  timeref.current = window.setTimeout(()=>{
  Endcall()
},300000)
  async function init() {
    await mediaHandler.startAudio((pcm: any) => {
      socket.sendAudio(pcm);
    });
  }
  
  init();
  
  return () => {
    if(timeref.current) {
      clearTimeout(timeref.current)
      timeref.current=null
    }
    mediaHandler.stopAudio();
    socket.disconnect();
  };
}, [interviewId]);

useEffect(() => {
  if (!pendingAiMessage) return;

  const timeout = window.setTimeout(() => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.sender === "ai") {
        return [...prev.slice(0, -1), { sender: "ai", text: pendingAiMessage }];
      }
      return [...prev, { sender: "ai", text: pendingAiMessage }];
    });
    setPendingAiMessage("");
  }, 700);

  return () => window.clearTimeout(timeout);
}, [pendingAiMessage]);
  
  const bg = isDark ? "#0a0a0c" : "#eceeef";
  const panel = isDark ? "#131316" : "#ffffff";
  const panelAlt = isDark ? "#18181b" : "#f4f4f5";
  const border = isDark ? "#28282d" : "#dcdce0";
  const textPrimary = isDark ? "#f4f4f5" : "#18181b";
  const textMuted = isDark ? "#8b8b93" : "#71717a";
  const bubbleMe = isDark ? "#3f3f46" : "#18181b";
  const bubbleMeText = "#f4f4f5";
  const bubbleAi = isDark ? "#1e1e23" : "#f4f4f5";
  const bubbleAiText = isDark ? "#e4e4e7" : "#27272a";

  return (
    <div
      style={{ background: bg, color: textPrimary }}
      className="h-screen w-screen overflow-hidden transition-colors duration-500"
    >
      <style>{`
        @keyframes blobMorph {
          0%   { border-radius: 42% 58% 65% 35% / 45% 45% 55% 55%; }
          25%  { border-radius: 60% 40% 30% 70% / 50% 62% 38% 50%; }
          50%  { border-radius: 35% 65% 55% 45% / 62% 40% 60% 38%; }
          75%  { border-radius: 58% 42% 40% 60% / 40% 55% 45% 60%; }
          100% { border-radius: 42% 58% 65% 35% / 45% 45% 55% 55%; }
        }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.045); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        @keyframes barWave {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        .blob-shape {
          animation: blobMorph 9s ease-in-out infinite;
        }
        .blob-shape.speaking {
          animation: blobMorph 4.5s ease-in-out infinite, blobPulse 1.1s ease-in-out infinite;
        }
        .blob-glow {
          animation: glowPulse 6s ease-in-out infinite;
        }
        .blob-glow.speaking {
          animation: glowPulse 1.4s ease-in-out infinite;
        }
        .bar {
          animation: barWave 1s ease-in-out infinite;
          transform-origin: center;
        }
        .dot {
          animation: dotBounce 1.2s infinite;
        }
        .chat-panel {
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
        }
        .control-btn {
          transition: transform 0.15s ease, background-color 0.2s ease, border-color 0.2s ease;
        }
        .control-btn:hover {
          transform: translateY(-1px);
        }
        .control-btn:active {
          transform: scale(0.94);
        }
      `}</style>

      <div className="flex h-full w-full">
        {/* ============ Main stage ============ */}
        <div className="relative flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 sm:px-8 pt-6">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Interview</h1>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                Live mock session
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs"
                style={{ background: panelAlt, border: `1px solid ${border}` }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Connected
              </div>

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="control-btn flex items-center justify-center h-9 w-9 rounded-full"
                style={{ background: panelAlt, border: `1px solid ${border}` }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          {/* AI stage */}
          <div className="flex-1 flex items-center justify-center px-6 sm:px-8">
            <div
              className="relative w-full max-w-3xl aspect-[16/10] sm:aspect-video rounded-[2rem] flex flex-col items-center justify-center gap-6 overflow-hidden"
              style={{
                background: isDark
                  ? "radial-gradient(circle at 50% 40%, #1c1c20, #08080a)"
                  : "radial-gradient(circle at 50% 40%, #ffffff, #e4e4e7)",
                border: `1px solid ${border}`,
              }}
            >
              <span
                className="absolute top-5 left-6 text-xs font-medium tracking-[0.15em] uppercase"
                style={{ color: textMuted }}
              >
                AI Interviewer
              </span>
              <span
                className="absolute top-5 right-6 text-xs"
                style={{ color: textMuted }}
              >
                {aiState === "thinking" ? "thinking…" : aiState === "speaking" ? "speaking" : "listening"}
              </span>

              {/* outer glow */}
              <div
                className={`blob-glow ${aiState === "speaking" ? "speaking" : ""} absolute rounded-full blur-2xl`}
                style={{
                  width: 190,
                  height: 190,
                  background: isDark
                    ? "radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)"
                    : "radial-gradient(circle, rgba(24,24,27,0.25), transparent 70%)",
                }}
              />

              {/* blob */}
              <div
                className={`blob-shape ${aiState === "speaking" ? "speaking" : ""} relative`}
                style={{
                  width: 140,
                  height: 140,
                  background: isDark
                    ? "linear-gradient(145deg, #f4f4f5, #52525b 55%, #18181b)"
                    : "linear-gradient(145deg, #3f3f46, #a1a1aa 55%, #e4e4e7)",
                  boxShadow: isDark
                    ? "0 0 40px rgba(255,255,255,0.12), inset 0 0 20px rgba(0,0,0,0.4)"
                    : "0 0 30px rgba(0,0,0,0.15), inset 0 0 20px rgba(255,255,255,0.3)",
                }}
              />

              {/* voice bars */}
              <div className="relative flex items-end gap-1 h-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bar w-1 rounded-full"
                    style={{
                      height: aiState === "speaking" ? 22 : aiState === "thinking" ? 10 : 6,
                      background: textMuted,
                      animationDelay: `${i * 0.12}s`,
                      animationPlayState: aiState === "speaking" ? "running" : "paused",
                      opacity: aiState === "idle" ? 0.4 : 1,
                    }}
                  />
                ))}
              </div>

              {/* self view - picture in picture */}
              <div
                className="absolute bottom-5 left-5 w-28 sm:w-36 aspect-video rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #27272a, #0a0a0c)"
                    : "linear-gradient(135deg, #e4e4e7, #f4f4f5)",
                  border: `1px solid ${border}`,
                }}
              >
                <User size={28} style={{ color: textMuted }} />
                <span
                  className="absolute bottom-1.5 left-2 text-[10px] font-medium tracking-wide uppercase"
                  style={{ color: textMuted }}
                >
                  You
                </span>
              </div>
            </div>
          </div>

          {/* Bottom control bar */}
          <div className="flex items-center justify-center gap-3 pb-8 pt-2">
            <button
              onClick={() => setIsMicOn((v) => !v)}
              aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
              aria-pressed={!isMicOn}
              className="control-btn flex items-center justify-center h-12 w-12 rounded-full"
              style={{
                background: isMicOn ? panelAlt : (isDark ? "#f4f4f5" : "#18181b"),
                color: isMicOn ? textPrimary : (isDark ? "#18181b" : "#f4f4f5"),
                border: `1px solid ${border}`,
              }}
            >
              {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={() => setIsChatOpen((v) => !v)}
              aria-label={isChatOpen ? "Close chat" : "Open chat"}
              aria-pressed={isChatOpen}
              className="control-btn flex items-center justify-center h-12 w-12 rounded-full"
              style={{
                background: isChatOpen ? (isDark ? "#f4f4f5" : "#18181b") : panelAlt,
                color: isChatOpen ? (isDark ? "#18181b" : "#f4f4f5") : textPrimary,
                border: `1px solid ${border}`,
              }}
            >
              {isChatOpen ? <X size={18} /> : <MessageCircle size={18} />}
            </button>

            <button
              aria-label="End call"
              onClick={Endcall}
              className="control-btn flex items-center justify-center h-12 w-12 rounded-full"
              style={{ background: "#ef4444", color: "#ffffff" }}
            >
              <PhoneOff size={18} />
            </button>
          </div>
        </div>

        {/* ============ Chat panel ============ */}
        <div
          className="chat-panel h-full flex-shrink-0 overflow-hidden"
          style={{
            width: isChatOpen ? "min(400px, 92vw)" : "0px",
            opacity: isChatOpen ? 1 : 0,
            borderLeft: isChatOpen ? `1px solid ${border}` : "none",
            background: panel,
          }}
        >
          <div className="h-full w-[min(400px,92vw)] flex flex-col">
            <div
              className="p-5 flex items-center justify-between text-base font-semibold"
              style={{ borderBottom: `1px solid ${border}` }}
            >
              Conversation
              <button
                onClick={() => setIsChatOpen(false)}
                aria-label="Close chat"
                className="control-btn flex items-center justify-center h-8 w-8 rounded-full"
                style={{ background: panelAlt, border: `1px solid ${border}` }}
              >
                <X size={14} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: msg.sender === "me" ? bubbleMe : bubbleAi,
                      color: msg.sender === "me" ? bubbleMeText : bubbleAiText,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {pendingAiMessage && (
                <div className="flex justify-start">
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{ background: bubbleAi, color: bubbleAiText }}
                  >
                    {pendingAiMessage}
                  </div>
                </div>
              )}

              {aiState === "thinking" && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-4 py-3.5 flex items-center gap-1.5"
                    style={{ background: bubbleAi }}
                  >
                    <span className="dot h-1.5 w-1.5 rounded-full" style={{ background: textMuted, animationDelay: "0s" }} />
                    <span className="dot h-1.5 w-1.5 rounded-full" style={{ background: textMuted, animationDelay: "0.2s" }} />
                    <span className="dot h-1.5 w-1.5 rounded-full" style={{ background: textMuted, animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 flex gap-3" style={{ borderTop: `1px solid ${border}` }}>
              <input
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: panelAlt,
                  color: textPrimary,
                  border: `1px solid ${border}`,
                }}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />

              <button
                onClick={sendMessage}
                aria-label="Send message"
                className="control-btn rounded-xl px-4 flex items-center justify-center"
                style={{ background: isDark ? "#f4f4f5" : "#18181b", color: isDark ? "#18181b" : "#f4f4f5" }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}