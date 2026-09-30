import type { DateKey, IHabit, IHabitFormData } from '../interfaces/habit'
import { addDays, parseDateKey } from '../utils/date'
import { createId } from '../utils/id'

interface SampleHabit extends IHabitFormData {
  /** Kaç gün önce oluşturuldu */
  createdDaysAgo: number
  /** `daysAgo` gün önce yapıldı mı? (0 = bugün) */
  isDone: (daysAgo: number) => boolean
}

// Farklı durumları göstermek için seçilmiş desenler: uzun seri, bugün henüz yapılmamış,
// haftada birkaç gün, kırılmış zincir ve yeni başlanmış alışkanlık.
const SAMPLES: SampleHabit[] = [
  {
    name: 'Günde 2 litre su iç',
    description: 'Masada her zaman dolu bir şişe olsun.',
    icon: '💧',
    color: 'sky',
    category: 'saglik',
    createdDaysAgo: 60,
    isDone: (d) => d <= 23 || d % 4 !== 0,
  },
  {
    name: '20 sayfa kitap oku',
    description: 'Yatmadan önce, telefonsuz.',
    icon: '📚',
    color: 'violet',
    category: 'egitim',
    createdDaysAgo: 75,
    isDone: (d) => d >= 1 && d % 6 !== 0,
  },
  {
    name: '30 dakika yürüyüş',
    description: 'Haftada en az 4 gün.',
    icon: '🚶',
    color: 'emerald',
    category: 'spor',
    createdDaysAgo: 80,
    isDone: (d) => [0, 2, 3, 5].includes(d % 7),
  },
  {
    name: '10 dakika meditasyon',
    description: 'Sabah kahveden önce.',
    icon: '🧘',
    color: 'amber',
    category: 'kisisel',
    createdDaysAgo: 40,
    isDone: (d) => d >= 5 && d <= 16,
  },
  {
    name: 'Günlük kod pratiği',
    description: 'En az bir küçük problem çöz.',
    icon: '💻',
    color: 'slate',
    category: 'is',
    createdDaysAgo: 50,
    isDone: (d) => d <= 8 || (d > 10 && d % 3 !== 0),
  },
  {
    name: 'İngilizce kelime çalış',
    description: 'Her gün 10 yeni kelime.',
    icon: '🔤',
    color: 'rose',
    category: 'egitim',
    createdDaysAgo: 3,
    isDone: (d) => d === 1 || d === 3,
  },
]

/** Bugüne göre tarihlenmiş örnek alışkanlıklar üretir */
export function createSampleHabits(today: DateKey): IHabit[] {
  return SAMPLES.map(({ createdDaysAgo, isDone, ...form }) => {
    const completions: DateKey[] = []
    for (let daysAgo = createdDaysAgo; daysAgo >= 0; daysAgo--) {
      if (isDone(daysAgo)) completions.push(addDays(today, -daysAgo))
    }
    const created = parseDateKey(addDays(today, -createdDaysAgo))
    created.setHours(9, 0, 0, 0)
    const createdAt = created.toISOString()
    return { ...form, id: createId(), completions, createdAt, updatedAt: createdAt }
  })
}
