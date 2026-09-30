import { useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { HabitForm } from '../components/HabitForm'
import { Modal } from '../components/Modal'
import { EMPTY_HABIT_FORM } from '../constants/habit'
import type { IHabit, IHabitFormData } from '../interfaces/habit'
import { useHabits } from './useHabits'
import { useToast } from './useToast'

type FormState = { mode: 'add' } | { mode: 'edit'; habit: IHabit } | null

const toFormData = ({ name, description, icon, color, category }: IHabit): IHabitFormData => ({
  name,
  description,
  icon,
  color,
  category,
})

function deleteDescription(habit: IHabit): string {
  const days = new Set(habit.completions).size
  return days === 0
    ? `"${habit.name}" silinecek.`
    : `"${habit.name}" ve yapıldığı ${days} günün kaydı silinecek.`
}

interface Options {
  /** Silme sonrası yapılacak iş (ör. detay sayfasından ana sayfaya dönmek) */
  onDeleted?: () => void
}

/**
 * Ekle / Düzenle / Sil pencerelerini ve işlemlerini tek yerde toplar.
 * Hem Bugün hem Detay sayfası aynı davranışı kullanır.
 */
export function useHabitDialogs({ onDeleted }: Options = {}) {
  const { habits, addHabit, updateHabit, removeHabit, restoreHabit } = useHabits()
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<IHabit | null>(null)

  const closeForm = () => setForm(null)

  const handleSubmit = (data: IHabitFormData) => {
    if (form?.mode === 'edit') {
      updateHabit(form.habit.id, data)
      showToast({ message: 'Alışkanlık güncellendi.' })
    } else {
      const habit = addHabit(data)
      showToast({ message: `"${habit.name}" eklendi. İlk halkayı bugün tak!` })
    }
    closeForm()
  }

  const handleDelete = () => {
    if (!deleting) return
    const removed = removeHabit(deleting.id)
    setDeleting(null)
    if (!removed) return

    onDeleted?.()
    showToast({
      message: `"${removed.habit.name}" silindi.`,
      tone: 'danger',
      action: {
        label: 'Geri al',
        onClick: () => {
          restoreHabit(removed)
          showToast({ message: 'Alışkanlık geri getirildi.', tone: 'info' })
        },
      },
    })
  }

  const isEdit = form?.mode === 'edit'

  const dialogs = (
    <>
      <Modal
        open={form !== null}
        onClose={closeForm}
        title={isEdit ? 'Alışkanlığı düzenle' : 'Yeni alışkanlık'}
        description={
          isEdit
            ? 'Yapılan günler ve seri bilgisi korunur.'
            : 'Her gün yapmak istediğin küçük bir adım seç.'
        }
      >
        {form && (
          <HabitForm
            initialValues={form.mode === 'edit' ? toFormData(form.habit) : EMPTY_HABIT_FORM}
            habits={habits}
            editingId={form.mode === 'edit' ? form.habit.id : undefined}
            submitLabel={isEdit ? 'Değişiklikleri kaydet' : 'Alışkanlığı ekle'}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Alışkanlık silinsin mi?"
        description={deleting ? deleteDescription(deleting) : ''}
        confirmLabel="Sil"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  )

  return {
    openAdd: () => setForm({ mode: 'add' }),
    openEdit: (habit: IHabit) => setForm({ mode: 'edit', habit }),
    openDelete: (habit: IHabit) => setDeleting(habit),
    dialogs,
  }
}
