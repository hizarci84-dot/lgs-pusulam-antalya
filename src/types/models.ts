export type SubjectId =
  | 'turkce'
  | 'matematik'
  | 'fen'
  | 'inkilap'
  | 'din'
  | 'ingilizce';

export interface SubjectDefinition {
  id: SubjectId;
  name: string;
  shortName: string;
  defaultQuestionCount: number;
  coefficientWeight: number; // Standard LGS relative weight (4 for TR/MAT/FEN, 1 for INK/DIN/ING)
  category: 'sozel' | 'sayisal';
  color: string;
}

export type ErrorReasonCode =
  | 'konu_eksigi'
  | 'islem_hatasi'
  | 'yanlis_okuma'
  | 'dikkat_hatasi'
  | 'sure_yetmedi'
  | 'cozum_yontemi_bulamama'
  | 'bilgiyi_unutma'
  | 'diger';

export interface ErrorReasonDefinition {
  code: ErrorReasonCode;
  label: string;
  description: string;
  recommendedAction: string;
}

export interface CurriculumTopic {
  id: string;
  curriculumVersion: string; // e.g., "MEB-2024-2026-v1"
  subjectId: SubjectId;
  gradeLevel: number;
  unitNumber: number;
  unitName: string;
  topicName: string;
  subtopics: string[];
  keywords: string[];
  importanceWeight: number; // 1.0 - 1.5 based on typical LGS question frequency
}

export type SchoolType =
  | 'Fen Lisesi'
  | 'Anadolu Lisesi'
  | 'Sosyal Bilimler Lisesi'
  | 'Anadolu İmam Hatip Lisesi'
  | 'Mesleki ve Teknik Anadolu Lisesi';

export interface StudentProfile {
  id: string;
  nickname: string; // Optional student name or nickname
  gradeLevel: '8. Sınıf' | '7. Sınıf' | 'Mezun / Hazırlık';
  antalyaDistrict: string;
  targetSchoolIds: string[];
  targetSchoolTypes: SchoolType[];
  targetPercentile: number; // e.g. 2.5 (%)
  weeklyStudyHours: number; // e.g. 14 hours/week
  dailyStudyMinutes: number; // e.g. 120 mins/day
  boardingPreference: 'farketmez' | 'yatili_istiyorum' | 'gunduzlu';
  foreignLanguagePreferences: string[];
  preferredDistricts: string[];
  reviewIntervalsDays: [number, number, number, number]; // default [0, 1, 3, 7]
  officialLgsResult?: {
    year: number;
    officialScore: number;
    officialGeneralPercentile: number;
    officialProvincialPercentile?: number;
    recordedAt: string;
  } | null;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectTopicResultEntry {
  topicId: string;
  correct: number;
  wrong: number;
  blank: number;
}

export interface SubjectExamResult {
  subjectId: SubjectId;
  questionCount: number;
  correct: number;
  wrong: number;
  blank: number;
  net: number; // correct - (wrong / 3)
  topicBreakdown?: SubjectTopicResultEntry[];
}

export type ExamType =
  | 'Genel Deneme (LGS Tam)'
  | 'Kurumsal Türkiye Geneli'
  | 'Sayısal Bölüm Denemesi'
  | 'Sözel Bölüm Denemesi'
  | 'Branş Denemesi'
  | 'MEB Örnek / Çıkmış Sınav';

export interface ExamRecord {
  id: string;
  studentId: string;
  name: string;
  date: string; // YYYY-MM-DD
  publisher: string;
  examType: ExamType;
  participantCount?: number | null;
  rankInExam?: number | null;
  providerScore?: number | null;
  providerPercentile?: number | null;
  subjectResults: SubjectExamResult[];
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  totalBlank: number;
  totalNet: number;
  notes: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CropRect {
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  width: number; // percentage 1..100
  height: number; // percentage 1..100
}

export interface QuestionPhotoAsset {
  id: string;
  studentId: string;
  examId: string;
  questionId: string;
  originalDataUrl: string;
  croppedDataUrl?: string | null;
  cropRect?: CropRect | null;
  rotation: number; // 0, 90, 180, 270
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
}

export type ReviewOutcome =
  | 'solved_independently' // Yardımsız doğru çözdüm
  | 'solved_with_hint' // İpucuyla çözdüm
  | 'understood_after_solution' // Çözümü gördükten sonra anladım
  | 'still_cannot_solve'; // Hâlâ çözemiyorum

export interface QuestionAttemptLog {
  id: string;
  questionId: string;
  studentId: string;
  attemptedAt: string;
  outcome: ReviewOutcome;
  note?: string;
  previousStage: number;
  newStage: number;
  nextScheduledDate: string;
}

export type LearningStatus =
  | 'unsolved' // Henüz çözülmedi / sadece fotoğraf yüklendi
  | 'needs_topic_study' // Hâlâ çözemiyor - konu çalışma listesinde
  | 'understood_with_help' // İpucuyla veya çözümü görerek anladı (bağımsız çözümle aynı sayılmaz!)
  | 'mastered_independent'; // Yardımsız doğru çözdü

export interface AIQuestionAnalysisData {
  isReadable: boolean;
  unreadableReason?: string;
  extractedText: string;
  visualDescription: string;
  suggestedTopicId: string | null;
  suggestedTopicName: string;
  suggestedSubtopicName: string;
  confidence: number;
  candidateTopics: Array<{
    topicId: string;
    topicName: string;
    subtopicName?: string;
    confidence: number;
  }>;
  correctAnswer: string;
  solutionSteps: string[];
  commonMistakes: string[];
  similarPracticeQuestion: {
    questionText: string;
    options: string[];
    correctOption: string;
    shortSolution: string;
  };
  providerName: string;
  modelUsed?: string;
  analyzedAt: string;
}

export interface QuestionRecord {
  id: string;
  studentId: string;
  examId: string;
  subjectId: SubjectId;
  questionNumber?: number | null;
  status: 'wrong' | 'blank';
  photoIds: string[];
  // Topic determination priority:
  // 1. userTopicId (selected/verified by student or parent)
  // 2. aiSuggestedTopicId (proposed by vision model)
  // 3. inferredTopicId (classified from text/keywords)
  // 4. fallback: "Konu belirlenmedi"
  userTopicId: string | null;
  aiSuggestedTopicId: string | null;
  inferredTopicId: string | null;
  subtopicName: string;
  topicVerifiedByUser: boolean;
  studentAnswer: 'A' | 'B' | 'C' | 'D' | '';
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'Belirlenemedi' | '';
  errorReason: ErrorReasonCode | null;
  studentNote: string;
  solutionExplanation: string;
  learningStatus: LearningStatus;
  isAnalyzed: boolean;
  reviewStage: number; // 0 = initial, 1 = +1d, 2 = +3d, 3 = +7d, 4 = completed
  lastReviewedAt: string | null;
  nextReviewDate: string; // YYYY-MM-DD
  attemptHistory: QuestionAttemptLog[];
  aiAnalysis?: AIQuestionAnalysisData | null;
  exactDuplicateOfQuestionId?: string | null; // Only if exact same question repeated across exams
  textFingerprint?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewTask {
  questionId: string;
  studentId: string;
  examId: string;
  examName: string;
  subjectId: SubjectId;
  topicId: string | null;
  topicName: string;
  status: 'wrong' | 'blank';
  learningStatus: LearningStatus;
  reviewStage: number;
  scheduledDate: string;
  daysOverdue: number;
  isDueTodayOrOverdue: boolean;
}

export interface TopicPatternMetrics {
  topicId: string;
  subjectId: SubjectId;
  unitName: string;
  topicName: string;
  totalWrongCount: number;
  totalBlankCount: number;
  totalCorrectCount: number;
  totalAnsweredCount: number;
  examsWithErrorsCount: number;
  recent3ExamsErrorCount: number;
  unsolvedQuestionsCount: number;
  independentMasteredCount: number;
  helpedOnlyCount: number;
  failedAfterReviewCount: number; // Tekrar çalışması yapıldığı hâlde başarı artmayan
  dominantErrorReasons: Array<{ reason: ErrorReasonCode; count: number }>;
  firstSeenDate: string | null;
  lastSeenDate: string | null;
  trendStatus:
    | 'recurring_critical' // Birden fazla denemede tekrar eden ciddi konu eksiği
    | 'persisting_despite_review' // Tekrar yapıldığı halde hata devam eden
    | 'emerging_issue' // Son denemelerde yeni ortaya çıkan
    | 'improving' // Önceki yanlışları düzelen
    | 'single_occurrence' // Tek seferlik hata (ciddi eksiklik etiketi konulmaz!)
    | 'insufficient_data'; // Veri yetersiz
  priorityScore: number; // 0..100
  confidenceLevel: 'high' | 'medium' | 'low';
  explanationText: string; // Gerçek kayıtlar üzerinden üretilen açıklama
}

export interface StudyPlanTask {
  id: string;
  studentId: string;
  weekStartDate: string; // YYYY-MM-DD (Pazartesi)
  dayOfWeek: number; // 1 = Pazartesi .. 7 = Pazar
  dayName: string;
  subjectId: SubjectId;
  topicId: string | null;
  topicName: string;
  priorityTier: 1 | 2 | 3 | 4 | 5;
  priorityReason: string; // Neden bu konunun seçildiği (gerçek veriye dayalı)
  durationMinutes: number;
  targetQuestionCount: number;
  reviewQuestionIds: string[]; // Tekrar edilecek soru kimlikleri
  completed: boolean;
  completedAt?: string | null;
}

export interface WeeklyStudyPlan {
  id: string;
  studentId: string;
  weekStartDate: string;
  generatedAt: string;
  totalPlannedMinutes: number;
  totalCompletedMinutes: number;
  tasks: StudyPlanTask[];
  weeklySummaryReport: string;
}

export interface SchoolYearlyPlacement {
  year: number; // 2022, 2023, 2024, 2025, 2026
  placementPeriod: '1. Yerleştirme (Merkezî Sınav)' | 'Yerleştirmeye Esas Nakil';
  quota: number;
  minScore: number | null; // Taban puanı (null ise henüz açıklanmadı/doğrulanmadı)
  maxPercentile: number | null; // Türkiye geneli taban yüzdelik dilim
  provincialPercentile?: number | null; // İl yüzdelik dilimi (varsa)
  isVerified: boolean;
  sourceName: string;
  sourceUrl: string;
  notes?: string;
}

export interface AntalyaSchoolProgram {
  id: string;
  schoolCode?: string;
  schoolName: string;
  programName: string; // Fen Lisesi Programı, Hazırlıklı İngilizce, Almanca, vb.
  district: string; // Muratpaşa, Konyaaltı, Kepez, Alanya, Manavgat, vb.
  schoolType: SchoolType;
  educationDuration: '4 Yıl' | 'Hazırlık + 4 Yıl (5 Yıl)';
  hasPrepClass: boolean;
  foreignLanguages: string[];
  boardingInfo: 'Yok' | 'Erkek Pansiyonlu' | 'Kız Pansiyonlu' | 'Kız ve Erkek Pansiyonlu';
  admissionType: 'Merkezî Sınav (LGS Puanı)' | 'Yerel Yerleştirme (OBP / Kayıt Alanı)';
  yearlyPlacements: SchoolYearlyPlacement[];
  lastUpdatedAt: string;
  verificationStatus: 'Doğrulanmış Resmî Veri (MEB / e-Okul)' | 'Kısmî Doğrulanmış / Geçmiş Yıl Bazlı';
  dataConflictNote?: string | null;
  sourceUrl: string;
}

export type SchoolComparisonCategory =
  | 'zorlayici_hedef' // Zorlayıcı hedef
  | 'rekabetci_hedef' // Rekabetçi hedef
  | 'avantajli_hedef' // Daha avantajlı hedef
  | 'veri_yetersiz'; // Veri yetersiz

export interface SchoolComparisonResult {
  school: AntalyaSchoolProgram;
  category: SchoolComparisonCategory;
  categoryLabel: string;
  latestVerifiedYear: number | null;
  latestMinScore: number | null;
  latestPercentile: number | null;
  percentileChangeMultiYear: number | null; // negatif = dilim daraldı (zorlaştı), pozitif = genişledi
  quotaChangeMultiYear: number | null;
  studentEstimatedPercentileRange: [number, number] | null;
  gapToLatestPercentile: number | null;
  confidenceLevel: 'high' | 'medium' | 'low' | 'insufficient';
  reasoningText: string;
}

export interface PercentileAndScoreEstimate {
  hasEnoughData: boolean;
  examCountUsed: number;
  weightedAverageNet: number | null;
  latestExamNet: number | null;
  latestProviderScore: number | null;
  inExamPercentile: number | null; // Deneme içi yüzdelik (katılımcı sayısı ve sıra varsa)
  inExamRankInfo: string | null;
  estimatedNationalPercentileRange: [number, number] | null; // [iyimser, temkinli] ör: [1.8, 3.2]
  estimatedNationalPercentileMid: number | null;
  estimatedScoreBand: [number, number] | null; // ör: [452, 468]
  uncertaintyNotice: string;
  modelDescription: string;
  confidenceLevel: 'high' | 'medium' | 'low' | 'insufficient';
  officialResult?: StudentProfile['officialLgsResult'];
}

export type CloudProviderType = 'firebase' | 'google_script' | 'none';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId: string;
}

export interface CloudSyncSettings {
  enabled: boolean;
  provider: CloudProviderType;
  familySyncId: string; // e.g., "atakan-lgs-2026" or 6-digit family key
  familySecretPin: string; // optional family PIN for shared safety
  firebaseConfig?: FirebaseConfigParams | null;
  googleScriptUrl?: string | null;
  autoSync: boolean; // Auto sync on change and startup
  lastSyncedAt: string | null;
  lastSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncMessage: string | null;
}

export interface DeletedEntityRecord {
  id: string;
  entityType: 'student' | 'exam' | 'question' | 'photo' | 'studyPlan';
  deletedAt: string;
}
