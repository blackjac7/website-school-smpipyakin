import type { Metadata, Viewport } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import StructuredData from "@/components/script/StructuredData";
import { LoadingProvider } from "@/components/shared";
import { AuthProvider } from "@/components/shared/AuthProvider";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2675f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.smpipyakin.sch.id"),
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "48x48" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  title: "SMP IP Yakin Jakarta | Sekolah Menengah Pertama Cengkareng",
  description:
    "SMP IP Yakin Jakarta: Sekolah unggulan dengan pendidikan berkualitas, program inovatif, dan pembentukan generasi berkarakter.",
  keywords:
    "SMP IP Yakin Jakarta, SMP Swasta Jakarta, SMP Terbaik Cengkareng, Sekolah Berkarakter, Kurikulum Merdeka, PPDB SMP Jakarta, Sekolah Unggulan Jakarta",
  authors: [{ name: "SMP IP Yakin Jakarta" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.smpipyakin.sch.id",
  },
  verification: {
    google: "4sneV0C9--1COSlSa37T4GUITi8mTQz1RGIeS6Hn_W0",
  },
  openGraph: {
    title: "SMP IP Yakin Jakarta",
    description:
      "Sekolah Menengah Pertama dengan pendidikan berkualitas dan program pembelajaran inovatif.",
    url: "https://smpipyakin.sch.id",
    siteName: "SMP IP Yakin Jakarta",
    images: [
      {
        url: "https://www.smpipyakin.sch.id/logo.png",
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
    images: ["https://www.smpipyakin.sch.id/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SMP IP Yakin" />

        {/* Preload images for desktop */}
        <link
          rel="preload"
          href="https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp"
          as="image"
          type="image/webp"
          crossOrigin="anonymous"
          media="(min-width: 1024px)"
        />

        {/* Preload images for mobile */}
        <link
          rel="preload"
          href="https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp"
          as="image"
          type="image/webp"
          crossOrigin="anonymous"
          media="(max-width: 1023px)"
        />
        <StructuredData />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <NextTopLoader
          color="#3B82F6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #3B82F6,0 0 5px #3B82F6"
          zIndex={9999}
        />
        <ThemeProvider>
          <AuthProvider>
            <LoadingProvider>
              <main className="min-h-screen">{children}</main>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className:
                    "!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100",
                  style: {
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "var(--toast-border, #e5e7eb)",
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
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS === '1' && (
          <SpeedInsights />
        )}
      </body>
    </html>
  );
}
