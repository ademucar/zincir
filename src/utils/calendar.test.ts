import { describe, expect, it } from 'vitest'
import { buildCalendarWeeks, startOfWeek } from './calendar'

describe('startOfWeek', () => {
  it('haftanın pazartesisini verir', () => {
    expect(startOfWeek('2026-09-30')).toBe('2026-09-28') // Çarşamba → Pazartesi
    expect(startOfWeek('2026-09-28')).toBe('2026-09-28') // Pazartesi → kendisi
    expect(startOfWeek('2026-10-04')).toBe('2026-09-28') // Pazar → önceki Pazartesi
  })
})

describe('buildCalendarWeeks', () => {
  const weeks = buildCalendarWeeks('2026-09-30', 12)

  it('12 hafta × 7 gün üretir, ilk hafta pazartesi başlar', () => {
    expect(weeks).toHaveLength(12)
    weeks.forEach((week) => expect(week.days).toHaveLength(7))
    expect(weeks[0].days[0]).toBe('2026-07-13')
  })

  it('bugünden sonraki günler boş (null)', () => {
    expect(weeks[11].days).toEqual(['2026-09-28', '2026-09-29', '2026-09-30', null, null, null, null])
  })

  it('günler kesintisiz ve tekrarsız', () => {
    const days = weeks.flatMap((w) => w.days).filter((d): d is string => d !== null)
    expect(new Set(days).size).toBe(days.length)
    expect(days.at(-1)).toBe('2026-09-30')
    expect(days).toHaveLength(7 * 11 + 3)
  })

  it('ay etiketleri yalnızca ay değişen haftalarda, gelecekteki ay gösterilmez', () => {
    // 28 Eyl – 4 Eki haftasında görünen günler eylüle ait; "Eki" yazmamalı
    expect(weeks.map((w) => w.monthLabel)).toEqual([
      'Tem', null, null, 'Ağu', null, null, null, null, 'Eyl', null, null, null,
    ])
  })
})
