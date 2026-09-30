import { HABIT_CATEGORY_KEYS, HABIT_COLOR_KEYS } from '../constants/habit'
import type { IHabit } from '../interfaces/habit'
import type { ILoadResult, IStorageData } from '../interfaces/storage'
import { isValidDateKey } from './date'

export const STORAGE_KEY = 'zincir.habits.v1'
/** Okunamayan veri silinmeden önce buraya kopyalanır */
export const BACKUP_KEY = 'zincir.habits.backup'

/** LocalStorage'dan gelen bir değerin geçerli bir alışkanlık olup olmadığını denetler */
export function isValidHabit(value: unknown): value is IHabit {
  if (typeof value !== 'object' || value === null) return false
  const h = value as Record<string, unknown>
  return (
    typeof h.id === 'string' &&
    typeof h.name === 'string' &&
    typeof h.description === 'string' &&
    typeof h.icon === 'string' &&
    HABIT_COLOR_KEYS.includes(h.color as IHabit['color']) &&
    HABIT_CATEGORY_KEYS.includes(h.category as IHabit['category']) &&
    Array.isArray(h.completions) &&
    h.completions.every(isValidDateKey) &&
    typeof h.createdAt === 'string' &&
    typeof h.updatedAt === 'string'
  )
}

/**
 * Alışkanlıkları okur. Uygulama hiçbir durumda çökmez:
 * - Kayıt yoksa boş liste döner.
 * - Veri bozuksa ham hâli yedek anahtara kopyalanır ve kullanıcıya bilgi verilir.
 * - Tek tek bozuk kayıtlar atlanır, sağlam olanlar yüklenir.
 */
export function loadHabits(): ILoadResult {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { habits: [], error: 'Tarayıcı depolamasına erişilemiyor; değişiklikler kaydedilmeyecek.' }
  }
  if (raw === null) return { habits: [], error: null }

  try {
    const data = JSON.parse(raw) as Partial<IStorageData>
    if (!Array.isArray(data.habits)) throw new Error('Geçersiz veri yapısı')

    const habits = data.habits.filter(isValidHabit)
    const skipped = data.habits.length - habits.length
    if (skipped > 0) backupRawData(raw)

    return {
      habits,
      error: skipped > 0 ? `${skipped} kayıt okunamadı ve atlandı (yedeklendi).` : null,
    }
  } catch {
    backupRawData(raw)
    return { habits: [], error: 'Kayıtlı veriler okunamadı; eski veri yedeklenerek sıfırdan başlandı.' }
  }
}

/** Alışkanlıkları kaydeder; başarısız olursa (kota dolu, gizli mod) false döner */
export function saveHabits(habits: readonly IHabit[]): boolean {
  const data: IStorageData = { version: 1, habits: [...habits] }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

function backupRawData(raw: string) {
  try {
    localStorage.setItem(BACKUP_KEY, raw)
  } catch {
    // Yedek de yazılamıyorsa yapılacak başka bir şey yok
  }
}
