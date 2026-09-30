import { Check } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import {
  DESCRIPTION_MAX_LENGTH,
  HABIT_CATEGORIES,
  HABIT_CATEGORY_KEYS,
  HABIT_COLOR_KEYS,
  HABIT_COLORS,
  HABIT_ICON_LABELS,
  HABIT_ICONS,
  NAME_MAX_LENGTH,
} from '../constants/habit'
import type { HabitFormErrors, IHabit, IHabitFormData } from '../interfaces/habit'
import { hasErrors, validateHabitForm } from '../utils/validation'

interface HabitFormProps {
  initialValues: IHabitFormData
  /** Ad benzersizliği kontrolü için mevcut alışkanlıklar */
  habits: readonly IHabit[]
  /** Düzenleme modunda alışkanlığın id'si */
  editingId?: string
  submitLabel: string
  onSubmit: (data: IHabitFormData) => void
  onCancel: () => void
}

const FIELD_ORDER: (keyof IHabitFormData)[] = ['name', 'description', 'icon', 'color', 'category']

export function HabitForm({ initialValues, habits, editingId, submitLabel, onSubmit, onCancel }: HabitFormProps) {
  const [values, setValues] = useState<IHabitFormData>(initialValues)
  const [errors, setErrors] = useState<HabitFormErrors>({})
  // İlk gönderim denemesinden sonra hatalar yazarken anlık güncellenir
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const id = useId()

  const update = <K extends keyof IHabitFormData>(field: K, value: IHabitFormData[K]) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (submitted) setErrors(validateHabitForm(next, habits, editingId))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const validation = validateHabitForm(values, habits, editingId)
    setErrors(validation)
    setSubmitted(true)

    if (hasErrors(validation)) {
      // Klavye ve ekran okuyucu kullanıcıları için odak ilk hatalı alana taşınır
      const firstInvalid = FIELD_ORDER.find((field) => validation[field])
      formRef.current?.querySelector<HTMLElement>(`[data-field="${firstInvalid}"]`)?.focus()
      return
    }
    onSubmit(values)
  }

  const errorId = (field: keyof IHabitFormData) => `${id}-${field}-error`

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Ad */}
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={`${id}-name`} className="text-sm font-medium">
            Alışkanlık adı
          </label>
          <span className="text-xs text-zinc-500 tabular-nums">
            {values.name.trim().length}/{NAME_MAX_LENGTH}
          </span>
        </div>
        <input
          id={`${id}-name`}
          data-field="name"
          type="text"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Örn. 20 sayfa kitap oku"
          maxLength={NAME_MAX_LENGTH + 10}
          data-autofocus
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? errorId('name') : undefined}
          className={inputClass(Boolean(errors.name))}
        />
        <FieldError id={errorId('name')} message={errors.name} />
      </div>

      {/* Açıklama */}
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={`${id}-description`} className="text-sm font-medium">
            Açıklama <span className="font-normal text-zinc-500">(isteğe bağlı)</span>
          </label>
          <span className="text-xs text-zinc-500 tabular-nums">
            {values.description.trim().length}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id={`${id}-description`}
          data-field="description"
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Örn. Yatmadan önce, telefonsuz"
          rows={2}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? errorId('description') : undefined}
          className={`${inputClass(Boolean(errors.description))} resize-none`}
        />
        <FieldError id={errorId('description')} message={errors.description} />
      </div>

      {/* Simge */}
      <fieldset>
        <legend className="text-sm font-medium">Simge</legend>
        <div className="mt-2 grid grid-cols-8 gap-1.5">
          {HABIT_ICONS.map((icon, index) => (
            <label key={icon} className="relative">
              <input
                type="radio"
                name={`${id}-icon`}
                value={icon}
                checked={values.icon === icon}
                onChange={() => update('icon', icon)}
                data-field={index === 0 ? 'icon' : undefined}
                className="peer sr-only"
              />
              <span className="grid aspect-square cursor-pointer place-items-center rounded-lg text-xl transition-colors peer-checked:bg-emerald-100 peer-checked:ring-2 peer-checked:ring-emerald-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-500 hover:bg-zinc-100 dark:peer-checked:bg-emerald-500/20 dark:hover:bg-zinc-800">
                <span aria-hidden>{icon}</span>
                <span className="sr-only">{HABIT_ICON_LABELS[icon]}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError id={errorId('icon')} message={errors.icon} />
      </fieldset>

      {/* Renk */}
      <fieldset>
        <legend className="text-sm font-medium">Renk</legend>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {HABIT_COLOR_KEYS.map((color, index) => (
            <label key={color} className="relative" title={HABIT_COLORS[color].label}>
              <input
                type="radio"
                name={`${id}-color`}
                value={color}
                checked={values.color === color}
                onChange={() => update('color', color)}
                data-field={index === 0 ? 'color' : undefined}
                className="peer sr-only"
              />
              <span
                className={`grid size-8 cursor-pointer place-items-center rounded-full ring-offset-2 ring-offset-white transition-transform peer-checked:ring-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-emerald-500 hover:scale-110 dark:ring-offset-zinc-900 ${HABIT_COLORS[color].solid} ${HABIT_COLORS[color].ring}`}
              >
                {values.color === color && <Check className="size-4 text-white" strokeWidth={3} aria-hidden />}
                <span className="sr-only">{HABIT_COLORS[color].label}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError id={errorId('color')} message={errors.color} />
      </fieldset>

      {/* Kategori */}
      <fieldset>
        <legend className="text-sm font-medium">Kategori</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {HABIT_CATEGORY_KEYS.map((category, index) => (
            <label key={category}>
              <input
                type="radio"
                name={`${id}-category`}
                value={category}
                checked={values.category === category}
                onChange={() => update('category', category)}
                data-field={index === 0 ? 'category' : undefined}
                className="peer sr-only"
              />
              <span className="inline-block cursor-pointer rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500">
                {HABIT_CATEGORIES[category]}
              </span>
            </label>
          ))}
        </div>
        <FieldError id={errorId('category')} message={errors.category} />
      </fieldset>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function inputClass(invalid: boolean) {
  return `mt-1.5 block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus:outline-2 focus:outline-offset-0 dark:bg-zinc-950 ${
    invalid
      ? 'border-rose-500 focus:outline-rose-500'
      : 'border-zinc-300 focus:border-emerald-500 focus:outline-emerald-500 dark:border-zinc-700'
  }`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
      {message}
    </p>
  )
}
