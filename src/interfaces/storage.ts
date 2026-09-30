import type { IHabit } from './habit'

/** LocalStorage'daki veri zarfı; version ileride veri yapısı değişirse dönüştürme için */
export interface IStorageData {
  version: 1
  habits: IHabit[]
}

/** Okuma sonucu: veri bozuksa uygulama çökmez, kullanıcıya bilgi verilir */
export interface ILoadResult {
  habits: IHabit[]
  error: string | null
}
