/**
 * Site Settings Service
 * =====================
 * Centralized service for managing site-wide settings and feature flags
 */

import prisma from "@/lib/prisma";

// Default settings that will be seeded if not exists
export const DEFAULT_SETTINGS = {
  // Maintenance Mode
  "maintenance.enabled": {
    value: "false",
    type: "BOOLEAN" as const,
    category: "maintenance",
    description: "Enable/disable maintenance mode for the entire site",
    isPublic: false,
  },
  "maintenance.message": {
    value:
      "Website sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi.",
    type: "STRING" as const,
    category: "maintenance",
    description: "Message to display during maintenance",
    isPublic: true,
  },
  "maintenance.allowedIPs": {
    value: "[]",
    type: "JSON" as const,
    category: "maintenance",
    description: "IP addresses that can bypass maintenance mode",
    isPublic: false,
  },

  // PPDB Settings
  "ppdb.enabled": {
    value: "false",
    type: "BOOLEAN" as const,
    category: "ppdb",
    description: "Enable/disable PPDB registration",
    isPublic: true,
  },
  "ppdb.startDate": {
    value: "",
    type: "DATE" as const,
    category: "ppdb",
    description: "PPDB registration start date",
    isPublic: true,
  },
  "ppdb.endDate": {
    value: "",
    type: "DATE" as const,
    category: "ppdb",
    description: "PPDB registration end date",
    isPublic: true,
  },
  "ppdb.academicYear": {
    value: "2025/2026",
    type: "STRING" as const,
    category: "ppdb",
    description: "Academic year for PPDB",
    isPublic: true,
  },
  "ppdb.quota": {
    value: "100",
    type: "NUMBER" as const,
    category: "ppdb",
    description: "Maximum number of PPDB registrations",
    isPublic: true,
  },
  "ppdb.closedMessage": {
    value:
      "Pendaftaran PPDB belum dibuka. Silakan kembali pada periode pendaftaran.",
    type: "STRING" as const,
    category: "ppdb",
    description: "Message when PPDB is closed",
    isPublic: true,
  },

  // General Site Settings
  "site.name": {
    value: "SMP IP Yakin Jakarta",
    type: "STRING" as const,
    category: "general",
    description: "Site name",
    isPublic: true,
  },
  "site.description": {
    value: "Sekolah Menengah Pertama dengan pendidikan berkualitas",
    type: "STRING" as const,
    category: "general",
    description: "Site description",
    isPublic: true,
  },
  "site.contactEmail": {
    value: "info@smpipyakin.sch.id",
    type: "STRING" as const,
    category: "general",
    description: "Contact email",
    isPublic: true,
  },
  "site.contactPhone": {
    value: "(021) 5403540",
    type: "STRING" as const,
    category: "general",
    description: "Contact phone",
    isPublic: true,
  },

  // Feature Flags
  "feature.chatbot": {
    value: "true",
    type: "BOOLEAN" as const,
    category: "features",
    description: "Enable/disable AI chatbot",
    isPublic: false,
  },
  "feature.studentWorks": {
    value: "true",
    type: "BOOLEAN" as const,
    category: "features",
    description: "Enable/disable student works gallery",
    isPublic: false,
  },
  "feature.announcements": {
    value: "true",
    type: "BOOLEAN" as const,
    category: "features",
    description: "Enable/disable announcements section",
    isPublic: false,
  },
};

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

/**
 * Get a setting value by key
 */
export async function getSetting(key: SettingKey): Promise<string | null> {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key },
    });
    return setting?.value ?? DEFAULT_SETTINGS[key]?.value ?? null;
  } catch {
    return DEFAULT_SETTINGS[key]?.value ?? null;
  }
}

/**
 * Get a setting value parsed by type
 */
export async function getSettingTyped<T>(key: SettingKey): Promise<T | null> {
  const value = await getSetting(key);
  if (value === null) return null;

  const type = DEFAULT_SETTINGS[key]?.type ?? "STRING";

  switch (type) {
    case "BOOLEAN":
      return (value === "true") as T;
    case "NUMBER":
      return Number(value) as T;
    case "DATE":
      return (value ? new Date(value) : null) as T;
    case "JSON":
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    default:
      return value as T;
  }
}

/**
 * Get all settings by category
 */
export async function getSettingsByCategory(category: string) {
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { category },
      orderBy: { key: "asc" },
    });
    return settings;
  } catch {
    return [];
  }
}

/**
 * Get all public settings
 */
export async function getPublicSettings() {
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { isPublic: true },
      orderBy: { category: "asc" },
    });
    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>
    );
  } catch {
    return {};
  }
}

/**
 * Update a setting
 */
export async function updateSetting(key: string, value: string) {
  return prisma.siteSettings.upsert({
    where: { key },
    update: { value, updatedAt: new Date() },
    create: {
      key,
      value,
      type: DEFAULT_SETTINGS[key as SettingKey]?.type ?? "STRING",
      category: DEFAULT_SETTINGS[key as SettingKey]?.category ?? "general",
      description: DEFAULT_SETTINGS[key as SettingKey]?.description,
      isPublic: DEFAULT_SETTINGS[key as SettingKey]?.isPublic ?? false,
    },
  });
}

/**
 * Update multiple settings at once (atomic transaction)
 */
export async function updateSettings(settings: Record<string, string>) {
  const entries = Object.entries(settings);

  // Use transaction to ensure atomic updates
  return prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        update: { value, updatedAt: new Date() },
        create: {
          key,
          value,
          type: DEFAULT_SETTINGS[key as SettingKey]?.type ?? "STRING",
          category: DEFAULT_SETTINGS[key as SettingKey]?.category ?? "general",
          description: DEFAULT_SETTINGS[key as SettingKey]?.description,
          isPublic: DEFAULT_SETTINGS[key as SettingKey]?.isPublic ?? false,
        },
      })
    )
  );
}

/**
 * Check if maintenance mode is active
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const enabled = await getSettingTyped<boolean>("maintenance.enabled");
  if (!enabled) return false;

  // Also check scheduled maintenance
  const now = new Date();
  const scheduledMaintenance = await prisma.maintenanceSchedule.findFirst({
    where: {
      isActive: true,
      startTime: { lte: now },
      endTime: { gte: now },
    },
  });

  return enabled || !!scheduledMaintenance;
}

/**
 * Check if PPDB is open
 */
export async function isPPDBOpen(): Promise<{
  isOpen: boolean;
  message: string;
  startDate: Date | null;
  endDate: Date | null;
  academicYear: string;
}> {
  const enabled = await getSettingTyped<boolean>("ppdb.enabled");
  const startDateStr = await getSetting("ppdb.startDate");
  const endDateStr = await getSetting("ppdb.endDate");
  const closedMessage = await getSetting("ppdb.closedMessage");
  const academicYear = await getSetting("ppdb.academicYear");

  const now = new Date();

  // Normalize start date to beginning of day
  const startDate = startDateStr ? new Date(startDateStr) : null;
  if (startDate) startDate.setHours(0, 0, 0, 0);

  // Normalize end date to end of day
  const endDate = endDateStr ? new Date(endDateStr) : null;
  if (endDate) endDate.setHours(23, 59, 59, 999);

  // Check if enabled
  if (!enabled) {
    return {
      isOpen: false,
      message: closedMessage || "Pendaftaran PPDB belum dibuka.",
      startDate,
      endDate,
      academicYear: academicYear || "2025/2026",
    };
  }

  // Check date range if specified
  if (startDate && now < startDate) {
    return {
      isOpen: false,
      message: `Pendaftaran PPDB akan dibuka pada ${startDate.toLocaleDateString(
        "id-ID",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )}.`,
      startDate,
      endDate,
      academicYear: academicYear || "2025/2026",
    };
  }

  if (endDate && now > endDate) {
    return {
      isOpen: false,
      message: "Periode pendaftaran PPDB telah berakhir.",
      startDate,
      endDate,
      academicYear: academicYear || "2025/2026",
    };
  }

  return {
    isOpen: true,
    message: "Pendaftaran PPDB sedang dibuka.",
    startDate,
    endDate,
    academicYear: academicYear || "2025/2026",
  };
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(
  feature: "chatbot" | "studentWorks" | "announcements"
): Promise<boolean> {
  const key = `feature.${feature}` as SettingKey;
  return (await getSettingTyped<boolean>(key)) ?? true;
}

/**
 * Seed default settings
 */
export async function seedDefaultSettings() {
  const entries = Object.entries(DEFAULT_SETTINGS);

  for (const [key, config] of entries) {
    await prisma.siteSettings.upsert({
      where: { key },
      update: {},
      create: {
        key,
        value: config.value,
        type: config.type,
        category: config.category,
        description: config.description,
        isPublic: config.isPublic,
      },
    });
  }

}
