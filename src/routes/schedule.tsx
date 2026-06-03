import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Clock, Loader2, AlertCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { QuickAdd } from "@/components/QuickAdd";
import { scheduleApi } from "@/lib/api";

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

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon

function SchedulePage() {
  const {
    data: timeline = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["schedule", today],
    queryFn: () => scheduleApi.list({ day_of_week: today }),
  });

  return (
    <main className="min-h-screen bg-background pb-44">
      <header className="px-5 pt-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">SKS Calendar</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Your week</h1>
      </header>

      {/* Day strip */}
      <div className="mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {days.map((d, i) => {
          const active = i === today;
          return (
            <button
              key={d}
              className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-xs font-semibold transition-colors ${
                active ? "bg-ink text-primary-foreground" : "bg-card text-muted-foreground shadow-soft"
              }`}
            >
              <span className="opacity-70">{d}</span>
              <span className="mt-1 text-lg font-bold">{20 + i}</span>
            </button>
          );
        })}
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
          <p className="text-xs text-muted-foreground">Make sure the backend is running on port 8000.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <section className="mt-6 px-5">
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            <ul className="space-y-3">
              {timeline.map((e, i) => (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  <span
                    className={`absolute -left-[18px] top-5 h-3 w-3 rounded-full border-2 border-background ${
                      e.is_current ? "bg-orange" : e.is_deadline ? "bg-red" : "bg-ink/30"
                    }`}
                  />
                  <div className={`bento ${e.color ?? ""} ${e.is_deadline ? "border-2 border-dashed border-red/40" : ""}`}>
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {e.time}
                      </span>
                      {e.is_current && (
                        <span className="rounded-full bg-orange px-2 py-0.5 text-primary-foreground">Now</span>
                      )}
                      {e.is_deadline && (
                        <span className="rounded-full bg-red px-2 py-0.5 text-primary-foreground">Deadline</span>
                      )}
                    </div>
                    <div className="mt-2 text-base font-bold text-ink">{e.title}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink/60">
                      <MapPin className="h-3 w-3" /> {e.room}
                    </div>
                  </div>
                </motion.li>
              ))}
              {timeline.length === 0 && (
                <li className="py-8 text-center text-sm text-muted-foreground">No events today.</li>
              )}
            </ul>
          </div>
        </section>
      )}

      <QuickAdd />
      <BottomNav />
    </main>
  );
}
