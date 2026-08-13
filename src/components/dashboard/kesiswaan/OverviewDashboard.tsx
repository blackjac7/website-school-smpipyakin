"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileBarChart,
  ScanLine,
  Shirt,
  Sparkles,
  UserPlus,
} from "lucide-react";
import type {
  DashboardStats,
  KesiswaanOperationalOverview,
} from "@/actions/kesiswaan";

interface OverviewDashboardProps {
  overview: KesiswaanOperationalOverview;
  validationStats: DashboardStats;
  onNavigate: (menu: string) => void;
}

export default function OverviewDashboard({
  overview,
  validationStats,
  onNavigate,
}: OverviewDashboardProps) {
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const priorities = [
    {
      label: "Konten menunggu",
      value: overview.pendingContent,
      helper: "Perlu keputusan Kesiswaan",
      icon: CheckCircle2,
      tone: "bg-amber-50 text-amber-700 border-amber-100",
      menu: "validation",
    },
    {
      label: "Terlambat hari ini",
      value: overview.latenessToday,
      helper: `${overview.latenessThisWeek} kejadian minggu ini`,
      icon: Clock3,
      tone: "bg-rose-50 text-rose-700 border-rose-100",
      menu: "reports",
    },
    {
      label: "Pelanggaran atribut",
      value: overview.attributeToday,
      helper: `${overview.attributeThisWeek} pemeriksaan minggu ini`,
      icon: Shirt,
      tone: "bg-indigo-50 text-indigo-700 border-indigo-100",
      menu: "reports",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_85%_15%,rgba(251,191,36,0.32),transparent_28%),linear-gradient(135deg,#172554_0%,#1e3a8a_58%,#1d4ed8_100%)] p-5 text-white shadow-xl shadow-blue-950/15 sm:p-7 lg:p-8">
        <div className="absolute -bottom-20 -right-10 h-60 w-60 rounded-full border-[38px] border-white/5" />
        <div className="relative grid gap-7 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Pusat Kendali Kesiswaan
            </div>
            <p className="mt-5 text-sm capitalize text-blue-200">{dateLabel}</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
              Situasi sekolah hari ini, dalam satu pandangan.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Pantau disiplin, tindak lanjut siswa, dan antrean validasi tanpa
              berpindah-pindah halaman.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                Total siswa
              </p>
              <p className="mt-1 text-3xl font-black">{overview.totalStudents}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                Rombel aktif
              </p>
              <p className="mt-1 text-3xl font-black">{overview.totalClasses}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {priorities.map((item) => (
          <button
            type="button"
            key={item.label}
            onClick={() => onNavigate(item.menu)}
            className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:p-5 ${item.tone}`}
          >
            <div className="flex items-start justify-between gap-3">
              <item.icon className="h-6 w-6" />
              <ArrowRight className="h-4 w-4 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
            </div>
            <p className="mt-5 text-3xl font-black text-gray-950">{item.value}</p>
            <p className="mt-1 font-bold text-gray-900">{item.label}</p>
            <p className="mt-1 text-xs opacity-80">{item.helper}</p>
          </button>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Aktivitas terbaru
              </p>
              <h3 className="mt-1 text-xl font-black text-gray-950">
                Catatan disiplin terakhir
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("reports")}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Buka laporan
            </button>
          </div>

          <div className="mt-5 space-y-2">
            {overview.recentIncidents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <ScanLine className="mx-auto h-9 w-9 text-gray-300" />
                <p className="mt-3 font-semibold text-gray-700">Belum ada catatan terbaru</p>
                <p className="mt-1 text-sm text-gray-500">Aktivitas scanner akan muncul di sini.</p>
              </div>
            ) : (
              overview.recentIncidents.map((incident) => (
                <div
                  key={`${incident.type}-${incident.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3.5 hover:bg-gray-50"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${incident.type === "lateness" ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}`}>
                    {incident.type === "lateness" ? <Clock3 className="h-5 w-5" /> : <Shirt className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-gray-900">{incident.studentName}</p>
                    <p className="text-xs text-gray-500">
                      {incident.className || "Tanpa kelas"} · {incident.type === "lateness" ? "Keterlambatan" : "Atribut"}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-gray-600">{incident.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-gray-950 p-5 text-white shadow-xl sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
            Aksi cepat
          </p>
          <h3 className="mt-2 text-xl font-black">Pekerjaan yang sering dilakukan</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: "Kelola siswa", icon: UserPlus, menu: "students" },
              { label: "Cetak kartu", icon: CreditCard, menu: "kartu-siswa" },
              { label: "Buka laporan", icon: FileBarChart, menu: "reports" },
              { label: "Validasi konten", icon: CheckCircle2, menu: "validation" },
            ].map((action) => (
              <button
                type="button"
                key={action.label}
                onClick={() => onNavigate(action.menu)}
                className="min-h-28 rounded-2xl border border-white/10 bg-white/7 p-4 text-left transition hover:border-amber-300/40 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <action.icon className="h-5 w-5 text-amber-300" />
                <span className="mt-6 block text-sm font-bold">{action.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-blue-900/60 p-4">
            <p className="text-xs text-blue-200">Validasi terselesaikan</p>
            <p className="mt-1 text-2xl font-black">
              {validationStats.summary.approved}
              <span className="ml-1 text-sm font-medium text-blue-200">konten</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
