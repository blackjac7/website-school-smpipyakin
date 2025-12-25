import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.smpipyakin.sch.id';

  // Static routes
  const routes = [
    '',
    '/academic-calendar',
    '/announcements',
    '/contact',
    '/extracurricular',
    '/facilities',
    '/karya-siswa',
    '/login',
    '/news',
    '/ppdb',
    '/ppdb/status',
    '/profile/guru',
    '/profile/sambutan',
    '/profile/sejarah',
    '/profile/struktur',
    '/profile/visi-misi',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return routes;
}
