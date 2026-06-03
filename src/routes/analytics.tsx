import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Lock, Crown, BarChart2, PieChart as PieIcon, CheckCircle2, Clock, ListChecks } from "lucide-react";

// ── Demo user ────────────────────────────────────────────────────────────────
const DEMO_USER_ID = 1;
const BASE = "";

// ── Design-system colours (oklch mapped to hex for recharts) ─────────────────
const PALETTE = {
  mint:   "#5ecb9e",   // brand-mint
  purple: "#9b6fce",   // brand-purple
  orange: "#e07b39",   // brand-orange
  blue:   "#6da8d4",   // brand-blue
  yellow: "#d4b84a",   // brand-yellow
};

const PIE_COLORS = [PALETTE.orange, PALETTE.purple, PALETTE.mint];
const BAR_COLOR  = PALETTE.blue;

// ── Types ────────────────────────────────────────────────────────────────────
interface AnalyticsStats {
  user_id: number;
  total_tasks: number;
  completed: number;
  pending: number;
  priority_distribution: { priority: string; count: number }[];
  completion_history: { date: string; completed: number }[];
}

// ── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Notely — Productivity Analytics" },
      {
        name: "description",
        content:
          "Premium analytics dashboard: track task completion, priority distribution and 7-day study streaks.",
      },
    ],
  }),
  component: AnalyticsPage,
});

// ── Framer variants ───────────────────────────────────────────────────────────
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

// ── Custom tooltip for bar chart ─────────────────────────────────────────────
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border/60 bg-card px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-muted-foreground">
        Completed: <span className="font-bold text-blue">{payload[0].value}</span>
      </p>
    </div>
  );
}

// ── Custom tooltip for pie chart ─────────────────────────────────────────────
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border/60 bg-card px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-ink">{payload[0].name}</p>
      <p className="text-muted-foreground">
        Tasks: <span className="font-bold text-ink">{payload[0].value}</span>
      </p>
    </div>
  );
}

// ── Skeleton loading state ────────────────────────────────────────────────────
function AnalyticsSkeleton() {
  return (
    <section className="mt-6 grid grid-cols-6 gap-3 px-5">
      <Skeleton className="col-span-2 h-24 rounded-3xl" />
      <Skeleton className="col-span-2 h-24 rounded-3xl" />
      <Skeleton className="col-span-2 h-24 rounded-3xl" />
      <Skeleton className="col-span-6 h-56 rounded-3xl" />
      <Skeleton className="col-span-6 h-56 rounded-3xl" />
    </section>
  );
}

// ── Premium lock screen ───────────────────────────────────────────────────────
function PremiumLock() {
  const navigate = useNavigate();
  return (
    <motion.div
      {...fadeUp}
      className="mx-5 mt-8 flex flex-col items-center rounded-[2rem] bg-purple-soft px-6 py-12 text-center shadow-soft"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-purple text-primary-foreground shadow-pop">
        <Lock className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-ink">Premium Feature</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Productivity Analytics is exclusively available to{" "}
        <span className="font-semibold text-purple">Notely Premium</span> members.
        Upgrade to unlock charts, streaks, and deep insights.
      </p>
      <ul className="mt-5 space-y-2 text-left text-sm">
        {[
          "7-day completion history",
          "Priority distribution pie chart",
          "Completion rate & streaks",
        ].map((f) => (
          <li key={f} className="flex items-center gap-2 text-ink">
            <Crown className="h-3.5 w-3.5 text-purple" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        id="analytics-upgrade-btn"
        className="mt-7 w-full rounded-2xl bg-ink py-5 text-sm font-bold text-primary-foreground hover:bg-ink/90"
        onClick={() => navigate({ to: "/billing" })}
      >
        Upgrade to Premium
      </Button>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyAnalytics() {
  return (
    <motion.div
      {...fadeUp}
      transition={{ delay: 0.15 }}
      className="bento col-span-6 flex flex-col items-center justify-center bg-card py-12 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground shadow-sm">
        <BarChart2 className="h-6 w-6 opacity-70" />
      </div>
      <h3 className="text-base font-bold text-ink">No Data Available</h3>
      <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
        Complete some tasks to unlock your productivity insights and trends.
      </p>
    </motion.div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  bg,
  accent,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  bg: string;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div {...fadeUp} transition={{ delay }} className={`bento col-span-2 ${bg}`}>
      <div className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/60 ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-3xl font-bold text-ink leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function AnalyticsPage() {
  const { data, isLoading, error } = useQuery<AnalyticsStats>({
    queryKey: ["analytics", DEMO_USER_ID],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/analytics/stats?user_id=${DEMO_USER_ID}`);
      if (res.status === 403) {
        const body = await res.json();
        throw Object.assign(new Error(body.detail ?? "Forbidden"), { status: 403 });
      }
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    retry: false,
  });

  const is403 =
    error instanceof Error && (error as any).status === 403;

  // Format date labels to short "Mon 02" style
  const historyData = (data?.completion_history ?? []).map((d) => {
    const dt = new Date(d.date + "T00:00:00");
    return {
      date: dt.toLocaleDateString("en-US", { weekday: "short", day: "2-digit" }),
      completed: d.completed,
    };
  });

  return (
    <main className="min-h-screen bg-background pb-44">
      {/* Header */}
      <header className="px-5 pt-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Premium · Analytics
        </p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Your Productivity</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Insights and trends from your study activity.
        </p>
      </header>

      {/* Loading */}
      {isLoading && <AnalyticsSkeleton />}

      {/* 403 — not premium */}
      {is403 && <PremiumLock />}

      {/* Error (non-403) */}
      {error && !is403 && (
        <div className="mx-5 mt-8 rounded-3xl bg-red-soft px-5 py-6 text-sm text-red">
          Could not load analytics. Make sure the backend is running.
        </div>
      )}

      {/* Data */}
      {data && (
        <section className="mt-6 grid grid-cols-6 gap-3 px-5">

          {/* ── Stat pills ───────────────────────────────────────────── */}
          <StatCard
            label="Total Tasks"
            value={data.total_tasks}
            icon={ListChecks}
            bg="bg-blue-soft"
            accent="text-blue"
            delay={0}
          />
          <StatCard
            label="Completed"
            value={data.completed}
            icon={CheckCircle2}
            bg="bg-mint-soft"
            accent="text-mint"
            delay={0.05}
          />
          <StatCard
            label="Pending"
            value={data.pending}
            icon={Clock}
            bg="bg-orange-soft"
            accent="text-orange"
            delay={0.1}
          />

          {data.total_tasks === 0 ? (
            <EmptyAnalytics />
          ) : (
            <>
              {/* ── Completion rate progress bar ─────────────────────────── */}
              <motion.div
            {...fadeUp}
            transition={{ delay: 0.12 }}
            className="bento col-span-6 bg-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-ink">Completion Rate</span>
              <span className="text-sm font-bold text-mint">
                {data.total_tasks > 0
                  ? Math.round((data.completed / data.total_tasks) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-mint"
                initial={{ width: 0 }}
                animate={{
                  width: `${data.total_tasks > 0 ? (data.completed / data.total_tasks) * 100 : 0}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>{data.completed} done</span>
              <span>{data.pending} remaining</span>
            </div>
          </motion.div>

          {/* ── Bar chart — 7-day completion history ─────────────────── */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.15 }}
            className="bento col-span-6 bg-card"
          >
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-soft">
                <BarChart2 className="h-3.5 w-3.5 text-blue" />
              </div>
              <div>
                <div className="text-sm font-bold text-ink">7-Day History</div>
                <div className="text-[11px] text-muted-foreground">Tasks completed per day</div>
              </div>
            </div>
            <div className="mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData} barSize={18} margin={{ left: -28 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "oklch(0.5 0.02 260)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "oklch(0.5 0.02 260)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "oklch(0.96 0.01 95)" }} />
                  <Bar
                    dataKey="completed"
                    fill={BAR_COLOR}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ── Pie chart — priority distribution ────────────────────── */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="bento col-span-6 bg-purple-soft"
          >
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/60">
                <PieIcon className="h-3.5 w-3.5 text-purple" />
              </div>
              <div>
                <div className="text-sm font-bold text-ink">Priority Split</div>
                <div className="text-[11px] text-muted-foreground">
                  Distribution of High / Medium / Low tasks
                </div>
              </div>
            </div>
            <div className="mt-2 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.priority_distribution ?? []}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {(data?.priority_distribution ?? []).map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: 11, color: "oklch(0.18 0.02 260)" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
            </>
          )}

        </section>
      )}

      <BottomNav />
    </main>
  );
}
