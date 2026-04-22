import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { QuickAdd } from "@/components/QuickAdd";
import { priorityStyles, type Priority } from "@/components/Priority";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Smart Tasks · Notely" },
      { name: "description", content: "Auto-prioritized assignments grouped by urgency." },
      { property: "og:title", content: "Smart Tasks · Notely" },
      { property: "og:description", content: "High, medium, low — sorted automatically." },
    ],
  }),
  component: TasksPage,
});

type Task = { id: string; title: string; meta: string; p: Priority; folder: string };

const seed: Task[] = [
  { id: "1", title: "Submit Calculus pset #6", meta: "Today · 6:00 PM", p: "high", folder: "Math" },
  { id: "2", title: "Lab report — Newton's laws", meta: "Tomorrow · 9:00 AM", p: "high", folder: "Physics" },
  { id: "3", title: "Read Ch. 4 — Sociology", meta: "Wed · before class", p: "medium", folder: "Sociology" },
  { id: "4", title: "Group meet: Final project", meta: "Thu · 4:00 PM", p: "medium", folder: "CS101" },
  { id: "5", title: "Email Prof. Adams about extension", meta: "This week", p: "low", folder: "Admin" },
  { id: "6", title: "Tidy lecture notes", meta: "Whenever", p: "low", folder: "Personal" },
];

const folderColors: Record<string, string> = {
  Math: "bg-orange-soft text-orange",
  Physics: "bg-yellow-soft text-orange",
  Sociology: "bg-purple-soft text-purple",
  CS101: "bg-blue-soft text-blue",
  Admin: "bg-mint-soft text-mint",
  Personal: "bg-red-soft text-red",
};

function TasksPage() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const groups: Priority[] = ["high", "medium", "low"];

  return (
    <main className="min-h-screen bg-background pb-44">
      <header className="px-5 pt-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Smart Tasks</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Auto-prioritized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Notely sorted {seed.length} tasks for you based on deadlines & impact.
        </p>
      </header>

      <section className="mt-6 space-y-6 px-5">
        {groups.map((p) => {
          const items = seed.filter((t) => t.p === p);
          const s = priorityStyles[p];
          const dashed = p === "high" ? "border-2 border-dashed border-red/40" : "";
          return (
            <div key={p}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                <h2 className="text-sm font-semibold text-ink">{s.label} priority</h2>
                <span className="text-xs text-muted-foreground">· {items.length}</span>
              </div>
              <ul className="space-y-2.5">
                {items.map((t, i) => {
                  const isDone = done.has(t.id);
                  return (
                    <motion.li
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`bento ${s.bg} ${dashed}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() =>
                            setDone((prev) => {
                              const n = new Set(prev);
                              n.has(t.id) ? n.delete(t.id) : n.add(t.id);
                              return n;
                            })
                          }
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isDone ? "border-ink bg-ink text-background" : "border-ink/30 bg-card"
                          }`}
                          aria-label="Complete"
                        >
                          {isDone && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[15px] font-semibold leading-snug text-ink ${
                              isDone ? "line-through opacity-50" : ""
                            }`}
                          >
                            {t.title}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                folderColors[t.folder]
                              }`}
                            >
                              {t.folder}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{t.meta}</span>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <QuickAdd />
      <BottomNav />
    </main>
  );
}
