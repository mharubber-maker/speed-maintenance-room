import { ClipboardList, Timer, PackageCheck, Wrench } from "lucide-react";
import { jobStatus, type Job } from "@/lib/jobs";

export function StatsBar({ jobs }: { jobs: Job[] }) {
  const total = jobs.length;
  const neu = jobs.filter((j) => jobStatus(j) === "new").length;
  const progress = jobs.filter((j) => jobStatus(j) === "in_progress").length;
  const delivered = jobs.filter((j) => jobStatus(j) === "delivered").length;

  const items = [
    { label: "إجمالي الأوردرات", value: total, icon: ClipboardList },
    { label: "جديد", value: neu, icon: Timer },
    { label: "قيد الإصلاح", value: progress, icon: Wrench },
    { label: "تم التسليم", value: delivered, icon: PackageCheck },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">{item.label}</p>
            <item.icon className="size-4 text-accent" />
          </div>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight">
            {item.value}
          </p>
        </article>
      ))}
    </section>
  );
}
