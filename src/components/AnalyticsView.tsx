import React, { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  LGS_SUBJECTS,
  SUBJECT_MAP,
  resolveEffectiveTopic,
} from '../data/curriculum';
import {
  exportExamsToCsv,
  exportPhotosAppendixFile,
  exportQuestionsToCsv,
  generateComprehensivePdfReport,
} from '../services/exportService';
import { ComprehensivePatternReport } from '../services/patternEngine';
import {
  ExamRecord,
  PercentileAndScoreEstimate,
  QuestionPhotoAsset,
  QuestionRecord,
  SchoolComparisonResult,
  StudentProfile,
  SubjectId,
  WeeklyStudyPlan,
} from '../types/models';
import {
  ErrorReasonDistributionChart,
  NetTrendChart,
  PercentileHistogramChart,
  SubjectBreakdownBarChart,
  SubjectHistoryComparisonChart,
  SubjectNetBars,
} from './Charts';

interface AnalyticsViewProps {
  student: StudentProfile;
  exams: ExamRecord[];
  questions: QuestionRecord[];
  photoAssets: QuestionPhotoAsset[];
  patternReport: ComprehensivePatternReport;
  estimate: PercentileAndScoreEstimate;
  studyPlan: WeeklyStudyPlan | null;
  schoolComparisons: SchoolComparisonResult[];
  onToggleStudyTask: (taskId: string) => Promise<void>;
  onRegenerateStudyPlan: () => Promise<void>;
  onOpenQuestionModal: (questionId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  student,
  exams,
  questions,
  photoAssets,
  patternReport,
  estimate,
  studyPlan,
  schoolComparisons,
  onToggleStudyTask,
  onRegenerateStudyPlan,
  onOpenQuestionModal,
}) => {
  const [activeSection, setActiveSection] = useState<
    'charts' | 'patterns' | 'study_plan' | 'export_reports'
  >('charts');
  const [selectedSubjectForHistory, setSelectedSubjectForHistory] =
    useState<SubjectId>('matematik');
  const [trendWindow, setTrendWindow] = useState<5 | 10 | 'all'>(10);

  const sortedExams = [...exams].sort((a, b) => b.date.localeCompare(a.date));
  const latestExam = sortedExams[0] || null;
  const previousExam = sortedExams[1] || null;

  // Review Success Stats (Section 17 #7: Tekrar çözüm başarı raporu)
  const masteredCount = questions.filter(
    (q) => q.learningStatus === 'mastered_independent'
  ).length;
  const helpedCount = questions.filter(
    (q) => q.learningStatus === 'understood_with_help'
  ).length;
  const needsStudyCount = questions.filter(
    (q) => q.learningStatus === 'needs_topic_study'
  ).length;
  const unsolvedCount = questions.filter(
    (q) => q.learningStatus === 'unsolved'
  ).length;
  const unsolvedQuestionsList = questions.filter(
    (q) => q.learningStatus !== 'mastered_independent'
  );

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header & Export Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-turquoise-600" />
            Ayrıntılı Gelişim, Hata Örüntüsü ve Çalışma Planı Merkezi
          </h1>
          <p className="text-xs text-slate-500">
            Tekrarlayan konu eksikleri, hata nedenleri, haftalık çalışma planı ve dışa aktarılabilir veli raporları
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              generateComprehensivePdfReport({
                student,
                exams: sortedExams,
                questions,
                photoAssets,
                patternReport,
                estimate,
                studyPlan,
                schoolComparisons,
                includePhotos: true,
              })
            }
            className="px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4 text-turquoise-400" />
            PDF Gelişim Raporu (Fotoğraflı)
          </button>

          <button
            type="button"
            onClick={() => exportExamsToCsv(student, sortedExams)}
            className="px-3 py-2 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Denemeler CSV/Excel
          </button>

          <button
            type="button"
            onClick={() => exportQuestionsToCsv(student, questions, sortedExams)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300"
          >
            <Download className="w-4 h-4" />
            Yanlış Defteri CSV/Excel
          </button>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 flex overflow-x-auto gap-1 shadow-2xs">
        {(
          [
            {
              id: 'charts',
              label: '1. 📊 Mobil Grafikler & Gelişim',
            },
            {
              id: 'patterns',
              label: '2. 🎯 Tekrarlayan Hata & Konu Eksikleri',
            },
            {
              id: 'study_plan',
              label: '3. 📅 Haftalık Çalışma Planı',
            },
            {
              id: 'export_reports',
              label: '4. 📥 Rapor & Çözülemeyenler',
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex-1 ${
              activeSection === tab.id
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: MOBİL UYUMLU GRAFİKLER VE GELİŞİM ANALİZİ */}
      {activeSection === 'charts' && (
        <div className="space-y-4">
          {/* 1. Net, Puan ve Yüzdelik Dilim Gelişim Trendi */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-turquoise-600" />
                  Net, 2026 Puan ve Yüzdelik Dilim Gelişim Çizgisi
                </h3>
                <p className="text-[11px] text-slate-500">
                  Denemeler arası performans ilerleyişiniz (Çizgi üzerindeki noktalara dokunarak sınav detaylarını görebilirsiniz)
                </p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTrendWindow(5)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    trendWindow === 5
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Son 5
                </button>
                <button
                  type="button"
                  onClick={() => setTrendWindow(10)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    trendWindow === 10
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Son 10
                </button>
                <button
                  type="button"
                  onClick={() => setTrendWindow('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    trendWindow === 'all'
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Tümü
                </button>
              </div>
            </div>
            <NetTrendChart exams={exams} limit={trendWindow} />
          </div>

          {/* 2. Yüzdelik Dilim Histogramı (Antalya Liseleri Yerleşim Bantları) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div>
              <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Yüzdelik Dilim Histogramı (Antalya Liseleri Eşiklerine Göre Dağılım)
              </h3>
              <p className="text-[11px] text-slate-500">
                Tüm deneme sonuçlarınızın Yusuf Ziya Öner Fen, Antalya Anadolu, Adem-Tolunay ve diğer liselerin taban yüzdelik dilim aralıklarındaki frekans dağılımı
              </p>
            </div>
            <PercentileHistogramChart exams={exams} student={student} />
          </div>

          {/* 3. Ders Bazında Doğru, Yanlış ve Boş Dağılım Çubuk Grafikleri */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div>
              <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Ders Bazında Doğru, Yanlış ve Boş Dağılım Grafikleri
              </h3>
              <p className="text-[11px] text-slate-500">
                Tüm denemelerin ortalamasını veya tek tek deneme karnelerini renkli çubuklarla inceleyin
              </p>
            </div>
            <SubjectBreakdownBarChart exams={exams} />
          </div>

          {/* 4. Hata Nedenleri Dağılım Grafiği (Dikkat, İşlem, Konu Eksikliği) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div>
              <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Hata Nedenleri Dağılım Grafiği (Puan Kayıp Kaynakları)
              </h3>
              <p className="text-[11px] text-slate-500">
                Yanlış ve boş sorularınızın nedenlerine göre dağılımı (Dikkat, formül unutma, işlem hatası vb.)
              </p>
            </div>
            <ErrorReasonDistributionChart questions={questions} />
          </div>

          {/* 5. Ders Bazında Net Değişimi Geçmiş Çizgi Grafiği & Son Deneme Karnesi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-extrabold text-sm text-navy-900">
                  Ders Bazında Net Değişimi
                </h3>
                <select
                  value={selectedSubjectForHistory}
                  onChange={(e) =>
                    setSelectedSubjectForHistory(e.target.value as SubjectId)
                  }
                  className="border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-navy-900 bg-white outline-none focus:ring-2 focus:ring-turquoise-500"
                >
                  {LGS_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <SubjectHistoryComparisonChart
                exams={exams}
                selectedSubjectId={selectedSubjectForHistory}
              />
            </div>

            {latestExam && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-extrabold text-sm text-navy-900">
                  Son Deneme Karnesi ({latestExam.name})
                </h3>
                <SubjectNetBars
                  exam={latestExam}
                  previousExam={previousExam}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: TEKRARLAYAN HATA VE KONU EKSİKLİĞİ MOTORU (Section 10) */}
      {activeSection === 'patterns' && (
        <div className="space-y-4">
          {!patternReport.hasData || patternReport.topicMetrics.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-bold text-navy-900">
                Henüz Konu Bazlı Hata Örüntüsü Oluşmadı
              </p>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Uygulama sahte veya örnek analizleri gerçek sonuç gibi göstermez. Deneme sınavlarınızı ve yanlış/boş sorularınızın konularını kaydettiğinizde tekrarlayan hata motoru gerçek kayıtlarınız üzerinden hesaplama yapacaktır.
              </p>
            </div>
          ) : (
            <>
              {/* Key Diagnostic Answers to the 7 Questions in Section 10.3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Q1 & Q5: Hangi konularda tekrar tekrar yanlış yapılıyor / yeni sorularda ortaya çıkıyor */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5">
                  <h3 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Tekrar Tekrar Yanlış Yapılan Konular (
                    {patternReport.recurringWrongTopics.length})
                  </h3>
                  {patternReport.recurringWrongTopics.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Birden fazla denemede tekrarlanan yanlış konusu bulunmuyor.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {patternReport.recurringWrongTopics.map((tm) => (
                        <div
                          key={tm.topicId}
                          className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-navy-900">
                              {SUBJECT_MAP[tm.subjectId]?.name} • {tm.topicName}
                            </span>
                            <span className="bg-rose-600 text-white font-bold px-2 py-0.5 rounded text-[11px]">
                              Öncelik: {tm.priorityScore}/100
                            </span>
                          </div>
                          <p className="text-slate-700">{tm.explanationText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Q4 & Q6: Hangi konularda önceki yanlışlar düzeldi & Hangi konularda tekrar yapıldığı halde başarı artmadı */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Önceki Yanlışların Düzeldiği Konular (
                      {patternReport.improvedTopics.length})
                    </h3>
                    {patternReport.improvedTopics.length === 0 ? (
                      <p className="text-xs text-slate-500 mt-1">
                        Henüz tam bağımsız çözüme ulaşmış geçmiş hata konusu bulunmuyor.
                      </p>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {patternReport.improvedTopics.map((tm) => (
                          <div
                            key={tm.topicId}
                            className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs"
                          >
                            <div className="font-bold text-emerald-950">
                              ✓ {SUBJECT_MAP[tm.subjectId]?.shortName} •{' '}
                              {tm.topicName}
                            </div>
                            <div className="text-emerald-800 text-[11px] mt-0.5">
                              {tm.explanationText}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="font-bold text-sm text-navy-900">
                      Tekrar Çalışması Yapıldığı Hâlde Hatası Süren Konular (
                      {patternReport.persistingDespiteReviewTopics.length})
                    </h3>
                    {patternReport.persistingDespiteReviewTopics.length === 0 ? (
                      <p className="text-xs text-slate-500 mt-1">
                        Tekrar çalışması sonrası hatası devam eden konu bulunmuyor.
                      </p>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {patternReport.persistingDespiteReviewTopics.map((tm) => (
                          <div
                            key={tm.topicId}
                            className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs"
                          >
                            <div className="font-bold text-amber-950">
                              {SUBJECT_MAP[tm.subjectId]?.shortName} •{' '}
                              {tm.topicName}
                            </div>
                            <div className="text-amber-900 text-[11px] mt-0.5">
                              {tm.explanationText}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Q7: Net artarken belirli konularda hata devam eden dersler */}
              {patternReport.subjectsRisingButTopicPersisting.length > 0 && (
                <div className="bg-turquoise-50 border border-turquoise-300 rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-turquoise-700" />
                    Ders Neti Artarken Belirli Konuda Hatası Devam Eden Alanlar
                  </h3>
                  {patternReport.subjectsRisingButTopicPersisting.map((ins, i) => (
                    <div
                      key={i}
                      className="bg-white p-3 rounded-xl border border-turquoise-200 text-xs text-navy-900"
                    >
                      {ins.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Section 10.5: Hata Nedeni Analizi */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                <h3 className="font-bold text-sm text-navy-900">
                  Hata Nedenleri Analizi ve Stratejik Öneriler
                </h3>
                {patternReport.errorReasonDiagnostics.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Sorulara henüz hata nedeni etiketi eklenmedi. (Hata nedeni kullanıcı tarafından belirtilmediğinde yapay zekâ kesin neden uydurmaz.)
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patternReport.errorReasonDiagnostics.map((diag) => (
                      <div
                        key={diag.reasonCode}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-navy-900">
                            {diag.label}
                          </span>
                          <span className="font-bold bg-navy-900 text-white px-2 py-0.5 rounded text-[11px]">
                            {diag.count} Soru (%{diag.percentage})
                          </span>
                        </div>
                        {diag.affectedTopics.length > 0 && (
                          <div className="text-[11px] text-slate-500">
                            Görülme Konuları: {diag.affectedTopics.join(', ')}
                          </div>
                        )}
                        <div className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
                          <strong>Öneri:</strong> {diag.strategicRecommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Full Topic Priority Table (Distinguishing Recurring vs Single Occurrence!) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-navy-900">
                      Tüm Konular Hata Örüntüsü ve Öncelik Puanı Tablosu
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Tek bir soruda yapılan tek seferlik hatalar otomatik olarak ciddi eksiklik etiketlenmez; doğru yapılan sorular da başarı hesabına katılır.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-navy-900">
                        <th className="p-2.5 text-left">Ders & Konu</th>
                        <th className="p-2.5 text-center">Yanlış / Boş</th>
                        <th className="p-2.5 text-center">Deneme Sayısı</th>
                        <th className="p-2.5 text-center">Örüntü Durumu</th>
                        <th className="p-2.5 text-center">Öncelik Puanı</th>
                        <th className="p-2.5 text-left">Değerlendirme</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {patternReport.topicMetrics.map((tm) => {
                        const statusBadge =
                          tm.trendStatus === 'recurring_critical'
                            ? {
                                text: 'Tekrar Eden Ciddi Eksik',
                                cls: 'bg-rose-100 text-rose-800',
                              }
                            : tm.trendStatus === 'persisting_despite_review'
                            ? {
                                text: 'Tekrara Rağmen Sürüyor',
                                cls: 'bg-amber-100 text-amber-900',
                              }
                            : tm.trendStatus === 'improving'
                            ? {
                                text: 'Düzeldi / Gelişiyor',
                                cls: 'bg-emerald-100 text-emerald-800',
                              }
                            : tm.trendStatus === 'single_occurrence'
                            ? {
                                text: 'Tek Seferlik Hata (Düşük Öncelik)',
                                cls: 'bg-slate-100 text-slate-700',
                              }
                            : {
                                text: 'Yeni Gözlemlendi',
                                cls: 'bg-sky-100 text-sky-800',
                              };

                        return (
                          <tr key={tm.topicId} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <div className="font-bold text-navy-900">
                                {tm.topicName}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {SUBJECT_MAP[tm.subjectId]?.name}
                              </div>
                            </td>
                            <td className="p-2.5 text-center font-semibold">
                              <span className="text-rose-600">
                                {tm.totalWrongCount} Y
                              </span>{' '}
                              /{' '}
                              <span className="text-amber-600">
                                {tm.totalBlankCount} B
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              {tm.examsWithErrorsCount} deneme
                            </td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded font-bold text-[11px] ${statusBadge.cls}`}
                              >
                                {statusBadge.text}
                              </span>
                            </td>
                            <td className="p-2.5 text-center font-extrabold text-navy-900">
                              {tm.priorityScore} / 100
                            </td>
                            <td className="p-2.5 text-[11px] text-slate-700 max-w-md">
                              {tm.explanationText}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* SECTION 2: KİŞİSELLEŞTİRİLMİŞ HAFTALIK ÇALIŞMA PLANI (Section 13) */}
      {activeSection === 'study_plan' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-turquoise-600" />
                Kişiselleştirilmiş Haftalık Çalışma Programı (Haftalık Hedef:{' '}
                {student.weeklyStudyHours} Saat)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {studyPlan?.weeklySummaryReport}
              </p>
            </div>

            <button
              type="button"
              onClick={onRegenerateStudyPlan}
              className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-turquoise-400" />
              Son Verilerle Planı Yeniden Hesapla
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-navy-900">
                  <th className="p-2.5 text-left">Gün</th>
                  <th className="p-2.5 text-left">Ders & Konu</th>
                  <th className="p-2.5 text-left">Seçilme Nedeninin Açıklaması</th>
                  <th className="p-2.5 text-center">Süre</th>
                  <th className="p-2.5 text-center">Soru Hedefi</th>
                  <th className="p-2.5 text-center">Tekrar Sorusu</th>
                  <th className="p-2.5 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(studyPlan?.tasks || []).map((task) => (
                  <tr
                    key={task.id}
                    className={
                      task.completed ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                    }
                  >
                    <td className="p-2.5 font-bold text-navy-900">
                      {task.dayName}
                    </td>
                    <td className="p-2.5">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-900 text-white mr-1.5">
                        {SUBJECT_MAP[task.subjectId]?.shortName}
                      </span>
                      <strong className="text-navy-900">{task.topicName}</strong>
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-700 max-w-md">
                      <span className="font-bold text-turquoise-800 mr-1">
                        [Öncelik #{task.priorityTier}]
                      </span>
                      {task.priorityReason}
                    </td>
                    <td className="p-2.5 text-center font-semibold">
                      {task.durationMinutes} dk
                    </td>
                    <td className="p-2.5 text-center font-semibold">
                      {task.targetQuestionCount} soru
                    </td>
                    <td className="p-2.5 text-center">
                      {task.reviewQuestionIds.length} soru
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleStudyTask(task.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                          task.completed
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {task.completed ? '✓ Tamamlandı' : 'Tamamla'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* SECTION 4: TEKRAR ÇÖZÜM BAŞARI RAPORU, ÇÖZÜLEMEYEN SORULAR & DIŞA AKTARMA */}
      {activeSection === 'export_reports' && (
        <div className="space-y-4">
          {/* Review Success Report */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
              <div className="text-[11px] font-semibold text-emerald-700">
                Yardımsız Doğru Çözülen
              </div>
              <div className="text-xl font-extrabold text-navy-900 mt-1">
                {masteredCount} Soru
              </div>
              <div className="text-[11px] text-slate-500">
                Gerçek öğrenme ilerlemesi
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-sky-200">
              <div className="text-[11px] font-semibold text-sky-700">
                İpucu / Çözümle Anlaşılan
              </div>
              <div className="text-xl font-extrabold text-navy-900 mt-1">
                {helpedCount} Soru
              </div>
              <div className="text-[11px] text-slate-500">
                Bağımsız tekrar bekliyor
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-rose-200">
              <div className="text-[11px] font-semibold text-rose-700">
                Hâlâ Çözülemeyen (Konu Listesi)
              </div>
              <div className="text-xl font-extrabold text-navy-900 mt-1">
                {needsStudyCount} Soru
              </div>
              <div className="text-[11px] text-slate-500">
                Öncelikli çalışma alanında
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-600">
                Henüz Tekrar Edilmeyen
              </div>
              <div className="text-xl font-extrabold text-navy-900 mt-1">
                {unsolvedCount} Soru
              </div>
              <div className="text-[11px] text-slate-500">
                Sadece fotoğrafı arşivlendi
              </div>
            </div>
          </div>

          {/* Unsolved Questions List (Section 17 #8) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-navy-900">
              Çözülemeyen ve Bağımsız Tekrar Bekleyen Sorular Listesi (
              {unsolvedQuestionsList.length})
            </h3>
            {unsolvedQuestionsList.length === 0 ? (
              <p className="text-xs text-slate-500">
                Tüm kayıtlı sorular yardımsız doğru çözüldü!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {unsolvedQuestionsList.map((q) => {
                  const resolved = resolveEffectiveTopic(q);
                  return (
                    <div
                      key={q.id}
                      onClick={() => onOpenQuestionModal(q.id)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-turquoise-50/50 border border-slate-200 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-navy-900">
                          {SUBJECT_MAP[q.subjectId]?.shortName} •{' '}
                          {resolved.topicName}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {q.status === 'wrong' ? 'Yanlış' : 'Boş'} • Sonraki
                          Tekrar: {q.nextReviewDate}
                        </div>
                      </div>
                      <span className="text-turquoise-700 font-bold">
                        Aç & Çöz →
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comprehensive PDF & Export Options Card (Section 17) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-navy-900">
              Rapor ve Veri Dışa Aktarma Seçenekleri (PDF, CSV/Excel ve Fotoğraf Ek Paketi)
            </h3>
            <p className="text-slate-600">
              Veli gelişim raporunu küçük soru görselleriyle birlikte veya sade metin/tablo olarak PDF formatında yazdırabilir, tüm kayıtları Excel uyumlu CSV olarak indirebilir ya da çok sayıda fotoğraf varsa ayrı ek dosya olarak dışa aktarabilirsiniz.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  generateComprehensivePdfReport({
                    student,
                    exams: sortedExams,
                    questions,
                    photoAssets,
                    patternReport,
                    estimate,
                    studyPlan,
                    schoolComparisons,
                    includePhotos: true,
                  })
                }
                className="p-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-turquoise-400" />
                PDF Raporu (Fotoğraflı)
              </button>

              <button
                type="button"
                onClick={() =>
                  generateComprehensivePdfReport({
                    student,
                    exams: sortedExams,
                    questions,
                    photoAssets,
                    patternReport,
                    estimate,
                    studyPlan,
                    schoolComparisons,
                    includePhotos: false,
                  })
                }
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                PDF Raporu (Sadece Tablo)
              </button>

              <button
                type="button"
                onClick={() => exportExamsToCsv(student, sortedExams)}
                className="p-3 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Denemeler CSV / Excel
              </button>

              <button
                type="button"
                onClick={() =>
                  exportPhotosAppendixFile(student, questions, photoAssets)
                }
                className="p-3 bg-slate-100 hover:bg-slate-200 text-navy-900 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-turquoise-700" />
                Fotoğraflar Ayrı Ek Dosya ({photoAssets.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
