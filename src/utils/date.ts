import type { DateKey } from '../interfaces/habit'

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * Tarihi YEREL saate göre "YYYY-MM-DD" anahtarına çevirir.
 * toISOString() kullanılmaz: UTC'ye çevirdiği için Türkiye'de gece 00:00–03:00
 * arasında işaretlenen alışkanlık bir önceki güne yazılırdı.
 */
export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now)
}

/** "YYYY-MM-DD" → o günün yerel gece yarısı */
export function parseDateKey(key: DateKey): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isValidDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return toDateKey(parseDateKey(value)) === value // 2026-02-30 gibi geçersiz günleri eler
}

/** Güne gün ekler/çıkarır. Date(y, m, d + n) ay/yıl geçişlerini kendisi düzeltir. */
export function addDays(key: DateKey, days: number): DateKey {
  const date = parseDateKey(key)
  return toDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days))
}

/** İki gün arasındaki fark (b - a), gün cinsinden */
export function diffInDays(a: DateKey, b: DateKey): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((parseDateKey(b).getTime() - parseDateKey(a).getTime()) / msPerDay)
}

/** Bitiş günü dahil son n gün, eskiden yeniye */
export function lastNDays(n: number, end: DateKey): DateKey[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)))
}

const dayMonthFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' })
const longFormatter = new Intl.DateTimeFormat('tr-TR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const shortWeekdayFormatter = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' })

/** "12 Ekim" */
export const formatDayMonth = (key: DateKey) => dayMonthFormatter.format(parseDateKey(key))

/** "Pazartesi, 12 Ekim" */
export const formatLongDate = (key: DateKey) => longFormatter.format(parseDateKey(key))

/** "Pzt" */
export const formatShortWeekday = (key: DateKey) => shortWeekdayFormatter.format(parseDateKey(key))
