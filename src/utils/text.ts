/**
 * Arama için metni sadeleştirir: küçük harfe çevirir, Türkçe karakterleri
 * İngilizce karşılıklarına indirger. normalizeText('İşlem') === normalizeText('islem')
 */
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD') // ş → s + birleşik çengel işareti
    .replace(/[\u0300-\u036f]/g, '') // birleşik işaretleri (aksanları) kaldırır
}
