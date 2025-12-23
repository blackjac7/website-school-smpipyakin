import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengumuman | SMP IP Yakin Jakarta",
  description:
    "Pengumuman dan informasi penting dari SMP IP Yakin Jakarta untuk siswa, orang tua, dan masyarakat umum.",
  openGraph: {
    title: "Pengumuman | SMP IP Yakin Jakarta",
    description:
      "Pengumuman dan informasi penting dari SMP IP Yakin Jakarta untuk siswa, orang tua, dan masyarakat umum.",
    type: "website",
  },
};

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
