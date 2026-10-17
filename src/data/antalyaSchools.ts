import { AntalyaSchoolProgram } from '../types/models';

export const ANTALYA_SCHOOL_DATA_LAST_UPDATED = '2026-10-17';
export const ANTALYA_SCHOOL_DATA_VERSION_NOTE =
  'Antalya ili LGS taban puanları ve yüzdelik dilimleri basarisiralamalari.com ve MEB 2023, 2024, 2025 ve 2026 resmî/güncel yerleştirme verileriyle senkronize edilmiştir. 97 merkezî sınavlı okul ve programın 2026 taban puan ve yüzdelik dilimleri eklenmiştir.';

export const ANTALYA_SCHOOL_PROGRAMS: AntalyaSchoolProgram[] = [
  {
    "id": "ant-yusuf-ziya-oner-fl",
    "schoolCode": "750101",
    "schoolName": "Yusuf Ziya Öner Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Döşemealtı",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce",
      "Almanca"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": "1. Yerleştirme taban yüzdeliği %0,64 olup, yerleştirmeye esas nakil döneminde %0,70 (479,21 puan) taban oluşmuştur. Tabloda 1. yerleştirme esas alınmıştır.",
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 476.4,
        "maxPercentile": 0.63,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 488.4034,
        "maxPercentile": 0.53,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 482.9083,
        "maxPercentile": 0.61,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 482.9832,
        "maxPercentile": 0.64,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 479.2143,
        "maxPercentile": 0.69,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-antalya-anadolu-lisesi",
    "schoolCode": "750201",
    "schoolName": "Antalya Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Muratpaşa",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce",
      "Almanca"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": "1. Yerleştirme taban yüzdeliği %1,54 (471,08 puan); nakil döneminde %1,27 (470,24 puan) olarak kaydedilmiştir.",
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 462.13,
        "maxPercentile": 1.67,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 478.4044,
        "maxPercentile": 1.56,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 470.1534,
        "maxPercentile": 1.81,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 471.0812,
        "maxPercentile": 1.54,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 470.2413,
        "maxPercentile": 1.24,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-mahmud-celaleddin-okten-anadolu-i-mam-hatip-l-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Mahmud Celaleddin Ökten Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Kepez",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "Hazırlık + 4 Yıl (5 Yıl)",
    "hasPrepClass": true,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 458.7787,
        "maxPercentile": 2.73,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 453.7278,
        "maxPercentile": 2.68,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-adem-tolunay-al",
    "schoolCode": "750202",
    "schoolName": "Adem-Tolunay Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Muratpaşa",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce",
      "Almanca"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": "1. Yerleştirme taban yüzdeliği %2,78 (458,27 puan); nakil döneminde %1,93 (461,89 puan) olarak kaydedilmiştir.",
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 454.8,
        "maxPercentile": 2.85,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 471.863,
        "maxPercentile": 2.62,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 460.3053,
        "maxPercentile": 2.99,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 458.2658,
        "maxPercentile": 2.78,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 461.8866,
        "maxPercentile": 1.93,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-tobb-fl",
    "schoolCode": "750102",
    "schoolName": "Antalya Türkiye Odalar ve Borsalar Birliği Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Kepez",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": "1. Yerleştirme (%3,11 / 455,18) ile nakil dönemi (%2,36 / 457,01) verileri farklı ikincil kaynaklarda ayrı ayrı yer almaktadır; aşağıda 1. yerleştirme verisi tutulmuştur.",
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 454.21,
        "maxPercentile": 2.95,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 471.6102,
        "maxPercentile": 2.69,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 460.0213,
        "maxPercentile": 3.04,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 455.1836,
        "maxPercentile": 3.11,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 457.0065,
        "maxPercentile": 2.31,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-huseyin-girenes-fl",
    "schoolCode": "750103",
    "schoolName": "Hüseyin Girenes Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Alanya",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": "Kontenjan 120 iken bazı yıllarda 150 olarak uygulanmıştır; 1. yerleştirme yüzdeliği %3,25, nakil sonrası %2,54 olarak kaydedilmiştir.",
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 455.54,
        "maxPercentile": 2.84,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 473.0024,
        "maxPercentile": 2.41,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 461.0105,
        "maxPercentile": 2.9,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 453.8444,
        "maxPercentile": 3.25,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 455.1691,
        "maxPercentile": 2.54,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-manavgat-namik-karamanci-fl",
    "schoolCode": "750104",
    "schoolName": "Namık Karamancı Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Manavgat",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 451.12,
        "maxPercentile": 3.17,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 469.3544,
        "maxPercentile": 3.07,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 460.843,
        "maxPercentile": 2.92,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 453.326,
        "maxPercentile": 3.31,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 448.5809,
        "maxPercentile": 3.19,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-aksu-fl",
    "schoolCode": "750105",
    "schoolName": "Aksu Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Aksu",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 440.08,
        "maxPercentile": 3.97,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 466.4137,
        "maxPercentile": 3.56,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 453.242,
        "maxPercentile": 3.98,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 446.6461,
        "maxPercentile": 4.07,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 445.7937,
        "maxPercentile": 3.53,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-ilhami-tankut-al",
    "schoolCode": "750203",
    "schoolName": "Dr. İlhami Tankut Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Konyaaltı",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce",
      "Almanca"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 431.89,
        "maxPercentile": 5.05,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 459.5919,
        "maxPercentile": 4.86,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 446.5515,
        "maxPercentile": 4.98,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 439.594,
        "maxPercentile": 4.93,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 439.4306,
        "maxPercentile": 4.25,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-gulveren-al",
    "schoolCode": "750204",
    "schoolName": "Gülveren Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Kepez",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 425.69,
        "maxPercentile": 5.5,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 456.0958,
        "maxPercentile": 5.43,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 443.6476,
        "maxPercentile": 5.44,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 435.4075,
        "maxPercentile": 5.47,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 438.211,
        "maxPercentile": 4.4,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-gazipasa-fl",
    "schoolCode": "750106",
    "schoolName": "Gazipaşa Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Gazipaşa",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 421.21,
        "maxPercentile": 6.5,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 449.0974,
        "maxPercentile": 6.7,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 444.2815,
        "maxPercentile": 5.34,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 428.7329,
        "maxPercentile": 6.39,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 426.2737,
        "maxPercentile": 5.95,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kemer-goynuk-fl",
    "schoolCode": "750107",
    "schoolName": "Göynük Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Kemer",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 421.75,
        "maxPercentile": 6.42,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 452.1197,
        "maxPercentile": 6.17,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 435.354,
        "maxPercentile": 6.78,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 426.6053,
        "maxPercentile": 6.68,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 428.5539,
        "maxPercentile": 5.64,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-hasan-colak-al",
    "schoolCode": "750206",
    "schoolName": "Hasan Çolak Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Alanya",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 409.67,
        "maxPercentile": 7.15,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 446.0445,
        "maxPercentile": 7.26,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 431.5217,
        "maxPercentile": 7.42,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 422.0026,
        "maxPercentile": 7.32,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 417.2437,
        "maxPercentile": 7.19,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-antalya-lisesi",
    "schoolCode": "750205",
    "schoolName": "Antalya Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Muratpaşa",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce",
      "Almanca"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 416.59,
        "maxPercentile": 7.3,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 446.8074,
        "maxPercentile": 7.09,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 430.8251,
        "maxPercentile": 7.53,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 420.8177,
        "maxPercentile": 7.49,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 422.9198,
        "maxPercentile": 6.42,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-mahmud-celaleddin-okten-anadolu-i-mam-hatip-l-fen-ve-sosyal-bi-li-mler-programi-15",
    "schoolName": "Mahmud Celaleddin Ökten Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Kepez",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 420.3512,
        "maxPercentile": 7.56,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 426.2286,
        "maxPercentile": 5.95,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-manavgat-al",
    "schoolCode": "750207",
    "schoolName": "Manavgat Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Manavgat",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 413.24,
        "maxPercentile": 7.72,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 443.5162,
        "maxPercentile": 7.68,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 430.2845,
        "maxPercentile": 7.63,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 416.5768,
        "maxPercentile": 8.12,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 413.8569,
        "maxPercentile": 7.77,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kumluca-havva-sedat-fl",
    "schoolCode": "750108",
    "schoolName": "Havva-Sedat Avcıoğlu Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Kumluca",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 410.82,
        "maxPercentile": 8.1,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 443.33,
        "maxPercentile": 7.72,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 428.3941,
        "maxPercentile": 7.96,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 415.7668,
        "maxPercentile": 8.25,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 415.3386,
        "maxPercentile": 7.54,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-serik-fl",
    "schoolCode": "750109",
    "schoolName": "Serik Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Serik",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 409.5,
        "maxPercentile": 8.3,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 440.5073,
        "maxPercentile": 8.23,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 424.6098,
        "maxPercentile": 8.62,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 415.5794,
        "maxPercentile": 8.27,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 411.3583,
        "maxPercentile": 8.23,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-neriman-erol-yilmaz-sosyal-bilimler-lisesi",
    "schoolName": "Neriman-Erol Yılmaz Sosyal Bilimler Lisesi",
    "programName": "Hazırlık Sınıfı Bulunmayan Sosyal Bilimler Lisesi",
    "district": "Kepez",
    "schoolType": "Sosyal Bilimler Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": 426.47,
        "maxPercentile": 8.3,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 413.6079,
        "maxPercentile": 8.57,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 415.248,
        "maxPercentile": 7.56,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-konyaalti-hayme-ana-aihl",
    "schoolCode": "750402",
    "schoolName": "Hayme Ana Kız Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Konyaaltı",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce",
      "Arapça"
    ],
    "boardingInfo": "Kız Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 397.5,
        "maxPercentile": 10.37,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 438.0712,
        "maxPercentile": 8.65,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 417.875,
        "maxPercentile": 9.82,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 412.9482,
        "maxPercentile": 8.67,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 408.1055,
        "maxPercentile": 8.7,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-korkuteli-cadil-fl",
    "schoolCode": "750110",
    "schoolName": "Fatma-Mehmet Cadıl Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Korkuteli",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 396.4,
        "maxPercentile": 10.56,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 431.2427,
        "maxPercentile": 9.85,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 411.07,
        "maxPercentile": 11.08,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 406.3904,
        "maxPercentile": 9.69,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 403.7909,
        "maxPercentile": 9.43,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-irfan-bileydi-siber",
    "schoolCode": "750502A",
    "schoolName": "İrfan Bileydi Mesleki ve Teknik Anadolu Lisesi",
    "programName": "SİBER GÜVENLİK ALANI",
    "district": "Alanya",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": "Aynı okulun Siber Güvenlik (Hazırlıklı) ve standart Bilişim Teknolojileri programları ayrı taban puanlara sahiptir.",
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 404.0639,
        "maxPercentile": 10.07,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 409.9625,
        "maxPercentile": 8.41,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-aksu-ucak-bakim-mtal",
    "schoolCode": "750501",
    "schoolName": "Aksu Uçak Bakım Teknolojisi Mesleki ve Teknik Anadolu Lisesi",
    "programName": "UÇAK BAKIM ALANI",
    "district": "Aksu",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "Hazırlık + 4 Yıl (5 Yıl)",
    "hasPrepClass": true,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 387.3,
        "maxPercentile": 12.23,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 420.7077,
        "maxPercentile": 11.66,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 412.5461,
        "maxPercentile": 10.81,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 400.0016,
        "maxPercentile": 10.74,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 402.2678,
        "maxPercentile": 9.7,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-neriman-erol-yilmaz-sosyal-bilimler-lisesi-24",
    "schoolName": "Neriman-Erol Yılmaz Sosyal Bilimler Lisesi",
    "programName": "Sosyal Bilimler Lisesi",
    "district": "Kepez",
    "schoolType": "Sosyal Bilimler Lisesi",
    "educationDuration": "Hazırlık + 4 Yıl (5 Yıl)",
    "hasPrepClass": true,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": 410.6163,
        "maxPercentile": 11.16,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 398.2906,
        "maxPercentile": 11.03,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 392.4778,
        "maxPercentile": 11.42,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kas-turan-erdogan-fl",
    "schoolCode": "750111",
    "schoolName": "Turan Erdoğan Yılmaz Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Kaş",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 390.03,
        "maxPercentile": 11.71,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 423.3888,
        "maxPercentile": 11.2,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 407.4512,
        "maxPercentile": 11.76,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 394.9851,
        "maxPercentile": 11.58,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 390.1433,
        "maxPercentile": 11.85,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-kestel-alparslan-al",
    "schoolCode": "750208",
    "schoolName": "Kestel Sultan Alparslan Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Alanya",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 425.9159,
        "maxPercentile": 10.76,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 405.6977,
        "maxPercentile": 12.1,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 393.5409,
        "maxPercentile": 11.82,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 390.7698,
        "maxPercentile": 11.74,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-emine-ahmet-uysal-aihl",
    "schoolCode": "750403",
    "schoolName": "Emine Ahmet Uysal Teknoloji Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE TEKNOLOJİ PROGRAMI",
    "district": "Alanya",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "Hazırlık + 4 Yıl (5 Yıl)",
    "hasPrepClass": true,
    "foreignLanguages": [
      "İngilizce",
      "Arapça"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 383.55,
        "maxPercentile": 12.97,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 407.7598,
        "maxPercentile": 11.71,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 391.3077,
        "maxPercentile": 12.19,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 384.0362,
        "maxPercentile": 13.05,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-erunal-sbl",
    "schoolCode": "750301",
    "schoolName": "Antalya Erünal Sosyal Bilimler Lisesi",
    "programName": "Sosyal Bilimler Lisesi",
    "district": "Döşemealtı",
    "schoolType": "Sosyal Bilimler Lisesi",
    "educationDuration": "Hazırlık + 4 Yıl (5 Yıl)",
    "hasPrepClass": true,
    "foreignLanguages": [
      "İngilizce",
      "Almanca"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 371.83,
        "maxPercentile": 15.37,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 409.8287,
        "maxPercentile": 13.55,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 400.4075,
        "maxPercentile": 13.13,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 386.0295,
        "maxPercentile": 13.1,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 382.5982,
        "maxPercentile": 13.32,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-elmali-ibrahim-bedrettin-fl",
    "schoolCode": "750112",
    "schoolName": "İbrahim Bedrettin Elmalı Fen Lisesi",
    "programName": "FEN BİLİMLERİ ALANI (FEN LİS.)",
    "district": "Elmalı",
    "schoolType": "Fen Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 378.74,
        "maxPercentile": 13.93,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 411.7518,
        "maxPercentile": 13.21,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 395.6056,
        "maxPercentile": 14.09,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 385.233,
        "maxPercentile": 13.23,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 384.1332,
        "maxPercentile": 13.03,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-antalya-aihl",
    "schoolCode": "750404",
    "schoolName": "Antalya Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Muratpaşa",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce",
      "Arapça"
    ],
    "boardingInfo": "Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 365.12,
        "maxPercentile": 16.8,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 390.4539,
        "maxPercentile": 17.07,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 393.4444,
        "maxPercentile": 14.53,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 382.6979,
        "maxPercentile": 13.68,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 390.825,
        "maxPercentile": 11.72,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kemer-unal-aysal-al",
    "schoolCode": "750209",
    "schoolName": "Ünal Aysal Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Kemer",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 394.3421,
        "maxPercentile": 16.35,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 384.1348,
        "maxPercentile": 16.48,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 378.5575,
        "maxPercentile": 14.41,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 383.6503,
        "maxPercentile": 13.11,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kumluca-sbl",
    "schoolCode": "750302",
    "schoolName": "Kumluca Sosyal Bilimler Lisesi",
    "programName": "Hazırlık Sınıfı Bulunmayan Sosyal Bilimler Lisesi",
    "district": "Kumluca",
    "schoolType": "Sosyal Bilimler Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 361.93,
        "maxPercentile": 17.59,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 389.5793,
        "maxPercentile": 17.24,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 387.5232,
        "maxPercentile": 15.76,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 377.6174,
        "maxPercentile": 14.58,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 375.6235,
        "maxPercentile": 14.74,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-irfan-bileydi-bilisim",
    "schoolCode": "750502B",
    "schoolName": "İrfan Bileydi Mesleki ve Teknik Anadolu Lisesi",
    "programName": "BİLİŞİM TEKNOLOJİLERİ ALANI",
    "district": "Alanya",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 377.5867,
        "maxPercentile": 14.59,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 393.4421,
        "maxPercentile": 11.26,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-emine-ahmet-uysal-aihl-34",
    "schoolCode": "750403",
    "schoolName": "Emine Ahmet Uysal Teknoloji Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Alanya",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce",
      "Arapça"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 383.55,
        "maxPercentile": 12.97,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 409.1842,
        "maxPercentile": 13.67,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 399.1277,
        "maxPercentile": 13.38,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 372.545,
        "maxPercentile": 15.52,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 377.9075,
        "maxPercentile": 14.27,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-serik-ertugrul-gazi-al",
    "schoolCode": "750210",
    "schoolName": "Serik Ertuğrul Gazi Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Serik",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 391.615,
        "maxPercentile": 16.86,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 381.7997,
        "maxPercentile": 16.97,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 365.5677,
        "maxPercentile": 16.83,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 373.9737,
        "maxPercentile": 15.09,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-prof-dr-rasit-kucuk-anadolu-i-mam-hatip-lises-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Prof. Dr. Raşit Küçük Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Kepez",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 378.0664,
        "maxPercentile": 19.53,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 374.8243,
        "maxPercentile": 18.49,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 354.8844,
        "maxPercentile": 18.93,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 367.8492,
        "maxPercentile": 16.43,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-konyaalti-fettah-tamince-denizcilik-mesleki-ve-teknik-a-gemi-yapimi-alani-sinavli",
    "schoolName": "Fettah Tamince Denizcilik Mesleki ve Teknik Anadolu Lisesi",
    "programName": "GEMİ YAPIMI ALANI (SINAVLI)",
    "district": "Konyaaltı",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 341.7399,
        "maxPercentile": 27.72,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 342.1465,
        "maxPercentile": 26.3,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 346.7132,
        "maxPercentile": 20.58,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 348.7037,
        "maxPercentile": 20.95,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-antalya-ticaret-borsasi-ticaret-mesleki-ve-te-bi-li-si-m-teknoloji-leri-alani",
    "schoolName": "Antalya Ticaret Borsası Ticaret Mesleki ve Teknik Anadolu Lisesi",
    "programName": "BİLİŞİM TEKNOLOJİLERİ ALANI",
    "district": "Muratpaşa",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 359.0256,
        "maxPercentile": 23.6,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 355.2096,
        "maxPercentile": 23.02,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 338.026,
        "maxPercentile": 22.42,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 319.726,
        "maxPercentile": 28.97,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-finike-al",
    "schoolCode": "750211",
    "schoolName": "Finike Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Finike",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Kız ve Erkek Pansiyonlu",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2022,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 321.04,
        "maxPercentile": 28.81,
        "isVerified": true,
        "sourceName": "MEB 2022 İlk Yerleştirme Sonuçları",
        "sourceUrl": "https://e-okul.meb.gov.tr/"
      },
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 355.5319,
        "maxPercentile": 24.39,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 359.8534,
        "maxPercentile": 21.91,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 337.5989,
        "maxPercentile": 22.51,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 354.2793,
        "maxPercentile": 19.58,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-antalya-mesleki-ve-teknik-anadolu-lisesi-endustri-yel-otomasyon-teknoloji-leri-alani",
    "schoolName": "Antalya Mesleki ve Teknik Anadolu Lisesi",
    "programName": "ENDÜSTRİYEL OTOMASYON TEKNOLOJİLERİ ALANI",
    "district": "Muratpaşa",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 344.2745,
        "maxPercentile": 27.09,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 351.6378,
        "maxPercentile": 23.9,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 337.1076,
        "maxPercentile": 22.62,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 340.4963,
        "maxPercentile": 23.12,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-dosemealti-dosemealti-mesleki-ve-teknik-anadolu-lisesi-saglik-hi-zmetleri-alani",
    "schoolName": "Döşemealtı Mesleki ve Teknik Anadolu Lisesi",
    "programName": "SAĞLIK HİZMETLERİ ALANI",
    "district": "Döşemealtı",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 356.2722,
        "maxPercentile": 24.22,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 360.8271,
        "maxPercentile": 21.69,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 334.8173,
        "maxPercentile": 23.12,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 337.4476,
        "maxPercentile": 23.93,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-turkler-borsa-i-stanbul-sosyal-bilimler-lises",
    "schoolName": "Türkler Borsa İstanbul Sosyal Bilimler Lisesi",
    "programName": "Sosyal Bilimler Lisesi",
    "district": "Alanya",
    "schoolType": "Sosyal Bilimler Lisesi",
    "educationDuration": "Hazırlık + 4 Yıl (5 Yıl)",
    "hasPrepClass": true,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 373.264,
        "maxPercentile": 20.51,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": null,
        "maxPercentile": 19.65,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 334.2565,
        "maxPercentile": 23.25,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 352.8004,
        "maxPercentile": 19.92,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-haci-dudu-mehmet-gebizli-kiz-anadolu-i-mam-ha-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Hacı Dudu- Mehmet Gebizli Kız Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Muratpaşa",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 363.2766,
        "maxPercentile": 22.65,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 354.7217,
        "maxPercentile": 23.14,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 329.6352,
        "maxPercentile": 24.28,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 345.042,
        "maxPercentile": 21.9,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-turkler-borsa-i-stanbul-sosyal-bilimler-lises-44",
    "schoolName": "Türkler Borsa İstanbul Sosyal Bilimler Lisesi",
    "programName": "Hazırlık Sınıfı Bulunmayan Sosyal Bilimler Lisesi",
    "district": "Alanya",
    "schoolType": "Sosyal Bilimler Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 374.1198,
        "maxPercentile": 20.33,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": null,
        "maxPercentile": 20.8,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 319.3683,
        "maxPercentile": 26.66,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 327.5828,
        "maxPercentile": 26.67,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-ataturk-mesleki-ve-teknik-anadolu-lisesi-elektri-k-elektroni-k-teknoloji-si-alani",
    "schoolName": "Atatürk Mesleki ve Teknik Anadolu Lisesi",
    "programName": "ELEKTRİK-ELEKTRONİK TEKNOLOJİSİ ALANI",
    "district": "Kepez",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 327.1481,
        "maxPercentile": 31.54,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 339.3882,
        "maxPercentile": 27.02,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 316.585,
        "maxPercentile": 27.33,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 309.5166,
        "maxPercentile": 32.1,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-dosemealti-sehit-volkan-canoz-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Şehit Volkan Canöz Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Döşemealtı",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 323.4748,
        "maxPercentile": 32.56,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 323.7505,
        "maxPercentile": 31.29,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 307.4878,
        "maxPercentile": 29.57,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 340.5951,
        "maxPercentile": 23.09,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-manavgat-manavgat-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Manavgat Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Manavgat",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 303.8375,
        "maxPercentile": 38.43,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 311.3735,
        "maxPercentile": 34.93,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 295.8296,
        "maxPercentile": 32.62,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 311.925,
        "maxPercentile": 31.35,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-finike-finike-eroglu-nuri-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Finike Eroğlu Nuri Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Finike",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 316.3347,
        "maxPercentile": 34.61,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 329.2322,
        "maxPercentile": 29.75,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 294.0532,
        "maxPercentile": 33.11,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 327.9167,
        "maxPercentile": 26.56,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-konyaalti-konyaalti-mehmet-zeki-balci-turizm-mesleki-ve-yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Konyaaltı Mehmet Zeki Balcı Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Konyaaltı",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 283.7567,
        "maxPercentile": 45.2,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 300.3284,
        "maxPercentile": 38.46,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 265.7727,
        "maxPercentile": 41.69,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 284.3413,
        "maxPercentile": 40.48,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-antalya-barosu-mesleki-ve-teknik-anadolu-lise-cocuk-geli-si-mi-ve-egi-ti-mi-alani",
    "schoolName": "Antalya Barosu Mesleki ve Teknik Anadolu Lisesi",
    "programName": "ÇOCUK GELİŞİMİ VE EĞİTİMİ ALANI",
    "district": "Muratpaşa",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 295.9048,
        "maxPercentile": 41,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 303.4719,
        "maxPercentile": 37.43,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 254.6793,
        "maxPercentile": 45.63,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 269.9024,
        "maxPercentile": 46.18,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-falez-turizm-mesleki-ve-teknik-anadolu-lisesi-yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Falez Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Muratpaşa",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 276.0602,
        "maxPercentile": 48.09,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 275.2478,
        "maxPercentile": 47.7,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 253.1896,
        "maxPercentile": 46.2,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 274.0064,
        "maxPercentile": 44.53,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-falez-turizm-mesleki-ve-teknik-anadolu-lisesi-konaklama-ve-seyahat-hi-zmetleri-alani-sinavl",
    "schoolName": "Falez Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "KONAKLAMA VE SEYAHAT HİZMETLERİ ALANI (SINAVLI)",
    "district": "Muratpaşa",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 276.3897,
        "maxPercentile": 47.96,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 275.0809,
        "maxPercentile": 47.77,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 247.9541,
        "maxPercentile": 48.24,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 267.5857,
        "maxPercentile": 47.22,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-konyaalti-konyaalti-mehmet-zeki-balci-turizm-mesleki-ve-konaklama-ve-seyahat-hi-zmetleri-alani-sinavl",
    "schoolName": "Konyaaltı Mehmet Zeki Balcı Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "KONAKLAMA VE SEYAHAT HİZMETLERİ ALANI (SINAVLI)",
    "district": "Konyaaltı",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 268.9447,
        "maxPercentile": 50.93,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 283.1001,
        "maxPercentile": 44.57,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 247.598,
        "maxPercentile": 48.39,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 278.2145,
        "maxPercentile": 42.96,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-konyaalti-konyaalti-bahtili-mesleki-ve-teknik-anadolu-l-bi-yomedi-kal-ci-haz-teknoloji-leri-alani",
    "schoolName": "Konyaaltı Bahtılı Mesleki ve Teknik Anadolu Lisesi",
    "programName": "BİYOMEDİKAL CİHAZ TEKNOLOJİLERİ ALANI",
    "district": "Konyaaltı",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 287.3832,
        "maxPercentile": 43.88,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 292.5712,
        "maxPercentile": 41.1,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 240.8365,
        "maxPercentile": 51.25,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 259.8006,
        "maxPercentile": 50.52,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-tez-tur-turizm-mesleki-ve-teknik-anadolu-lise-konaklama-ve-seyahat-hi-zmetleri-alani-sinavl",
    "schoolName": "Tez-Tur Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "KONAKLAMA VE SEYAHAT HİZMETLERİ ALANI (SINAVLI)",
    "district": "Muratpaşa",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 267.4856,
        "maxPercentile": 51.54,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 271.1358,
        "maxPercentile": 49.4,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 240.3094,
        "maxPercentile": 51.48,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 262.4386,
        "maxPercentile": 49.39,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-manavgat-manavgat-rukiye-rasit-meshur-mesleki-ve-tekni-saglik-hi-zmetleri-alani-sinavli",
    "schoolName": "Manavgat Rukiye-Raşit Meşhur Mesleki ve Teknik Anadolu Lisesi",
    "programName": "SAĞLIK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Manavgat",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 283.8151,
        "maxPercentile": 45.18,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 270.4895,
        "maxPercentile": 49.68,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 219.332,
        "maxPercentile": 62.29,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 241.4002,
        "maxPercentile": 59.59,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-sehit-ozcan-senol-mesleki-ve-teknik-anadolu-l-bi-li-si-m-teknoloji-leri-alani",
    "schoolName": "Şehit Özcan Şenol Mesleki ve Teknik Anadolu Lisesi",
    "programName": "BİLİŞİM TEKNOLOJİLERİ ALANI",
    "district": "Kepez",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 215.1095,
        "maxPercentile": 64.86,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 254.0824,
        "maxPercentile": 53.22,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-serik-serik-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Serik Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Serik",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 221.4892,
        "maxPercentile": 75.74,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 199.3785,
        "maxPercentile": 91.07,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 214.8614,
        "maxPercentile": 65.01,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 190.4414,
        "maxPercentile": 92.06,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-demre-demre-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Demre Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Demre",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 183.6558,
        "maxPercentile": 96.57,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 211.066,
        "maxPercentile": 83.87,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 209.1146,
        "maxPercentile": 68.8,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 259.0401,
        "maxPercentile": 50.89,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-demirtas-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Demirtaş Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Alanya",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 320.7809,
        "maxPercentile": 33.32,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 193.7712,
        "maxPercentile": 93.87,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 207.5306,
        "maxPercentile": 69.88,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 240.3896,
        "maxPercentile": 60.22,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-tez-tur-turizm-mesleki-ve-teknik-anadolu-lise-yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Tez-Tur Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Muratpaşa",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 240.5293,
        "maxPercentile": 64.33,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 244.4123,
        "maxPercentile": 62.54,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 206.6025,
        "maxPercentile": 70.53,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 244.2457,
        "maxPercentile": 58.1,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-dosemealti-yesilbayir-borsa-i-stanbul-turizm-mesleki-ve--yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Yeşilbayır Borsa İstanbul Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Döşemealtı",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 218.4632,
        "maxPercentile": 77.72,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 230.7122,
        "maxPercentile": 70.78,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 205.3513,
        "maxPercentile": 71.41,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 227.4075,
        "maxPercentile": 67.93,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-elmali-elmali-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Elmalı Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Elmalı",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 275.5054,
        "maxPercentile": 48.31,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 259.4666,
        "maxPercentile": 54.71,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 203.3347,
        "maxPercentile": 72.85,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 191.6754,
        "maxPercentile": 91.43,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-alanya-mesleki-ve-teknik-anadolu-lisesi-elektri-k-elektroni-k-teknoloji-si-alani",
    "schoolName": "Alanya Mesleki ve Teknik Anadolu Lisesi",
    "programName": "ELEKTRİK-ELEKTRONİK TEKNOLOJİSİ ALANI",
    "district": "Alanya",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 292.7391,
        "maxPercentile": 42.03,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 195.4287,
        "maxPercentile": 93.11,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 202.3522,
        "maxPercentile": 73.53,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 225.2832,
        "maxPercentile": 69.37,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kemer-kemer-turizm-mesleki-ve-teknik-anadolu-lisesi-konaklama-ve-seyahat-hi-zmetleri-alani-sinavl",
    "schoolName": "Kemer Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "KONAKLAMA VE SEYAHAT HİZMETLERİ ALANI (SINAVLI)",
    "district": "Kemer",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 217.0824,
        "maxPercentile": 78.61,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 242.4914,
        "maxPercentile": 63.63,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 199.0065,
        "maxPercentile": 75.97,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 220.5111,
        "maxPercentile": 72.69,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-sehit-ozcan-senol-mesleki-ve-teknik-anadolu-l-motorlu-araclar-teknoloji-si-alani",
    "schoolName": "Şehit Özcan Şenol Mesleki ve Teknik Anadolu Lisesi",
    "programName": "MOTORLU ARAÇLAR TEKNOLOJİSİ ALANI",
    "district": "Kepez",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 198.71,
        "maxPercentile": 76.19,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 244.0713,
        "maxPercentile": 58.21,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kumluca-kumluca-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Kumluca Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Kumluca",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 200.1758,
        "maxPercentile": 89.31,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 199.4479,
        "maxPercentile": 91.03,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 198.5261,
        "maxPercentile": 76.33,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 178.7827,
        "maxPercentile": 96.37,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-dosemealti-yesilbayir-borsa-i-stanbul-turizm-mesleki-ve--konaklama-ve-seyahat-hi-zmetleri-alani-sinavl",
    "schoolName": "Yeşilbayır Borsa İstanbul Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "KONAKLAMA VE SEYAHAT HİZMETLERİ ALANI (SINAVLI)",
    "district": "Döşemealtı",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 202.537,
        "maxPercentile": 87.92,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 222.9415,
        "maxPercentile": 75.9,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 192.099,
        "maxPercentile": 81.09,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 215.0661,
        "maxPercentile": 76.35,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-alanya-umit-altay-turizm-mesleki-ve-teknik-an-yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Alanya Ümit Altay Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Alanya",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 248.2042,
        "maxPercentile": 60.33,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 231.3778,
        "maxPercentile": 70.36,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 191.8519,
        "maxPercentile": 81.27,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 172.3183,
        "maxPercentile": 97.91,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-serik-serik-orhangazi-mesleki-ve-teknik-anadolu-lis-elektri-k-elektroni-k-teknoloji-si-alani",
    "schoolName": "Serik Orhangazi Mesleki ve Teknik Anadolu Lisesi",
    "programName": "ELEKTRİK-ELEKTRONİK TEKNOLOJİSİ ALANI",
    "district": "Serik",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 242.1378,
        "maxPercentile": 63.47,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 216.4191,
        "maxPercentile": 80.28,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 191.4003,
        "maxPercentile": 81.61,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 204.0121,
        "maxPercentile": 83.97,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kemer-kemer-turizm-mesleki-ve-teknik-anadolu-lisesi-yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Kemer Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Kemer",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 215.2982,
        "maxPercentile": 79.78,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 235.1918,
        "maxPercentile": 67.96,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 191.1677,
        "maxPercentile": 81.79,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 209.6643,
        "maxPercentile": 80.2,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-serik-serik-borsa-i-stanbul-turizm-mesleki-ve-tekni-konaklama-ve-seyahat-hi-zmetleri-alani-sinavl",
    "schoolName": "Serik Borsa İstanbul Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "KONAKLAMA VE SEYAHAT HİZMETLERİ ALANI (SINAVLI)",
    "district": "Serik",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 239.4125,
        "maxPercentile": 64.94,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 240.7985,
        "maxPercentile": 64.61,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 190.4311,
        "maxPercentile": 82.32,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 197.9836,
        "maxPercentile": 87.9,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-alanya-umit-altay-turizm-mesleki-ve-teknik-an-konaklama-ve-seyahat-hi-zmetleri-alani-sinavl",
    "schoolName": "Alanya Ümit Altay Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "KONAKLAMA VE SEYAHAT HİZMETLERİ ALANI (SINAVLI)",
    "district": "Alanya",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 267.2306,
        "maxPercentile": 51.64,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 257.4937,
        "maxPercentile": 55.67,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 189.1557,
        "maxPercentile": 83.26,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 209.0515,
        "maxPercentile": 80.6,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-manavgat-manavgat-evliya-celebi-turizm-mesleki-ve-tekn-konaklama-ve-seyahat-hi-zmetleri-alani-sinavl",
    "schoolName": "Manavgat Evliya Çelebi Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "KONAKLAMA VE SEYAHAT HİZMETLERİ ALANI (SINAVLI)",
    "district": "Manavgat",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 175.2126,
        "maxPercentile": 98.44,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 241.2582,
        "maxPercentile": 64.35,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 187.3223,
        "maxPercentile": 84.57,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 224.0555,
        "maxPercentile": 70.17,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-manavgat-manavgat-evliya-celebi-turizm-mesleki-ve-tekn-yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Manavgat Evliya Çelebi Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Manavgat",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 181.9473,
        "maxPercentile": 97.05,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 180,
        "minScore": 187.3672,
        "maxPercentile": 96.29,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 182.91,
        "maxPercentile": 87.59,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 216.5693,
        "maxPercentile": 75.3,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-serik-serik-borsa-i-stanbul-turizm-mesleki-ve-tekni-yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Serik Borsa İstanbul Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Serik",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 261.2387,
        "maxPercentile": 54.21,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 234.9799,
        "maxPercentile": 68.09,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 182.6313,
        "maxPercentile": 87.78,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 218.3383,
        "maxPercentile": 74.03,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-aksu-aksu-kiz-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Aksu Kız Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Aksu",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 178.2104,
        "maxPercentile": 97.91,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 179.4526,
        "maxPercentile": 98.23,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 180.7885,
        "maxPercentile": 88.97,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 165.301,
        "maxPercentile": 98.94,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-akseki-akseki-sahinler-meslek-ve-teknik-anadolu-lise-tarim-alani",
    "schoolName": "Akseki Şahinler Meslekî ve Teknik Anadolu Lisesi",
    "programName": "TARIM ALANI",
    "district": "Akseki",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 175.0722,
        "maxPercentile": 98.46,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 207.8831,
        "maxPercentile": 85.97,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 172.3762,
        "maxPercentile": 93.57,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 197.3353,
        "maxPercentile": 88.27,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-sehit-muhammet-oguz-kilinc-anadolu-i-mam-hati-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Şehit Muhammet Oğuz Kılınç Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Muratpaşa",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 171.0896,
        "maxPercentile": 94.15,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 218.3796,
        "maxPercentile": 74.03,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-korkuteli-sehit-yasin-naci-agaroglu-anadolu-i-mam-hatip-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Şehit Yasin Naci Ağaroğlu Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Korkuteli",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 291.0172,
        "maxPercentile": 42.61,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 232.9187,
        "maxPercentile": 69.37,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 170.0801,
        "maxPercentile": 94.59,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 251.0492,
        "maxPercentile": 54.63,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-manavgat-sule-muzaffer-buyuk-kiz-mesleki-ve-teknik-ana-yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Şule-Muzaffer Büyük Kız Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Manavgat",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 210.6716,
        "maxPercentile": 82.78,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 193.4696,
        "maxPercentile": 94,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 167.9436,
        "maxPercentile": 95.42,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 177.1943,
        "maxPercentile": 96.75,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kas-kas-turizm-mesleki-ve-teknik-anadolu-lisesi-yi-yecek-i-cecek-hi-zmetleri-alani-sinavli",
    "schoolName": "Kaş Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YİYECEK İÇECEK HİZMETLERİ ALANI (SINAVLI)",
    "district": "Kaş",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 180.2007,
        "maxPercentile": 97.49,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 154.0017,
        "maxPercentile": 99.94,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 165.0658,
        "maxPercentile": 96.39,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 180.9096,
        "maxPercentile": 95.84,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-aksu-aysel-akin-klaus-wagner-tarim-mesleki-ve-tekn-tarim-alani",
    "schoolName": "Aysel Akın-Klaus Wagner Tarım Mesleki ve Teknik Anadolu Lisesi",
    "programName": "TARIM ALANI",
    "district": "Aksu",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 184.71,
        "maxPercentile": 96.26,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 165.4067,
        "maxPercentile": 99.66,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 163.5563,
        "maxPercentile": 96.84,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 173.6663,
        "maxPercentile": 97.6,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-sehit-ozcan-senol-mesleki-ve-teknik-anadolu-l-yeni-lenebi-li-r-enerji-teknoloji-leri-alani",
    "schoolName": "Şehit Özcan Şenol Mesleki ve Teknik Anadolu Lisesi",
    "programName": "YENİLENEBİLİR ENERJİ TEKNOLOJİLERİ ALANI",
    "district": "Kepez",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 163.2905,
        "maxPercentile": 96.92,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 219.413,
        "maxPercentile": 73.25,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-manavgat-mehmet-akif-ersoy-anadolu-lisesi",
    "schoolName": "Mehmet Akif Ersoy Anadolu Lisesi",
    "programName": "Anadolu Lisesi",
    "district": "Manavgat",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 179.62,
        "maxPercentile": 97.62,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 150,
        "minScore": 177.749,
        "maxPercentile": 98.52,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 120,
        "minScore": 162.7448,
        "maxPercentile": 97.07,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 171.372,
        "maxPercentile": 98.15,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-serik-serik-kiz-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Serik Kız Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Serik",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 292.8995,
        "maxPercentile": 41.98,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 254.27,
        "maxPercentile": 57.27,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 160.3934,
        "maxPercentile": 97.65,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 90,
        "minScore": 265.2342,
        "maxPercentile": 48.2,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-sehit-ozcan-senol-mesleki-ve-teknik-anadolu-l-gida-teknoloji-si-alani",
    "schoolName": "Şehit Özcan Şenol Mesleki ve Teknik Anadolu Lisesi",
    "programName": "GIDA TEKNOLOJİSİ ALANI",
    "district": "Kepez",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 156.5385,
        "maxPercentile": 98.39,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 204.2684,
        "maxPercentile": 83.83,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-alanya-alanya-mesleki-ve-teknik-anadolu-lisesi-motorlu-araclar-teknoloji-si-alani",
    "schoolName": "Alanya Mesleki ve Teknik Anadolu Lisesi",
    "programName": "MOTORLU ARAÇLAR TEKNOLOJİSİ ALANI",
    "district": "Alanya",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 263.356,
        "maxPercentile": 53.27,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 181.8253,
        "maxPercentile": 97.75,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 155.7511,
        "maxPercentile": 98.51,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 183.3306,
        "maxPercentile": 95.2,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kas-kas-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Kaş Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Kaş",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 228.3636,
        "maxPercentile": 71.41,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 212.0943,
        "maxPercentile": 83.18,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 153.0236,
        "maxPercentile": 98.89,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 222.7444,
        "maxPercentile": 71.23,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kas-kas-turizm-mesleki-ve-teknik-anadolu-lisesi-konaklama-ve-seyahat-hi-zmetleri-alani-sinavl",
    "schoolName": "Kaş Turizm Mesleki ve Teknik Anadolu Lisesi",
    "programName": "KONAKLAMA VE SEYAHAT HİZMETLERİ ALANI (SINAVLI)",
    "district": "Kaş",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 149.1925,
        "maxPercentile": 99.95,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 174.6416,
        "maxPercentile": 98.95,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 144.5473,
        "maxPercentile": 99.6,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 157.3153,
        "maxPercentile": 99.59,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-gulsen-mehmet-fehmi-diktas-mesleki-ve-teknik--maki-ne-ve-tasarim-teknoloji-si-alani",
    "schoolName": "Gülşen - Mehmet Fehmi Diktaş Mesleki ve Teknik Anadolu Lisesi",
    "programName": "MAKİNE VE TASARIM TEKNOLOJİSİ ALANI",
    "district": "Kepez",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 202.0656,
        "maxPercentile": 88.19,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 224.0195,
        "maxPercentile": 75.18,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 142.1653,
        "maxPercentile": 99.71,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 201.4726,
        "maxPercentile": 85.72,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-gazipasa-zeliha-tuncer-anadolu-i-mam-hatip-lisesi-fen-ve-sosyal-bi-li-mler-programi",
    "schoolName": "Zeliha Tuncer Anadolu İmam Hatip Lisesi",
    "programName": "FEN VE SOSYAL BİLİMLER PROGRAMI",
    "district": "Gazipaşa",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 172.1395,
        "maxPercentile": 98.88,
        "isVerified": true,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 232.4253,
        "maxPercentile": 69.69,
        "isVerified": true,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 131.946,
        "maxPercentile": 99.93,
        "isVerified": true,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 60,
        "minScore": 184.0902,
        "maxPercentile": 94.91,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-antalya-mesleki-ve-teknik-anadolu-lisesi-maki-ne-ve-tasarim-teknoloji-si-alani",
    "schoolName": "Antalya Mesleki ve Teknik Anadolu Lisesi",
    "programName": "MAKİNE VE TASARIM TEKNOLOJİSİ ALANI",
    "district": "Muratpaşa",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 307.8974,
        "maxPercentile": 32.66,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-nevzat-i-nan-mesleki-ve-teknik-anadolu-lisesi-bi-li-si-m-teknoloji-leri-alani",
    "schoolName": "Nevzat İnan Mesleki ve Teknik Anadolu Lisesi",
    "programName": "BİLİŞİM TEKNOLOJİLERİ ALANI",
    "district": "Kepez",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 332.3925,
        "maxPercentile": 25.33,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-konyaalti-fettah-tamince-denizcilik-mesleki-ve-teknik-a-deni-zci-li-k-alani",
    "schoolName": "Fettah Tamince Denizcilik Mesleki ve Teknik Anadolu Lisesi",
    "programName": "DENİZCİLİK ALANI",
    "district": "Konyaaltı",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "Hazırlık + 4 Yıl (5 Yıl)",
    "hasPrepClass": true,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-muratpasa-antalya-mesleki-ve-teknik-anadolu-lisesi-elektri-k-elektroni-k-teknoloji-si-alani",
    "schoolName": "Antalya Mesleki ve Teknik Anadolu Lisesi",
    "programName": "ELEKTRİK-ELEKTRONİK TEKNOLOJİSİ ALANI",
    "district": "Muratpaşa",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 330.1173,
        "maxPercentile": 25.94,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-kepez-nevzat-i-nan-mesleki-ve-teknik-anadolu-lisesi-si-ber-guvenli-k-alani",
    "schoolName": "Nevzat İnan Mesleki ve Teknik Anadolu Lisesi",
    "programName": "SİBER GÜVENLİK ALANI",
    "district": "Kepez",
    "schoolType": "Mesleki ve Teknik Anadolu Lisesi",
    "educationDuration": "Hazırlık + 4 Yıl (5 Yıl)",
    "hasPrepClass": true,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Merkezî Sınav (LGS Puanı)",
    "lastUpdatedAt": "2026-10-17",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": null,
    "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
    "yearlyPlacements": [
      {
        "year": 2023,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2023 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2024,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2024 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2025,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 0,
        "minScore": null,
        "maxPercentile": null,
        "isVerified": false,
        "sourceName": "MEB 2025 1. Yerleştirme Sonuçları",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/"
      },
      {
        "year": 2026,
        "placementPeriod": "1. Yerleştirme (Merkezî Sınav)",
        "quota": 30,
        "minScore": 358.9049,
        "maxPercentile": 18.45,
        "isVerified": true,
        "sourceName": "Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)",
        "sourceUrl": "https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/",
        "notes": "basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi"
      }
    ]
  },
  {
    "id": "ant-yerel-metin-nuran-cakallikli",
    "schoolCode": "750901",
    "schoolName": "Metin-Nuran Çakallıklı Anadolu Lisesi (Yerel Yerleştirme / OBP)",
    "programName": "Anadolu Lisesi (Sınavsız / Kayıt Alanı ve OBP ile)",
    "district": "Muratpaşa",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce",
      "Almanca"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Yerel Yerleştirme (OBP / Kayıt Alanı)",
    "lastUpdatedAt": "2026-08-15",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": "UYARI: Bu okul LGS puanıyla değil, Yerel Yerleştirme (ikamet kayıt alanı, devam-devamsızlık ve Ortaöğretim Başarı Puanı - 2025 OBP: 93,95) ile öğrenci alır. İkamet/kayıt alanı koşulu sağlanmadan kesin kayıt hakkı vermez.",
    "sourceUrl": "https://e-okul.meb.gov.tr/",
    "yearlyPlacements": []
  },
  {
    "id": "ant-yerel-gazi-anadolu",
    "schoolCode": "750902",
    "schoolName": "Antalya Gazi Anadolu Lisesi (Yerel Yerleştirme / OBP)",
    "programName": "Anadolu Lisesi (Sınavsız / Kayıt Alanı ve OBP ile)",
    "district": "Muratpaşa",
    "schoolType": "Anadolu Lisesi",
    "educationDuration": "4 Yıl",
    "hasPrepClass": false,
    "foreignLanguages": [
      "İngilizce"
    ],
    "boardingInfo": "Yok",
    "admissionType": "Yerel Yerleştirme (OBP / Kayıt Alanı)",
    "lastUpdatedAt": "2026-08-15",
    "verificationStatus": "Doğrulanmış Resmî Veri (MEB / e-Okul)",
    "dataConflictNote": "UYARI: Bu okul LGS puanıyla değil, Yerel Yerleştirme (ikamet kayıt alanı ve Ortaöğretim Başarı Puanı - 2025 OBP: 87,84) ile öğrenci alır. Merkezî sınav okullarıyla puan kıyaslamasına dahil edilmez.",
    "sourceUrl": "https://e-okul.meb.gov.tr/",
    "yearlyPlacements": []
  }
];
