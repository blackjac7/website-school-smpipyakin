"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { OsisActivity } from "./types";
import { getScanWindowStatus } from "@/lib/scan-window";

interface MissionControlProps {
  activities: OsisActivity[];
  onNavigate: (menu: string) => void;
  onAddActivity: () => void;
}

export default function MissionControl({
  activities,
  onNavigate,
  onAddActivity,
}: MissionControlProps) {
  const now = new Date();
  const nextActivity = activities
    .filter((activity) => new Date(activity.date).getTime() >= now.getTime())
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )[0];
  const pending = activities.filter((activity) => activity.status === "PENDING").length;
  const approved = activities.filter((activity) => activity.status === "APPROVED").length;
  const progress = activities.length
    ? Math.min(100, Math.round((approved / activities.length) * 100))
    : 0;
  const latenessWindow = getScanWindowStatus("lateness", now);
  const attributeWindow = getScanWindowStatus("attribute", now);
  const scannerOpen = latenessWindow.isOpen || attributeWindow.isOpen;

  return (
    <section className="mb-5 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_88%_12%,rgba(250,204,21,0.38),transparent_26%),linear-gradient(135deg,#172554_0%,#1e3a8a_56%,#2563eb_100%)] text-white shadow-xl shadow-blue-950/15">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Mission Control OSIS
          </div>
          <h2 className="mt-5 max-w-xl text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
            Bergerak hari ini, berdampak untuk sekolah.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
            Kelola program, dokumentasi, dan tugas piket melalui pusat kerja yang
            dirancang khusus untuk ritme organisasi siswa.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onAddActivity}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-black text-blue-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300"
            >
              <Plus className="h-5 w-5" />
              Ajukan program baru
            </button>
            <button
              type="button"
              onClick={() => onNavigate("keterlambatan")}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              <ScanLine className="h-5 w-5" />
              Buka scanner
              <span className={`ml-1 h-2 w-2 rounded-full ${scannerOpen ? "bg-emerald-400" : "bg-amber-300"}`} />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur-md sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                Agenda terdekat
              </p>
              <p className="mt-1 text-lg font-black">
                {nextActivity?.title || "Belum ada agenda"}
              </p>
            </div>
            <CalendarDays className="h-6 w-6 text-amber-300" />
          </div>
          {nextActivity ? (
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-blue-950/35 p-3">
                <p className="text-xs text-blue-200">Tanggal</p>
                <p className="mt-1 font-bold">
                  {format(new Date(nextActivity.date), "d MMM yyyy", { locale: idLocale })}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-950/35 p-3">
                <p className="text-xs text-blue-200">Waktu</p>
                <p className="mt-1 font-bold">{nextActivity.time} WIB</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAddActivity}
              className="mt-5 flex w-full items-center justify-between rounded-2xl bg-white/10 p-4 text-left text-sm font-bold hover:bg-white/15"
            >
              Susun agenda pertama
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-100">Kemajuan program kerja</span>
              <span className="font-black text-amber-300">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-950/45">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/7 p-2">
                <FileText className="mx-auto h-4 w-4 text-blue-200" />
                <p className="mt-1 text-lg font-black">{activities.length}</p>
                <p className="text-[10px] text-blue-200">Total</p>
              </div>
              <div className="rounded-xl bg-white/7 p-2">
                <Clock3 className="mx-auto h-4 w-4 text-amber-300" />
                <p className="mt-1 text-lg font-black">{pending}</p>
                <p className="text-[10px] text-blue-200">Ditinjau</p>
              </div>
              <div className="rounded-xl bg-white/7 p-2">
                <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-300" />
                <p className="mt-1 text-lg font-black">{approved}</p>
                <p className="text-[10px] text-blue-200">Disetujui</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
