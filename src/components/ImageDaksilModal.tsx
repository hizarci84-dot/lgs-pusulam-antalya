import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Eraser,
  ExternalLink,
  Maximize2,
  Paintbrush,
  RotateCcw,
  Sparkles,
  Square,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { applyDocumentWhiteningFilter, readAndCompressImageFile } from '../services/imageUtils';
import {
  CHATGPT_CLEANUP_PROMPT_TR,
  cleanQuestionImageWithAi,
  readImageFromClipboard,
} from '../services/aiVisionService';

interface ImageDaksilModalProps {
  imageUrl: string;
  onSave: (cleanedDataUrl: string) => Promise<void> | void;
  onClose: () => void;
  title?: string;
}

export const ImageDaksilModal: React.FC<ImageDaksilModalProps> = ({
  imageUrl,
  onSave,
  onClose,
  title = 'Daksil & Karalama Temizleme Aracı',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<'brush' | 'rect'>('brush');
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [isCleaningAi, setIsCleaningAi] = useState(false);
  const [showAiGuidanceModal, setShowAiGuidanceModal] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Initialize Canvas with Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      originalImageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Save initial state for undo
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const pushCurrentStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]);
  };

  const applyCleanImageDataUrl = (
    dataUrl: string,
    noticeText = '✨ Temizlenmiş görsel başarıyla aktarıldı!'
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cleanImg = new Image();
    cleanImg.onload = () => {
      canvas.width = cleanImg.naturalWidth || cleanImg.width;
      canvas.height = cleanImg.naturalHeight || cleanImg.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cleanImg, 0, 0);
      pushCurrentStateToHistory();
      setStatusMsg(noticeText);
    };
    cleanImg.src = dataUrl;
  };

  // Keyboard shortcut Ctrl+V to paste clean image directly from ChatGPT or Gemini
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            try {
              const compressed = await readAndCompressImageFile(file);
              applyCleanImageDataUrl(
                compressed.dataUrl,
                '✨ ChatGPT / Gemini\'den temizlenen soru görüntüsü panodan aktarıldı!'
              );
            } catch {
              setStatusMsg('Görsel yüklenirken bir sorun oluştu.');
            }
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handlePasteFromClipboard = async () => {
    setStatusMsg('Pano taranıyor...');
    const dataUrl = await readImageFromClipboard();
    if (dataUrl) {
      applyCleanImageDataUrl(
        dataUrl,
        '✨ ChatGPT / Gemini\'deki temiz görsel panodan başarıyla aktarıldı!'
      );
      setShowAiGuidanceModal(false);
    } else {
      setStatusMsg(
        'Panoda görsel bulunamadı. Lütfen ChatGPT veya Gemini\'deki temiz soruya sağ tıklayıp "Resmi Kopyala" deyin, ardından tekrar basın (veya Ctrl+V yapın).'
      );
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const compressed = await readAndCompressImageFile(files[0]);
      applyCleanImageDataUrl(compressed.dataUrl, '✨ Temiz görsel dosyadan başarıyla yüklendi!');
      setShowAiGuidanceModal(false);
    } catch {
      setStatusMsg('Dosya yüklenirken hata oluştu.');
    } finally {
      e.target.value = '';
    }
  };

  const handleTriggerAiClean = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsCleaningAi(true);
    setStatusMsg('Yapay zekâ ile karalamalar temizleniyor...');
    try {
      const currentUrl = canvas.toDataURL('image/jpeg', 0.90);
      const res = await cleanQuestionImageWithAi(currentUrl);
      if (res.success && res.cleanedDataUrl) {
        applyCleanImageDataUrl(res.cleanedDataUrl, '✨ Yapay zekâ karalamaları başarıyla temizledi!');
      } else {
        setShowAiGuidanceModal(true);
        setStatusMsg(res.errorMessage || 'Yapay zekâ temizliği tamamlanamadı.');
      }
    } catch (err: any) {
      setShowAiGuidanceModal(true);
      setStatusMsg('Hata: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setIsCleaningAi(false);
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = [...history];
    nextHistory.pop(); // Remove current
    const previous = nextHistory[nextHistory.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setHistory(nextHistory);
      setStatusMsg('Geri alındı.');
    }
  };

  const handleResetToOriginal = () => {
    const img = originalImageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([data]);
    setStatusMsg('Orijinal görüntüye dönüldü.');
  };

  const handleApplyMagicFilter = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsApplyingFilter(true);
    setStatusMsg('Optik kurşun kalem filtresi uygulanıyor...');
    try {
      const currentDataUrl = canvas.toDataURL('image/jpeg', 0.90);
      const filteredUrl = await applyDocumentWhiteningFilter(currentDataUrl);

      const filteredImg = new Image();
      filteredImg.onload = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(filteredImg, 0, 0);
        pushCurrentStateToHistory();
        setStatusMsg('✨ Kağıt beyazlatıldı ve açık kurşun kalem izleri solduruldu.');
        setIsApplyingFilter(false);
      };
      filteredImg.src = filteredUrl;
    } catch {
      setStatusMsg('Filtre uygulanırken bir sorun oluştu.');
      setIsApplyingFilter(false);
    }
  };

  // Coordinates translation from screen touch/click to canvas internal pixel dimensions
  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);

    if (mode === 'brush') {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (mode === 'rect') {
      setRectStart(coords);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    if (mode === 'brush') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (mode === 'rect' && rectStart) {
      const coords = getCanvasCoordinates(e);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const left = Math.min(rectStart.x, coords.x);
        const top = Math.min(rectStart.y, coords.y);
        const width = Math.abs(coords.x - rectStart.x);
        const height = Math.abs(coords.y - rectStart.y);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(left, top, width, height);
      }
      setRectStart(null);
    }

    pushCurrentStateToHistory();
  };

  const handleSaveCleaned = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSaving(true);
    try {
      const cleanedUrl = canvas.toDataURL('image/jpeg', 0.88);
      await onSave(cleanedUrl);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-turquoise-500/20 text-turquoise-400 flex items-center justify-center">
              <Eraser className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{title}</h3>
              <p className="text-[11px] text-slate-300">
                Sorudaki yuvarlak içine alınmış şıkkı veya karalamaları beyazlatıp temizleyin
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

        {/* AI & Quick Import Bar */}
        <div className="bg-gradient-to-r from-violet-50 to-turquoise-50 border-b border-violet-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-violet-950">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>Yapay Zekâ ile Karalama Temizleme</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={isCleaningAi}
              onClick={handleTriggerAiClean}
              className="px-2.5 py-1 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg flex items-center gap-1 shadow-2xs transition"
              title="Yapay zekâ ile karalamaları doğrudan temizlemeyi dene"
            >
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              <span>{isCleaningAi ? 'Temizleniyor...' : 'AI ile Otomatik Temizle'}</span>
            </button>

            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-2.5 py-1 text-xs font-bold text-navy-950 bg-turquoise-400 hover:bg-turquoise-300 rounded-lg flex items-center gap-1 shadow-2xs transition"
              title="ChatGPT veya Gemini'de ürettiğiniz temiz resmi kopyalayıp buraya tek tıkla yapıştırın"
            >
              <Clipboard className="w-3.5 h-3.5 text-navy-950" />
              <span>📋 Panodan Yapıştır (Ctrl+V)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAiGuidanceModal(true)}
              className="px-2 py-1 text-xs font-semibold text-violet-800 bg-white border border-violet-300 hover:bg-violet-100/60 rounded-lg flex items-center gap-1 shadow-2xs transition"
              title="ChatGPT ve Gemini temizleme komutu ve rehberi"
            >
              <ExternalLink className="w-3.5 h-3.5 text-violet-600" />
              <span>Hazır Komut</span>
            </button>

            <label className="px-2 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs transition">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Dosyadan Yükle</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          {/* Tool Modes */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setMode('brush')}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                mode === 'brush'
                  ? 'bg-turquoise-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Serbest Fırça: Çizerek karalamaları beyazlatır"
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Daksil Fırçası</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('rect')}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                mode === 'rect'
                  ? 'bg-turquoise-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Kutu Maske: Dikdörtgen çekerek büyük işlem bloklarını kapatır"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Kutu Maske</span>
            </button>
          </div>

          {/* Brush Sizes */}
          {mode === 'brush' && (
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200 text-[11px]">
              <span className="text-slate-500 font-semibold mr-1">Kalınlık:</span>
              <button
                type="button"
                onClick={() => setBrushSize(14)}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  brushSize === 14 ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                İnce (Şık için)
              </button>
              <button
                type="button"
                onClick={() => setBrushSize(26)}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  brushSize === 26 ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Orta
              </button>
              <button
                type="button"
                onClick={() => setBrushSize(48)}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  brushSize === 48 ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Kalın (İşlemler)
              </button>
            </div>
          )}

          {/* Magic Document Filter */}
          <button
            type="button"
            disabled={isApplyingFilter}
            onClick={handleApplyMagicFilter}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
            title="Kağıdı otomatik beyazlatır ve açık gri kurşun kalem izlerini soldurur"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isApplyingFilter ? 'İşleniyor...' : '✨ Otomatik Belge Beyazlat'}</span>
          </button>

          {/* Undo & Reset Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={history.length <= 1}
              onClick={handleUndo}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 border border-slate-300 rounded-xl font-bold flex items-center gap-1 shadow-xs transition"
              title="Son silme işlemini geri al"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Geri Al</span>
            </button>

            <button
              type="button"
              onClick={handleResetToOriginal}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-bold flex items-center gap-1 shadow-xs transition"
              title="Tüm silmeleri kaldırıp orijinal fotoğrafa dön"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Status notice */}
        {statusMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-4 py-1 text-[11px] font-semibold flex items-center justify-between">
            <span>{statusMsg}</span>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="text-emerald-700 hover:underline"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Interactive Canvas Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 bg-slate-900 p-2 sm:p-4 overflow-auto flex items-center justify-center min-h-[45vh] max-h-[65vh] select-none cursor-crosshair"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="max-h-[60vh] max-w-full w-auto h-auto object-contain bg-white rounded-lg shadow-xl touch-none"
            style={{
              cursor: mode === 'brush' ? 'crosshair' : 'crosshair',
            }}
          />
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-600 hidden sm:block">
            💡 <strong>İpucu:</strong> İşaretli şıkkın veya işlem adımlarının üzerinden geçerek kapatın. Temizlenmiş hali kitapçıkta bembeyaz görünecektir.
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Vazgeç
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveCleaned}
              className="px-5 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Check className="w-4 h-4 text-turquoise-400" />
              <span>{isSaving ? 'Kaydediliyor...' : 'Temizlenmiş Soruyu Kaydet'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Karalama Temizleme Asistanı Modalı */}
      {showAiGuidanceModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-navy-950">
                    ChatGPT & Gemini ile Karalama Temizleme
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sorudaki tüm kurşun kalem yazılarını ve işaretleri saniyeler içinde temizleyin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiGuidanceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="font-bold text-navy-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-navy-900 text-white flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Soru fotoğrafını ChatGPT veya Google Gemini'ye yükleyin.</span>
                </div>
                <div className="font-bold text-navy-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-navy-900 text-white flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Aşağıdaki hazır komutu tek tıkla kopyalayıp gönderin:</span>
                </div>
                <div className="relative bg-white border border-violet-200 rounded-lg p-2.5 text-slate-800 text-[11px] font-mono leading-relaxed">
                  "{CHATGPT_CLEANUP_PROMPT_TR}"
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(CHATGPT_CLEANUP_PROMPT_TR);
                      setPromptCopied(true);
                      setTimeout(() => setPromptCopied(false), 2500);
                    }}
                    className="mt-2 w-full py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-300 text-violet-700 font-bold rounded-lg flex items-center justify-center gap-1.5 transition text-xs font-sans"
                  >
                    {promptCopied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ Komut Panoya Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-violet-600" />
                        <span>📋 Komutu Kopyala</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="font-bold text-navy-900 flex items-center gap-2 pt-1">
                  <span className="w-5 h-5 rounded-full bg-navy-900 text-white flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>ChatGPT veya Gemini'nin verdiği temiz resme sağ tıklayıp "Resmi Kopyala" deyin.</span>
                </div>
                <div className="font-bold text-navy-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-navy-900 text-white flex items-center justify-center text-[11px] shrink-0">4</span>
                  <span>Aşağıdaki butona tıklayın veya doğrudan <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded font-bold text-[10px]">Ctrl+V</kbd> yapın!</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowAiGuidanceModal(false);
                  handleApplyMagicFilter();
                }}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                ✨ Uygulama İçi Filtreyi Dene
              </button>

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Clipboard className="w-4 h-4 text-turquoise-400" />
                <span>📋 Panodan Yapıştır (Ctrl+V)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
