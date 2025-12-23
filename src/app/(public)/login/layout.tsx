import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | SMP IP Yakin Jakarta",
  description:
    "Masuk ke portal SMP IP Yakin Jakarta untuk akses dashboard siswa, guru, dan staff.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
