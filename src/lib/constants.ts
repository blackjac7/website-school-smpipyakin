export const MAINTENANCE_EXCLUDED_ROUTES = [
  "/maintenance",
  "/api",
  "/login",
  "/dashboard-admin",
  "/_next",
  "/icons",
  "/favicon",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
];

export const PROTECTED_ROUTES: Record<string, string[]> = {
  "/dashboard-admin": ["admin"],
  "/dashboard-kesiswaan": ["kesiswaan"],
  "/dashboard-siswa": ["siswa"],
  "/dashboard-osis": ["osis"],
  "/dashboard-ppdb": ["ppdb_admin"],
  "/dashboard-pembina-osis": ["pembina_osis", "admin"],
};
