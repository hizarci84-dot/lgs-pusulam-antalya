import { calculateSubjectNet, computeExamTotals } from './calculationEngine';
import {
  saveExamRecord,
  savePhotoAsset,
  saveQuestionRecord,
  saveStudentProfile,
  saveStudyPlan,
  setActiveStudentId,
} from './db';
import { createDemoQuestionSvgDataUrl } from './imageUtils';
import { generatePersonalizedStudyPlan, getTodayDateStr } from './patternEngine';
import {
  ExamRecord,
  QuestionPhotoAsset,
  QuestionRecord,
  StudentProfile,
  SubjectExamResult,
} from '../types/models';

export const DEMO_STUDENT_ID = 'demo-student-antalya-01';

function buildSubjectResults(
  counts: Record<
    'turkce' | 'matematik' | 'fen' | 'inkilap' | 'din' | 'ingilizce',
    { c: number; w: number; b: number; qCount?: number }
  >
): SubjectExamResult[] {
  const keys = [
    'turkce',
    'matematik',
    'fen',
    'inkilap',
    'din',
    'ingilizce',
  ] as const;

  return keys.map((k) => {
    const item = counts[k];
    const qCount = item.qCount ?? (k === 'turkce' || k === 'matematik' || k === 'fen' ? 20 : 10);
    return {
      subjectId: k,
      questionCount: qCount,
      correct: item.c,
      wrong: item.w,
      blank: item.b,
      net: calculateSubjectNet(item.c, item.w),
      topicBreakdown: [],
    };
  });
}

export async function seedDemoStudentDataset(): Promise<StudentProfile> {
  const nowIso = new Date().toISOString();
  const today = getTodayDateStr();

  const demoStudent: StudentProfile = {
    id: DEMO_STUDENT_ID,
    nickname: 'Atakan [DEMO VERİSİ]',
    gradeLevel: '8. Sınıf',
    antalyaDistrict: 'Muratpaşa',
    targetSchoolIds: [
      'ant-yusuf-ziya-oner-fl',
      'ant-antalya-anadolu-lisesi',
      'ant-adem-tolunay-al',
      'ant-tobb-fl',
    ],
    targetSchoolTypes: ['Fen Lisesi', 'Anadolu Lisesi'],
    targetPercentile: 1.8,
    weeklyStudyHours: 14,
    dailyStudyMinutes: 120,
    boardingPreference: 'gunduzlu',
    foreignLanguagePreferences: ['İngilizce', 'Almanca'],
    preferredDistricts: ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Döşemealtı'],
    reviewIntervalsDays: [0, 1, 3, 7],
    officialLgsResult: null,
    isDemo: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Create 4 chronological demo exams showing realistic progression + recurring patterns
  const examSpecs = [
    {
      id: 'demo-exam-1',
      name: '[DEMO VERİSİ] Özdebir Türkiye Geneli LGS Deneme - 1',
      date: '2026-09-14',
      publisher: 'Özdebir Yayınları (DEMO)',
      examType: 'Kurumsal Türkiye Geneli' as const,
      participantCount: 84500,
      rankInExam: 3210,
      providerScore: 441.2,
      providerPercentile: 3.8,
      notes: '[DEMO VERİSİ] İlk Türkiye geneli deneme. Matematikte süre sıkıntısı yaşandı.',
      counts: {
        turkce: { c: 17, w: 3, b: 0 },
        matematik: { c: 13, w: 4, b: 3 },
        fen: { c: 16, w: 3, b: 1 },
        inkilap: { c: 9, w: 1, b: 0 },
        din: { c: 9, w: 1, b: 0 },
        ingilizce: { c: 9, w: 1, b: 0 },
      },
    },
    {
      id: 'demo-exam-2',
      name: '[DEMO VERİSİ] Töder Türkiye Geneli LGS Deneme - 2',
      date: '2026-09-26',
      publisher: 'TÖDER (DEMO)',
      examType: 'Kurumsal Türkiye Geneli' as const,
      participantCount: 72000,
      rankInExam: 2300,
      providerScore: 448.6,
      providerPercentile: 3.19,
      notes: '[DEMO VERİSİ] Türkçe fiilimsiler düzelmeye başladı, Çarpanlar ve Katlar hataları sürüyor.',
      counts: {
        turkce: { c: 18, w: 2, b: 0 },
        matematik: { c: 14, w: 4, b: 2 },
        fen: { c: 17, w: 2, b: 1 },
        inkilap: { c: 9, w: 1, b: 0 },
        din: { c: 10, w: 0, b: 0 },
        ingilizce: { c: 9, w: 1, b: 0 },
      },
    },
    {
      id: 'demo-exam-3',
      name: '[DEMO VERİSİ] Hız Yayınları Kurumsal Deneme - 3',
      date: '2026-10-05',
      publisher: 'Hız Yayınları (DEMO)',
      examType: 'Genel Deneme (LGS Tam)' as const,
      participantCount: 41200,
      rankInExam: 1080,
      providerScore: 456.4,
      providerPercentile: 2.62,
      notes: '[DEMO VERİSİ] Fen netleri arttı ancak Katı/Sıvı Basıncı ve Çarpanlar-Katlar sorularında işlem/okuma hatası var.',
      counts: {
        turkce: { c: 18, w: 1, b: 1 },
        matematik: { c: 15, w: 3, b: 2 },
        fen: { c: 18, w: 2, b: 0 },
        inkilap: { c: 10, w: 0, b: 0 },
        din: { c: 9, w: 1, b: 0 },
        ingilizce: { c: 10, w: 0, b: 0 },
      },
    },
    {
      id: 'demo-exam-4',
      name: '[DEMO VERİSİ] Sinan Kuzucu Türkiye Geneli Deneme - 4',
      date: '2026-10-15',
      publisher: 'Sinan Kuzucu Yayınları (DEMO)',
      examType: 'Kurumsal Türkiye Geneli' as const,
      participantCount: 65000,
      rankInExam: 1365,
      providerScore: 463.8,
      providerPercentile: 2.1,
      notes: '[DEMO VERİSİ] Matematik neti yükseldi fakat Çarpanlar ve Katlar EBOB-EKOK problemi yine yanlış yapıldı.',
      counts: {
        turkce: { c: 19, w: 1, b: 0 },
        matematik: { c: 16, w: 3, b: 1 },
        fen: { c: 18, w: 1, b: 1 },
        inkilap: { c: 10, w: 0, b: 0 },
        din: { c: 10, w: 0, b: 0 },
        ingilizce: { c: 9, w: 1, b: 0 },
      },
    },
  ];

  const demoExams: ExamRecord[] = examSpecs.map((spec) => {
    const sr = buildSubjectResults(spec.counts);
    const totals = computeExamTotals(sr);
    return {
      id: spec.id,
      studentId: DEMO_STUDENT_ID,
      name: spec.name,
      date: spec.date,
      publisher: spec.publisher,
      examType: spec.examType,
      participantCount: spec.participantCount,
      rankInExam: spec.rankInExam,
      providerScore: spec.providerScore,
      providerPercentile: spec.providerPercentile,
      subjectResults: sr,
      ...totals,
      notes: spec.notes,
      isDemo: true,
      createdAt: `${spec.date}T18:00:00.000Z`,
      updatedAt: `${spec.date}T18:00:00.000Z`,
    };
  });

  // Create realistic QuestionRecords & PhotoAssets across the 4 exams
  // Including:
  // - 5 questions in 'mat-carpanlar-katlar' across all 4 exams (recurring critical topic!)
  // - 3 questions in 'fen-basinc' across 3 exams (persisting despite review!)
  // - 2 questions in 'tr-fiilimsiler' in exam 1 & 2 that were mastered independently! (improving topic!)
  // - 2 blank questions in 'mat-karekoklu-ifadeler' due to 'sure_yetmedi'
  // - 1 single occurrence question in 'mat-olasilik' (single occurrence - not critical!)
  const questionBlueprints = [
    {
      id: 'demo-q-1',
      examId: 'demo-exam-1',
      subjectId: 'matematik' as const,
      subjectName: 'Matematik',
      questionNumber: 4,
      status: 'wrong' as const,
      topicId: 'mat-carpanlar-katlar',
      topicName: 'Çarpanlar ve Katlar',
      subtopic: 'EBOB ve EKOK Problemleri',
      studentAnswer: 'B' as const,
      correctAnswer: 'C' as const,
      errorReason: 'konu_eksigi' as const,
      learningStatus: 'needs_topic_study' as const,
      reviewStage: 0,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] Kenar uzunlukları 144 m ve 180 m olan dikdörtgen şeklindeki bir bahçenin etrafına köşelere de dikilmek şartıyla eşit aralıklarla aydınlatma direği dikilecektir. En az kaç direk gerekir?',
      options: ['16', '18', '20', '24'] as [string, string, string, string],
      studentNote: 'EBOB(144,180) = 36 buldum ama çevre formülünde 2 ile çarpmayı unuttum.',
    },
    {
      id: 'demo-q-2',
      examId: 'demo-exam-1',
      subjectId: 'matematik' as const,
      subjectName: 'Matematik',
      questionNumber: 7,
      status: 'wrong' as const,
      topicId: 'mat-carpanlar-katlar',
      topicName: 'Çarpanlar ve Katlar',
      subtopic: 'Aralarında Asal Sayılar',
      studentAnswer: 'A' as const,
      correctAnswer: 'D' as const,
      errorReason: 'islem_hatasi' as const,
      learningStatus: 'understood_with_help' as const,
      reviewStage: 1,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] (2x - 3) ile (y + 4) aralarında asal iki doğal sayıdır. (2x - 3)/(y + 4) = 24/36 olduğuna göre x + y toplamı kaçtır?',
      options: ['5', '6', '7', '8'] as [string, string, string, string],
      studentNote: 'Kesri en sade hâline (2/3) getirmeden eşitledim.',
    },
    {
      id: 'demo-q-3',
      examId: 'demo-exam-2',
      subjectId: 'matematik' as const,
      subjectName: 'Matematik',
      questionNumber: 3,
      status: 'wrong' as const,
      topicId: 'mat-carpanlar-katlar',
      topicName: 'Çarpanlar ve Katlar',
      subtopic: 'EBOB ve EKOK Problemleri',
      studentAnswer: 'D' as const,
      correctAnswer: 'B' as const,
      errorReason: 'konu_eksigi' as const,
      learningStatus: 'needs_topic_study' as const,
      reviewStage: 0,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] Bir limandan her 45 dakikada bir A vapuru, her 60 dakikada bir B vapuru sefer yapmaktadır. İlk kez 08.00’de birlikte hareket eden vapurlar 3. kez saat kaçta birlikte hareket eder?',
      options: ['11.00', '14.00', '15.00', '17.00'] as [string, string, string, string],
      studentNote: '1. birlikte hareketi başlangıç saymayı unutup 3 kez EKOK ekledim.',
    },
    {
      id: 'demo-q-4',
      examId: 'demo-exam-3',
      subjectId: 'matematik' as const,
      subjectName: 'Matematik',
      questionNumber: 11,
      status: 'wrong' as const,
      topicId: 'mat-carpanlar-katlar',
      topicName: 'Çarpanlar ve Katlar',
      subtopic: 'EBOB ve EKOK Problemleri',
      studentAnswer: 'C' as const,
      correctAnswer: 'A' as const,
      errorReason: 'islem_hatasi' as const,
      learningStatus: 'unsolved' as const,
      reviewStage: 0,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] Uzunlukları 120 cm ve 150 cm olan iki demir çubuk hiç artmayacak biçimde eşit uzunlukta parçalara ayrılacaktır. Her kesim işlemi 40 saniye sürdüğüne göre en az kaç dakika sürer?',
      options: ['4 dk 40 sn', '5 dk', '6 dk', '6 dk 20 sn'] as [string, string, string, string],
      studentNote: 'Parça sayısı ile kesim sayısı arasındaki -1 farkına dikkat etmedim.',
    },
    {
      id: 'demo-q-5',
      examId: 'demo-exam-4',
      subjectId: 'matematik' as const,
      subjectName: 'Matematik',
      questionNumber: 2,
      status: 'wrong' as const,
      topicId: 'mat-carpanlar-katlar',
      topicName: 'Çarpanlar ve Katlar',
      subtopic: 'Pozitif Tam Sayıların Çarpanları ve Asal Çarpanlar',
      studentAnswer: 'B' as const,
      correctAnswer: 'D' as const,
      errorReason: 'konu_eksigi' as const,
      learningStatus: 'unsolved' as const,
      reviewStage: 0,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] Alanı 180 cm² olan dikdörtgenin kenar uzunlukları santimetre cinsinden aralarında asal birer tam sayıdır. Bu dikdörtgenin çevresi en az kaç cm olabilir?',
      options: ['54', '56', '58', '68'] as [string, string, string, string],
      studentNote: '12 ve 15 seçtim ama aralarında asal olmadıklarını gözden kaçırdım (9 ve 20 olmalıydı).',
    },
    {
      id: 'demo-q-6',
      examId: 'demo-exam-2',
      subjectId: 'fen' as const,
      subjectName: 'Fen Bilimleri',
      questionNumber: 9,
      status: 'wrong' as const,
      topicId: 'fen-basinc',
      topicName: 'Katı, Sıvı ve Gaz Basıncı',
      subtopic: 'Sıvı Basıncı (Derinlik, Yoğunluk) ve Pascal Prensibi',
      studentAnswer: 'A' as const,
      correctAnswer: 'C' as const,
      errorReason: 'yanlis_okuma' as const,
      learningStatus: 'needs_topic_study' as const,
      reviewStage: 0,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] Taban alanları eşit, yukarı doğru genişleyen K kabı ile düz L kabına eşit hacimde su konuluyor. Kap tabanlarındaki sıvı basınçları PK ve PL arasındaki ilişki nedir?',
      options: ['PK > PL', 'PK = PL', 'PL > PK', 'Bilinemez'] as [string, string, string, string],
      studentNote: 'Eşit yükseklik yerine eşit hacim dendiğini yanlış okudum.',
    },
    {
      id: 'demo-q-7',
      examId: 'demo-exam-4',
      subjectId: 'fen' as const,
      subjectName: 'Fen Bilimleri',
      questionNumber: 14,
      status: 'wrong' as const,
      topicId: 'fen-basinc',
      topicName: 'Katı, Sıvı ve Gaz Basıncı',
      subtopic: 'Katı Basıncını Etkileyen Değişkenler (Ağırlık ve Yüzey Alanı)',
      studentAnswer: 'B' as const,
      correctAnswer: 'A' as const,
      errorReason: 'dikkat_hatasi' as const,
      learningStatus: 'unsolved' as const,
      reviewStage: 0,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] Özdeş küplerden oluşan bir cisim dikey doğrultuda tam ortadan ikiye kesiliyor. Kalan parçanın yere yaptığı basınç ilk duruma göre nasıl değişir?',
      options: ['Değişmez', 'Yarıya iner', 'İki katına çıkar', 'Dörtte birine iner'] as [string, string, string, string],
      studentNote: 'Hem ağırlık hem yüzey alanı aynı oranda azaldığı için basınç değişmez.',
    },
    {
      id: 'demo-q-8',
      examId: 'demo-exam-3',
      subjectId: 'matematik' as const,
      subjectName: 'Matematik',
      questionNumber: 18,
      status: 'blank' as const,
      topicId: 'mat-karekoklu-ifadeler',
      topicName: 'Kareköklü İfadeler',
      subtopic: 'Kareköklü İfadelerle Çarpma ve Bölme İşlemleri',
      studentAnswer: '' as const,
      correctAnswer: 'C' as const,
      errorReason: 'sure_yetmedi' as const,
      learningStatus: 'unsolved' as const,
      reviewStage: 0,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] Uzunluğu √432 cm olan bir tel, her birinin uzunluğu √12 cm olan eş parçalara ayrılıp eşkenar üçgenler oluşturuluyor. Kaç adet üçgen elde edilir?',
      options: ['1', '2', '3', '4'] as [string, string, string, string],
      studentNote: 'Sınavın son dakikasında süre yetmediği için boş bıraktım.',
    },
    {
      id: 'demo-q-9',
      examId: 'demo-exam-4',
      subjectId: 'matematik' as const,
      subjectName: 'Matematik',
      questionNumber: 19,
      status: 'blank' as const,
      topicId: 'mat-karekoklu-ifadeler',
      topicName: 'Kareköklü İfadeler',
      subtopic: 'Kareköklü İfadelerle Toplama ve Çıkarma İşlemleri',
      studentAnswer: '' as const,
      correctAnswer: 'B' as const,
      errorReason: 'sure_yetmedi' as const,
      learningStatus: 'unsolved' as const,
      reviewStage: 0,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] Alanları 75 cm² ve 108 cm² olan iki kare yan yana konularak şeklin çevresi hesaplanıyor. Şeklin dış çevresi kaç santimetredir?',
      options: ['32√3', '38√3', '42√3', '44√3'] as [string, string, string, string],
      studentNote: 'Yeni nesil şekilli soruya süre kalmadı.',
    },
    {
      id: 'demo-q-10',
      examId: 'demo-exam-1',
      subjectId: 'turkce' as const,
      subjectName: 'Türkçe',
      questionNumber: 12,
      status: 'wrong' as const,
      topicId: 'tr-fiilimsiler',
      topicName: 'Fiilimsiler (Eylemsiler)',
      subtopic: 'Fiilimsi ile Çekimli Fiil ve Kalıcı İsim Ayrımı',
      studentAnswer: 'D' as const,
      correctAnswer: 'B' as const,
      errorReason: 'konu_eksigi' as const,
      learningStatus: 'mastered_independent' as const,
      reviewStage: 3,
      nextReviewDate: '2026-10-25',
      questionText:
        '[DEMO VERİSİ] Aşağıdaki cümlelerin hangisinde "-ma / -me" eki eklendiği sözcüğü isim-fiil yapmamış, kalıcı isim oluşturmuştur?',
      options: [
        'Kitap okumayı çok seviyor.',
        'Dondurma yaz aylarının vazgeçilmezidir.',
        'Buraya gelmemeni söylemiştim.',
        'Yüzme bilmeyen kalmasın.',
      ] as [string, string, string, string],
      studentNote: 'Kalıcı isim ve olumsuzluk eki ayrımını tekrar edip tam öğrendim.',
    },
    {
      id: 'demo-q-11',
      examId: 'demo-exam-4',
      subjectId: 'matematik' as const,
      subjectName: 'Matematik',
      questionNumber: 20,
      status: 'wrong' as const,
      topicId: 'mat-olasilik',
      topicName: 'Olasılık',
      subtopic: 'Basit Bir Olayın Olma Olasılığı Hesabı',
      studentAnswer: 'A' as const,
      correctAnswer: 'B' as const,
      errorReason: 'dikkat_hatasi' as const,
      learningStatus: 'unsolved' as const,
      reviewStage: 0,
      nextReviewDate: today,
      questionText:
        '[DEMO VERİSİ] 1’den 20’ye kadar numaralandırılmış toplar arasından rastgele seçilen bir topun asal sayı olma olasılığı kaçtır?',
      options: ['7/20', '2/5', '9/20', '1/2'] as [string, string, string, string],
      studentNote: '1 sayısını yanlışlıkla asal saydım (Tek seferlik dikkat hatası).',
    },
  ];

  const createdQuestions: QuestionRecord[] = [];

  for (const bp of questionBlueprints) {
    const photoId = `photo-${bp.id}`;
    const svgDataUrl = createDemoQuestionSvgDataUrl({
      subjectName: bp.subjectName,
      topicName: bp.topicName,
      questionNumber: bp.questionNumber,
      questionText: bp.questionText,
      options: bp.options,
      statusLabel: bp.status === 'wrong' ? 'YANLIŞ SORU' : 'BOŞ SORU',
    });

    const photoAsset: QuestionPhotoAsset = {
      id: photoId,
      studentId: DEMO_STUDENT_ID,
      examId: bp.examId,
      questionId: bp.id,
      originalDataUrl: svgDataUrl,
      croppedDataUrl: null,
      cropRect: null,
      rotation: 0,
      mimeType: 'image/svg+xml',
      createdAt: nowIso,
    };

    await savePhotoAsset(photoAsset);

    const qRecord: QuestionRecord = {
      id: bp.id,
      studentId: DEMO_STUDENT_ID,
      examId: bp.examId,
      subjectId: bp.subjectId,
      questionNumber: bp.questionNumber,
      status: bp.status,
      photoIds: [photoId],
      userTopicId: bp.topicId,
      aiSuggestedTopicId: bp.topicId,
      inferredTopicId: bp.topicId,
      subtopicName: bp.subtopic,
      topicVerifiedByUser: true,
      studentAnswer: bp.studentAnswer,
      correctAnswer: bp.correctAnswer,
      errorReason: bp.errorReason,
      studentNote: bp.studentNote,
      solutionExplanation: `Doğru cevap ${bp.correctAnswer} seçeneğidir. ${bp.studentNote}`,
      learningStatus: bp.learningStatus,
      isAnalyzed: true,
      reviewStage: bp.reviewStage,
      lastReviewedAt: bp.reviewStage > 0 ? nowIso : null,
      nextReviewDate: bp.nextReviewDate,
      attemptHistory:
        bp.id === 'demo-q-6'
          ? [
              {
                id: 'demo-att-6',
                questionId: bp.id,
                studentId: DEMO_STUDENT_ID,
                attemptedAt: nowIso,
                outcome: 'still_cannot_solve',
                note: 'Kap şekli-basınç ilişkisini tekrar karıştırdım.',
                previousStage: 0,
                newStage: 0,
                nextScheduledDate: today,
              },
            ]
          : bp.id === 'demo-q-10'
          ? [
              {
                id: 'demo-att-10',
                questionId: bp.id,
                studentId: DEMO_STUDENT_ID,
                attemptedAt: nowIso,
                outcome: 'solved_independently',
                note: 'Yardımsız doğru çözdüm.',
                previousStage: 2,
                newStage: 3,
                nextScheduledDate: '2026-10-25',
              },
            ]
          : [],
      aiAnalysis: {
        isReadable: true,
        extractedText: bp.questionText,
        visualDescription: 'DEMO VERİSİ örnek soru kartı görseli.',
        suggestedTopicId: bp.topicId,
        suggestedTopicName: bp.topicName,
        suggestedSubtopicName: bp.subtopic,
        confidence: 94,
        candidateTopics: [
          {
            topicId: bp.topicId,
            topicName: bp.topicName,
            subtopicName: bp.subtopic,
            confidence: 94,
          },
        ],
        correctAnswer: bp.correctAnswer,
        solutionSteps: [
          '1. Soruda verilen sayısal değerler ve istenen durum belirlenir.',
          `2. ${bp.subtopic} kazanım kuralı uygulanır.`,
          `3. İşlem sağlaması yapılarak ${bp.correctAnswer} seçeneğine ulaşılır.`,
        ],
        commonMistakes: [bp.studentNote],
        similarPracticeQuestion: {
          questionText: `${bp.topicName} pekiştirme sorusu: Benzer kazanımda sayıları değiştirilmiş yeni nesil alıştırma.`,
          options: ['A) 12', 'B) 15', 'C) 18', 'D) 24'],
          correctOption: 'C',
          shortSolution: 'Temel kazanım formülü doğrudan uygulanarak 18 bulunur.',
        },
        providerName: 'demo',
        analyzedAt: nowIso,
      },
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await saveQuestionRecord(qRecord);
    createdQuestions.push(qRecord);
  }

  await saveStudentProfile(demoStudent);
  for (const ex of demoExams) {
    await saveExamRecord(ex);
  }

  const plan = generatePersonalizedStudyPlan(
    demoStudent,
    demoExams,
    createdQuestions,
    null
  );
  await saveStudyPlan(plan);
  await setActiveStudentId(DEMO_STUDENT_ID);

  return demoStudent;
}
