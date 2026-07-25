import { useEffect, useState } from "react";
import { ArrowLeft, Moon, Sun, Zap, MessageSquare, Clock, Loader2, ChevronRight, Play } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../lib/theme-context";
import { BACKEND_URL } from "../../lib/config";

type TokenUsage = {
  totalTokens: number;
  usedTokens: number;
  remainingTokens: number;
};

type InterviewSummary = {
  id: string;
  role: string;
  createdAt: string;
  messageCount: number;
};

type InterviewMessage = {
  sender: "me" | "ai";
  text: string;
  createdAt?: string;
};

export default function AboutPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [tokens, setTokens] = useState<TokenUsage | null>(null);
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

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
  const solid = isDark ? "#f4f4f5" : "#18181b";
  const inverse = isDark ? "#18181b" : "#f4f4f5";

  // Fetch token usage + interview list for the logged-in user.
  // Adjust these endpoints/response shapes to match your backend.
  useEffect(() => {
    async function loadOverview() {
      setLoadingOverview(true);
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const [tokensRes, interviewsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/user/tokens`, { headers }),
          axios.get(`${BACKEND_URL}/user/interviews`, { headers }),
        ]);

        setTokens(tokensRes.data);
        setInterviews(interviewsRes.data?.interviews || interviewsRes.data || []);
      } catch (error) {
        console.error("Failed to load user overview", error);
      } finally {
        setLoadingOverview(false);
      }
    }

    loadOverview();
  }, []);

  // Fetch messages for a selected interview.
  useEffect(() => {
    if (!selectedId) return;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const res = await axios.get(`${BACKEND_URL}/interview/${selectedId}/messages`, { headers });
        const raw = res.data?.messages || res.data || [];
        const converted = raw.map((m: any) => ({
          sender: m.Sender === "AI" || m.sender === "ai" ? "ai" : "me",
          text: m.Messages ?? m.text,
          createdAt: m.createdAt,
        }));
        setMessages(converted);
      } catch (error) {
        console.error("Failed to load interview messages", error);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [selectedId]);

  const usedPct =
    tokens && tokens.totalTokens > 0 ? Math.min(100, Math.round((tokens.usedTokens / tokens.totalTokens) * 100)) : 0;

  return (
    <div style={{ background: bg, color: textPrimary }} className="min-h-screen transition-colors duration-500">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .icon-btn { transition: opacity 0.15s ease; }
        .icon-btn:hover { opacity: 0.7; }
        .row-btn { transition: background-color 0.15s ease, border-color 0.15s ease; }
        .start-btn { transition: opacity 0.15s ease, transform 0.1s ease; }
        .start-btn:hover { opacity: 0.88; }
        .start-btn:active { transform: scale(0.98); }
        .dot { animation: dotBounce 1.2s infinite; }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-6 sm:px-8">
        <button
          onClick={() => navigate("/")}
          aria-label="Go back"
          className="icon-btn flex items-center justify-center"
          style={{ color: textMuted }}
        >
          <ArrowLeft size={18} />
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="icon-btn flex items-center justify-center"
          style={{ color: textMuted }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <main className="mx-auto max-w-5xl px-6 pb-24 sm:px-8">
        {/* Heading */}
        <div
          className="fade-in mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
          style={{ animationDelay: "0.02s" }}
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: textPrimary }} />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: textMuted }}>
                Account overview
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">About your account</h1>
            <p className="mt-2 text-sm" style={{ color: textMuted }}>
              Token usage and every interview transcript, in one place.
            </p>
          </div>

          <button
            onClick={() => navigate("/information")}
            className="start-btn flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium whitespace-nowrap"
            style={{ background: solid, color: inverse }}
          >
            <Play size={14} />
            Start interview
          </button>
        </div>

        {loadingOverview ? (
          <div className="flex items-center gap-2 py-16 justify-center" style={{ color: textMuted }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading your data...</span>
          </div>
        ) : (
          <>
            {/* Token usage */}
            <div
              className="fade-in mb-10 rounded-2xl p-6"
              style={{ background: panel, border: `1px solid ${border}`, animationDelay: "0.06s" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Zap size={16} style={{ color: textMuted }} />
                <span className="text-sm font-medium">Tokens</span>
              </div>

              {tokens ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tracking-tight">
                      {tokens.remainingTokens.toLocaleString()}
                    </span>
                    <span className="text-sm" style={{ color: textMuted }}>
                      remaining of {tokens.totalTokens.toLocaleString()}
                    </span>
                  </div>

                  <div
                    className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: panelAlt }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${usedPct}%`, background: textPrimary }}
                    />
                  </div>
                  <div className="mt-2 text-xs" style={{ color: textMuted }}>
                    {tokens.usedTokens.toLocaleString()} used ({usedPct}%)
                  </div>
                </>
              ) : (
                <p className="text-sm" style={{ color: textMuted }}>
                  No token data available.
                </p>
              )}
            </div>

            {/* Interviews + messages */}
            <div className="fade-in grid grid-cols-1 gap-6 lg:grid-cols-5" style={{ animationDelay: "0.1s" }}>
              {/* Interview list */}
              <div
                className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden"
                style={{ background: panel, border: `1px solid ${border}`, height: 560 }}
              >
                <div
                  className="flex items-center gap-2 px-5 py-4 flex-shrink-0"
                  style={{ borderBottom: `1px solid ${border}` }}
                >
                  <MessageSquare size={16} style={{ color: textMuted }} />
                  <span className="text-sm font-medium">Interviews ({interviews.length})</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {interviews.length === 0 && (
                    <p className="px-5 py-6 text-sm" style={{ color: textMuted }}>
                      No interviews yet.
                    </p>
                  )}

                  {interviews.map((interview) => {
                    const isSelected = interview.id === selectedId;
                    return (
                      <button
                        key={interview.id}
                        onClick={() => setSelectedId(interview.id)}
                        className="row-btn flex w-full items-center justify-between px-5 py-4 text-left"
                        style={{
                          background: isSelected ? panelAlt : "transparent",
                          borderBottom: `1px solid ${border}`,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{interview.role || "General"}</div>
                          <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: textMuted }}>
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {new Date(interview.createdAt).toLocaleDateString()}
                            </span>
                            <span>{interview.messageCount} messages</span>
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color: textMuted }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Messages */}
              <div
                className="lg:col-span-3 flex flex-col rounded-2xl overflow-hidden"
                style={{ background: panel, border: `1px solid ${border}`, height: 560 }}
              >
                <div
                  className="px-5 py-4 text-sm font-medium flex-shrink-0"
                  style={{ borderBottom: `1px solid ${border}` }}
                >
                  {selectedId
                    ? interviews.find((i) => i.id === selectedId)?.role || "Transcript"
                    : "Select an interview"}
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {!selectedId && (
                    <p className="text-sm" style={{ color: textMuted }}>
                      Choose an interview on the left to see the full conversation.
                    </p>
                  )}

                  {selectedId && loadingMessages && (
                    <div className="flex items-center gap-2 py-10 justify-center" style={{ color: textMuted }}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading transcript...</span>
                    </div>
                  )}

                  {selectedId &&
                    !loadingMessages &&
                    messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
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

                  {selectedId && !loadingMessages && messages.length === 0 && (
                    <p className="text-sm" style={{ color: textMuted }}>
                      No messages found for this interview.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}