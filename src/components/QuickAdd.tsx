import { Bot, User, Paperclip, Send, X, Sparkles, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  fileName?: string;
}

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "bot",
  text: "Hai! 👋 Ketik tugasmu atau kirim foto jadwal/soal, biar aku yang atur!",
};

/** Renders simple markdown: **bold**, _italic_, `code`, and newlines */
function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <span>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*.*?\*\*|_.*?_|`.*?`)/).map((part, pi) => {
            if (part.startsWith("**") && part.endsWith("**"))
              return <strong key={pi} className="font-bold">{part.slice(2, -2)}</strong>;
            if (part.startsWith("_") && part.endsWith("_"))
              return <em key={pi} className="italic text-muted-foreground">{part.slice(1, -1)}</em>;
            if (part.startsWith("`") && part.endsWith("`"))
              return <code key={pi} className="rounded bg-secondary/80 px-1 py-0.5 text-[12px] font-mono">{part.slice(1, -1)}</code>;
            return <span key={pi}>{part}</span>;
          })}
        </span>
      ))}
    </span>
  );
}

export function QuickAdd() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const addMessage = (msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
  };

  const handleSubmit = async () => {
    const text = inputText.trim();
    const file = selectedFile;

    if (!text && !file) return;

    // Add user message
    addMessage({
      role: "user",
      text: text || `📎 ${file!.name}`,
      fileName: file?.name,
    });

    setInputText("");
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (text) formData.append("message", text);
      if (file) formData.append("file", file);

      const res = await fetch("/api/agent/extract", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        addMessage({ role: "bot", text: data.reply });
        if (data.task_added) {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          queryClient.invalidateQueries({ queryKey: ["analytics"] });
        }
      } else {
        addMessage({ role: "bot", text: "⚠️ Maaf, terjadi kesalahan. Coba lagi ya!" });
      }
    } catch {
      addMessage({ role: "bot", text: "⚠️ Tidak bisa terhubung ke server." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-primary-foreground shadow-pop transition-transform hover:scale-105 active:scale-95"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-36 right-5 z-50 flex w-[min(92vw,22rem)] flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-pop backdrop-blur-xl"
            style={{ maxHeight: "min(70vh, 28rem)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-border/40 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-ink">Notely AI</div>
                <div className="text-[10px] text-muted-foreground">Asisten tugas pintarmu</div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ minHeight: "10rem" }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5",
                      msg.role === "bot" ? "bg-purple/15 text-purple" : "bg-blue-soft text-blue"
                    )}
                  >
                    {msg.role === "bot" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                      msg.role === "bot"
                        ? "rounded-tl-md bg-secondary/80 text-ink"
                        : "rounded-tr-md bg-blue-soft text-ink"
                    )}
                  >
                    {msg.role === "bot" ? <FormattedText text={msg.text} /> : msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple/15 text-purple mt-0.5">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-secondary/80 px-3 py-2 text-[13px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="animate-pulse">AI sedang berpikir</span>
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* File Preview */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border/30 px-3"
                >
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Paperclip className="h-3 w-3" />
                      <span className="max-w-[200px] truncate font-medium">{selectedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground hover:text-ink transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="border-t border-border/40 px-3 py-2.5">
              <div className="flex items-center gap-2">
                {/* File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground transition-colors hover:text-ink hover:bg-secondary"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                {/* Text Input */}
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik tugas atau kirim file..."
                  disabled={isLoading}
                  className="h-9 flex-1 rounded-full border border-border/40 bg-background/50 px-3 text-sm text-ink placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                />

                {/* Send */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || (!inputText.trim() && !selectedFile)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-primary-foreground transition-opacity disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
