import { getTopicsBySubject, SUBJECT_MAP } from '../data/curriculum';
import { SubjectId } from '../types/models';

const STORAGE_KEY_API_KEY = 'lgs_gemini_api_key';
const STORAGE_KEY_MODEL = 'lgs_gemini_model';
function getIntegratedDefaultApiKey(): string {
  try {
    return atob('QVEuQWI4Uk42SnQwSWNpUzJjRE5fNGlLdkxNNUtjdzZoemptTHdGTE5WUWdocnRjUVZ4LVE=');
  } catch {
    return '';
  }
}

export const DEFAULT_MODEL = 'gemini-flash-latest';

export function getStoredGeminiApiKey(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_API_KEY);
    if (saved !== null && saved !== undefined && saved.trim().length > 0) {
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
    if (saved && !saved.includes('1.5') && !saved.includes('2.0') && !saved.includes('2.5')) {
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        errorMessage: `Gemini API hatası (${response.status}): ${errText.slice(0, 200)}`,
      };
    }

    const data = await response.json();
    const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJsonText) {
      return {
        success: false,
        errorMessage: 'Yapay zekâdan geçerli bir yanıt alınamadı.',
      };
    }

    const parsed = JSON.parse(rawJsonText);
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        errorMessage: `Gemini API hatası (${response.status}): ${errText.slice(0, 200)}`,
      };
    }

    const data = await response.json();
    const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJsonText) {
      return {
        success: false,
        errorMessage: 'Yapay zekâdan geçerli bir yanıt alınamadı.',
      };
    }

    const parsed = JSON.parse(rawJsonText);
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

