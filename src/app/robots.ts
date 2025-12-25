import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard-admin/', '/dashboard-siswa/', '/dashboard-ppdb/', '/dashboard-osis/', '/dashboard-kesiswaan/', '/api/'],
    },
    sitemap: 'https://www.smpipyakin.sch.id/sitemap.xml',
  };
}
