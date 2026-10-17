import {
  CurriculumTopic,
  ErrorReasonCode,
  ErrorReasonDefinition,
  SubjectDefinition,
  SubjectId,
} from '../types/models';

export const CURRENT_CURRICULUM_VERSION = 'MEB-8-LGS-2024-2026-v1';

export const ANTALYA_DISTRICTS: string[] = [
  'Muratpaşa',
  'Konyaaltı',
  'Kepez',
  'Döşemealtı',
  'Aksu',
  'Alanya',
  'Manavgat',
  'Serik',
  'Kemer',
  'Kumluca',
  'Finike',
  'Korkuteli',
  'Elmalı',
  'Kaş',
  'Demre',
  'Gazipaşa',
  'Akseki',
  'İbradı',
  'Gündoğmuş',
];

export const LGS_SUBJECTS: SubjectDefinition[] = [
  {
    id: 'turkce',
    name: 'Türkçe',
    shortName: 'Türkçe',
    defaultQuestionCount: 20,
    coefficientWeight: 4,
    category: 'sozel',
    color: '#0284c7',
  },
  {
    id: 'matematik',
    name: 'Matematik',
    shortName: 'Matematik',
    defaultQuestionCount: 20,
    coefficientWeight: 4,
    category: 'sayisal',
    color: '#1e3c78',
  },
  {
    id: 'fen',
    name: 'Fen Bilimleri',
    shortName: 'Fen Bil.',
    defaultQuestionCount: 20,
    coefficientWeight: 4,
    category: 'sayisal',
    color: '#1f8a9a',
  },
  {
    id: 'inkilap',
    name: 'T.C. İnkılap Tarihi ve Atatürkçülük',
    shortName: 'İnkılap',
    defaultQuestionCount: 10,
    coefficientWeight: 1,
    category: 'sozel',
    color: '#d97706',
  },
  {
    id: 'din',
    name: 'Din Kültürü ve Ahlak Bilgisi',
    shortName: 'Din K.',
    defaultQuestionCount: 10,
    coefficientWeight: 1,
    category: 'sozel',
    color: '#059669',
  },
  {
    id: 'ingilizce',
    name: 'İngilizce',
    shortName: 'İngilizce',
    defaultQuestionCount: 10,
    coefficientWeight: 1,
    category: 'sozel',
    color: '#7c3aed',
  },
];

export const SUBJECT_MAP: Record<SubjectId, SubjectDefinition> = LGS_SUBJECTS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<SubjectId, SubjectDefinition>
);

export const ERROR_REASONS: ErrorReasonDefinition[] = [
  {
    code: 'konu_eksigi',
    label: 'Konu eksiği',
    description: 'Temel kavram, formül veya kazanım bilgisi henüz tam oturmamış.',
    recommendedAction:
      'Önce MEB kazanım özetinden temel konu anlatımını tekrar et, ardından kolaydan zora kazanım kavrama testleri çöz.',
  },
  {
    code: 'islem_hatasi',
    label: 'İşlem hatası',
    description: 'Yöntem doğru kuruldu ancak dört işlem, işaret veya sadeleştirmede hata yapıldı.',
    recommendedAction:
      'İşlemleri kafadan yapmak yerine adım adım kâğıda yazarak ilerle; son adımda sağlamasını yapma alışkanlığı kazan.',
  },
  {
    code: 'yanlis_okuma',
    label: 'Soruyu yanlış okuma',
    description: 'Soru kökündeki olumsuz ifadeler (değildir, ulaşılamaz) veya verilenler yanlış okundu.',
    recommendedAction:
      'Soru kökündeki anahtar kelimelerin ve birimlerin altını çiz; şıklara geçmeden önce "Benden tam olarak ne isteniyor?" diye kontrol et.',
  },
  {
    code: 'dikkat_hatasi',
    label: 'Dikkat hatası',
    description: 'Bilinen bir soruda dalgınlık, şık kaydırma veya grafik değerini yanlış görme.',
    recommendedAction:
      'Tablo ve grafik sorularında satır-sütun eşleştirmesini kalem ucuyla işaretle; bulduğun sonucu şıkla tekrar eşleştir.',
  },
  {
    code: 'sure_yetmedi',
    label: 'Süre yetmedi',
    description: 'Süre baskısı nedeniyle soruya yeterince vakit ayrılamadı veya acele edildi.',
    recommendedAction:
      'Turlama tekniği uygula: 90 saniyede ilerleyemediğin soruya işaret koyup geç, ikinci turda dön; kronometreli branş denemesi çöz.',
  },
  {
    code: 'cozum_yontemi_bulamama',
    label: 'Çözüm yöntemini bulamama',
    description: 'Konu biliniyor ancak yeni nesil/beceri temelli soruda nasıl başlanacağı kurgulanamadı.',
    recommendedAction:
      'Soruda verilenleri madde madde listele, şekil üzerinde bilgileri yerleştir ve MEB örnek sorularındaki benzer çözüm kalıplarını incele.',
  },
  {
    code: 'bilgiyi_unutma',
    label: 'Bilgiyi unutma',
    description: 'Daha önce çalışılmış bir kavram, kural veya kelime sınav anında hatırlanamadı.',
    recommendedAction:
      'Aralıklı tekrar (1-3-7 gün) kartlarını kullan ve unutulan kuralı kısa not olarak yanlış defterinde vurgula.',
  },
  {
    code: 'diger',
    label: 'Diğer',
    description: 'Farklı bir sınav stratejisi veya özel durum kaynaklı hata.',
    recommendedAction:
      'Soru notuna hatanın özel sebebini yaz ve bir sonraki deneme öncesi bu notu gözden geçir.',
  },
];

export const ERROR_REASON_MAP: Record<ErrorReasonCode, ErrorReasonDefinition> =
  ERROR_REASONS.reduce((acc, r) => {
    acc[r.code] = r;
    return acc;
  }, {} as Record<ErrorReasonCode, ErrorReasonDefinition>);

export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  // ==================== MATEMATİK (8. SINIF MEB MÜFREDATI) ====================
  {
    id: 'mat-carpanlar-katlar',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 1,
    unitName: '1. Ünite: Çarpanlar ve Katlar / Üslü İfadeler',
    topicName: 'Çarpanlar ve Katlar',
    subtopics: [
      'Pozitif Tam Sayıların Çarpanları ve Asal Çarpanlar',
      'EBOB ve EKOK Hesaplama',
      'EBOB ve EKOK Problemleri',
      'Aralarında Asal Sayılar',
    ],
    keywords: ['çarpan', 'bölen', 'asal', 'ebob', 'ekok', 'aralarında asal', 'ortak kat', 'ortak bölen'],
    importanceWeight: 1.4,
  },
  {
    id: 'mat-uslu-ifadeler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 1,
    unitName: '1. Ünite: Çarpanlar ve Katlar / Üslü İfadeler',
    topicName: 'Üslü İfadeler',
    subtopics: [
      'Tam Sayıların Tam Sayı Kuvvetleri ve Negatif Üs',
      'Üslü İfadelerle Çarpma ve Bölme İşlemleri',
      'Ondalık Gösterimlerin 10’un Kuvvetleriyle Çözümlenmesi',
      'Çok Büyük ve Çok Küçük Sayılar / Bilimsel Gösterim',
    ],
    keywords: ['üslü', 'kuvvet', 'taban', 'üs', 'bilimsel gösterim', 'çözümleme', '10\'un kuvveti'],
    importanceWeight: 1.45,
  },
  {
    id: 'mat-karekoklu-ifadeler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 2,
    unitName: '2. Ünite: Kareköklü İfadeler / Veri Analizi',
    topicName: 'Kareköklü İfadeler',
    subtopics: [
      'Tam Kare Sayılar ve Karekök Alma (Yaklaşık Değer)',
      'Kareköklü Bir İfadeyi a√b Şeklinde Yazma ve Sıralama',
      'Kareköklü İfadelerle Çarpma ve Bölme İşlemleri',
      'Kareköklü İfadelerle Toplama ve Çıkarma İşlemleri',
      'Ondalık İfadelerin Karekökü ve Gerçek (Reel) Sayılar',
    ],
    keywords: ['karekök', 'tam kare', 'kök', 'yaklaşık değer', 'gerçek sayılar', 'irrasyonel', '√'],
    importanceWeight: 1.5,
  },
  {
    id: 'mat-veri-analizi',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 2,
    unitName: '2. Ünite: Kareköklü İfadeler / Veri Analizi',
    topicName: 'Veri Analizi',
    subtopics: [
      'Çizgi ve Sütun Grafiği Yorumlama',
      'Daire Grafiği ve Merkez Açı Hesaplamaları',
      'Grafik Türleri Arasında Dönüşüm Yapma',
    ],
    keywords: ['veri analizi', 'daire grafiği', 'sütun grafiği', 'çizgi grafiği', 'merkez açı', '360 derece'],
    importanceWeight: 1.35,
  },
  {
    id: 'mat-olasilik',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 3,
    unitName: '3. Ünite: Basit Olayların Olma Olasılığı / Cebirsel İfadeler',
    topicName: 'Olasılık',
    subtopics: [
      'Olası Durumları Belirleme',
      'Daha Fazla, Eşit, Daha Az Olasılıklı Olaylar',
      'Kesin ve İmkânsız Olay',
      'Basit Bir Olayın Olma Olasılığı Hesabı',
    ],
    keywords: ['olasılık', 'olası durum', 'imkansız olay', 'kesin olay', 'eş olasılık', 'rastgele'],
    importanceWeight: 1.25,
  },
  {
    id: 'mat-cebirsel-ifadeler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 3,
    unitName: '3. Ünite: Basit Olayların Olma Olasılığı / Cebirsel İfadeler',
    topicName: 'Cebirsel İfadeler ve Özdeşlikler',
    subtopics: [
      'Cebirsel İfadelerin Çarpımı ve Modelleme',
      'Tam Kare ve İki Kare Farkı Özdeşlikleri',
      'Cebirsel İfadeleri Çarpanlara Ayırma',
    ],
    keywords: ['cebirsel', 'özdeşlik', 'iki kare farkı', 'tam kare özdeşliği', 'çarpanlara ayırma', 'terim', 'katsayı'],
    importanceWeight: 1.4,
  },
  {
    id: 'mat-dogrusal-denklemler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 4,
    unitName: '4. Ünite: Doğrusal Denklemler / Eşitsizlikler',
    topicName: 'Doğrusal Denklemler',
    subtopics: [
      'Birinci Dereceden Bir Bilinmeyenli Denklemler (Rasyonel Katsayılı)',
      'Koordinat Sistemi ve Sıralı İkililer',
      'Doğrusal İlişkiler ve Doğru Grafikleri',
      'Eğim ve Doğrusal Denklem Problemleri',
    ],
    keywords: ['doğrusal denklem', 'koordinat', 'apsis', 'ordinat', 'orijin', 'eğim', 'dikey', 'yatay', 'grafik'],
    importanceWeight: 1.45,
  },
  {
    id: 'mat-esitsizlikler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 4,
    unitName: '4. Ünite: Doğrusal Denklemler / Eşitsizlikler',
    topicName: 'Eşitsizlikler',
    subtopics: [
      'Eşitsizlik İfadeleri ve Sayı Doğrusunda Gösterim',
      'Birinci Dereceden Bir Bilinmeyenli Eşitsizliklerin Çözümü',
      'Günlük Hayat Eşitsizlik Problemleri',
    ],
    keywords: ['eşitsizlik', 'küçüktür', 'büyüktür', 'en az', 'en fazla', 'sayı doğrusu'],
    importanceWeight: 1.25,
  },
  {
    id: 'mat-ucgenler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 5,
    unitName: '5. Ünite: Üçgenler / Eşlik ve Benzerlik',
    topicName: 'Üçgenler',
    subtopics: [
      'Üçgende Kenarortay, Açıortay ve Yükseklik',
      'Üçgen Eşitsizliği (Kenar Bağıntıları)',
      'Üçgende Açı-Kenar İlişkileri',
      'Yeterli Elemanı Verilen Üçgeni Çizme',
      'Pisagor Bağıntısı ve Dik Üçgen Uygulamaları',
    ],
    keywords: ['üçgen', 'kenarortay', 'açıortay', 'yükseklik', 'üçgen eşitsizliği', 'pisagor', 'hipotenüs', 'dik üçgen'],
    importanceWeight: 1.4,
  },
  {
    id: 'mat-eslik-benzerlik',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 5,
    unitName: '5. Ünite: Üçgenler / Eşlik ve Benzerlik',
    topicName: 'Eşlik ve Benzerlik',
    subtopics: [
      'Çokgenlerde Eşlik ve Benzerlik Kavramı',
      'Benzerlik Oranı, Çevre ve Alan İlişkisi',
      'Üçgenlerde Benzerlik Uygulamaları',
    ],
    keywords: ['eşlik', 'benzerlik', 'benzerlik oranı', 'eş üçgen', 'benzer çokgen'],
    importanceWeight: 1.3,
  },
  {
    id: 'mat-geometrik-donusumler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 6,
    unitName: '6. Ünite: Dönüşüm Geometrisi / Geometrik Cisimler',
    topicName: 'Geometrik Dönüşümler',
    subtopics: [
      'Koordinat Düzleminde Öteleme',
      'Koordinat Düzleminde Yansıma (Simetri)',
      'Ardışık Öteleme ve Yansıma Dönüşümleri',
    ],
    keywords: ['dönüşüm', 'öteleme', 'yansıma', 'simetri', 'görüntü koordinatı'],
    importanceWeight: 1.15,
  },
  {
    id: 'mat-geometrik-cisimler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'matematik',
    gradeLevel: 8,
    unitNumber: 6,
    unitName: '6. Ünite: Dönüşüm Geometrisi / Geometrik Cisimler',
    topicName: 'Geometrik Cisimler',
    subtopics: [
      'Dik Prizmalar ve Açınımları',
      'Dik Dairesel Silindir (Yüzey Alanı ve Hacmi)',
      'Dik Piramit ve Dik Koni (Temel Elemanlar ve Açınım)',
    ],
    keywords: ['prizma', 'silindir', 'piramit', 'koni', 'hacim', 'yanal alan', 'açınım'],
    importanceWeight: 1.25,
  },

  // ==================== TÜRKÇE (8. SINIF MEB MÜFREDATI) ====================
  {
    id: 'tr-sozcukte-anlam',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'turkce',
    gradeLevel: 8,
    unitNumber: 1,
    unitName: 'Anlam Bilgisi',
    topicName: 'Sözcükte ve Söz Öbeklerinde Anlam',
    subtopics: [
      'Gerçek, Mecaz ve Terim Anlam',
      'Sözcükler Arası Anlam İlişkileri (Eş, Zıt, Yakın Anlam)',
      'Deyimler, Atasözleri ve Özdeyişler',
      'Söz Sanatları (Benzetme, Kişileştirme, Konuşturma, Karşıtlık, Abartma)',
    ],
    keywords: ['sözcükte anlam', 'deyim', 'atasözü', 'mecaz', 'terim anlam', 'söz sanatı', 'kişileştirme'],
    importanceWeight: 1.3,
  },
  {
    id: 'tr-cumlede-anlam',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'turkce',
    gradeLevel: 8,
    unitNumber: 1,
    unitName: 'Anlam Bilgisi',
    topicName: 'Cümlede Anlam',
    subtopics: [
      'Neden-Sonuç, Amaç-Sonuç ve Koşul-Sonuç Cümleleri',
      'Öznel ve Nesnel Yargılar',
      'Örtülü Anlam, Karşılaştırma ve Benzetme',
      'Cümle Birleştirme ve Cümle Yorumlama',
    ],
    keywords: ['cümlede anlam', 'amaç-sonuç', 'neden-sonuç', 'koşul', 'öznel', 'nesnel', 'örtülü anlam'],
    importanceWeight: 1.35,
  },
  {
    id: 'tr-paragrafta-anlam',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'turkce',
    gradeLevel: 8,
    unitNumber: 2,
    unitName: 'Paragraf ve Metin Analizi',
    topicName: 'Paragrafta Anlam ve Yapı',
    subtopics: [
      'Paragrafta Ana Düşünce, Konu ve Başlık',
      'Yardımcı Düşünceler (Değinilmemiştir / Ulaşılamaz)',
      'Paragrafın Yapısı (Akışı Bozan Cümle, Paragraf Tamamlama, İkiye Bölme)',
      'Anlatım Biçimleri ve Düşünceyi Geliştirme Yolları',
      'Metin Türleri (Deneme, Makale, Fıkra, Söyleşi, Anı, Hikâye)',
    ],
    keywords: ['paragraf', 'ana düşünce', 'yardımcı düşünce', 'değinilmemiştir', 'anlatım biçimi', 'metin türü'],
    importanceWeight: 1.5,
  },
  {
    id: 'tr-sozel-mantik-gorsel',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'turkce',
    gradeLevel: 8,
    unitNumber: 3,
    unitName: 'Sözel Mantık ve Görsel Okuma',
    topicName: 'Sözel Mantık, Muhakeme ve Görsel/Tablo Yorumlama',
    subtopics: [
      'Sözel Mantık ve Sıralama/Eşleştirme Kurguları',
      'Grafik, Tablo ve İnfografik Yorumlama',
      'Görsel Okuma ve Harita/Sembol Çözümleme',
    ],
    keywords: ['sözel mantık', 'görsel okuma', 'infografik', 'tablo yorumlama', 'muhakeme'],
    importanceWeight: 1.5,
  },
  {
    id: 'tr-fiilimsiler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'turkce',
    gradeLevel: 8,
    unitNumber: 4,
    unitName: 'Dil Bilgisi',
    topicName: 'Fiilimsiler (Eylemsiler)',
    subtopics: [
      'İsim-Fiil (Mastar)',
      'Sıfat-Fiil (Ortaç) ve Adlaşmış Sıfat-Fiil',
      'Zarf-Fiil (Bağ-Fiil / Ulaç)',
      'Fiilimsi ile Çekimli Fiil ve Kalıcı İsim Ayrımı',
    ],
    keywords: ['fiilimsi', 'eylemsi', 'isim-fiil', 'sıfat-fiil', 'zarf-fiil', 'kalıcı isim'],
    importanceWeight: 1.35,
  },
  {
    id: 'tr-cumlenin-ogeleri',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'turkce',
    gradeLevel: 8,
    unitNumber: 4,
    unitName: 'Dil Bilgisi',
    topicName: 'Cümlenin Ögeleri ve Cümle Türleri',
    subtopics: [
      'Temel Ögeler (Yüklem ve Özne)',
      'Yardımcı Ögeler (Nesne, Yer Tamlayıcısı, Zarf Tamlayıcısı)',
      'Cümlede Vurgu ve Ara Söz',
      'Cümle Türleri (Yapısına, Yüklemin Türüne, Yerine ve Anlamına Göre)',
    ],
    keywords: ['cümlenin ögeleri', 'yüklem', 'özne', 'nesne', 'yer tamlayıcısı', 'zarf tamlayıcısı', 'cümle türleri'],
    importanceWeight: 1.35,
  },
  {
    id: 'tr-fiilde-cati-anlatim',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'turkce',
    gradeLevel: 8,
    unitNumber: 4,
    unitName: 'Dil Bilgisi',
    topicName: 'Fiilde Çatı ve Anlatım Bozuklukları',
    subtopics: [
      'Öznesine Göre Fiiller (Etken, Edilgen)',
      'Nesnesine Göre Fiiller (Geçişli, Geçişsiz)',
      'Yapısal (Dil Bilgisi Kaynaklı) Anlatım Bozuklukları',
    ],
    keywords: ['fiilde çatı', 'etken', 'edilgen', 'geçişli', 'geçişsiz', 'anlatım bozukluğu', 'özne-yüklem uyuşmazlığı'],
    importanceWeight: 1.2,
  },
  {
    id: 'tr-yazim-noktalama',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'turkce',
    gradeLevel: 8,
    unitNumber: 5,
    unitName: 'Yazım ve Noktalama',
    topicName: 'Yazım Kuralları ve Noktalama İşaretleri',
    subtopics: [
      'Büyük Harflerin, Sayıların ve Kısaltmaların Yazımı',
      'de/da, ki ve mi Ek/Bağlaçlarının Yazımı',
      'Birleşik Kelimelerin Yazımı',
      'Noktalama İşaretleri (Virgül, Noktalı Virgül, İki Nokta, Tırnak vb.)',
    ],
    keywords: ['yazım kuralları', 'noktalama', 'virgül', 'büyük harf', 'yazım yanlışı'],
    importanceWeight: 1.35,
  },

  // ==================== FEN BİLİMLERİ (8. SINIF MEB MÜFREDATI) ====================
  {
    id: 'fen-mevsimler-iklim',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'fen',
    gradeLevel: 8,
    unitNumber: 1,
    unitName: '1. Ünite: Mevsimler ve İklim',
    topicName: 'Mevsimlerin Oluşumu ve İklim / Hava Hareketleri',
    subtopics: [
      'Dünya’nın Eksen Eğikliği, Dolanma Hareketi ve Mevsimler',
      'Birim Yüzeye Düşen Işık Enerjisi ve Gece-Gündüz Süreleri',
      'Yüksek ve Alçak Basınç Alanları / Rüzgâr Oluşumu',
      'İklim ve Hava Olayları Farkı / Küresel İklim Değişikliği',
    ],
    keywords: ['mevsimler', 'eksen eğikliği', '21 haziran', '21 aralık', 'ekinoks', 'alçak basınç', 'yüksek basınç', 'rüzgar', 'iklim'],
    importanceWeight: 1.4,
  },
  {
    id: 'fen-dna-genetik-kod',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'fen',
    gradeLevel: 8,
    unitNumber: 2,
    unitName: '2. Ünite: DNA ve Genetik Kod',
    topicName: 'DNA, Kalıtım, Mutasyon, Modifikasyon ve Biyoteknoloji',
    subtopics: [
      'DNA’nın Yapısı (Kromozom, DNA, Gen, Nükleotid) ve Kendini Eşlemesi',
      'Kalıtım ve Çaprazlamalar (Baskın/Çekinik Gen, Fenotip, Genotip, Akraba Evliliği)',
      'Mutasyon ve Modifikasyon Karşılaştırması',
      'Adaptasyon ve Doğal Seçilim',
      'Biyoteknoloji ve Genetik Mühendisliği Uygulamaları',
    ],
    keywords: ['dna', 'nükleotid', 'kromozom', 'kalıtım', 'çaprazlama', 'mutasyon', 'modifikasyon', 'adaptasyon', 'biyoteknoloji'],
    importanceWeight: 1.5,
  },
  {
    id: 'fen-basinc',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'fen',
    gradeLevel: 8,
    unitNumber: 3,
    unitName: '3. Ünite: Basınç',
    topicName: 'Katı, Sıvı ve Gaz Basıncı',
    subtopics: [
      'Katı Basıncını Etkileyen Değişkenler (Ağırlık ve Yüzey Alanı)',
      'Sıvı Basıncı (Derinlik, Yoğunluk) ve Pascal Prensibi',
      'Açık Hava (Gaz) Basıncı ve Toriçelli Deneyi',
      'Basıncın Günlük Yaşam ve Teknolojideki Uygulamaları',
    ],
    keywords: ['basınç', 'katı basıncı', 'sıvı basıncı', 'açık hava basıncı', 'pascal', 'yüzey alanı', 'yoğunluk', 'derinlik'],
    importanceWeight: 1.45,
  },
  {
    id: 'fen-madde-endustri',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'fen',
    gradeLevel: 8,
    unitNumber: 4,
    unitName: '4. Ünite: Madde ve Endüstri',
    topicName: 'Periyodik Sistem, Kimyasal Tepkimeler, Asit-Baz ve Isı',
    subtopics: [
      'Periyodik Sistem (Metal, Ametal, Yarı Metal, Soygaz Özellikleri)',
      'Fiziksel ve Kimyasal Değişimler',
      'Kimyasal Tepkimeler ve Kütlenin Korunumu',
      'Asitler ve Bazlar (pH Ölçeği, Ayıraçlar, Asit Yağmurları)',
      'Maddenin Isı ile Etkileşimi (Öz Isı, Hal Değişimi ve Isınma Grafikleri)',
    ],
    keywords: ['periyodik', 'kimyasal tepkime', 'asit', 'baz', 'ph', 'öz ısı', 'hal değişimi', 'erime ısısı'],
    importanceWeight: 1.5,
  },
  {
    id: 'fen-basit-makineler',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'fen',
    gradeLevel: 8,
    unitNumber: 5,
    unitName: '5. Ünite: Basit Makineler',
    topicName: 'Basit Makineler',
    subtopics: [
      'Sabit ve Hareketli Makaralar / Palangalar',
      'Kaldıraç Türleri (Destek, Yük ve Kuvvet Konumu)',
      'Eğik Düzlem ve Çıkrık',
      'Dişli Çarklar, Kasnaklar ve Vida / Bileşik Makineler',
    ],
    keywords: ['basit makine', 'makara', 'palanga', 'kaldıraç', 'eğik düzlem', 'çıkrık', 'dişli', 'kuvvetten kazanç'],
    importanceWeight: 1.4,
  },
  {
    id: 'fen-enerji-donusumleri',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'fen',
    gradeLevel: 8,
    unitNumber: 6,
    unitName: '6. Ünite: Enerji Dönüşümleri ve Çevre Bilimi',
    topicName: 'Besin Zinciri, Fotosentez, Solunum ve Madde Döngüleri',
    subtopics: [
      'Besin Zinciri ve Ekoloji Piramidi',
      'Fotosentez ve Fotosentez Hızını Etkileyen Faktörler',
      'Oksijenli, Oksijensiz Solunum ve Fermantasyon',
      'Madde Döngüleri (Su, Karbon, Azot, Oksijen) ve Sürdürülebilir Kalkınma',
    ],
    keywords: ['besin zinciri', 'fotosentez', 'solunum', 'fermantasyon', 'madde döngüsü', 'azot döngüsü', 'karbon ayak izi'],
    importanceWeight: 1.4,
  },
  {
    id: 'fen-elektrik-yukleri',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'fen',
    gradeLevel: 8,
    unitNumber: 7,
    unitName: '7. Ünite: Elektrik Yükleri ve Elektrik Enerjisi',
    topicName: 'Elektrik Yükleri, Elektriklenme ve Enerji Dönüşümü',
    subtopics: [
      'Elektriklenme Çeşitleri (Sürtünme, Dokunma, Etki ile Elektriklenme)',
      'Elektroskop ve Topraklama',
      'Elektrik Enerjisinin Isı, Işık ve Hareket Enerjisine Dönüşümü / Sigorta',
    ],
    keywords: ['elektrik yükü', 'elektriklenme', 'elektroskop', 'topraklama', 'negatif yük', 'pozitif yük'],
    importanceWeight: 1.3,
  },

  // ==================== T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK ====================
  {
    id: 'ink-bir-kahraman-doguyor',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'inkilap',
    gradeLevel: 8,
    unitNumber: 1,
    unitName: '1. Ünite: Bir Kahraman Doğuyor',
    topicName: 'Uyanan Avrupa, Sarsılan Osmanlı ve Mustafa Kemal’in Hayatı',
    subtopics: [
      'Avrupa’daki Gelişmeler ve Osmanlı’ya Etkileri / Fikir Akımları',
      'Mustafa Kemal’in Eğitim ve Askerlik Hayatı',
      'Mustafa Kemal’in Fikir Hayatını Etkileyen Kişi ve Olaylar',
    ],
    keywords: ['bir kahraman doğuyor', 'fikir akımları', 'osmanlıcılık', 'trablusgarp', 'sofyadaki', 'manastır'],
    importanceWeight: 1.25,
  },
  {
    id: 'ink-milli-uyanis',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'inkilap',
    gradeLevel: 8,
    unitNumber: 2,
    unitName: '2. Ünite: Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar',
    topicName: 'I. Dünya Savaşı, Mondros, Cemiyetler, Kongreler ve TBMM',
    subtopics: [
      'I. Dünya Savaşı ve Osmanlı’nın Savaştığı Cepheler',
      'Mondros Ateşkes Antlaşması, İşgaller ve Cemiyetler / Kuvâ-yı Milliye',
      'Genelgeler ve Kongreler (Havza, Amasya, Erzurum, Sivas)',
      'Misakımillî, TBMM’nin Açılışı ve Sevr Antlaşması',
    ],
    keywords: ['mondros', 'kuvayımilliye', 'erzurum kongresi', 'sivas kongresi', 'amasya genelgesi', 'misakımilli', 'sevr'],
    importanceWeight: 1.45,
  },
  {
    id: 'ink-ya-istiklal-ya-olum',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'inkilap',
    gradeLevel: 8,
    unitNumber: 3,
    unitName: '3. Ünite: Millî Bir Destan: Ya İstiklal Ya Ölüm',
    topicName: 'Kurtuluş Savaşı Cepheleri, Maarif Kongresi ve Lozan',
    subtopics: [
      'Doğu ve Güney Cepheleri (Gümrü Antlaşması, Ankara Antlaşması)',
      'Batı Cephesi: I. ve II. İnönü, Kütahya-Eskişehir Savaşları ve Maarif Kongresi',
      'Tekâlif-i Milliye Emirleri, Sakarya Meydan Muharebesi ve Büyük Taarruz',
      'Mudanya Ateşkes Antlaşması ve Lozan Barış Antlaşması',
    ],
    keywords: ['doğu cephesi', 'güney cephesi', 'inönü', 'sakarya', 'büyük taarruz', 'tekalifimilliye', 'lozan', 'mudanya'],
    importanceWeight: 1.45,
  },
  {
    id: 'ink-ataturkculuk-inkilaplar',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'inkilap',
    gradeLevel: 8,
    unitNumber: 4,
    unitName: '4. Ünite: Atatürkçülük ve Çağdaşlaşan Türkiye',
    topicName: 'Atatürk İlkeleri ve Siyasi, Hukuk, Eğitim, Ekonomi İnkılapları',
    subtopics: [
      'Atatürk İlkeleri (Cumhuriyetçilik, Milliyetçilik, Halkçılık, Devletçilik, Laiklik, İnkılapçılık)',
      'Siyasi ve Hukuk Alanında Yapılan İnkılaplar (Cumhuriyetin İlanı, Medeni Kanun)',
      'Eğitim, Kültür ve Toplumsal Alanda İnkılaplar (Tevhid-i Tedrisat, Harf İnkılabı)',
      'Ekonomi ve Sağlık Alanındaki Gelişmeler (İzmir İktisat Kongresi, Kabotaj Kanunu)',
    ],
    keywords: ['atatürk ilkeleri', 'cumhuriyetçilik', 'halkçılık', 'devletçilik', 'laiklik', 'medeni kanun', 'tevhiditedrisat', 'kabotaj'],
    importanceWeight: 1.5,
  },
  {
    id: 'ink-demokratiklesme-dis-politika',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'inkilap',
    gradeLevel: 8,
    unitNumber: 5,
    unitName: '5-7. Ünite: Demokratikleşme ve Atatürk Dönemi Dış Politika',
    topicName: 'Çok Partili Hayat Denemeleri ve Atatürk Dönemi Türk Dış Politikası',
    subtopics: [
      'Çok Partili Hayata Geçiş Denemeleri ve Cumhuriyete Yönelik Tehditler',
      'Türk Dış Politikasının Temel İlkeleri, Musul, Montrö, Balkan ve Sadabat Paktları, Hatay',
      'Atatürk’ün Vefatı ve II. Dünya Savaşı Türkiye’si',
    ],
    keywords: ['çok partili', 'terakkiperver', 'serbest cumhuriyet', 'montrö', 'balkan antantı', 'sadabat', 'hatay'],
    importanceWeight: 1.3,
  },

  // ==================== DİN KÜLTÜRÜ VE AHLAK BİLGİSİ ====================
  {
    id: 'din-kader-inanci',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'din',
    gradeLevel: 8,
    unitNumber: 1,
    unitName: '1. Ünite: Kader İnancı',
    topicName: 'Kader ve Kaza İnancı / Evrendeki Yasalar',
    subtopics: [
      'Kader ve Kaza Kavramları',
      'Evrendeki Yasalar (Fiziksel, Biyolojik ve Toplumsal Yasalar - Sünnetullah)',
      'İnsanın İradesi, Emek, Rızık, Ömür, Ecel ve Tevekkül',
      'Hz. Musa (a.s.) ve Ayetel Kürsi Anlamı',
    ],
    keywords: ['kader', 'kaza', 'fiziksel yasa', 'biyolojik yasa', 'toplumsal yasa', 'tevekkül', 'külli irade', 'cüzi irade', 'ayetel kürsi'],
    importanceWeight: 1.5,
  },
  {
    id: 'din-zekat-sadaka',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'din',
    gradeLevel: 8,
    unitNumber: 2,
    unitName: '2. Ünite: Zekât ve Sadaka',
    topicName: 'Paylaşma, Zekât, Sadaka, İnfak ve Vakıf Kültürü',
    subtopics: [
      'İslam’ın Paylaşma ve Yardımlaşmaya Verdiği Önem',
      'Zekât İbadeti (Nisap Miktarı, Kimlere Verilir, Malların Zekât Oranları)',
      'Sadaka, Sadaka-i Cariye ve الفطر (Fıtır) Sadakası',
      'Hz. Şuayb (a.s.) ve Maûn Suresi',
    ],
    keywords: ['zekat', 'sadaka', 'nisap', 'öşür', 'sadaka-i cariye', 'fitre', 'infak', 'maun suresi'],
    importanceWeight: 1.45,
  },
  {
    id: 'din-din-ve-hayat',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'din',
    gradeLevel: 8,
    unitNumber: 3,
    unitName: '3. Ünite: Din ve Hayat',
    topicName: 'Din, Birey, Toplum ve İslam’ın Koruduğu 5 Temel Esas',
    subtopics: [
      'Din-Birey ve Din-Toplum İlişkisi',
      'Dinin Temel Gayesi: Can, Nesil, Akıl, Mal ve Din Güvenliği (Zarurat-ı Hamse)',
      'Hz. Yusuf (a.s.) ve Asr Suresi',
    ],
    keywords: ['zarurat-ı hamse', 'canın korunması', 'aklın korunması', 'neslin korunması', 'malın korunması', 'asr suresi'],
    importanceWeight: 1.35,
  },
  {
    id: 'din-hz-muhammedin-ornekligi',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'din',
    gradeLevel: 8,
    unitNumber: 4,
    unitName: '4. Ünite: Hz. Muhammed’in Örnekliği',
    topicName: 'Hz. Muhammed’in Ahlaki Özellikleri ve Örnek Davranışları',
    subtopics: [
      'Doğruluğu ve Güvenilir Kişiliği (Muhammedü’l-Emin)',
      'Merhameti, İstişareye Önem Vermesi, Kararlılığı ve Hakkı Gözetmesi',
      'Kureyş Suresi ve Anlamı',
    ],
    keywords: ['muhammedül emin', 'istişare', 'merhamet', 'emanet', 'kureyş suresi', 'hilful fudul'],
    importanceWeight: 1.3,
  },
  {
    id: 'din-kuran-ve-ozellikleri',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'din',
    gradeLevel: 8,
    unitNumber: 5,
    unitName: '5. Ünite: Kur’an-ı Kerim ve Özellikleri',
    topicName: 'İslam Dininin Temel Kaynakları ve Kur’an’ın Ana Konuları',
    subtopics: [
      'İslam Dininin Temel Kaynakları (Kur’an ve Sünnet)',
      'Kur’an-ı Kerim’in Ana Konuları (İnanç, İbadet, Ahlak, Muamelat, Kıssalar)',
      'Kur’an-ı Kerim’in Temel Özellikleri ve Hz. Nuh (a.s.)',
    ],
    keywords: ['kuranı kerim', 'sünnet', 'inanç', 'ibadet', 'muamelat', 'kıssa', 'furkan', 'şifa'],
    importanceWeight: 1.25,
  },

  // ==================== İNGİLİZCE (8. SINIF MEB MÜFREDATI) ====================
  {
    id: 'ing-friendship-teenlife',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'ingilizce',
    gradeLevel: 8,
    unitNumber: 1,
    unitName: 'Unit 1 & 2: Friendship / Teen Life',
    topicName: 'Friendship & Teen Life (Davet, Kabul/Ret ve Günlük Rutinler)',
    subtopics: [
      'Accepting and Refusing / Apologizing / Giving Explanations',
      'Personal Traits of a Good Friend (honest, generous, laid-back, tactful)',
      'Expressing Likes, Dislikes, Preferences (prefer / would rather) & Daily Routines',
    ],
    keywords: ['friendship', 'teen life', 'invitation', 'accept', 'refuse', 'count on', 'back up', 'prefer', 'fond of'],
    importanceWeight: 1.45,
  },
  {
    id: 'ing-kitchen-on-the-phone',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'ingilizce',
    gradeLevel: 8,
    unitNumber: 3,
    unitName: 'Unit 3 & 4: In The Kitchen / On The Phone',
    topicName: 'In The Kitchen & On The Phone (Yemek Tarifi ve Telefon İletişimi)',
    subtopics: [
      'Describing Simple Processes (First, Then, Next, Finally) & Cooking Methods',
      'Kitchen Tools and Ingredients',
      'Phone Conversations, Making/Taking Messages & Future Decisions (will)',
    ],
    keywords: ['kitchen', 'recipe', 'ingredient', 'slice', 'chop', 'boil', 'bake', 'on the phone', 'hold on', 'put through'],
    importanceWeight: 1.4,
  },
  {
    id: 'ing-internet-adventures',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'ingilizce',
    gradeLevel: 8,
    unitNumber: 5,
    unitName: 'Unit 5 & 6: The Internet / Adventures',
    topicName: 'The Internet & Adventures (İnternet Alışkanlıkları ve Macera Sporları)',
    subtopics: [
      'Internet Habits, Safety Rules & Making Excuses / Clarifications',
      'Extreme Sports & Comparisons (more exciting than, safer than, prefer X to Y)',
    ],
    keywords: ['internet', 'browser', 'attachment', 'upload', 'download', 'adventures', 'extreme sports', 'paragliding', 'rafting'],
    importanceWeight: 1.4,
  },
  {
    id: 'ing-tourism-chores',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'ingilizce',
    gradeLevel: 8,
    unitNumber: 7,
    unitName: 'Unit 7 & 8: Tourism / Chores',
    topicName: 'Tourism & Chores (Turizm Deneyimleri ve Ev İşleri/Sorumluluklar)',
    subtopics: [
      'Talking About Experiences (Have you ever...? / Present Perfect) & Tourist Attractions',
      'Household Chores, Obligations (must, have to, responsible for) & Rules',
    ],
    keywords: ['tourism', 'accommodation', 'all-inclusive', 'historic', 'chores', 'responsible for', 'in charge of', 'must', 'have to'],
    importanceWeight: 1.35,
  },
  {
    id: 'ing-science-natural-forces',
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    subjectId: 'ingilizce',
    gradeLevel: 8,
    unitNumber: 9,
    unitName: 'Unit 9 & 10: Science / Natural Forces',
    topicName: 'Science & Natural Forces (Bilimsel Gelişmeler ve Doğal Afetler)',
    subtopics: [
      'Scientific Achievements, Inventions & Lab Actions',
      'Natural Disasters, Global Warming & Predictions / Precautions',
    ],
    keywords: ['science', 'invention', 'discover', 'experiment', 'vaccine', 'natural forces', 'earthquake', 'drought', 'global warming'],
    importanceWeight: 1.3,
  },
];

export const CURRICULUM_TOPIC_MAP: Record<string, CurriculumTopic> =
  CURRICULUM_TOPICS.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as Record<string, CurriculumTopic>);

export function getTopicsBySubject(subjectId: SubjectId): CurriculumTopic[] {
  return CURRICULUM_TOPICS.filter((t) => t.subjectId === subjectId);
}

/**
 * Resolves the effective topic of a QuestionRecord following Section 10.2 priority:
 * 1. User-selected / verified topic (`userTopicId`)
 * 2. AI vision model suggested topic (`aiSuggestedTopicId`)
 * 3. Text/keyword inferred topic (`inferredTopicId`)
 * 4. Fallback: "Konu belirlenmedi"
 */
export function resolveEffectiveTopic(question: {
  userTopicId?: string | null;
  aiSuggestedTopicId?: string | null;
  inferredTopicId?: string | null;
  topicVerifiedByUser?: boolean;
}): {
  topicId: string | null;
  topicName: string;
  unitName: string;
  source: 'user' | 'ai_suggested' | 'inferred' | 'unassigned';
  isVerified: boolean;
} {
  if (question.userTopicId && CURRICULUM_TOPIC_MAP[question.userTopicId]) {
    const t = CURRICULUM_TOPIC_MAP[question.userTopicId];
    return {
      topicId: t.id,
      topicName: t.topicName,
      unitName: t.unitName,
      source: 'user',
      isVerified: true,
    };
  }

  if (question.aiSuggestedTopicId && CURRICULUM_TOPIC_MAP[question.aiSuggestedTopicId]) {
    const t = CURRICULUM_TOPIC_MAP[question.aiSuggestedTopicId];
    return {
      topicId: t.id,
      topicName: t.topicName,
      unitName: t.unitName,
      source: 'ai_suggested',
      isVerified: Boolean(question.topicVerifiedByUser),
    };
  }

  if (question.inferredTopicId && CURRICULUM_TOPIC_MAP[question.inferredTopicId]) {
    const t = CURRICULUM_TOPIC_MAP[question.inferredTopicId];
    return {
      topicId: t.id,
      topicName: t.topicName,
      unitName: t.unitName,
      source: 'inferred',
      isVerified: Boolean(question.topicVerifiedByUser),
    };
  }

  return {
    topicId: null,
    topicName: 'Konu belirlenmedi',
    unitName: 'Belirlenmedi',
    source: 'unassigned',
    isVerified: false,
  };
}

/**
 * Classifies topic from question text or student note keywords (Priority 3 fallback)
 */
export function inferTopicFromText(
  subjectId: SubjectId,
  text: string
): { topicId: string | null; candidates: Array<{ topicId: string; topicName: string; score: number }> } {
  if (!text || text.trim().length < 3) {
    return { topicId: null, candidates: [] };
  }
  const normalized = text.toLocaleLowerCase('tr-TR');
  const subjectTopics = getTopicsBySubject(subjectId);

  const scored = subjectTopics
    .map((topic) => {
      let score = 0;
      if (normalized.includes(topic.topicName.toLocaleLowerCase('tr-TR'))) {
        score += 40;
      }
      for (const kw of topic.keywords) {
        if (normalized.includes(kw.toLocaleLowerCase('tr-TR'))) {
          score += 25;
        }
      }
      for (const sub of topic.subtopics) {
        const words = sub
          .toLocaleLowerCase('tr-TR')
          .split(/\s+/)
          .filter((w) => w.length > 4);
        for (const w of words) {
          if (normalized.includes(w)) {
            score += 8;
          }
        }
      }
      return {
        topicId: topic.id,
        topicName: topic.topicName,
        score: Math.min(95, score),
      };
    })
    .filter((item) => item.score >= 20)
    .sort((a, b) => b.score - a.score);

  return {
    topicId: scored.length > 0 ? scored[0].topicId : null,
    candidates: scored.slice(0, 3),
  };
}
