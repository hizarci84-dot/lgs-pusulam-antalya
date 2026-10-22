import { getTopicsBySubject, SUBJECT_MAP } from '../data/curriculum';
import { SubjectId } from '../types/models';

const STORAGE_KEY_API_KEY = 'lgs_gemini_api_key';
const STORAGE_KEY_MODEL = 'lgs_gemini_model';
function getIntegratedDefaultApiKey(): string {
  try {
    return atob('QVEuQWI4Uk42TFk5UHhraVkxOEY2UV9aRmdsclNlcF82cGs5aDR6ZlRFZlplaVlObmxvT2c=');
  } catch {
    return '';
  }
}

export const DEFAULT_MODEL = 'gemini-3-flash-preview';

export const CANDIDATE_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
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
      !saved.includes('1.5') &&
      !saved.includes('2.0') &&
      !saved.includes('2.5') &&
      !saved.includes('flash-latest')
    ) {
      return saved;
    }
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
          thinkingConfig: { thinkingBudget: 0 },
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
              thinkingConfig: { thinkingBudget: 0 },
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
              thinkingConfig: { thinkingBudget: 0 },
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
    return {
      success: false,
      errorMessage: 'Google Gemini API anahtarı tanımlanmamış.',
    };
  }

  try {
    const res = await processQuestionPhotoWithAi(dataUrl);
    if (res.success && res.cleanDataUrl) {
      return {
        success: true,
        cleanedDataUrl: res.cleanDataUrl,
      };
    }
    return {
      success: false,
      errorMessage: res.errorMessage || 'Yapay zekâ yanıt verdi ancak temiz görsel üretemedi.',
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

export interface AiAutoCleanAndCropResult {
  success: boolean;
  cleanDataUrl: string;
  rawDataUrl: string;
  subjectId?: SubjectId;
  topicId?: string;
  topicName?: string;
  subtopicName?: string;
  confidence?: number;
  isSvgCleaned?: boolean;
  errorMessage?: string;
}

/**
 * End-to-end Automated Question Processor:
 * 1. Analyzes the question photo with Gemini multimodal vision.
 * 2. Automatically detects question bounding box and crops away desk/couch/preceding questions.
 * 3. Reconstructs a clean vector representation (SVG) removing all pencil scribbles & calculations,
 *    preserving shaded parcels (#a0d8ef), diagrams, math notation, bold stems, and choices A, B, C, D.
 * 4. Automatically detects MEB Subject, Topic, and Subtopic.
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
      errorMessage: 'Gemini API anahtarı bulunamadı.',
    };
  }

  try {
    const cleanBase64 = photoDataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const mimeMatch = photoDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const prompt = `You are an expert document analysis and question reconstruction AI for Turkish LGS (8th grade) exam preparation.
Analyze this photograph of a test question.
1. Detect the EXACT bounding box [ymin, xmin, ymax, xmax] (normalized on 0 to 1000 scale) of the target question:
   - Top: Starts at the question diagram, question stem, or question number. Exclude any text from previous questions above it (e.g. choice options of the prior question).
   - Bottom: Ends right after the choices (A, B, C, D) and bottom publisher logo / page number. Exclude table, desk, couch, hands, or dark scanner bands below it.
   - Sides: Include the question width but exclude dark outer background.
2. Identify the subject (turkce, matematik, fen, inkilap, din, ingilizce), official MEB topicName, subtopicName.
3. Reconstruct a 100% clean, pristine SVG representation of this question:
   - Include exact question text, Turkish characters, typography, bold stems, and choices A, B, C, D.
   - Reconstruct any geometric diagrams, tables, figures, shapes, and shaded regions (e.g. in light blue #a0d8ef) with dimension labels and tick marks.
   - REMOVE all student pencil markings, handwriting calculations, margin scribbles, underlines, and circled choices.
   - Clean white background (#ffffff).

Output JSON only in this schema:
{
  "question_box_2d": [ymin, xmin, ymax, xmax],
  "detectedSubject": "turkce" | "matematik" | "fen" | "inkilap" | "din" | "ingilizce",
  "detectedTopicName": string,
  "detectedSubtopicName": string,
  "confidence": number,
  "cleanSvg": string
}`;

    const modelsToTry = [
      model,
      ...CANDIDATE_MODELS.filter((m) => m !== model),
    ];

    let parsed: any = null;
    let lastError = '';

    for (const currentModel of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${geminiKey.trim()}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
              thinkingConfig: { thinkingBudget: 0 },
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

    if (!parsed) {
      return {
        success: false,
        cleanDataUrl: photoDataUrl,
        rawDataUrl: photoDataUrl,
        errorMessage: `Yapay zekâ yanıt veremedi: ${lastError}`,
      };
    }

    const qBox = parsed.question_box_2d;

    // Crop camera photo according to AI bounding box
    let croppedRawDataUrl = photoDataUrl;
    if (Array.isArray(qBox) && qBox.length === 4) {
      try {
        croppedRawDataUrl = await cropImageDataUrlByBox(photoDataUrl, qBox as [number, number, number, number]);
      } catch (cropErr) {
        console.warn('AI Crop error:', cropErr);
      }
    }

    // Process clean SVG
    let cleanDataUrl = croppedRawDataUrl;
    let isSvgCleaned = false;
    if (parsed.cleanSvg && typeof parsed.cleanSvg === 'string' && parsed.cleanSvg.includes('<svg')) {
      let svgCode = parsed.cleanSvg.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();
      const svgStart = svgCode.indexOf('<svg');
      const svgEnd = svgCode.lastIndexOf('</svg>');
      if (svgStart !== -1 && svgEnd !== -1) {
        svgCode = svgCode.slice(svgStart, svgEnd + 6);
        try {
          const b64Svg = typeof window !== 'undefined'
            ? window.btoa(unescape(encodeURIComponent(svgCode)))
            : Buffer.from(svgCode).toString('base64');
          cleanDataUrl = `data:image/svg+xml;base64,${b64Svg}`;
          isSvgCleaned = true;
        } catch {
          cleanDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
          isSvgCleaned = true;
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
      subjectId: finalSubject,
      topicId: matchedTopic?.id || '',
      topicName: matchedTopic?.topicName || parsed.detectedTopicName || '',
      subtopicName: finalSubtopicName,
      confidence: parsed.confidence || 95,
      isSvgCleaned,
    };
  } catch (err: any) {
    return {
      success: false,
      cleanDataUrl: photoDataUrl,
      rawDataUrl: photoDataUrl,
      errorMessage: err?.message || 'Yapay zekâ işlemi sırasında hata oluştu.',
    };
  }
}

