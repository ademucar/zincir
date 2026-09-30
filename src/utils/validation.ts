import {
  DESCRIPTION_MAX_LENGTH,
  HABIT_CATEGORY_KEYS,
  HABIT_COLOR_KEYS,
  HABIT_ICONS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from '../constants/habit'
import type { HabitFormErrors, IHabit, IHabitFormData } from '../interfaces/habit'

const normalize = (value: string) => value.trim().toLocaleLowerCase('tr')

/**
 * Ekle / düzenle formunu doğrular. Hata yoksa boş nesne döner.
 * @param editingId Düzenlenen alışkanlığın id'si; ad benzersizliği kontrolünde kendisi hariç tutulur.
 */
export function validateHabitForm(
  data: IHabitFormData,
  existing: readonly IHabit[],
  editingId?: string,
): HabitFormErrors {
  const errors: HabitFormErrors = {}
  const name = data.name.trim()

  if (name.length === 0) {
    errors.name = 'Alışkanlığa bir ad ver.'
  } else if (name.length < NAME_MIN_LENGTH) {
    errors.name = `Ad en az ${NAME_MIN_LENGTH} karakter olmalı.`
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Ad en fazla ${NAME_MAX_LENGTH} karakter olabilir.`
  } else if (existing.some((h) => h.id !== editingId && normalize(h.name) === normalize(name))) {
    errors.name = 'Bu adda bir alışkanlığın zaten var.'
  }

  if (data.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Açıklama en fazla ${DESCRIPTION_MAX_LENGTH} karakter olabilir.`
  }

  if (!(HABIT_ICONS as readonly string[]).includes(data.icon)) {
    errors.icon = 'Listeden bir simge seç.'
  }
  if (!HABIT_COLOR_KEYS.includes(data.color)) {
    errors.color = 'Listeden bir renk seç.'
  }
  if (!HABIT_CATEGORY_KEYS.includes(data.category)) {
    errors.category = 'Listeden bir kategori seç.'
  }

  return errors
}

export const hasErrors = (errors: HabitFormErrors) => Object.keys(errors).length > 0
