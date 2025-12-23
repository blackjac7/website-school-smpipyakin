import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Karya Siswa | SMP IP Yakin Jakarta",
  description:
    "Galeri karya dan kreativitas siswa SMP IP Yakin Jakarta. Menampilkan hasil karya seni, proyek, dan prestasi siswa.",
  openGraph: {
    title: "Karya Siswa | SMP IP Yakin Jakarta",
    description: "Galeri karya dan kreativitas siswa SMP IP Yakin Jakarta.",
    type: "website",
  },
};

export default function KaryaSiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
