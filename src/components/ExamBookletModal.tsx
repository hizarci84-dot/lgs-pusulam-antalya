import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  FileCheck2,
  Filter,
  GraduationCap,
  Layers,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';
import {
  CURRICULUM_TOPIC_MAP,
  LGS_SUBJECTS,
  SUBJECT_MAP,
  resolveEffectiveTopic,
} from '../data/curriculum';
import {
  ExamRecord,
  QuestionPhotoAsset,
  QuestionRecord,
  StudentProfile,
  SubjectId,
} from '../types/models';

interface ExamBookletModalProps {
  student: StudentProfile;
  questions: QuestionRecord[];
  exams: ExamRecord[];
  photoAssets: QuestionPhotoAsset[];
  onClose: () => void;
}

export const ExamBookletModal: React.FC<ExamBookletModalProps> = ({
  student,
  questions,
  exams,
  photoAssets,
  onClose,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'wrong' | 'blank'>('ALL');
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [columnLayout, setColumnLayout] = useState<'2col' | '1col'>('2col');
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(true);
  const [showWorkspace, setShowWorkspace] = useState<boolean>(true);
  const [bookletTitle, setBookletTitle] = useState<string>(
    `${student.nickname?.toUpperCase() || 'ATAKAN'} - LGS KİŞİSEL DENEME TEKRAR KİTAPÇIĞI`
  );

  const examMap = useMemo(() => new Map(exams.map((e) => [e.id, e])), [exams]);
  const photoMap = useMemo(
    () => new Map(photoAssets.map((p) => [p.questionId, p])),
    [photoAssets]
  );

  // Filter questions for the booklet
  const bookletQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        if (selectedSubject !== 'ALL' && q.subjectId !== selectedSubject) return false;
        if (selectedStatus !== 'ALL' && q.status !== selectedStatus) return false;
        if (selectedExamId !== 'ALL' && q.examId !== selectedExamId) return false;
        return true;
      })
      .sort((a, b) => {
        // Group by subject according to official LGS order
        const subOrder: Record<SubjectId, number> = {
          turkce: 1,
          inkilap: 2,
          din: 3,
          ingilizce: 4,
          matematik: 5,
          fen: 6,
        };
        const orderDiff = (subOrder[a.subjectId] || 99) - (subOrder[b.subjectId] || 99);
        if (orderDiff !== 0) return orderDiff;
        return (a.questionNumber || 0) - (b.questionNumber || 0);
      });
  }, [questions, selectedSubject, selectedStatus, selectedExamId]);

  const handlePrint = () => {
    window.print();
  };

  const todayDateFormatted = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print-specific style overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #lgs-printable-booklet, #lgs-printable-booklet * {
            visibility: visible;
          }
          #lgs-printable-booklet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 8mm 10mm;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .booklet-question-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Bar (no-print) */}
        <div className="bg-navy-950 text-white px-5 py-3.5 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-turquoise-500/20 text-turquoise-400 flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                LGS Kişisel Tekrar Kitapçığı Oluşturucu
              </h3>
              <p className="text-[11px] text-slate-300">
                Yanlış ve boş soruları tertemiz, 2 sütunlu A4 sınav fasikülü olarak yazdırın veya PDF kaydedin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Toolbar (no-print) */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-3 shrink-0 text-xs no-print">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ders Filtresi
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
              >
                <option value="ALL">Tüm Dersler ({questions.length} Soru)</option>
                {LGS_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({questions.filter((q) => q.subjectId === s.id).length})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Soru Durumu
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
              >
                <option value="ALL">Yanlış ve Boşlar Birlikte</option>
                <option value="wrong">Yalnızca Yanlış Yapılanlar</option>
                <option value="blank">Yalnızca Boş Bırakılanlar</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Deneme Sınavı
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
              >
                <option value="ALL">Tüm Denemelerden Topla</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.date} • {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kitapçık Düzeni
              </label>
              <select
                value={columnLayout}
                onChange={(e) => setColumnLayout(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
              >
                <option value="2col">2 Sütunlu (Standart LGS Sınavı)</option>
                <option value="1col">Tek Sütunlu (Geniş İşlem Alanı)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={showAnswerKey}
                  onChange={(e) => setShowAnswerKey(e.target.checked)}
                  className="w-4 h-4 text-turquoise-600 rounded border-slate-300 focus:ring-turquoise-500"
                />
                <span>Cevap Anahtarı Ekle (Son Sayfaya)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={showWorkspace}
                  onChange={(e) => setShowWorkspace(e.target.checked)}
                  className="w-4 h-4 text-turquoise-600 rounded border-slate-300 focus:ring-turquoise-500"
                />
                <span>Boş İşlem / Çözüm Alanı Bırak</span>
              </label>
            </div>

            <div className="flex items-center gap-2 font-bold text-navy-950">
              <span className="bg-turquoise-50 text-turquoise-800 border border-turquoise-200 px-3 py-1 rounded-lg">
                Kitapçığa Dahil: <strong>{bookletQuestions.length} Soru</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Printable Booklet Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/80">
          <div
            id="lgs-printable-booklet"
            className="max-w-[210mm] mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8 space-y-6 text-black border border-slate-300 min-h-[297mm]"
          >
            {/* Authentic MEB Exam Header */}
            <div className="border-b-2 border-black pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-serif font-black text-sm">
                    MEB
                  </div>
                  <div>
                    <h1 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                      T.C. MİLLÎ EĞİTİM BAKANLIĞI • LGS HAZIRLIK PROGRAMI
                    </h1>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-black">
                      {bookletTitle}
                    </h2>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="font-bold block">Tarih: {todayDateFormatted}</span>
                  <span className="text-slate-600">Soru Sayısı: {bookletQuestions.length}</span>
                </div>
              </div>

              {/* Student info box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-dashed border-slate-400 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">ÖĞRENCİ:</span>
                  <strong className="text-sm">{student.nickname || 'ATAKAN'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SINIF:</span>
                  <strong>{student.gradeLevel}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">HEDEF YÜZDELİK:</span>
                  <strong>%{student.targetPercentile}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DÜZEN:</span>
                  <strong>{columnLayout === '2col' ? '2 Sütunlu MEB' : 'Geniş Tek Sütun'}</strong>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            {bookletQuestions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
                <p className="font-bold text-sm">Seçili filtrelere uygun soru bulunamadı.</p>
                <p className="text-xs">Lütfen filtre ayarlarını değiştirin veya soru fotoğrafı yükleyin.</p>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  columnLayout === '2col' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {bookletQuestions.map((q, idx) => {
                  const subject = SUBJECT_MAP[q.subjectId];
                  const eff = resolveEffectiveTopic(q);
                  const photo = photoMap.get(q.id);
                  const displayImg = photo?.croppedDataUrl || photo?.originalDataUrl;
                  const qNum = idx + 1;

                  return (
                    <div
                      key={q.id}
                      className="booklet-question-card border border-slate-300 rounded-lg p-3 bg-white flex flex-col justify-between space-y-2 relative"
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-xs">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-black">
                            {qNum}
                          </span>
                          <span className="uppercase text-slate-900 font-extrabold text-[11px]">
                            {subject?.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                          {eff.topicName}
                        </span>
                      </div>

                      {/* Question Image (Cleaned & Daksillenmiş) */}
                      {displayImg ? (
                        <div className="w-full bg-white flex items-center justify-center p-1 rounded overflow-hidden">
                          <img
                            src={displayImg}
                            alt={`Soru ${qNum}`}
                            className="max-h-[380px] w-auto max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-800 leading-relaxed font-serif">
                          {q.aiAnalysis?.extractedText ? (
                            <p className="whitespace-pre-line">{q.aiAnalysis.extractedText}</p>
                          ) : (
                            <p className="italic text-slate-500">Soru görseli yüklenmemiş.</p>
                          )}
                        </div>
                      )}

                      {/* Scratch calculation workspace */}
                      {showWorkspace && (
                        <div className="border border-dashed border-slate-300 rounded p-1.5 text-[9px] text-slate-400 min-h-[45px] flex items-start justify-between font-mono">
                          <span>İşlem / Çözüm Alanı:</span>
                          <span className="text-slate-300">Cevabınız: [ &nbsp; ]</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Answer Key (at the bottom / end of booklet) */}
            {showAnswerKey && bookletQuestions.length > 0 && (
              <div className="page-break pt-6 border-t-2 border-black mt-8">
                <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                    <h3 className="font-bold text-xs uppercase tracking-wide text-black flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      CEVAP ANAHTARI & KAZANIM TABLOSU (EBEVEYN KONTROLÜ İÇİN)
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Toplam {bookletQuestions.length} Soru
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
                    {bookletQuestions.map((q, idx) => {
                      const eff = resolveEffectiveTopic(q);
                      const answerLetter = q.correctAnswer || '?';
                      return (
                        <div
                          key={q.id}
                          className="bg-white border border-slate-200 rounded p-1.5 flex items-center justify-between"
                        >
                          <span className="font-bold font-mono">#{idx + 1}</span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono">
                            {answerLetter}
                          </span>
                          <span className="text-[9px] text-slate-500 truncate max-w-[60px]" title={eff.topicName}>
                            {eff.topicName.slice(0, 8)}..
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bar (no-print) */}
        <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0 no-print">
          <div className="text-xs text-slate-600 font-medium">
            💡 <strong>İpucu:</strong> Açılan yazdırma penceresinde <strong>"Hedef: PDF Olarak Kaydet"</strong> seçeneğini kullanarak kitapçığı bilgisayarınıza veya telefonunuza PDF olarak indirebilirsiniz.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Kapat
            </button>
            <button
              type="button"
              disabled={bookletQuestions.length === 0}
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-bold text-white bg-turquoise-600 hover:bg-turquoise-700 disabled:opacity-50 rounded-xl flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Kitapçığı Yazdır / PDF İndir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
