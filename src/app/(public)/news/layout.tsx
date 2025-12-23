import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita & Prestasi | SMP IP Yakin Jakarta",
  description:
    "Ikuti perkembangan terbaru, prestasi siswa, dan agenda kegiatan di lingkungan SMP IP Yakin Jakarta.",
  openGraph: {
    title: "Berita & Prestasi | SMP IP Yakin Jakarta",
    description:
      "Ikuti perkembangan terbaru, prestasi siswa, dan agenda kegiatan di lingkungan SMP IP Yakin Jakarta.",
    type: "website",
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
