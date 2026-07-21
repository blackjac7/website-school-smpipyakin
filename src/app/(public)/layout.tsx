import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/script/Chatbot";
import { SkipLink } from "@/components/shared";
import { getSettingTyped, isMaintenanceMode } from "@/lib/siteSettings";
import { headers } from "next/headers";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chatbotEnabled =
    (await getSettingTyped<boolean>("feature.chatbot")) ?? true;

  // Check if maintenance mode is active
  const maintenanceActive = await isMaintenanceMode();

  // Get current path
  const headersList = await headers();
  const currentPath = headersList.get("x-current-path") || "/";

  // Don't show navbar/footer during maintenance mode
  const hideNavigation = maintenanceActive && currentPath !== "/maintenance";

  return (
    <>
      {/* Skip to main content link for keyboard accessibility */}
      {!hideNavigation && (
        <SkipLink href="#main-content">Langsung ke konten utama</SkipLink>
      )}
      {!hideNavigation && <Navbar />}
      <main
        id="main-content"
        className="min-h-screen"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>
      {!hideNavigation && <Footer />}
      {!hideNavigation && chatbotEnabled && <Chatbot />}
    </>
  );
}
