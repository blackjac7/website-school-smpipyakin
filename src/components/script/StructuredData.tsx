/**
 * StructuredData component.
 * Injects JSON-LD structured data for SEO purposes, defining the organization as a School.
 * @returns {JSX.Element} The rendered script tag with JSON-LD content.
 */
export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org ",
    "@type": "School",
    name: "SMP IP Yakin Jakarta",
    description:
      "Sekolah Menengah Pertama dengan pendidikan berkualitas dan program pembelajaran inovatif",
    url: "https://smpipyakinjakarta.sch.id ",
    logo: "https://www.smpipyakinjakarta.sch.id/logo.png ",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressRegion: "DKI Jakarta",
      addressCountry: "ID",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62 21 6194 381",
      contactType: "Customer Service",
      areaServed: "ID",
      availableLanguage: ["Indonesian", "English"],
    },
    sameAs: ["https://www.instagram.com/smpyakinku "],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
