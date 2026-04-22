export type Priority = "high" | "medium" | "low";

export const priorityStyles: Record<
  Priority,
  { bg: string; ring: string; dot: string; label: string; text: string }
> = {
  high: {
    bg: "bg-red-soft",
    ring: "ring-red/30",
    dot: "bg-red",
    text: "text-red",
    label: "High",
  },
  medium: {
    bg: "bg-yellow-soft",
    ring: "ring-yellow/40",
    dot: "bg-yellow",
    text: "text-orange",
    label: "Medium",
  },
  low: {
    bg: "bg-mint-soft",
    ring: "ring-mint/40",
    dot: "bg-mint",
    text: "text-mint",
    label: "Low",
  },
};

export function PriorityPill({ p }: { p: Priority }) {
  const s = priorityStyles[p];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
