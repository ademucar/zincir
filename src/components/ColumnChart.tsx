import { useState } from 'react'

export interface IColumnDatum {
  key: string
  /** Eksen altındaki kısa etiket ("17", "Pzt") */
  axisLabel: string
  /** İpucu ve tabloda görünen tam etiket ("17 Eylül Perşembe") */
  label: string
  /** 0–100 arası yüzde */
  value: number
  /** Ek açıklama ("6 alışkanlıktan 4'ü") */
  detail?: string
}

interface ColumnChartProps {
  data: IColumnDatum[]
  /** Değeri sütunun üstüne yazılacak tek sütun (seçici etiketleme) */
  highlightKey?: string
  /** Grafiğin ne gösterdiği (ekran okuyucu ve tablo başlığı) */
  title: string
}

const TICKS = [100, 50, 0]

/**
 * Tek seri yüzde sütun grafiği.
 * - Sütunlar tek renk (tek ölçü, tek renk); en fazla 24px genişlik, üstü 4px yuvarlak, tabanı düz
 * - Fareyle üzerine gelince ve klavye odağında aynı ipucu
 * - Her değer tablo görünümünde de erişilebilir (ipucu tek yol değildir)
 */
export function ColumnChart({ data, highlightKey, title }: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <figure>
      <div className="flex gap-2">
        {/* Y ekseni */}
        <div className="relative h-40 w-9 shrink-0 text-right text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums" aria-hidden>
          {TICKS.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - tick}%` }}>
              %{tick}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-40">
            {/* Izgara: ince, düz, zeminden bir ton koyu */}
            {TICKS.map((tick) => (
              <span
                key={tick}
                className="absolute inset-x-0 border-t border-zinc-200 dark:border-zinc-800"
                style={{ top: `${100 - tick}%` }}
                aria-hidden
              />
            ))}

            <ul className="relative flex h-full items-end gap-0.5" aria-label={title}>
              {data.map((datum, index) => {
                const isActive = active === index
                const align =
                  index < 2 ? 'left-0' : index > data.length - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                return (
                  <li
                    key={datum.key}
                    tabIndex={0}
                    aria-label={`${datum.label}: %${datum.value}${datum.detail ? `, ${datum.detail}` : ''}`}
                    onPointerEnter={() => setActive(index)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="relative flex h-full flex-1 items-end justify-center rounded-sm outline-offset-0"
                  >
                    {datum.value > 0 && (
                      <span
                        className={`block w-full max-w-6 rounded-t-[4px] bg-emerald-600 transition-[height,filter] duration-500 ${
                          isActive ? 'brightness-125' : ''
                        }`}
                        style={{ height: `${datum.value}%` }}
                        aria-hidden
                      />
                    )}

                    {datum.key === highlightKey && !isActive && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 pb-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
                        style={{ bottom: `${datum.value}%` }}
                        aria-hidden
                      >
                        %{datum.value}
                      </span>
                    )}

                    {isActive && (
                      <span
                        className={`pointer-events-none absolute z-10 mb-2 w-max max-w-44 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-zinc-700 ${align}`}
                        style={{ bottom: `${datum.value}%` }}
                        aria-hidden
                      >
                        <span className="block text-sm font-semibold">%{datum.value}</span>
                        <span className="block text-zinc-300">{datum.label}</span>
                        {datum.detail && <span className="block text-zinc-300">{datum.detail}</span>}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* X ekseni */}
          <div className="mt-2 flex gap-0.5 text-[11px] text-zinc-500 dark:text-zinc-400" aria-hidden>
            {data.map((datum) => (
              <span
                key={datum.key}
                className={`flex-1 text-center ${datum.key === highlightKey ? 'font-semibold text-zinc-800 dark:text-zinc-200' : ''}`}
              >
                {datum.axisLabel}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tablo görünümü: grafiği görmeyen / okuyamayan kullanıcılar için eşdeğer içerik */}
      <details className="mt-4 text-sm">
        <summary className="w-fit cursor-pointer rounded text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
          Tablo olarak göster
        </summary>
        <table className="mt-3 w-full text-left text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="text-xs text-zinc-500 dark:text-zinc-400">
            <tr>
              <th scope="col" className="py-1.5 font-medium">Gün</th>
              <th scope="col" className="py-1.5 text-right font-medium">Oran</th>
              <th scope="col" className="py-1.5 text-right font-medium">Ayrıntı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.map((datum) => (
              <tr key={datum.key}>
                <td className="py-1.5">{datum.label}</td>
                <td className="py-1.5 text-right tabular-nums">%{datum.value}</td>
                <td className="py-1.5 text-right text-zinc-500 dark:text-zinc-400">{datum.detail ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
