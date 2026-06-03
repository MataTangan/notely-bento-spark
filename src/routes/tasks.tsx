import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { QuickAdd } from "@/components/QuickAdd";
import { priorityStyles, type Priority } from "@/components/Priority";
import { tasksApi, type Task } from "@/lib/api";

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

const folderColors: Record<string, string> = {
  Math: "bg-orange-soft text-orange",
  Physics: "bg-yellow-soft text-orange",
  Sociology: "bg-purple-soft text-purple",
  CS101: "bg-blue-soft text-blue",
  Admin: "bg-mint-soft text-mint",
  Personal: "bg-red-soft text-red",
};

const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"];

function TasksPage() {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.list(),
  });

  const toggleDone = useMutation({
    mutationFn: (task: Task) =>
      tasksApi.update(task.id, { is_done: !task.is_done }),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) => (t.id === task.id ? { ...t, is_done: !t.is_done } : t)),
      );
      return { previous };
    },
    onError: (_err, _task, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <AlertCircle className="h-10 w-10 text-red" />
        <p className="text-sm font-medium text-ink">Couldn't load tasks</p>
        <p className="text-xs text-muted-foreground">{(error as Error).message}</p>
        <p className="text-xs text-muted-foreground">Make sure the backend is running on port 8000.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-44">
      <header className="px-5 pt-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Smart Tasks</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Auto-prioritized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Notely sorted {tasks.length} tasks for you based on deadlines &amp; impact.
        </p>
      </header>

      <section className="mt-6 space-y-6 px-5">
        {PRIORITY_ORDER.map((p) => {
          const items = tasks.filter((t) => t.priority === p);
          if (items.length === 0) return null;
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
                  const isDone = t.is_done;
                  const folderKey = t.folder ?? "";
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
                          onClick={() => toggleDone.mutate(t)}
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
                            {folderKey && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  folderColors[folderKey] ?? "bg-card text-ink"
                                }`}
                              >
                                {folderKey}
                              </span>
                            )}
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
