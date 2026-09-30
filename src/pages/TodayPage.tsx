import { Link2, Plus, Search, SearchX, Sparkles } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { EmptyState } from '../components/EmptyState'
import { HabitCard } from '../components/HabitCard'
import { ProgressRing } from '../components/ProgressRing'
import { HABIT_CATEGORIES, HABIT_CATEGORY_KEYS } from '../constants/habit'
import { useHabitDialogs } from '../hooks/useHabitDialogs'
import { useHabits } from '../hooks/useHabits'
import { useToast } from '../hooks/useToast'
import type { HabitCategory, IHabit } from '../interfaces/habit'
import { formatLongDate } from '../utils/date'
import { getHabitStats } from '../utils/streak'
import { normalizeText } from '../utils/text'

function progressMessage(done: number, total: number): string {
  if (total === 0) return ''
  if (done === total) return 'Bugünkü tüm halkalar tamam. Harika iş! 🎉'
  if (done === 0) return 'Güne ilk halkayla başla.'
  if (done / total >= 0.5) return `Yarıdan fazlası tamam, ${total - done} tane kaldı.`
  return `${done} halka takıldı, devam!`
}

const isCategory = (value: string | null): value is HabitCategory =>
  value !== null && (HABIT_CATEGORY_KEYS as string[]).includes(value)

export function TodayPage() {
  const { habits, today, toggleToday, loadSampleHabits } = useHabits()
  const { showToast } = useToast()
  const { openAdd, openEdit, openDelete, dialogs } = useHabitDialogs()
  const [searchParams, setSearchParams] = useSearchParams()

  // Filtreler adres çubuğunda: geri tuşu çalışır, görünüm paylaşılabilir
  const categoryParam = searchParams.get('kategori')
  const category = isCategory(categoryParam) ? categoryParam : null
  const query = searchParams.get('ara') ?? ''

  const setFilter = (key: 'kategori' | 'ara', value: string | null) => {
    setSearchParams(
      (params) => {
        if (value) params.set(key, value)
        else params.delete(key)
        return params
      },
      { replace: key === 'ara' }, // her tuş vuruşu geçmişe eklenmesin
    )
  }

  const statsById = useMemo(
    () => new Map(habits.map((habit) => [habit.id, getHabitStats(habit, today)])),
    [habits, today],
  )

  const doneCount = habits.filter((habit) => statsById.get(habit.id)?.doneToday).length

  const categoryCounts = useMemo(() => {
    const counts = new Map<HabitCategory, number>()
    habits.forEach((habit) => counts.set(habit.category, (counts.get(habit.category) ?? 0) + 1))
    return counts
  }, [habits])

  const visibleHabits = useMemo(() => {
    const search = normalizeText(query)
    return habits.filter(
      (habit) =>
        (!category || habit.category === category) &&
        (!search || normalizeText(`${habit.name} ${habit.description}`).includes(search)),
    )
  }, [habits, category, query])

  const handleToggle = (habit: IHabit) => {
    const willComplete = !statsById.get(habit.id)?.doneToday
    toggleToday(habit.id)
    if (willComplete && doneCount + 1 === habits.length && habits.length > 1) {
      showToast({ message: 'Bugünkü tüm alışkanlıklarını tamamladın! 🎉' })
    }
  }

  const handleLoadSamples = () => {
    loadSampleHabits()
    showToast({ message: 'Örnek alışkanlıklar yüklendi.', tone: 'info' })
  }

  const hasFilters = Boolean(category || query)

  return (
    <section>
      <title>{habits.length > 0 ? `Bugün (${doneCount}/${habits.length}) · Zincir` : 'Zincir — Alışkanlık Takipçisi'}</title>
      {/* Başlık ve günün ilerlemesi */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          {habits.length > 0 && <ProgressRing done={doneCount} total={habits.length} />}
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 capitalize dark:text-zinc-400">{formatLongDate(today)}</p>
            <h1 className="text-3xl font-bold tracking-tight">Bugün</h1>
            {habits.length > 0 && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{progressMessage(doneCount, habits.length)}</p>
            )}
          </div>
        </div>

        {habits.length > 0 && (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
            Yeni alışkanlık
          </button>
        )}
      </div>

      {habits.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Link2 className="size-7" aria-hidden />}
            title="Zincirine ilk halkayı ekle"
            description="Her gün yapmak istediğin küçük bir alışkanlık seç. Yaptığın her gün zincirine bir halka ekler; zinciri kırmamaya çalış!"
          >
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
            >
              <Plus className="size-4" strokeWidth={2.5} aria-hidden />
              İlk alışkanlığını ekle
            </button>
            <button
              type="button"
              onClick={handleLoadSamples}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Sparkles className="size-4" aria-hidden />
              Örnek alışkanlıkları yükle
            </button>
          </EmptyState>
        </div>
      ) : (
        <>
          {/* Arama ve kategori filtresi */}
          <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative block lg:w-72">
              <span className="sr-only">Alışkanlık ara</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setFilter('ara', e.target.value || null)}
                placeholder="Alışkanlık ara…"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pr-3 pl-9 text-sm shadow-xs placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-2 focus:outline-offset-0 focus:outline-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden" role="group" aria-label="Kategoriye göre filtrele">
              <FilterChip active={!category} onClick={() => setFilter('kategori', null)}>
                Tümü <Count value={habits.length} />
              </FilterChip>
              {HABIT_CATEGORY_KEYS.filter((key) => categoryCounts.has(key)).map((key) => (
                <FilterChip key={key} active={category === key} onClick={() => setFilter('kategori', key)}>
                  {HABIT_CATEGORIES[key]} <Count value={categoryCounts.get(key) ?? 0} />
                </FilterChip>
              ))}
            </div>
          </div>

          {visibleHabits.length > 0 ? (
            <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Alışkanlıklar">
              {visibleHabits.map((habit) => (
                <li key={habit.id}>
                  <HabitCard
                    habit={habit}
                    stats={statsById.get(habit.id)!}
                    today={today}
                    onToggle={handleToggle}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <EmptyState
                icon={<SearchX className="size-7" aria-hidden />}
                title="Eşleşen alışkanlık yok"
                description="Arama ifadesini ya da kategori filtresini değiştirmeyi dene."
              >
                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => setSearchParams({})}
                    className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Filtreleri temizle
                  </button>
                )}
              </EmptyState>
            </div>
          )}
        </>
      )}

      {dialogs}
    </section>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          : 'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-800'
      }`}
    >
      {children}
    </button>
  )
}

function Count({ value }: { value: number }) {
  return <span className="text-xs tabular-nums opacity-60">{value}</span>
}
