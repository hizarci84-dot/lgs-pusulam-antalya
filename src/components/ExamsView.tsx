import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  Edit3,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  LGS_SUBJECTS,
  SUBJECT_MAP,
  getTopicsBySubject,
  resolveEffectiveTopic,
} from '../data/curriculum';
import {
  calculateSubjectNet,
  checkDuplicateExam,
  computeExamTotals,
  createDefaultSubjectResults,
  validateSubjectCounts,
} from '../services/calculationEngine';
import { getTodayDateStr } from '../services/patternEngine';
import {
  ExamRecord,
  ExamType,
  QuestionPhotoAsset,
  QuestionRecord,
  StudentProfile,
  SubjectExamResult,
  SubjectId,
} from '../types/models';
import { SubjectNetBars } from './Charts';

interface ExamsViewProps {
  student: StudentProfile;
  exams: ExamRecord[];
  questions: QuestionRecord[];
  photoAssets: QuestionPhotoAsset[];
  selectedExamId: string | null;
  openCreateModalTrigger: number;
  onSelectExamId: (examId: string | null) => void;
  onSaveExam: (exam: ExamRecord) => Promise<void>;
  onDeleteExam: (examId: string) => Promise<void>;
  onOpenQuestionModal: (questionId: string) => void;
  onOpenPhotoUploadForExam: (
    examId: string,
    subjectId?: SubjectId,
    status?: 'wrong' | 'blank'
  ) => void;
}

const EXAM_TYPES: ExamType[] = [
  'Genel Deneme (LGS Tam)',
  'Kurumsal Türkiye Geneli',
  'Sayısal Bölüm Denemesi',
  'Sözel Bölüm Denemesi',
  'Branş Denemesi',
  'MEB Örnek / Çıkmış Sınav',
];

export const ExamsView: React.FC<ExamsViewProps> = ({
  student,
  exams,
  questions,
  photoAssets,
  selectedExamId,
  openCreateModalTrigger,
  onSelectExamId,
  onSaveExam,
  onDeleteExam,
  onOpenQuestionModal,
  onOpenPhotoUploadForExam,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamRecord | null>(null);

  // Detail Tabs (Section 8: 1. Sonuçlar, 2. Yanlışlar, 3. Boşlar, 4. Konu Analizi, 5. Gelişim)
  const [detailTab, setDetailTab] = useState<
    'sonuclar' | 'yanlislar' | 'boslar' | 'konu_analizi' | 'gelisim'
  >('sonuclar');

  // Form states
  const [name, setName] = useState('');
  const [date, setDate] = useState(getTodayDateStr());
  const [publisher, setPublisher] = useState('');
  const [examType, setExamType] = useState<ExamType>('Genel Deneme (LGS Tam)');
  const [participantCount, setParticipantCount] = useState('');
  const [rankInExam, setRankInExam] = useState('');
  const [providerScore, setProviderScore] = useState('');
  const [providerPercentile, setProviderPercentile] = useState('');
  const [notes, setNotes] = useState('');
  const [subjectRows, setSubjectRows] = useState<SubjectExamResult[]>(
    createDefaultSubjectResults()
  );

  // Topic breakdown optional editor state inside form or detail tab
  const [topicEditSubjectId, setTopicEditSubjectId] =
    useState<SubjectId>('matematik');
  const [topicEditTopicId, setTopicEditTopicId] = useState<string>('');
  const [topicEditCorrect, setTopicEditCorrect] = useState('0');
  const [topicEditWrong, setTopicEditWrong] = useState('1');
  const [topicEditBlank, setTopicEditBlank] = useState('0');

  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateWarningExam, setDuplicateWarningExam] =
    useState<ExamRecord | null>(null);

  useEffect(() => {
    if (openCreateModalTrigger > 0) {
      openNewExamForm();
    }
  }, [openCreateModalTrigger]);

  const openNewExamForm = () => {
    setEditingExam(null);
    setName('');
    setDate(getTodayDateStr());
    setPublisher('');
    setExamType('Genel Deneme (LGS Tam)');
    setParticipantCount('');
    setRankInExam('');
    setProviderScore('');
    setProviderPercentile('');
    setNotes('');
    setSubjectRows(createDefaultSubjectResults());
    setFormError(null);
    setDuplicateWarningExam(null);
    setIsFormOpen(true);
  };

  const openEditExamForm = (exam: ExamRecord) => {
    setEditingExam(exam);
    setName(exam.name);
    setDate(exam.date);
    setPublisher(exam.publisher);
    setExamType(exam.examType);
    setParticipantCount(
      exam.participantCount ? String(exam.participantCount) : ''
    );
    setRankInExam(exam.rankInExam ? String(exam.rankInExam) : '');
    setProviderScore(exam.providerScore ? String(exam.providerScore) : '');
    setProviderPercentile(
      exam.providerPercentile ? String(exam.providerPercentile) : ''
    );
    setNotes(exam.notes || '');
    setSubjectRows(
      exam.subjectResults.map((sr) => ({
        ...sr,
        topicBreakdown: sr.topicBreakdown ? [...sr.topicBreakdown] : [],
      }))
    );
    setFormError(null);
    setDuplicateWarningExam(null);
    setIsFormOpen(true);
  };

  const handleExamTypeTemplateChange = (newType: ExamType) => {
    setExamType(newType);
    if (!editingExam) {
      setSubjectRows((prev) =>
        prev.map((row) => {
          const def = SUBJECT_MAP[row.subjectId];
          if (newType === 'Sayısal Bölüm Denemesi') {
            const qCount = def.category === 'sayisal' ? def.defaultQuestionCount : 0;
            return { ...row, questionCount: qCount, correct: 0, wrong: 0, blank: qCount, net: 0 };
          }
          if (newType === 'Sözel Bölüm Denemesi') {
            const qCount = def.category === 'sozel' ? def.defaultQuestionCount : 0;
            return { ...row, questionCount: qCount, correct: 0, wrong: 0, blank: qCount, net: 0 };
          }
          return {
            ...row,
            questionCount: def.defaultQuestionCount,
            correct: 0,
            wrong: 0,
            blank: def.defaultQuestionCount,
            net: 0,
          };
        })
      );
    }
  };

  const updateSubjectRow = (
    subjectId: SubjectId,
    field: 'questionCount' | 'correct' | 'wrong' | 'blank',
    rawValue: string
  ) => {
    const val = rawValue === '' ? 0 : Math.floor(Number(rawValue));
    setSubjectRows((prev) =>
      prev.map((row) => {
        if (row.subjectId !== subjectId) return row;
        const next = { ...row, [field]: val };
        // Auto-adjust blank when user edits correct or wrong and blank was auto-filled
        if (field === 'correct' || field === 'wrong') {
          const remaining = next.questionCount - (next.correct + next.wrong);
          if (remaining >= 0) {
            next.blank = remaining;
          }
        }
        next.net = calculateSubjectNet(
          Math.max(0, next.correct),
          Math.max(0, next.wrong)
        );
        return next;
      })
    );
    setFormError(null);
  };

  const handleSaveForm = async (forceAllowDuplicate = false) => {
    if (!name.trim()) {
      setFormError('Lütfen deneme sınavı adını girin (Örn: Özdebir TG Deneme 1).');
      return;
    }
    if (!date) {
      setFormError('Lütfen deneme tarihini seçin.');
      return;
    }

    for (const row of subjectRows) {
      const subjName = SUBJECT_MAP[row.subjectId]?.name || row.subjectId;
      const check = validateSubjectCounts(
        subjName,
        row.questionCount,
        row.correct,
        row.wrong,
        row.blank
      );
      if (!check.valid) {
        setFormError(check.errorMessage || 'Geçersiz ders soru sayıları.');
        return;
      }
    }

    const totals = computeExamTotals(subjectRows);
    if (totals.totalQuestions <= 0) {
      setFormError('Toplam soru sayısı 0 olamaz.');
      return;
    }

    // Check duplicate exam unless user explicitly confirmed
    if (!forceAllowDuplicate) {
      const dup = checkDuplicateExam(exams, {
        id: editingExam?.id,
        name,
        date,
        publisher,
        totalNet: totals.totalNet,
      });
      if (dup) {
        setDuplicateWarningExam(dup);
        return;
      }
    }

    const nowIso = new Date().toISOString();
    const record: ExamRecord = {
      id: editingExam?.id || `exam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: student.id,
      name: name.trim(),
      date,
      publisher: publisher.trim() || 'Belirtilmedi',
      examType,
      participantCount: participantCount ? Number(participantCount) : null,
      rankInExam: rankInExam ? Number(rankInExam) : null,
      providerScore: providerScore ? Number(providerScore) : null,
      providerPercentile: providerPercentile ? Number(providerPercentile) : null,
      subjectResults: subjectRows.map((r) => ({
        ...r,
        net: calculateSubjectNet(r.correct, r.wrong),
      })),
      ...totals,
      notes: notes.trim(),
      isDemo: editingExam?.isDemo ?? false,
      createdAt: editingExam?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    await onSaveExam(record);
    setIsFormOpen(false);
    setDuplicateWarningExam(null);
    onSelectExamId(record.id);
  };

  const sortedExams = [...exams].sort((a, b) => b.date.localeCompare(a.date));
  const selectedExam = sortedExams.find((e) => e.id === selectedExamId) || null;
  const photoMap = new Map(photoAssets.map((p) => [p.id, p]));

  const handleAddTopicBreakdownToSelectedExam = async () => {
    if (!selectedExam || !topicEditTopicId) return;
    const c = Math.max(0, Number(topicEditCorrect) || 0);
    const w = Math.max(0, Number(topicEditWrong) || 0);
    const b = Math.max(0, Number(topicEditBlank) || 0);

    const updatedSubjectResults = selectedExam.subjectResults.map((sr) => {
      if (sr.subjectId !== topicEditSubjectId) return sr;
      const existing = sr.topicBreakdown ? [...sr.topicBreakdown] : [];
      const idx = existing.findIndex((x) => x.topicId === topicEditTopicId);
      if (idx >= 0) {
        existing[idx] = { topicId: topicEditTopicId, correct: c, wrong: w, blank: b };
      } else {
        existing.push({ topicId: topicEditTopicId, correct: c, wrong: w, blank: b });
      }
      return { ...sr, topicBreakdown: existing };
    });

    await onSaveExam({
      ...selectedExam,
      subjectResults: updatedSubjectResults,
    });
  };

  const currentTotals = computeExamTotals(subjectRows);

  return (
    <div className="space-y-4 pb-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          {selectedExam && (
            <button
              type="button"
              onClick={() => onSelectExamId(null)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900"
              title="Deneme Listesine Dön"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-extrabold text-navy-900">
              {selectedExam
                ? selectedExam.name
                : `Deneme Sınavları (${sortedExams.length})`}
            </h1>
            <p className="text-xs text-slate-500">
              {selectedExam
                ? `${selectedExam.date} • ${selectedExam.publisher} • ${selectedExam.examType}`
                : 'Tüm LGS denemelerinizi kaydedin, netlerinizi hesaplayın ve soru fotoğraflarını arşivleyin.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedExam && (
            <>
              <button
                type="button"
                onClick={() => onOpenPhotoUploadForExam(selectedExam.id)}
                className="px-3 py-2 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                Soru Fotoğrafı Yükle
              </button>
              <button
                type="button"
                onClick={() => openEditExamForm(selectedExam)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Düzenle
              </button>
            </>
          )}
          <button
            type="button"
            onClick={openNewExamForm}
            className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-turquoise-400" />
            Yeni Deneme Ekle
          </button>
        </div>
      </div>

      {/* EXAM DETAIL VIEW WITH 5 REQUIRED TABS (Section 8) */}
      {selectedExam ? (
        <div className="space-y-4">
          {/* 5 Tabs Navigation */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 flex overflow-x-auto gap-1 shadow-2xs">
            {(
              [
                { id: 'sonuclar', label: '1. Sonuçlar' },
                {
                  id: 'yanlislar',
                  label: `2. Yanlışlar (${selectedExam.totalWrong})`,
                },
                { id: 'boslar', label: `3. Boşlar (${selectedExam.totalBlank})` },
                { id: 'konu_analizi', label: '4. Konu Analizi' },
                { id: 'gelisim', label: '5. Gelişim' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDetailTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex-1 ${
                  detailTab === tab.id
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: SONUÇLAR */}
          {detailTab === 'sonuclar' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500">Toplam Net</div>
                  <div className="text-xl font-extrabold text-navy-900 mt-0.5">
                    {selectedExam.totalNet.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      / {selectedExam.totalQuestions}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500">
                    Doğru / Yanlış / Boş
                  </div>
                  <div className="text-sm font-extrabold text-navy-900 mt-1">
                    <span className="text-emerald-700">
                      {selectedExam.totalCorrect} D
                    </span>{' '}
                    •{' '}
                    <span className="text-rose-600">
                      {selectedExam.totalWrong} Y
                    </span>{' '}
                    •{' '}
                    <span className="text-amber-600">
                      {selectedExam.totalBlank} B
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500">
                    Sağlayıcının Açıkladığı Puan
                  </div>
                  <div className="text-base font-extrabold text-navy-900 mt-1">
                    {selectedExam.providerScore
                      ? `${selectedExam.providerScore.toFixed(2)} Puan`
                      : 'Girilmedi'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    (Deneme kurumu puanıdır)
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500">
                    Deneme İçi Sıralama & Yüzdelik
                  </div>
                  <div className="text-sm font-extrabold text-navy-900 mt-1">
                    {selectedExam.rankInExam && selectedExam.participantCount
                      ? `${selectedExam.rankInExam.toLocaleString('tr-TR')} / ${selectedExam.participantCount.toLocaleString('tr-TR')} (%${(
                          (selectedExam.rankInExam /
                            selectedExam.participantCount) *
                          100
                        ).toFixed(2)})`
                      : selectedExam.providerPercentile
                      ? `%${selectedExam.providerPercentile}`
                      : 'Belirtilmedi'}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                <h3 className="font-bold text-sm text-navy-900">
                  Ders Bazında Sonuçlar (Net = Doğru − Yanlış / 3)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-navy-900">
                        <th className="p-2.5 text-left rounded-tl-lg">Ders</th>
                        <th className="p-2.5 text-center">Soru</th>
                        <th className="p-2.5 text-center text-emerald-700">
                          Doğru
                        </th>
                        <th className="p-2.5 text-center text-rose-700">
                          Yanlış
                        </th>
                        <th className="p-2.5 text-center text-amber-700">Boş</th>
                        <th className="p-2.5 text-right">Net</th>
                        <th className="p-2.5 text-center rounded-tr-lg">
                          Fotoğraf / Çözülmeyen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedExam.subjectResults.map((sr) => {
                        const subjQuestions = questions.filter(
                          (q) =>
                            q.examId === selectedExam.id &&
                            q.subjectId === sr.subjectId
                        );
                        const unsolvedCount = subjQuestions.filter(
                          (q) => q.learningStatus !== 'mastered_independent'
                        ).length;
                        return (
                          <tr key={sr.subjectId} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-navy-900">
                              {SUBJECT_MAP[sr.subjectId]?.name}
                            </td>
                            <td className="p-2.5 text-center">
                              {sr.questionCount}
                            </td>
                            <td className="p-2.5 text-center font-semibold text-emerald-700">
                              {sr.correct}
                            </td>
                            <td className="p-2.5 text-center font-semibold text-rose-600">
                              {sr.wrong}
                            </td>
                            <td className="p-2.5 text-center font-semibold text-amber-600">
                              {sr.blank}
                            </td>
                            <td className="p-2.5 text-right font-extrabold text-navy-900">
                              {sr.net.toFixed(2)}
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                                {subjQuestions.length} Fotoğraf •{' '}
                                <strong className="text-rose-700">
                                  {unsolvedCount} Çözülmedi
                                </strong>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedExam.notes && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <strong>Veli / Öğrenci Notu:</strong> {selectedExam.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2 & TAB 3: YANLIŞLAR VE BOŞLAR (Ders bazında ayrı listeler!) */}
          {(detailTab === 'yanlislar' || detailTab === 'boslar') && (
            <div className="space-y-4">
              {LGS_SUBJECTS.map((subj) => {
                const sr = selectedExam.subjectResults.find(
                  (s) => s.subjectId === subj.id
                );
                const allSubjQuestions = questions.filter(
                  (q) =>
                    q.examId === selectedExam.id && q.subjectId === subj.id
                );
                const targetStatus =
                  detailTab === 'yanlislar' ? 'wrong' : 'blank';
                const filteredList = allSubjQuestions.filter(
                  (q) => q.status === targetStatus
                );
                const unsolvedInSubj = allSubjQuestions.filter(
                  (q) => q.learningStatus !== 'mastered_independent'
                ).length;

                const expectedCount =
                  detailTab === 'yanlislar' ? sr?.wrong || 0 : sr?.blank || 0;

                if (expectedCount === 0 && filteredList.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={subj.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <h3 className="font-bold text-sm text-navy-900">
                          {subj.name} —{' '}
                          {detailTab === 'yanlislar'
                            ? 'Yanlış Yaptığım Sorular'
                            : 'Boş Bıraktığım Sorular'}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Deneme Kaydı: <strong>{sr?.wrong || 0} Yanlış</strong>,{' '}
                          <strong>{sr?.blank || 0} Boş</strong> • Arşivlenen Fotoğraf:{' '}
                          <strong>{allSubjQuestions.length}</strong> • Çözülememiş Soru:{' '}
                          <strong className="text-rose-700">{unsolvedInSubj}</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenPhotoUploadForExam(
                            selectedExam.id,
                            subj.id,
                            targetStatus
                          )
                        }
                        className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-turquoise-400" />+{' '}
                        {detailTab === 'yanlislar' ? 'Yanlış' : 'Boş'} Fotoğrafı
                        Ekle
                      </button>
                    </div>

                    {filteredList.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center text-xs text-slate-600">
                        Bu derste {expectedCount} adet{' '}
                        {detailTab === 'yanlislar' ? 'yanlış' : 'boş'} kaydınız
                        var ancak henüz soru fotoğrafı yüklenmedi. Yukarıdaki
                        butonla fotoğraf ekleyebilirsiniz.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredList.map((q) => {
                          const resolved = resolveEffectiveTopic(q);
                          const pAsset = q.photoIds[0]
                            ? photoMap.get(q.photoIds[0])
                            : undefined;
                          const imgSrc = pAsset
                            ? pAsset.croppedDataUrl || pAsset.originalDataUrl
                            : null;

                          return (
                            <div
                              key={q.id}
                              onClick={() => onOpenQuestionModal(q.id)}
                              className="border border-slate-200 hover:border-turquoise-400 rounded-xl p-3 bg-slate-50/70 cursor-pointer flex flex-col justify-between gap-2 transition"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      q.status === 'wrong'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-amber-400 text-navy-950'
                                    }`}
                                  >
                                    {q.status === 'wrong' ? 'YANLIŞ' : 'BOŞ'}{' '}
                                    {q.questionNumber
                                      ? `#${q.questionNumber}`
                                      : ''}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      q.learningStatus === 'mastered_independent'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : q.learningStatus ===
                                          'understood_with_help'
                                        ? 'bg-sky-100 text-sky-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {q.learningStatus === 'mastered_independent'
                                      ? 'Yardımsız Çözüldü'
                                      : q.learningStatus ===
                                        'understood_with_help'
                                      ? 'Yardımla Anlaşıldı'
                                      : 'Henüz Çözülmedi'}
                                  </span>
                                </div>

                                {imgSrc && (
                                  <img
                                    src={imgSrc}
                                    alt="Soru"
                                    className="w-full h-32 object-contain bg-white rounded-lg border border-slate-200 mb-2"
                                  />
                                )}

                                <div className="text-xs font-bold text-navy-900">
                                  {resolved.topicName}
                                </div>
                                {q.subtopicName && (
                                  <div className="text-[11px] text-slate-500">
                                    {q.subtopicName}
                                  </div>
                                )}
                                {q.studentNote && (
                                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                                    "{q.studentNote}"
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-semibold text-turquoise-700">
                                <span>
                                  {q.isAnalyzed
                                    ? '✓ Analiz Edildi'
                                    : 'Analiz Bekliyor'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" />
                                  İncele / Kırp / Çöz
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: KONU ANALİZİ */}
          {detailTab === 'konu_analizi' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                <h3 className="font-bold text-sm text-navy-900">
                  Bu Denemedeki Konu Bazlı Soru ve Hata Dağılımı
                </h3>
                <p className="text-xs text-slate-600">
                  Yüklediğiniz soru fotoğraflarının konu etiketleri ve isteğe bağlı girdiğiniz konu bazlı doğru/yanlış/boş sayıları aşağıda listelenir.
                </p>

                {/* Optional Topic Breakdown Entry Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-navy-900">
                    + İsteğe Bağlı Konu Bazlı Sonuç Ekle (Sınav Karnesinde Konu Analizi Varsa)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">
                        Ders
                      </label>
                      <select
                        value={topicEditSubjectId}
                        onChange={(e) => {
                          const s = e.target.value as SubjectId;
                          setTopicEditSubjectId(s);
                          const firstT = getTopicsBySubject(s)[0];
                          setTopicEditTopicId(firstT?.id || '');
                        }}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                      >
                        {LGS_SUBJECTS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.shortName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] text-slate-600 mb-0.5">
                        Konu
                      </label>
                      <select
                        value={topicEditTopicId}
                        onChange={(e) => setTopicEditTopicId(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                      >
                        <option value="">-- Konu Seçin --</option>
                        {getTopicsBySubject(topicEditSubjectId).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.topicName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">
                        Doğru
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={topicEditCorrect}
                        onChange={(e) => setTopicEditCorrect(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">
                        Yanlış / Boş
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={topicEditWrong}
                          onChange={(e) => setTopicEditWrong(e.target.value)}
                          placeholder="Y"
                          className="w-1/2 border border-slate-300 rounded-lg px-1.5 py-1.5 bg-white"
                        />
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={topicEditBlank}
                          onChange={(e) => setTopicEditBlank(e.target.value)}
                          placeholder="B"
                          className="w-1/2 border border-slate-300 rounded-lg px-1.5 py-1.5 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddTopicBreakdownToSelectedExam}
                      className="px-3 py-1.5 bg-navy-900 text-white font-bold rounded-lg"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* Topic Summary List for this Exam */}
                <div className="space-y-2">
                  {questions
                    .filter((q) => q.examId === selectedExam.id)
                    .map((q) => {
                      const resolved = resolveEffectiveTopic(q);
                      return (
                        <div
                          key={q.id}
                          onClick={() => onOpenQuestionModal(q.id)}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs cursor-pointer hover:bg-turquoise-50/40"
                        >
                          <div>
                            <span className="font-bold text-navy-900">
                              {SUBJECT_MAP[q.subjectId]?.shortName} •{' '}
                              {resolved.topicName}
                            </span>
                            {q.subtopicName && (
                              <span className="text-slate-500 ml-1">
                                ({q.subtopicName})
                              </span>
                            )}
                          </div>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              q.status === 'wrong'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {q.status === 'wrong' ? 'Yanlış' : 'Boş'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GELİŞİM */}
          {detailTab === 'gelisim' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-navy-900">
                Bu Denemenin Önceki Denemeyle Ders Bazlı Gelişim Karşılaştırması
              </h3>
              <SubjectNetBars
                exam={selectedExam}
                previousExam={
                  sortedExams[
                    sortedExams.findIndex((e) => e.id === selectedExam.id) + 1
                  ] || null
                }
              />
            </div>
          )}
        </div>
      ) : (
        /* EXAMS LIST VIEW */
        <div className="space-y-3">
          {sortedExams.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm font-bold text-navy-900">
                Henüz kayıtlı deneme sınavı bulunmuyor.
              </p>
              <button
                type="button"
                onClick={openNewExamForm}
                className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-turquoise-400" />
                İlk Deneme Sınavını Kaydet
              </button>
            </div>
          ) : (
            sortedExams.map((exam, idx) => {
              const prevExam = sortedExams[idx + 1] || null;
              const diff = prevExam
                ? Number((exam.totalNet - prevExam.totalNet).toFixed(2))
                : null;
              const examQuestions = questions.filter(
                (q) => q.examId === exam.id
              );

              return (
                <div
                  key={exam.id}
                  onClick={() => {
                    onSelectExamId(exam.id);
                    setDetailTab('sonuclar');
                  }}
                  className="bg-white hover:border-turquoise-400 rounded-2xl p-4 border border-slate-200 shadow-2xs cursor-pointer transition space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-turquoise-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {exam.date}
                        </span>
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {exam.publisher}
                        </span>
                        {exam.isDemo && (
                          <span className="text-[10px] font-bold bg-amber-300 text-navy-950 px-2 py-0.5 rounded">
                            DEMO VERİSİ
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-navy-900 mt-1">
                        {exam.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-navy-900">
                          {exam.totalNet.toFixed(2)} Net
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {exam.totalCorrect}D • {exam.totalWrong}Y •{' '}
                          {exam.totalBlank}B
                        </div>
                      </div>
                      {diff !== null && (
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            diff > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : diff < 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini Subject Badges */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px]">
                    {exam.subjectResults.map((sr) => (
                      <div
                        key={sr.subjectId}
                        className="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200/80 flex items-center justify-between"
                      >
                        <span className="text-slate-600 font-medium">
                          {SUBJECT_MAP[sr.subjectId]?.shortName}
                        </span>
                        <span className="font-bold text-navy-900">
                          {sr.net.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-600">
                      Arşivlenen Soru Fotoğrafı:{' '}
                      <strong className="text-navy-900">
                        {examQuestions.length}
                      </strong>
                    </span>
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenPhotoUploadForExam(exam.id)}
                        className="px-2.5 py-1 bg-turquoise-50 hover:bg-turquoise-100 text-turquoise-800 rounded-lg font-bold flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" />+ Fotoğraf
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditExamForm(exam)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            window.confirm(
                              `"${exam.name}" denemesini silmek istediğinize emin misiniz?`
                            )
                          ) {
                            await onDeleteExam(exam.id);
                          }
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CREATE / EDIT EXAM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col overflow-hidden">
            <div className="bg-navy-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">
                  {editingExam
                    ? 'Deneme Sınavını Düzenle'
                    : 'Yeni Deneme Sınavı Kaydet'}
                </h3>
                <p className="text-xs text-turquoise-200">
                  Net = Doğru − (Yanlış / 3) formülüyle otomatik hesaplanır; boşlar neti azaltmaz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-navy-800 text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3 rounded-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {duplicateWarningExam && (
                <div className="bg-amber-50 border border-amber-400 text-amber-950 p-3.5 rounded-xl space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Mükerrer Kayıt Uyarısı!
                  </div>
                  <p>
                    Aynı tarihte ({duplicateWarningExam.date}) benzer ad veya nete sahip{' '}
                    <strong>"{duplicateWarningExam.name}"</strong> kaydı zaten mevcut. Yine de kaydetmek istiyor musunuz?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveForm(true)}
                      className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg"
                    >
                      Evet, Yine de Kaydet
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplicateWarningExam(null)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Deneme Adı *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Özdebir Türkiye Geneli Deneme - 3"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tarih *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Yayınevi / Kurum
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Örn: Özdebir, Töder, Hız, MEB"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Deneme Türü
                  </label>
                  <select
                    value={examType}
                    onChange={(e) =>
                      handleExamTypeTemplateChange(e.target.value as ExamType)
                    }
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                  >
                    {EXAM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sağlayıcı Puanı (Varsa)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="100"
                    max="500"
                    value={providerScore}
                    onChange={(e) => setProviderScore(e.target.value)}
                    placeholder="Örn: 458.40"
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Katılımcı Sayısı (Varsa)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={participantCount}
                    onChange={(e) => setParticipantCount(e.target.value)}
                    placeholder="Örn: 65000"
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Deneme Sırası (Varsa)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={rankInExam}
                    onChange={(e) => setRankInExam(e.target.value)}
                    placeholder="Örn: 1240"
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2"
                  />
                </div>
              </div>

              {/* Subject Table */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-900">
                    Ders Bazında Doğru, Yanlış ve Boş Sayıları (Soru Sayıları Düzenlenebilir)
                  </span>
                  <span className="font-extrabold text-sm text-navy-900 bg-turquoise-100 px-3 py-1 rounded-lg border border-turquoise-300">
                    Toplam: {currentTotals.totalNet.toFixed(2)} Net (
                    {currentTotals.totalCorrect}D / {currentTotals.totalWrong}Y /{' '}
                    {currentTotals.totalBlank}B)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-600 border-b border-slate-200">
                        <th className="py-2 text-left">Ders</th>
                        <th className="py-2 text-center w-20">Soru Sayısı</th>
                        <th className="py-2 text-center w-20 text-emerald-700">
                          Doğru
                        </th>
                        <th className="py-2 text-center w-20 text-rose-700">
                          Yanlış
                        </th>
                        <th className="py-2 text-center w-20 text-amber-700">
                          Boş
                        </th>
                        <th className="py-2 text-right w-20">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {subjectRows.map((row) => (
                        <tr key={row.subjectId}>
                          <td className="py-2 font-bold text-navy-900">
                            {SUBJECT_MAP[row.subjectId]?.name}
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={row.questionCount}
                              onChange={(e) =>
                                updateSubjectRow(
                                  row.subjectId,
                                  'questionCount',
                                  e.target.value
                                )
                              }
                              className="w-full text-center border border-slate-300 rounded-lg py-1 bg-white"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              min={0}
                              max={row.questionCount}
                              value={row.correct}
                              onChange={(e) =>
                                updateSubjectRow(
                                  row.subjectId,
                                  'correct',
                                  e.target.value
                                )
                              }
                              className="w-full text-center border border-emerald-300 rounded-lg py-1 bg-white font-bold text-emerald-800"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              min={0}
                              max={row.questionCount}
                              value={row.wrong}
                              onChange={(e) =>
                                updateSubjectRow(
                                  row.subjectId,
                                  'wrong',
                                  e.target.value
                                )
                              }
                              className="w-full text-center border border-rose-300 rounded-lg py-1 bg-white font-bold text-rose-700"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              min={0}
                              max={row.questionCount}
                              value={row.blank}
                              onChange={(e) =>
                                updateSubjectRow(
                                  row.subjectId,
                                  'blank',
                                  e.target.value
                                )
                              }
                              className="w-full text-center border border-amber-300 rounded-lg py-1 bg-white font-bold text-amber-800"
                            />
                          </td>
                          <td className="py-2 text-right font-extrabold text-navy-900">
                            {row.net.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Veli veya Öğrenci Notu (İsteğe Bağlı)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sınav stratejisi, süre yönetimi veya dikkat çeken noktalar..."
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => handleSaveForm(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4 text-turquoise-400" />
                Denemeyi Kaydet ve Analizleri Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
