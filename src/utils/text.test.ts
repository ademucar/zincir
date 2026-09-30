import { describe, expect, it } from 'vitest'
import { normalizeText } from './text'

describe('normalizeText', () => {
  it('büyük/küçük harf ve Türkçe karakter farkını yok sayar', () => {
    expect(normalizeText('İŞLEM')).toBe('islem')
    expect(normalizeText('Işık Ağacı')).toBe('isik agaci')
    expect(normalizeText('ÇÖĞÜŞ')).toBe('cogus')
  })

  it('baştaki ve sondaki boşlukları temizler', () => {
    expect(normalizeText('  kitap  ')).toBe('kitap')
  })

  it('aramada eşleşmeyi sağlar', () => {
    expect(normalizeText('20 Sayfa Kitap Oku').includes(normalizeText('KİTAP'))).toBe(true)
    expect(normalizeText('Günlük kod pratiği').includes(normalizeText('gunluk'))).toBe(true)
  })
})
