import { Link, useLocation } from "@tanstack/react-router";
import { Home, ListChecks, CalendarDays, Wrench, Crown, BarChart2 } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/analytics", label: "Stats", icon: BarChart2 },
  { to: "/billing", label: "Premium", icon: Crown },
] as const;


export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/90 px-2 py-2 shadow-[0_8px_30px_-8px_oklch(0.18_0.02_260/0.18)] backdrop-blur-xl">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all ${
                active
                  ? "bg-ink text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
              {active && <span>{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
