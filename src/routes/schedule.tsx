import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, CalendarX } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { QuickAdd } from "@/components/QuickAdd";
import { tasksApi } from "@/lib/api";
import { PriorityPill } from "@/components/Priority";
import {
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isSameDay,
  format,
} from "date-fns";
import { cn } from "@/lib/utils";

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

type ViewMode = "day" | "week" | "month";

function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks", 1],
    queryFn: () => tasksApi.list({ user_id: 1 }),
  });

  const handleNext = () => {
    if (viewMode === "day") setSelectedDate(addDays(selectedDate, 1));
    else if (viewMode === "week") setSelectedDate(addWeeks(selectedDate, 1));
    else if (viewMode === "month") setSelectedDate(addMonths(selectedDate, 1));
  };

  const handlePrev = () => {
    if (viewMode === "day") setSelectedDate(subDays(selectedDate, 1));
    else if (viewMode === "week") setSelectedDate(subWeeks(selectedDate, 1));
    else if (viewMode === "month") setSelectedDate(subMonths(selectedDate, 1));
  };

  // Calculate current range
  let rangeStart = selectedDate;
  let rangeEnd = selectedDate;
  
  if (viewMode === "week") {
    rangeStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    rangeEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  } else if (viewMode === "month") {
    rangeStart = startOfMonth(selectedDate);
    rangeEnd = endOfMonth(selectedDate);
  }

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (!t.due_at) return false;
    const taskDate = new Date(t.due_at);
    
    if (viewMode === "day") {
      return isSameDay(taskDate, selectedDate);
    } else {
      return isWithinInterval(taskDate, { start: rangeStart, end: rangeEnd });
    }
  });

  // Sort tasks chronologically
  filteredTasks.sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());

  // Render header logic
  let headerTitle = "";
  let headerSubtitle = "";
  if (viewMode === "day") {
    headerTitle = format(selectedDate, "EEEE");
    headerSubtitle = format(selectedDate, "MMMM d, yyyy");
  } else if (viewMode === "week") {
    headerTitle = "This Week";
    headerSubtitle = `${format(rangeStart, "MMM d")} - ${format(rangeEnd, "MMM d, yyyy")}`;
  } else if (viewMode === "month") {
    headerTitle = format(selectedDate, "MMMM");
    headerSubtitle = format(selectedDate, "yyyy");
  }

  return (
    <main className="min-h-screen bg-background pb-44">
      <header className="px-5 pt-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">SKS Calendar</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Schedule</h1>
      </header>

      {/* View Mode Selector */}
      <div className="mt-6 px-5">
        <div className="flex rounded-2xl bg-secondary/60 p-1 shadow-inner">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition-all",
                viewMode === mode
                  ? "bg-card text-ink shadow-sm"
                  : "text-muted-foreground hover:text-ink"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigator */}
      <div className="mt-5 flex items-center justify-between px-5">
        <button
          onClick={handlePrev}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card shadow-soft text-muted-foreground hover:text-ink transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-lg font-bold text-ink">
            {headerTitle}
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            {headerSubtitle}
          </div>
        </div>
        <button
          onClick={handleNext}
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
            <h3 className="mb-3 text-sm font-semibold text-ink">
              {viewMode === "day" ? "Tasks Due Today" : "Tasks in Range"}
            </h3>
            <ul className="space-y-2">
              {filteredTasks.length === 0 && (
                <li className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground mb-3 shadow-sm">
                    <CalendarX className="h-5 w-5 opacity-70" />
                  </div>
                  <p className="text-sm font-semibold text-ink">No tasks found</p>
                  <p className="text-xs text-muted-foreground">Enjoy your free time!</p>
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
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {viewMode === "day" 
                        ? format(new Date(t.due_at!), "h:mm a")
                        : format(new Date(t.due_at!), "MMM d, h:mm a")}
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
