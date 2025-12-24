/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.smpipyakin.sch.id",
  generateRobotsTxt: true,
  generateIndexSitemap: false,

  // Change frequency and priority for different pages
  changefreq: "weekly",
  priority: 0.7,

  // Exclude dashboard and API routes from sitemap
  exclude: [
    "/dashboard-*",
    "/api/*",
    "/login",
    "/unauthorized",
    "/server-sitemap.xml",
  ],

  // Robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard-admin",
          "/dashboard-kesiswaan",
          "/dashboard-osis",
          "/dashboard-ppdb",
          "/dashboard-siswa",
          "/api",
          "/login",
          "/unauthorized",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
    ],
    additionalSitemaps: ["https://www.smpipyakin.sch.id/server-sitemap.xml"],
  },

  // Transform function to add priority to specific pages
  transform: async (config, path) => {
    // High priority pages
    const highPriorityPages = ["/", "/ppdb", "/news", "/announcements"];
    // Medium priority pages
    const mediumPriorityPages = [
      "/profile",
      "/facilities",
      "/extracurricular",
      "/academic-calendar",
      "/contact",
    ];

    let priority = config.priority;
    let changefreq = config.changefreq;

    if (highPriorityPages.includes(path)) {
      priority = 1.0;
      changefreq = "daily";
    } else if (mediumPriorityPages.includes(path)) {
      priority = 0.8;
      changefreq = "weekly";
    } else if (
      path.startsWith("/news/") ||
      path.startsWith("/announcements/")
    ) {
      priority = 0.6;
      changefreq = "monthly";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
