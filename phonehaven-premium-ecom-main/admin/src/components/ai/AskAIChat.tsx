import { useState, useRef, useEffect, type FormEvent } from "react";
import { X, Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { sendChatMessage, type ChatMessage } from "../../services/ai-api";

interface AskAIChatProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  "Show today's orders",
  "Check low stock products",
  "How do I add a product?",
  "Show recent customers",
];

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your AI assistant for the House of Phones Admin Panel. I can help you with products, orders, customers, inventory, payments, and more.\n\nHow can I help you today?",
};

export function AskAIChat({ open, onClose }: AskAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const result = await sendChatMessage(
        msg,
        newMessages.slice(1).map((m) => ({ role: m.role, content: m.content }))
      );
      if (result.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.message || "Sorry, something went wrong." },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message || "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (q: string) => {
    handleSend(q);
  };

  if (!open) return null;

  return (
    <>
      <div className="ai-chat-overlay" onClick={onClose} />
      <div className="ai-chat-panel">
        <div className="ai-chat-header">
          <div className="ai-chat-header-left">
            <div className="ai-chat-header-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>Ask AI</h3>
              <span>Admin Assistant</span>
            </div>
          </div>
          <button type="button" className="ai-chat-close" onClick={onClose} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        <div className="ai-chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-chat-msg ${msg.role === "user" ? "ai-chat-msg-user" : "ai-chat-msg-bot"}`}>
              <div className={`ai-chat-msg-avatar ${msg.role === "user" ? "ai-chat-avatar-user" : "ai-chat-avatar-bot"}`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="ai-chat-msg-bubble">
                <div className="ai-chat-msg-text" dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-chat-msg ai-chat-msg-bot">
              <div className="ai-chat-msg-avatar ai-chat-avatar-bot">
                <Bot size={16} />
              </div>
              <div className="ai-chat-msg-bubble">
                <div className="ai-chat-typing">
                  <Loader2 size={16} className="ai-chat-typing-spinner" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div className="ai-chat-suggestions">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} type="button" className="ai-chat-suggestion-chip" onClick={() => handleSuggestion(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="ai-chat-input-area"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <textarea
            ref={inputRef}
            className="ai-chat-input"
            placeholder="Ask anything about your admin panel..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            type="submit"
            className="ai-chat-send"
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            {loading ? <Loader2 size={18} className="ai-chat-typing-spinner" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </>
  );
}

function formatMessage(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");
  html = html.replace(/^- (.+)$/gm, "• $1");
  html = html.replace(/\n/g, "<br>");
  return html;
}
