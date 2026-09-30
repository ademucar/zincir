import { CalendarCheck, ChartColumn, Flame, ListChecks, Percent, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { ColumnChart, type IColumnDatum } from '../components/ColumnChart'
import { EmptyState } from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { useHabits } from '../hooks/useHabits'
import { formatLongDate, parseDateKey } from '../utils/date'
import { getConsistencyRanking, getDailyRates, getOverview, getWeekdayRates } from '../utils/stats'

const WEEKDAY_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const WEEKDAY_LONG = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

export function StatsPage() {
  const { habits, today } = useHabits()

  const overview = useMemo(() => getOverview(habits, today), [habits, today])
  const ranking = useMemo(() => getConsistencyRanking(habits, today), [habits, today])

  const dailyData = useMemo<IColumnDatum[]>(
    () =>
      getDailyRates(habits, today, 14).map((day) => ({
        key: day.date,
        axisLabel: day.date === today ? 'Bugün' : String(parseDateKey(day.date).getDate()),
        label: formatLongDate(day.date),
        value: day.rate,
        detail: `${day.total} alışkanlıktan ${day.done} tanesi`,
      })),
    [habits, today],
  )

  const weekdayRates = useMemo(() => getWeekdayRates(habits, today, 8), [habits, today])
  const weekdayData = useMemo<IColumnDatum[]>(
    () =>
      weekdayRates.map((w) => ({
        key: String(w.weekday),
        axisLabel: WEEKDAY_SHORT[w.weekday],
        label: WEEKDAY_LONG[w.weekday],
        value: w.rate,
        detail: w.total > 0 ? `${w.total} kayıttan ${w.done} tamamlandı` : 'Henüz veri yok',
      })),
    [weekdayRates],
  )
  const bestWeekday = weekdayRates.reduce((best, w) => (w.rate > best.rate ? w : best), weekdayRates[0])

  if (habits.length === 0) {
    return (
      <section>
        <h1 className="text-3xl font-bold tracking-tight">İstatistikler</h1>
        <div className="mt-8">
          <EmptyState
            icon={<ChartColumn className="size-7" aria-hidden />}
            title="Henüz gösterecek veri yok"
            description="Alışkanlık ekleyip işaretlemeye başladığında ilerlemen burada görünecek."
          >
            <Link
              to="/"
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Alışkanlık ekle
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">İstatistikler</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">Zincirlerinin genel görünümü.</p>

      {/* Özet */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<ListChecks className="size-4 text-sky-500" aria-hidden />}
          label="Bugün"
          value={`${overview.doneToday} / ${overview.totalHabits}`}
          hint="tamamlanan alışkanlık"
        />
        <StatCard
          icon={<Percent className="size-4 text-emerald-500" aria-hidden />}
          label="Son 30 gün ortalaması"
          value={`%${overview.averageRate30}`}
        />
        <StatCard
          icon={<Trophy className="size-4 text-amber-500" aria-hidden />}
          label="En uzun seri"
          value={`${overview.best?.longestStreak ?? 0} gün`}
          hint={overview.best ? overview.best.habit.name : undefined}
        />
        <StatCard
          icon={<CalendarCheck className="size-4 text-violet-500" aria-hidden />}
          label="Toplam halka"
          value={overview.totalCompletions.toLocaleString('tr-TR')}
          hint="tüm alışkanlıklarda yapılan gün"
        />
      </div>

      {/* Son 14 gün */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-semibold tracking-tight">Son 14 gün</h2>
        <p className="mt-0.5 mb-5 text-sm text-zinc-500">Her gün alışkanlıklarının yüzde kaçını tamamladın?</p>
        <ColumnChart data={dailyData} highlightKey={today} title="Son 14 günün günlük tamamlanma oranı" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Haftanın günleri */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold tracking-tight">Haftanın günlerine göre</h2>
          <p className="mt-0.5 mb-5 text-sm text-zinc-500">
            {bestWeekday.total > 0 ? (
              <>
                En verimli günün <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{WEEKDAY_LONG[bestWeekday.weekday]}</strong> (son 8 hafta)
              </>
            ) : (
              'Birkaç gün sonra hangi günlerde daha istikrarlı olduğun görünecek.'
            )}
          </p>
          <ColumnChart
            data={weekdayData}
            highlightKey={bestWeekday.total > 0 ? String(bestWeekday.weekday) : undefined}
            title="Son 8 haftada haftanın günlerine göre tamamlanma oranı"
          />
        </div>

        {/* En istikrarlı alışkanlıklar */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold tracking-tight">En istikrarlı alışkanlıklar</h2>
          <p className="mt-0.5 mb-5 text-sm text-zinc-500">Son 30 günde tamamlanma oranına göre</p>
          <ol className="space-y-4">
            {ranking.map(({ habit, rate30, currentStreak }) => (
              <li key={habit.id}>
                <div className="flex items-center gap-2 text-sm">
                  <span aria-hidden>{habit.icon}</span>
                  <Link to={`/aliskanlik/${habit.id}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
                    {habit.name}
                  </Link>
                  {currentStreak > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-zinc-500" title={`${currentStreak} günlük seri`}>
                      <Flame className="size-3.5 text-orange-500" aria-hidden />
                      <span className="sr-only">Güncel seri:</span>
                      {currentStreak}
                    </span>
                  )}
                  <span className="w-11 text-right font-semibold tabular-nums">%{rate30}</span>
                </div>
                <div
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                  role="progressbar"
                  aria-valuenow={rate30}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${habit.name}: son 30 günde %${rate30}`}
                >
                  <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-500" style={{ width: `${rate30}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
