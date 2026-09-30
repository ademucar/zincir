// @vitest-environment jsdom
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp, storedHabits } from './renderApp'

/** Örnek verilerle başlatır */
async function startWithSamples() {
  const app = renderApp('/')
  await app.user.click(screen.getByRole('button', { name: 'Örnek alışkanlıkları yükle' }))
  return app
}

const cards = () => screen.queryAllByRole('article')
const card = (name: string) => cards().find((c) => within(c).queryByRole('heading', { name }))!
const dialog = () => screen.getByRole('dialog')
/** İstatistik kartının tüm metni (etiket + değer) */
const statCard = (label: string) => screen.getByText(label).parentElement?.parentElement?.textContent ?? ''

describe('Yönergedeki dört işlem (CRUD)', () => {
  it('Listele: boş durum gösterilir; örnek veriler yüklenince 6 alışkanlık listelenir', async () => {
    renderApp('/')
    expect(screen.getByRole('heading', { name: 'Zincirine ilk halkayı ekle' })).toBeTruthy()
    expect(cards()).toHaveLength(0)

    await screen.findByRole('button', { name: 'Örnek alışkanlıkları yükle' }).then((b) => b.click())

    expect(await screen.findAllByRole('article')).toHaveLength(6)
    expect(storedHabits()).toHaveLength(6)
    expect(screen.getByRole('img', { name: /Bugün 6 alışkanlıktan/ })).toBeTruthy()
  })

  it('Ekle: boş ad reddedilir; geçerli alışkanlık eklenir, listelenir ve kaydedilir', async () => {
    const { user } = renderApp('/')
    await user.click(screen.getByRole('button', { name: 'İlk alışkanlığını ekle' }))

    // Boş gönderim → hata mesajı, odak ad alanında
    await user.click(within(dialog()).getByRole('button', { name: 'Alışkanlığı ekle' }))
    const nameInput = within(dialog()).getByLabelText('Alışkanlık adı')
    expect(nameInput.getAttribute('aria-invalid')).toBe('true')
    expect(within(dialog()).getByText('Alışkanlığa bir ad ver.')).toBeTruthy()
    expect(document.activeElement).toBe(nameInput)

    // Geçerli form
    await user.type(nameInput, 'Gitar pratiği')
    await user.click(within(dialog()).getByRole('radio', { name: 'Gitar' }))
    await user.click(within(dialog()).getByRole('radio', { name: 'Kişisel' }))
    await user.click(within(dialog()).getByRole('button', { name: 'Alışkanlığı ekle' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(card('Gitar pratiği')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('"Gitar pratiği" eklendi')
    expect(storedHabits()).toMatchObject([{ name: 'Gitar pratiği', category: 'kisisel', completions: [] }])
  })

  it('Ekle: aynı ad (Türkçe büyük/küçük harf farkıyla) tekrar eklenemez', async () => {
    const { user } = await startWithSamples()
    await user.click(screen.getByRole('button', { name: 'Yeni alışkanlık' }))
    await user.type(within(dialog()).getByLabelText('Alışkanlık adı'), '20 SAYFA KİTAP OKU')
    await user.click(within(dialog()).getByRole('button', { name: 'Alışkanlığı ekle' }))

    expect(within(dialog()).getByText('Bu adda bir alışkanlığın zaten var.')).toBeTruthy()
    expect(storedHabits()).toHaveLength(6)
  })

  it('Güncelle: düzenleme formu mevcut değerlerle açılır; ad değişir, geçmiş korunur', async () => {
    const { user } = await startWithSamples()
    const before = storedHabits().find((h) => h.name === '20 sayfa kitap oku')!

    await user.click(screen.getByRole('button', { name: '20 sayfa kitap oku alışkanlığını düzenle' }))
    const nameInput = within(dialog()).getByLabelText('Alışkanlık adı') as HTMLInputElement
    expect(nameInput.value).toBe('20 sayfa kitap oku')

    await user.clear(nameInput)
    await user.type(nameInput, '30 sayfa kitap oku')
    await user.click(within(dialog()).getByRole('button', { name: 'Değişiklikleri kaydet' }))

    expect(card('30 sayfa kitap oku')).toBeTruthy()
    const after = storedHabits().find((h) => h.name === '30 sayfa kitap oku')!
    expect(after.completions).toEqual(before.completions)
  })

  it('Güncelle: "bugün yaptım" işaretlenir, seri artar ve geri alınabilir', async () => {
    const { user } = await startWithSamples()
    const target = card('20 sayfa kitap oku')
    const toggle = within(target).getByRole('button', { name: 'Bugün yaptım' })
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    expect(target.textContent).toContain('5 günlük seri')

    await user.click(toggle)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(target.textContent).toContain('6 günlük seri')

    await user.click(toggle)
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    expect(target.textContent).toContain('5 günlük seri')
  })

  it('Sil: onay penceresinde vazgeçilebilir; silinen alışkanlık "geri al" ile eski yerine döner', async () => {
    const { user } = await startWithSamples()
    const namesBefore = storedHabits().map((h) => h.name)

    await user.click(screen.getByRole('button', { name: '10 dakika meditasyon alışkanlığını sil' }))
    expect(document.activeElement?.textContent).toBe('Vazgeç')
    await user.click(within(dialog()).getByRole('button', { name: 'Vazgeç' }))
    expect(cards()).toHaveLength(6)

    await user.click(screen.getByRole('button', { name: '10 dakika meditasyon alışkanlığını sil' }))
    await user.click(within(dialog()).getByRole('button', { name: 'Sil' }))
    expect(cards()).toHaveLength(5)
    expect(storedHabits().map((h) => h.name)).not.toContain('10 dakika meditasyon')

    await user.click(within(screen.getByRole('status')).getByRole('button', { name: 'Geri al' }))
    expect(cards()).toHaveLength(6)
    expect(storedHabits().map((h) => h.name)).toEqual(namesBefore)
  })
})

describe('Filtreler ve sayfalar', () => {
  it('Arama ve kategori filtresi listeyi daraltır; sonuç yoksa filtre temizlenebilir', async () => {
    const { user, router } = await startWithSamples()

    await user.type(screen.getByRole('searchbox', { name: 'Alışkanlık ara' }), 'KİTAP')
    expect(cards()).toHaveLength(1)
    expect(router.state.location.search).toContain('ara=')

    await user.clear(screen.getByRole('searchbox', { name: 'Alışkanlık ara' }))
    await user.click(screen.getByRole('button', { name: /^Eğitim/ }))
    expect(cards()).toHaveLength(2)
    expect(router.state.location.search).toBe('?kategori=egitim')

    await user.type(screen.getByRole('searchbox', { name: 'Alışkanlık ara' }), 'olmayan')
    expect(screen.getByRole('heading', { name: 'Eşleşen alışkanlık yok' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Filtreleri temizle' }))
    expect(cards()).toHaveLength(6)
  })

  it('Detay sayfası: istatistikler gösterilir, takvimden geçmiş gün düzeltilebilir', async () => {
    const { user } = await startWithSamples()
    await user.click(screen.getByRole('link', { name: 'Günde 2 litre su iç' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Günde 2 litre su iç' })).toBeTruthy()
    expect(statCard('Güncel seri')).toContain('24 gün')

    // Dünün işaretini kaldırınca seri kırılır, bugün 1 gün kalır
    const yesterday = screen.getAllByRole('button', { pressed: true }).filter((b) => b.getAttribute('aria-label')?.includes(': yapıldı')).at(-2)!
    await user.click(yesterday)
    expect(statCard('Güncel seri')).toContain('1 gün')
  })

  it('İstatistikler sayfası özet kartlarını ve grafik tablosunu gösterir', async () => {
    const { user } = await startWithSamples()
    await user.click(screen.getByRole('link', { name: 'İstatistikler' }))

    expect(screen.getByRole('heading', { level: 1, name: 'İstatistikler' })).toBeTruthy()
    expect(statCard('En uzun seri')).toContain('24 gün')
    expect(screen.getAllByRole('table').length).toBeGreaterThanOrEqual(2)
  })

  it('Bulunamayan alışkanlık ve bilinmeyen adres için yönlendirici ekranlar', () => {
    renderApp('/aliskanlik/olmayan')
    expect(screen.getByRole('heading', { name: 'Alışkanlık bulunamadı' })).toBeTruthy()
  })

  it('Bilinmeyen adreste 404 sayfası', () => {
    renderApp('/boyle-bir-sayfa-yok')
    expect(screen.getByRole('heading', { name: 'Bu halka zincirde yok' })).toBeTruthy()
  })
})
