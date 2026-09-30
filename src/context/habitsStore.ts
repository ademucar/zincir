import type { IHabit } from '../interfaces/habit'
import { loadHabits, saveHabits, STORAGE_KEY } from '../utils/storage'
import { habitsReducer, type HabitsAction } from './habitsReducer'

export const SAVE_FAILED_MESSAGE =
  'Değişiklikler kaydedilemedi: tarayıcı depolaması dolu ya da erişilemiyor.'

export interface IHabitsSnapshot {
  habits: IHabit[]
  storageError: string | null
}

/**
 * LocalStorage ile senkron çalışan alışkanlık deposu.
 * React'e useSyncExternalStore ile bağlanır; React'ten bağımsız olduğu için tek başına test edilebilir.
 *
 * - dispatch: reducer'ı çalıştırır, sonucu hemen LocalStorage'a yazar, dinleyicileri haberdar eder
 * - Başka bir sekmede aynı veri değişirse ("storage" olayı) depo kendini günceller
 */
export function createHabitsStore() {
  const loaded = loadHabits()
  let snapshot: IHabitsSnapshot = { habits: loaded.habits, storageError: loaded.error }
  const listeners = new Set<() => void>()

  const setSnapshot = (next: IHabitsSnapshot) => {
    snapshot = next
    listeners.forEach((listener) => listener())
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      setSnapshot({ ...snapshot, habits: loadHabits().habits })
    }
  }

  return {
    getSnapshot: () => snapshot,

    subscribe(listener: () => void) {
      if (listeners.size === 0) window.addEventListener('storage', onStorage)
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) window.removeEventListener('storage', onStorage)
      }
    },

    dispatch(action: HabitsAction) {
      const habits = habitsReducer(snapshot.habits, action)
      if (habits === snapshot.habits) return
      const saved = saveHabits(habits)
      setSnapshot({ habits, storageError: saved ? snapshot.storageError : SAVE_FAILED_MESSAGE })
    },

    dismissStorageError() {
      if (snapshot.storageError !== null) setSnapshot({ ...snapshot, storageError: null })
    },
  }
}

export type HabitsStore = ReturnType<typeof createHabitsStore>
