// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToday } from './useToday'

describe('useToday', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('uygulama açıkken gece yarısı geçince yeni güne geçer', () => {
    vi.setSystemTime(new Date(2026, 9, 12, 23, 59, 30))
    const { result } = renderHook(() => useToday())
    expect(result.current).toBe('2026-10-12')

    act(() => vi.advanceTimersByTime(60_000)) // 00:00:30
    expect(result.current).toBe('2026-10-13')
  })

  it('ertesi gece yarısını da kaçırmaz (zamanlayıcı kendini yeniden kurar)', () => {
    vi.setSystemTime(new Date(2026, 9, 12, 23, 59, 30))
    const { result } = renderHook(() => useToday())

    act(() => vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 60_000))
    expect(result.current).toBe('2026-10-14')
  })

  it('sekmeye geri dönüldüğünde günü yeniden kontrol eder (bilgisayar uykudan uyanınca)', () => {
    vi.setSystemTime(new Date(2026, 9, 12, 22, 0))
    const { result } = renderHook(() => useToday())

    // Zamanlayıcı çalışmadan saat ilerledi (ör. uyku modu)
    vi.setSystemTime(new Date(2026, 9, 13, 8, 0))
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(result.current).toBe('2026-10-13')
  })
})
