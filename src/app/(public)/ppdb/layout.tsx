import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PPDB - Penerimaan Peserta Didik Baru | SMP IP Yakin Jakarta",
  description:
    "Daftar menjadi siswa baru SMP IP Yakin Jakarta. Informasi lengkap tentang persyaratan, jadwal, dan proses pendaftaran peserta didik baru.",
  openGraph: {
    title: "PPDB - Penerimaan Peserta Didik Baru | SMP IP Yakin Jakarta",
    description:
      "Daftar menjadi siswa baru SMP IP Yakin Jakarta. Informasi lengkap tentang persyaratan dan proses pendaftaran.",
    type: "website",
  },
};

export default function PPDBLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
