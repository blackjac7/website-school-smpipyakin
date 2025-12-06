import { format, parseISO, isValid } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { id } from "date-fns/locale";

const WIB_TIMEZONE = "Asia/Jakarta";

/**
 * Get current date in WIB timezone in YYYY-MM-DD format
 */
export function getTodayWIB(): string {
  const now = new Date();
  const wibTime = toZonedTime(now, WIB_TIMEZONE);
  return format(wibTime, "yyyy-MM-dd");
}

/**
 * Format date to Indonesian (WIB) format
 */
export function formatDateWIB(dateString: string): string {
  if (!dateString) return "";

  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;

    const wibTime = toZonedTime(date, WIB_TIMEZONE);
    return format(wibTime, "d MMMM yyyy", { locale: id });
  } catch {
    return dateString;
  }
}

/**
 * Format datetime to Indonesian (WIB) format with time
 */
export function formatDateTimeWIB(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return dateString;

  return (
    date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

/**
 * Format relative time (e.g., "2 hari yang lalu")
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Hari ini";
  } else if (diffInDays === 1) {
    return "Kemarin";
  } else if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} minggu yang lalu`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} bulan yang lalu`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} tahun yang lalu`;
  }
}
