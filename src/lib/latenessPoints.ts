/**
 * Lateness Point System
 * =====================
 * Business rule: every time a student's lifetime lateness count reaches a
 * multiple of `threshold` (default 3), they accumulate `pointsPerThreshold`
 * (default 2) violation points. Points are always derived from the total
 * count of `LatenessRecord` rows for a student — never stored/denormalized —
 * so the calculation automatically stays correct even if the threshold is
 * changed later, and old (retroactive) lateness records are always included.
 */

import { getSettingTyped } from "@/lib/siteSettings";

export const DEFAULT_LATENESS_POINT_THRESHOLD = 3;
export const DEFAULT_LATENESS_POINTS_PER_THRESHOLD = 2;

export interface LatenessPointConfig {
  threshold: number;
  pointsPerThreshold: number;
}

/**
 * Read the current lateness point configuration from site settings,
 * falling back to safe defaults if not configured or invalid.
 */
export async function getLatenessPointConfig(): Promise<LatenessPointConfig> {
  const rawThreshold = await getSettingTyped<number>("lateness.pointThreshold");
  const rawPointsPerThreshold = await getSettingTyped<number>(
    "lateness.pointsPerThreshold",
  );

  const threshold =
    rawThreshold && rawThreshold > 0
      ? rawThreshold
      : DEFAULT_LATENESS_POINT_THRESHOLD;
  const pointsPerThreshold =
    rawPointsPerThreshold && rawPointsPerThreshold >= 0
      ? rawPointsPerThreshold
      : DEFAULT_LATENESS_POINTS_PER_THRESHOLD;

  return { threshold, pointsPerThreshold };
}

/**
 * Calculate accumulated violation points from a total lateness count.
 * e.g. threshold=3, pointsPerThreshold=2: 3x late -> 2 poin, 6x -> 4 poin, ...
 */
export function calculateLatenessPoints(
  lateCount: number,
  threshold: number,
  pointsPerThreshold: number,
): number {
  if (threshold <= 0 || lateCount <= 0) return 0;
  return Math.floor(lateCount / threshold) * pointsPerThreshold;
}
