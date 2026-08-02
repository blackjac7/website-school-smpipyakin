/**
 * Attribute Violation Point System
 * =================================
 * Business rule: every time a student's lifetime attribute-violation count
 * reaches a multiple of `threshold` (default 3), they accumulate
 * `pointsPerThreshold` (default 2) violation points. Points are always
 * derived from the total count of `AttributeViolation` rows for a student —
 * never stored/denormalized — so the calculation automatically stays correct
 * even if the threshold is changed later, and old (retroactive) violation
 * records are always included. Mirrors `src/lib/latenessPoints.ts`.
 */

import { getSettingTyped } from "@/lib/siteSettings";

export const DEFAULT_ATTRIBUTE_POINT_THRESHOLD = 3;
export const DEFAULT_ATTRIBUTE_POINTS_PER_THRESHOLD = 2;

export interface AttributePointConfig {
  threshold: number;
  pointsPerThreshold: number;
}

/**
 * Read the current attribute violation point configuration from site
 * settings, falling back to safe defaults if not configured or invalid.
 */
export async function getAttributePointConfig(): Promise<AttributePointConfig> {
  const rawThreshold = await getSettingTyped<number>(
    "attribute.pointThreshold",
  );
  const rawPointsPerThreshold = await getSettingTyped<number>(
    "attribute.pointsPerThreshold",
  );

  const threshold =
    rawThreshold && rawThreshold > 0
      ? rawThreshold
      : DEFAULT_ATTRIBUTE_POINT_THRESHOLD;
  const pointsPerThreshold =
    rawPointsPerThreshold && rawPointsPerThreshold >= 0
      ? rawPointsPerThreshold
      : DEFAULT_ATTRIBUTE_POINTS_PER_THRESHOLD;

  return { threshold, pointsPerThreshold };
}

/**
 * Calculate accumulated violation points from a total violation count.
 * e.g. threshold=3, pointsPerThreshold=2: 3x -> 2 poin, 6x -> 4 poin, ...
 */
export function calculateAttributePoints(
  violationCount: number,
  threshold: number,
  pointsPerThreshold: number,
): number {
  if (threshold <= 0 || violationCount <= 0) return 0;
  return Math.floor(violationCount / threshold) * pointsPerThreshold;
}
