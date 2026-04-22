import { Mic, ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function QuickAdd({ onAdd }: { onAdd?: (text: string) => void }) {
  const [value, setValue] = useState("");
  const [recording, setRecording] = useState(false);

  const submit = () => {
    if (!value.trim()) return;
    onAdd?.(value.trim());
    setValue("");
  };

  return (
    <div className="fixed bottom-20 left-1/2 z-30 w-[min(94vw,28rem)] -translate-x-1/2">
      <AnimatePresence>
        {value && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-2 flex items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow-soft backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-orange" />
            Notely will auto-prioritize this task
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/95 p-1.5 shadow-pop backdrop-blur-xl">
        <button
          onClick={() => setRecording((r) => !r)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
            recording ? "bg-orange text-primary-foreground pulse-mic" : "bg-orange-soft text-orange"
          }`}
          aria-label="Voice"
        >
          <Mic className="h-5 w-5" strokeWidth={2.2} />
        </button>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a task… 'Essay due Friday 9pm'"
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-primary-foreground transition-opacity disabled:opacity-40"
          aria-label="Add"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
