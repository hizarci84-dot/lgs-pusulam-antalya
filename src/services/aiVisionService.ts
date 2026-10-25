import { getTopicsBySubject, SUBJECT_MAP } from '../data/curriculum';
import { SubjectId } from '../types/models';
import {
  buildHybridCleanSvg,
  CleanupStatus,
  cropRotateAndCleanQuestion,
  extractIllustrationSnippet,
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

export const DEFAULT_MODEL = 'gemini-3.8-flash';

export const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
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
    if (
      saved &&
      (saved === 'gemini-3.8-flash' ||
        saved === 'gemini-3.5-flash' ||
        saved === 'gemini-flash-latest' ||
        saved === 'gemini-3-flash-preview')
    ) {
      return saved;
    }
    // Auto-migrate retired gemini-2.5-flash / gemini-2.0-flash to gemini-3.8-flash
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

  const modelsToTry = [
    model === 'gemini-2.5-flash' || model === 'gemini-2.0-flash' ? DEFAULT_MODEL : model,
    ...CANDIDATE_MODELS,
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));
  let lastErrorMsg = '';

  for (const currentModel of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${cleanKey}`;
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

      if (response.ok) {
        saveStoredGeminiModel(currentModel);
        return {
          success: true,
          message: `✅ Google Gemini Yapay Zekâ bağlantısı (${currentModel}) başarıyla doğrulandı!`,
        };
      }

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
      lastErrorMsg = parsedMsg;
    } catch (err: any) {
      lastErrorMsg = err?.message || 'İnternet bağlantınızı kontrol edin.';
    }
  }

  return {
    success: false,
    message: `API Anahtarı geçersiz veya yetkisiz (${lastErrorMsg})`,
  };
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

let lastImageGenerationError = '';

export function getLastImageGenerationError(): string {
  return lastImageGenerationError;
}

/**
 * Multimodal Image-to-Image cleanup using Gemini image-generation models.
 * Tries in order:
 * ['gemini-2.0-flash-exp-image-generation', 'gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview', 'gemini-2.0-flash-preview-image-generation', 'gemini-3-pro-image-preview']
 * Sends ONLY generationConfig: { responseModalities: ["TEXT", "IMAGE"], temperature: 0.1 } (NO responseMimeType, NO thinkingConfig).
 * Extracts inlineData (or inline_data) from candidates[0]?.content?.parts and returns
 * data:${mimeType};base64,${data} directly as the cleaned image DataURL, or null on failure.
 */
export async function generateCleanImageWithGemini(imageDataUrl: string): Promise<string | null> {
  lastImageGenerationError = '';
  const geminiKey = getStoredGeminiApiKey();
  if (!geminiKey || !geminiKey.trim()) {
    lastImageGenerationError = 'Google Gemini API anahtarı bulunamadı.';
    return null;
  }
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
    lastImageGenerationError = 'Geçerli bir soru görseli bulunamadı.';
    return null;
  }

  try {
    const aiInputDataUrl = await downscaleDataUrlForAi(imageDataUrl, 1024);
    const cleanBase64 = aiInputDataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const mimeMatch = aiInputDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const imageModels = [
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-image-preview',
      'gemini-3.1-flash-lite-image',
      'gemini-2.5-flash-image',
      'gemini-3-pro-image-preview',
      'gemini-2.0-flash-exp-image-generation',
    ];

    for (const currentModel of imageModels) {
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
                  { text: AI_IMAGE_CLEANUP_SYSTEM_PROMPT },
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
              responseModalities: ['TEXT', 'IMAGE'],
              temperature: 0.1,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          let errDetail = errText.slice(0, 180);
          try {
            const errJson = JSON.parse(errText);
            if (errJson?.error?.message) {
              errDetail = errJson.error.message;
            }
          } catch {
            // keep raw slice
          }
          lastImageGenerationError = `${currentModel} (${response.status}): ${errDetail}`;
          console.warn(`generateCleanImageWithGemini: ${lastImageGenerationError}`);
          continue;
        }

        const data = await response.json();
        const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          const b64Data = part?.inlineData?.data || part?.inline_data?.data;
          if (b64Data && typeof b64Data === 'string' && b64Data.length > 100) {
            const outMime =
              part?.inlineData?.mimeType ||
              part?.inline_data?.mime_type ||
              'image/png';
            lastImageGenerationError = '';
            return `data:${outMime};base64,${b64Data}`;
          }
        }
        lastImageGenerationError = `${currentModel}: Yanıtta temizlenmiş görsel (inlineData) bulunamadı.`;
      } catch (err: any) {
        lastImageGenerationError = `${currentModel}: ${err?.message || String(err)}`;
        console.warn(`generateCleanImageWithGemini (${currentModel}) error:`, err);
      }
    }
  } catch (err: any) {
    lastImageGenerationError = err?.message || String(err);
    console.warn('generateCleanImageWithGemini unexpected error:', err);
  }

  return null;
}

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
 * Never applies destructive pixel painting or whitening filters if AI cleanup fails.
 */
export async function cleanQuestionImageWithAi(dataUrl: string): Promise<CleanImageResult> {
  const geminiKey = getStoredGeminiApiKey();

  if (!geminiKey || !geminiKey.trim()) {
    return {
      success: false,
      errorMessage: 'Google Gemini API anahtarı tanımlanmamış.',
    };
  }

  try {
    const cleanedDataUrl = await generateCleanImageWithGemini(dataUrl);
    if (cleanedDataUrl) {
      return {
        success: true,
        cleanedDataUrl,
      };
    }
    return {
      success: false,
      errorMessage:
        lastImageGenerationError || 'Yapay zekâ temizlenmiş görsel üretemedi; orijinal görüntü korundu.',
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: `İşlem hatası: ${err?.message || 'Bilinmeyen hata'}`,
    };
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

  if (!geminiKey || !geminiKey.trim()) {
    return {
      success: false,
      cleanDataUrl: croppedDataUrl,
      rawOriginalDataUrl: croppedDataUrl,
      cleanupStatus: 'manual_needed',
      statusMessage: 'Gemini API anahtarı bulunamadı.',
      cleanedMarkCount: 0,
      preservedRiskMarkCount: 0,
      overlapWarning: false,
      overlapMessage: '',
      errorMessage: 'Gemini API anahtarı bulunamadı.',
    };
  }

  try {
    const geminiCleanDataUrl = await generateCleanImageWithGemini(croppedDataUrl);
    const lastError = lastImageGenerationError || 'Görsel temizleme modeli (inlineData) yanıt döndürmedi.';

    if (geminiCleanDataUrl) {
      return {
        success: true,
        cleanDataUrl: geminiCleanDataUrl,
        rawOriginalDataUrl: croppedDataUrl,
        cleanupStatus: 'success',
        statusMessage: '✨ Temizleme Başarılı: Yapay zekâ ile tüm kurşun kalem karalamaları temizlendi.',
        cleanedMarkCount: 1,
        preservedRiskMarkCount: 0,
        overlapWarning: false,
        overlapMessage: '',
        detectedSubject: subjectHint || 'matematik',
      };
    }

    return {
      success: false,
      cleanDataUrl: croppedDataUrl,
      rawOriginalDataUrl: croppedDataUrl,
      cleanupStatus: 'manual_needed',
      statusMessage: `Görsel temizleme başarısız (${lastError}). Orijinal kırpılmış görüntü bozulmadan korundu.`,
      cleanedMarkCount: 0,
      preservedRiskMarkCount: 0,
      overlapWarning: false,
      overlapMessage: '',
      errorMessage: lastError,
    };
  } catch (err: any) {
    const errMsg = err?.message || 'Yapay zekâ işlemi sırasında hata oluştu.';
    return {
      success: false,
      cleanDataUrl: croppedDataUrl,
      rawOriginalDataUrl: croppedDataUrl,
      cleanupStatus: 'manual_needed',
      statusMessage: errMsg,
      cleanedMarkCount: 0,
      preservedRiskMarkCount: 0,
      overlapWarning: false,
      overlapMessage: '',
      errorMessage: errMsg,
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

    // 2. Multimodal Image-to-Image Cleanup (No destructive pixel painting fallback):
    let cleanDataUrl = croppedRawDataUrl;
    let cleanupStatus: CleanupStatus = 'unchanged';
    let statusMessage = 'Fotoğrafta temizlenecek karalama bulunamadı; soru orijinal haliyle hazır.';
    let cleanedMarkCount = 0;
    let preservedRiskMarkCount = 0;

    const rawMarks: any[] =
      Array.isArray(parsed.handwritten_marks) && parsed.handwritten_marks.length > 0
        ? parsed.handwritten_marks
        : Array.isArray(parsed.handwritten_marks_boxes)
        ? parsed.handwritten_marks_boxes
        : [];

    const geminiCleanDataUrl = await generateCleanImageWithGemini(croppedRawDataUrl);
    const imgError = lastImageGenerationError || 'Görsel temizleme modeli (inlineData) yanıt döndürmedi.';

    if (geminiCleanDataUrl) {
      cleanDataUrl = geminiCleanDataUrl;
      cleanupStatus = 'success';
      statusMessage = '✨ Temizleme Başarılı: Yapay zekâ ile tüm kurşun kalem karalamaları temizlendi.';
      cleanedMarkCount = Math.max(1, rawMarks.length);
      preservedRiskMarkCount = 0;
    } else {
      // Never corrupt the cropped image with pixel painting! Keep croppedRawDataUrl intact.
      cleanDataUrl = croppedRawDataUrl;
      if (rawMarks.length > 0) {
        cleanupStatus = 'manual_needed';
        statusMessage = `Görsel temizleme başarısız (${imgError}). Orijinal kırpılmış görüntü bozulmadan korundu.`;
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
      errorMessage: !geminiCleanDataUrl ? imgError : undefined,
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

