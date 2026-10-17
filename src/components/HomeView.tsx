import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  FileBarChart2,
  GraduationCap,
  PlusCircle,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { ANTALYA_SCHOOL_DATA_LAST_UPDATED } from '../data/antalyaSchools';
import { SUBJECT_MAP } from '../data/curriculum';
import { ComprehensivePatternReport } from '../services/patternEngine';
import {
  ExamRecord,
  PercentileAndScoreEstimate,
  QuestionRecord,
  ReviewTask,
  SchoolComparisonResult,
  StudentProfile,
  WeeklyStudyPlan,
} from '../types/models';
import {
  NetTrendChart,
  PercentileHistogramChart,
  SubjectBreakdownBarChart,
  SubjectNetBars,
} from './Charts';

interface HomeViewProps {
  student: StudentProfile;
  exams: ExamRecord[];
  questions: QuestionRecord[];
  reviewTasks: ReviewTask[];
  patternReport: ComprehensivePatternReport;
  estimate: PercentileAndScoreEstimate;
  studyPlan: WeeklyStudyPlan | null;
  targetSchoolComparisons: SchoolComparisonResult[];
  onQuickAddExam: () => void;
  onQuickUploadPhoto: () => void;
  onNavigateTab: (tab: 'home' | 'exams' | 'notebook' | 'schools' | 'analytics') => void;
  onSelectExamDetail: (examId: string) => void;
  onOpenQuestionModal: (questionId: string) => void;
  onToggleStudyTask: (taskId: string) => Promise<void>;
}

export const HomeView: React.FC<HomeViewProps> = ({
  student,
  exams,
  questions,
  reviewTasks,
  patternReport,
  estimate,
  studyPlan,
  targetSchoolComparisons,
  onQuickAddExam,
  onQuickUploadPhoto,
  onNavigateTab,
  onSelectExamDetail,
  onOpenQuestionModal,
  onToggleStudyTask,
}) => {
  const [trendLimit, setTrendLimit] = useState<5 | 10>(5);

  const sortedExams = [...exams].sort((a, b) => b.date.localeCompare(a.date));
  const latestExam = sortedExams[0] || null;
  const previousExam = sortedExams[1] || null;
  const netDelta =
    latestExam && previousExam
      ? Number((latestExam.totalNet - previousExam.totalNet).toFixed(2))
      : null;

  // Compute most wrong subject and most blank subject in latest exam (or across exams)
  let mostWrongSubject: { name: string; count: number } | null = null;
  let mostBlankSubject: { name: string; count: number } | null = null;

  if (latestExam) {
    const sortedByWrong = [...latestExam.subjectResults].sort(
      (a, b) => b.wrong - a.wrong
    );
    if (sortedByWrong[0] && sortedByWrong[0].wrong > 0) {
      mostWrongSubject = {
        name: SUBJECT_MAP[sortedByWrong[0].subjectId]?.name || '',
        count: sortedByWrong[0].wrong,
      };
    }

    const sortedByBlank = [...latestExam.subjectResults].sort(
      (a, b) => b.blank - a.blank
    );
    if (sortedByBlank[0] && sortedByBlank[0].blank > 0) {
      mostBlankSubject = {
        name: SUBJECT_MAP[sortedByBlank[0].subjectId]?.name || '',
        count: sortedByBlank[0].blank,
      };
    }
  }

  const dueTodayReviews = reviewTasks.filter((t) => t.isDueTodayOrOverdue);
  const incompleteStudyTasks = (studyPlan?.tasks || []).filter(
    (t) => !t.completed
  );

  return (
    <div className="space-y-4 pb-8">
      {/* Hero Banner & Quick Actions (6 Required Quick Actions) */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white rounded-2xl p-4 shadow-md border border-navy-700">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-turquoise-300">
                LGS Pusulam – Antalya
              </span>
            </div>
            <h1 className="text-lg font-extrabold mt-0.5">
              {student.nickname
                ? `${student.nickname} • Öğrenme ve Tercih Paneli`
                : 'Öğrenci Öğrenme ve Tercih Paneli'}
            </h1>
            <p className="text-xs text-slate-300">
              {student.gradeLevel} • {student.antalyaDistrict} • Hedef Yüzdelik:{' '}
              <strong className="text-turquoise-300">
                %{student.targetPercentile}
              </strong>
            </p>
          </div>

          <div className="text-right text-[11px] text-slate-300 bg-navy-950/50 px-3 py-1.5 rounded-xl border border-navy-700">
            <div>Antalya Okul Verileri Güncellik Tarihi:</div>
            <strong className="text-turquoise-300">
              {ANTALYA_SCHOOL_DATA_LAST_UPDATED} (MEB / e-Okul)
            </strong>
          </div>
        </div>

        {/* 6 Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={onQuickAddExam}
            className="bg-turquoise-500 hover:bg-turquoise-400 text-navy-950 font-bold text-xs p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Yeni Deneme Ekle</span>
          </button>

          <button
            type="button"
            onClick={onQuickUploadPhoto}
            className="bg-white/12 hover:bg-white/20 text-white font-semibold text-xs p-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-white/15 transition"
          >
            <Camera className="w-4 h-4 text-turquoise-300 shrink-0" />
            <span>Yanlış Fotoğrafı Yükle</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('notebook')}
            className="bg-white/12 hover:bg-white/20 text-white font-semibold text-xs p-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-white/15 transition"
          >
            <BookOpen className="w-4 h-4 text-turquoise-300 shrink-0" />
            <span>Dijital Yanlış Defteri</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('home-reviews-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else onNavigateTab('notebook');
            }}
            className="bg-white/12 hover:bg-white/20 text-white font-semibold text-xs p-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-white/15 transition"
          >
            <RefreshCw className="w-4 h-4 text-turquoise-300 shrink-0" />
            <span>
              Bugünkü Tekrarlar ({dueTodayReviews.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('schools')}
            className="bg-white/12 hover:bg-white/20 text-white font-semibold text-xs p-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-white/15 transition"
          >
            <GraduationCap className="w-4 h-4 text-turquoise-300 shrink-0" />
            <span>Hedef Liseleri Karşılaştır</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('analytics')}
            className="bg-white/12 hover:bg-white/20 text-white font-semibold text-xs p-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-white/15 transition"
          >
            <FileBarChart2 className="w-4 h-4 text-turquoise-300 shrink-0" />
            <span>Gelişim Raporunu Aç</span>
          </button>
        </div>
      </div>

      {/* Empty State Guidance when no exams exist yet */}
      {exams.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-turquoise-400 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-turquoise-50 text-turquoise-600 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-base font-extrabold text-navy-900">
            Henüz Deneme Sınavı Kaydı Bulunmuyor
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Yanıltıcı veya boş grafikler göstermek yerine sistem gerçek deneme verilerinizi bekliyor. İlk LGS deneme sınavı sonucunuzu girerek net hesaplama, tekrarlayan konu eksikliği analizi ve Antalya lise karşılaştırma döngüsünü başlatın.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onQuickAddExam}
              className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-turquoise-400" />
              İlk Deneme Sınavını Ekle
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards Row: Latest Exam Date, Total Net, Net Change, Most Wrong & Most Blank Subject */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. Son deneme tarihi */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-turquoise-600" />
                Son Deneme Tarihi
              </div>
              <div className="text-base font-extrabold text-navy-900 mt-1">
                {latestExam?.date}
              </div>
              <div className="text-[11px] text-slate-600 truncate mt-0.5" title={latestExam?.name}>
                {latestExam?.name}
              </div>
            </div>

            {/* 2. Son denemedeki toplam net ve 2026 LGS Puanı */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500">
                Son Deneme Net & 2026 LGS
              </div>
              <div className="text-xl font-extrabold text-navy-900 mt-1">
                {latestExam?.totalNet.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">
                  / {latestExam?.totalQuestions} Net
                </span>
              </div>
              {latestExam?.providerScore && (
                <div className="text-xs font-bold text-turquoise-700 mt-0.5">
                  {latestExam.providerScore.toFixed(2)} Puan
                  {latestExam.providerPercentile
                    ? ` • %${Number(latestExam.providerPercentile).toFixed(2)} Dilim`
                    : ''}
                </div>
              )}
              <div className="text-[11px] text-slate-600 mt-0.5">
                {latestExam?.totalCorrect}D • {latestExam?.totalWrong}Y •{' '}
                {latestExam?.totalBlank}B
              </div>
            </div>

            {/* 3. Önceki denemeye göre net değişimi */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500">
                Önceki Denemeye Göre Değişim
              </div>
              {netDelta !== null ? (
                <div
                  className={`text-lg font-extrabold mt-1 flex items-center gap-1 ${
                    netDelta > 0
                      ? 'text-emerald-700'
                      : netDelta < 0
                      ? 'text-rose-700'
                      : 'text-slate-700'
                  }`}
                >
                  {netDelta > 0 ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : netDelta < 0 ? (
                    <ArrowDownRight className="w-5 h-5" />
                  ) : null}
                  {netDelta > 0 ? `+${netDelta} Net` : `${netDelta} Net`}
                </div>
              ) : (
                <div className="text-xs font-semibold text-slate-500 mt-2">
                  İlk deneme (Karşılaştırma için 2. deneme bekleniyor)
                </div>
              )}
              {previousExam && (
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  Önceki: {previousExam.totalNet.toFixed(2)} Net
                </div>
              )}
            </div>

            {/* 6. En çok yanlış yapılan ders */}
            <div className="bg-white rounded-xl p-3.5 border border-rose-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-rose-700">
                En Çok Yanlış Yapılan Ders
              </div>
              <div className="text-sm font-extrabold text-navy-900 mt-1">
                {mostWrongSubject ? mostWrongSubject.name : 'Yanlış Yok'}
              </div>
              <div className="text-xs font-bold text-rose-600 mt-0.5">
                {mostWrongSubject
                  ? `${mostWrongSubject.count} Yanlış (Son Deneme)`
                  : 'Tebrikler!'}
              </div>
            </div>

            {/* 7. En çok boş bırakılan ders */}
            <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-amber-800">
                En Çok Boş Bırakılan Ders
              </div>
              <div className="text-sm font-extrabold text-navy-900 mt-1">
                {mostBlankSubject ? mostBlankSubject.name : 'Boş Yok'}
              </div>
              <div className="text-xs font-bold text-amber-700 mt-0.5">
                {mostBlankSubject
                  ? `${mostBlankSubject.count} Boş (Son Deneme)`
                  : 'Tüm sorular cevaplandı'}
              </div>
            </div>
          </div>

          {/* 4 & 5: Gelişim Grafiği (Son 5 / Son 10) & Ders Bazında Netler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-sm text-navy-900">
                    Toplam Net Gelişim Grafiği
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Deneme noktasına dokunarak ayrıntısını açabilirsiniz
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setTrendLimit(5)}
                    className={`px-2.5 py-1 rounded-md font-bold ${
                      trendLimit === 5
                        ? 'bg-navy-900 text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    Son 5 Deneme
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendLimit(10)}
                    className={`px-2.5 py-1 rounded-md font-bold ${
                      trendLimit === 10
                        ? 'bg-navy-900 text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    Son 10 Deneme
                  </button>
                </div>
              </div>
              <NetTrendChart
                exams={exams}
                limit={trendLimit}
                onSelectExam={onSelectExamDetail}
              />
            </div>

            {latestExam && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-sm text-navy-900">
                      Son Deneme Ders Bazında Netler
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {latestExam.name} ({latestExam.date})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectExamDetail(latestExam.id)}
                    className="text-xs font-bold text-turquoise-700 hover:underline"
                  >
                    Deneme Detayı →
                  </button>
                </div>
                <SubjectNetBars
                  exam={latestExam}
                  previousExam={previousExam}
                />
              </div>
            )}
          </div>

          {/* Yüzdelik Dilim Histogramı ve Ders Bazında Doğru, Yanlış, Boş Grafikleri */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div>
                <h2 className="font-bold text-sm text-navy-900">
                  Deneme Yüzdelik Dilim Dağılımı (Histogram)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Öğrencinin tüm denemelerindeki Türkiye geneli yüzdelik dilim dağılımı
                </p>
              </div>
              <PercentileHistogramChart exams={exams} student={student} />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div>
                <h2 className="font-bold text-sm text-navy-900">
                  Ders Bazında Doğru, Yanlış ve Boş Grafiği
                </h2>
                <p className="text-[11px] text-slate-500">
                  Yeşil: Doğru • Kırmızı: Yanlış • Sarı: Boş (Tüm denemeler veya tekil deneme)
                </p>
              </div>
              <SubjectBreakdownBarChart exams={exams} />
            </div>
          </div>

          {/* 8 & 9: Tekrar Eden Konu Eksikleri & Bugün Tekrar Edilmesi Gereken Sorular */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 8. Tekrar eden konu eksikleri */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Tekrar Eden Konu Eksikleri
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigateTab('analytics')}
                  className="text-xs font-bold text-turquoise-700 hover:underline"
                >
                  Tüm Hata Analizi →
                </button>
              </div>

              {patternReport.recurringWrongTopics.length === 0 &&
              patternReport.highBlankTopics.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600">
                  Birden fazla denemede tekrar eden kritik bir konu eksikliği henüz tespit edilmedi. Yanlış ve boş sorularınıza konu etiketi ekledikçe örüntü motoru otomatik güncellenir.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    ...patternReport.recurringWrongTopics,
                    ...patternReport.highBlankTopics.filter(
                      (hb) =>
                        !patternReport.recurringWrongTopics.some(
                          (rw) => rw.topicId === hb.topicId
                        )
                    ),
                  ]
                    .slice(0, 4)
                    .map((tm) => (
                      <div
                        key={tm.topicId}
                        className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-navy-900">
                            {SUBJECT_MAP[tm.subjectId]?.shortName} •{' '}
                            {tm.topicName}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                            Öncelik: {tm.priorityScore}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {tm.explanationText}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 9. Bugün tekrar edilmesi gereken sorular */}
            <div
              id="home-reviews-card"
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-turquoise-600" />
                  Bugün Tekrar Edilmesi Gereken Sorular ({dueTodayReviews.length})
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigateTab('notebook')}
                  className="text-xs font-bold text-turquoise-700 hover:underline"
                >
                  Yanlış Defterini Aç →
                </button>
              </div>

              {dueTodayReviews.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
                  Bugün için bekleyen veya tarihi geçmiş soru tekrarınız bulunmuyor! Yeni yanlış/boş soruları yüklediğinizde 1-3-7 gün tekrar planı otomatik oluşturulur.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {dueTodayReviews.slice(0, 6).map((task) => (
                    <div
                      key={task.questionId}
                      onClick={() => onOpenQuestionModal(task.questionId)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-turquoise-50/60 border border-slate-200 cursor-pointer flex items-center justify-between gap-2 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              task.status === 'wrong'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {task.status === 'wrong' ? 'YANLIŞ' : 'BOŞ'}
                          </span>
                          <span className="text-xs font-bold text-navy-900 truncate">
                            {SUBJECT_MAP[task.subjectId]?.shortName} •{' '}
                            {task.topicName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {task.examName} • Aşama {task.reviewStage + 1}/4
                          {task.daysOverdue > 0
                            ? ` (${task.daysOverdue} gün gecikti)`
                            : ' (Bugün)'}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-turquoise-700 bg-white px-2.5 py-1 rounded-lg border border-turquoise-300">
                        Tekrar Çöz →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 10, 11, 12, 13: Çalışma Görevleri, Hedef Yüzdelik İlerleme ve Hedef Liselerle Karşılaştırma */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 10. Tamamlanmamış çalışma görevleri */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-turquoise-600" />
                  Haftalık Tamamlanmamış Çalışma Görevleri (
                  {incompleteStudyTasks.length})
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigateTab('analytics')}
                  className="text-xs font-bold text-turquoise-700 hover:underline"
                >
                  Haftalık Program →
                </button>
              </div>

              {incompleteStudyTasks.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
                  Bu haftaki tüm planlı çalışma görevleriniz tamamlandı!
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {incompleteStudyTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-navy-900">
                          {task.dayName} • {SUBJECT_MAP[task.subjectId]?.shortName}:{' '}
                          {task.topicName}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {task.durationMinutes} dk • {task.targetQuestionCount}{' '}
                          soru hedefi • Öncelik #{task.priorityTier}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {task.priorityReason}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleStudyTask(task.id)}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-300 text-xs font-bold text-emerald-700 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tamamla
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 11, 12, 13: Hedef Yüzdelik Dilime İlerleme & Hedef Liselerle Karşılaştırma */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-turquoise-600" />
                  Hedef Yüzdelik İlerlemesi & Antalya Hedef Liseler
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigateTab('schools')}
                  className="text-xs font-bold text-turquoise-700 hover:underline"
                >
                  Tüm Liseler →
                </button>
              </div>

              {/* Percentile Progress Box */}
              <div className="bg-navy-50 border border-navy-200 rounded-xl p-3 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700">
                    Öğrenci Hedef Yüzdelik:{' '}
                    <strong className="text-navy-900">
                      %{student.targetPercentile}
                    </strong>
                  </span>
                  <span className="font-bold text-turquoise-800">
                    Tahmini Türkiye Geneli Aralık:{' '}
                    {estimate.estimatedNationalPercentileRange
                      ? `%${estimate.estimatedNationalPercentileRange[0]} – %${estimate.estimatedNationalPercentileRange[1]}`
                      : 'Veri Bekleniyor'}
                  </span>
                </div>
                {estimate.estimatedScoreBand && (
                  <div className="text-xs text-slate-700">
                    Tahmini Puan Bandı:{' '}
                    <strong>
                      {estimate.estimatedScoreBand[0]} –{' '}
                      {estimate.estimatedScoreBand[1]} Puan
                    </strong>{' '}
                    <span className="text-[11px] text-slate-500">
                      (Kesin LGS puanı değildir; belirsizlik aralığı içerir)
                    </span>
                  </div>
                )}
                {estimate.officialResult && (
                  <div className="bg-amber-100 border border-amber-300 text-amber-950 px-2.5 py-1.5 rounded-lg text-xs font-bold">
                    ★ Resmî LGS Sonucu: {estimate.officialResult.officialScore}{' '}
                    Puan • %{estimate.officialResult.officialGeneralPercentile}{' '}
                    Yüzdelik Dilim
                  </div>
                )}
                <p className="text-[11px] text-slate-600">
                  {estimate.uncertaintyNotice}
                </p>
              </div>

              {/* Target Schools Comparison List */}
              <div className="space-y-2">
                {targetSchoolComparisons.slice(0, 3).map((sc) => {
                  const badgeStyle =
                    sc.category === 'avantajli_hedef'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : sc.category === 'rekabetci_hedef'
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : sc.category === 'zorlayici_hedef'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300';

                  return (
                    <div
                      key={sc.school.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-navy-900 truncate">
                          {sc.school.schoolName}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {sc.school.district} • {sc.latestVerifiedYear} Taban:{' '}
                          <strong>
                            %{sc.latestPercentile?.toFixed(2)} (
                            {sc.latestMinScore?.toFixed(2)} P)
                          </strong>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-bold px-2 py-1 rounded-lg border ${badgeStyle}`}
                      >
                        {sc.categoryLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Kaynak: MEB e-Okul Merkezî Yerleştirme Verileri</span>
                <span>Son Güncelleme: {ANTALYA_SCHOOL_DATA_LAST_UPDATED}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
