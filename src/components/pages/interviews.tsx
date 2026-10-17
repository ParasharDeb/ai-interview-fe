import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Clock, Loader2, MessageSquare, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../../lib/apiClient";
import { usePalette } from "../../lib/palette";
import { isScored, useUserData } from "../../lib/useUserData";
import { PageHeader, PageLoading } from "../ui/pageHeader";
import { ScoreBadge } from "../ui/scoreBadge";

type InterviewMessage = {
  sender: "me" | "ai";
  text: string;
  createdAt?: string;
};

export default function InterviewsPage() {
  const p = usePalette();
  const { interviews, loading } = useUserData();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const bubbleMe = p.isDark ? "#3f3f46" : "#18181b";
  const bubbleAi = p.isDark ? "#1e1e23" : "#f4f4f5";
  const bubbleAiText = p.isDark ? "#e4e4e7" : "#27272a";

  useEffect(() => {
    if (!selectedId) return;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await apiClient.get(`/interview/${selectedId}/messages`);
        setMessages(res.data?.messages || []);
      } catch (error) {
        console.error("Failed to load interview messages", error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? interviews.filter((i) => (i.role || "General").toLowerCase().includes(q)) : interviews;
  }, [interviews, query]);

  const selected = interviews.find((i) => i.id === selectedId);
  const select = (id: string | null) => setSearchParams(id ? { id } : {});

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-8">
      <PageHeader
        eyebrow="Interviews"
        title="Interview chats"
        subtitle="Every conversation with the interviewer, with its score."
      />

      {loading ? (
        <PageLoading label="Loading interviews..." />
      ) : (
        <div className="fade-in grid grid-cols-1 gap-6 lg:grid-cols-5" style={{ animationDelay: "0.06s" }}>
          {/* Interview list (hidden on mobile while a transcript is open) */}
          <div
            className={`${selectedId ? "hidden lg:flex" : "flex"} flex-col overflow-hidden rounded-2xl lg:col-span-2`}
            style={{ background: p.panel, border: `1px solid ${p.border}`, height: "calc(100vh - 220px)", minHeight: 480 }}
          >
            <div className="flex-shrink-0 space-y-3 px-5 py-4" style={{ borderBottom: `1px solid ${p.border}` }}>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} style={{ color: p.textMuted }} />
                <span className="text-sm font-medium">All interviews ({interviews.length})</span>
              </div>
              <label
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: p.panelAlt, color: p.textMuted }}
              >
                <Search size={14} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by role"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: p.textPrimary }}
                />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="px-5 py-6 text-sm" style={{ color: p.textMuted }}>
                  {interviews.length === 0 ? "No interviews yet." : "No interviews match that search."}
                </p>
              )}

              {filtered.map((interview) => {
                const isSelected = interview.id === selectedId;
                return (
                  <button
                    key={interview.id}
                    onClick={() => select(interview.id)}
                    className="row-btn flex w-full items-center justify-between px-5 py-4 text-left"
                    style={{
                      background: isSelected ? p.panelAlt : "transparent",
                      borderBottom: `1px solid ${p.border}`,
                    }}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{interview.role || "General"}</div>
                      <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: p.textMuted }}>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </span>
                        <span>{interview.messageCount} messages</span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <ScoreBadge interview={interview} active={isSelected} />
                      <ChevronRight size={16} style={{ color: p.textMuted }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transcript */}
          <div
            className={`${selectedId ? "flex" : "hidden lg:flex"} flex-col overflow-hidden rounded-2xl lg:col-span-3`}
            style={{ background: p.panel, border: `1px solid ${p.border}`, height: "calc(100vh - 220px)", minHeight: 480 }}
          >
            <div
              className="flex flex-shrink-0 items-center justify-between gap-3 px-5 py-4"
              style={{ borderBottom: `1px solid ${p.border}` }}
            >
              <div className="flex min-w-0 items-center gap-3">
                {selectedId && (
                  <button
                    onClick={() => select(null)}
                    aria-label="Back to list"
                    className="icon-btn lg:hidden"
                    style={{ color: p.textMuted }}
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {selected ? selected.role || "General" : "Select an interview"}
                  </div>
                  {selected && (
                    <div className="mt-0.5 text-xs" style={{ color: p.textMuted }}>
                      {new Date(selected.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  )}
                </div>
              </div>
              {selected && isScored(selected) && (
                <div className="flex flex-shrink-0 items-baseline gap-1">
                  <span className="text-2xl font-semibold tabular-nums">{selected.score}</span>
                  <span className="text-xs" style={{ color: p.textMuted }}>
                    /100
                  </span>
                </div>
              )}
            </div>

            {selected?.feedback && (
              <div
                className="flex-shrink-0 px-5 py-3 text-sm leading-relaxed"
                style={{ background: p.panelAlt, borderBottom: `1px solid ${p.border}` }}
              >
                <span className="font-medium">Feedback: </span>
                <span style={{ color: p.textMuted }}>{selected.feedback}</span>
              </div>
            )}

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {!selectedId && (
                <p className="text-sm" style={{ color: p.textMuted }}>
                  Choose an interview on the left to see the full conversation.
                </p>
              )}

              {selectedId && loadingMessages && (
                <div className="flex items-center justify-center gap-2 py-10" style={{ color: p.textMuted }}>
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
                        color: msg.sender === "me" ? "#f4f4f5" : bubbleAiText,
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

              {selectedId && !loadingMessages && messages.length === 0 && (
                <p className="text-sm" style={{ color: p.textMuted }}>
                  No messages found for this interview.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
