import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { QuickAdd } from "@/components/QuickAdd";
import { tasksApi } from "@/lib/api";
import { PriorityPill } from "@/components/Priority";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Weekly Schedule · Notely" },
      { name: "description", content: "Your classes & deadlines on one calm timeline." },
      { property: "og:title", content: "Weekly Schedule · Notely" },
      { property: "og:description", content: "SKS calendar built for students." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks", 1],
    queryFn: () => tasksApi.list({ user_id: 1 }),
  });

  const nextDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() + 86400000));
  };
  const prevDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() - 86400000));
  };

  // Filter tasks for the selected date
  const filteredTasks = tasks.filter((t) => {
    if (!t.due_at) return false;
    const taskDate = new Date(t.due_at);
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  });

  return (
    <main className="min-h-screen bg-background pb-44">
      <header className="px-5 pt-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">SKS Calendar</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Schedule</h1>
      </header>

      {/* Date Navigator */}
      <div className="mt-5 flex items-center justify-between px-5">
        <button
          onClick={prevDay}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card shadow-soft text-muted-foreground hover:text-ink transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-lg font-bold text-ink">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </div>
        </div>
        <button
          onClick={nextDay}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card shadow-soft text-muted-foreground hover:text-ink transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Timeline */}
      {isLoading && (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="mt-12 flex flex-col items-center gap-3 px-6 text-center">
          <AlertCircle className="h-10 w-10 text-red" />
          <p className="text-sm font-medium text-ink">Couldn't load schedule</p>
          <p className="text-xs text-muted-foreground">{(error as Error).message}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <section className="mt-6 px-5">
          <div className="bento bg-card">
            <h3 className="mb-3 text-sm font-semibold text-ink">Tasks Due</h3>
            <ul className="space-y-2">
              {filteredTasks.length === 0 && (
                <li className="py-4 text-center text-xs text-muted-foreground">
                  No tasks due on this day!
                </li>
              )}
              {filteredTasks.map((t, i) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-2xl bg-secondary/60 px-3 py-3"
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate text-sm font-semibold text-ink">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(t.due_at!).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <PriorityPill p={t.priority as "high" | "medium" | "low"} />
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <QuickAdd />
      <BottomNav />
    </main>
  );
}
