import {
  CURRICULUM_TOPICS,
  CURRICULUM_TOPIC_MAP,
  ERROR_REASON_MAP,
  LGS_SUBJECTS,
  SUBJECT_MAP,
  resolveEffectiveTopic,
} from '../data/curriculum';
import {
  ErrorReasonCode,
  ExamRecord,
  QuestionAttemptLog,
  QuestionRecord,
  ReviewOutcome,
  ReviewTask,
  StudentProfile,
  StudyPlanTask,
  SubjectId,
  TopicPatternMetrics,
  WeeklyStudyPlan,
} from '../types/models';

export const PRIORITY_MODEL_WEIGHTS = {
  wrongWeight: 11,
  blankWeight: 8,
  examRecurrenceWeight: 16,
  recentExamBonus: 12,
  unsolvedPenalty: 8,
  failedAfterReviewPenalty: 14,
  conceptualErrorReasonBonus: 9,
  independentMasteryDiscount: 10,
  highAccuracyDiscountFactor: 22,
};

export interface ErrorReasonDiagnostic {
  reasonCode: ErrorReasonCode;
  label: string;
  count: number;
  percentage: number;
  affectedSubjects: SubjectId[];
  affectedTopics: string[];
  strategicRecommendation: string;
}

export interface SubjectRisingTopicPersistingInsight {
  subjectId: SubjectId;
  subjectName: string;
  previousAvgNet: number;
  latestNet: number;
  netGain: number;
  persistingTopicName: string;
  persistingTopicErrorsInLatest: number;
  message: string;
}

export interface ComprehensivePatternReport {
  hasData: boolean;
  totalExamsCount: number;
  totalQuestionsLogged: number;
  topicMetrics: TopicPatternMetrics[];
  recurringWrongTopics: TopicPatternMetrics[];
  highBlankTopics: TopicPatternMetrics[];
  improvedTopics: TopicPatternMetrics[];
  persistingInNewQuestionsTopics: TopicPatternMetrics[];
  persistingDespiteReviewTopics: TopicPatternMetrics[];
  singleOccurrenceTopics: TopicPatternMetrics[];
  errorReasonDiagnostics: ErrorReasonDiagnostic[];
  subjectsRisingButTopicPersisting: SubjectRisingTopicPersistingInsight[];
  narrativeInsights: string[];
}

/**
 * Computes normalized text fingerprint to distinguish whether two wrong questions across exams
 * are the EXACT same question repeated or DIFFERENT questions from the same topic (Section 9).
 */
export function computeQuestionFingerprint(text: string): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .slice(0, 140);
}

export function checkExactQuestionDuplicate(
  existingQuestions: QuestionRecord[],
  candidate: {
    id?: string;
    subjectId: SubjectId;
    extractedText?: string;
    studentNote?: string;
  }
): {
  isExactDuplicate: boolean;
  matchedQuestionId: string | null;
  similarityScore: number;
} {
  const sourceText = (candidate.extractedText || candidate.studentNote || '').trim();
  const fp = computeQuestionFingerprint(sourceText);
  if (fp.length < 25) {
    return { isExactDuplicate: false, matchedQuestionId: null, similarityScore: 0 };
  }

  for (const q of existingQuestions) {
    if (candidate.id && q.id === candidate.id) continue;
    if (q.subjectId !== candidate.subjectId) continue;
    const otherText =
      q.aiAnalysis?.extractedText || q.studentNote || q.textFingerprint || '';
    const otherFp = computeQuestionFingerprint(otherText);
    if (otherFp.length < 25) continue;

    if (fp === otherFp || fp.includes(otherFp) || otherFp.includes(fp)) {
      return {
        isExactDuplicate: true,
        matchedQuestionId: q.id,
        similarityScore: 0.96,
      };
    }
  }

  return { isExactDuplicate: false, matchedQuestionId: null, similarityScore: 0 };
}

/**
 * Core Recurring Error & Topic Deficiency Engine (Section 10)
 */
export function analyzeRecurringPatterns(
  exams: ExamRecord[],
  questions: QuestionRecord[]
): ComprehensivePatternReport {
  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date)); // chronological
  const recent3ExamIds = new Set(sortedExams.slice(-3).map((e) => e.id));
  const examDateMap = new Map(sortedExams.map((e) => [e.id, e.date]));

  if (sortedExams.length === 0 && questions.length === 0) {
    return {
      hasData: false,
      totalExamsCount: 0,
      totalQuestionsLogged: 0,
      topicMetrics: [],
      recurringWrongTopics: [],
      highBlankTopics: [],
      improvedTopics: [],
      persistingInNewQuestionsTopics: [],
      persistingDespiteReviewTopics: [],
      singleOccurrenceTopics: [],
      errorReasonDiagnostics: [],
      subjectsRisingButTopicPersisting: [],
      narrativeInsights: [],
    };
  }

  // Aggregate per-topic statistics from both ExamRecord.subjectResults.topicBreakdown AND QuestionRecords
  const topicStatsMap = new Map<
    string,
    {
      topicId: string;
      subjectId: SubjectId;
      unitName: string;
      topicName: string;
      wrongByExam: Map<string, number>;
      blankByExam: Map<string, number>;
      correctByExam: Map<string, number>;
      questions: QuestionRecord[];
    }
  >();

  const ensureTopicEntry = (
    topicId: string,
    subjectId: SubjectId,
    unitName: string,
    topicName: string
  ) => {
    if (!topicStatsMap.has(topicId)) {
      topicStatsMap.set(topicId, {
        topicId,
        subjectId,
        unitName,
        topicName,
        wrongByExam: new Map(),
        blankByExam: new Map(),
        correctByExam: new Map(),
        questions: [],
      });
    }
    return topicStatsMap.get(topicId)!;
  };

  // 1. Collect explicit topic breakdowns from ExamRecords (including correct answers!)
  for (const exam of sortedExams) {
    for (const sr of exam.subjectResults) {
      if (sr.topicBreakdown && sr.topicBreakdown.length > 0) {
        for (const tb of sr.topicBreakdown) {
          const def = CURRICULUM_TOPIC_MAP[tb.topicId];
          if (!def) continue;
          const entry = ensureTopicEntry(
            def.id,
            def.subjectId,
            def.unitName,
            def.topicName
          );
          if (tb.wrong > 0) {
            entry.wrongByExam.set(
              exam.id,
              (entry.wrongByExam.get(exam.id) || 0) + tb.wrong
            );
          }
          if (tb.blank > 0) {
            entry.blankByExam.set(
              exam.id,
              (entry.blankByExam.get(exam.id) || 0) + tb.blank
            );
          }
          if (tb.correct > 0) {
            entry.correctByExam.set(
              exam.id,
              (entry.correctByExam.get(exam.id) || 0) + tb.correct
            );
          }
        }
      }
    }
  }

  // 2. Collect from QuestionRecords (Digital Wrong/Blank Notebook)
  const examTopicQuestionCount = new Map<string, { wrong: number; blank: number }>();
  for (const q of questions) {
    const resolved = resolveEffectiveTopic(q);
    if (!resolved.topicId) continue;
    const def = CURRICULUM_TOPIC_MAP[resolved.topicId];
    if (!def) continue;

    const entry = ensureTopicEntry(
      def.id,
      def.subjectId,
      def.unitName,
      def.topicName
    );
    entry.questions.push(q);

    const key = `${q.examId}__${def.id}`;
    const prev = examTopicQuestionCount.get(key) || { wrong: 0, blank: 0 };
    if (q.status === 'wrong') prev.wrong += 1;
    else prev.blank += 1;
    examTopicQuestionCount.set(key, prev);
  }

  // Merge question counts with exam breakdown counts (taking max per exam so we don't double-count)
  for (const [key, counts] of examTopicQuestionCount.entries()) {
    const [examId, topicId] = key.split('__');
    const entry = topicStatsMap.get(topicId);
    if (!entry) continue;
    if (counts.wrong > 0) {
      entry.wrongByExam.set(
        examId,
        Math.max(entry.wrongByExam.get(examId) || 0, counts.wrong)
      );
    }
    if (counts.blank > 0) {
      entry.blankByExam.set(
        examId,
        Math.max(entry.blankByExam.get(examId) || 0, counts.blank)
      );
    }
  }

  // Also estimate subject-level baseline correct context when topic-level correct isn't explicitly entered
  const subjectOverallAccuracy = new Map<SubjectId, number>();
  for (const subj of LGS_SUBJECTS) {
    let c = 0;
    let total = 0;
    for (const ex of sortedExams) {
      const sr = ex.subjectResults.find((s) => s.subjectId === subj.id);
      if (sr) {
        c += sr.correct;
        total += sr.questionCount;
      }
    }
    subjectOverallAccuracy.set(subj.id, total > 0 ? c / total : 0.7);
  }

  const topicMetrics: TopicPatternMetrics[] = [];

  for (const entry of topicStatsMap.values()) {
    let totalWrongCount = 0;
    let totalBlankCount = 0;
    let totalCorrectCount = 0;
    const examsWithErrors = new Set<string>();
    let recent3ExamsErrorCount = 0;
    let firstSeenDate: string | null = null;
    let lastSeenDate: string | null = null;

    for (const [examId, w] of entry.wrongByExam.entries()) {
      totalWrongCount += w;
      if (w > 0) {
        examsWithErrors.add(examId);
        if (recent3ExamIds.has(examId)) recent3ExamsErrorCount += w;
      }
    }
    for (const [examId, b] of entry.blankByExam.entries()) {
      totalBlankCount += b;
      if (b > 0) {
        examsWithErrors.add(examId);
        if (recent3ExamIds.has(examId)) recent3ExamsErrorCount += b;
      }
    }
    for (const [, c] of entry.correctByExam.entries()) {
      totalCorrectCount += c;
    }

    // If user didn't enter explicit topic-level correct counts, infer estimated correct answers
    // from exams where the student answered the rest of the subject accurately
    if (totalCorrectCount === 0 && sortedExams.length > 0) {
      const subjTopicsCount = CURRICULUM_TOPICS.filter(
        (t) => t.subjectId === entry.subjectId
      ).length;
      const subjDef = SUBJECT_MAP[entry.subjectId];
      const estimatedQuestionsPerTopicAcrossExams = Math.max(
        totalWrongCount + totalBlankCount,
        Math.round(
          (sortedExams.length * subjDef.defaultQuestionCount) /
            Math.max(1, subjTopicsCount)
        )
      );
      const acc = subjectOverallAccuracy.get(entry.subjectId) || 0.7;
      totalCorrectCount = Math.max(
        0,
        Math.round(
          (estimatedQuestionsPerTopicAcrossExams -
            (totalWrongCount + totalBlankCount)) *
            acc
        )
      );
    }

    for (const exId of examsWithErrors) {
      const d = examDateMap.get(exId) || null;
      if (d) {
        if (!firstSeenDate || d < firstSeenDate) firstSeenDate = d;
        if (!lastSeenDate || d > lastSeenDate) lastSeenDate = d;
      }
    }
    for (const q of entry.questions) {
      const d = examDateMap.get(q.examId) || q.createdAt.slice(0, 10);
      if (!firstSeenDate || d < firstSeenDate) firstSeenDate = d;
      if (!lastSeenDate || d > lastSeenDate) lastSeenDate = d;
    }

    const totalErrorCount = totalWrongCount + totalBlankCount;
    const totalAnsweredCount = totalCorrectCount + totalWrongCount;
    const examsWithErrorsCount = examsWithErrors.size;

    const unsolvedQuestionsCount = entry.questions.filter(
      (q) =>
        q.learningStatus === 'unsolved' ||
        q.learningStatus === 'needs_topic_study'
    ).length;
    const independentMasteredCount = entry.questions.filter(
      (q) => q.learningStatus === 'mastered_independent'
    ).length;
    const helpedOnlyCount = entry.questions.filter(
      (q) => q.learningStatus === 'understood_with_help'
    ).length;

    // Questions where review was attempted, or topic was reviewed earlier, yet new errors appeared or still_cannot_solve
    const failedAfterReviewCount = entry.questions.filter(
      (q) =>
        q.attemptHistory.some((a) => a.outcome === 'still_cannot_solve') ||
        (q.attemptHistory.length > 0 &&
          q.learningStatus !== 'mastered_independent')
    ).length;

    // Count dominant error reasons
    const reasonCounter = new Map<ErrorReasonCode, number>();
    for (const q of entry.questions) {
      if (q.errorReason) {
        reasonCounter.set(
          q.errorReason,
          (reasonCounter.get(q.errorReason) || 0) + 1
        );
      }
    }
    const dominantErrorReasons = Array.from(reasonCounter.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    // Check if improved in recent exams:
    // Had errors in earlier exams, AND 0 errors in the latest exam(s) OR all questions mastered independently
    const latestExamId =
      sortedExams.length > 0 ? sortedExams[sortedExams.length - 1].id : null;
    const errorsInLatestExam = latestExamId
      ? (entry.wrongByExam.get(latestExamId) || 0) +
        (entry.blankByExam.get(latestExamId) || 0)
      : 0;

    // Section 10.4: Distinguish single-occurrence error vs recurring error!
    let trendStatus: TopicPatternMetrics['trendStatus'] = 'single_occurrence';
    if (totalErrorCount === 0) {
      trendStatus = 'insufficient_data';
    } else if (totalErrorCount === 1 && examsWithErrorsCount <= 1) {
      // Single question wrong/blank in a single exam -> DO NOT label as critical deficiency!
      trendStatus = 'single_occurrence';
    } else if (
      sortedExams.length >= 2 &&
      errorsInLatestExam === 0 &&
      recent3ExamsErrorCount === 0 &&
      totalErrorCount >= 2
    ) {
      trendStatus = 'improving';
    } else if (
      failedAfterReviewCount > 0 ||
      (independentMasteredCount > 0 && errorsInLatestExam > 0)
    ) {
      trendStatus = 'persisting_despite_review';
    } else if (examsWithErrorsCount >= 2 || totalErrorCount >= 3) {
      trendStatus = 'recurring_critical';
    } else if (errorsInLatestExam >= 2) {
      trendStatus = 'emerging_issue';
    } else {
      trendStatus =
        independentMasteredCount >= totalErrorCount
          ? 'improving'
          : 'single_occurrence';
    }

    // Calculate Priority Score (0..100) using PRIORITY_MODEL_WEIGHTS
    const accuracyRate =
      totalAnsweredCount + totalBlankCount > 0
        ? totalCorrectCount / (totalAnsweredCount + totalBlankCount)
        : 0.5;

    const conceptualReasonCount =
      (reasonCounter.get('konu_eksigi') || 0) +
      (reasonCounter.get('cozum_yontemi_bulamama') || 0) +
      (reasonCounter.get('bilgiyi_unutma') || 0);

    let rawScore =
      Math.min(44, totalWrongCount * PRIORITY_MODEL_WEIGHTS.wrongWeight) +
      Math.min(28, totalBlankCount * PRIORITY_MODEL_WEIGHTS.blankWeight) +
      Math.min(
        36,
        Math.max(0, examsWithErrorsCount - 1) *
          PRIORITY_MODEL_WEIGHTS.examRecurrenceWeight
      ) +
      (recent3ExamsErrorCount > 0
        ? PRIORITY_MODEL_WEIGHTS.recentExamBonus
        : 0) +
      Math.min(
        20,
        unsolvedQuestionsCount * PRIORITY_MODEL_WEIGHTS.unsolvedPenalty
      ) +
      Math.min(
        20,
        failedAfterReviewCount *
          PRIORITY_MODEL_WEIGHTS.failedAfterReviewPenalty
      ) +
      Math.min(
        18,
        conceptualReasonCount *
          PRIORITY_MODEL_WEIGHTS.conceptualErrorReasonBonus
      ) -
      Math.min(
        25,
        independentMasteredCount *
          PRIORITY_MODEL_WEIGHTS.independentMasteryDiscount
      ) -
      Math.round(
        accuracyRate * PRIORITY_MODEL_WEIGHTS.highAccuracyDiscountFactor
      );

    const topicDef = CURRICULUM_TOPIC_MAP[entry.topicId];
    if (topicDef) {
      rawScore = rawScore * (0.85 + (topicDef.importanceWeight - 1) * 0.4);
    }

    // Enforce Section 10.4 rule: Single wrong question must NEVER get a high/critical score
    if (trendStatus === 'single_occurrence') {
      rawScore = Math.min(28, Math.max(12, rawScore));
    } else if (trendStatus === 'improving') {
      rawScore = Math.min(35, Math.max(10, rawScore - 20));
    }

    const priorityScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    const confidenceLevel: TopicPatternMetrics['confidenceLevel'] =
      examsWithErrorsCount >= 2 || entry.questions.length >= 3
        ? 'high'
        : totalErrorCount >= 2
        ? 'medium'
        : 'low';

    // Build honest, data-backed explanation text (Section 10.3)
    const reasonSummary =
      dominantErrorReasons.length > 0
        ? ` En sık bildirilen hata nedeni: "${
            ERROR_REASON_MAP[dominantErrorReasons[0].reason]?.label ||
            dominantErrorReasons[0].reason
          }" (${dominantErrorReasons[0].count} soru).`
        : '';

    let explanationText = '';
    if (trendStatus === 'recurring_critical') {
      explanationText = `${entry.topicName} konusunda ${examsWithErrorsCount} farklı denemede toplam ${totalWrongCount} yanlış${
        totalBlankCount > 0 ? ` ve ${totalBlankCount} boş` : ''
      } kaydedildi.${reasonSummary} Konu tekrar eden hata alanı olarak işaretlendi. Öncelikli çalışma öneriliyor.`;
    } else if (trendStatus === 'persisting_despite_review') {
      explanationText = `${entry.topicName} konusunda daha önce tekrar çalışması yapılmış olmasına rağmen yeni sorularda veya tekrar denemelerinde hata devam ediyor (${totalWrongCount} yanlış, ${totalBlankCount} boş).${reasonSummary} Alt kazanımların temel konu anlatımıyla yeniden ele alınması önerilir.`;
    } else if (trendStatus === 'improving') {
      explanationText = `${entry.topicName} konusunda önceki denemelerde ${totalErrorCount} hata görülmüştü ancak son denemelerde ve tekrar çözümlerinde başarı sağlandı (${independentMasteredCount} soru yardımsız çözüldü).`;
    } else if (trendStatus === 'emerging_issue') {
      explanationText = `${entry.topicName} konusunda son denemede ${errorsInLatestExam} soru (${totalWrongCount} yanlış, ${totalBlankCount} boş) dikkat çekti.${reasonSummary} Erken müdahale için kısa tekrar önerilir.`;
    } else if (trendStatus === 'single_occurrence') {
      explanationText = `${entry.topicName} konusunda yalnızca 1 denemede ${totalErrorCount} hata (${totalWrongCount} yanlış, ${totalBlankCount} boş) kaydedildi.${reasonSummary} Tek seferlik hata olduğu için ciddi konu eksiği olarak etiketlenmedi.`;
    } else {
      explanationText = `${entry.topicName} konusunda yeterli hata verisi bulunmuyor.`;
    }

    topicMetrics.push({
      topicId: entry.topicId,
      subjectId: entry.subjectId,
      unitName: entry.unitName,
      topicName: entry.topicName,
      totalWrongCount,
      totalBlankCount,
      totalCorrectCount,
      totalAnsweredCount,
      examsWithErrorsCount,
      recent3ExamsErrorCount,
      unsolvedQuestionsCount,
      independentMasteredCount,
      helpedOnlyCount,
      failedAfterReviewCount,
      dominantErrorReasons,
      firstSeenDate,
      lastSeenDate,
      trendStatus,
      priorityScore,
      confidenceLevel,
      explanationText,
    });
  }

  topicMetrics.sort((a, b) => b.priorityScore - a.priorityScore);

  const recurringWrongTopics = topicMetrics.filter(
    (m) =>
      (m.trendStatus === 'recurring_critical' ||
        m.trendStatus === 'persisting_despite_review') &&
      m.totalWrongCount >= 2
  );

  const highBlankTopics = topicMetrics
    .filter((m) => m.totalBlankCount >= 2)
    .sort((a, b) => b.totalBlankCount - a.totalBlankCount);

  const improvedTopics = topicMetrics.filter(
    (m) =>
      m.trendStatus === 'improving' ||
      (m.independentMasteredCount > 0 &&
        m.independentMasteredCount >= m.unsolvedQuestionsCount)
  );

  const persistingInNewQuestionsTopics = topicMetrics.filter(
    (m) => m.examsWithErrorsCount >= 2 && m.recent3ExamsErrorCount >= 2
  );

  const persistingDespiteReviewTopics = topicMetrics.filter(
    (m) =>
      m.trendStatus === 'persisting_despite_review' ||
      m.failedAfterReviewCount > 0
  );

  const singleOccurrenceTopics = topicMetrics.filter(
    (m) => m.trendStatus === 'single_occurrence'
  );

  // Section 10.5: Error Reason Analysis across all questions
  const reasonStats = new Map<
    ErrorReasonCode,
    {
      count: number;
      subjects: Set<SubjectId>;
      topics: Set<string>;
    }
  >();

  let questionsWithReasonsCount = 0;
  for (const q of questions) {
    if (!q.errorReason) continue;
    questionsWithReasonsCount += 1;
    if (!reasonStats.has(q.errorReason)) {
      reasonStats.set(q.errorReason, {
        count: 0,
        subjects: new Set(),
        topics: new Set(),
      });
    }
    const st = reasonStats.get(q.errorReason)!;
    st.count += 1;
    st.subjects.add(q.subjectId);
    const resolved = resolveEffectiveTopic(q);
    if (resolved.topicId) st.topics.add(resolved.topicName);
  }

  const errorReasonDiagnostics: ErrorReasonDiagnostic[] = Array.from(
    reasonStats.entries()
  )
    .map(([code, st]) => {
      const def = ERROR_REASON_MAP[code];
      const topicsArr = Array.from(st.topics);
      const subjectsArr = Array.from(st.subjects);

      let customRecommendation = def.recommendedAction;
      if (code === 'islem_hatasi' && st.count >= 2) {
        customRecommendation = `İşlem hatası ${topicsArr.length > 1 ? `${topicsArr.length} farklı konuda (${topicsArr.slice(0, 3).join(', ')})` : 'sorularda'} toplam ${st.count} kez tekrarlandı. Zihinden işlem yapmak yerine ara basamakları kâğıda yazma ve son adımda sağlama yapma egzersizi önerilir.`;
      } else if (code === 'sure_yetmedi' && st.count >= 2) {
        customRecommendation = `"Süre yetmedi" nedeni ${st.count} soruda bildirildi. Turlama tekniği ve kronometreli 20'şer soruluk branş denemeleri ile süre yönetimi çalışması önerilir.`;
      } else if (code === 'konu_eksigi' && topicsArr.length > 0) {
        customRecommendation = `"Konu eksiği" özellikle ${topicsArr.slice(0, 3).join(', ')} alanında (${st.count} soru) yoğunlaşıyor. Yeni nesil testlere geçmeden önce bu konunun temel kazanım özetini ve çözümlü örneklerini tamamlayın.`;
      }

      return {
        reasonCode: code,
        label: def.label,
        count: st.count,
        percentage:
          questionsWithReasonsCount > 0
            ? Math.round((st.count / questionsWithReasonsCount) * 100)
            : 0,
        affectedSubjects: subjectsArr,
        affectedTopics: topicsArr,
        strategicRecommendation: customRecommendation,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Question 7 of Section 10.3: "Hangi derslerde net artarken belirli konularda hata devam ediyor?"
  const subjectsRisingButTopicPersisting: SubjectRisingTopicPersistingInsight[] =
    [];
  if (sortedExams.length >= 2) {
    const latestExam = sortedExams[sortedExams.length - 1];
    const earlierExams = sortedExams.slice(0, -1);

    for (const subj of LGS_SUBJECTS) {
      const latestSr = latestExam.subjectResults.find(
        (s) => s.subjectId === subj.id
      );
      if (!latestSr) continue;

      const earlierNets = earlierExams
        .map((e) => e.subjectResults.find((s) => s.subjectId === subj.id)?.net)
        .filter((n): n is number => typeof n === 'number');

      if (earlierNets.length === 0) continue;
      const prevAvg =
        earlierNets.reduce((a, b) => a + b, 0) / earlierNets.length;
      const netGain = Number((latestSr.net - prevAvg).toFixed(2));

      if (netGain >= 0.5) {
        // Find if any recurring topic in this subject still had errors in the latest exam
        const latestQuestionsInSubj = questions.filter(
          (q) => q.examId === latestExam.id && q.subjectId === subj.id
        );
        const persistingTopic = recurringWrongTopics.find(
          (tm) =>
            tm.subjectId === subj.id &&
            (latestQuestionsInSubj.some(
              (q) => resolveEffectiveTopic(q).topicId === tm.topicId
            ) ||
              (latestSr.topicBreakdown || []).some(
                (tb) => tb.topicId === tm.topicId && tb.wrong + tb.blank > 0
              ))
        );

        if (persistingTopic) {
          subjectsRisingButTopicPersisting.push({
            subjectId: subj.id,
            subjectName: subj.name,
            previousAvgNet: Number(prevAvg.toFixed(2)),
            latestNet: latestSr.net,
            netGain,
            persistingTopicName: persistingTopic.topicName,
            persistingTopicErrorsInLatest:
              persistingTopic.recent3ExamsErrorCount,
            message: `${subj.name} dersinde genel netiniz ${prevAvg.toFixed(2)} ortalamadan ${latestSr.net.toFixed(2)} nete (+${netGain.toFixed(2)}) yükseldi; ancak "${persistingTopic.topicName}" konusundaki hata örüntüsü devam ediyor.`,
          });
        }
      }
    }
  }

  // Build top narrative insights grounded strictly in real records
  const narrativeInsights: string[] = [];
  if (recurringWrongTopics.length > 0) {
    narrativeInsights.push(recurringWrongTopics[0].explanationText);
  }
  if (persistingDespiteReviewTopics.length > 0) {
    const p = persistingDespiteReviewTopics[0];
    if (p.topicId !== recurringWrongTopics[0]?.topicId) {
      narrativeInsights.push(p.explanationText);
    }
  }
  if (errorReasonDiagnostics.length > 0 && errorReasonDiagnostics[0].count >= 2) {
    narrativeInsights.push(errorReasonDiagnostics[0].strategicRecommendation);
  }
  if (subjectsRisingButTopicPersisting.length > 0) {
    narrativeInsights.push(subjectsRisingButTopicPersisting[0].message);
  }
  if (improvedTopics.length > 0) {
    narrativeInsights.push(improvedTopics[0].explanationText);
  }

  return {
    hasData: true,
    totalExamsCount: sortedExams.length,
    totalQuestionsLogged: questions.length,
    topicMetrics,
    recurringWrongTopics,
    highBlankTopics,
    improvedTopics,
    persistingInNewQuestionsTopics,
    persistingDespiteReviewTopics,
    singleOccurrenceTopics,
    errorReasonDiagnostics,
    subjectsRisingButTopicPersisting,
    narrativeInsights,
  };
}

/**
 * Smart Spaced Repetition Scheduling Engine (Section 12)
 */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const base = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function processQuestionReviewOutcome(
  question: QuestionRecord,
  outcome: ReviewOutcome,
  note: string,
  reviewIntervals: [number, number, number, number] = [0, 1, 3, 7],
  referenceDateStr: string = getTodayDateStr()
): {
  updatedQuestion: QuestionRecord;
  attemptLog: QuestionAttemptLog;
} {
  const previousStage = question.reviewStage || 0;
  let newStage = previousStage;
  let learningStatus = question.learningStatus;
  let daysUntilNext = 1;

  if (outcome === 'solved_independently') {
    // Yardımsız doğru çözüm öğrenme ilerlemesi olarak kaydedilir!
    learningStatus = 'mastered_independent';
    newStage = Math.min(4, previousStage + 1);
    if (newStage === 1) daysUntilNext = reviewIntervals[1] ?? 1;
    else if (newStage === 2) daysUntilNext = reviewIntervals[2] ?? 3;
    else if (newStage === 3) daysUntilNext = reviewIntervals[3] ?? 7;
    else daysUntilNext = 14;
  } else if (outcome === 'solved_with_hint') {
    // İpucuyla çözüm bağımsız çözümle aynı kabul edilmez!
    learningStatus = 'understood_with_help';
    newStage = Math.max(1, previousStage);
    daysUntilNext = Math.max(1, reviewIntervals[1] ?? 1);
  } else if (outcome === 'understood_after_solution') {
    // Çözümü gördükten sonra anlamak bağımsız çözümle aynı kabul edilmez!
    learningStatus = 'understood_with_help';
    newStage = 1;
    daysUntilNext = Math.max(1, reviewIntervals[1] ?? 1);
  } else {
    // Hâlâ çözemiyorum -> Konu çalışma listesine alınır!
    learningStatus = 'needs_topic_study';
    newStage = 0;
    daysUntilNext = 0; // Due immediately / today for topic study
  }

  const nextScheduledDate = addDaysToDateStr(referenceDateStr, daysUntilNext);
  const nowIso = new Date().toISOString();

  const attemptLog: QuestionAttemptLog = {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    questionId: question.id,
    studentId: question.studentId,
    attemptedAt: nowIso,
    outcome,
    note: note.trim() || undefined,
    previousStage,
    newStage,
    nextScheduledDate,
  };

  const updatedQuestion: QuestionRecord = {
    ...question,
    learningStatus,
    reviewStage: newStage,
    lastReviewedAt: nowIso,
    nextReviewDate: nextScheduledDate,
    attemptHistory: [...(question.attemptHistory || []), attemptLog],
    updatedAt: nowIso,
  };

  return { updatedQuestion, attemptLog };
}

export function getReviewTasksForStudent(
  questions: QuestionRecord[],
  exams: ExamRecord[],
  todayStr: string = getTodayDateStr()
): ReviewTask[] {
  const examNameMap = new Map(exams.map((e) => [e.id, e.name]));

  const tasks: ReviewTask[] = questions
    .filter((q) => q.reviewStage < 4)
    .map((q) => {
      const resolved = resolveEffectiveTopic(q);
      const scheduledDate = q.nextReviewDate || q.createdAt.slice(0, 10);
      const diffMs =
        new Date(`${todayStr}T12:00:00`).getTime() -
        new Date(`${scheduledDate}T12:00:00`).getTime();
      const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      return {
        questionId: q.id,
        studentId: q.studentId,
        examId: q.examId,
        examName: examNameMap.get(q.examId) || 'Deneme Sınavı',
        subjectId: q.subjectId,
        topicId: resolved.topicId,
        topicName: resolved.topicName,
        status: q.status,
        learningStatus: q.learningStatus,
        reviewStage: q.reviewStage,
        scheduledDate,
        daysOverdue,
        isDueTodayOrOverdue: scheduledDate <= todayStr,
      };
    });

  return tasks.sort((a, b) => {
    if (a.isDueTodayOrOverdue !== b.isDueTodayOrOverdue) {
      return a.isDueTodayOrOverdue ? -1 : 1;
    }
    if (a.learningStatus === 'needs_topic_study' && b.learningStatus !== 'needs_topic_study') {
      return -1;
    }
    return a.scheduledDate.localeCompare(b.scheduledDate);
  });
}

/**
 * Personalized Weekly Study Plan Generator (Section 13)
 * Follows the exact 5-tier priority hierarchy and adapts to the student's weekly study hours.
 */
export function generatePersonalizedStudyPlan(
  student: StudentProfile,
  exams: ExamRecord[],
  questions: QuestionRecord[],
  existingPlan?: WeeklyStudyPlan | null
): WeeklyStudyPlan {
  const patternReport = analyzeRecurringPatterns(exams, questions);
  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const weekStartDate = monday.toISOString().slice(0, 10);

  const weeklyMinutesBudget = Math.max(
    180,
    Math.round((student.weeklyStudyHours || 12) * 60)
  );

  // Build candidate study items according to the 5 priority tiers in Section 13:
  // Tier 1: Birden fazla denemede tekrar eden temel konu eksikleri
  // Tier 2: Tekrar edildiği hâlde hâlâ çözülemeyen sorular
  // Tier 3: Son denemelerde belirgin biçimde kötüleşen dersler
  // Tier 4: Çok sayıda boş bırakılan ve nedeni belirlenmiş soru grupları
  // Tier 5: Öğrencinin hedeflerine ulaşması için gerekli diğer çalışmalar

  interface CandidateStudyBlock {
    subjectId: SubjectId;
    topicId: string | null;
    topicName: string;
    priorityTier: 1 | 2 | 3 | 4 | 5;
    priorityReason: string;
    recommendedMinutes: number;
    targetQuestionCount: number;
    reviewQuestionIds: string[];
  }

  const candidates: CandidateStudyBlock[] = [];
  const usedTopicIds = new Set<string>();

  // TIER 1: Recurring critical topic deficiencies across multiple exams
  for (const tm of patternReport.recurringWrongTopics) {
    const relatedQs = questions
      .filter(
        (q) =>
          resolveEffectiveTopic(q).topicId === tm.topicId &&
          q.learningStatus !== 'mastered_independent'
      )
      .map((q) => q.id);

    candidates.push({
      subjectId: tm.subjectId,
      topicId: tm.topicId,
      topicName: tm.topicName,
      priorityTier: 1,
      priorityReason: `${tm.topicName} konusu ${tm.examsWithErrorsCount} farklı denemede tekrar eden hata alanı (${tm.totalWrongCount} yanlış, ${tm.totalBlankCount} boş) olduğu için 1. öncelikli çalışma konusudur.`,
      recommendedMinutes: 60,
      targetQuestionCount: 25,
      reviewQuestionIds: relatedQs,
    });
    usedTopicIds.add(tm.topicId);
  }

  // TIER 2: Questions that still cannot be solved despite review
  for (const tm of patternReport.persistingDespiteReviewTopics) {
    if (usedTopicIds.has(tm.topicId)) continue;
    const relatedQs = questions
      .filter(
        (q) =>
          resolveEffectiveTopic(q).topicId === tm.topicId &&
          q.learningStatus !== 'mastered_independent'
      )
      .map((q) => q.id);

    candidates.push({
      subjectId: tm.subjectId,
      topicId: tm.topicId,
      topicName: tm.topicName,
      priorityTier: 2,
      priorityReason: `${tm.topicName} konusunda tekrar çalışması yapıldığı hâlde çözülemeyen veya hatası süren sorular bulunduğu için 2. öncelikli olarak programa alındı.`,
      recommendedMinutes: 50,
      targetQuestionCount: 20,
      reviewQuestionIds: relatedQs,
    });
    usedTopicIds.add(tm.topicId);
  }

  // Also check individual unsolved questions without a recurring topic yet
  const unmasteredQuestions = questions.filter(
    (q) =>
      q.learningStatus === 'needs_topic_study' ||
      q.learningStatus === 'unsolved'
  );
  for (const q of unmasteredQuestions) {
    const resolved = resolveEffectiveTopic(q);
    if (resolved.topicId && !usedTopicIds.has(resolved.topicId)) {
      const sameTopicQs = unmasteredQuestions.filter(
        (oq) => resolveEffectiveTopic(oq).topicId === resolved.topicId
      );
      candidates.push({
        subjectId: q.subjectId,
        topicId: resolved.topicId,
        topicName: resolved.topicName,
        priorityTier: 2,
        priorityReason: `Yanlış defterinde bu konuya ait henüz bağımsız çözülememiş ${sameTopicQs.length} soru bulunduğu için tekrar listesine eklendi.`,
        recommendedMinutes: 45,
        targetQuestionCount: 18,
        reviewQuestionIds: sameTopicQs.map((oq) => oq.id),
      });
      usedTopicIds.add(resolved.topicId);
    }
  }

  // TIER 3: Subjects that significantly worsened in recent exams
  if (sortedExams.length >= 2) {
    const latest = sortedExams[sortedExams.length - 1];
    const prev = sortedExams[sortedExams.length - 2];
    for (const sr of latest.subjectResults) {
      const prevSr = prev.subjectResults.find(
        (p) => p.subjectId === sr.subjectId
      );
      if (prevSr && prevSr.net - sr.net >= 1.5) {
        const drop = (prevSr.net - sr.net).toFixed(2);
        const subjDef = SUBJECT_MAP[sr.subjectId];
        const fallbackTopic = CURRICULUM_TOPICS.find(
          (t) => t.subjectId === sr.subjectId && !usedTopicIds.has(t.id)
        );
        if (fallbackTopic) {
          candidates.push({
            subjectId: sr.subjectId,
            topicId: fallbackTopic.id,
            topicName: `${subjDef.name} – ${fallbackTopic.topicName}`,
            priorityTier: 3,
            priorityReason: `Son denemede ${subjDef.name} neti bir önceki denemeye göre ${drop} net düştüğü (${prevSr.net.toFixed(2)} → ${sr.net.toFixed(2)}) için 3. öncelikli dengeleme çalışması olarak eklendi.`,
            recommendedMinutes: 50,
            targetQuestionCount: 20,
            reviewQuestionIds: [],
          });
          usedTopicIds.add(fallbackTopic.id);
        }
      }
    }
  }

  // TIER 4: High-blank topic groups and identified error reasons
  for (const tm of patternReport.highBlankTopics) {
    if (usedTopicIds.has(tm.topicId)) continue;
    const relatedQs = questions
      .filter(
        (q) =>
          resolveEffectiveTopic(q).topicId === tm.topicId &&
          q.status === 'blank'
      )
      .map((q) => q.id);
    const reasonLabel =
      tm.dominantErrorReasons.length > 0
        ? ` (Başlıca neden: ${ERROR_REASON_MAP[tm.dominantErrorReasons[0].reason]?.label})`
        : '';

    candidates.push({
      subjectId: tm.subjectId,
      topicId: tm.topicId,
      topicName: tm.topicName,
      priorityTier: 4,
      priorityReason: `${tm.topicName} konusunda toplam ${tm.totalBlankCount} soru boş bırakıldığı için${reasonLabel} 4. öncelikli soru çözüm pratiği olarak planlandı.`,
      recommendedMinutes: 45,
      targetQuestionCount: 20,
      reviewQuestionIds: relatedQs,
    });
    usedTopicIds.add(tm.topicId);
  }

  // TIER 5: Target percentile & high-coefficient LGS core subjects reinforcement
  const coreOrder: SubjectId[] = [
    'matematik',
    'fen',
    'turkce',
    'inkilap',
    'ingilizce',
    'din',
  ];
  for (const subjId of coreOrder) {
    const subjTopics = CURRICULUM_TOPICS.filter(
      (t) => t.subjectId === subjId && !usedTopicIds.has(t.id)
    );
    for (const st of subjTopics.slice(0, 2)) {
      candidates.push({
        subjectId: subjId,
        topicId: st.id,
        topicName: st.topicName,
        priorityTier: 5,
        priorityReason:
          exams.length === 0
            ? `Henüz deneme kaydı girilmediği için %${student.targetPercentile} yüzdelik dilim hedefine yönelik temel LGS kazanım çalışması olarak önerildi.`
            : `Hedeflenen %${student.targetPercentile} yüzdelik dilime ulaşmak ve ${SUBJECT_MAP[subjId].name} net istikrarını korumak için 5. öncelikli pekiştirme çalışması.`,
        recommendedMinutes: 40,
        targetQuestionCount: 20,
        reviewQuestionIds: [],
      });
      usedTopicIds.add(st.id);
    }
  }

  // Preserve completion state of tasks from existingPlan if regenerating for the same week
  const previousCompletionMap = new Map<string, { completed: boolean; completedAt?: string | null }>();
  if (existingPlan && existingPlan.weekStartDate === weekStartDate) {
    for (const t of existingPlan.tasks) {
      if (t.completed) {
        previousCompletionMap.set(`${t.dayOfWeek}__${t.topicName}`, {
          completed: true,
          completedAt: t.completedAt,
        });
      }
    }
  }

  const dayNames = [
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
    'Pazar',
  ];

  const tasks: StudyPlanTask[] = [];
  let accumulatedMinutes = 0;
  let candidateIdx = 0;

  // Distribute across 7 days respecting the student's weekly time budget
  while (
    accumulatedMinutes < weeklyMinutesBudget &&
    candidateIdx < candidates.length &&
    tasks.length < 14
  ) {
    const c = candidates[candidateIdx];
    const dayOfWeek = (tasks.length % 7) + 1;
    const dayName = dayNames[dayOfWeek - 1];
    const duration = Math.min(
      c.recommendedMinutes,
      Math.max(30, weeklyMinutesBudget - accumulatedMinutes)
    );

    const prevKey = `${dayOfWeek}__${c.topicName}`;
    const prevState = previousCompletionMap.get(prevKey);

    tasks.push({
      id: `task-${weekStartDate}-${tasks.length + 1}`,
      studentId: student.id,
      weekStartDate,
      dayOfWeek,
      dayName,
      subjectId: c.subjectId,
      topicId: c.topicId,
      topicName: c.topicName,
      priorityTier: c.priorityTier,
      priorityReason: c.priorityReason,
      durationMinutes: duration,
      targetQuestionCount: c.targetQuestionCount,
      reviewQuestionIds: c.reviewQuestionIds,
      completed: prevState?.completed ?? false,
      completedAt: prevState?.completedAt ?? null,
    });

    accumulatedMinutes += duration;
    candidateIdx += 1;
  }

  tasks.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.priorityTier - b.priorityTier);

  const totalPlannedMinutes = tasks.reduce((s, t) => s + t.durationMinutes, 0);
  const totalCompletedMinutes = tasks
    .filter((t) => t.completed)
    .reduce((s, t) => s + t.durationMinutes, 0);
  const completionPct =
    totalPlannedMinutes > 0
      ? Math.round((totalCompletedMinutes / totalPlannedMinutes) * 100)
      : 0;

  const improvedNames = patternReport.improvedTopics
    .slice(0, 3)
    .map((t) => t.topicName);

  const weeklySummaryReport =
    tasks.length === 0
      ? 'Haftalık çalışma planı için veri bekleniyor.'
      : `Bu hafta toplam ${Math.round((totalPlannedMinutes / 60) * 10) / 10} saat (${tasks.length} görev) planlandı; şu ana kadar %${completionPct} tamamlandı.${
          improvedNames.length > 0
            ? ` Gelişme görülen konular: ${improvedNames.join(', ')}.`
            : ''
        }`;

  return {
    id: `plan-${student.id}-${weekStartDate}`,
    studentId: student.id,
    weekStartDate,
    generatedAt: new Date().toISOString(),
    totalPlannedMinutes,
    totalCompletedMinutes,
    tasks,
    weeklySummaryReport,
  };
}
