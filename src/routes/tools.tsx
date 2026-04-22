import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Share2, Calculator, Send, Plus, Minus, Sparkles, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { QuickAdd } from "@/components/QuickAdd";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools · Notely" },
      { name: "description", content: "Share tasks with classmates and simulate your target GPA." },
      { property: "og:title", content: "Tools · Notely" },
      { property: "og:description", content: "Share Task widget + Target IPK / GPA simulator." },
    ],
  }),
  component: ToolsPage,
});

const classmates = [
  { name: "Alex", color: "bg-orange" },
  { name: "Riya", color: "bg-purple" },
  { name: "Sam", color: "bg-mint" },
  { name: "Theo", color: "bg-blue" },
];

function ToolsPage() {
  const [shared, setShared] = useState<string[]>([]);
  const [credits, setCredits] = useState(18);
  const [target, setTarget] = useState(3.8);
  const current = 3.66;

  const needed = useMemo(() => {
    // simple weighted projection
    const totalCredits = credits + 18; // assume 18 prior credits
    const needPoints = target * totalCredits - current * 18;
    const needGpa = needPoints / credits;
    return Math.max(0, Math.min(4, Number(needGpa.toFixed(2))));
  }, [credits, target, current]);

  const onTrack = needed <= 4 && needed > 0;

  return (
    <main className="min-h-screen bg-background pb-44">
      <header className="px-5 pt-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Tools</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Little helpers</h1>
      </header>

      <section className="mt-6 grid grid-cols-6 gap-3 px-5">
        {/* Share Task */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento col-span-6 bg-blue-soft">
          <div className="flex items-center gap-2 text-blue">
            <Share2 className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Share Task</span>
          </div>
          <div className="mt-3 rounded-2xl bg-card/80 p-3">
            <div className="text-sm font-semibold text-ink">Calculus pset #6</div>
            <div className="text-[11px] text-muted-foreground">Due Today · 6:00 PM</div>
          </div>

          <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-blue/80">
            Send to
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {classmates.map((c) => {
              const on = shared.includes(c.name);
              return (
                <button
                  key={c.name}
                  onClick={() =>
                    setShared((p) => (p.includes(c.name) ? p.filter((n) => n !== c.name) : [...p, c.name]))
                  }
                  className={`flex items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-3 text-xs font-semibold text-ink shadow-soft transition-transform ${
                    on ? "scale-105 ring-2 ring-blue" : ""
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] text-primary-foreground ${c.color}`}
                  >
                    {c.name[0]}
                  </span>
                  {c.name}
                  {on && <Check className="h-3.5 w-3.5 text-blue" strokeWidth={3} />}
                </button>
              );
            })}
          </div>

          <button
            disabled={shared.length === 0}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            {shared.length ? `Share with ${shared.length}` : "Pick classmates"}
          </button>
        </motion.div>

        {/* GPA Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bento col-span-6 bg-mint-soft"
        >
          <div className="flex items-center gap-2 text-mint">
            <Calculator className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Target IPK Simulator</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card/80 p-3 text-center">
              <div className="text-[11px] text-muted-foreground">Current GPA</div>
              <div className="text-2xl font-bold text-ink">{current.toFixed(2)}</div>
            </div>
            <div className="rounded-2xl bg-card/80 p-3 text-center">
              <div className="text-[11px] text-muted-foreground">Target GPA</div>
              <div className="text-2xl font-bold text-mint">{target.toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">Target</span>
              <span className="text-muted-foreground">{target.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={2}
              max={4}
              step={0.05}
              value={target}
              onChange={(e) => setTarget(parseFloat(e.target.value))}
              className="mt-1 w-full accent-mint"
            />
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl bg-card/80 p-3">
            <div>
              <div className="text-[11px] text-muted-foreground">Credits this term</div>
              <div className="text-lg font-bold text-ink">{credits}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCredits((c) => Math.max(3, c - 3))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-soft text-mint"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCredits((c) => Math.min(30, c + 3))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-ink p-4 text-primary-foreground">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider opacity-80">
              <Sparkles className="h-3.5 w-3.5" /> Result
            </div>
            <div className="mt-1 text-sm">
              You need an average of{" "}
              <span className="text-mint">{needed.toFixed(2)}</span> this term to hit{" "}
              <span className="font-semibold">{target.toFixed(2)}</span>.
            </div>
            <div className="mt-2 text-[11px] opacity-80">
              {onTrack ? "Totally doable — keep your streak going." : "A stretch — adjust target or credits."}
            </div>
          </div>
        </motion.div>
      </section>

      <QuickAdd />
      <BottomNav />
    </main>
  );
}
