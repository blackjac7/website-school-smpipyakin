import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ekstrakurikuler | SMP IP Yakin Jakarta",
  description:
    "Program ekstrakurikuler SMP IP Yakin Jakarta untuk mengembangkan bakat dan minat siswa melalui berbagai kegiatan positif.",
  openGraph: {
    title: "Ekstrakurikuler | SMP IP Yakin Jakarta",
    description:
      "Program ekstrakurikuler SMP IP Yakin Jakarta untuk mengembangkan bakat dan minat siswa.",
    type: "website",
  },
};

export default function ExtracurricularLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
