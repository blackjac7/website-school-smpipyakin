import type { Metadata } from "next";

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: "Kalender Akademik | SMP IP Yakin Jakarta",
  description: `Jadwal kegiatan akademik dan non-akademik SMP IP Yakin Jakarta Tahun Pelajaran ${currentYear}/${currentYear + 1}.`,
  openGraph: {
    title: "Kalender Akademik | SMP IP Yakin Jakarta",
    description: `Jadwal kegiatan akademik dan non-akademik SMP IP Yakin Jakarta Tahun Pelajaran ${currentYear}/${currentYear + 1}.`,
    type: "website",
  },
};

export default function AcademicCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
