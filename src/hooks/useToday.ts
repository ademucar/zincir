import { useEffect, useState } from 'react'
import type { DateKey } from '../interfaces/habit'
import { todayKey } from '../utils/date'

/** Bir sonraki yerel gece yarısına kalan süre (ms) */
function msUntilMidnight(now = new Date()): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return midnight.getTime() - now.getTime()
}

/**
 * Bugünün gün anahtarı. Uygulama açıkken gün değişirse kendiliğinden güncellenir;
 * bilgisayar uykudan uyandığında ya da sekmeye geri dönüldüğünde de yeniden kontrol edilir.
 */
export function useToday(): DateKey {
  const [today, setToday] = useState<DateKey>(() => todayKey())

  useEffect(() => {
    // Aynı gün değeri yeniden render'a yol açmaz (React eşit state'i atlar)
    const refresh = () => setToday(todayKey())

    // Zamanlayıcı her tetiklendiğinde kendini yeniden kurar; saat kayması ya da uyku
    // nedeniyle erken çalışsa bile bir sonraki gece yarısı kaçırılmaz.
    let timer: number
    const scheduleMidnight = () => {
      timer = window.setTimeout(() => {
        refresh()
        scheduleMidnight()
      }, msUntilMidnight() + 1000)
    }
    scheduleMidnight()

    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return today
}
