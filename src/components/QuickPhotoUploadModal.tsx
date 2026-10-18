import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Image as ImageIcon, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import {
  ERROR_REASONS,
  LGS_SUBJECTS,
  getTopicsBySubject,
} from '../data/curriculum';
import { readAndCompressImageFile } from '../services/imageUtils';
import { getTodayDateStr } from '../services/patternEngine';
import {
  ErrorReasonCode,
  ExamRecord,
  QuestionPhotoAsset,
  QuestionRecord,
  StudentProfile,
  SubjectId,
} from '../types/models';

interface QuickPhotoUploadModalProps {
  student: StudentProfile;
  exams: ExamRecord[];
  defaultExamId?: string;
  defaultSubjectId?: SubjectId;
  defaultStatus?: 'wrong' | 'blank';
  onClose: () => void;
  onSaveUploadedBatch: (
    questions: QuestionRecord[],
    photoAssets: QuestionPhotoAsset[]
  ) => Promise<void>;
}

interface StagedQuestionItem {
  tempId: string;
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  subjectId: SubjectId;
  status: 'wrong' | 'blank';
  questionNumber: string;
  topicId: string;
  errorReason: ErrorReasonCode | '';
  studentNote: string;
}

export const QuickPhotoUploadModal: React.FC<QuickPhotoUploadModalProps> = ({
  student,
  exams,
  defaultExamId,
  defaultSubjectId = 'matematik',
  defaultStatus = 'wrong',
  onClose,
  onSaveUploadedBatch,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(
    defaultExamId || (exams[0]?.id ?? '')
  );
  const [batchSubjectId, setBatchSubjectId] =
    useState<SubjectId>(defaultSubjectId);
  const [batchStatus, setBatchStatus] = useState<'wrong' | 'blank'>(
    defaultStatus
  );
  const [stagedItems, setStagedItems] = useState<StagedQuestionItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live in-app camera state
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-restore staged questions if page was refreshed or recovered
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('lgs_staged_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStagedItems(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist staged questions to sessionStorage to prevent accidental loss
  useEffect(() => {
    if (stagedItems.length > 0) {
      try {
        sessionStorage.setItem('lgs_staged_items', JSON.stringify(stagedItems));
      } catch {
        // ignore
      }
    }
  }, [stagedItems]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraOpen(false);
  };

  const startLiveCamera = async (preferredFacing?: 'environment' | 'user') => {
    setErrorMsg(null);
    const targetFacing = preferredFacing || facingMode;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg(
        'Tarayıcınız canlı kamera desteği sunmuyor veya izin verilmedi. Lütfen "Galeriden / Dosyadan Seç" butonunu kullanın.'
      );
      return;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsLiveCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 60);
    } catch (err: any) {
      setErrorMsg(
        'Kamera açılamadı. Lütfen kamera izni verildiğinden emin olun veya "Galeriden / Dosyadan Seç" butonunu kullanın.'
      );
    }
  };

  const toggleFacingMode = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startLiveCamera(next);
  };

  const captureLivePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setErrorMsg('Kamera görüntüsü henüz hazır değil, lütfen 1 saniye bekleyip tekrar deneyin.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.84);

      const newItem: StagedQuestionItem = {
        tempId: `stg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        dataUrl,
        mimeType: 'image/jpeg',
        width: canvas.width,
        height: canvas.height,
        subjectId: batchSubjectId,
        status: batchStatus,
        questionNumber: '',
        topicId: '',
        errorReason: '',
        studentNote: '',
      };

      setStagedItems((prev) => [...prev, newItem]);
      stopLiveCamera();
    } catch (err: any) {
      setErrorMsg('Fotoğraf alınırken hata: ' + (err?.message || ''));
    }
  };

  const handleCloseModal = () => {
    stopLiveCamera();
    try {
      sessionStorage.removeItem('lgs_staged_items');
    } catch {
      // ignore
    }
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsLoadingFiles(true);
    setErrorMsg(null);
    try {
      const added: StagedQuestionItem[] = [];
      for (const file of Array.from(files)) {
        const compressed = await readAndCompressImageFile(file);
        added.push({
          tempId: `stg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          dataUrl: compressed.dataUrl,
          mimeType: compressed.mimeType,
          width: compressed.width,
          height: compressed.height,
          subjectId: batchSubjectId,
          status: batchStatus,
          questionNumber: '',
          topicId: '',
          errorReason: '',
          studentNote: '',
        });
      }
      setStagedItems((prev) => [...prev, ...added]);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Fotoğraflar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoadingFiles(false);
      e.target.value = '';
    }
  };

  const handleDuplicateForMultiQuestionCrop = (item: StagedQuestionItem) => {
    setStagedItems((prev) => [
      ...prev,
      {
        ...item,
        tempId: `stg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        questionNumber: '',
        studentNote: 'Aynı fotoğraftaki diğer soru (Kaydettikten sonra kırpabilirsiniz)',
      },
    ]);
  };

  const handleSaveAll = async () => {
    if (!selectedExamId) {
      setErrorMsg('Lütfen fotoğrafların bağlanacağı deneme sınavını seçin.');
      return;
    }
    if (stagedItems.length === 0) {
      setErrorMsg('Lütfen en az bir soru fotoğrafı seçin veya kameradan çekin.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const nowIso = new Date().toISOString();
      const todayStr = getTodayDateStr();
      const newQuestions: QuestionRecord[] = [];
      const newAssets: QuestionPhotoAsset[] = [];

      for (const item of stagedItems) {
        const qId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const pId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        newAssets.push({
          id: pId,
          studentId: student.id,
          examId: selectedExamId,
          questionId: qId,
          originalDataUrl: item.dataUrl,
          croppedDataUrl: null,
          cropRect: null,
          rotation: 0,
          mimeType: item.mimeType,
          width: item.width,
          height: item.height,
          createdAt: nowIso,
        });

        newQuestions.push({
          id: qId,
          studentId: student.id,
          examId: selectedExamId,
          subjectId: item.subjectId,
          questionNumber: item.questionNumber ? Number(item.questionNumber) : null,
          status: item.status,
          photoIds: [pId],
          userTopicId: item.topicId || null,
          aiSuggestedTopicId: null,
          inferredTopicId: null,
          subtopicName: '',
          topicVerifiedByUser: Boolean(item.topicId),
          studentAnswer: '',
          correctAnswer: '',
          errorReason: item.errorReason ? (item.errorReason as ErrorReasonCode) : null,
          studentNote: item.studentNote.trim(),
          solutionExplanation: '',
          // Section 8: Uploading a photo does NOT mean the question is solved or analyzed!
          learningStatus: 'unsolved',
          isAnalyzed: Boolean(item.topicId || item.errorReason),
          reviewStage: 0,
          lastReviewedAt: null,
          nextReviewDate: todayStr,
          attemptHistory: [],
          aiAnalysis: null,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }

      await onSaveUploadedBatch(newQuestions, newAssets);
      try {
        sessionStorage.removeItem('lgs_staged_items');
      } catch {
        // ignore
      }
      stopLiveCamera();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="bg-navy-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base">
              Hızlı Yanlış / Boş Soru Fotoğrafı Yükle
            </h3>
            <p className="text-xs text-turquoise-200">
              Uzun form doldurmadan hızlıca yükleyin; konu ve analizi istediğiniz zaman tamamlayın.
            </p>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {exams.length === 0 ? (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl text-xs">
              Soru fotoğrafı arşivlemek için önce en az 1 deneme sınavı oluşturmalısınız.
            </div>
          ) : (
            <>
              {/* Quick Defaults Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    İlgili Deneme Sınavı
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white font-medium text-navy-900"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.date} • {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Varsayılan Ders
                  </label>
                  <select
                    value={batchSubjectId}
                    onChange={(e) => setBatchSubjectId(e.target.value as SubjectId)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white font-medium text-navy-900"
                  >
                    {LGS_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Varsayılan Durum
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBatchStatus('wrong')}
                      className={`py-2 rounded-lg font-bold border ${
                        batchStatus === 'wrong'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Yanlış
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchStatus('blank')}
                      className={`py-2 rounded-lg font-bold border ${
                        batchStatus === 'blank'
                          ? 'bg-amber-500 text-navy-950 border-amber-500'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Boş
                    </button>
                  </div>
                </div>
              </div>

              {/* In-App Live Camera Viewfinder */}
              {isLiveCameraOpen && (
                <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/9 flex flex-col items-center justify-center border-2 border-turquoise-500 shadow-xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder frame guide */}
                  <div className="absolute inset-5 border-2 border-dashed border-turquoise-400/80 rounded-xl pointer-events-none flex flex-col items-center justify-between p-2">
                    <span className="text-white text-[11px] font-semibold bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      📸 Soruyu bu çerçevenin içine hizalayın
                    </span>
                    <span className="text-white/80 text-[10px] bg-black/50 px-2 py-0.5 rounded-full">
                      Atakan LGS Pusulam • Canlı Kamera
                    </span>
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-between px-6 z-10">
                    <button
                      type="button"
                      onClick={stopLiveCamera}
                      className="px-3.5 py-2 bg-slate-900/85 hover:bg-slate-800 text-white text-xs font-bold rounded-xl backdrop-blur-xs border border-white/20 shadow-md"
                    >
                      Kapat
                    </button>

                    <button
                      type="button"
                      onClick={captureLivePhoto}
                      className="w-16 h-16 rounded-full bg-white border-4 border-turquoise-500 shadow-2xl flex items-center justify-center active:scale-90 transition hover:scale-105"
                      title="Fotoğrafı Çek"
                    >
                      <div className="w-11 h-11 rounded-full bg-turquoise-600 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={toggleFacingMode}
                      className="px-3 py-2 bg-slate-900/85 hover:bg-slate-800 text-white text-xs font-bold rounded-xl backdrop-blur-xs border border-white/20 flex items-center gap-1.5 shadow-md"
                      title="Ön / Arka Kamerayı Değiştir"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-turquoise-400" />
                      Çevir
                    </button>
                  </div>
                </div>
              )}

              {/* Camera & Gallery Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => startLiveCamera('environment')}
                  className="bg-navy-900 hover:bg-navy-800 text-white rounded-xl p-3.5 flex items-center justify-center gap-2.5 font-bold text-xs shadow-sm transition active:scale-[0.99]"
                >
                  <Camera className="w-5 h-5 text-turquoise-400" />
                  <span>📷 Canlı Kamera ile Çek (Uygulama İçi)</span>
                </button>

                <label className="cursor-pointer bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-xl p-3.5 flex items-center justify-center gap-2.5 font-bold text-xs shadow-sm transition active:scale-[0.99]">
                  <ImageIcon className="w-5 h-5" />
                  <span>🖼️ Galeriden / Dosyadan Seç</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {isLoadingFiles && (
                <div className="text-center text-xs text-slate-600 py-2">
                  Fotoğraflar optimize ediliyor...
                </div>
              )}

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-300 text-rose-800 px-3 py-2 rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Staged Photos List */}
              {stagedItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-navy-900">
                    <span>Yüklenecek Sorular ({stagedItems.length} Adet)</span>
                    <span className="text-slate-500 font-normal">
                      Konu ve hata nedeni isteğe bağlıdır; sonra da girilebilir.
                    </span>
                  </div>

                  {stagedItems.map((item, idx) => {
                    const topics = getTopicsBySubject(item.subjectId);
                    return (
                      <div
                        key={item.tempId}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row gap-3"
                      >
                        <div className="sm:w-32 shrink-0 flex flex-col items-center">
                          <img
                            src={item.dataUrl}
                            alt={`Soru ${idx + 1}`}
                            className="w-full h-24 object-contain bg-white rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleDuplicateForMultiQuestionCrop(item)}
                            className="mt-1.5 text-[11px] text-turquoise-700 font-semibold hover:underline flex items-center gap-0.5"
                            title="Bu fotoğrafta birden fazla soru varsa ayrı soru kaydı olarak çoğaltıp kırpabilirsiniz"
                          >
                            <Plus className="w-3 h-3" />
                            2. Soru İçin Çoğalt
                          </button>
                        </div>

                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">
                              Ders
                            </label>
                            <select
                              value={item.subjectId}
                              onChange={(e) => {
                                const val = e.target.value as SubjectId;
                                setStagedItems((prev) =>
                                  prev.map((p) =>
                                    p.tempId === item.tempId
                                      ? { ...p, subjectId: val, topicId: '' }
                                      : p
                                  )
                                );
                              }}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white font-semibold"
                            >
                              {LGS_SUBJECTS.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.shortName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">
                              Yanlış / Boş
                            </label>
                            <select
                              value={item.status}
                              onChange={(e) => {
                                const val = e.target.value as 'wrong' | 'blank';
                                setStagedItems((prev) =>
                                  prev.map((p) =>
                                    p.tempId === item.tempId ? { ...p, status: val } : p
                                  )
                                );
                              }}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white font-semibold"
                            >
                              <option value="wrong">Yanlış</option>
                              <option value="blank">Boş</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">
                              Soru No (İsteğe Bağlı)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={item.questionNumber}
                              onChange={(e) => {
                                const val = e.target.value;
                                setStagedItems((prev) =>
                                  prev.map((p) =>
                                    p.tempId === item.tempId
                                      ? { ...p, questionNumber: val }
                                      : p
                                  )
                                );
                              }}
                              placeholder="Örn: 7"
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[11px] text-slate-600 mb-0.5">
                              Konu Etiketi (Sonra da seçilebilir)
                            </label>
                            <select
                              value={item.topicId}
                              onChange={(e) => {
                                const val = e.target.value;
                                setStagedItems((prev) =>
                                  prev.map((p) =>
                                    p.tempId === item.tempId ? { ...p, topicId: val } : p
                                  )
                                );
                              }}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                            >
                              <option value="">-- Sonra Belirle --</option>
                              {topics.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.topicName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-end justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setStagedItems((prev) =>
                                  prev.filter((p) => p.tempId !== item.tempId)
                                )
                              }
                              className="px-2.5 py-1.5 text-rose-700 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Kaldır
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl"
          >
            Vazgeç
          </button>
          {exams.length > 0 && (
            <button
              type="button"
              disabled={isSaving || stagedItems.length === 0}
              onClick={handleSaveAll}
              className="px-4 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4 text-turquoise-400" />
              {isSaving
                ? 'Kaydediliyor...'
                : `${stagedItems.length} Soru Fotoğrafını Kaydet`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
