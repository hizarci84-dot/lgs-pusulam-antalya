import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ANTALYA_SCHOOL_DATA_LAST_UPDATED,
  ANTALYA_SCHOOL_PROGRAMS,
} from '../src/data/antalyaSchools';
import { resolveEffectiveTopic } from '../src/data/curriculum';
import {
  calculateSubjectNet,
  checkDuplicateExam,
  computeExamTotals,
  computePercentileAndScoreEstimate,
  createDefaultSubjectResults,
  validateSubjectCounts,
} from '../src/services/calculationEngine';
import {
  clearAllUserData,
  exportFullBackup,
  getAllStudents,
  getExamsByStudent,
  getPhotoAssetsByStudent,
  getQuestionsByStudent,
  restoreFromBackup,
  saveExamRecord,
  savePhotoAsset,
  saveQuestionRecord,
  saveStudentProfile,
} from '../src/services/db';
import { seedDemoStudentDataset } from '../src/services/demoSeeder';
import {
  analyzeRecurringPatterns,
  generatePersonalizedStudyPlan,
  processQuestionReviewOutcome,
} from '../src/services/patternEngine';
import {
  compareSchoolWithStudent,
  filterAndCompareSchools,
} from '../src/services/schoolComparisonEngine';
import {
  ExamRecord,
  QuestionPhotoAsset,
  QuestionRecord,
  StudentProfile,
} from '../src/types/models';

describe('LGS Pusulam – Antalya • 18 Kabul Kriteri Doğrulama Testleri', () => {
  beforeEach(async () => {
    await clearAllUserData();
  });

  it('1. Profil oluşturma (öğrenci adı zorunlu olmadan) ve IndexedDB kalıcı saklama', async () => {
    const profile: StudentProfile = {
      id: 'stu-test-1',
      nickname: '', // Optional student name
      gradeLevel: '8. Sınıf',
      antalyaDistrict: 'Konyaaltı',
      targetSchoolIds: ['ant-yusuf-ziya-oner-fl'],
      targetSchoolTypes: ['Fen Lisesi'],
      targetPercentile: 1.5,
      weeklyStudyHours: 15,
      dailyStudyMinutes: 120,
      boardingPreference: 'gunduzlu',
      foreignLanguagePreferences: ['İngilizce'],
      preferredDistricts: ['Konyaaltı', 'Muratpaşa'],
      reviewIntervalsDays: [0, 1, 3, 7],
      officialLgsResult: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveStudentProfile(profile);
    const loaded = await getAllStudents();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('stu-test-1');
    expect(loaded[0].nickname).toBe('');
    expect(loaded[0].antalyaDistrict).toBe('Konyaaltı');
  });

  it('2 & 3. Yeni deneme ekleme, düzenleme, geçersiz kayıt engeli, mükerrer kontrolü ve Net = Doğru - (Yanlış / 3) doğruluğu', async () => {
    // Net formula check: 17 Doğru, 3 Yanlış, 0 Boş -> 17 - (3/3) = 16.00 Net
    expect(calculateSubjectNet(17, 3)).toBe(16);
    // Blank answers must not reduce net: 15 Doğru, 0 Yanlış, 5 Boş -> 15.00 Net
    expect(calculateSubjectNet(15, 0)).toBe(15);
    // Fractional net: 16 Doğru, 2 Yanlış, 2 Boş -> 16 - 0.67 = 15.33 Net
    expect(calculateSubjectNet(16, 2)).toBe(15.33);

    // Validation checks: negative or sum > questionCount must be rejected
    expect(validateSubjectCounts('Matematik', 20, -1, 2, 0).valid).toBe(false);
    expect(validateSubjectCounts('Matematik', 20, 15, 4, 3).valid).toBe(false);
    expect(validateSubjectCounts('Matematik', 20, 15, 3, 2).valid).toBe(true);

    const sr = createDefaultSubjectResults().map((r) =>
      r.subjectId === 'matematik'
        ? { ...r, correct: 15, wrong: 3, blank: 2, net: calculateSubjectNet(15, 3) }
        : { ...r, correct: r.questionCount, wrong: 0, blank: 0, net: r.questionCount }
    );
    const totals = computeExamTotals(sr);
    expect(totals.totalNet).toBe(84); // 70 + 14

    const exam1: ExamRecord = {
      id: 'ex-1',
      studentId: 'stu-1',
      name: 'Özdebir TG-1',
      date: '2026-10-01',
      publisher: 'Özdebir',
      examType: 'Kurumsal Türkiye Geneli',
      subjectResults: sr,
      ...totals,
      notes: 'İlk kayıt',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveExamRecord(exam1);
    const storedExams = await getExamsByStudent('stu-1');
    expect(storedExams).toHaveLength(1);

    // Duplicate exam detection
    const dup = checkDuplicateExam(storedExams, {
      name: 'Özdebir TG-1',
      date: '2026-10-01',
      publisher: 'Özdebir',
      totalNet: 84,
    });
    expect(dup).not.toBeNull();
  });

  it('4, 5, 6 & 9. Ders bazlı fotoğraf yükleme, yanlış/boş ayrımı, yeniden açılışta ve çözüm sonrasında fotoğrafların ve geçmişin korunması', async () => {
    const asset: QuestionPhotoAsset = {
      id: 'photo-test-1',
      studentId: 'stu-1',
      examId: 'ex-1',
      questionId: 'q-test-1',
      originalDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      croppedDataUrl: null,
      cropRect: null,
      rotation: 0,
      mimeType: 'image/jpeg',
      createdAt: new Date().toISOString(),
    };
    await savePhotoAsset(asset);

    const qWrong: QuestionRecord = {
      id: 'q-test-1',
      studentId: 'stu-1',
      examId: 'ex-1',
      subjectId: 'matematik',
      questionNumber: 5,
      status: 'wrong',
      photoIds: ['photo-test-1'],
      userTopicId: 'mat-carpanlar-katlar',
      aiSuggestedTopicId: null,
      inferredTopicId: null,
      subtopicName: 'EBOB ve EKOK Problemleri',
      topicVerifiedByUser: true,
      studentAnswer: 'A',
      correctAnswer: 'C',
      errorReason: 'konu_eksigi',
      studentNote: 'EKOK yerine EBOB aldım',
      solutionExplanation: '',
      learningStatus: 'unsolved', // Uploading photo does NOT mark it solved!
      isAnalyzed: false,
      reviewStage: 0,
      lastReviewedAt: null,
      nextReviewDate: '2026-10-17',
      attemptHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveQuestionRecord(qWrong);

    // Mark as solved independently -> photo and history MUST be preserved!
    const { updatedQuestion } = processQuestionReviewOutcome(
      qWrong,
      'solved_independently',
      'Kendi başıma çözdüm',
      [0, 1, 3, 7],
      '2026-10-17'
    );
    await saveQuestionRecord(updatedQuestion);

    const loadedQs = await getQuestionsByStudent('stu-1');
    const loadedPhotos = await getPhotoAssetsByStudent('stu-1');

    expect(loadedQs[0].learningStatus).toBe('mastered_independent');
    expect(loadedQs[0].attemptHistory).toHaveLength(1);
    expect(loadedQs[0].photoIds).toContain('photo-test-1');
    expect(loadedPhotos).toHaveLength(1);
    expect(loadedPhotos[0].originalDataUrl).toContain('data:image/jpeg');
  });

  it('7, 8, 10, 11 & 12. Farklı denemelerde tekrarlayan hata analizi (4 denemede 7 yanlış), tek seferlik hata ayrımı, tekrar tarihleri ve çalışma planı', () => {
    // Create 4 exams where 'mat-carpanlar-katlar' has 7 total wrong answers across 4 exams,
    // while 'mat-olasilik' has only 1 single wrong answer in 1 exam.
    const exams: ExamRecord[] = [1, 2, 3, 4].map((n) => {
      const sr = createDefaultSubjectResults();
      return {
        id: `ex-${n}`,
        studentId: 'stu-1',
        name: `Deneme ${n}`,
        date: `2026-10-0${n}`,
        publisher: 'Kurum',
        examType: 'Genel Deneme (LGS Tam)',
        subjectResults: sr,
        totalQuestions: 90,
        totalCorrect: 75,
        totalWrong: 12,
        totalBlank: 3,
        totalNet: 71,
        notes: '',
        createdAt: `2026-10-0${n}T10:00:00Z`,
        updatedAt: `2026-10-0${n}T10:00:00Z`,
      };
    });

    const examAssignment = [
      'ex-1',
      'ex-1',
      'ex-2',
      'ex-2',
      'ex-3',
      'ex-3',
      'ex-4',
    ];
    const questions: QuestionRecord[] = examAssignment.map((exId, idx) => ({
      id: `q-ck-${idx + 1}`,
      studentId: 'stu-1',
      examId: exId,
      subjectId: 'matematik',
      questionNumber: idx + 1,
      status: 'wrong',
      photoIds: [],
      userTopicId: 'mat-carpanlar-katlar',
      aiSuggestedTopicId: 'mat-uslu-ifadeler', // User topic must override AI suggestion!
      inferredTopicId: null,
      subtopicName: 'EBOB-EKOK',
      topicVerifiedByUser: true,
      studentAnswer: 'A',
      correctAnswer: 'B',
      errorReason: 'konu_eksigi',
      studentNote: '',
      solutionExplanation: '',
      learningStatus: 'unsolved',
      isAnalyzed: true,
      reviewStage: 0,
      lastReviewedAt: null,
      nextReviewDate: '2026-10-17',
      attemptHistory: [],
      createdAt: '2026-10-10T10:00:00Z',
      updatedAt: '2026-10-10T10:00:00Z',
    }));

    // Add 1 single-occurrence wrong question in Olasılık
    questions.push({
      ...questions[0],
      id: 'q-single-olasilik',
      examId: 'ex-4',
      userTopicId: 'mat-olasilik',
      errorReason: 'dikkat_hatasi',
    });

    // Section 10.2 Topic priority check: User topic overrides AI suggestion
    const eff = resolveEffectiveTopic(questions[0]);
    expect(eff.topicId).toBe('mat-carpanlar-katlar');
    expect(eff.source).toBe('user');

    const report = analyzeRecurringPatterns(exams, questions);
    const ckMetric = report.topicMetrics.find(
      (m) => m.topicId === 'mat-carpanlar-katlar'
    )!;
    const olasilikMetric = report.topicMetrics.find(
      (m) => m.topicId === 'mat-olasilik'
    )!;

    expect(ckMetric.totalWrongCount).toBe(7);
    expect(ckMetric.examsWithErrorsCount).toBe(4);
    expect(ckMetric.trendStatus).toBe('recurring_critical');
    expect(ckMetric.explanationText).toContain(
      'Çarpanlar ve Katlar konusunda 4 farklı denemede toplam 7 yanlış kaydedildi.'
    );

    // Single occurrence error MUST NOT be labeled recurring_critical and must have capped priority score
    expect(olasilikMetric.trendStatus).toBe('single_occurrence');
    expect(olasilikMetric.priorityScore).toBeLessThanOrEqual(28);

    // Section 12: Understanding after seeing solution MUST NOT be treated same as independent solve
    const afterSolution = processQuestionReviewOutcome(
      questions[0],
      'understood_after_solution',
      'Çözüme baktım',
      [0, 1, 3, 7],
      '2026-10-17'
    );
    expect(afterSolution.updatedQuestion.learningStatus).toBe(
      'understood_with_help'
    );

    // Section 13: Study plan prioritizes Çarpanlar ve Katlar as Tier 1 with data-backed reason
    const dummyStudent: StudentProfile = {
      id: 'stu-1',
      nickname: 'Test',
      gradeLevel: '8. Sınıf',
      antalyaDistrict: 'Muratpaşa',
      targetSchoolIds: [],
      targetSchoolTypes: ['Fen Lisesi'],
      targetPercentile: 2.0,
      weeklyStudyHours: 12,
      dailyStudyMinutes: 120,
      boardingPreference: 'farketmez',
      foreignLanguagePreferences: ['İngilizce'],
      preferredDistricts: ['Muratpaşa'],
      reviewIntervalsDays: [0, 1, 3, 7],
      createdAt: '2026-10-17T00:00:00.000Z',
      updatedAt: '2026-10-17T00:00:00.000Z',
    };
    const plan = generatePersonalizedStudyPlan(
      dummyStudent,
      exams,
      questions,
      null
    );
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.tasks[0].topicId).toBe('mat-carpanlar-katlar');
    expect(plan.tasks[0].priorityTier).toBe(1);
    expect(plan.tasks[0].priorityReason).toContain(
      'Çarpanlar ve Katlar konusu 4 farklı denemede tekrar eden hata alanı'
    );
  });

  it('13, 14 & 18. Yetersiz veride sahte puan üretilmemesi, Antalya lise filtreleri, program ayrımı ve kaynak görünürlüğü', () => {
    // 0 exams -> no fake score or percentile!
    const emptyEstimate = computePercentileAndScoreEstimate([], null);
    expect(emptyEstimate.hasEnoughData).toBe(false);
    expect(emptyEstimate.estimatedNationalPercentileRange).toBeNull();
    expect(emptyEstimate.estimatedScoreBand).toBeNull();

    // When data is insufficient, school comparison returns 'veri_yetersiz'
    const yusufZiya = ANTALYA_SCHOOL_PROGRAMS.find(
      (s) => s.id === 'ant-yusuf-ziya-oner-fl'
    )!;
    const compEmpty = compareSchoolWithStudent(yusufZiya, emptyEstimate);
    expect(compEmpty.category).toBe('veri_yetersiz');

    // Different programs of same school (Kepez Mahmut Celalettin Ökten AİHL Hazırlıklı vs 4 Yıl) are kept as separate records
    const mcoPrograms = ANTALYA_SCHOOL_PROGRAMS.filter((s) =>
      s.schoolName.includes('Mahmut Celalettin Ökten')
    );
    expect(mcoPrograms.length).toBe(2);

    // Local placement (OBP) schools are separated from central exam schools
    const centralOnly = filterAndCompareSchools(
      ANTALYA_SCHOOL_PROGRAMS,
      emptyEstimate,
      {
        admissionType: 'Merkezî Sınav (LGS Puanı)',
      }
    );
    expect(
      centralOnly.every(
        (c) => c.school.admissionType === 'Merkezî Sınav (LGS Puanı)'
      )
    ).toBe(true);
    expect(ANTALYA_SCHOOL_DATA_LAST_UPDATED).toBeTruthy();
  });

  it('15 & DEMO. Tam yedekleme, geri yükleme ve DEMO verisinin açıkça işaretlenmesi', async () => {
    await seedDemoStudentDataset();
    const backup = await exportFullBackup();
    expect(backup.students.length).toBe(1);
    expect(backup.students[0].isDemo).toBe(true);
    expect(backup.students[0].nickname).toContain('DEMO VERİSİ');
    expect(backup.exams.length).toBe(4);
    expect(backup.questions.length).toBeGreaterThanOrEqual(10);
    expect(backup.photoAssets.length).toBeGreaterThanOrEqual(10);

    await clearAllUserData();
    expect((await getAllStudents()).length).toBe(0);

    const restoredStats = await restoreFromBackup(backup);
    expect(restoredStats.studentsRestored).toBe(1);
    expect(restoredStats.examsRestored).toBe(4);
    expect((await getPhotoAssetsByStudent(backup.students[0].id)).length).toBe(
      backup.photoAssets.length
    );
  });

  it('16. 2026 LGS Otomatik Puan ve Yüzdelik Dilim Hesaplama Motoru doğrulaması', async () => {
    const { calculateLgsScoreAndPercentile } = await import(
      '../src/services/calculationEngine'
    );

    // Full 90 net (All correct)
    const fullResults = createDefaultSubjectResults().map((s) => ({
      ...s,
      correct: s.questionCount,
      wrong: 0,
      blank: 0,
      net: s.questionCount,
    }));
    const fullCalc = calculateLgsScoreAndPercentile(fullResults);
    expect(fullCalc.totalNet).toBe(90);
    expect(fullCalc.score).toBe(500);
    expect(fullCalc.percentile).toBeLessThanOrEqual(0.05);

    // Realistic high performer (78 net)
    const realisticResults = createDefaultSubjectResults().map((s) => {
      if (s.subjectId === 'matematik') return { ...s, correct: 16, wrong: 3, blank: 1, net: 15 };
      if (s.subjectId === 'fen') return { ...s, correct: 18, wrong: 2, blank: 0, net: 17.33 };
      if (s.subjectId === 'turkce') return { ...s, correct: 18, wrong: 2, blank: 0, net: 17.33 };
      return { ...s, correct: s.questionCount, wrong: 0, blank: 0, net: s.questionCount };
    });
    const realisticCalc = calculateLgsScoreAndPercentile(realisticResults);
    expect(realisticCalc.score).toBeGreaterThan(450);
    expect(realisticCalc.score).toBeLessThan(500);
    expect(realisticCalc.percentile).toBeGreaterThan(0.1);
    expect(realisticCalc.percentile).toBeLessThan(5.0);

    // Zero net
    const zeroResults = createDefaultSubjectResults().map((s) => ({
      ...s,
      correct: 0,
      wrong: 0,
      blank: s.questionCount,
      net: 0,
    }));
    const zeroCalc = calculateLgsScoreAndPercentile(zeroResults);
    expect(zeroCalc.totalNet).toBe(0);
    expect(zeroCalc.score).toBe(194.5);
    expect(zeroCalc.percentile).toBe(99);
  });
});
