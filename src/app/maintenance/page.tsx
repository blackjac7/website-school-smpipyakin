import { Metadata } from "next";
import MaintenancePageClient from "./MaintenancePageClient";

export const metadata: Metadata = {
  title: "Pemeliharaan | SMP IP Yakin Jakarta",
  description: "Website sedang dalam pemeliharaan",
};

interface MaintenancePageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function MaintenancePage({
  searchParams,
}: MaintenancePageProps) {
  const { message } = await searchParams;

  return <MaintenancePageClient message={message} />;
}
