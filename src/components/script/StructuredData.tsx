export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "School",
    name: "SMP IP Yakin Jakarta",
    description:
      "Sekolah Menengah Pertama dengan pendidikan berkualitas dan program pembelajaran inovatif.",
    url: "https://smpipyakin.sch.id",
    logo: "https://www.smpipyakin.sch.id/logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Bangun Nusa Raya No. 10",
      addressLocality: "Cengkareng Timur",
      addressRegion: "DKI Jakarta",
      postalCode: "11730",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-6.1554",
      longitude: "106.7364",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62 21 6194 381",
      contactType: "Customer Service",
      areaServed: "ID",
      availableLanguage: ["Indonesian", "English"],
    },
    sameAs: ["https://www.instagram.com/smpyakinku"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
