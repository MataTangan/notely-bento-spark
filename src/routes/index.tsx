import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, BookOpen, Clock, ArrowUpRight, Calendar, Share2, Calculator, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { QuickAdd } from "@/components/QuickAdd";
import { PriorityPill } from "@/components/Priority";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Notely — Calm, smart task manager for students" },
      {
        name: "description",
        content:
          "Notely auto-prioritizes assignments, classes & deadlines so you stop panicking and start finishing. A bento-style task hub for students.",
      },
      { property: "og:title", content: "Notely — Calm, smart task manager for students" },
      { property: "og:description", content: "Auto-prioritized tasks, weekly schedule, GPA simulator." },
    ],
  }),
  component: Dashboard,
});

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function Dashboard() {
  const { data: upcomingTasks } = useQuery({
    queryKey: ["tasks", "upcoming"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/tasks/upcoming");
      if (!res.ok) throw new Error("Failed to fetch upcoming tasks");
      return res.json();
    },
  });

  useEffect(() => {
    if (upcomingTasks && upcomingTasks.length > 0) {
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const urgentTasks = upcomingTasks.filter((task: any) => {
        if (!task.due_date) return false;
        // Interpret SQLModel datetime as UTC if necessary, but assuming local timezone match for simplicity
        const due = new Date(task.due_date);
        return due <= twoHoursFromNow && due >= now;
      });

      if (urgentTasks.length > 0) {
        toast(`⚠️ ${urgentTasks.length} task(s) due soon!`, {
          description: urgentTasks[0].title,
        });
      }
    }
  }, [upcomingTasks]);

  return (
    <main className="min-h-screen bg-background pb-44">
      <header className="px-5 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Tuesday, Apr 22
            </p>
            <h1 className="mt-1 text-3xl font-bold text-ink">Hi, Maya 👋</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-sm font-semibold text-ink shadow-soft">
            M
          </div>
        </div>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          You have <span className="font-semibold text-foreground">3 tasks</span> due today. Breathe — you've got this.
        </p>
      </header>

      <section className="mt-6 grid grid-cols-6 gap-3 px-5">
        {/* Streak */}
        <motion.div {...fadeUp} className="bento col-span-2 bg-orange text-primary-foreground">
          <div className="flex items-start justify-between">
            <Flame className="h-5 w-5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Streak</span>
          </div>
          <div className="mt-6">
            <div className="text-4xl font-bold leading-none">22</div>
            <div className="mt-1 text-xs opacity-90">days strong</div>
          </div>
        </motion.div>

        {/* Focus */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="bento col-span-4 bg-purple-soft">
          <div className="flex items-center gap-2 text-purple">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">AI Focus</span>
          </div>
          <p className="mt-3 text-[15px] font-semibold leading-snug text-ink">
            Start with <span className="text-purple">Calculus pset</span> — 2h block, your brain peaks at 10am.
          </p>
          <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple">
            Begin focus <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>

        {/* Today's classes */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bento col-span-3 bg-yellow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-orange">Next Class</span>
            <BookOpen className="h-4 w-4 text-orange" />
          </div>
          <div className="mt-4 text-2xl font-bold text-ink">Physics II</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> 11:00 · Room B204
          </div>
        </motion.div>

        {/* GPA */}
        <Link
          to="/tools"
          className="col-span-3 bento bg-mint-soft transition-transform hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mint">Target GPA</span>
            <Calculator className="h-4 w-4 text-mint" />
          </div>
          <div className="mt-4 text-2xl font-bold text-ink">3.78</div>
          <div className="mt-1 text-xs text-muted-foreground">On track · +0.12 this term</div>
        </Link>

        {/* Smart tasks preview */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="bento col-span-6 bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">Smart Tasks</h3>
            <Link to="/tasks" className="text-xs font-semibold text-muted-foreground">
              See all
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {[
              { title: "Submit Calculus pset", meta: "Due 6:00 PM", p: "high" as const },
              { title: "Read Ch. 4 — Sociology", meta: "Tomorrow", p: "medium" as const },
              { title: "Email Prof. Adams", meta: "This week", p: "low" as const },
            ].map((t) => (
              <li
                key={t.title}
                className="flex items-center justify-between rounded-2xl bg-secondary/60 px-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">{t.title}</div>
                  <div className="text-[11px] text-muted-foreground">{t.meta}</div>
                </div>
                <PriorityPill p={t.p} />
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Tools row */}
        <Link
          to="/tools"
          className="col-span-3 bento bg-blue-soft transition-transform hover:scale-[1.01]"
        >
          <Share2 className="h-5 w-5 text-blue" />
          <div className="mt-3 text-base font-semibold text-ink">Share Task</div>
          <div className="text-xs text-muted-foreground">Send to classmates</div>
        </Link>
        <Link
          to="/schedule"
          className="col-span-3 bento bg-red-soft transition-transform hover:scale-[1.01]"
        >
          <Calendar className="h-5 w-5 text-red" />
          <div className="mt-3 text-base font-semibold text-ink">SKS Calendar</div>
          <div className="text-xs text-muted-foreground">Your week, simplified</div>
        </Link>
      </section>

      <QuickAdd />
      <BottomNav />
    </main>
  );
}
