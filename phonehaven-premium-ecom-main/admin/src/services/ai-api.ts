const API_BASE = "/api";

function getToken(): string {
  return localStorage.getItem("adminToken") || "";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<{ success: boolean; reply: string; message?: string }> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "AI service request failed");
  }
  return data;
}
