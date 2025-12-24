import { Metadata } from "next";
import SettingsPage from "./SettingsPage";

export const metadata: Metadata = {
  title: "Pengaturan Sistem | Dashboard Admin",
  description: "Kelola pengaturan website, mode pemeliharaan, dan PPDB",
};

export default function AdminSettingsPage() {
  return <SettingsPage />;
}
