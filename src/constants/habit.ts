import type { HabitCategory, HabitColor, IHabitFormData } from '../interfaces/habit'

export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 40
export const DESCRIPTION_MAX_LENGTH = 150

export const HABIT_ICONS = [
  '💧', '📚', '🏃', '🧘', '💪', '🥗', '😴', '✍️',
  '🎯', '🧠', '🎸', '🌱', '💻', '🔤', '🚶', '🧹',
] as const

/** Ekran okuyucular için simge adları */
export const HABIT_ICON_LABELS: Record<(typeof HABIT_ICONS)[number], string> = {
  '💧': 'Su damlası',
  '📚': 'Kitaplar',
  '🏃': 'Koşu',
  '🧘': 'Meditasyon',
  '💪': 'Kas',
  '🥗': 'Salata',
  '😴': 'Uyku',
  '✍️': 'Yazı yazma',
  '🎯': 'Hedef',
  '🧠': 'Beyin',
  '🎸': 'Gitar',
  '🌱': 'Filiz',
  '💻': 'Bilgisayar',
  '🔤': 'Dil öğrenme',
  '🚶': 'Yürüyüş',
  '🧹': 'Temizlik',
}

export const HABIT_CATEGORIES: Record<HabitCategory, string> = {
  saglik: 'Sağlık',
  spor: 'Spor',
  egitim: 'Eğitim',
  kisisel: 'Kişisel',
  is: 'İş',
}

interface ColorClasses {
  label: string
  /** Renk seçici ve takvimdeki dolu gün */
  solid: string
  /** Kartın simge zemini */
  soft: string
  /** Vurgulu metin */
  text: string
  /** Tamamlandı butonu (beyaz yazı ile kontrast ≥ 4.5:1 olan ton) */
  button: string
  /** Seçili renk halkası */
  ring: string
}

// Tailwind sınıfları derleme sırasında koddan tarandığı için tam metin olarak yazılır
// (ör. `bg-${color}-500` şeklinde dinamik üretilen sınıflar CSS'e eklenmez).
export const HABIT_COLORS: Record<HabitColor, ColorClasses> = {
  emerald: {
    label: 'Zümrüt',
    solid: 'bg-emerald-500',
    soft: 'bg-emerald-100 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    button: 'bg-emerald-700 hover:bg-emerald-800 border-emerald-700',
    ring: 'ring-emerald-500',
  },
  sky: {
    label: 'Gök',
    solid: 'bg-sky-500',
    soft: 'bg-sky-100 dark:bg-sky-500/15',
    text: 'text-sky-700 dark:text-sky-300',
    button: 'bg-sky-700 hover:bg-sky-800 border-sky-700',
    ring: 'ring-sky-500',
  },
  violet: {
    label: 'Mor',
    solid: 'bg-violet-500',
    soft: 'bg-violet-100 dark:bg-violet-500/15',
    text: 'text-violet-700 dark:text-violet-300',
    button: 'bg-violet-600 hover:bg-violet-700 border-violet-600',
    ring: 'ring-violet-500',
  },
  amber: {
    label: 'Kehribar',
    solid: 'bg-amber-500',
    soft: 'bg-amber-100 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    button: 'bg-amber-700 hover:bg-amber-800 border-amber-700',
    ring: 'ring-amber-500',
  },
  rose: {
    label: 'Gül',
    solid: 'bg-rose-500',
    soft: 'bg-rose-100 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    button: 'bg-rose-600 hover:bg-rose-700 border-rose-600',
    ring: 'ring-rose-500',
  },
  slate: {
    label: 'Arduvaz',
    solid: 'bg-slate-500',
    soft: 'bg-slate-200 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-300',
    button: 'bg-slate-600 hover:bg-slate-700 border-slate-600',
    ring: 'ring-slate-500',
  },
}

export const HABIT_COLOR_KEYS = Object.keys(HABIT_COLORS) as HabitColor[]
export const HABIT_CATEGORY_KEYS = Object.keys(HABIT_CATEGORIES) as HabitCategory[]

export const EMPTY_HABIT_FORM: IHabitFormData = {
  name: '',
  description: '',
  icon: HABIT_ICONS[0],
  color: 'emerald',
  category: 'saglik',
}
