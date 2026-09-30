# Zincir — İhtiyaç Analizi ve Tasarım

> **Web Geliştirme; JavaScript Proje Yönergesi** kapsamında hazırlanmıştır.
> Zincir, "zinciri kırma" yöntemine dayanan bir alışkanlık takip uygulamasıdır: her gün yapılan alışkanlık zincire bir halka ekler.

---

## 1. Fikir ve Amaç

Yönerge, eğitimde işlenen **TODO App** yapısının katılımcının kendi fikriyle harmanlanmasını ister. Zincir'de her alışkanlık **her gün tekrar eden bir TODO**'dur:

| TODO App | Zincir |
|---|---|
| Görev ekle | Alışkanlık ekle (ör. "Günde 20 sayfa kitap oku") |
| Görevleri listele | Alışkanlıkları bugünkü durumlarıyla listele |
| Görevi güncelle / tamamlandı yap | Alışkanlığı düzenle, **bugün yaptım** olarak işaretle |
| Görevi sil | Alışkanlığı sil |

Farkı: tamamlanma bilgisi tek bir `true/false` değil, **gün gün tutulur**. Böylece seri (streak), takvim ve istatistik üretilebilir.

Veriler tarayıcının **LocalStorage**'ında saklanır; uygulama backend gerektirmeden Vercel / Netlify gibi statik barındırma servislerinde tam olarak çalışır.

---

## 2. Yönerge Gereksinimleri

| # | Yönerge maddesi | Projedeki karşılığı |
|---|---|---|
| Y1 | Modern JS kütüphanesi seçimi, Netlify ile yayınlanabilir | **React 19** + **Vite 8** (statik çıktı; Vercel / Netlify uyumlu) |
| Y2 | LocalStorage kullanılabilir | Tüm veri LocalStorage'da (`utils/storage.ts`) |
| Y3 | Kütüphane kurulumu | `npm create vite` ile React + TypeScript şablonu |
| Y4 | Kurulumu bir IDE ile açma | Visual Studio Code |
| Y5 | `Components`, `Pages`, `Interfaces` klasörleri | `src/components`, `src/pages`, `src/interfaces` (+ `hooks`, `utils`, `context`) |
| Y6 | Tailwind CSS / Bootstrap 5 / Pure CSS | **Tailwind CSS 4** |
| Y7 | Ekle, Listele, Güncelle, Sil işlemleri | Bölüm 4 |
| Y8 | En az 1 ekran görüntüsü | `docs/screenshots/` + README |
| Y9–Y10 | GitHub public repo, link teslim formunda | GitHub |
| Y11 | Netlify veya muadili ile yayın, link teslimde | **Vercel** (`vercel.json`); Netlify için de hazır (`netlify.toml`) |

**Teknoloji seçimi gerekçesi:** Eğitmenin örnek projelerinde kullanılan yapı (React + TypeScript + Vite + Tailwind CSS 4 + ESLint) temel alınmıştır. Yönergedeki **Interfaces** klasörü TypeScript arayüzleri için kullanılır.

---

## 3. Veri Modeli (`src/interfaces`)

### 3.1 `IHabit` — Alışkanlık

| Alan | Tip | Zorunlu | Kural | Açıklama |
|---|---|---|---|---|
| `id` | `string` | otomatik | `crypto.randomUUID()` | Benzersiz kimlik |
| `name` | `string` | ✔ | 2–40 karakter, benzersiz | "Kitap oku" |
| `description` | `string` | | En fazla 150 karakter | "Günde en az 20 sayfa" |
| `icon` | `string` | ✔ | Hazır emoji listesinden | 📚 |
| `color` | `HabitColor` | ✔ | `emerald`, `sky`, `violet`, `amber`, `rose`, `slate` | Kart ve takvim rengi |
| `category` | `HabitCategory` | ✔ | `saglik`, `spor`, `egitim`, `kisisel`, `is` | Filtreleme için |
| `completions` | `string[]` | otomatik | `YYYY-MM-DD` biçiminde tarihler | Yapıldığı günler |
| `createdAt` | `string` | otomatik | ISO 8601 | |
| `updatedAt` | `string` | otomatik | ISO 8601 | |

**Örnek kayıt:**

```json
{
  "id": "3f6c2a4e-8b1d-4c1e-9a55-2f0d7b6e1c90",
  "name": "Kitap oku",
  "description": "Günde en az 20 sayfa",
  "icon": "📚",
  "color": "violet",
  "category": "egitim",
  "completions": ["2026-10-08", "2026-10-09", "2026-10-10"],
  "createdAt": "2026-10-01T08:30:00.000Z",
  "updatedAt": "2026-10-10T21:04:12.000Z"
}
```

### 3.2 Hesaplanan Değerler (saklanmaz, `utils/streak.ts` üretir)

| Değer | Tanım |
|---|---|
| `doneToday` | Bugünün tarihi `completions` içinde mi |
| `currentStreak` | Bugünden (bugün henüz yapılmadıysa dünden) geriye kesintisiz gün sayısı |
| `longestStreak` | Tüm zamanların en uzun kesintisiz serisi |
| `last7Days` | Son 7 günün yapıldı / yapılmadı durumu (kart üzerindeki zincir) |
| `rate30` | Son 30 gündeki tamamlanma yüzdesi |

> **Tarih kuralı:** Gün anahtarları UTC değil **yerel saate** göre üretilir. Aksi halde Türkiye saatiyle gece 00:00–03:00 arasında işaretlenen alışkanlık bir önceki güne yazılırdı.

### 3.3 LocalStorage Yapısı

| Anahtar | İçerik |
|---|---|
| `zincir.habits.v1` | `{ "version": 1, "habits": IHabit[] }` |
| `zincir.theme` | `"light"` veya `"dark"` |

- Okuma / yazma `try/catch` ile yapılır; bozuk veri uygulamayı çökertmez, kullanıcıya bilgi verilir.
- `version` alanı, ileride veri yapısı değişirse eski veriyi dönüştürebilmek içindir.

---

## 4. CRUD İşlemleri (Yönerge Y7)

| İşlem | Nerede | Nasıl |
|---|---|---|
| **Ekle** | Ana sayfa → "Yeni Alışkanlık" | Form penceresi: ad, açıklama, simge, renk, kategori. Doğrulama hataları alan altında gösterilir. |
| **Listele** | Ana sayfa | Alışkanlık kartları: simge, ad, bugünkü durum, seri, son 7 günün zinciri. Kategori filtresi ve arama. |
| **Güncelle** | Kart / detay sayfası | ① **Düzenle:** aynı form, mevcut değerlerle dolu gelir. ② **Bugün yaptım:** tek tıkla işaretle / geri al. ③ **Geçmiş günü düzelt:** detay sayfasındaki takvimden. |
| **Sil** | Kart / detay sayfası | Onay penceresi. Silme sonrası bildirimde **"geri al"**: alışkanlık eski sırasına döner. |

---

## 5. Sayfalar (`src/pages`)

| Yol | Sayfa | İçerik |
|---|---|---|
| `/` | **Bugün** | Günün özeti (x / y tamamlandı), filtre + arama, alışkanlık kartları, boş durum |
| `/aliskanlik/:id` | **Detay** | Ekran genişliğine uyumlu takvim (8–26 hafta), seri ve istatistikler, düzenle / sil |
| `/istatistikler` | **İstatistikler** | Özet kartları, son 14 günün grafiği, haftanın günlerine göre oran, en istikrarlı alışkanlıklar |
| `*` | **Bulunamadı** | 404 sayfası, ana sayfaya dönüş |

> `/aliskanlik/...` gibi adresler sayfa yenilendiğinde 404 vermesin diye `vercel.json` ve `netlify.toml`'a tüm yolları `index.html`'e yönlendiren kural eklenir (eğitmenin örneğindeki gibi).

## 6. Bileşenler (`src/components`)

| Bileşen | Görev |
|---|---|
| `Layout` | Üst menü, sayfa çerçevesi, tema değiştirici |
| `HabitCard` | Tek alışkanlık kartı: bugün işaretleme, seri, mini zincir, menü |
| `HabitForm` | Ekle / düzenle formu ve doğrulama |
| `Modal` | Erişilebilir pencere (Esc ile kapanır, odak içeride kalır) |
| `ConfirmDialog` | Silme onayı |
| `ChainDots` | Son 7 günün halkaları |
| `CalendarHeatmap` | Detay sayfasındaki takvim (genişliğe uyumlu, renk göstergeli) |
| `StatCard` | İstatistik kutucuğu |
| `EmptyState` | Hiç alışkanlık yokken gösterilen ekran + "örnek alışkanlıkları yükle" |
| `ToastProvider` | İşlem bildirimleri (eklendi, güncellendi, silindi + geri al) |
| `ProgressRing` | Günün tamamlanma halkası |
| `ColumnChart` | İstatistik sayfasının sütun grafiği (ipucu + tablo görünümü) |

## 7. Durum Yönetimi

```
LocalStorage ◄──► habitsStore (reducer) ◄──► useSyncExternalStore ◄──► HabitsProvider ◄──► useHabits ◄──► Sayfalar
```

- Alışkanlıklar React'ten bağımsız bir depoda (`context/habitsStore.ts`) tutulur ve React'e **`useSyncExternalStore`** ile bağlanır; LocalStorage gibi dış veri kaynakları için React'in önerdiği yöntemdir.
- Her işlem saf bir **reducer**'dan geçer (`add`, `update`, `toggleDay`, `remove`, `restore`, `replaceAll`) ve sonuç hemen LocalStorage'a yazılır.
- Başka bir sekmede yapılan değişiklik (`storage` olayı) bu sekmeye de yansır.
- Hesaplamalar (seri, istatistik) saf fonksiyonlarda (`utils/streak.ts`) yapılır; bileşenler sadece gösterir.

---

## 8. Klasör Yapısı

```
web/
├── public/                 # favicon vb.
├── src/
│   ├── components/         # Yeniden kullanılabilir arayüz parçaları
│   ├── pages/              # Sayfa bileşenleri (Bugün, Detay, İstatistikler, 404)
│   ├── interfaces/         # TypeScript arayüzleri (IHabit, ...)
│   ├── context/            # Alışkanlık deposu, reducer, bağlamlar
│   ├── hooks/              # useHabits, useTheme
│   ├── utils/              # storage, date, streak, validation
│   ├── constants/          # renkler, kategoriler, simgeler, örnek veri
│   ├── App.tsx             # Router tanımları
│   ├── main.tsx
│   └── index.css           # Tailwind
├── docs/                   # Analiz, ekran görüntüleri
├── vercel.json             # Vercel yayın ayarları
├── netlify.toml            # Netlify yayın ayarları (alternatif)
├── package.json
└── README.md
```

> Klasör adları eğitmenin örnek projesindeki gibi küçük harfle yazılmıştır (`components`, `pages`, `interfaces`).

## 9. Teknolojiler

| Teknoloji | Kullanım |
|---|---|
| React 19 | Arayüz |
| TypeScript | Tip güvenliği, `interfaces` |
| Vite 8 | Geliştirme sunucusu ve derleme |
| Tailwind CSS 4 | Stil, responsive tasarım, karanlık tema |
| React Router | Sayfalar arası geçiş |
| ESLint | Kod denetimi |
| Vitest | Seri / tarih hesaplamalarının birim testleri |
| Vercel | Yayın (Netlify'a da hazır) |

## 10. Yönergenin Ötesindeki Özellikler

Zorunlu CRUD'un üzerine eklenenler:

- Seri (streak) ve en uzun seri hesabı, son 7 günün zinciri
- Genişliğe uyumlu takvim ve istatistik sayfası (grafikler)
- Takvimden geçmiş günü düzeltme, silmeyi geri alma
- Kategori filtresi ve arama
- Karanlık / aydınlık tema (tercih hatırlanır)
- Mobil uyumlu (responsive) tasarım
- Form doğrulama, silme onayı, işlem bildirimleri
- Boş durumda tek tıkla örnek veri yükleme (canlı bağlantıyı ilk açan değerlendirici boş ekran görmez)
- Erişilebilirlik: klavye ile kullanım, etiketli form alanları
- Hesaplama fonksiyonları için birim testleri (4 saat diliminde tarih testleri dahil)
- Sekmeler arası senkron, uygulama açıkken gece yarısı gün değişimi

## 11. Teslim Edilecekler

| Çıktı | Konum |
|---|---|
| Kaynak kod | GitHub (public) |
| Ekran görüntüleri (en az 1) | `docs/screenshots/`, README |
| Canlı uygulama | Vercel bağlantısı |
| Kurulum ve kullanım | `README.md` |
