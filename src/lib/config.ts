
console.log(import.meta.env)
export const BACKEND_URL =
  "https://ai-interviewer-1xg1.onrender.com"
export const WS_URL =
  "wss://ai-interviewer-1-a4d5.onrender.com"

export function toWebSocketUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");

  if (trimmed.startsWith("wss://") || trimmed.startsWith("ws://")) {
    return trimmed;
  }
  if (trimmed.startsWith("https://")) {
    return `wss://${trimmed.slice("https://".length)}`;
  }
  if (trimmed.startsWith("http://")) {
    return `ws://${trimmed.slice("http://".length)}`;
  }

  return trimmed;
}

export function buildInterviewWebSocketUrl(
  interviewId: string,
  role = "General"
): string {
  const base = toWebSocketUrl(WS_URL);
  const params = new URLSearchParams({ interviewId, role });
  return `${base}?${params.toString()}`;
}
