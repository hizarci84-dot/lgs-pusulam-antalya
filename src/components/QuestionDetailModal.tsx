import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clipboard,
  Crop,
  Edit3,
  Eraser,
  Eye,
  HelpCircle,
  History,
  RefreshCw,
  RotateCw,
  Save,
  Sparkles,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { FreehandImageCropper } from './FreehandImageCropper';
import { ImageDaksilModal } from './ImageDaksilModal';
import {
  CURRICULUM_TOPIC_MAP,
  ERROR_REASONS,
  SUBJECT_MAP,
  getTopicsBySubject,
  inferTopicFromText,
  resolveEffectiveTopic,
} from '../data/curriculum';
import { applyCropAndRotation, readAndCompressImageFile } from '../services/imageUtils';
import { processQuestionReviewOutcome } from '../services/patternEngine';
import {
  analyzeFullQuestionWithGemini,
  getStoredGeminiApiKey,
  readImageFromClipboard,
} from '../services/aiVisionService';
import {
  CropRect,
  ErrorReasonCode,
  ExamRecord,
  QuestionPhotoAsset,
  QuestionRecord,
  ReviewOutcome,
  StudentProfile,
} from '../types/models';

interface QuestionDetailModalProps {
  question: QuestionRecord;
  exam?: ExamRecord;
  student: StudentProfile;
  photoAssets: QuestionPhotoAsset[];
  onClose: () => void;
  onSaveQuestion: (updated: QuestionRecord) => Promise<void>;
  onSavePhotoAsset: (asset: QuestionPhotoAsset) => Promise<void>;
  onDeleteQuestion: (questionId: string) => Promise<void>;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  question,
  exam,
  student,
  photoAssets,
  onClose,
  onSaveQuestion,
  onSavePhotoAsset,
  onDeleteQuestion,
}) => {
  const qPhotos = photoAssets.filter((p) => p.questionId === question.id);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const activePhoto = qPhotos[selectedPhotoIdx] || qPhotos[0] || null;

  const [zoom, setZoom] = useState(1);
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect>(
    activePhoto?.cropRect || { x: 5, y: 5, width: 90, height: 90 }
  );
  const [rotation, setRotation] = useState<number>(activePhoto?.rotation || 0);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDaksilOpen, setIsDaksilOpen] = useState(false);

  // Editable question fields
  const [status, setStatus] = useState<'wrong' | 'blank'>(question.status);
  const [questionNumber, setQuestionNumber] = useState<string>(
    question.questionNumber ? String(question.questionNumber) : ''
  );
  const [userTopicId, setUserTopicId] = useState<string>(
    question.userTopicId || ''
  );
  const [subtopicName, setSubtopicName] = useState<string>(
    question.subtopicName || ''
  );
  const [topicVerified, setTopicVerified] = useState<boolean>(
    question.topicVerifiedByUser
  );
  const [studentAnswer, setStudentAnswer] = useState<'A' | 'B' | 'C' | 'D' | ''>(
    question.studentAnswer || ''
  );
  const [correctAnswer, setCorrectAnswer] = useState<
    'A' | 'B' | 'C' | 'D' | 'Belirlenemedi' | ''
  >(question.correctAnswer || '');
  const [errorReason, setErrorReason] = useState<ErrorReasonCode | ''>(
    question.errorReason || ''
  );
  const [studentNote, setStudentNote] = useState<string>(
    question.studentNote || ''
  );
  const [solutionExplanation, setSolutionExplanation] = useState<string>(
    question.solutionExplanation || ''
  );
  const [extractedText, setExtractedText] = useState<string>(
    question.aiAnalysis?.extractedText || ''
  );
  const [solutionStepsText, setSolutionStepsText] = useState<string>(
    (question.aiAnalysis?.solutionSteps || []).join('\n')
  );
  const [commonMistakesText, setCommonMistakesText] = useState<string>(
    (question.aiAnalysis?.commonMistakes || []).join('\n')
  );
  const [practiceQuestionText, setPracticeQuestionText] = useState<string>(
    question.aiAnalysis?.similarPracticeQuestion?.questionText || ''
  );

  // AI Analysis state
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Review state
  const [reviewNote, setReviewNote] = useState('');
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activePhoto) {
      setRotation(activePhoto.rotation || 0);
      setCropRect(
        activePhoto.cropRect || { x: 5, y: 5, width: 90, height: 90 }
      );
    }
  }, [activePhoto?.id]);

  const subjectTopics = getTopicsBySubject(question.subjectId);
  const selectedTopicObj = userTopicId ? CURRICULUM_TOPIC_MAP[userTopicId] : null;
  const effectiveTopic = resolveEffectiveTopic({
    userTopicId: userTopicId || null,
    aiSuggestedTopicId: question.aiSuggestedTopicId,
    inferredTopicId: question.inferredTopicId,
    topicVerifiedByUser: topicVerified,
  });

  const handleRotatePhoto = async () => {
    if (!activePhoto) return;
    setIsProcessingImage(true);
    try {
      const nextRot = (rotation + 90) % 360;
      setRotation(nextRot);
      const newDataUrl = await applyCropAndRotation(
        activePhoto.originalDataUrl,
        activePhoto.cropRect || null,
        nextRot
      );
      await onSavePhotoAsset({
        ...activePhoto,
        rotation: nextRot,
        croppedDataUrl: newDataUrl,
      });
      setSaveBanner('Fotoğraf döndürüldü ve kaydedildi.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleApplyCrop = async () => {
    if (!activePhoto) return;
    setIsProcessingImage(true);
    try {
      const croppedUrl = await applyCropAndRotation(
        activePhoto.originalDataUrl,
        cropRect,
        rotation
      );
      await onSavePhotoAsset({
        ...activePhoto,
        cropRect,
        rotation,
        croppedDataUrl: croppedUrl,
      });
      setIsCropMode(false);
      setSaveBanner('Soru görüntüsü kırpıldı ve kaydedildi.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleResetCrop = async () => {
    if (!activePhoto) return;
    await onSavePhotoAsset({
      ...activePhoto,
      cropRect: null,
      croppedDataUrl: null,
    });
    setIsCropMode(false);
    setSaveBanner('Orijinal görüntüye dönüldü.');
  };

  // Listen for Ctrl+V globally when modal is open to paste clean question image directly
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!activePhoto) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            setIsProcessingImage(true);
            try {
              const compressed = await readAndCompressImageFile(file);
              await onSavePhotoAsset({
                ...activePhoto,
                croppedDataUrl: compressed.dataUrl,
              });
              setSaveBanner('✨ ChatGPT / Gemini\'den temizlenen soru görüntüsü panodan başarıyla aktarıldı ve kaydedildi!');
            } catch {
              setSaveBanner('Görsel yapıştırılırken hata oluştu.');
            } finally {
              setIsProcessingImage(false);
            }
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activePhoto]);

  const handlePasteFromClipboardDirect = async () => {
    if (!activePhoto) return;
    setSaveBanner('Pano taranıyor...');
    const dataUrl = await readImageFromClipboard();
    if (dataUrl) {
      await onSavePhotoAsset({
        ...activePhoto,
        croppedDataUrl: dataUrl,
      });
      setSaveBanner('✨ ChatGPT / Gemini\'den temizlenen soru görüntüsü panodan başarıyla aktarıldı ve kaydedildi!');
    } else {
      setSaveBanner('Panoda kopyalanmış görsel bulunamadı. Lütfen ChatGPT veya Gemini\'deki temiz resme sağ tıklayıp "Resmi Kopyala" deyin, ardından tekrar basın veya Ctrl+V yapın.');
    }
  };

  const handleAddExtraPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingImage(true);
    try {
      const newIds: string[] = [...question.photoIds];
      for (const file of Array.from(files)) {
        const compressed = await readAndCompressImageFile(file);
        const photoId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const asset: QuestionPhotoAsset = {
          id: photoId,
          studentId: question.studentId,
          examId: question.examId,
          questionId: question.id,
          originalDataUrl: compressed.dataUrl,
          croppedDataUrl: null,
          cropRect: null,
          rotation: 0,
          mimeType: compressed.mimeType,
          width: compressed.width,
          height: compressed.height,
          createdAt: new Date().toISOString(),
        };
        await onSavePhotoAsset(asset);
        newIds.push(photoId);
      }
      await onSaveQuestion({
        ...question,
        photoIds: newIds,
      });
      setSelectedPhotoIdx(newIds.length - 1);
      setSaveBanner('Soruya ek görüntü eklendi.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!activePhoto) {
      setAiError('Analiz için önce bu soruya bir fotoğraf eklemelisiniz.');
      return;
    }

    const apiKey = getStoredGeminiApiKey();
    if (!apiKey) {
      setAiError(
        'Yapay zekâ analizi için lütfen Ebeveyn / Ayarlar menüsünden Google Gemini API anahtarınızı girin.'
      );
      return;
    }

    setIsAnalyzingAi(true);
    setAiError(null);
    setAiStatusMessage('Soru görseli Google Gemini Yapay Zekâ ile analiz ediliyor...');

    try {
      const imgData = activePhoto.croppedDataUrl || activePhoto.originalDataUrl;
      const result = await analyzeFullQuestionWithGemini({
        dataUrl: imgData,
        subjectId: question.subjectId,
        questionStatus: status,
        studentAnswer,
      });

      if (!result.success || !result.analysis) {
        setAiError(
          result.errorMessage ||
            'Görüntü analizi gerçekleştirilemedi.'
        );
        setAiStatusMessage(null);
        return;
      }

      const analysis = result.analysis;
      if (!analysis.isReadable) {
        setAiError(
          analysis.unreadableReason ||
            'Görüntü net okunamadı. Lütfen soruyu daha yakından kırpın veya daha net bir fotoğraf yükleyin.'
        );
        setAiStatusMessage(null);
        return;
      }

      setExtractedText(analysis.extractedText || '');
      if (analysis.correctAnswer && ['A', 'B', 'C', 'D'].includes(analysis.correctAnswer)) {
        setCorrectAnswer(analysis.correctAnswer);
      }
      setSolutionStepsText((analysis.solutionSteps || []).join('\n'));
      setCommonMistakesText((analysis.commonMistakes || []).join('\n'));
      setPracticeQuestionText(
        analysis.similarPracticeQuestion?.questionText || ''
      );
      if (analysis.solutionSteps?.length > 0 && !solutionExplanation) {
        setSolutionExplanation(analysis.solutionSteps.join(' '));
      }
      if (analysis.suggestedTopicId) {
        setUserTopicId(analysis.suggestedTopicId);
        setTopicVerified(true);
      }
      if (analysis.suggestedSubtopicName) {
        setSubtopicName(analysis.suggestedSubtopicName);
      }

      const updated: QuestionRecord = {
        ...question,
        userTopicId: analysis.suggestedTopicId || userTopicId || question.userTopicId,
        topicVerifiedByUser: true,
        aiSuggestedTopicId: analysis.suggestedTopicId || question.aiSuggestedTopicId,
        subtopicName: analysis.suggestedSubtopicName || subtopicName,
        correctAnswer:
          (['A', 'B', 'C', 'D'].includes(analysis.correctAnswer)
            ? analysis.correctAnswer
            : correctAnswer) || '',
        solutionExplanation:
          solutionExplanation || (analysis.solutionSteps || []).join(' '),
        isAnalyzed: true,
        aiAnalysis: {
          ...analysis,
          suggestedSubtopicName: analysis.suggestedSubtopicName || subtopicName,
          providerName: result.analysis.providerName || 'gemini',
          modelUsed: result.analysis.modelUsed || 'gemini',
        },
      };

      await onSaveQuestion(updated);
      setAiStatusMessage(
        `Yapay zekâ analizi tamamlandı (%${analysis.confidence || 90} güven). Konu: "${analysis.suggestedTopicName || ''}" • Kazanım: "${analysis.suggestedSubtopicName || ''}" otomatik belirlendi ve kaydedildi.`
      );
    } catch (err: any) {
      setAiError(
        'Analiz sırasında bir hata oluştu: ' + (err?.message || 'Bilinmeyen hata')
      );
      setAiStatusMessage(null);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleInferTopicFromText = () => {
    const combinedText = `${extractedText} ${studentNote} ${solutionExplanation}`;
    const res = inferTopicFromText(question.subjectId, combinedText);
    if (res.topicId) {
      setUserTopicId(res.topicId);
      setTopicVerified(false);
      setSaveBanner(
        `Soru metni/notundaki anahtar kelimelerden "${CURRICULUM_TOPIC_MAP[res.topicId]?.topicName}" konusu önerildi. Doğrulamak için kaydedin.`
      );
    } else {
      setSaveBanner(
        'Metinden otomatik konu eşleşmesi bulunamadı; lütfen listeden seçin.'
      );
    }
  };

  const handleSaveChanges = async () => {
    setIsSavingChanges(true);
    setSaveSuccess(false);
    try {
      const inferred = inferTopicFromText(
        question.subjectId,
        `${extractedText} ${studentNote}`
      );

      const updated: QuestionRecord = {
        ...question,
        status,
        questionNumber: questionNumber ? Number(questionNumber) : null,
        userTopicId: userTopicId || null,
        inferredTopicId: inferred.topicId || question.inferredTopicId,
        subtopicName,
        topicVerifiedByUser: Boolean(userTopicId) ? true : topicVerified,
        studentAnswer,
        correctAnswer,
        errorReason: errorReason ? (errorReason as ErrorReasonCode) : null,
        studentNote,
        solutionExplanation,
        isAnalyzed: Boolean(
          userTopicId || solutionExplanation || extractedText || errorReason
        ),
        aiAnalysis: {
          isReadable: true,
          extractedText,
          visualDescription:
            question.aiAnalysis?.visualDescription || 'Kullanıcı tarafından kaydedildi.',
          suggestedTopicId:
            question.aiSuggestedTopicId || userTopicId || inferred.topicId || null,
          suggestedTopicName:
            (userTopicId && CURRICULUM_TOPIC_MAP[userTopicId]?.topicName) ||
            question.aiAnalysis?.suggestedTopicName ||
            'Konu belirlenmedi',
          suggestedSubtopicName: subtopicName,
          confidence: question.aiAnalysis?.confidence || 90,
          candidateTopics: question.aiAnalysis?.candidateTopics || [],
          correctAnswer: correctAnswer || 'Belirlenemedi',
          solutionSteps: solutionStepsText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          commonMistakes: commonMistakesText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          similarPracticeQuestion: {
            questionText: practiceQuestionText,
            options:
              question.aiAnalysis?.similarPracticeQuestion?.options || [],
            correctOption:
              question.aiAnalysis?.similarPracticeQuestion?.correctOption || '',
            shortSolution:
              question.aiAnalysis?.similarPracticeQuestion?.shortSolution || '',
          },
          providerName: question.aiAnalysis?.providerName || 'user',
          analyzedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      await onSaveQuestion(updated);
      setSaveSuccess(true);
      setSaveBanner('Soru analizi ve konu etiketi başarıyla kaydedildi.');
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      setSaveBanner('Kaydedilirken hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setIsSavingChanges(false);
    }
  };

  const handleRecordReview = async (outcome: ReviewOutcome) => {
    const { updatedQuestion } = processQuestionReviewOutcome(
      {
        ...question,
        status,
        userTopicId: userTopicId || question.userTopicId,
        subtopicName,
        errorReason: errorReason ? (errorReason as ErrorReasonCode) : question.errorReason,
        studentNote,
        solutionExplanation,
      },
      outcome,
      reviewNote,
      student.reviewIntervalsDays
    );
    await onSaveQuestion(updatedQuestion);
    setReviewNote('');
    setSaveBanner(
      outcome === 'solved_independently'
        ? 'Harika! Yardımsız doğru çözüm ilerleme olarak kaydedildi ve sonraki tekrar tarihi güncellendi.'
        : outcome === 'still_cannot_solve'
        ? 'Soru "Konu Çalışma Listesi"ne alındı ve bugün tekrar edilecekler arasında tutuldu.'
        : 'Tekrar kaydı işlendi. Bağımsız çözümü pekiştirmek için kısa süreli tekrar planlandı.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-navy-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-turquoise-500 text-navy-950">
                {SUBJECT_MAP[question.subjectId]?.name}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  status === 'wrong'
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-400 text-navy-950'
                }`}
              >
                {status === 'wrong' ? 'YANLIŞ SORU' : 'BOŞ SORU'}
              </span>
            </div>
            <h3 className="font-bold text-base mt-1">
              {exam?.name || 'Deneme Sınavı'}{' '}
              {questionNumber ? `• Soru #${questionNumber}` : ''}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {saveBanner && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between">
              <span>{saveBanner}</span>
              <button
                onClick={() => setSaveBanner(null)}
                className="text-emerald-700 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* SECTION 1: Fotoğraftaki Soru (Zoom, Rotate, Crop, Multi-photo) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-turquoise-600" />
                1. Fotoğraftaki Soru ({qPhotos.length} Görüntü)
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))))}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                  title="Küçült"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold text-slate-700 px-1">
                  {zoom}x
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.5).toFixed(1))))}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                  title="Büyüt"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRotatePhoto}
                  disabled={!activePhoto || isProcessingImage}
                  className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1 font-medium"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Döndür
                </button>
                <button
                  type="button"
                  onClick={() => setIsCropMode((v) => !v)}
                  disabled={!activePhoto}
                  className={`px-2.5 py-1 text-xs border rounded-lg flex items-center gap-1 font-medium ${
                    isCropMode
                      ? 'bg-navy-900 text-white border-navy-900'
                      : 'bg-white text-navy-900 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Crop className="w-3.5 h-3.5" />
                  {isCropMode ? 'Kırpmayı Kapat' : 'Serbest Kırp'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDaksilOpen(true)}
                  disabled={!activePhoto}
                  className="px-2.5 py-1 text-xs bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-300 rounded-lg flex items-center gap-1 font-bold transition shadow-2xs"
                  title="Sorudaki yuvarlak içine alınmış şıkkı, karalamaları daksilleyin veya ChatGPT/Gemini ile temizleyin"
                >
                  <Eraser className="w-3.5 h-3.5 text-violet-600" />
                  🧼 Daksil / AI Temizle
                </button>
                <button
                  type="button"
                  onClick={handlePasteFromClipboardDirect}
                  disabled={!activePhoto}
                  className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1 font-bold transition shadow-2xs"
                  title="ChatGPT veya Gemini'deki temiz resmi kopyalayıp buraya doğrudan yapıştırın (veya klavyeden Ctrl+V)"
                >
                  <Clipboard className="w-3.5 h-3.5 text-emerald-600" />
                  📋 Panodan Yapıştır (Ctrl+V)
                </button>
                <label className="px-2.5 py-1 text-xs bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-lg cursor-pointer flex items-center gap-1 font-medium">
                  <Camera className="w-3.5 h-3.5" />
                  + Ek Görüntü
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddExtraPhoto}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {qPhotos.length > 1 && (
              <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1">
                {qPhotos.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPhotoIdx(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      idx === selectedPhotoIdx
                        ? 'bg-navy-900 text-white border-navy-900'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Görüntü #{idx + 1}
                  </button>
                ))}
              </div>
            )}

            {isCropMode && activePhoto ? (
              <FreehandImageCropper
                imageUrl={activePhoto.originalDataUrl}
                initialCropRect={activePhoto.cropRect || cropRect}
                isProcessing={isProcessingImage}
                onCancel={() => setIsCropMode(false)}
                onResetOriginal={handleResetCrop}
                onApplyCrop={async (rect) => {
                  setIsProcessingImage(true);
                  try {
                    const croppedUrl = await applyCropAndRotation(
                      activePhoto.originalDataUrl,
                      rect,
                      rotation
                    );
                    await onSavePhotoAsset({
                      ...activePhoto,
                      cropRect: rect,
                      rotation,
                      croppedDataUrl: croppedUrl,
                    });
                    setCropRect(rect);
                    setIsCropMode(false);
                    setSaveBanner('Soru serbest elle başarıyla kırpıldı ve kaydedildi.');
                  } catch (err: any) {
                    setSaveBanner('Kırpma sırasında hata: ' + (err?.message || 'Bilinmeyen hata'));
                  } finally {
                    setIsProcessingImage(false);
                  }
                }}
              />
            ) : activePhoto ? (
              <div className="relative bg-slate-900/5 rounded-xl overflow-auto max-h-80 flex items-center justify-center p-2 border border-slate-200">
                <div
                  className="relative inline-block transition-transform duration-150"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={activePhoto.croppedDataUrl || activePhoto.originalDataUrl}
                    alt="Soru fotoğrafı"
                    className="max-h-72 w-auto object-contain rounded-lg shadow-2xs"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Bu soru kaydına henüz fotoğraf eklenmemiş. Yukarıdaki "+ Ek Görüntü" butonuyla fotoğraf yükleyebilirsiniz.
              </div>
            )}

            {/* AI Trigger Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200">
              <div className="text-[11px] text-slate-600">
                Fotoğraftan soru metni, konu önerisi, çözüm adımları ve benzer alıştırma üretmek için:
              </div>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzingAi || !activePhoto}
                className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-turquoise-400" />
                {isAnalyzingAi
                  ? 'Yapay Zekâ Analiz Ediyor...'
                  : 'Yapay Zekâ ile Soruyu Analiz Et'}
              </button>
            </div>

            {aiStatusMessage && (
              <div className="mt-2 bg-turquoise-50 border border-turquoise-300 text-navy-900 p-2.5 rounded-lg text-xs">
                {aiStatusMessage}
              </div>
            )}
            {aiError && (
              <div className="mt-2 bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded-lg text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {/* SECTION 3: Önerilen Konu & Doğrulanmış Konu Etiketi (Priority 1..4) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900">
                3. Önerilen ve Doğrulanmış Konu Etiketi
              </h4>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  effectiveTopic.isVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {effectiveTopic.isVerified
                  ? '✓ Kullanıcı Tarafından Doğrulandı'
                  : effectiveTopic.source === 'ai_suggested'
                  ? 'Yapay Zekâ Önerisi (Doğrulama Bekliyor)'
                  : effectiveTopic.source === 'inferred'
                  ? 'Metinden Önerildi (Doğrulama Bekliyor)'
                  : 'Konu Belirlenmedi'}
              </span>
            </div>

            {question.aiSuggestedTopicId &&
              CURRICULUM_TOPIC_MAP[question.aiSuggestedTopicId] && (
                <div className="bg-turquoise-50/70 border border-turquoise-200 rounded-lg p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-navy-900">
                      Modelin Önerdiği Konu:{' '}
                    </span>
                    <span className="text-turquoise-900 font-bold">
                      {CURRICULUM_TOPIC_MAP[question.aiSuggestedTopicId].topicName}
                    </span>
                    {question.aiAnalysis?.confidence && (
                      <span className="text-slate-500 ml-1">
                        (%{question.aiAnalysis.confidence} güven)
                      </span>
                    )}
                  </div>
                  {userTopicId !== question.aiSuggestedTopicId && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserTopicId(question.aiSuggestedTopicId!);
                        setTopicVerified(true);
                      }}
                      className="px-2.5 py-1 bg-turquoise-600 text-white rounded-lg font-semibold text-xs"
                    >
                      Bu Konuyu Onayla
                    </button>
                  )}
                </div>
              )}

            {question.aiAnalysis?.candidateTopics &&
              question.aiAnalysis.candidateTopics.length > 1 && (
                <div className="text-xs space-y-1">
                  <div className="text-slate-600 font-medium">
                    Aday Konular (Seçmek için dokunun):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {question.aiAnalysis.candidateTopics.map((cand, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (cand.topicId && CURRICULUM_TOPIC_MAP[cand.topicId]) {
                            setUserTopicId(cand.topicId);
                            if (cand.subtopicName) setSubtopicName(cand.subtopicName);
                            setTopicVerified(true);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-turquoise-50 text-navy-900 font-medium"
                      >
                        {cand.topicName} (%{cand.confidence})
                      </button>
                    ))}
                  </div>
                </div>
              )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  MEB Müfredat Konusu (Kullanıcı Seçimi - 1. Öncelik)
                </label>
                <select
                  value={userTopicId}
                  onChange={(e) => {
                    setUserTopicId(e.target.value);
                    setTopicVerified(Boolean(e.target.value));
                    const t = CURRICULUM_TOPIC_MAP[e.target.value];
                    if (t && t.subtopics.length > 0) {
                      setSubtopicName(t.subtopics[0]);
                    }
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-navy-900 font-medium"
                >
                  <option value="">-- Konu belirlenmedi --</option>
                  {subjectTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.unitNumber}. Ünite: {t.topicName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alt Konu / Kazanım
                </label>
                {selectedTopicObj && selectedTopicObj.subtopics.length > 0 ? (
                  <select
                    value={subtopicName}
                    onChange={(e) => setSubtopicName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-navy-900"
                  >
                    <option value="">-- Alt konu seçin --</option>
                    {selectedTopicObj.subtopics.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={subtopicName}
                    onChange={(e) => setSubtopicName(e.target.value)}
                    placeholder="Örn: EBOB-EKOK Problemleri"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2 & 5 & 6: Soru Metni, Cevaplar ve Hata Nedeni */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold uppercase tracking-wider text-navy-900">
                  2. Okunan Soru Metni
                </h4>
                <button
                  type="button"
                  onClick={handleInferTopicFromText}
                  className="text-[11px] font-semibold text-turquoise-700 hover:underline"
                >
                  Metinden Konu Öner
                </button>
              </div>
              <textarea
                rows={4}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Soru metni (yapay zekâ ile otomatik okunur veya buraya yazabilirsiniz)..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-navy-900">
                5. Doğru Cevap, Durum & Hata Nedeni
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Soru Durumu</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'wrong' | 'blank')}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold"
                  >
                    <option value="wrong">Yanlış Yaptım</option>
                    <option value="blank">Boş Bıraktım</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Soru No</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={questionNumber}
                    onChange={(e) => setQuestionNumber(e.target.value)}
                    placeholder="1-20"
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Benim Cevabım</label>
                  <select
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5"
                  >
                    <option value="">Boş / Seçilmedi</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Doğru Cevap</label>
                  <select
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-emerald-700"
                  >
                    <option value="">Belirlenmedi</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Hata Nedeni (Kullanıcı Belirtir)
                </label>
                <select
                  value={errorReason}
                  onChange={(e) => setErrorReason(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                >
                  <option value="">-- Hata nedeni seçin (İsteğe bağlı) --</option>
                  {ERROR_REASONS.map((er) => (
                    <option key={er.code} value={er.code}>
                      {er.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4, 6, 7, 8: Çözüm Adımları, Yaygın Hatalar, Benzer Alıştırma ve Öğrenci Notu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-navy-900">
                4. Adım Adım Çözüm Açıklaması
              </h4>
              <textarea
                rows={4}
                value={
                  solutionStepsText || solutionExplanation
                }
                onChange={(e) => {
                  setSolutionStepsText(e.target.value);
                  setSolutionExplanation(e.target.value);
                }}
                placeholder="Sorunun adım adım çözümü..."
                className="w-full border border-slate-300 rounded-lg p-2.5"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-navy-900">
                6. Yaygın Hata İhtimalleri & 7. Benzer Alıştırma
              </h4>
              <textarea
                rows={2}
                value={commonMistakesText}
                onChange={(e) => setCommonMistakesText(e.target.value)}
                placeholder="Bu soru tipinde sık yapılan hatalar..."
                className="w-full border border-slate-300 rounded-lg p-2"
              />
              <textarea
                rows={2}
                value={practiceQuestionText}
                onChange={(e) => setPracticeQuestionText(e.target.value)}
                placeholder="Benzer seviyede yeni alıştırma sorusu..."
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>

          {/* SECTION 8: Öğrencinin Kendi Çözüm Notu */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-turquoise-600" />
              8. Öğrencinin Kendi Çözüm Notu
            </h4>
            <textarea
              rows={2}
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder="Kendime not: Bu soruda nerede takıldım, bir dahaki sefere neye dikkat etmeliyim?"
              className="w-full border border-slate-300 rounded-lg p-2.5"
            />
          </div>

          {/* SECTION 12: Akıllı Tekrar Sistemi ve Tekrar Çözüm Geçmişi */}
          <div className="bg-navy-50 border border-navy-200 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-turquoise-600" />
                  Akıllı Tekrar Çözüm Kaydı (Aşama {question.reviewStage}/4)
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Sonraki planlı tekrar: <strong>{question.nextReviewDate}</strong> • Fotoğraf ve çözüm geçmişiniz asla silinmez.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-navy-200 text-navy-900">
                {question.learningStatus === 'mastered_independent'
                  ? '✓ Yardımsız Doğru Çözüldü'
                  : question.learningStatus === 'understood_with_help'
                  ? 'İpucu / Çözümle Anlaşıldı (Bağımsız Çözüm Bekleniyor)'
                  : question.learningStatus === 'needs_topic_study'
                  ? 'Konu Çalışma Listesinde (Hâlâ Çözülemedi)'
                  : 'Henüz Tekrar Çözülmedi'}
              </span>
            </div>

            <input
              type="text"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Bu tekrar denemesi için kısa not (isteğe bağlı)..."
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleRecordReview('solved_independently')}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Yardımsız doğru çözdüm
              </button>
              <button
                type="button"
                onClick={() => handleRecordReview('solved_with_hint')}
                className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                İpucuyla çözdüm
              </button>
              <button
                type="button"
                onClick={() => handleRecordReview('understood_after_solution')}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-semibold flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                Çözümü gördükten sonra anladım
              </button>
              <button
                type="button"
                onClick={() => handleRecordReview('still_cannot_solve')}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                Hâlâ çözemiyorum (Konu listesine al)
              </button>
            </div>

            {question.attemptHistory && question.attemptHistory.length > 0 && (
              <div className="pt-2 border-t border-navy-200/70">
                <div className="text-[11px] font-bold text-navy-900 flex items-center gap-1 mb-1.5">
                  <History className="w-3.5 h-3.5" />
                  Tekrar Çözüm Geçmişi ({question.attemptHistory.length} kayıt)
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {question.attemptHistory.map((att) => {
                    const labels: Record<ReviewOutcome, string> = {
                      solved_independently: 'Yardımsız doğru çözdüm',
                      solved_with_hint: 'İpucuyla çözdüm',
                      understood_after_solution: 'Çözümü gördükten sonra anladım',
                      still_cannot_solve: 'Hâlâ çözemiyorum',
                    };
                    return (
                      <div
                        key={att.id}
                        className="text-[11px] bg-white px-2.5 py-1.5 rounded border border-slate-200 flex items-center justify-between"
                      >
                        <span>
                          <strong>{labels[att.outcome]}</strong>
                          {att.note ? ` — "${att.note}"` : ''}
                        </span>
                        <span className="text-slate-500">
                          {new Date(att.attemptedAt).toLocaleDateString('tr-TR')} → Sonraki:{' '}
                          {att.nextScheduledDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={async () => {
              if (
                window.confirm(
                  'Bu soru kaydını ve fotoğrafını silmek istediğinize emin misiniz?'
                )
              ) {
                await onDeleteQuestion(question.id);
                onClose();
              }
            }}
            className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 rounded-xl flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Soruyu Sil
          </button>

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
              disabled={isSavingChanges}
              onClick={handleSaveChanges}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-60'
              }`}
            >
              {isSavingChanges ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-turquoise-400" />
                  Kaydediliyor...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Değişiklikler Kaydedildi!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-turquoise-400" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Daksil & Karalama Silici Modal */}
      {isDaksilOpen && activePhoto && (
        <ImageDaksilModal
          imageUrl={activePhoto.croppedDataUrl || activePhoto.originalDataUrl}
          title={`Soru ${question.questionNumber ? `#${question.questionNumber}` : ''} - Karalama ve Şık Temizleme`}
          onClose={() => setIsDaksilOpen(false)}
          onSave={async (cleanedDataUrl) => {
            const updatedAsset: QuestionPhotoAsset = {
              ...activePhoto,
              croppedDataUrl: cleanedDataUrl,
            };
            await onSavePhotoAsset(updatedAsset);
            setSaveBanner('Karalamalar temizlendi ve kaydedildi. Kitapçık çıktısında bembeyaz görünecektir.');
          }}
        />
      )}
    </div>
  );
};
