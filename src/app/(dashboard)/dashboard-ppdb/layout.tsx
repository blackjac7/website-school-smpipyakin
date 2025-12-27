import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard PPDB | SMP IP Yakin",
  description: "Pusat manajemen Penerimaan Peserta Didik Baru",
};

export default function PPDBDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
