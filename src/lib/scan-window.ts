export type ScanMode = "lateness" | "attribute";

export type ScanWindowPhase = "before" | "open" | "after";

export interface ScanWindowStatus {
  mode: ScanMode;
  isOpen: boolean;
  phase: ScanWindowPhase;
  currentTime: string;
  startTime: string;
  endTime: string;
  nextOpenLabel: string;
  minutesUntilOpen: number;
}

const WIB_TIMEZONE = "Asia/Jakarta";

const WINDOWS: Record<
  ScanMode,
  { startHour: number; startMinute: number; endHour: number; endMinute: number }
> = {
  lateness: {
    startHour: 6,
    startMinute: 31,
    endHour: 9,
    endMinute: 0,
  },
  attribute: {
    startHour: 6,
    startMinute: 31,
    endHour: 14,
    endMinute: 0,
  },
};

function getWibParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value || 0);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
  };
}

function formatClock(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function getScanWindowStatus(
  mode: ScanMode,
  now: Date = new Date(),
): ScanWindowStatus {
  const current = getWibParts(now);
  const window = WINDOWS[mode];
  const currentMinutes = current.hour * 60 + current.minute;
  const startMinutes = window.startHour * 60 + window.startMinute;
  const endMinutes = window.endHour * 60 + window.endMinute;
  const isOpen = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  const phase: ScanWindowPhase = isOpen
    ? "open"
    : currentMinutes < startMinutes
      ? "before"
      : "after";

  const minutesUntilOpen =
    phase === "before"
      ? startMinutes - currentMinutes
      : phase === "after"
        ? 24 * 60 - currentMinutes + startMinutes
        : 0;

  const nextOpenLabel =
    phase === "after"
      ? `Besok, ${formatClock(window.startHour, window.startMinute)} WIB`
      : phase === "before"
        ? `Hari ini, ${formatClock(window.startHour, window.startMinute)} WIB`
        : "Sedang berlangsung";

  return {
    mode,
    isOpen,
    phase,
    currentTime: formatClock(current.hour, current.minute),
    startTime: formatClock(window.startHour, window.startMinute),
    endTime: formatClock(window.endHour, window.endMinute),
    nextOpenLabel,
    minutesUntilOpen,
  };
}

export function getScanWindowError(status: ScanWindowStatus) {
  if (status.isOpen) return null;

  return status.phase === "after"
    ? `Waktu pencatatan sudah berakhir pada pukul ${status.endTime} WIB. Sekarang pukul ${status.currentTime} WIB.`
    : `Pencatatan belum dibuka. Silakan mulai pada pukul ${status.startTime} WIB (sekarang ${status.currentTime} WIB).`;
}
