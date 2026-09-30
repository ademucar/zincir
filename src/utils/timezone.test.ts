import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { addDays, diffInDays, lastNDays, toDateKey } from './date'
import { getCurrentStreak, getHabitStats } from './streak'

/**
 * Tarih hesaplarının kullanıcının saat diliminden bağımsız olduğunu doğrular.
 * TZ, Node içinden değiştirilir (kabuktan verilen TZ her ortamda dikkate alınmaz).
 * Her grupta önce saat diliminin gerçekten değiştiği kontrol edilir; aksi hâlde test
 * yanlışlıkla tek bir saat diliminde çalışıp geçmiş görünürdü.
 */
const ZONES = [
  { tz: 'Europe/Istanbul', offset: -180 }, // UTC+3
  { tz: 'Pacific/Kiritimati', offset: -840 }, // UTC+14
  { tz: 'America/Los_Angeles', offset: 420 }, // UTC-7 (yaz saati)
  { tz: 'UTC', offset: 0 },
]

const originalTZ = process.env.TZ

describe.each(ZONES)('saat dilimi: $tz', ({ tz, offset }) => {
  beforeAll(() => {
    process.env.TZ = tz
  })
  afterAll(() => {
    process.env.TZ = originalTZ
  })

  it('saat dilimi gerçekten değişti', () => {
    expect(new Date(2026, 9, 12, 12, 0).getTimezoneOffset()).toBe(offset)
  })

  it('gece yarısından hemen sonra ve hemen önce aynı gün', () => {
    expect(toDateKey(new Date(2026, 9, 12, 0, 5))).toBe('2026-10-12')
    expect(toDateKey(new Date(2026, 9, 12, 23, 55))).toBe('2026-10-12')
  })

  it('yaz saati geçişinde gün atlamaz ve tekrar etmez', () => {
    // ABD'de yaz saati 1 Kasım 2026'da biter (o gün 25 saat sürer)
    expect(lastNDays(4, '2026-11-02')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'])
    expect(addDays('2026-11-01', 1)).toBe('2026-11-02')
    expect(diffInDays('2026-10-31', '2026-11-02')).toBe(2)
    expect(getCurrentStreak(['2026-10-31', '2026-11-01', '2026-11-02'], '2026-11-02')).toBe(3)
  })

  it('istatistikler saat dilimine göre değişmez', () => {
    const stats = getHabitStats(
      {
        id: '1',
        name: 'Test',
        description: '',
        icon: '💧',
        color: 'sky',
        category: 'saglik',
        completions: ['2026-10-10', '2026-10-11', '2026-10-12'],
        createdAt: new Date(2026, 9, 10, 9, 0).toISOString(),
        updatedAt: new Date(2026, 9, 12, 9, 0).toISOString(),
      },
      '2026-10-12',
    )
    expect(stats.currentStreak).toBe(3)
    expect(stats.rate30).toBe(100)
  })
})
