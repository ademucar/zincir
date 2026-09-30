interface ProgressRingProps {
  done: number
  total: number
}

const SIZE = 64
const STROKE = 7
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Günün tamamlanma halkası (x / y) */
export function ProgressRing({ done, total }: ProgressRingProps) {
  const ratio = total === 0 ? 0 : done / total
  const percent = Math.round(ratio * 100)

  return (
    <div
      className="relative grid size-16 shrink-0 place-items-center"
      role="img"
      aria-label={`Bugün ${total} alışkanlıktan ${done} tanesi tamamlandı (%${percent})`}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-zinc-200 dark:stroke-zinc-800"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          className="stroke-emerald-500 transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="text-sm font-bold tabular-nums" aria-hidden>
        {done}/{total}
      </span>
    </div>
  )
}
