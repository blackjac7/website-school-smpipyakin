import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/script/Chatbot";
import { SkipLink } from "@/components/shared";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <Chatbot />
    </>
  );
}
