import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Crown,
  Zap,
  Bell,
  Brain,
  ShieldCheck,
  Star,
  ArrowRight,
  Lock,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Notely — Upgrade to Premium" },
      {
        name: "description",
        content:
          "Unlock AI study planner, push notifications, unlimited tasks and more with Notely Premium.",
      },
    ],
  }),
  component: BillingPage,
});

// ── Demo: treat user 1 as the logged-in user ─────────────────────────────────
const DEMO_USER_ID = 1;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const FREE_FEATURES = [
  { label: "Up to 20 tasks", included: true },
  { label: "Weekly schedule", included: true },
  { label: "Basic reminders", included: true },
  { label: "AI study planner", included: false },
  { label: "Push notifications", included: false },
  { label: "Unlimited folders", included: false },
  { label: "Priority support", included: false },
];

const PRO_FEATURES = [
  { label: "Unlimited tasks", included: true },
  { label: "Weekly schedule", included: true },
  { label: "Smart push notifications", included: true },
  { label: "AI study planner", included: true },
  { label: "GPA goal tracking", included: true },
  { label: "Unlimited folders", included: true },
  { label: "Priority support", included: true },
];

const PERKS = [
  { icon: Brain, label: "AI Study Planner", desc: "Auto-schedules tasks around your brain's peak hours", color: "text-purple", bg: "bg-purple-soft" },
  { icon: Bell, label: "Smart Notifications", desc: "Deadline reminders before it's too late", color: "text-orange", bg: "bg-orange-soft" },
  { icon: Zap, label: "Instant Sync", desc: "All your devices, always in sync", color: "text-yellow", bg: "bg-yellow-soft" },
  { icon: ShieldCheck, label: "Priority Support", desc: "Get help in under 2 hours", color: "text-mint", bg: "bg-mint-soft" },
];

// Simulated payment modal state
function PaymentModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/20 backdrop-blur-sm px-4 pb-8">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bento w-full max-w-sm bg-card"
        style={{ borderRadius: "var(--radius-3xl)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-soft">
            <Lock className="h-4 w-4 text-purple" />
          </div>
          <div>
            <div className="text-sm font-bold text-ink">Secure Checkout</div>
            <div className="text-[11px] text-muted-foreground">Mock payment — no real charge</div>
          </div>
        </div>

        {/* Plan summary */}
        <div className="rounded-2xl bg-purple-soft px-4 py-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-purple">Notely Premium</span>
            <span className="text-sm font-bold text-ink">Rp20.000<span className="text-[11px] font-normal text-muted-foreground">/mo</span></span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Billed monthly · Cancel anytime</div>
        </div>

        {/* Fake card field */}
        <div className="rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">•••• •••• •••• 4242</span>
          <span className="text-xs font-semibold text-ink">VISA</span>
        </div>

        <button
          id="billing-confirm-payment"
          onClick={onConfirm}
          disabled={loading}
          className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-ink/90 disabled:opacity-60 mb-2"
        >
          {loading ? "Processing…" : "Pay Rp20.000 — Upgrade Now"}
        </button>
        <button
          id="billing-cancel-payment"
          onClick={onCancel}
          disabled={loading}
          className="w-full rounded-2xl py-2.5 text-sm font-medium text-muted-foreground hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

function BillingPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user", DEMO_USER_ID],
    queryFn: () => usersApi.get(DEMO_USER_ID),
    retry: false,
  });

  const upgradeMutation = useMutation({
    mutationFn: () => usersApi.upgrade(DEMO_USER_ID),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["user", DEMO_USER_ID] });
      setShowModal(false);
      toast.success("🎉 Welcome to Premium!", {
        description: `You're now a Notely Premium member, ${updated.display_name || "student"}!`,
      });
    },
    onError: () => {
      toast.error("Upgrade failed — backend unreachable. Try again later.");
      setShowModal(false);
    },
  });

  const isPremium = user?.is_premium ?? false;

  return (
    <main className="min-h-screen bg-background pb-44">
      {/* Header */}
      <header className="px-5 pt-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Plan & Billing
        </p>
        <h1 className="mt-1 text-3xl font-bold text-ink">
          {isPremium ? "You're Premium ✨" : "Upgrade Your Plan"}
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          {isPremium
            ? "Enjoy all the perks of Notely Premium. Thank you for supporting us!"
            : "Unlock AI tools, smart notifications & unlimited everything."}
        </p>
      </header>

      <section className="mt-6 grid grid-cols-6 gap-3 px-5">

        {/* ── Premium status badge (shown when already premium) ─────────── */}
        {isPremium && (
          <motion.div
            {...fadeUp}
            className="bento col-span-6 bg-purple-soft"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple text-primary-foreground shadow-soft">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-bold text-ink">Premium Active</div>
                <div className="text-xs text-muted-foreground">Renews in 30 days · All features unlocked</div>
              </div>
              <Star className="ml-auto h-5 w-5 text-purple" fill="currentColor" />
            </div>
          </motion.div>
        )}

        {/* ── Free plan card ─────────────────────────────────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.05 }}
          className="bento col-span-3 bg-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Free
            </span>
            {!isPremium && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                Current
              </span>
            )}
          </div>
          <div className="mt-3 text-3xl font-bold text-ink">
            Rp0
            <span className="text-sm font-normal text-muted-foreground"> /mo</span>
          </div>
          <ul className="mt-4 space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-2 text-xs">
                {f.included ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-mint" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                )}
                <span className={f.included ? "text-ink" : "text-muted-foreground/60 line-through"}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── Premium plan card ──────────────────────────────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.1 }}
          className="bento col-span-3 bg-purple-soft"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple">
              Premium
            </span>
            <Crown className="h-3.5 w-3.5 text-purple" />
          </div>
          <div className="mt-3 text-3xl font-bold text-ink">
            Rp20.000
            <span className="text-sm font-normal text-muted-foreground"> /mo</span>
          </div>
          <ul className="mt-4 space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-purple" />
                <span className="text-ink">{f.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── Upgrade CTA ────────────────────────────────────────────────── */}
        {!isPremium && (
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.15 }}
            className="bento col-span-6 bg-ink"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary-foreground/80" />
              <span className="text-sm font-semibold text-primary-foreground">
                Ready to level up?
              </span>
            </div>
            <p className="text-[13px] text-primary-foreground/70 mb-4">
              Join thousands of students who study smarter with Notely Premium.
              Cancel anytime — no strings attached.
            </p>
            <button
              id="billing-upgrade-btn"
              onClick={() => setShowModal(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-foreground py-3 text-sm font-bold text-ink transition-all hover:bg-primary-foreground/90 active:scale-[0.98]"
            >
              Upgrade to Premium
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-center text-[11px] text-primary-foreground/40">
              🔒 Simulated payment — no real charge
            </p>
          </motion.div>
        )}

        {/* ── Perks grid ─────────────────────────────────────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.2 }}
          className="col-span-6"
        >
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What you unlock
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.label}
                {...fadeUp}
                transition={{ delay: 0.22 + i * 0.05 }}
                className={`bento ${perk.bg}`}
              >
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/60 ${perk.color}`}>
                  <perk.icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-ink">{perk.label}</div>
                <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
                  {perk.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Social proof ───────────────────────────────────────────────── */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.4 }}
          className="bento col-span-6 bg-blue-soft"
        >
          <div className="flex items-start gap-3">
            <div className="flex -space-x-2">
              {["A", "R", "M"].map((l) => (
                <div
                  key={l}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-card text-xs font-bold text-ink shadow-soft"
                >
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">
                2,400+ students upgraded
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                "My GPA went from 3.2 to 3.7 in one semester." — Anya, CS Junior
              </div>
            </div>
          </div>
        </motion.div>

      </section>

      {/* Payment modal */}
      {showModal && (
        <PaymentModal
          loading={upgradeMutation.isPending}
          onConfirm={() => upgradeMutation.mutate()}
          onCancel={() => setShowModal(false)}
        />
      )}

      <BottomNav />
    </main>
  );
}
