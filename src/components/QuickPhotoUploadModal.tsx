import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Eraser, Image as ImageIcon, Plus, RefreshCw, RotateCcw, Sparkles, Trash2, X } from 'lucide-react';
import {
  ERROR_REASONS,
  LGS_SUBJECTS,
  getTopicsBySubject,
} from '../data/curriculum';
import { autoCleanStudentScribbles, readAndCompressImageFile } from '../services/imageUtils';
import { getTodayDateStr } from '../services/patternEngine';
import {
  detectQuestionTopicWithAi,
  getStoredGeminiApiKey,
  saveStoredGeminiApiKey,
} from '../services/aiVisionService';
import { ImageDaksilModal } from './ImageDaksilModal';
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
  rawOriginalDataUrl?: string;
  isCleaned?: boolean;
  mimeType: string;
  width: number;
  height: number;
  subjectId: SubjectId;
  status: 'wrong' | 'blank';
  questionNumber: string;
  topicId: string;
  subtopicName: string;
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

  // Automatic Scribble & Pencil Cleaning State (Default ON)
  const [autoCleanPencil, setAutoCleanPencil] = useState<boolean>(true);
  const [isCleaningActive, setIsCleaningActive] = useState<boolean>(false);

  // Live in-app camera state
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [frameSize, setFrameSize] = useState<'compact' | 'standard' | 'wide'>('compact');
  const [capturedPreview, setCapturedPreview] = useState<{
    dataUrl: string;
    rawOriginalDataUrl?: string;
    isCleaned?: boolean;
    width: number;
    height: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // AI Topic Detection State
  const [loadingAiTempId, setLoadingAiTempId] = useState<string | null>(null);
  const [aiDetectionResult, setAiDetectionResult] = useState<{
    [tempId: string]: { topicName: string; subtopicName: string; confidence: number };
  }>({});
  const [autoAiDetect, setAutoAiDetect] = useState<boolean>(() =>
    Boolean(getStoredGeminiApiKey())
  );
  const [isApiKeyPromptOpen, setIsApiKeyPromptOpen] = useState(false);
  const [quickApiKeyInput, setQuickApiKeyInput] = useState('');
  const [pendingAiItem, setPendingAiItem] = useState<StagedQuestionItem | null>(null);
  const [activeDaksilItem, setActiveDaksilItem] = useState<StagedQuestionItem | null>(null);

  const triggerAiTopicDetection = async (item: StagedQuestionItem) => {
    const key = getStoredGeminiApiKey();
    if (!key) {
      setPendingAiItem(item);
      setIsApiKeyPromptOpen(true);
      return;
    }

    setLoadingAiTempId(item.tempId);
    setErrorMsg(null);
    try {
      const res = await detectQuestionTopicWithAi({
        dataUrl: item.dataUrl,
        subjectId: item.subjectId,
      });

      if (res.success && res.topicId) {
        setStagedItems((prev) =>
          prev.map((p) =>
            p.tempId === item.tempId
              ? {
                  ...p,
                  topicId: res.topicId!,
                  subtopicName: res.subtopicName || '',
                  studentNote:
                    p.studentNote ||
                    (res.subtopicName ? `Kazanım: ${res.subtopicName}` : ''),
                }
              : p
          )
        );
        setAiDetectionResult((prev) => ({
          ...prev,
          [item.tempId]: {
            topicName: res.topicName || '',
            subtopicName: res.subtopicName || '',
            confidence: res.confidence || 90,
          },
        }));
      } else {
        setErrorMsg(res.errorMessage || 'Yapay zekâ konuyu belirleyemedi.');
      }
    } catch (err: any) {
      setErrorMsg('Yapay zekâ analizi sırasında hata: ' + (err?.message || ''));
    } finally {
      setLoadingAiTempId(null);
    }
  };

  const handleSaveQuickApiKey = async () => {
    if (!quickApiKeyInput.trim()) return;
    saveStoredGeminiApiKey(quickApiKeyInput.trim());
    setIsApiKeyPromptOpen(false);
    setAutoAiDetect(true);
    if (pendingAiItem) {
      const target = pendingAiItem;
      setPendingAiItem(null);
      await triggerAiTopicDetection(target);
    }
  };

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
    setCapturedPreview(null);
    setIsLiveCameraOpen(false);
  };

  const startLiveCamera = async (preferredFacing?: 'environment' | 'user') => {
    setErrorMsg(null);
    setCapturedPreview(null);
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

  const captureLivePhoto = async () => {
    const video = videoRef.current;
    const frame = frameRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setErrorMsg('Kamera görüntüsü henüz hazır değil, lütfen 1 saniye bekleyip tekrar deneyin.');
      return;
    }

    try {
      let srcX = 0;
      let srcY = 0;
      let srcW = video.videoWidth;
      let srcH = video.videoHeight;

      if (frame) {
        const vRect = video.getBoundingClientRect();
        const fRect = frame.getBoundingClientRect();

        // Calculate scale when video is rendered with object-cover inside vRect
        const scale = Math.max(vRect.width / video.videoWidth, vRect.height / video.videoHeight);
        const displayedW = video.videoWidth * scale;
        const displayedH = video.videoHeight * scale;
        const shiftX = (displayedW - vRect.width) / 2;
        const shiftY = (displayedH - vRect.height) / 2;

        const frameX = fRect.left - vRect.left;
        const frameY = fRect.top - vRect.top;
        const frameW = fRect.width;
        const frameH = fRect.height;

        srcX = (frameX + shiftX) / scale;
        srcY = (frameY + shiftY) / scale;
        srcW = frameW / scale;
        srcH = frameH / scale;

        // Clamp coordinates within video frame boundaries
        srcX = Math.max(0, Math.min(video.videoWidth - 20, srcX));
        srcY = Math.max(0, Math.min(video.videoHeight - 20, srcY));
        srcW = Math.max(20, Math.min(video.videoWidth - srcX, srcW));
        srcH = Math.max(20, Math.min(video.videoHeight - srcY, srcH));
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(srcW);
      canvas.height = Math.round(srcH);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw ONLY the area inside the visual question frame
      ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.88);

      let finalDataUrl = rawDataUrl;
      let isCleaned = false;

      if (autoCleanPencil) {
        setIsCleaningActive(true);
        try {
          finalDataUrl = await autoCleanStudentScribbles(rawDataUrl);
          isCleaned = true;
        } catch (cleanErr) {
          console.warn('Otomatik karalama temizleme başarısız, orijinal kullanılıyor:', cleanErr);
          finalDataUrl = rawDataUrl;
        } finally {
          setIsCleaningActive(false);
        }
      }

      setCapturedPreview({
        dataUrl: finalDataUrl,
        rawOriginalDataUrl: rawDataUrl,
        isCleaned,
        width: canvas.width,
        height: canvas.height,
      });
    } catch (err: any) {
      setErrorMsg('Fotoğraf kırpılırken hata oluştu: ' + (err?.message || ''));
    }
  };

  const confirmAndAddPreview = (keepCameraOpen = false) => {
    if (!capturedPreview) return;
    const newItem: StagedQuestionItem = {
      tempId: `stg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dataUrl: capturedPreview.dataUrl,
      rawOriginalDataUrl: capturedPreview.rawOriginalDataUrl || capturedPreview.dataUrl,
      isCleaned: Boolean(capturedPreview.isCleaned),
      mimeType: 'image/jpeg',
      width: capturedPreview.width,
      height: capturedPreview.height,
      subjectId: batchSubjectId,
      status: batchStatus,
      questionNumber: '',
      topicId: '',
      subtopicName: '',
      errorReason: '',
      studentNote: '',
    };
    setStagedItems((prev) => [...prev, newItem]);
    setCapturedPreview(null);
    if (!keepCameraOpen) {
      stopLiveCamera();
    }
    if (autoAiDetect && getStoredGeminiApiKey()) {
      triggerAiTopicDetection(newItem);
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
        let finalDataUrl = compressed.dataUrl;
        let isCleaned = false;

        if (autoCleanPencil) {
          try {
            finalDataUrl = await autoCleanStudentScribbles(compressed.dataUrl);
            isCleaned = true;
          } catch (cleanErr) {
            console.warn('Otomatik dosya temizleme atlandı:', cleanErr);
            finalDataUrl = compressed.dataUrl;
          }
        }

        added.push({
          tempId: `stg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          dataUrl: finalDataUrl,
          rawOriginalDataUrl: compressed.dataUrl,
          isCleaned,
          mimeType: compressed.mimeType,
          width: compressed.width,
          height: compressed.height,
          subjectId: batchSubjectId,
          status: batchStatus,
          questionNumber: '',
          topicId: '',
          subtopicName: '',
          errorReason: '',
          studentNote: '',
        });
      }
      setStagedItems((prev) => [...prev, ...added]);
      if (autoAiDetect && getStoredGeminiApiKey()) {
        for (const it of added) {
          triggerAiTopicDetection(it);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Fotoğraflar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoadingFiles(false);
      e.target.value = '';
    }
  };

  const handleToggleCleanItem = async (item: StagedQuestionItem) => {
    if (item.isCleaned && item.rawOriginalDataUrl) {
      // Revert to untouched original camera photo
      setStagedItems((prev) =>
        prev.map((p) =>
          p.tempId === item.tempId
            ? { ...p, dataUrl: item.rawOriginalDataUrl!, isCleaned: false }
            : p
        )
      );
    } else {
      // Re-run automatic pencil & scribble cleaner
      try {
        const src = item.rawOriginalDataUrl || item.dataUrl;
        const cleaned = await autoCleanStudentScribbles(src);
        setStagedItems((prev) =>
          prev.map((p) =>
            p.tempId === item.tempId
              ? { ...p, dataUrl: cleaned, rawOriginalDataUrl: src, isCleaned: true }
              : p
          )
        );
      } catch (err: any) {
        setErrorMsg('Fotoğraf temizlenirken bir hata oluştu: ' + (err?.message || ''));
      }
    }
  };

  const handleDuplicateForMultiQuestionCrop = (item: StagedQuestionItem) => {
    setStagedItems((prev) => [
      ...prev,
      {
        ...item,
        tempId: `stg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        questionNumber: '',
        subtopicName: item.subtopicName || '',
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
          originalDataUrl: item.rawOriginalDataUrl || item.dataUrl,
          croppedDataUrl: item.dataUrl,
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
          subtopicName: (item.subtopicName || '').trim(),
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

              {/* Automatic Scribble & Pencil Cleaning Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoCleanPencil}
                    onChange={(e) => setAutoCleanPencil(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    Fotoğraf çekilince karalamaları & işaretleri otomatik temizle (Otomatik Daksil)
                  </span>
                </label>
                <span className="self-start sm:self-auto text-[11px] text-emerald-700 font-semibold bg-white border border-emerald-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {autoCleanPencil ? 'Aktif (Temiz Kitapçık Modu)' : 'Kapalı'}
                </span>
              </div>

              {/* AI Auto-Detection Toggle Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3.5 py-2.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAiDetect}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setAutoAiDetect(checked);
                      if (checked && !getStoredGeminiApiKey()) {
                        setIsApiKeyPromptOpen(true);
                      }
                    }}
                    className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                  />
                  <span className="font-bold text-violet-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
                    Fotoğraf çekilince MEB konusunu Yapay Zekâ (Gemini) otomatik belirlesin
                  </span>
                </label>
                {!getStoredGeminiApiKey() ? (
                  <button
                    type="button"
                    onClick={() => setIsApiKeyPromptOpen(true)}
                    className="self-start sm:self-auto text-[11px] font-bold text-violet-700 hover:text-violet-900 bg-white border border-violet-300 px-2.5 py-1 rounded-lg shadow-xs hover:bg-violet-50 transition"
                  >
                    API Anahtarı Gir
                  </button>
                ) : (
                  <span className="self-start sm:self-auto text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Yapay Zekâ Hazır
                  </span>
                )}
              </div>

              {/* In-App Live Camera Viewfinder & Preview */}
              {isLiveCameraOpen && (
                <div className="space-y-2">
                  {capturedPreview ? (
                    /* Instant Crop Preview & Confirmation View */
                    <div className="relative bg-slate-950 rounded-2xl overflow-hidden p-3 flex flex-col items-center justify-center border-2 border-turquoise-500 shadow-xl space-y-3">
                      <div className="text-center">
                        <span className="text-turquoise-400 font-bold text-xs flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" /> Sadece Çerçeve İçindeki Soru Kırpıldı!
                        </span>
                        {capturedPreview.isCleaned ? (
                          <p className="text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-1 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            Kurşun kalem karalamaları ve işaretlenen şıklar otomatik temizlendi.
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-300">
                            Masa ve diğer sorular kesildi. Görüntü net ise listeye ekleyebilirsiniz.
                          </p>
                        )}
                      </div>

                      <div className="max-h-[46vh] max-w-full overflow-hidden rounded-xl border border-slate-700 bg-black flex items-center justify-center p-1">
                        <img
                          src={capturedPreview.dataUrl}
                          alt="Kırpılan Soru"
                          className="max-h-[44vh] max-w-full w-auto object-contain rounded-lg"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
                        <button
                          type="button"
                          onClick={() => setCapturedPreview(null)}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-600 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Yeniden Çek
                        </button>

                        {capturedPreview.rawOriginalDataUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextCleaned = !capturedPreview.isCleaned;
                              setCapturedPreview({
                                ...capturedPreview,
                                dataUrl: nextCleaned
                                  ? capturedPreview.dataUrl
                                  : capturedPreview.rawOriginalDataUrl!,
                                isCleaned: nextCleaned,
                              });
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-600 transition"
                            title="Orijinal ve temiz hal arasında geçiş yapın"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-turquoise-400" />
                            {capturedPreview.isCleaned ? 'Orijinali Göster' : 'Temiz Halini Göster'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => confirmAndAddPreview(false)}
                          className="px-4 py-2 bg-turquoise-600 hover:bg-turquoise-500 text-navy-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition"
                        >
                          <Check className="w-4 h-4" />
                          Bu Soruyu Ekle & Bitir
                        </button>

                        <button
                          type="button"
                          onClick={() => confirmAndAddPreview(true)}
                          className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-turquoise-500/50 shadow-md transition"
                          title="Bu soruyu kaydeder ve bir sonraki soru için kamerayı açık tutar"
                        >
                          <Plus className="w-3.5 h-3.5 text-turquoise-400" />
                          Ekle & Sıradaki Soruyu Çek
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Live Viewfinder with Tight Framing & Dark Mask */
                    <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/9 flex flex-col items-center justify-center border-2 border-turquoise-500 shadow-xl select-none">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      {/* Frame Size Selector at Top */}
                      <div className="absolute top-2.5 inset-x-2 flex items-center justify-center z-20 pointer-events-auto">
                        <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 text-[11px] shadow-lg">
                          <span className="text-slate-300 font-semibold mr-1">Çerçeve:</span>
                          <button
                            type="button"
                            onClick={() => setFrameSize('compact')}
                            className={`px-2 py-0.5 rounded-full font-bold transition ${
                              frameSize === 'compact'
                                ? 'bg-turquoise-500 text-navy-950 shadow-xs'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            🔍 Tek Soru (Dar)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFrameSize('standard')}
                            className={`px-2 py-0.5 rounded-full font-bold transition ${
                              frameSize === 'standard'
                                ? 'bg-turquoise-500 text-navy-950 shadow-xs'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            📄 Standart
                          </button>
                          <button
                            type="button"
                            onClick={() => setFrameSize('wide')}
                            className={`px-2 py-0.5 rounded-full font-bold transition ${
                              frameSize === 'wide'
                                ? 'bg-turquoise-500 text-navy-950 shadow-xs'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            📐 Geniş
                          </button>
                        </div>
                      </div>

                      {/* Focused Question Frame with Dark Translucent Backdrop */}
                      <div
                        ref={frameRef}
                        className="absolute border-2 border-turquoise-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.60)] pointer-events-none transition-all duration-300 flex flex-col items-center justify-between p-2"
                        style={{
                          width:
                            frameSize === 'compact'
                              ? '68%'
                              : frameSize === 'standard'
                              ? '84%'
                              : '94%',
                          height:
                            frameSize === 'compact'
                              ? '50%'
                              : frameSize === 'standard'
                              ? '68%'
                              : '82%',
                        }}
                      >
                        {/* Corner markers & Header Tag */}
                        <div className="w-full flex items-center justify-between">
                          <div className="w-3 h-3 border-t-2 border-l-2 border-turquoise-300 -mt-1 -ml-1" />
                          <span className="text-white text-[10px] font-bold bg-navy-950/85 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-turquoise-400/30">
                            🎯 Sadece Bu Alan Kırpılır
                          </span>
                          <div className="w-3 h-3 border-t-2 border-r-2 border-turquoise-300 -mt-1 -mr-1" />
                        </div>

                        {/* Bottom corner markers */}
                        <div className="w-full flex items-center justify-between">
                          <div className="w-3 h-3 border-b-2 border-l-2 border-turquoise-300 -mb-1 -ml-1" />
                          <span className="text-turquoise-200 text-[9px] bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                            Dışarısı otomatik kesilir
                          </span>
                          <div className="w-3 h-3 border-b-2 border-r-2 border-turquoise-300 -mb-1 -mr-1" />
                        </div>
                      </div>

                      {/* Camera Controls Bar at Bottom */}
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-between px-6 z-20 pointer-events-auto">
                        <button
                          type="button"
                          onClick={stopLiveCamera}
                          className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold rounded-xl backdrop-blur-md border border-white/20 shadow-md"
                        >
                          Kapat
                        </button>

                        <button
                          type="button"
                          onClick={captureLivePhoto}
                          className="w-16 h-16 rounded-full bg-white border-4 border-turquoise-500 shadow-2xl flex items-center justify-center active:scale-90 transition hover:scale-105"
                          title="Soruyu Çek ve Kırp"
                        >
                          <div className="w-11 h-11 rounded-full bg-turquoise-600 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={toggleFacingMode}
                          className="px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-md"
                          title="Ön / Arka Kamerayı Değiştir"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-turquoise-400" />
                          Çevir
                        </button>
                      </div>
                    </div>
                  )}
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
                          <div className="relative w-full">
                            <img
                              src={item.dataUrl}
                              alt={`Soru ${idx + 1}`}
                              className="w-full h-24 object-contain bg-white rounded-lg border border-slate-200"
                            />
                            {item.isCleaned && (
                              <span className="absolute top-1 right-1 bg-emerald-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> TEMİZ
                              </span>
                            )}
                          </div>

                          {/* Quick Clean / Revert Action */}
                          <button
                            type="button"
                            onClick={() => handleToggleCleanItem(item)}
                            className={`mt-1.5 w-full text-[11px] font-bold flex items-center justify-center gap-1 px-2 py-0.5 rounded border transition ${
                              item.isCleaned
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            }`}
                            title={
                              item.isCleaned
                                ? 'Temizlendi. Tıklayarak orijinal fotoğrafı görebilir veya geri alabilirsiniz.'
                                : 'Sorudaki karalama ve kurşun kalem izlerini temizleyin.'
                            }
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            {item.isCleaned ? '✨ Temiz (Orijinale Dön)' : '🪄 Otomatik Temizle'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateForMultiQuestionCrop(item)}
                            className="mt-1 text-[11px] text-turquoise-700 font-semibold hover:underline flex items-center gap-0.5"
                            title="Bu fotoğrafta birden fazla soru varsa ayrı soru kaydı olarak çoğaltıp kırpabilirsiniz"
                          >
                            <Plus className="w-3 h-3" />
                            2. Soru İçin Çoğalt
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveDaksilItem(item)}
                            className="mt-1 text-[11px] text-violet-700 font-bold hover:underline flex items-center gap-1 bg-violet-50 hover:bg-violet-100 px-2 py-0.5 rounded border border-violet-200 transition"
                            title="İşaretli şıkkı veya karalamaları daksil ile elle silin"
                          >
                            <Eraser className="w-3 h-3 text-violet-600" />
                            🧼 Daksil / İncele
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
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[11px] text-slate-600">
                                Konu Etiketi (Sonra da seçilebilir)
                              </label>
                              <button
                                type="button"
                                disabled={loadingAiTempId === item.tempId}
                                onClick={() => triggerAiTopicDetection(item)}
                                className="text-[11px] font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2 py-0.5 rounded flex items-center gap-1 transition disabled:opacity-60"
                                title="Bu sorunun MEB müfredat konusunu görselden yapay zekâ ile tespit et"
                              >
                                {loadingAiTempId === item.tempId ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin text-violet-600" />
                                    <span>Tespit Ediliyor...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3 text-violet-600" />
                                    <span>✨ Yapay Zekâ ile Belirle</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <select
                              value={item.topicId}
                              onChange={(e) => {
                                const val = e.target.value;
                                const selectedT = topics.find((t) => t.id === val);
                                setStagedItems((prev) =>
                                  prev.map((p) =>
                                    p.tempId === item.tempId
                                      ? {
                                          ...p,
                                          topicId: val,
                                          subtopicName:
                                            selectedT && selectedT.subtopics.length > 0
                                              ? selectedT.subtopics[0]
                                              : '',
                                        }
                                      : p
                                  )
                                );
                              }}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white font-medium"
                            >
                              <option value="">-- Sonra Belirle --</option>
                              {topics.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.topicName}
                                </option>
                              ))}
                            </select>

                            {/* Alt Konu / Kazanım Seçici */}
                            {item.topicId && (() => {
                              const currTopic = topics.find((t) => t.id === item.topicId);
                              if (currTopic && currTopic.subtopics.length > 0) {
                                return (
                                  <div className="mt-1.5">
                                    <label className="block text-[10px] text-slate-500 mb-0.5">
                                      Alt Konu / Kazanım (MEB)
                                    </label>
                                    <select
                                      value={item.subtopicName}
                                      onChange={(e) => {
                                        const subVal = e.target.value;
                                        setStagedItems((prev) =>
                                          prev.map((p) =>
                                            p.tempId === item.tempId
                                              ? { ...p, subtopicName: subVal }
                                              : p
                                          )
                                        );
                                      }}
                                      className="w-full border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-xs"
                                    >
                                      <option value="">-- Kazanım Seçin --</option>
                                      {currTopic.subtopics.map((st) => (
                                        <option key={st} value={st}>
                                          {st}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              }
                              return (
                                <div className="mt-1.5">
                                  <label className="block text-[10px] text-slate-500 mb-0.5">
                                    Alt Konu / Kazanım (İsteğe Bağlı)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Örn: Üslü sayılarda çarpma..."
                                    value={item.subtopicName}
                                    onChange={(e) => {
                                      const subVal = e.target.value;
                                      setStagedItems((prev) =>
                                        prev.map((p) =>
                                          p.tempId === item.tempId
                                            ? { ...p, subtopicName: subVal }
                                            : p
                                        )
                                      );
                                    }}
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-xs"
                                  />
                                </div>
                              );
                            })()}

                            {aiDetectionResult[item.tempId] && (
                              <div className="mt-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 flex items-center gap-1.5 font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>
                                  ✨ Yapay Zekâ: {aiDetectionResult[item.tempId].topicName}
                                  {aiDetectionResult[item.tempId].subtopicName && (
                                    <> • Kazanım: {aiDetectionResult[item.tempId].subtopicName}</>
                                  )}{' '}
                                  (%{aiDetectionResult[item.tempId].confidence} güven)
                                </span>
                              </div>
                            )}
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

      {/* Quick Gemini API Key Prompt Modal */}
      {isApiKeyPromptOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-navy-950">Google Gemini API Anahtarı</h4>
                  <p className="text-[11px] text-slate-500">Yapay zekâ ile otomatik konu tespiti için gereklidir</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsApiKeyPromptOpen(false);
                  setPendingAiItem(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1.5">
              <p className="font-semibold">💡 Google AI Pro veya ücretsiz AI Studio anahtarınızı kullanabilirsiniz:</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                1. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold text-amber-950">aistudio.google.com/app/apikey</a> adresinden ücretsiz veya Pro hesabınızla API anahtarı alın.
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                2. Aldığınız anahtar yalnızca kendi cihazınızda (telefonunuzun/bilgisayarınızın tarayıcısında) güvenle saklanır; üçüncü şahıslara veya harici sunuculara kesinlikle iletilmez.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gemini API Key (AIzaSy...)
              </label>
              <input
                type="password"
                value={quickApiKeyInput}
                onChange={(e) => setQuickApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsApiKeyPromptOpen(false);
                  setPendingAiItem(null);
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={!quickApiKeyInput.trim()}
                onClick={handleSaveQuickApiKey}
                className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-xl shadow-sm"
              >
                Kaydet ve Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daksil & Karalama Silici Modal for staged items */}
      {activeDaksilItem && (
        <ImageDaksilModal
          imageUrl={activeDaksilItem.dataUrl}
          title="Soru Karalama ve Şık Temizleme (Daksil)"
          onClose={() => setActiveDaksilItem(null)}
          onSave={(cleanedUrl) => {
            setStagedItems((prev) =>
              prev.map((p) =>
                p.tempId === activeDaksilItem.tempId ? { ...p, dataUrl: cleanedUrl } : p
              )
            );
            setActiveDaksilItem(null);
          }}
        />
      )}
    </div>
  );
};
