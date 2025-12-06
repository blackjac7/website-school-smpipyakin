import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * PublicLayout component.
 * Provides the common layout structure for public pages, including the Navbar and Footer.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The rendered PublicLayout component.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
