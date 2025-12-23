import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fasilitas Sekolah | SMP IP Yakin Jakarta",
  description:
    "SMP IP Yakin Jakarta menyediakan fasilitas modern dan lengkap untuk mendukung proses pembelajaran dan pengembangan potensi siswa.",
  openGraph: {
    title: "Fasilitas Sekolah | SMP IP Yakin Jakarta",
    description:
      "Fasilitas modern dan lengkap untuk mendukung proses pembelajaran siswa SMP IP Yakin Jakarta.",
    type: "website",
  },
};

export default function FacilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
