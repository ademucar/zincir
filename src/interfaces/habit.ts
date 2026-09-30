/** Alışkanlık kartının rengi (Tailwind renk paletinden) */
export type HabitColor = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'slate'

/** Filtreleme için alışkanlık kategorisi */
export type HabitCategory = 'saglik' | 'spor' | 'egitim' | 'kisisel' | 'is'

/** Yerel saate göre gün anahtarı: "YYYY-MM-DD" */
export type DateKey = string

/** LocalStorage'da saklanan alışkanlık kaydı */
export interface IHabit {
  id: string
  name: string
  description: string
  icon: string
  color: HabitColor
  category: HabitCategory
  /** Alışkanlığın yapıldığı günler (artan sırada, tekrarsız) */
  completions: DateKey[]
  createdAt: string
  updatedAt: string
}

/** Ekle / düzenle formunun alanları */
export interface IHabitFormData {
  name: string
  description: string
  icon: string
  color: HabitColor
  category: HabitCategory
}

/** Form doğrulama hataları: alan adı → mesaj */
export type HabitFormErrors = Partial<Record<keyof IHabitFormData, string>>
