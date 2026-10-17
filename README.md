# LGS Pusulam – Antalya

**Yapay Zekâ Destekli LGS Deneme Analizi, Dijital Yanlış Defteri ve Antalya Lise Tercih Asistanı**

LGS Pusulam – Antalya; Antalya'da yaşayan bir öğrenci ve velinin 8. sınıf LGS hazırlık sürecini uçtan uca takip edebilmesi, her deneme sınavından sonra netlerini ve konu eksiklerini analiz edebilmesi, yanlış ve boş sorularını fotoğraflarla arşivleyip kırpabilmesi, tekrar eden hata örüntülerini tespit edebilmesi ve Antalya'da merkezî sınavla öğrenci alan liselerle kendi performansını karşılaştırabilmesi için geliştirilmiş **mobil öncelikli, çevrimdışı çalışabilen (PWA)** bir uygulamadır.

---

## 1. Ana Çalışma Döngüsü ve Özellikler

1. **Öğrenci Profili ve Çoklu Öğrenci Desteği:** Öğrenci adı zorunlu olmadan sınıf seviyesi, Antalya ilçesi, hedef lise/okul türleri, hedef yüzdelik dilim, haftalık çalışma süresi ve tekrar aralıkları tanımlanır.
2. **Deneme Sınavı Kayıt ve Net Hesaplama Motoru:**
   - Standart LGS şablonu (Türkçe 20, Matematik 20, Fen Bilimleri 20, T.C. İnkılap Tarihi 10, Din Kültürü 10, İngilizce 10) ve düzenlenebilir soru sayıları.
   - `Net = Doğru − (Yanlış / 3)` formülü ile otomatik hesaplama (boşlar neti azaltmaz).
   - Negatif değer ve soru sayısı aşımı engeli, mükerrer deneme kaydı uyarısı.
3. **5 Sekmeli Deneme Ayrıntı Ekranı:**
   - `1. Sonuçlar` • `2. Yanlışlar` • `3. Boşlar` • `4. Konu Analizi` • `5. Gelişim`
   - Her ders içinde yanlış ve boş sorular ayrı listelenir; fotoğraf yüklenmiş olması sorunun çözüldüğü anlamına gelmez.
4. **Fotoğraf Arşivleme, Kırpma ve Dijital Yanlış Defteri:**
   - Telefon kamerasından çekim veya galeriden çoklu fotoğraf yükleme.
   - Tek fotoğrafta birden fazla soru varsa soru bazında kırpma (`CropRect`), 90° döndürme, yakınlaştırma (1x–3x) ve aynı soruya birden fazla görüntü ekleme.
   - 9 farklı filtre (Ders, Konu, Alt konu, Deneme, Tarih aralığı, Yanlış/Boş, Tekrar durumu, Son çözüm sonucu, Hata nedeni).
5. **Tekrarlayan Hata ve Konu Eksikliği Motoru:**
   - MEB 8. Sınıf öğretim programına uyumlu sürümlenebilir ders, ünite, konu ve alt konu sözlüğü (`MEB-8-LGS-2024-2026-v1`).
   - Konu belirleme öncelik sırası: `1. Kullanıcı seçimi` → `2. Yapay zekâ önerisi` → `3. Metin/anahtar kelime sınıflandırması` → `4. Konu belirlenmedi`.
   - Tek seferlik hata ile birden fazla denemede tekrarlayan ciddi konu eksiğini ayırt eden ağırlıklı öncelik modeli (`0–100`).
6. **Akıllı Tekrar Sistemi (1–3–7 Gün) ve Kişiselleştirilmiş Haftalık Çalışma Planı:**
   - `Yardımsız doğru çözdüm`, `İpucuyla çözdüm`, `Çözümü gördükten sonra anladım`, `Hâlâ çözemiyorum` seçenekleriyle bağımsız öğrenme takibi.
   - 5 kademeli öncelik sırasına ve öğrencinin haftalık çalışma süresine göre otomatik üretilen haftalık çalışma programı.
7. **Antalya Lise Veri Tabanı ve Karşılaştırma Asistanı:**
   - Antalya'daki Fen Liseleri, Anadolu Liseleri, Sosyal Bilimler Liseleri, Proje Anadolu İmam Hatip Liseleri ve Mesleki ve Teknik Anadolu Liselerinin (ATP) 2022–2025/2026 MEB 1. yerleştirme verileri.
   - Aynı okulun farklı programları (ör. Hazırlıklı vs. 4 Yıl, Siber Güvenlik vs. Bilişim) ayrı kayıtlar olarak tutulur; Yerel Yerleştirme (OBP) okulları merkezî sınav okullarından ayrı sınıflandırılır.
8. **Raporlama, Yedekleme ve Dışa Aktarma:**
   - Fotoğraflı veya sade **PDF Gelişim Raporu**, Türkçe karakter destekli (UTF-8 BOM) **CSV / Excel** dışa aktarma, çoklu fotoğraflar için **Ayrı Fotoğraf Ek Paketi** ve tam **JSON Yedekleme / Geri Yükleme**.

---

## 2. Yerel Çalıştırma Talimatları

### Gereksinimler
- Node.js `v18+` veya `v20+`
- npm `v9+`

### Kurulum ve Başlatma

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın (Hem ön yüz hem de /api/ai/* uç noktaları aynı portta çalışır)
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

### Testleri ve Üretim Derlemesini Çalıştırma

```bash
# Otomatik kabul testlerini çalıştırma (Vitest + IndexedDB simülasyonu)
npm test

# TypeScript tip kontrolü ve üretim derlemesi
npm run build

# Üretim derlemesini önizleme
npm run preview
```

---

## 3. Yapay Zekâ Soru Analizi Yapılandırması (İsteğe Bağlı)

API anahtarları **asla** istemci (tarayıcı) koduna yazılmaz. Görüntü analizi yalnızca sunucu tarafında (`server/aiHandler.ts`) çalışır.

1. Proje kök dizininde `.env.example` dosyasını `.env` adıyla kopyalayın:
   ```env
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   ```
   *(Alternatif olarak `OPENAI_API_KEY=sk-...` tanımlayabilirsiniz.)*
2. Sunucuyu yeniden başlatın.
3. `.env` dosyasında anahtar tanımlı değilse uygulama sahte yapay zekâ sonucu üretmez; fotoğraf yükleme, kırpma, metinden konu önerme ve manuel konu etiketleme çevrimdışı olarak eksiksiz çalışmaya devam eder.

---

## 4. Android Telefona Yükleme (PWA) ve Kullanım

1. Bilgisayarınız ve Android telefonunuz aynı Wi-Fi ağındayken `npm run dev` çıktısındaki **Network** adresini (ör. `http://192.168.1.X:5173`) Android telefonunuzda **Chrome** ile açın (veya üretim sunucusuna dağıtın).
2. Chrome sağ üst menüsünden **"Ana ekrana ekle" / "Uygulamayı yükle"** seçeneğine dokunun.
3. Uygulama telefonunuza bağımsız bir mobil uygulama gibi kurulur ve `Service Worker` + `IndexedDB` sayesinde internet kesildiğinde dahi kayıtlı denemeleri ve soru fotoğraflarını açmaya devam eder.
