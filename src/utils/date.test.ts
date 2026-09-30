import { describe, expect, it } from 'vitest'
import { addDays, diffInDays, isValidDateKey, lastNDays, parseDateKey, toDateKey } from './date'

describe('toDateKey', () => {
  it('yerel saate göre gün anahtarı üretir (UTC değil)', () => {
    // Gece 01:30 — toISOString() kullanılsaydı UTC+3'te bir önceki güne düşerdi
    expect(toDateKey(new Date(2026, 9, 12, 1, 30))).toBe('2026-10-12')
    expect(toDateKey(new Date(2026, 9, 12, 23, 59))).toBe('2026-10-12')
  })

  it('ay ve günü iki haneli yazar', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('parseDateKey', () => {
  it('anahtarı yerel gece yarısına çevirir ve geri dönüşümü bozmaz', () => {
    const date = parseDateKey('2026-10-12')
    expect(date.getHours()).toBe(0)
    expect(toDateKey(date)).toBe('2026-10-12')
  })
})

describe('isValidDateKey', () => {
  it('geçerli tarihleri kabul eder', () => {
    expect(isValidDateKey('2026-10-12')).toBe(true)
    expect(isValidDateKey('2028-02-29')).toBe(true) // artık yıl
  })

  it('geçersiz tarih ve biçimleri reddeder', () => {
    expect(isValidDateKey('2026-02-30')).toBe(false)
    expect(isValidDateKey('2027-02-29')).toBe(false)
    expect(isValidDateKey('2026-1-5')).toBe(false)
    expect(isValidDateKey('12.10.2026')).toBe(false)
    expect(isValidDateKey(20261012)).toBe(false)
  })
})

describe('addDays', () => {
  it('ay ve yıl geçişlerini doğru yapar', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29')
  })
})

describe('diffInDays', () => {
  it('iki gün arasındaki farkı verir', () => {
    expect(diffInDays('2026-10-01', '2026-10-12')).toBe(11)
    expect(diffInDays('2026-10-12', '2026-10-01')).toBe(-11)
    expect(diffInDays('2026-12-31', '2027-01-01')).toBe(1)
  })
})

describe('lastNDays', () => {
  it('bitiş günü dahil son n günü eskiden yeniye verir', () => {
    expect(lastNDays(3, '2026-11-01')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01'])
  })
})
