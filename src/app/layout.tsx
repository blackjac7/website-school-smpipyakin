import type { Metadata } from "next";
import "./globals.css";
import StructuredData from "@/components/script/StructuredData";
import { LoadingProvider } from "@/components/shared";
import { AuthProvider } from "@/components/shared/AuthProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  title: "SMP IP Yakin Jakarta | Sekolah Menengah Pertama Cengkareng",
  description:
    "SMP IP Yakin Jakarta: Sekolah unggulan dengan pendidikan berkualitas, program inovatif, dan pembentukan generasi berkarakter.",
  keywords:
    "SMP IP Yakin Jakarta, sekolah Islam, sekolah unggulan, pendidikan berkualitas, sekolah menengah Jakarta",
  authors: [{ name: "SMP IP Yakin Jakarta" }],
  robots: "index, follow",
  openGraph: {
    title: "SMP IP Yakin Jakarta",
    description:
      "Sekolah Menengah Pertama dengan pendidikan berkualitas dan program pembelajaran inovatif.",
    url: "https://smpipyakinjakarta.sch.id ",
    siteName: "SMP IP Yakin Jakarta",
    images: [
      {
        url: "https://www.smpipyakinjakarta.sch.id/logo.png ",
        width: 800,
        height: 600,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SMP IP Yakin Jakarta",
    description:
      "Sekolah Menengah Pertama dengan pendidikan berkualitas dan program pembelajaran inovatif.",
    images: ["https://www.smpipyakinjakarta.sch.id/logo.png "],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Preload images for desktop */}
        <link
          rel="preload"
          href="https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp "
          as="image"
          type="image/webp"
          crossOrigin="anonymous"
          media="(min-width: 1024px)"
        />

        {/* Preload images for mobile */}
        <link
          rel="preload"
          href="https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp "
          as="image"
          type="image/webp"
          crossOrigin="anonymous"
          media="(max-width: 1023px)"
        />
        <link rel="canonical" href="https://www.smpipyakinjakarta.sch.id " />
        <meta name="robots" content="index, follow" />
        <meta
          name="google-site-verification"
          content="4sneV0C9--1COSlSa37T4GUITi8mTQz1RGIeS6Hn_W0"
        />
        <StructuredData />
      </head>
      <body className="bg-white text-gray-900">
        <AuthProvider>
          <LoadingProvider>
            <main className="min-h-screen">{children}</main>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#374151",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow:
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                },
                success: {
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
