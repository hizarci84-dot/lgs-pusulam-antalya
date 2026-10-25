import { getTopicsBySubject, SUBJECT_MAP } from '../data/curriculum';
import { SubjectId } from '../types/models';
import {
  applyDocumentWhiteningFilter,
  buildHybridCleanSvg,
  CleanupStatus,
  cropRotateAndCleanQuestion,
  extractIllustrationSnippet,
  InpaintRegionBox,
  inpaintQuestionDataUrl,
  MarkRegionType,
  transformBoxToRotatedCrop,
} from './imageUtils';

const STORAGE_KEY_API_KEY = 'lgs_gemini_api_key';
const STORAGE_KEY_MODEL = 'lgs_gemini_model';
function getIntegratedDefaultApiKey(): string {
  try {
    return atob('QVEuQWI4Uk42TFk5UHhraVkxOEY2UV9aRmdsclNlcF82cGs5aDR6ZlRFZlplaVlObmxvT2c=');
  } catch {
    return '';
  }
}

export const DEFAULT_MODEL = 'gemini-3.5-flash';

export const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
];

export function getStoredGeminiApiKey(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_API_KEY);
    if (saved !== null && saved !== undefined && saved.trim().length > 0) {
      // Auto-migrate if old deprecated key was saved in user browser
      if (saved.includes('Ab8RN6Jt0Ici')) {
        const newKey = getIntegratedDefaultApiKey();
        saveStoredGeminiApiKey(newKey);
        return newKey;
      }
      return saved.trim();
    }
    return getIntegratedDefaultApiKey();
  } catch {
    return getIntegratedDefaultApiKey();
  }
}

export function saveStoredGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  } catch {
    // ignore
  }
}

export function getStoredGeminiModel(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MODEL)?.trim();
    if (saved && (saved === 'gemini-3.5-flash' || saved === 'gemini-3.6-flash')) {
      return saved;
    }
    // Auto-upgrade to high-precision gemini-3.5-flash
    saveStoredGeminiModel(DEFAULT_MODEL);
    return DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

export function saveStoredGeminiModel(model: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODEL, model.trim() || DEFAULT_MODEL);
  } catch {
    // ignore
  }
}

/**
 * Downscales an image DataURL before sending it over the network to Gemini Vision.
 * Significantly cuts upload payload size (from 3MB+ to ~120KB) and slashes network latency.
 */
export function downscaleDataUrlForAi(dataUrl: string, maxDim = 1024): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || !dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (w <= maxDim && h <= maxDim) {
          resolve(dataUrl);
          return;
        }
        const scale = maxDim / Math.max(w, h);
        const targetW = Math.max(10, Math.round(w * scale));
        const targetH = Math.max(10, Math.round(h * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      } catch {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

export async function testGeminiApiKey(
  apiKey: string,
  model = DEFAULT_MODEL
): Promise<{ success: boolean; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, message: 'Lütfen bir API anahtarı girin.' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Merhaba! Kısa yanıt ver: Bağlantı başarılı de.' }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 20,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedMsg = `Hata kodu: ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) {
          parsedMsg = errJson.error.message;
        }
      } catch {
        // use raw text preview
      }
      return {
        success: false,
        message: `API Anahtarı geçersiz veya yetkisiz (${parsedMsg})`,
      };
    }

    return {
      success: true,
      message: '✅ Google Gemini Yapay Zekâ bağlantısı başarıyla doğrulandı!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Bağlantı kurulamadı: ${err?.message || 'İnternet bağlantınızı kontrol edin.'}`,
    };
  }
}

export interface TopicDetectionResult {
  success: boolean;
  topicId?: string;
  topicName?: string;
  subtopicName?: string;
  confidence?: number;
  extractedText?: string;
  errorMessage?: string;
}

/**
 * Sends the question image to Gemini Vision with MEB 8th grade curriculum topics
 * to automatically determine the exact question topic and extract text.
 */
export async function detectQuestionTopicWithAi(params: {
  dataUrl: string;
  subjectId: SubjectId;
}): Promise<TopicDetectionResult> {
  const apiKey = getStoredGeminiApiKey();
  if (!apiKey) {
    return {
      success: false,
      errorMessage:
        'Yapay zekâ ile konu belirlemek için lütfen Ayarlar bölümüne Google Gemini API anahtarınızı girin.',
    };
  }

  const model = getStoredGeminiModel();
  const subjectTopics = getTopicsBySubject(params.subjectId);
  const subjectName = SUBJECT_MAP[params.subjectId]?.name || params.subjectId;

  const topicsListStr = subjectTopics
    .map(
      (t) =>
        `- ID: "${t.id}" | Ünite: "${t.unitName}" | Konu Adı: "${t.topicName}" | Alt Kazanımlar: [${t.subtopics.join(', ')}]`
    )
    .join('\n');

  const systemPrompt = `Sen MEB 8. Sınıf LGS (Liselere Geçiş Sistemi) sınavı için uzman bir öğretmen ve soru analiz asistanısın.
Kullanıcı sana "${subjectName}" dersine ait bir soru fotoğrafı gönderdi.
Bu ders için resmi MEB müfredat konu listesi ve her konunun altındaki resmî alt kazanımlar aşağıdadır:
${topicsListStr}

GÖREVİN:
1. Görseldeki soru metnini, öncülleri, şekilleri ve şıkları dikkatlice oku.
2. Bu sorunun hangi MEB LGS konusuna ait olduğunu ve o konunun altındaki HANGİ ALT KAZANIMA (alt konuya) karşılık geldiğini kesin olarak tespit et.
3. "topicId": Yukarıdaki listeden en uygun olan konunun tam "ID" değerini seç.
4. "subtopicName": Seçtiğin konunun "Alt Kazanımlar" dizisinden bu sorunun ölçtüğü tam kazanım adını seç. (Kendi kafandan genel bir ifade yazma, listedeki kazanım adını aynen ver).
5. Yanıtını YALNIZCA aşağıdaki JSON formatında döndür:

{
  "isReadable": true,
  "topicId": "seçilen_konunun_tam_id_değeri",
  "topicName": "seçilen_konunun_adı",
  "subtopicName": "seçilen_alt_kazanımın_tam_adı",
  "confidence": 95,
  "extractedText": "sorunun_okunabilen_özet_metni"
}

Eğer soru görseli çok karanlık, bulanık veya okunamıyorsa:
{"isReadable": false, "errorMessage": "Görsel net okunamadı."}`;

  try {
    const cleanBase64 = params.dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const mimeMatch = params.dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const modelsToTry = [
      model,
      ...CANDIDATE_MODELS.filter((m) => m !== model),
    ];

    let parsed: any = null;
    let lastError = '';

    for (const currentModel of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingBudget: 1 },
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = `${currentModel} (${response.status}): ${errText.slice(0, 150)}`;
          console.warn(`detectQuestionTopicWithAi: ${currentModel} returned ${response.status}, trying fallback model...`);
          continue;
        }

        const data = await response.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          parsed = JSON.parse(rawJsonText);
          break;
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    if (!parsed) {
      return {
        success: false,
        errorMessage: `Yapay zekâ yanıt veremedi: ${lastError}`,
      };
    }
    if (!parsed.isReadable) {
      return {
        success: false,
        errorMessage: parsed.errorMessage || 'Soru görseli net okunamadı.',
      };
    }

    // Verify if the detected topicId matches one of our official curriculum topics
    const matchedTopic = subjectTopics.find((t) => t.id === parsed.topicId);
    const finalTopicId = matchedTopic ? matchedTopic.id : (parsed.topicId || subjectTopics[0]?.id);
    const finalTopicName = matchedTopic ? matchedTopic.topicName : (parsed.topicName || 'Belirlenen Konu');

    // Canonicalize subtopicName against matchedTopic's subtopics
    let finalSubtopicName = (parsed.subtopicName || '').trim();
    if (matchedTopic && matchedTopic.subtopics.length > 0) {
      const lowerCandidate = finalSubtopicName.toLocaleLowerCase('tr-TR');
      const foundSub = matchedTopic.subtopics.find((st) => {
        const lowerSt = st.toLocaleLowerCase('tr-TR');
        return lowerSt === lowerCandidate || lowerCandidate.includes(lowerSt) || lowerSt.includes(lowerCandidate);
      });
      if (foundSub) {
        finalSubtopicName = foundSub;
      } else if (!finalSubtopicName) {
        finalSubtopicName = matchedTopic.subtopics[0];
      }
    }

    return {
      success: true,
      topicId: finalTopicId,
      topicName: finalTopicName,
      subtopicName: finalSubtopicName,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 90,
      extractedText: parsed.extractedText || '',
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: `Yapay zekâ analizi sırasında hata: ${err?.message || 'Bilinmeyen hata'}`,
    };
  }
}

/**
 * Performs full vision analysis including step-by-step solution, extracted text,
 * common mistakes and practice question using Gemini.
 */
export async function analyzeFullQuestionWithGemini(params: {
  dataUrl: string;
  subjectId: SubjectId;
  questionStatus?: 'wrong' | 'blank';
  studentAnswer?: string;
}): Promise<{
  success: boolean;
  analysis?: any;
  errorMessage?: string;
}> {
  const apiKey = getStoredGeminiApiKey();
  if (!apiKey) {
    return {
      success: false,
      errorMessage:
        'Yapay zekâ analizi için lütfen Ayarlar bölümüne Google Gemini API anahtarınızı girin.',
    };
  }

  const model = getStoredGeminiModel();
  const subjectTopics = getTopicsBySubject(params.subjectId);
  const subjectName = SUBJECT_MAP[params.subjectId]?.name || params.subjectId;

  const topicsListStr = subjectTopics
    .map(
      (t) =>
        `- ID: "${t.id}" | Ünite: "${t.unitName}" | Konu Adı: "${t.topicName}" | Alt Konular: [${t.subtopics.join(', ')}]`
    )
    .join('\n');

  const systemPrompt = `Sen MEB 8. Sınıf LGS sınavı için uzman bir öğretmen ve soru analiz asistanısın.
Kullanıcı sana "${subjectName}" dersine ait bir soru fotoğrafı gönderdi.
Bu ders için resmi MEB müfredat konu listesi ve her konunun altındaki resmî alt kazanımlar aşağıdadır:
${topicsListStr}

GÖREVİN:
1. Görseldeki soru metnini, öncülleri, şekilleri ve şıkları dikkatlice oku.
2. Sorunun hangi MEB LGS konusuna ait olduğunu ("suggestedTopicId") ve o konunun altındaki HANGİ ALT KAZANIMA ("suggestedSubtopicName") karşılık geldiğini listeden birebir seçerek kesin olarak belirle.
3. Sorunun doğru şıkkını, adım adım çözümünü ve bu konuda yapılan yaygın hataları çıkar.
4. Yanıtını YALNIZCA aşağıdaki JSON formatında döndür:

{
  "isReadable": true,
  "extractedText": "sorunun_tam_metni",
  "visualDescription": "görseldeki_şekil_ve_tablo_açıklaması",
  "suggestedTopicId": "seçilen_konunun_tam_id_değeri",
  "suggestedTopicName": "konu_adı",
  "suggestedSubtopicName": "seçilen_alt_kazanımın_tam_adı",
  "confidence": 95,
  "candidateTopics": [{"topicId": "id", "topicName": "ad", "confidence": 95}],
  "correctAnswer": "A",
  "solutionSteps": ["Adım 1: ...", "Adım 2: ..."],
  "commonMistakes": ["Sık yapılan hata 1: ..."],
  "similarPracticeQuestion": {
    "questionText": "Aynı kazanımı ölçen benzer bir pekiştirme sorusu",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctOption": "B",
    "shortSolution": "Kısa çözüm açıklaması"
  }
}

Eğer soru görseli okunamıyorsa:
{"isReadable": false, "unreadableReason": "Soru metni okunamadı, lütfen daha yakından ve net çekin."}`;

  try {
    const cleanBase64 = params.dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const mimeMatch = params.dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const modelsToTry = [
      model,
      ...CANDIDATE_MODELS.filter((m) => m !== model),
    ];

    let parsed: any = null;
    let lastError = '';

    for (const currentModel of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingBudget: 1 },
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = `${currentModel} (${response.status}): ${errText.slice(0, 150)}`;
          console.warn(`detectQuestionErrorReasonWithAi: ${currentModel} returned ${response.status}, trying fallback model...`);
          continue;
        }

        const data = await response.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          parsed = JSON.parse(rawJsonText);
          break;
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    if (!parsed) {
      return {
        success: false,
        errorMessage: `Yapay zekâ yanıt veremedi: ${lastError}`,
      };
    }
    if (!parsed.isReadable) {
      return {
        success: false,
        errorMessage: parsed.unreadableReason || 'Soru görseli net okunamadı.',
      };
    }

    // Canonicalize suggestedTopicId & suggestedSubtopicName
    const matchedTopic = subjectTopics.find((t) => t.id === parsed.suggestedTopicId);
    let finalSubtopicName = (parsed.suggestedSubtopicName || '').trim();
    if (matchedTopic && matchedTopic.subtopics.length > 0) {
      const lowerCandidate = finalSubtopicName.toLocaleLowerCase('tr-TR');
      const foundSub = matchedTopic.subtopics.find((st) => {
        const lowerSt = st.toLocaleLowerCase('tr-TR');
        return lowerSt === lowerCandidate || lowerCandidate.includes(lowerSt) || lowerSt.includes(lowerCandidate);
      });
      if (foundSub) {
        finalSubtopicName = foundSub;
      } else if (!finalSubtopicName) {
        finalSubtopicName = matchedTopic.subtopics[0];
      }
    }

    return {
      success: true,
      analysis: {
        ...parsed,
        suggestedTopicId: matchedTopic ? matchedTopic.id : (parsed.suggestedTopicId || subjectTopics[0]?.id),
        suggestedTopicName: matchedTopic ? matchedTopic.topicName : (parsed.suggestedTopicName || 'Belirlenen Konu'),
        suggestedSubtopicName: finalSubtopicName,
        providerName: 'gemini',
        modelUsed: model,
        analyzedAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: `Yapay zekâ analizi sırasında hata: ${err?.message || 'Bilinmeyen hata'}`,
    };
  }
}

export interface CleanImageResult {
  success: boolean;
  cleanedDataUrl?: string;
  errorMessage?: string;
  isQuotaError?: boolean;
}

export const CHATGPT_CLEANUP_PROMPT_TR =
  'Bu soruda öğrenci tarafından karalanan kısımları kaldırıp sorunun temiz halini karşıma getirebilir misin';

export const AI_IMAGE_CLEANUP_SYSTEM_PROMPT =
  'Edit the uploaded photo of this Turkish 8th grade LGS test question. Remove all student pencil/pen scribbles, calculations, circles around options, underlines, and stray handwriting marks from the page, reconstructing the clean original printed question beneath them. Keep all printed question text, Turkish characters, diagrams, tables, formulas, and A, B, C, D choices intact and legible. Produce a clean, straightened, scan-like test page.';

/**
 * Reads an image from the system clipboard if available.
 */
export async function readImageFromClipboard(): Promise<string | null> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      }
    }
  } catch (err) {
    console.warn('Clipboard read image failed or permission denied:', err);
  }
  return null;
}

/**
 * Attempts to automatically clean scribbles from question image using AI (Gemini Multimodal Reconstruction).
 */
export async function cleanQuestionImageWithAi(dataUrl: string): Promise<CleanImageResult> {
  const geminiKey = getStoredGeminiApiKey();

  if (!geminiKey || !geminiKey.trim()) {
    try {
      const localClean = await applyDocumentWhiteningFilter(dataUrl);
      return {
        success: true,
        cleanedDataUrl: localClean,
      };
    } catch {
      return {
        success: false,
        errorMessage: 'Google Gemini API anahtarı tanımlanmamış.',
      };
    }
  }

  try {
    const res = await processQuestionPhotoWithAi(dataUrl);
    if (res.success && res.cleanDataUrl) {
      return {
        success: true,
        cleanedDataUrl: res.cleanDataUrl,
      };
    }
    // Fallback to local whitening filter
    const localClean = await applyDocumentWhiteningFilter(dataUrl);
    return {
      success: true,
      cleanedDataUrl: localClean,
    };
  } catch (err: any) {
    try {
      const localClean = await applyDocumentWhiteningFilter(dataUrl);
      return {
        success: true,
        cleanedDataUrl: localClean,
      };
    } catch {
      return {
        success: false,
        errorMessage: `İşlem hatası: ${err?.message || 'Bilinmeyen hata'}`,
      };
    }
  }
}

/**
 * Crops a base64 or DataURL image based on normalized [ymin, xmin, ymax, xmax] (0..1000 scale) bounding box.
 */
export function cropImageDataUrlByBox(
  dataUrl: string,
  box: [number, number, number, number]
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => reject(new Error('Görüntü kırpılırken yüklenemedi.'));
    img.onload = () => {
      try {
        const W = img.naturalWidth || img.width;
        const H = img.naturalHeight || img.height;
        const [ymin, xmin, ymax, xmax] = box;

        const x0 = Math.max(0, Math.round((xmin / 1000) * W));
        const y0 = Math.max(0, Math.round((ymin / 1000) * H));
        const w = Math.min(W - x0, Math.round(((xmax - xmin) / 1000) * W));
        const h = Math.min(H - y0, Math.round(((ymax - ymin) / 1000) * H));

        if (w <= 10 || h <= 10) {
          resolve(dataUrl);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, x0, y0, w, h, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        reject(err);
      }
    };
    img.src = dataUrl;
  });
}

export interface CleanCroppedQuestionResult {
  success: boolean;
  cleanDataUrl: string;
  rawOriginalDataUrl: string;
  cleanupStatus: CleanupStatus;
  statusMessage: string;
  cleanedMarkCount: number;
  preservedRiskMarkCount: number;
  overlapWarning: boolean;
  overlapMessage: string;
  detectedSubject?: SubjectId;
  topicId?: string;
  topicName?: string;
  subtopicName?: string;
  detectedTopicName?: string;
  detectedSubtopicName?: string;
  confidence?: number;
  errorMessage?: string;
}

/**
 * Dedicated AI handwriting cleanup engine for already-cropped questions.
 * Operates directly on the cropped question coordinate frame ([0, 0, 1000, 1000]),
 * eliminating bounding box drift from whole-photo re-cropping.
 * Preserves the original cropped question as an immutable base for undo/recovery.
 */
export async function cleanCroppedQuestionImage(
  croppedDataUrl: string,
  subjectHint?: SubjectId
): Promise<CleanCroppedQuestionResult> {
  const geminiKey = getStoredGeminiApiKey();
  const model = getStoredGeminiModel();

  if (!geminiKey || !geminiKey.trim()) {
    return {
      success: false,
      cleanDataUrl: croppedDataUrl,
      rawOriginalDataUrl: croppedDataUrl,
      cleanupStatus: 'unchanged',
      statusMessage: 'Gemini API anahtarı bulunamadı.',
      cleanedMarkCount: 0,
      preservedRiskMarkCount: 0,
      overlapWarning: false,
      overlapMessage: '',
      errorMessage: 'Gemini API anahtarı bulunamadı.',
    };
  }

  const startTime = Date.now();

  try {
    const aiInputDataUrl = await downscaleDataUrlForAi(croppedDataUrl, 1024);
    const cleanBase64 = aiInputDataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const mimeMatch = aiInputDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    // =========================================================================
    // Precision Mask-Controlled Localized Inpainting with Vision Detection
    // =========================================================================
    const prompt = `Sen MEB 8. Sınıf LGS sınav soruları üzerinde uzmanlaşmış bir görsel analiz ve kurşun kalem temizleme asistanısın.
Sana kırpılmış bir LGS soru görseli verildi. [0, 0, 1000, 1000] koordinat sistemi tam olarak bu soru görselini temsil etmektedir (ek kırpma veya döndürme yapma).

GÖREVİN:
1. "handwritten_marks": Öğrencinin kurşun kalemle veya tükenmez kalemle soru üzerine yaptığı TÜM karalamaları, kenar boşluğundaki bölme/çarpma/çıkarma işlemlerini, el yazısı sayıları, yoğun karalamaları, şekillerin/vazoların hemen üstündeki küçük kalem izlerini/tiklerini, altını çizdiği yerleri, kelime veya şık dairelemelerini ve X işaretlerini eksiksiz tespit et.
   Her bir karalama için:
   - "box_2d": [ymin, xmin, ymax, xmax] normalize koordinatları (0-1000 ölçekte; kelime dairelerinde dairenin en üst yayından en alt yayına ve sol/sağ ucuna kadar tüm halkayı kapsa).
   - "type":
       * "safe": YALNIZCA basılı soru metniyle, matematiksel ifadelerle (K=..., L=...) ve şıklarla HİÇ çakışmayan, kenar boşluğundaki bağımsız el yazısı işlem (bölme, çarpma, çıkarma, sayı) veya boşluktaki karalama. (Bütün sorunun üzerinden geçen büyük çizgilere ASLA "safe" deme!)
       * "underline": Basılı kelimelerin veya cümlelerin altına çizilmiş tek satırlık kurşun kalem çizgisi.
       * "circle": Basılı bir kelimenin, ifadenin (örn. EBOB(K,L)) veya A, B, C, D şıklarından birinin etrafına çizilmiş daire/halka.
       * "cross_out": Soru metninin, tablonun veya şıkların üzerinden geçen büyük X, V veya çapraz karalama çizgisi.
       * "high_risk": Basılı matematik formülü veya üslü/köklü ifadenin üzeri tamamen okunamayacak kadar simsiyah kapatılmış.
   - "description": Kısa açıklama (örn: "Sağ alttaki 96/20 bölme işlemi", "Alt ortadaki yoğun karalama", "96 adet gülün etrafındaki daire", "Soru kökünün altındaki çizgi").
   DİKKAT: Matbaa basımı soru metnini, basılı matematik sembollerini, basılı renkli şekilleri (gül, vazo, tablo) ve basılı şıkları (A, B, C, D) tek başına karalama sanma. Yalnızca öğrencinin kalem izlerini listele. Karalama yoksa boş dizi [] ver.
2. "overlap_warning": Yalnızca "high_risk" varsa true, aksi halde false.
3. "overlap_message": Kullanıcıya gösterilecek kısa bilgi mesajı.
4. "detectedSubject": "turkce" | "matematik" | "fen" | "inkilap" | "din" | "ingilizce"
5. "detectedTopicName": MEB müfredatındaki konu adı
6. "detectedSubtopicName": MEB alt kazanım adı
7. "confidence": Güven puanı (0-100)

Yanıtını YALNIZCA aşağıdaki JSON formatında ver:
{
  "handwritten_marks": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "type": "safe" | "underline" | "circle" | "cross_out" | "high_risk",
      "description": "string"
    }
  ],
  "handwritten_marks_boxes": [[ymin, xmin, ymax, xmax]],
  "overlap_warning": false,
  "overlap_message": "",
  "detectedSubject": "matematik",
  "detectedTopicName": "Çarpanlar ve Katlar",
  "detectedSubtopicName": "En Büyük Ortak Bölen (EBOB) ve En Küçük Ortak Kat (EKOK)",
  "confidence": 95
}`;

    const modelsToTry = [
      model,
      ...CANDIDATE_MODELS.filter((m) => m !== model),
    ];

    let parsed: any = null;
    let lastError = '';
    let usedModel = model;

    for (const currentModel of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${geminiKey.trim()}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              thinkingConfig: { thinkingBudget: 256 },
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = `${currentModel} (${response.status}): ${errText.slice(0, 120)}`;
          console.warn(`cleanCroppedQuestionImage: ${currentModel} returned ${response.status}, trying fallback...`);
          continue;
        }

        const data = await response.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          parsed = JSON.parse(rawJsonText);
          usedModel = currentModel;
          break;
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    if (!parsed) {
      return {
        success: false,
        cleanDataUrl: croppedDataUrl,
        rawOriginalDataUrl: croppedDataUrl,
        cleanupStatus: 'manual_needed',
        statusMessage: `Yapay zekâ yanıt veremedi (${lastError})`,
        cleanedMarkCount: 0,
        preservedRiskMarkCount: 0,
        overlapWarning: false,
        overlapMessage: '',
        errorMessage: `Yapay zekâ yanıt veremedi (${lastError}). Daksil aracıyla elle temizleyebilirsiniz.`,
      };
    }

    const rawMarks: any[] =
      Array.isArray(parsed.handwritten_marks) && parsed.handwritten_marks.length > 0
        ? parsed.handwritten_marks
        : Array.isArray(parsed.handwritten_marks_boxes)
        ? parsed.handwritten_marks_boxes
        : [];

    const boxes: Array<InpaintRegionBox> = [];
    for (const m of rawMarks) {
      if (!m) continue;
      let b = m;
      let markType: MarkRegionType = 'recoverable';
      let desc = '';

      if (typeof m === 'object' && !Array.isArray(m)) {
        b = m.box_2d || [m.ymin, m.xmin, m.ymax, m.xmax];
        markType = m.type || 'recoverable';
        desc = m.description || '';
      }

      if (Array.isArray(b) && b.length === 4) {
        boxes.push({
          ymin: Math.max(0, Math.min(1000, Number(b[0]))),
          xmin: Math.max(0, Math.min(1000, Number(b[1]))),
          ymax: Math.max(0, Math.min(1000, Number(b[2]))),
          xmax: Math.max(0, Math.min(1000, Number(b[3]))),
          type: markType,
          description: desc,
        });
      }
    }

    const inpaintRes = await inpaintQuestionDataUrl(croppedDataUrl, boxes, {
      overlapWarning: Boolean(parsed.overlap_warning),
      overlapMessage: parsed.overlap_message,
    });

    console.log('[cleanCroppedQuestionImage Completed]', {
      modelUsed: usedModel,
      boxesDetected: boxes.length,
      cleanedBoxes: inpaintRes.cleanedBoxesCount,
      preservedRisk: inpaintRes.preservedHighRiskBoxesCount,
      modifiedPixels: inpaintRes.cleanedPixelCount,
      cleanupStatus: inpaintRes.cleanupStatus,
      durationMs: Date.now() - startTime,
    });

    // Resolve curriculum topic & subtopic
    let finalSubject: SubjectId = subjectHint || 'matematik';
    const subStr = (parsed.detectedSubject || '').toLowerCase();
    if (subStr.includes('mat')) finalSubject = 'matematik';
    else if (subStr.includes('turk') || subStr.includes('türk')) finalSubject = 'turkce';
    else if (subStr.includes('fen')) finalSubject = 'fen';
    else if (subStr.includes('ink') || subStr.includes('tarih')) finalSubject = 'inkilap';
    else if (subStr.includes('din')) finalSubject = 'din';
    else if (subStr.includes('ing') || subStr.includes('dil')) finalSubject = 'ingilizce';

    const subjectTopics = getTopicsBySubject(finalSubject);
    const matchedTopic = subjectTopics.find(
      (t) =>
        t.topicName.toLowerCase().includes((parsed.detectedTopicName || '').toLowerCase()) ||
        (parsed.detectedTopicName || '').toLowerCase().includes(t.topicName.toLowerCase())
    ) || subjectTopics[0];

    let finalSubtopicName = (parsed.detectedSubtopicName || '').trim();
    if (matchedTopic && matchedTopic.subtopics.length > 0) {
      const lowerCandidate = finalSubtopicName.toLocaleLowerCase('tr-TR');
      const foundSub = matchedTopic.subtopics.find((st) => {
        const lowerSt = st.toLocaleLowerCase('tr-TR');
        return lowerSt === lowerCandidate || lowerCandidate.includes(lowerSt) || lowerSt.includes(lowerCandidate);
      });
      if (foundSub) {
        finalSubtopicName = foundSub;
      } else if (!finalSubtopicName) {
        finalSubtopicName = matchedTopic.subtopics[0];
      }
    }

    return {
      success: true,
      cleanDataUrl: inpaintRes.cleanDataUrl,
      rawOriginalDataUrl: croppedDataUrl,
      cleanupStatus: inpaintRes.cleanupStatus,
      statusMessage: inpaintRes.statusMessage,
      cleanedMarkCount: inpaintRes.cleanedBoxesCount,
      preservedRiskMarkCount: inpaintRes.preservedHighRiskBoxesCount,
      overlapWarning: Boolean(parsed.overlap_warning),
      overlapMessage: parsed.overlap_message || '',
      detectedSubject: finalSubject,
      topicId: matchedTopic?.id || '',
      topicName: matchedTopic?.topicName || parsed.detectedTopicName || '',
      subtopicName: finalSubtopicName,
      detectedTopicName: matchedTopic?.topicName || parsed.detectedTopicName || '',
      detectedSubtopicName: finalSubtopicName,
      confidence: parsed.confidence || 95,
    };
  } catch (err: any) {
    return {
      success: false,
      cleanDataUrl: croppedDataUrl,
      rawOriginalDataUrl: croppedDataUrl,
      cleanupStatus: 'manual_needed',
      statusMessage: err?.message || 'Yapay zekâ işlemi sırasında hata oluştu.',
      cleanedMarkCount: 0,
      preservedRiskMarkCount: 0,
      overlapWarning: false,
      overlapMessage: '',
      errorMessage: err?.message || 'Yapay zekâ işlemi sırasında hata oluştu.',
    };
  }
}

export interface AiAutoCleanAndCropResult {
  success: boolean;
  cleanDataUrl: string;
  rawDataUrl: string;
  originalUploadedUrl?: string;
  cleanupStatus: CleanupStatus;
  statusMessage: string;
  cleanedMarkCount?: number;
  preservedRiskMarkCount?: number;
  subjectId?: SubjectId;
  topicId?: string;
  topicName?: string;
  subtopicName?: string;
  confidence?: number;
  isSvgCleaned?: boolean;
  isFaithfulCleaned?: boolean;
  overlapWarning?: boolean;
  overlapMessage?: string;
  errorMessage?: string;
}

/**
 * End-to-end Automated Question Processor (Enterprise-Grade):
 * 1. Analyzes the question photo with multimodal AI (Gemini Vision with server / client fallback).
 * 2. Establishes immutable original image states (original upload -> oriented crop -> mark mask -> clean inpaint).
 * 3. Identifies precise question bounding box [ymin, xmin, ymax, xmax] and orientation rotation.
 * 4. Identifies student handwriting marks into 3 categories:
 *    - 'safe': separated in margins/whitespace -> cleaned automatically.
 *    - 'recoverable': circles around choices, underlines, diagonal marks -> pencil is removed, printed text is protected!
 *    - 'high_risk': heavily obscured printed math -> preserved locally to protect mathematical accuracy.
 * 5. Synthesizes surrounding paper texture to inpaint marked regions, leaving 100% of unmasked pixels unchanged.
 * 6. Matches official MEB 8th grade curriculum Subject, Topic, and Subtopic.
 */
export async function processQuestionPhotoWithAi(
  photoDataUrl: string,
  subjectHint?: SubjectId
): Promise<AiAutoCleanAndCropResult> {
  const geminiKey = getStoredGeminiApiKey();
  const model = getStoredGeminiModel();

  if (!geminiKey || !geminiKey.trim()) {
    return {
      success: false,
      cleanDataUrl: photoDataUrl,
      rawDataUrl: photoDataUrl,
      originalUploadedUrl: photoDataUrl,
      cleanupStatus: 'unchanged',
      statusMessage: 'Gemini API anahtarı bulunamadı.',
      errorMessage: 'Gemini API anahtarı bulunamadı.',
    };
  }

  try {
    const aiInputDataUrl = await downscaleDataUrlForAi(photoDataUrl, 1024);
    const cleanBase64 = aiInputDataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const mimeMatch = aiInputDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const prompt = `Sen MEB 8. Sınıf LGS sınavı için uzman bir soru analiz ve görsel işleme asistanısın.
Bu soru fotoğrafını incele:
1. "question_box_2d": Hedef sorunun [ymin, xmin, ymax, xmax] koordinatları (0-1000 normalize ölçekte).
   - Soru numarası, soru üst metni, matematiksel formüller/ifadeler, şekiller/görseller, soru kökü ve A, B, C, D şıklarının TAMAMINI (soldan sağa en sağdaki son harfe ve şekle kadar, ~15 birim güvenli kenar payı bırakarak) eksiksiz kapsasın.
   - Önceki/sonraki soruları, sayfa altındaki "MATEMATİK TESTİ" ve sayfa numarası şeridini, masa, halı ve parmakları hariç tut.
2. "rotation_needed": Soruyu düz (okunabilir) yapmak için saat yönünde dönme açısı: 0 | 90 | 180 | 270. Fotoğraf zaten dik ise 0 ver.
3. "handwritten_marks": Öğrencinin kurşun kalemle veya tükenmez kalemle soru üzerine yaptığı TÜM karalamaları, kenar boşluğundaki bölme/çarpma/çıkarma işlemlerini, el yazısı sayıları, yoğun karalamaları, şekillerin/vazoların hemen üstündeki küçük kalem izlerini/tiklerini, altını çizdiği yerleri, kelime veya şık dairelemelerini ve X işaretlerini eksiksiz tespit et.
   Her bir karalama için:
   - "box_2d": [ymin, xmin, ymax, xmax] normalize koordinatları (0-1000 ölçekte; kelime dairelerinde dairenin en üst yayından en alt yayına ve sol/sağ ucuna kadar tüm halkayı kapsa).
   - "type":
       * "safe": YALNIZCA basılı soru metniyle, matematiksel ifadelerle (K=..., L=...) ve şıklarla HİÇ çakışmayan, kenar boşluğundaki bağımsız el yazısı işlem (bölme, çarpma, çıkarma, sayı) veya boşluktaki karalama. (Bütün sorunun üzerinden geçen büyük çizgilere ASLA "safe" deme!)
       * "underline": Basılı kelimelerin veya cümlelerin altına çizilmiş tek satırlık kurşun kalem çizgisi.
       * "circle": Basılı bir kelimenin, ifadenin (örn. EBOB(K,L)) veya A, B, C, D şıklarından birinin etrafına çizilmiş daire/halka.
       * "cross_out": Soru metninin, tablonun veya şıkların üzerinden geçen büyük X, V veya çapraz karalama çizgisi.
       * "high_risk": Basılı matematik formülü veya üslü/köklü ifadenin üzeri tamamen okunamayacak kadar simsiyah kapatılmış.
   - "description": Kısa açıklama (örn: "Sağ alttaki 96/20 bölme işlemi", "Alt ortadaki yoğun karalama", "96 adet gülün etrafındaki daire", "Soru kökünün altındaki çizgi").
   DİKKAT: Matbaa basımı soru metnini, basılı matematik sembollerini, basılı renkli şekilleri ve basılı şıkları (A, B, C, D) tek başına karalama sanma. Yalnızca öğrencinin kalem izlerini listele. Karalama yoksa boş dizi [] ver.
4. "question_number": Soru numarası (örn: "2." veya "3.")
5. "detectedSubject": "turkce" | "matematik" | "fen" | "inkilap" | "din" | "ingilizce"
6. "detectedTopicName": MEB müfredatındaki konu adı
7. "detectedSubtopicName": MEB alt kazanım adı
8. "confidence": Güven puanı (0-100)

Yanıtını YALNIZCA aşağıdaki JSON formatında ver:
{
  "question_box_2d": [ymin, xmin, ymax, xmax],
  "rotation_needed": 0 | 90 | 180 | 270,
  "handwritten_marks": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "type": "safe" | "underline" | "circle" | "cross_out" | "high_risk",
      "description": "string"
    }
  ],
  "handwritten_marks_boxes": [[ymin, xmin, ymax, xmax]],
  "overlap_warning": false,
  "overlap_message": "",
  "question_number": "1.",
  "detectedSubject": "matematik",
  "detectedTopicName": "Çarpanlar ve Katlar",
  "detectedSubtopicName": "En Büyük Ortak Bölen (EBOB) ve En Küçük Ortak Kat (EKOK)",
  "confidence": 95
}`;

    let parsed: any = null;
    let lastError = '';

    // Step 1: Try backend server endpoint if available
    try {
      const backendRes = await fetch('/api/ai/clean-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          imageBase64: cleanBase64,
          mimeType,
          subjectHint,
        }),
      });
      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData && backendData.success) {
          parsed = backendData;
        }
      }
    } catch {
      // Backend not running (static dev / client-only mode), fall back to direct Gemini call
    }

    // Step 2: Fallback to direct Gemini Vision API
    if (!parsed) {
      const modelsToTry = [
        model,
        ...CANDIDATE_MODELS.filter((m) => m !== model),
      ];

      for (const currentModel of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${geminiKey.trim()}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(60000),
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: cleanBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
                thinkingConfig: { thinkingBudget: 256 },
              },
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            lastError = `${currentModel} (${response.status}): ${errText.slice(0, 120)}`;
            console.warn(`Model ${currentModel} returned ${response.status}, trying fallback model...`);
            continue;
          }

          const data = await response.json();
          const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJsonText) {
            parsed = JSON.parse(rawJsonText);
            break;
          }
        } catch (err: any) {
          lastError = err?.message || String(err);
        }
      }
    }

    if (!parsed) {
      return {
        success: false,
        cleanDataUrl: photoDataUrl,
        rawDataUrl: photoDataUrl,
        originalUploadedUrl: photoDataUrl,
        cleanupStatus: 'unchanged',
        statusMessage: `Yapay zekâ yanıt veremedi (${lastError})`,
        errorMessage: `Yapay zekâ yanıt veremedi (${lastError}). İsterseniz Gemini'den kopyalayıp yeşil 'Panodan Yapıştır' butonunu kullanabilirsiniz.`,
      };
    }

    // Ensure question_box_2d encompasses any circle/underline marks on the question text with a clean margin
    const qBoxRaw: [number, number, number, number] =
      Array.isArray(parsed.question_box_2d) && parsed.question_box_2d.length === 4
        ? [
            Math.max(0, Number(parsed.question_box_2d[0]) - 10),
            Math.max(0, Number(parsed.question_box_2d[1]) - 15),
            Math.min(1000, Number(parsed.question_box_2d[2]) + 10),
            Math.min(1000, Number(parsed.question_box_2d[3]) + 20),
          ]
        : [0, 0, 1000, 1000];

    if (Array.isArray(parsed.handwritten_marks)) {
      let maxTextMarkY = 0;
      let hasLowMarginScribble = false;
      for (const hm of parsed.handwritten_marks) {
        if (hm && Array.isArray(hm.box_2d) && hm.box_2d.length === 4) {
          if (hm.type === 'underline' || hm.type === 'circle') {
            qBoxRaw[0] = Math.min(qBoxRaw[0], Math.max(0, Number(hm.box_2d[0]) - 15));
            qBoxRaw[1] = Math.min(qBoxRaw[1], Math.max(0, Number(hm.box_2d[1]) - 15));
            qBoxRaw[3] = Math.max(qBoxRaw[3], Math.min(1000, Number(hm.box_2d[3]) + 20));
            maxTextMarkY = Math.max(maxTextMarkY, Number(hm.box_2d[2]));
          } else if (hm.type === 'safe' && Number(hm.box_2d[0]) > 710 && Number(hm.box_2d[2]) > 820) {
            hasLowMarginScribble = true;
          }
        }
      }
      if (hasLowMarginScribble && maxTextMarkY > 0 && maxTextMarkY < 700 && qBoxRaw[2] > 820) {
        qBoxRaw[2] = 760;
      }
    }
    parsed.question_box_2d = qBoxRaw;

    // 1. Crop & Straighten the original camera photo to upright question (Immutable Raw Cropped Base)
    let croppedRawDataUrl = photoDataUrl;

    try {
      const faithfulResult = await cropRotateAndCleanQuestion({
        dataUrl: photoDataUrl,
        questionBox: parsed.question_box_2d,
        rotationNeeded: parsed.rotation_needed || 0,
        preserveIllustrations: true,
      });
      croppedRawDataUrl = faithfulResult.rawCroppedDataUrl;
    } catch (cropCleanErr) {
      console.warn('cropRotateAndCleanQuestion error, falling back to box crop:', cropCleanErr);
      if (Array.isArray(parsed.question_box_2d) && parsed.question_box_2d.length === 4) {
        try {
          croppedRawDataUrl = await cropImageDataUrlByBox(
            photoDataUrl,
            parsed.question_box_2d as [number, number, number, number]
          );
        } catch {
          // ignore
        }
      }
    }

    // 2. Localized Mask-Controlled Inpainting with 3-Tier Regions:
    // Only pixels inside safe and recoverable marks are inpainted with surrounding paper texture.
    // 100% of printed text, math notation, formulas, diagrams, and options outside marks are bit-for-bit preserved.
    let cleanDataUrl = croppedRawDataUrl;
    let isCleaned = false;
    let cleanupStatus: CleanupStatus = 'unchanged';
    let statusMessage = 'Fotoğrafta temizlenecek karalama bulunamadı; soru orijinal haliyle hazır.';
    let cleanedMarkCount = 0;
    let preservedRiskMarkCount = 0;

    // Prefer handwritten_marks (with 3-tier types: safe, recoverable, high_risk) if present,
    // fallback to handwritten_marks_boxes
    const rawMarks: any[] =
      Array.isArray(parsed.handwritten_marks) && parsed.handwritten_marks.length > 0
        ? parsed.handwritten_marks
        : Array.isArray(parsed.handwritten_marks_boxes)
        ? parsed.handwritten_marks_boxes
        : [];

    if (rawMarks.length > 0) {
      const transformedBoxes: Array<any> = [];
      const qBox: [number, number, number, number] =
        Array.isArray(parsed.question_box_2d) && parsed.question_box_2d.length === 4
          ? [
              Number(parsed.question_box_2d[0]),
              Number(parsed.question_box_2d[1]),
              Number(parsed.question_box_2d[2]),
              Number(parsed.question_box_2d[3]),
            ]
          : [0, 0, 1000, 1000];
      const rot = typeof parsed.rotation_needed === 'number' ? parsed.rotation_needed : 0;

      for (const m of rawMarks) {
        let b: any = m;
        let markType: MarkRegionType = 'recoverable';
        let desc = '';

        if (m && typeof m === 'object' && !Array.isArray(m)) {
          b = m.box_2d || [m.ymin, m.xmin, m.ymax, m.xmax];
          markType = m.type || 'recoverable';
          desc = m.description || '';
        }

        if (Array.isArray(b) && b.length === 4) {
          const tb = transformBoxToRotatedCrop(
            { ymin: b[0], xmin: b[1], ymax: b[2], xmax: b[3], type: markType, description: desc },
            qBox,
            rot
          );
          if (tb) transformedBoxes.push(tb);
        }
      }

      if (transformedBoxes.length > 0) {
        try {
          const inpaintRes = await inpaintQuestionDataUrl(croppedRawDataUrl, transformedBoxes, {
            overlapWarning: Boolean(parsed.overlap_warning),
            overlapMessage: parsed.overlap_message,
          });

          cleanupStatus = inpaintRes.cleanupStatus;
          statusMessage = inpaintRes.statusMessage;
          cleanedMarkCount = inpaintRes.cleanedBoxesCount;
          preservedRiskMarkCount = inpaintRes.preservedHighRiskBoxesCount;

          if (
            inpaintRes.success &&
            (inpaintRes.cleanupStatus === 'success' || inpaintRes.cleanupStatus === 'partial')
          ) {
            cleanDataUrl = inpaintRes.cleanDataUrl;
            isCleaned = inpaintRes.cleanedPixelCount > 0;
          } else {
            console.warn(
              'Inpainting quality check reason:',
              inpaintRes.qualityCheck.reason || 'Protected original'
            );
            cleanDataUrl = croppedRawDataUrl;
          }
        } catch (inpaintErr) {
          console.warn('Inpainting execution error, preserving pristine crop:', inpaintErr);
          cleanDataUrl = croppedRawDataUrl;
          cleanupStatus = 'manual_needed';
          statusMessage = 'Görüntü işlenirken bir sorun oluştu; daksil aracıyla elle temizleyebilirsiniz.';
        }
      }
    }

    // Subject resolution
    let finalSubject: SubjectId = subjectHint || 'matematik';
    const subStr = (parsed.detectedSubject || '').toLowerCase();
    if (subStr.includes('mat')) finalSubject = 'matematik';
    else if (subStr.includes('turk') || subStr.includes('türk')) finalSubject = 'turkce';
    else if (subStr.includes('fen')) finalSubject = 'fen';
    else if (subStr.includes('ink') || subStr.includes('tarih')) finalSubject = 'inkilap';
    else if (subStr.includes('din')) finalSubject = 'din';
    else if (subStr.includes('ing') || subStr.includes('dil')) finalSubject = 'ingilizce';

    // Topic & Subtopic matching
    const subjectTopics = getTopicsBySubject(finalSubject);
    const matchedTopic = subjectTopics.find(
      (t) =>
        t.topicName.toLowerCase().includes((parsed.detectedTopicName || '').toLowerCase()) ||
        (parsed.detectedTopicName || '').toLowerCase().includes(t.topicName.toLowerCase())
    ) || subjectTopics[0];

    let finalSubtopicName = (parsed.detectedSubtopicName || '').trim();
    if (matchedTopic && matchedTopic.subtopics.length > 0) {
      const lowerCandidate = finalSubtopicName.toLocaleLowerCase('tr-TR');
      const foundSub = matchedTopic.subtopics.find((st) => {
        const lowerSt = st.toLocaleLowerCase('tr-TR');
        return lowerSt === lowerCandidate || lowerCandidate.includes(lowerSt) || lowerSt.includes(lowerCandidate);
      });
      if (foundSub) {
        finalSubtopicName = foundSub;
      } else if (!finalSubtopicName) {
        finalSubtopicName = matchedTopic.subtopics[0];
      }
    }

    return {
      success: true,
      cleanDataUrl,
      rawDataUrl: croppedRawDataUrl,
      originalUploadedUrl: photoDataUrl,
      cleanupStatus,
      statusMessage,
      cleanedMarkCount,
      preservedRiskMarkCount,
      subjectId: finalSubject,
      topicId: matchedTopic?.id || '',
      topicName: matchedTopic?.topicName || parsed.detectedTopicName || '',
      subtopicName: finalSubtopicName,
      confidence: parsed.confidence || 95,
      isSvgCleaned: false,
      isFaithfulCleaned: true,
      overlapWarning: Boolean(parsed.overlap_warning),
      overlapMessage: parsed.overlap_message || '',
    };
  } catch (err: any) {
    return {
      success: false,
      cleanDataUrl: photoDataUrl,
      rawDataUrl: photoDataUrl,
      originalUploadedUrl: photoDataUrl,
      cleanupStatus: 'manual_needed',
      statusMessage: err?.message || 'Yapay zekâ işlemi sırasında hata oluştu.',
      errorMessage: err?.message || 'Yapay zekâ işlemi sırasında hata oluştu.',
    };
  }
}

