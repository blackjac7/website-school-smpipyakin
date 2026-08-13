"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, FileCheck2, Search, Users } from "lucide-react";

export interface PPDBStatus {
  isOpen: boolean;
  message: string;
  quota?: { total: number; registered: number; remaining: number };
  period?: { start: Date | null; end: Date | null; academicYear: string };
}

const steps = [
  { icon: Users, title: "Isi data calon siswa", description: "Siapkan NISN, identitas siswa, dan data orang tua." },
  { icon: FileCheck2, title: "Unggah dokumen", description: "Tambahkan dokumen yang diminta dengan format yang sesuai." },
  { icon: CheckCircle2, title: "Kirim dan pantau", description: "Simpan bukti pendaftaran lalu cek status menggunakan NISN." },
];

export function PPDBPageClient({ ppdbStatus }: { ppdbStatus: PPDBStatus }) {
  const remaining = ppdbStatus.quota?.remaining;
  const total = ppdbStatus.quota?.total;

  return (
    <div className="bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden bg-blue-950 pb-16 pt-32 text-white sm:pb-20 sm:pt-36">
        <div aria-hidden="true" className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="public-container relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-green-300/30 bg-green-300/10 px-4 py-2 text-sm font-bold text-green-200">Pendaftaran sedang dibuka</span>
            <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Penerimaan Peserta Didik Baru</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">Daftar secara online dengan alur yang jelas. Baca persyaratan, siapkan dokumen, lalu pantau hasil verifikasi menggunakan NISN.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/ppdb/register" className="public-button-primary min-h-12 px-6">Mulai pendaftaran <ArrowRight aria-hidden="true" className="h-5 w-5" /></Link>
              <Link href="/ppdb/status" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 font-bold hover:bg-white hover:text-blue-950"><Search aria-hidden="true" className="h-5 w-5" /> Cek status</Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur sm:p-8" aria-label="Status PPDB">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">Tahun ajaran</p>
            <p className="mt-2 text-3xl font-extrabold">{ppdbStatus.period?.academicYear ?? "Tahun berjalan"}</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-4"><span className="block text-2xl font-extrabold">{remaining ?? "—"}</span><span className="mt-1 block text-sm text-blue-100">Sisa kuota</span></div>
              <div className="rounded-2xl bg-white/10 p-4"><span className="block text-2xl font-extrabold">{total ?? "—"}</span><span className="mt-1 block text-sm text-blue-100">Total kuota</span></div>
            </div>
            <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-blue-100"><CalendarDays aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /> Kuota dan periode mengikuti pengaturan resmi panitia PPDB.</p>
          </aside>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="max-w-2xl"><p className="public-eyebrow">Alur pendaftaran</p><h2 className="public-heading mt-3">Tiga langkah untuk mendaftar</h2><p className="public-lead mt-5">Lengkapi satu langkah pada satu waktu. Sistem akan memberi feedback ketika data perlu diperbaiki.</p></div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => { const Icon = step.icon; return <li key={step.title} className="public-card p-7"><span className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200"><Icon aria-hidden="true" className="h-6 w-6" /></span><span className="text-sm font-extrabold text-slate-400">0{index + 1}</span></span><h3 className="mt-6 text-xl font-extrabold text-slate-950 dark:text-white">{step.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.description}</p></li>; })}
          </ol>
        </div>
      </section>

      <section className="bg-slate-50 py-14 dark:bg-slate-900/50">
        <div className="public-container flex flex-col gap-6 rounded-3xl bg-blue-900 p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-2xl font-extrabold sm:text-3xl">Sudah menyiapkan data dan dokumen?</h2><p className="mt-3 max-w-2xl text-blue-100">Mulai formulir pendaftaran. Anda akan melihat progress, validasi, dan hasil pengiriman secara jelas.</p></div>
          <Link href="/ppdb/register" className="public-button-primary shrink-0">Daftar sekarang <ArrowRight aria-hidden="true" className="h-5 w-5" /></Link>
        </div>
      </section>
    </div>
  );
}
