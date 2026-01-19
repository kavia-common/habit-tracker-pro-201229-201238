import {
  addDays,
  format,
  parseISO,
  startOfDay,
  subDays,
  isValid,
} from "date-fns";

/**
 * Convert a Date to YYYY-MM-DD using local time.
 */
const formatLocalDayKey = (date) => format(date, "yyyy-MM-dd");

// PUBLIC_INTERFACE
export function getTodayKey() {
  /** Get today's local day key (YYYY-MM-DD). */
  return formatLocalDayKey(new Date());
}

// PUBLIC_INTERFACE
export function toDayKey(date) {
  /** Convert a Date to a local day key (YYYY-MM-DD). */
  return formatLocalDayKey(date);
}

// PUBLIC_INTERFACE
export function parseDayKey(dayKey) {
  /** Parse a YYYY-MM-DD string into a Date (local). */
  const d = parseISO(dayKey);
  if (!isValid(d)) return null;
  return startOfDay(d);
}

// PUBLIC_INTERFACE
export function getDayKeysInRange({ startKey, endKey }) {
  /** Generate inclusive list of day keys (YYYY-MM-DD) between startKey and endKey. */
  const start = parseDayKey(startKey);
  const end = parseDayKey(endKey);
  if (!start || !end) return [];

  const keys = [];
  let cur = start;
  while (cur.getTime() <= end.getTime()) {
    keys.push(formatLocalDayKey(cur));
    cur = addDays(cur, 1);
  }
  return keys;
}

// PUBLIC_INTERFACE
export function getLastNDaysKeys(n, endKey = getTodayKey()) {
  /** Generate last N days ending at endKey inclusive. */
  const end = parseDayKey(endKey);
  if (!end || n <= 0) return [];
  const start = subDays(end, n - 1);
  return getDayKeysInRange({ startKey: formatLocalDayKey(start), endKey });
}
