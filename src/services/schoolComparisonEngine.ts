import {
  AntalyaSchoolProgram,
  PercentileAndScoreEstimate,
  SchoolComparisonCategory,
  SchoolComparisonResult,
  SchoolType,
} from '../types/models';

export interface SchoolFilterOptions {
  searchQuery?: string;
  district?: string;
  schoolType?: SchoolType | 'ALL';
  admissionType?: 'ALL' | 'Merkezî Sınav (LGS Puanı)' | 'Yerel Yerleştirme (OBP / Kayıt Alanı)';
  boardingFilter?: 'ALL' | 'HAS_BOARDING' | 'NO_BOARDING';
  foreignLanguage?: string | 'ALL';
  maxPercentileLimit?: number | null;
  minScoreLimit?: number | null;
  onlyFavorites?: boolean;
  favoriteIds?: string[];
}

export function compareSchoolWithStudent(
  school: AntalyaSchoolProgram,
  estimate: PercentileAndScoreEstimate
): SchoolComparisonResult {
  const verifiedPlacements = school.yearlyPlacements
    .filter(
      (yp) =>
        yp.isVerified &&
        typeof yp.maxPercentile === 'number' &&
        yp.maxPercentile !== null
    )
    .sort((a, b) => b.year - a.year);

  if (school.admissionType === 'Yerel Yerleştirme (OBP / Kayıt Alanı)') {
    return {
      school,
      category: 'veri_yetersiz',
      categoryLabel: 'Yerel Yerleştirme (OBP / Kayıt Alanı)',
      latestVerifiedYear: null,
      latestMinScore: null,
      latestPercentile: null,
      percentileChangeMultiYear: null,
      quotaChangeMultiYear: null,
      studentEstimatedPercentileRange: estimate.estimatedNationalPercentileRange,
      gapToLatestPercentile: null,
      confidenceLevel: 'insufficient',
      reasoningText:
        'Bu okul LGS merkezî sınav puanıyla değil, Yerel Yerleştirme (ikamet kayıt alanı, okul başarı puanı ve devamsızlık kriterleri) ile öğrenci almaktadır. Adres/kayıt alanı koşulu dikkate alınmadan kesin yerleşme değerlendirmesi yapılamaz.',
    };
  }

  if (verifiedPlacements.length === 0) {
    return {
      school,
      category: 'veri_yetersiz',
      categoryLabel: 'Veri yetersiz',
      latestVerifiedYear: null,
      latestMinScore: null,
      latestPercentile: null,
      percentileChangeMultiYear: null,
      quotaChangeMultiYear: null,
      studentEstimatedPercentileRange: estimate.estimatedNationalPercentileRange,
      gapToLatestPercentile: null,
      confidenceLevel: 'insufficient',
      reasoningText:
        'Okulun doğrulanmış geçmiş yıl merkezî yerleştirme yüzdelik verisi bulunmadığı için kategori hesaplanmadı.',
    };
  }

  const latest = verifiedPlacements[0];
  const oldest = verifiedPlacements[verifiedPlacements.length - 1];

  const latestPercentile = latest.maxPercentile!;
  const latestMinScore = latest.minScore ?? null;
  const latestVerifiedYear = latest.year;

  const percentileChangeMultiYear =
    verifiedPlacements.length >= 2 && oldest.maxPercentile !== null
      ? Number((latestPercentile - oldest.maxPercentile).toFixed(2))
      : null;

  const quotaChangeMultiYear =
    verifiedPlacements.length >= 2 ? latest.quota - oldest.quota : null;

  // Use official LGS result if entered, otherwise use student's estimated percentile range
  const hasOfficial = Boolean(
    estimate.officialResult &&
      typeof estimate.officialResult.officialGeneralPercentile === 'number'
  );

  if (!hasOfficial && (!estimate.hasEnoughData || !estimate.estimatedNationalPercentileRange)) {
    return {
      school,
      category: 'veri_yetersiz',
      categoryLabel: 'Veri yetersiz',
      latestVerifiedYear,
      latestMinScore,
      latestPercentile,
      percentileChangeMultiYear,
      quotaChangeMultiYear,
      studentEstimatedPercentileRange: null,
      gapToLatestPercentile: null,
      confidenceLevel: 'insufficient',
      reasoningText: `Okulun ${latestVerifiedYear} yılı doğrulanmış taban yüzdeliği %${latestPercentile.toFixed(
        2
      )} (${latestMinScore?.toFixed(
        2
      )} puan) düzeyindedir. Öğrencinin henüz yeterli tam deneme verisi olmadığından karşılaştırma kategorisi üretilmemiştir.`,
    };
  }

  const [optimisticPerc, cautiousPerc] = hasOfficial
    ? [
        estimate.officialResult!.officialGeneralPercentile,
        estimate.officialResult!.officialGeneralPercentile,
      ]
    : estimate.estimatedNationalPercentileRange!;

  const midStudentPerc = hasOfficial
    ? estimate.officialResult!.officialGeneralPercentile
    : estimate.estimatedNationalPercentileMid ??
      Number(((optimisticPerc + cautiousPerc) / 2).toFixed(2));

  // Remember: Smaller percentile number = higher rank (e.g., 0.64% is harder than 3.11%)
  const gapToLatestPercentile = Number(
    (midStudentPerc - latestPercentile).toFixed(2)
  );

  let category: SchoolComparisonCategory = 'rekabetci_hedef';
  let categoryLabel = 'Rekabetçi hedef';
  let reasoningText = '';

  const lowConfidenceSuffix =
    estimate.confidenceLevel === 'low'
      ? ' (Not: Tahmin henüz az sayıda denemeye dayandığından bu sınıflandırma düşük güven düzeyindedir ve kesin sonuç olarak görülmemelidir.)'
      : ' (Bu sınıflandırma geçmiş yıl verilerine dayalı bir tahmindir; kesin yerleşme garantisi vermez.)';

  if (cautiousPerc <= latestPercentile * 0.92 || midStudentPerc <= latestPercentile - 0.8) {
    // Student's cautious/mid percentile is significantly better (smaller) than school's cutoff
    category = 'avantajli_hedef';
    categoryLabel = 'Daha avantajlı hedef';
    reasoningText = `Öğrencinin tahmini yüzdelik aralığı (%${optimisticPerc} – %${cautiousPerc}), okulun ${latestVerifiedYear} yılı doğrulanmış taban yüzdelik diliminden (%${latestPercentile}) daha avantajlı bir bölgede yer alıyor.${lowConfidenceSuffix}`;
  } else if (optimisticPerc <= latestPercentile * 1.15 && midStudentPerc <= latestPercentile + 1.6) {
    // Student's range overlaps or is close to the school's cutoff
    category = 'rekabetci_hedef';
    categoryLabel = 'Rekabetçi hedef';
    reasoningText = `Öğrencinin tahmini yüzdelik aralığı (%${optimisticPerc} – %${cautiousPerc}), okulun ${latestVerifiedYear} yılı taban yüzdeliği (%${latestPercentile}) ile kesişiyor veya çok yakın seyrediyor. Düzenli konu tekrarıyla ulaşılabilir rekabetçi hedeftir.${lowConfidenceSuffix}`;
  } else {
    // Student's optimistic percentile is still wider than the school's cutoff
    category = 'zorlayici_hedef';
    categoryLabel = 'Zorlayıcı hedef';
    reasoningText = `Okulun ${latestVerifiedYear} yılı taban yüzdeliği (%${latestPercentile}), öğrencinin mevcut tahmini aralığından (%${optimisticPerc} – %${cautiousPerc}) yaklaşık %${Math.max(
      0.1,
      gapToLatestPercentile
    ).toFixed(2)} puan daha ileride. Bu hedef için öncelikli konu eksiklerinin kapatılması gerekiyor.${lowConfidenceSuffix}`;
  }

  return {
    school,
    category,
    categoryLabel,
    latestVerifiedYear,
    latestMinScore,
    latestPercentile,
    percentileChangeMultiYear,
    quotaChangeMultiYear,
    studentEstimatedPercentileRange: [optimisticPerc, cautiousPerc],
    gapToLatestPercentile,
    confidenceLevel: estimate.confidenceLevel,
    reasoningText,
  };
}

export function filterAndCompareSchools(
  schools: AntalyaSchoolProgram[],
  estimate: PercentileAndScoreEstimate,
  filters: SchoolFilterOptions
): SchoolComparisonResult[] {
  const query = (filters.searchQuery || '').trim().toLocaleLowerCase('tr-TR');

  return schools
    .filter((s) => {
      if (filters.onlyFavorites && filters.favoriteIds) {
        if (!filters.favoriteIds.includes(s.id)) return false;
      }
      if (filters.district && filters.district !== 'ALL') {
        if (s.district !== filters.district) return false;
      }
      if (filters.schoolType && filters.schoolType !== 'ALL') {
        if (s.schoolType !== filters.schoolType) return false;
      }
      if (filters.admissionType && filters.admissionType !== 'ALL') {
        if (s.admissionType !== filters.admissionType) return false;
      }
      if (filters.boardingFilter === 'HAS_BOARDING') {
        if (s.boardingInfo === 'Yok') return false;
      } else if (filters.boardingFilter === 'NO_BOARDING') {
        if (s.boardingInfo !== 'Yok') return false;
      }
      if (filters.foreignLanguage && filters.foreignLanguage !== 'ALL') {
        if (!s.foreignLanguages.includes(filters.foreignLanguage)) return false;
      }
      if (query) {
        const hay = `${s.schoolName} ${s.programName} ${s.district} ${s.schoolType}`.toLocaleLowerCase(
          'tr-TR'
        );
        if (!hay.includes(query)) return false;
      }
      return true;
    })
    .map((s) => compareSchoolWithStudent(s, estimate))
    .filter((res) => {
      if (
        typeof filters.maxPercentileLimit === 'number' &&
        filters.maxPercentileLimit > 0
      ) {
        if (
          res.latestPercentile === null ||
          res.latestPercentile > filters.maxPercentileLimit
        ) {
          return false;
        }
      }
      if (
        typeof filters.minScoreLimit === 'number' &&
        filters.minScoreLimit > 0
      ) {
        if (
          res.latestMinScore === null ||
          res.latestMinScore < filters.minScoreLimit
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      // Sort central exam schools by latestPercentile ascending (top schools first), then local schools
      if (a.latestPercentile !== null && b.latestPercentile !== null) {
        return a.latestPercentile - b.latestPercentile;
      }
      if (a.latestPercentile !== null) return -1;
      if (b.latestPercentile !== null) return 1;
      return a.school.schoolName.localeCompare(b.school.schoolName, 'tr-TR');
    });
}
