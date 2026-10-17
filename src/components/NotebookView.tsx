import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Camera,
  CheckCircle2,
  Eye,
  Filter,
  Layers,
  List,
  RefreshCw,
} from 'lucide-react';
import {
  CURRICULUM_TOPICS,
  ERROR_REASONS,
  ERROR_REASON_MAP,
  LGS_SUBJECTS,
  SUBJECT_MAP,
  resolveEffectiveTopic,
} from '../data/curriculum';
import {
   checkExactQuestionDuplicate,
  getTodayDateStr,
} from '../services/patternEngine';
import {
  ErrorReasonCode,
  ExamRecord,
  LearningStatus,
  QuestionPhotoAsset,
  QuestionRecord,
  SubjectId,
} from '../types/models';

interface NotebookViewProps {
  exams: ExamRecord[];
  questions: QuestionRecord[];
  photoAssets: QuestionPhotoAsset[];
  onOpenQuestionModal: (questionId: string) => void;
  onQuickUploadPhoto: () => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  exams,
  questions,
  photoAssets,
  onOpenQuestionModal,
  onQuickUploadPhoto,
}) => {
  // 9 Required Filters (Section 9)
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'ALL'>('ALL');
  const [topicFilter, setTopicFilter] = useState<string>('ALL');
  const [subtopicQuery, setSubtopicQuery] = useState<string>('');
  const [examFilter, setExamFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'wrong' | 'blank'>(
    'ALL'
  );
  const [reviewDueFilter, setReviewDueFilter] = useState<
    'ALL' | 'DUE_TODAY' | 'COMPLETED_STAGE'
  >('ALL');
  const [learningStatusFilter, setLearningStatusFilter] = useState<
    'ALL' | LearningStatus
  >('ALL');
  const [errorReasonFilter, setErrorReasonFilter] = useState<
    'ALL' | ErrorReasonCode
  >('ALL');

  const [groupByTopicMode, setGroupByTopicMode] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  const todayStr = getTodayDateStr();
  const examMap = useMemo(
    () => new Map(exams.map((e) => [e.id, e])),
    [exams]
  );
  const photoMap = useMemo(
    () => new Map(photoAssets.map((p) => [p.id, p])),
    [photoAssets]
  );

  const availableTopics = useMemo(() => {
    if (subjectFilter === 'ALL') return CURRICULUM_TOPICS;
    return CURRICULUM_TOPICS.filter((t) => t.subjectId === subjectFilter);
  }, [subjectFilter]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (subjectFilter !== 'ALL' && q.subjectId !== subjectFilter) {
        return false;
      }
      const resolved = resolveEffectiveTopic(q);
      if (topicFilter !== 'ALL') {
        if (topicFilter === 'UNASSIGNED') {
          if (resolved.topicId !== null) return false;
        } else if (resolved.topicId !== topicFilter) {
          return false;
        }
      }
      if (subtopicQuery.trim()) {
        const hay = `${q.subtopicName || ''} ${q.studentNote || ''} ${
          q.aiAnalysis?.extractedText || ''
        }`.toLocaleLowerCase('tr-TR');
        if (!hay.includes(subtopicQuery.trim().toLocaleLowerCase('tr-TR'))) {
          return false;
        }
      }
      if (examFilter !== 'ALL' && q.examId !== examFilter) {
        return false;
      }
      const exDate = examMap.get(q.examId)?.date || q.createdAt.slice(0, 10);
      if (dateFrom && exDate < dateFrom) return false;
      if (dateTo && exDate > dateTo) return false;
      if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
      if (reviewDueFilter === 'DUE_TODAY') {
        if (q.reviewStage >= 4 || (q.nextReviewDate && q.nextReviewDate > todayStr)) {
          return false;
        }
      } else if (reviewDueFilter === 'COMPLETED_STAGE') {
        if (q.learningStatus !== 'mastered_independent') return false;
      }
      if (
        learningStatusFilter !== 'ALL' &&
        q.learningStatus !== learningStatusFilter
      ) {
        return false;
      }
      if (errorReasonFilter !== 'ALL' && q.errorReason !== errorReasonFilter) {
        return false;
      }
      return true;
    });
  }, [
    questions,
    subjectFilter,
    topicFilter,
    subtopicQuery,
    examFilter,
    dateFrom,
    dateTo,
    statusFilter,
    reviewDueFilter,
    learningStatusFilter,
    errorReasonFilter,
    examMap,
    todayStr,
  ]);

  // Count how many independent questions exist per topic across exams
  const topicQuestionCounter = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of questions) {
      const resolved = resolveEffectiveTopic(q);
      if (resolved.topicId) {
        map.set(resolved.topicId, (map.get(resolved.topicId) || 0) + 1);
      }
    }
    return map;
  }, [questions]);

  const groupedByTopic = useMemo(() => {
    const groups = new Map<
      string,
      { topicName: string; subjectId: SubjectId; items: QuestionRecord[] }
    >();
    for (const q of filteredQuestions) {
      const resolved = resolveEffectiveTopic(q);
      const key = `${q.subjectId}__${resolved.topicId || 'unassigned'}`;
      if (!groups.has(key)) {
        groups.set(key, {
          topicName: resolved.topicName,
          subjectId: q.subjectId,
          items: [],
        });
      }
      groups.get(key)!.items.push(q);
    }
    return Array.from(groups.values()).sort(
      (a, b) => b.items.length - a.items.length
    );
  }, [filteredQuestions]);

  const renderQuestionCard = (q: QuestionRecord) => {
    const resolved = resolveEffectiveTopic(q);
    const exam = examMap.get(q.examId);
    const pAsset = q.photoIds[0] ? photoMap.get(q.photoIds[0]) : undefined;
    const imgSrc = pAsset
      ? pAsset.croppedDataUrl || pAsset.originalDataUrl
      : null;

    const sameTopicCount = resolved.topicId
      ? topicQuestionCounter.get(resolved.topicId) || 1
      : 1;

    const dupCheck = checkExactQuestionDuplicate(questions, {
      id: q.id,
      subjectId: q.subjectId,
      extractedText: q.aiAnalysis?.extractedText,
      studentNote: q.studentNote,
    });

    const isDueToday =
      q.reviewStage < 4 && (!q.nextReviewDate || q.nextReviewDate <= todayStr);

    return (
      <div
        key={q.id}
        onClick={() => onOpenQuestionModal(q.id)}
        className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-turquoise-400 shadow-2xs cursor-pointer flex flex-col justify-between gap-2.5 transition"
      >
        <div>
          {/* Badges Row */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-navy-900 text-white">
                {SUBJECT_MAP[q.subjectId]?.shortName}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  q.status === 'wrong'
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-400 text-navy-950'
                }`}
              >
                {q.status === 'wrong' ? 'YANLIŞ' : 'BOŞ'}{' '}
                {q.questionNumber ? `#${q.questionNumber}` : ''}
              </span>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                q.learningStatus === 'mastered_independent'
                  ? 'bg-emerald-100 text-emerald-800'
                  : q.learningStatus === 'understood_with_help'
                  ? 'bg-sky-100 text-sky-800'
                  : q.learningStatus === 'needs_topic_study'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {q.learningStatus === 'mastered_independent'
                ? '✓ Yardımsız Çözüldü'
                : q.learningStatus === 'understood_with_help'
                ? 'Yardımla Anlaşıldı'
                : q.learningStatus === 'needs_topic_study'
                ? 'Hâlâ Çözemiyor'
                : 'Çözülmedi'}
            </span>
          </div>

          {imgSrc && (
            <div className="relative bg-slate-50 rounded-xl border border-slate-200 p-1.5 mb-2.5">
              <img
                src={imgSrc}
                alt="Soru"
                className="w-full h-36 object-contain rounded-lg"
              />
              {q.photoIds.length > 1 && (
                <span className="absolute bottom-2 right-2 bg-navy-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  +{q.photoIds.length - 1} Görüntü
                </span>
              )}
            </div>
          )}

          <div className="text-xs font-extrabold text-navy-900">
            {resolved.topicName}
          </div>
          {q.subtopicName && (
            <div className="text-[11px] text-turquoise-800 font-medium">
              Alt Konu: {q.subtopicName}
            </div>
          )}
          <div className="text-[11px] text-slate-500 mt-0.5">
            {exam?.date} • {exam?.name || 'Deneme Sınavı'}
          </div>

          {q.errorReason && (
            <div className="mt-1.5 inline-block text-[11px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-medium">
              Neden: {ERROR_REASON_MAP[q.errorReason]?.label}
            </div>
          )}

          {/* Section 9 distinction: Exact same question vs different question from same topic */}
          {dupCheck.isExactDuplicate ? (
            <div className="mt-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-[11px] px-2 py-1 rounded-lg font-semibold">
              ⚠ Birebir aynı soru metni başka bir denemede de yanlış yapılmış!
            </div>
          ) : (
            sameTopicCount > 1 && (
              <div className="mt-1.5 bg-turquoise-50/70 border border-turquoise-200 text-navy-900 text-[11px] px-2 py-1 rounded-lg">
                Bu konudan yanlış defterinde <strong>{sameTopicCount} bağımsız soru</strong> bulunuyor.
              </div>
            )
          )}

          {q.studentNote && (
            <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 italic">
              "{q.studentNote}"
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span
            className={`font-semibold flex items-center gap-1 ${
              isDueToday ? 'text-rose-700' : 'text-slate-500'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            {isDueToday
              ? 'Tekrar Zamanı Geldi'
              : `Tekrar: ${q.nextReviewDate}`}
          </span>
          <span className="font-bold text-turquoise-700 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Detay & Çözüm
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-turquoise-600" />
            Dijital Yanlış ve Boş Defteri ({filteredQuestions.length} /{' '}
            {questions.length} Soru)
          </h1>
          <p className="text-xs text-slate-500">
            Tüm denemelerdeki yanlış ve boş sorularınız, fotoğrafları ve tekrar çözüm geçmişleriyle kalıcı olarak saklanır.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGroupByTopicMode((v) => !v)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              groupByTopicMode
                ? 'bg-navy-900 text-white border-navy-900'
                : 'bg-slate-50 text-navy-900 border-slate-300'
            }`}
          >
            {groupByTopicMode ? (
              <>
                <Layers className="w-4 h-4 text-turquoise-400" />
                Konu Gruplu Görünüm
              </>
            ) : (
              <>
                <List className="w-4 h-4 text-turquoise-600" />
                Bağımsız Soru Kartları
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowFiltersMobile((v) => !v)}
            className="sm:hidden px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-navy-900 flex items-center gap-1"
          >
            <Filter className="w-4 h-4" />
            Filtreler
          </button>

          <button
            type="button"
            onClick={onQuickUploadPhoto}
            className="px-3.5 py-2 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Camera className="w-4 h-4" />+ Soru Fotoğrafı Yükle
          </button>
        </div>
      </div>

      {/* 9-Filter Panel */}
      <div
        className={`bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3 text-xs ${
          showFiltersMobile ? 'block' : 'hidden sm:block'
        }`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* 1. Ders */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              1. Ders
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value as any);
                setTopicFilter('ALL');
              }}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
            >
              <option value="ALL">Tüm Dersler</option>
              {LGS_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Konu */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              2. Konu
            </label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="ALL">Tüm Konular</option>
              <option value="UNASSIGNED">Konu Belirlenmeyenler</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.topicName}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Alt konu / Kelime */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              3. Alt Konu / Soru Metni
            </label>
            <input
              type="text"
              value={subtopicQuery}
              onChange={(e) => setSubtopicQuery(e.target.value)}
              placeholder="Alt konu veya kelime ara..."
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
            />
          </div>

          {/* 4. Deneme */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              4. Deneme Sınavı
            </label>
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="ALL">Tüm Denemeler</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.date} • {ex.name}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Yanlış veya Boş */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              5. Yanlış / Boş Durumu
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
            >
              <option value="ALL">Yanlış ve Boş Tümü</option>
              <option value="wrong">Sadece Yanlışlar</option>
              <option value="blank">Sadece Boşlar</option>
            </select>
          </div>

          {/* 7. Tekrar Durumu */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              6. Tekrar Durumu
            </label>
            <select
              value={reviewDueFilter}
              onChange={(e) => setReviewDueFilter(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="ALL">Tüm Tekrar Durumları</option>
              <option value="DUE_TODAY">Bugün Tekrar Edilecekler</option>
              <option value="COMPLETED_STAGE">Bağımsız Çözülenler</option>
            </select>
          </div>

          {/* 8. Son Çözüm Sonucu / Öğrenme Durumu */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              7. Son Çözüm Sonucu
            </label>
            <select
              value={learningStatusFilter}
              onChange={(e) => setLearningStatusFilter(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="ALL">Tümü</option>
              <option value="unsolved">Henüz Çözülmedi</option>
              <option value="needs_topic_study">Hâlâ Çözemiyorum (Konu Listesinde)</option>
              <option value="understood_with_help">İpucu / Çözümle Anlaşıldı</option>
              <option value="mastered_independent">Yardımsız Doğru Çözüldü</option>
            </select>
          </div>

          {/* 9. Hata Nedeni */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              8. Hata Nedeni
            </label>
            <select
              value={errorReasonFilter}
              onChange={(e) => setErrorReasonFilter(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="ALL">Tüm Hata Nedenleri</option>
              {ERROR_REASONS.map((er) => (
                <option key={er.code} value={er.code}>
                  {er.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Tarih Aralığı */}
          <div className="col-span-2 flex items-end gap-2">
            <div className="flex-1">
              <label className="block font-semibold text-slate-600 mb-1">
                9. Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold text-slate-600 mb-1">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSubjectFilter('ALL');
                setTopicFilter('ALL');
                setSubtopicQuery('');
                setExamFilter('ALL');
                setDateFrom('');
                setDateTo('');
                setStatusFilter('ALL');
                setReviewDueFilter('ALL');
                setLearningStatusFilter('ALL');
                setErrorReasonFilter('ALL');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
            >
              Sıfırla
            </button>
          </div>
        </div>
      </div>

      {/* Questions Grid or Topic-Grouped View */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-turquoise-600 mx-auto" />
          <p className="text-sm font-bold text-navy-900">
            Seçili filtrelere uygun yanlış veya boş soru kaydı bulunamadı.
          </p>
          <p className="text-xs text-slate-500">
            Deneme sınavlarınızdan sonra yanlış veya boş bıraktığınız soruların fotoğraflarını yükleyerek dijital yanlış defterinizi oluşturabilirsiniz.
          </p>
        </div>
      ) : groupByTopicMode ? (
        <div className="space-y-4">
          {groupedByTopic.map((group) => (
            <div
              key={`${group.subjectId}-${group.topicName}`}
              className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold uppercase text-turquoise-700">
                    {SUBJECT_MAP[group.subjectId]?.name}
                  </span>
                  <h3 className="text-sm font-extrabold text-navy-900">
                    {group.topicName} ({group.items.length} Bağımsız Soru Kaydı)
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Her soru bağımsız korunur, konu altında ilişkilendirilir
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map(renderQuestionCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredQuestions.map(renderQuestionCard)}
        </div>
      )}
    </div>
  );
};
