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
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </section>
  );
}
