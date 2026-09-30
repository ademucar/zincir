/**
 * Benzersiz kimlik üretir.
 * crypto.randomUUID yalnızca güvenli bağlamlarda (https, localhost) vardır; uygulama
 * yerel ağ adresinden (http://192.168...) açılırsa yedek yöntem kullanılır.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
