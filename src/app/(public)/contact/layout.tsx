import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hubungi Kami | SMP IP Yakin Jakarta",
  description:
    "Hubungi SMP IP Yakin Jakarta untuk informasi pendaftaran, kunjungan, atau pertanyaan lainnya. Kami siap membantu Anda.",
  openGraph: {
    title: "Hubungi Kami | SMP IP Yakin Jakarta",
    description:
      "Hubungi SMP IP Yakin Jakarta untuk informasi pendaftaran, kunjungan, atau pertanyaan lainnya.",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
