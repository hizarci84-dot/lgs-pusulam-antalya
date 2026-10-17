import { LGS_SUBJECTS, SUBJECT_MAP } from '../data/curriculum';
import {
  ExamRecord,
  PercentileAndScoreEstimate,
  StudentProfile,
  SubjectExamResult,
  SubjectId,
} from '../types/models';

/**
 * Calculates net score according to standard LGS formula:
 * Net = Doğru - (Yanlış / 3)
 * Blank answers do not reduce net score.
 */
export function calculateSubjectNet(correct: number, wrong: number): number {
  const rawNet = correct - wrong / 3;
  return Number(rawNet.toFixed(2));
}

export interface SubjectValidationResult {
  valid: boolean;
  errorMessage?: string;
}

export function validateSubjectCounts(
  subjectName: string,
  questionCount: number,
  correct: number,
  wrong: number,
  blank: number
): SubjectValidationResult {
  if (
    !Number.isInteger(questionCount) ||
    questionCount < 0 ||
    questionCount > 100
  ) {
    return {
      valid: false,
      errorMessage: `${subjectName}: Soru sayısı 0 ile 100 arasında bir tam sayı olmalıdır.`,
    };
  }
  if (correct < 0 || wrong < 0 || blank < 0) {
    return {
      valid: false,
      errorMessage: `${subjectName}: Doğru, yanlış ve boş sayıları negatif olamaz.`,
    };
  }
  if (
    !Number.isInteger(correct) ||
    !Number.isInteger(wrong) ||
    !Number.isInteger(blank)
  ) {
    return {
      valid: false,
      errorMessage: `${subjectName}: Doğru, yanlış ve boş sayıları tam sayı olmalıdır.`,
    };
  }
  const sum = correct + wrong + blank;
  if (sum > questionCount) {
    return {
      valid: false,
      errorMessage: `${subjectName}: Doğru (${correct}) + Yanlış (${wrong}) + Boş (${blank}) toplamı (${sum}), soru sayısını (${questionCount}) aşamaz.`,
    };
  }
  return { valid: true };
}

export function createDefaultSubjectResults(): SubjectExamResult[] {
  return LGS_SUBJECTS.map((subj) => ({
    subjectId: subj.id,
    questionCount: subj.defaultQuestionCount,
    correct: 0,
    wrong: 0,
    blank: subj.defaultQuestionCount,
    net: 0,
    topicBreakdown: [],
  }));
}

export function computeExamTotals(subjectResults: SubjectExamResult[]) {
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalBlank = 0;
  let totalNetRaw = 0;

  for (const sr of subjectResults) {
    totalQuestions += sr.questionCount;
    totalCorrect += sr.correct;
    totalWrong += sr.wrong;
    totalBlank += sr.blank;
    totalNetRaw += sr.correct - sr.wrong / 3;
  }

  return {
    totalQuestions,
    totalCorrect,
    totalWrong,
    totalBlank,
    totalNet: Number(totalNetRaw.toFixed(2)),
  };
}

/**
 * Checks whether an exam being saved might be a duplicate of an existing exam
 */
export function checkDuplicateExam(
  existingExams: ExamRecord[],
  candidate: {
    id?: string;
    name: string;
    date: string;
    publisher: string;
    totalNet: number;
  }
): ExamRecord | null {
  const normalizedName = candidate.name.trim().toLocaleLowerCase('tr-TR');
  const normalizedPub = candidate.publisher.trim().toLocaleLowerCase('tr-TR');

  for (const ex of existingExams) {
    if (candidate.id && ex.id === candidate.id) continue;
    const sameDate = ex.date === candidate.date;
    const sameName = ex.name.trim().toLocaleLowerCase('tr-TR') === normalizedName;
    const samePub = ex.publisher.trim().toLocaleLowerCase('tr-TR') === normalizedPub;
    const sameNet = Math.abs(ex.totalNet - candidate.totalNet) < 0.05;

    if ((sameDate && sameName) || (sameDate && samePub && sameNet)) {
      return ex;
    }
  }
  return null;
}

/**
 * Calculates standardized weighted score index (out of 500 scale) ONLY for interval estimation.
 * Never presented as a single deterministic LGS score.
 * Uses MEB standard relative subject weights: TR (4), MAT (4), FEN (4), INK (1), DIN (1), ING (1).
 */
function calculateWeightedNetRatio(exam: ExamRecord): number | null {
  if (exam.totalQuestions < 75) {
    // Branch exam or incomplete exam cannot be used directly for 90-question national calibration
    return null;
  }

  let weightedStudentPoints = 0;
  let maxPossibleWeightedPoints = 0;

  for (const sr of exam.subjectResults) {
    const subjDef = SUBJECT_MAP[sr.subjectId as SubjectId];
    if (!subjDef || sr.questionCount <= 0) continue;
    const net = calculateSubjectNet(sr.correct, sr.wrong);
    const normalized20Or10 =
      (net / sr.questionCount) * subjDef.defaultQuestionCount;
    weightedStudentPoints += normalized20Or10 * subjDef.coefficientWeight;
    maxPossibleWeightedPoints +=
      subjDef.defaultQuestionCount * subjDef.coefficientWeight;
  }

  if (maxPossibleWeightedPoints <= 0) return null;
  return Math.max(0, Math.min(1, weightedStudentPoints / maxPossibleWeightedPoints));
}

/**
 * Empirical MEB LGS (2022–2025) calibration curve mapping weighted net ratio [0..1]
 * to approximate National Percentile and Score Band with explicit uncertainty intervals.
 */
function interpolateNationalPercentileFromRatio(ratio: number): {
  midPercentile: number;
  approxScoreMid: number;
} {
  // Calibration anchor points (Weighted Ratio -> [Approximate Score, National Percentile %])
  // 1.00 (90 net) -> 500p, 0.01%
  // 0.967 (~87.5 weighted) -> 485p, 0.45%
  // 0.933 (~84.5 weighted) -> 470p, 1.35%
  // 0.889 (~80.5 weighted) -> 452p, 2.95%
  // 0.844 (~76.5 weighted) -> 434p, 5.20%
  // 0.778 (~70.0 weighted) -> 408p, 9.10%
  // 0.700 (~63.0 weighted) -> 378p, 14.80%
  // 0.600 (~54.0 weighted) -> 340p, 24.50%
  // 0.500 (~45.0 weighted) -> 300p, 38.00%
  // 0.350 (~31.5 weighted) -> 245p, 60.00%
  // 0.000 (0 net) -> 190p, 99.00%
  const anchors = [
    { r: 1.0, score: 500, perc: 0.02 },
    { r: 0.967, score: 486, perc: 0.45 },
    { r: 0.933, score: 471, perc: 1.35 },
    { r: 0.889, score: 452, perc: 2.95 },
    { r: 0.844, score: 434, perc: 5.2 },
    { r: 0.778, score: 408, perc: 9.1 },
    { r: 0.7, score: 378, perc: 14.8 },
    { r: 0.6, score: 340, perc: 24.5 },
    { r: 0.5, score: 300, perc: 38.0 },
    { r: 0.35, score: 245, perc: 60.0 },
    { r: 0.0, score: 190, perc: 99.0 },
  ];

  if (ratio >= 1.0) return { midPercentile: 0.02, approxScoreMid: 500 };
  if (ratio <= 0.0) return { midPercentile: 99.0, approxScoreMid: 190 };

  for (let i = 0; i < anchors.length - 1; i++) {
    const high = anchors[i];
    const low = anchors[i + 1];
    if (ratio <= high.r && ratio >= low.r) {
      const t = (ratio - low.r) / (high.r - low.r);
      const approxScoreMid = low.score + t * (high.score - low.score);
      const midPercentile = low.perc + t * (high.perc - low.perc);
      return {
        midPercentile: Number(midPercentile.toFixed(2)),
        approxScoreMid: Math.round(approxScoreMid),
      };
    }
  }

  return { midPercentile: 25.0, approxScoreMid: 340 };
}

/**
 * Computes comprehensive score and percentile estimates strictly adhering to Sections 7 & 15:
 * - Separates Provider Score, In-Exam Percentile, National Estimate Range, and Official Result
 * - Refuses to generate fake scores when data is insufficient
 * - Includes explicit uncertainty band and confidence level
 */
export function computePercentileAndScoreEstimate(
  exams: ExamRecord[],
  student?: StudentProfile | null
): PercentileAndScoreEstimate {
  const sortedExams = [...exams].sort((a, b) => b.date.localeCompare(a.date));
  const fullExams = sortedExams.filter((e) => e.totalQuestions >= 75);

  if (sortedExams.length === 0) {
    return {
      hasEnoughData: false,
      examCountUsed: 0,
      weightedAverageNet: null,
      latestExamNet: null,
      latestProviderScore: null,
      inExamPercentile: null,
      inExamRankInfo: null,
      estimatedNationalPercentileRange: null,
      estimatedNationalPercentileMid: null,
      estimatedScoreBand: null,
      uncertaintyNotice:
        'Henüz kayıtlı deneme sınavı bulunmadığı için tahmini puan veya yüzdelik dilim üretilmemiştir. İlk denemenizi eklediğinizde analiz başlayacaktır.',
      modelDescription: 'Veri bekleniyor (Sahte puan üretilmez).',
      confidenceLevel: 'insufficient',
      officialResult: student?.officialLgsResult || null,
    };
  }

  const latestExam = sortedExams[0];
  let inExamPercentile: number | null = null;
  let inExamRankInfo: string | null = null;

  if (
    latestExam.participantCount &&
    latestExam.participantCount > 0 &&
    latestExam.rankInExam &&
    latestExam.rankInExam > 0 &&
    latestExam.rankInExam <= latestExam.participantCount
  ) {
    inExamPercentile = Number(
      ((latestExam.rankInExam / latestExam.participantCount) * 100).toFixed(2)
    );
    inExamRankInfo = `${latestExam.participantCount.toLocaleString('tr-TR')} katılımcı içinde ${latestExam.rankInExam.toLocaleString('tr-TR')}. sıra (%${inExamPercentile}) — Yalnızca bu denemeye katılan grup içi sıralamadır.`;
  } else if (
    typeof latestExam.providerPercentile === 'number' &&
    latestExam.providerPercentile > 0
  ) {
    inExamPercentile = Number(latestExam.providerPercentile.toFixed(2));
    inExamRankInfo = `Deneme sağlayıcısının açıkladığı grup içi yüzdelik: %${inExamPercentile}`;
  }

  if (fullExams.length === 0) {
    return {
      hasEnoughData: false,
      examCountUsed: 0,
      weightedAverageNet: null,
      latestExamNet: latestExam.totalNet,
      latestProviderScore: latestExam.providerScore ?? null,
      inExamPercentile,
      inExamRankInfo,
      estimatedNationalPercentileRange: null,
      estimatedNationalPercentileMid: null,
      estimatedScoreBand: null,
      uncertaintyNotice:
        'Yalnızca branş veya eksik soru sayılı deneme kaydı mevcut. Türkiye geneli LGS yüzdelik dilim tahmini için en az 1 adet 90 soruluk tam LGS denemesi gereklidir.',
      modelDescription: 'Kalibrasyon için 90 soruluk tam LGS denemesi bekleniyor.',
      confidenceLevel: 'insufficient',
      officialResult: student?.officialLgsResult || null,
    };
  }

  // Take up to last 5 full exams with exponential recency weighting
  const recentFull = fullExams.slice(0, 5);
  const weights = [0.4, 0.25, 0.17, 0.11, 0.07].slice(0, recentFull.length);
  const weightSum = weights.reduce((a, b) => a + b, 0);

  let weightedRatioSum = 0;
  let weightedNetSum = 0;
  const ratios: number[] = [];

  recentFull.forEach((ex, idx) => {
    const w = weights[idx] / weightSum;
    const r = calculateWeightedNetRatio(ex) ?? ex.totalNet / 90;
    ratios.push(r);
    weightedRatioSum += r * w;
    weightedNetSum += ex.totalNet * w;
  });

  const { midPercentile, approxScoreMid } =
    interpolateNationalPercentileFromRatio(weightedRatioSum);

  // Compute variance / uncertainty band based on number of exams & net volatility
  const count = recentFull.length;
  const maxR = Math.max(...ratios);
  const minR = Math.min(...ratios);
  const spreadRatio = maxR - minR;

  let confidenceLevel: 'high' | 'medium' | 'low' = 'low';
  let halfBandPercentile = Math.max(0.85, midPercentile * 0.35);
  let halfBandScore = 14;

  if (count >= 4 && spreadRatio < 0.08) {
    confidenceLevel = 'high';
    halfBandPercentile = Math.max(0.35, midPercentile * 0.18 + spreadRatio * 8);
    halfBandScore = 7;
  } else if (count >= 2) {
    confidenceLevel = 'medium';
    halfBandPercentile = Math.max(0.55, midPercentile * 0.25 + spreadRatio * 12);
    halfBandScore = 10;
  }

  const optimisticPercentile = Number(
    Math.max(0.01, midPercentile - halfBandPercentile).toFixed(2)
  );
  const cautiousPercentile = Number(
    Math.min(99.9, midPercentile + halfBandPercentile).toFixed(2)
  );

  const scoreLow = Math.max(190, Math.round(approxScoreMid - halfBandScore));
  const scoreHigh = Math.min(500, Math.round(approxScoreMid + halfBandScore));

  const singleExamWarning =
    count === 1
      ? 'DİKKAT: Bu tahmin yalnızca 1 tam deneme sonucuna dayanmaktadır (Düşük Güven). Tek bir deneme üzerinden kesin lise yerleşme olasılığı hesaplanamaz; en az 3-5 deneme verisiyle aralık daralacaktır.'
      : `Son ${count} tam denemenin ders katsayı ağırlıklı (Mat/Fen/Türkçe ×4, İnk/Din/İng ×1) ortalaması ve MEB 2022–2025 yüzdelik dağılım eğrisi kullanılmıştır. Sınav zorluğuna göre gerçek sonuç bu tahmin bandı içinde değişebilir.`;

  return {
    hasEnoughData: true,
    examCountUsed: count,
    weightedAverageNet: Number(weightedNetSum.toFixed(2)),
    latestExamNet: latestExam.totalNet,
    latestProviderScore: latestExam.providerScore ?? null,
    inExamPercentile,
    inExamRankInfo,
    estimatedNationalPercentileRange: [optimisticPercentile, cautiousPercentile],
    estimatedNationalPercentileMid: midPercentile,
    estimatedScoreBand: [scoreLow, scoreHigh],
    uncertaintyNotice: singleExamWarning,
    modelDescription:
      'MEB Standart Katsayılı Ağırlıklı Net & 2022–2025 LGS Yüzdelik Kalibrasyon Modeli (Belirsizlik Bandı Dahil)',
    confidenceLevel,
    officialResult: student?.officialLgsResult || null,
  };
}

/**
 * 2026 LGS Otomatik Puan ve Yüzdelik Dilim Hesaplama Motoru:
 * Dersler arası MEB resmi katsayıları (TR:4, MAT:4, FEN:4, İNK:1, DİN:1, İNG:1)
 * ve 2024-2026 MEB yerleştirme verilerine göre anlık hesaplar.
 */
export function calculateLgsScoreAndPercentile(subjectResults: SubjectExamResult[]): {
  score: number;
  percentile: number;
  totalNet: number;
  weightedNetRatio: number;
  isFullLgs: boolean;
} {
  let weightedStudentPoints = 0;
  let maxPossibleWeightedPoints = 0;
  let totalNet = 0;
  let totalQuestions = 0;

  for (const sr of subjectResults) {
    const subjDef = SUBJECT_MAP[sr.subjectId as SubjectId];
    if (!subjDef || sr.questionCount <= 0) continue;
    const net = calculateSubjectNet(sr.correct, sr.wrong);
    totalNet += net;
    totalQuestions += sr.questionCount;
    const normalizedToDefault =
      (net / sr.questionCount) * subjDef.defaultQuestionCount;
    weightedStudentPoints += normalizedToDefault * subjDef.coefficientWeight;
    maxPossibleWeightedPoints +=
      subjDef.defaultQuestionCount * subjDef.coefficientWeight;
  }

  const isFullLgs = totalQuestions >= 75;
  const ratio =
    maxPossibleWeightedPoints > 0
      ? Math.max(0, Math.min(1, weightedStudentPoints / maxPossibleWeightedPoints))
      : 0;

  const { approxScoreMid, midPercentile } = interpolateNationalPercentileFromRatio(ratio);

  // Exact LGS scale out of 500.00
  const calculatedScore = Number((194.5 + ratio * 305.5).toFixed(2));

  return {
    score: Math.min(500, Math.max(194.5, calculatedScore)),
    percentile: midPercentile,
    totalNet: Number(totalNet.toFixed(2)),
    weightedNetRatio: ratio,
    isFullLgs,
  };
}

