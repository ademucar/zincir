import type { DateKey } from './habit'

/** Takvimde / zincirde tek bir günün durumu */
export interface IDayStatus {
  date: DateKey
  done: boolean
}

/** Bir alışkanlık için hesaplanan değerler (saklanmaz, her seferinde üretilir) */
export interface IHabitStats {
  doneToday: boolean
  /** Bugünden (bugün yapılmadıysa dünden) geriye kesintisiz gün sayısı */
  currentStreak: number
  longestStreak: number
  /** Son 7 gün, eskiden yeniye */
  last7Days: IDayStatus[]
  /** Son 30 gündeki tamamlanma yüzdesi (alışkanlık daha yeniyse oluşturulduğu günden itibaren) */
  rate30: number
  totalCompletions: number
}
