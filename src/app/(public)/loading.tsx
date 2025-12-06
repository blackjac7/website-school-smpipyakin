import SimpleLoading from "@/components/shared/SimpleLoading";

/**
 * Loading component.
 * Displays a simple loading indicator with a message while public pages are being fetched.
 * @returns {JSX.Element} The rendered Loading component.
 */
export default function Loading() {
  return <SimpleLoading message="Memuat halaman sekolah..." />;
}
