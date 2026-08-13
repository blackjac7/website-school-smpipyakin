import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardPageIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: ReactNode;
}

export default function DashboardPageIntro({ eyebrow, title, description, icon: Icon, action }: DashboardPageIntroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="dashboard-icon-box h-11 w-11 rounded-xl"><Icon className="h-5 w-5" aria-hidden="true" /></div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  );
}
