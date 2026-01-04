import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/script/Chatbot";
import { SkipLink } from "@/components/shared";
import { getSettingTyped } from "@/lib/siteSettings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chatbotEnabled =
    (await getSettingTyped<boolean>("feature.chatbot")) ?? true;

  return (
    <>
      {/* Skip to main content link for keyboard accessibility */}
      <SkipLink href="#main-content">Langsung ke konten utama</SkipLink>
      <Navbar />
      <main
        id="main-content"
        className="min-h-screen"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
      {chatbotEnabled && <Chatbot />}
    </>
  );
}
