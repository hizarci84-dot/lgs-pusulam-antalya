import React, { useMemo, useState } from 'react';
import {
  Award,
  Columns,
  ExternalLink,
  GraduationCap,
  Info,
  Search,
  Star,
} from 'lucide-react';
import {
  ANTALYA_SCHOOL_DATA_LAST_UPDATED,
  ANTALYA_SCHOOL_DATA_VERSION_NOTE,
} from '../data/antalyaSchools';
import { ANTALYA_DISTRICTS } from '../data/curriculum';
import { filterAndCompareSchools } from '../services/schoolComparisonEngine';
import {
  AntalyaSchoolProgram,
  PercentileAndScoreEstimate,
  SchoolType,
  StudentProfile,
} from '../types/models';

interface SchoolsViewProps {
  student: StudentProfile;
  schools: AntalyaSchoolProgram[];
  estimate: PercentileAndScoreEstimate;
  onToggleFavoriteSchool: (schoolId: string) => Promise<void>;
}

const SCHOOL_TYPES: SchoolType[] = [
  'Fen Lisesi',
  'Anadolu Lisesi',
  'Sosyal Bilimler Lisesi',
  'Anadolu İmam Hatip Lisesi',
  'Mesleki ve Teknik Anadolu Lisesi',
];

export const SchoolsView: React.FC<SchoolsViewProps> = ({
  student,
  schools,
  estimate,
  onToggleFavoriteSchool,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<SchoolType | 'ALL'>(
    'ALL'
  );
  const [admissionFilter, setAdmissionFilter] = useState<
    'ALL' | 'Merkezî Sınav (LGS Puanı)' | 'Yerel Yerleştirme (OBP / Kayıt Alanı)'
  >('Merkezî Sınav (LGS Puanı)');
  const [boardingFilter, setBoardingFilter] = useState<
    'ALL' | 'HAS_BOARDING' | 'NO_BOARDING'
  >('ALL');
  const [languageFilter, setLanguageFilter] = useState<string>('ALL');
  const [maxPercentile, setMaxPercentile] = useState<string>('');
  const [minScore, setMinScore] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Side-by-side comparison selection
  const [compareIds, setCompareIds] = useState<string[]>(
    student.targetSchoolIds.slice(0, 3)
  );
  const [showSideBySideModal, setShowSideBySideModal] = useState(false);

  const comparedResults = useMemo(() => {
    return filterAndCompareSchools(schools, estimate, {
      searchQuery,
      district: districtFilter,
      schoolType: schoolTypeFilter,
      admissionType: admissionFilter,
      boardingFilter,
      foreignLanguage: languageFilter,
      maxPercentileLimit: maxPercentile ? Number(maxPercentile) : null,
      minScoreLimit: minScore ? Number(minScore) : null,
      onlyFavorites,
      favoriteIds: student.targetSchoolIds,
    });
  }, [
    schools,
    estimate,
    searchQuery,
    districtFilter,
    schoolTypeFilter,
    admissionFilter,
    boardingFilter,
    languageFilter,
    maxPercentile,
    minScore,
    onlyFavorites,
    student.targetSchoolIds,
  ]);

  const sideBySideSchools = useMemo(() => {
    const allCompared = filterAndCompareSchools(schools, estimate, {});
    return allCompared.filter((c) => compareIds.includes(c.school.id));
  }, [schools, estimate, compareIds]);

  const toggleCompareSelection = (schoolId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(schoolId)) {
        return prev.filter((id) => id !== schoolId);
      }
      if (prev.length >= 4) {
        alert('Yan yana karşılaştırma için en fazla 4 okul seçebilirsiniz.');
        return prev;
      }
      return [...prev, schoolId];
    });
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header & Section 15 3-Tier Score/Percentile Separation Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-turquoise-600" />
              Antalya Lise Tercih ve Karşılaştırma Asistanı
            </h1>
            <p className="text-xs text-slate-500">
              Son Güncelleme: <strong>{ANTALYA_SCHOOL_DATA_LAST_UPDATED}</strong>{' '}
              • Kaynak: MEB e-Okul Merkezî Yerleştirme Tabloları (2022–2025/2026)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSideBySideModal(true)}
            disabled={compareIds.length === 0}
            className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Columns className="w-4 h-4 text-turquoise-400" />
            Seçili Okulları Yan Yana Karşılaştır ({compareIds.length})
          </button>
        </div>

        {/* Section 15: Explicit 3-Way Data Separation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-slate-500">
              1. Deneme Sağlayıcısının Puanı (Son Sınav)
            </div>
            <div className="text-base font-extrabold text-navy-900 mt-0.5">
              {estimate.latestProviderScore
                ? `${estimate.latestProviderScore.toFixed(2)} Puan`
                : 'Belirtilmedi'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Yalnızca ilgili yayınevinin kendi puanlama ölçeğidir.
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-slate-500">
              2. Deneme İçi Sıralama ve Yüzdelik
            </div>
            <div className="text-sm font-extrabold text-navy-900 mt-0.5">
              {estimate.inExamPercentile !== null
                ? `%${estimate.inExamPercentile}`
                : 'Veri Girilmedi'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {estimate.inExamRankInfo ||
                'Katılımcı sayısı ve sıra girildiğinde grup içi yüzdelik hesaplanır.'}
            </div>
          </div>

          <div className="bg-turquoise-50/70 border border-turquoise-300 rounded-xl p-3">
            <div className="text-[11px] font-bold text-navy-900">
              3. Türkiye Geneli Tahmini Yüzdelik & Puan Bandı
            </div>
            <div className="text-base font-extrabold text-turquoise-900 mt-0.5">
              {estimate.estimatedNationalPercentileRange
                ? `%${estimate.estimatedNationalPercentileRange[0]} – %${estimate.estimatedNationalPercentileRange[1]}`
                : 'Yeterli Tam Deneme Yok'}
              {estimate.estimatedScoreBand && (
                <span className="text-xs font-bold text-navy-800 ml-1.5">
                  ({estimate.estimatedScoreBand[0]}–{estimate.estimatedScoreBand[1]} P)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Güven Düzeyi:{' '}
              <strong>
                {estimate.confidenceLevel === 'high'
                  ? 'Yüksek (Çoklu Deneme)'
                  : estimate.confidenceLevel === 'medium'
                  ? 'Orta'
                  : estimate.confidenceLevel === 'low'
                  ? 'Düşük (Tek Deneme - Kesinlik İçermez)'
                  : 'Veri Yetersiz'}
              </strong>
            </div>
          </div>
        </div>

        {/* Official LGS Result Banner if present */}
        {estimate.officialResult && (
          <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-navy-950">
              <Award className="w-5 h-5 text-amber-700" />
              <span>
                RESMÎ MEB LGS SONUCU AKTİF: {estimate.officialResult.officialScore}{' '}
                Puan • Türkiye Geneli %{estimate.officialResult.officialGeneralPercentile}{' '}
                Yüzdelik Dilim (Tahminlerden ayrı resmî sonuçtur)
              </span>
            </div>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-turquoise-600 shrink-0 mt-0.5" />
          <span>{ANTALYA_SCHOOL_DATA_VERSION_NOTE}</span>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <div className="col-span-2">
            <label className="block font-semibold text-slate-600 mb-1">
              Okul veya Program Ara
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Yusuf Ziya Öner, Antalya Anadolu..."
                className="w-full border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              İlçe
            </label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
            >
              <option value="ALL">Tüm İlçeler</option>
              {ANTALYA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Okul Türü
            </label>
            <select
              value={schoolTypeFilter}
              onChange={(e) => setSchoolTypeFilter(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
            >
              <option value="ALL">Tüm Türler</option>
              {SCHOOL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Pansiyon
            </label>
            <select
              value={boardingFilter}
              onChange={(e) => setBoardingFilter(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
            >
              <option value="ALL">Tümü</option>
              <option value="HAS_BOARDING">Pansiyonlu</option>
              <option value="NO_BOARDING">Pansiyonsuz</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Yabancı Dil
            </label>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
            >
              <option value="ALL">Tüm Diller</option>
              <option value="İngilizce">İngilizce</option>
              <option value="Almanca">Almanca</option>
              <option value="Arapça">Arapça</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Yerleştirme Türü
            </label>
            <select
              value={admissionFilter}
              onChange={(e) => setAdmissionFilter(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white font-semibold"
            >
              <option value="Merkezî Sınav (LGS Puanı)">
                Merkezî Sınav (LGS)
              </option>
              <option value="Yerel Yerleştirme (OBP / Kayıt Alanı)">
                Yerel Yerleştirme (OBP)
              </option>
              <option value="ALL">Tümü</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-navy-900">
              <input
                type="checkbox"
                checked={onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
              />
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Sadece Favori / Hedef Liselerim</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Max Yüzdelik (%):</span>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                value={maxPercentile}
                onChange={(e) => setMaxPercentile(e.target.value)}
                placeholder="Örn: 10"
                className="w-20 border border-slate-300 rounded-lg px-2 py-1"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Min Puan:</span>
              <input
                type="number"
                step="5"
                min="200"
                max="500"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="Örn: 420"
                className="w-20 border border-slate-300 rounded-lg px-2 py-1"
              />
            </div>
          </div>

          <span className="text-slate-500 font-semibold">
            Listelenen Program: {comparedResults.length}
          </span>
        </div>
      </div>

      {/* School Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {comparedResults.map((res) => {
          const { school } = res;
          const isFav = student.targetSchoolIds.includes(school.id);
          const isSelectedForCompare = compareIds.includes(school.id);

          const catBadge =
            res.category === 'avantajli_hedef'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : res.category === 'rekabetci_hedef'
              ? 'bg-sky-100 text-sky-900 border-sky-300'
              : res.category === 'zorlayici_hedef'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-slate-100 text-slate-700 border-slate-300';

          return (
            <div
              key={school.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                {/* Top Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-900 text-white">
                        {school.district}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-turquoise-100 text-navy-900">
                        {school.schoolType}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {school.educationDuration}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-navy-900 mt-1.5">
                      {school.schoolName}
                    </h3>
                    <div className="text-xs font-semibold text-turquoise-800">
                      {school.programName}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border ${catBadge}`}
                    >
                      {res.categoryLabel}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleFavoriteSchool(school.id)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${
                          isFav
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isFav ? 'text-amber-500 fill-amber-400' : ''
                          }`}
                        />
                        {isFav ? 'Hedefim' : 'Hedefe Ekle'}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCompareSelection(school.id)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${
                          isSelectedForCompare
                            ? 'bg-navy-900 text-white border-navy-900'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {isSelectedForCompare ? '✓ Karşılaştırmada' : '+ Karşılaştır'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Row */}
                {res.latestVerifiedYear && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">
                        Son Doğrulanmış Taban Puan ({res.latestVerifiedYear})
                      </div>
                      <div className="font-extrabold text-navy-900 text-sm">
                        {res.latestMinScore?.toFixed(2) || '-'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500">
                        Son Yüzdelik Dilim ({res.latestVerifiedYear})
                      </div>
                      <div className="font-extrabold text-turquoise-800 text-sm">
                        %{res.latestPercentile?.toFixed(2) || '-'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500">
                        4 Yıllık Yüzdelik Değişimi
                      </div>
                      <div className="font-bold text-slate-800">
                        {res.percentileChangeMultiYear !== null
                          ? `${
                              res.percentileChangeMultiYear > 0 ? '+' : ''
                            }${res.percentileChangeMultiYear}%`
                          : 'Sabit'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500">
                        Kontenjan & Değişim
                      </div>
                      <div className="font-bold text-slate-800">
                        {school.yearlyPlacements.find(
                          (y) => y.year === res.latestVerifiedYear
                        )?.quota || '-'}{' '}
                        Kişi
                        {res.quotaChangeMultiYear
                          ? ` (${
                              res.quotaChangeMultiYear > 0 ? '+' : ''
                            }${res.quotaChangeMultiYear})`
                          : ''}
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi-year Historical Table (2022–2025/2026) */}
                {school.yearlyPlacements.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700">
                          <th className="p-1.5 text-left">Yıl / Dönem</th>
                          <th className="p-1.5 text-center">Kontenjan</th>
                          <th className="p-1.5 text-right">Taban Puan</th>
                          <th className="p-1.5 text-right">Yüzdelik Dilim</th>
                          <th className="p-1.5 text-center">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {school.yearlyPlacements.map((yp) => (
                          <tr key={yp.year}>
                            <td className="p-1.5 font-semibold text-navy-900">
                              {yp.year} • 1. Yerleştirme
                            </td>
                            <td className="p-1.5 text-center">{yp.quota}</td>
                            <td className="p-1.5 text-right font-bold">
                              {yp.minScore !== null
                                ? yp.minScore.toFixed(2)
                                : 'Doğrulanmadı'}
                            </td>
                            <td className="p-1.5 text-right font-bold text-turquoise-800">
                              {yp.maxPercentile !== null
                                ? `%${yp.maxPercentile.toFixed(2)}`
                                : '-'}
                            </td>
                            <td className="p-1.5 text-center">
                              {yp.isVerified ? (
                                <span className="text-emerald-700 font-semibold">
                                  ✓ Resmî
                                </span>
                              ) : (
                                <span className="text-amber-700">
                                  Bekleniyor
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Reasoning & Category Explanation */}
                <div className="bg-navy-50/70 border border-navy-200 rounded-xl p-2.5 text-xs text-navy-950">
                  <strong>Neden "{res.categoryLabel}" Kategorisinde?</strong>{' '}
                  {res.reasoningText}
                </div>

                {school.dataConflictNote && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-900">
                    <strong>Veri / Dönem Notu:</strong> {school.dataConflictNote}
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <div>
                  Pansiyon: <strong>{school.boardingInfo}</strong> • Yabancı Dil:{' '}
                  <strong>{school.foreignLanguages.join(', ')}</strong>
                </div>
                <a
                  href={school.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-turquoise-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Kaynak: MEB e-Okul ({school.lastUpdatedAt})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {showSideBySideModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-5xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="bg-navy-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">
                  Antalya Liseleri Yan Yana Karşılaştırma ({sideBySideSchools.length} Okul)
                </h3>
                <p className="text-xs text-turquoise-200">
                  Öğrenci Tahmini Yüzdelik Bandı:{' '}
                  {estimate.estimatedNationalPercentileRange
                    ? `%${estimate.estimatedNationalPercentileRange[0]} – %${estimate.estimatedNationalPercentileRange[1]}`
                    : 'Veri Bekleniyor'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSideBySideModal(false)}
                className="px-3 py-1 rounded-lg bg-navy-800 text-white text-xs font-bold"
              >
                Kapat ✕
              </button>
            </div>

            <div className="p-4 overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-navy-900">
                    <th className="p-2.5 text-left border border-slate-200 w-40">
                      Kriter
                    </th>
                    {sideBySideSchools.map((sc) => (
                      <th
                        key={sc.school.id}
                        className="p-2.5 text-left border border-slate-200 min-w-[190px]"
                      >
                        <div className="font-extrabold text-navy-900">
                          {sc.school.schoolName}
                        </div>
                        <div className="text-[11px] font-normal text-slate-600">
                          {sc.school.programName}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 font-bold border border-slate-200 bg-slate-50">
                      Hedef Kategorisi
                    </td>
                    {sideBySideSchools.map((sc) => (
                      <td
                        key={sc.school.id}
                        className="p-2.5 border border-slate-200 font-bold text-navy-900"
                      >
                        {sc.categoryLabel}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border border-slate-200 bg-slate-50">
                      İlçe & Okul Türü
                    </td>
                    {sideBySideSchools.map((sc) => (
                      <td
                        key={sc.school.id}
                        className="p-2.5 border border-slate-200"
                      >
                        {sc.school.district} • {sc.school.schoolType}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border border-slate-200 bg-slate-50">
                      Son Taban Puanı (2025)
                    </td>
                    {sideBySideSchools.map((sc) => (
                      <td
                        key={sc.school.id}
                        className="p-2.5 border border-slate-200 font-extrabold text-sm text-navy-900"
                      >
                        {sc.latestMinScore?.toFixed(2) || '-'} Puan
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border border-slate-200 bg-slate-50">
                      Son Yüzdelik Dilim (2025)
                    </td>
                    {sideBySideSchools.map((sc) => (
                      <td
                        key={sc.school.id}
                        className="p-2.5 border border-slate-200 font-extrabold text-sm text-turquoise-800"
                      >
                        %{sc.latestPercentile?.toFixed(2) || '-'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border border-slate-200 bg-slate-50">
                      2024 Taban / Yüzdelik
                    </td>
                    {sideBySideSchools.map((sc) => {
                      const y24 = sc.school.yearlyPlacements.find(
                        (y) => y.year === 2024
                      );
                      return (
                        <td
                          key={sc.school.id}
                          className="p-2.5 border border-slate-200"
                        >
                          {y24
                            ? `${y24.minScore?.toFixed(2)} P / %${y24.maxPercentile?.toFixed(2)}`
                            : '-'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border border-slate-200 bg-slate-50">
                      2023 Taban / Yüzdelik
                    </td>
                    {sideBySideSchools.map((sc) => {
                      const y23 = sc.school.yearlyPlacements.find(
                        (y) => y.year === 2023
                      );
                      return (
                        <td
                          key={sc.school.id}
                          className="p-2.5 border border-slate-200"
                        >
                          {y23
                            ? `${y23.minScore?.toFixed(2)} P / %${y23.maxPercentile?.toFixed(2)}`
                            : '-'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border border-slate-200 bg-slate-50">
                      Öğretim Süresi & Yabancı Dil
                    </td>
                    {sideBySideSchools.map((sc) => (
                      <td
                        key={sc.school.id}
                        className="p-2.5 border border-slate-200"
                      >
                        {sc.school.educationDuration} •{' '}
                        {sc.school.foreignLanguages.join(', ')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border border-slate-200 bg-slate-50">
                      Pansiyon Durumu
                    </td>
                    {sideBySideSchools.map((sc) => (
                      <td
                        key={sc.school.id}
                        className="p-2.5 border border-slate-200"
                      >
                        {sc.school.boardingInfo}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border border-slate-200 bg-slate-50">
                      Karşılaştırma Değerlendirmesi
                    </td>
                    {sideBySideSchools.map((sc) => (
                      <td
                        key={sc.school.id}
                        className="p-2.5 border border-slate-200 text-[11px] text-slate-700"
                      >
                        {sc.reasoningText}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
