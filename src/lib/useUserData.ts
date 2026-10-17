import { useEffect, useMemo, useState } from "react";
import apiClient from "./apiClient";

export type TokenUsage = {
  totalTokens: number;
  usedTokens: number;
  remainingTokens: number;
};

export type InterviewSummary = {
  id: string;
  role: string;
  createdAt: string;
  messageCount: number;
  status?: "Pre" | "Inprocess" | "Marking" | "Ended";
  score?: number;
  feedback?: string;
};

export type ScoredInterview = InterviewSummary & { score: number };

export function isScored(interview: InterviewSummary): interview is ScoredInterview {
  return interview.status === "Ended" && typeof interview.score === "number";
}

// Token usage + interview list for the logged-in user.
export function useUserData({ withTokens = false } = {}) {
  const [tokens, setTokens] = useState<TokenUsage | null>(null);
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [interviewsRes, tokensRes] = await Promise.all([
          apiClient.get("/user/interviews"),
          withTokens ? apiClient.get("/user/tokens") : Promise.resolve(null),
        ]);
        setInterviews(interviewsRes.data?.interviews || interviewsRes.data || []);
        if (tokensRes) setTokens(tokensRes.data);
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [withTokens]);

  // Scored interviews, oldest first.
  const scored = useMemo(
    () => interviews.filter(isScored).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [interviews],
  );

  return { tokens, interviews, scored, loading };
}
