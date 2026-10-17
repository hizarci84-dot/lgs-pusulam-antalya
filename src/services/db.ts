import { openDB, IDBPDatabase } from 'idb';
import { ANTALYA_SCHOOL_PROGRAMS } from '../data/antalyaSchools';
import {
  AntalyaSchoolProgram,
  CloudSyncSettings,
  DeletedEntityRecord,
  ExamRecord,
  QuestionPhotoAsset,
  QuestionRecord,
  StudentProfile,
  WeeklyStudyPlan,
} from '../types/models';

const DB_NAME = 'lgs-pusulam-antalya-db';
const DB_VERSION = 2;

export interface FullBackupPayload {
  appName: 'Atakan LGS Pusulam';
  schemaVersion: number;
  exportedAt: string;
  activeStudentId: string | null;
  students: StudentProfile[];
  exams: ExamRecord[];
  questions: QuestionRecord[];
  photoAssets: QuestionPhotoAsset[];
  studyPlans: WeeklyStudyPlan[];
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('students')) {
          db.createObjectStore('students', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('exams')) {
          const examStore = db.createObjectStore('exams', { keyPath: 'id' });
          examStore.createIndex('by-student', 'studentId');
          examStore.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('questions')) {
          const qStore = db.createObjectStore('questions', { keyPath: 'id' });
          qStore.createIndex('by-student', 'studentId');
          qStore.createIndex('by-exam', 'examId');
        }
        // Dedicated object store for binary/base64 question photos, strictly isolated from school data and metadata
        if (!db.objectStoreNames.contains('photoAssets')) {
          const pStore = db.createObjectStore('photoAssets', { keyPath: 'id' });
          pStore.createIndex('by-student', 'studentId');
          pStore.createIndex('by-exam', 'examId');
          pStore.createIndex('by-question', 'questionId');
        }
        if (!db.objectStoreNames.contains('studyPlans')) {
          const spStore = db.createObjectStore('studyPlans', { keyPath: 'id' });
          spStore.createIndex('by-student', 'studentId');
        }
        // Dedicated object store for Antalya High School records
        if (!db.objectStoreNames.contains('schoolPrograms')) {
          db.createObjectStore('schoolPrograms', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('appSettings')) {
          db.createObjectStore('appSettings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('deletedEntities')) {
          db.createObjectStore('deletedEntities', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// ==================== APP SETTINGS & CLOUD SYNC ====================
export const DEFAULT_CLOUD_SYNC_SETTINGS: CloudSyncSettings = {
  enabled: true,
  provider: 'google_script',
  familySyncId: 'atakan-lgs-2026',
  familySecretPin: '',
  firebaseConfig: null,
  googleScriptUrl:
    'https://script.google.com/macros/s/AKfycbzF7Fon8QOOEaodXypOF1hnKMxbp2NhC4S-p5Lw7At83E8JAIK-1tsMqVOF0WsPIDHq/exec',
  autoSync: true,
  lastSyncedAt: null,
  lastSyncStatus: 'idle',
  lastSyncMessage: null,
};

export async function getActiveStudentId(): Promise<string | null> {
  const db = await getDb();
  const entry = await db.get('appSettings', 'activeStudentId');
  return entry?.value ?? null;
}

export async function setActiveStudentId(studentId: string | null): Promise<void> {
  const db = await getDb();
  await db.put('appSettings', { key: 'activeStudentId', value: studentId });
}

export async function getCloudSyncSettings(): Promise<CloudSyncSettings> {
  const db = await getDb();
  const entry = await db.get('appSettings', 'cloudSyncSettings');
  return entry?.value ? { ...DEFAULT_CLOUD_SYNC_SETTINGS, ...entry.value } : DEFAULT_CLOUD_SYNC_SETTINGS;
}

export async function saveCloudSyncSettings(settings: Partial<CloudSyncSettings>): Promise<CloudSyncSettings> {
  const current = await getCloudSyncSettings();
  const updated: CloudSyncSettings = { ...current, ...settings };
  const db = await getDb();
  await db.put('appSettings', { key: 'cloudSyncSettings', value: updated });
  return updated;
}

export async function recordDeletion(id: string, entityType: DeletedEntityRecord['entityType']): Promise<void> {
  const db = await getDb();
  await db.put('deletedEntities', {
    id,
    entityType,
    deletedAt: new Date().toISOString(),
  });
}

export async function getPendingDeletions(): Promise<DeletedEntityRecord[]> {
  const db = await getDb();
  return db.getAll('deletedEntities');
}

export async function clearPendingDeletions(ids?: string[]): Promise<void> {
  const db = await getDb();
  if (!ids || ids.length === 0) {
    await db.clear('deletedEntities');
    return;
  }
  const tx = db.transaction('deletedEntities', 'readwrite');
  for (const id of ids) {
    await tx.objectStore('deletedEntities').delete(id);
  }
  await tx.done;
}

// ==================== STUDENT PROFILES ====================
export async function getAllStudents(): Promise<StudentProfile[]> {
  const db = await getDb();
  const list = await db.getAll('students');
  return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  const db = await getDb();
  await db.put('students', {
    ...profile,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteStudentAndAllData(studentId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    ['students', 'exams', 'questions', 'photoAssets', 'studyPlans', 'deletedEntities'],
    'readwrite'
  );

  await tx.objectStore('students').delete(studentId);
  await tx.objectStore('deletedEntities').put({ id: studentId, entityType: 'student', deletedAt: new Date().toISOString() });

  const exams = await tx.objectStore('exams').index('by-student').getAllKeys(studentId);
  for (const k of exams) {
    await tx.objectStore('exams').delete(k);
    await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'exam', deletedAt: new Date().toISOString() });
  }

  const questions = await tx.objectStore('questions').index('by-student').getAllKeys(studentId);
  for (const k of questions) {
    await tx.objectStore('questions').delete(k);
    await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'question', deletedAt: new Date().toISOString() });
  }

  const photos = await tx.objectStore('photoAssets').index('by-student').getAllKeys(studentId);
  for (const k of photos) {
    await tx.objectStore('photoAssets').delete(k);
    await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'photo', deletedAt: new Date().toISOString() });
  }

  const plans = await tx.objectStore('studyPlans').index('by-student').getAllKeys(studentId);
  for (const k of plans) {
    await tx.objectStore('studyPlans').delete(k);
    await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'studyPlan', deletedAt: new Date().toISOString() });
  }

  await tx.done;
}

// ==================== EXAMS ====================
export async function getExamsByStudent(studentId: string): Promise<ExamRecord[]> {
  const db = await getDb();
  const list: ExamRecord[] = await db.getAllFromIndex('exams', 'by-student', studentId);
  return list.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export async function saveExamRecord(exam: ExamRecord): Promise<void> {
  if (!exam.studentId) {
    throw new Error('Deneme kaydı geçerli bir öğrenci profiline bağlı olmalıdır.');
  }
  const db = await getDb();
  await db.put('exams', {
    ...exam,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteExamRecord(examId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['exams', 'questions', 'photoAssets', 'deletedEntities'], 'readwrite');
  await tx.objectStore('exams').delete(examId);
  await tx.objectStore('deletedEntities').put({ id: examId, entityType: 'exam', deletedAt: new Date().toISOString() });

  const qKeys = await tx.objectStore('questions').index('by-exam').getAllKeys(examId);
  for (const k of qKeys) {
    await tx.objectStore('questions').delete(k);
    await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'question', deletedAt: new Date().toISOString() });
  }

  const pKeys = await tx.objectStore('photoAssets').index('by-exam').getAllKeys(examId);
  for (const k of pKeys) {
    await tx.objectStore('photoAssets').delete(k);
    await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'photo', deletedAt: new Date().toISOString() });
  }

  await tx.done;
}

// ==================== QUESTIONS & PHOTOS ====================
export async function getQuestionsByStudent(studentId: string): Promise<QuestionRecord[]> {
  const db = await getDb();
  const list: QuestionRecord[] = await db.getAllFromIndex('questions', 'by-student', studentId);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getQuestionsByExam(examId: string): Promise<QuestionRecord[]> {
  const db = await getDb();
  const list: QuestionRecord[] = await db.getAllFromIndex('questions', 'by-exam', examId);
  return list.sort((a, b) => (a.questionNumber || 99) - (b.questionNumber || 99));
}

export async function saveQuestionRecord(question: QuestionRecord): Promise<void> {
  if (!question.studentId || !question.examId) {
    throw new Error('Soru kaydı öğrenci profili ve deneme sınavı ile ilişkili olmalıdır.');
  }
  const db = await getDb();
  await db.put('questions', {
    ...question,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteQuestionRecord(questionId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['questions', 'photoAssets', 'deletedEntities'], 'readwrite');
  await tx.objectStore('questions').delete(questionId);
  await tx.objectStore('deletedEntities').put({ id: questionId, entityType: 'question', deletedAt: new Date().toISOString() });

  const pKeys = await tx.objectStore('photoAssets').index('by-question').getAllKeys(questionId);
  for (const k of pKeys) {
    await tx.objectStore('photoAssets').delete(k);
    await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'photo', deletedAt: new Date().toISOString() });
  }
  await tx.done;
}

export async function savePhotoAsset(asset: QuestionPhotoAsset): Promise<void> {
  if (!asset.studentId || !asset.examId || !asset.questionId) {
    throw new Error('Fotoğraf kaydı öğrenci, deneme ve soru kimliğine bağlı olmalıdır.');
  }
  const db = await getDb();
  await db.put('photoAssets', asset);
}

export async function getPhotoAssetById(photoId: string): Promise<QuestionPhotoAsset | undefined> {
  const db = await getDb();
  return db.get('photoAssets', photoId);
}

export async function getPhotoAssetsByStudent(studentId: string): Promise<QuestionPhotoAsset[]> {
  const db = await getDb();
  return db.getAllFromIndex('photoAssets', 'by-student', studentId);
}

export async function getPhotoAssetsByQuestion(questionId: string): Promise<QuestionPhotoAsset[]> {
  const db = await getDb();
  return db.getAllFromIndex('photoAssets', 'by-question', questionId);
}

export async function deletePhotoAsset(photoId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['photoAssets', 'deletedEntities'], 'readwrite');
  await tx.objectStore('photoAssets').delete(photoId);
  await tx.objectStore('deletedEntities').put({ id: photoId, entityType: 'photo', deletedAt: new Date().toISOString() });
  await tx.done;
}

// ==================== STUDY PLANS ====================
export async function getStudyPlanByStudent(studentId: string): Promise<WeeklyStudyPlan | null> {
  const db = await getDb();
  const plans: WeeklyStudyPlan[] = await db.getAllFromIndex('studyPlans', 'by-student', studentId);
  if (plans.length === 0) return null;
  plans.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  return plans[0];
}

export async function saveStudyPlan(plan: WeeklyStudyPlan): Promise<void> {
  const db = await getDb();
  await db.put('studyPlans', plan);
}

// ==================== ANTALYA SCHOOL PROGRAMS ====================
export async function getOrSeedSchoolPrograms(): Promise<AntalyaSchoolProgram[]> {
  const db = await getDb();
  const existing: AntalyaSchoolProgram[] = await db.getAll('schoolPrograms');
  if (existing.length < ANTALYA_SCHOOL_PROGRAMS.length) {
    const tx = db.transaction('schoolPrograms', 'readwrite');
    for (const s of ANTALYA_SCHOOL_PROGRAMS) {
      await tx.store.put(s);
    }
    await tx.done;
    return ANTALYA_SCHOOL_PROGRAMS;
  }
  return existing;
}

// ==================== BACKUP, RESTORE & CLEAR ====================
export async function exportFullBackup(): Promise<FullBackupPayload> {
  const db = await getDb();
  const activeStudentId = await getActiveStudentId();
  const [students, exams, questions, photoAssets, studyPlans] = await Promise.all([
    db.getAll('students'),
    db.getAll('exams'),
    db.getAll('questions'),
    db.getAll('photoAssets'),
    db.getAll('studyPlans'),
  ]);

  return {
    appName: 'Atakan LGS Pusulam',
    schemaVersion: DB_VERSION,
    exportedAt: new Date().toISOString(),
    activeStudentId,
    students,
    exams,
    questions,
    photoAssets,
    studyPlans,
  };
}

export async function restoreFromBackup(payload: FullBackupPayload): Promise<{
  studentsRestored: number;
  examsRestored: number;
  questionsRestored: number;
  photosRestored: number;
}> {
  if (!payload || !Array.isArray(payload.students) || !Array.isArray(payload.exams)) {
    throw new Error('Geçersiz yedekleme dosyası formatı.');
  }

  const db = await getDb();
  const tx = db.transaction(
    ['students', 'exams', 'questions', 'photoAssets', 'studyPlans', 'appSettings'],
    'readwrite'
  );

  for (const s of payload.students) {
    await tx.objectStore('students').put(s);
  }
  for (const e of payload.exams) {
    await tx.objectStore('exams').put(e);
  }
  for (const q of payload.questions || []) {
    await tx.objectStore('questions').put(q);
  }
  for (const p of payload.photoAssets || []) {
    await tx.objectStore('photoAssets').put(p);
  }
  for (const sp of payload.studyPlans || []) {
    await tx.objectStore('studyPlans').put(sp);
  }
  if (payload.activeStudentId) {
    await tx
      .objectStore('appSettings')
      .put({ key: 'activeStudentId', value: payload.activeStudentId });
  } else if (payload.students.length > 0) {
    await tx
      .objectStore('appSettings')
      .put({ key: 'activeStudentId', value: payload.students[0].id });
  }

  await tx.done;

  return {
    studentsRestored: payload.students.length,
    examsRestored: payload.exams.length,
    questionsRestored: (payload.questions || []).length,
    photosRestored: (payload.photoAssets || []).length,
  };
}

export async function clearAllUserData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    ['students', 'exams', 'questions', 'photoAssets', 'studyPlans', 'appSettings', 'deletedEntities'],
    'readwrite'
  );
  await tx.objectStore('students').clear();
  await tx.objectStore('exams').clear();
  await tx.objectStore('questions').clear();
  await tx.objectStore('photoAssets').clear();
  await tx.objectStore('studyPlans').clear();
  await tx.objectStore('appSettings').clear();
  await tx.objectStore('deletedEntities').clear();
  await tx.done;
}

export async function purgeAllDemoData(): Promise<{
  deletedStudents: number;
  deletedExams: number;
  deletedQuestions: number;
  deletedPhotos: number;
}> {
  const db = await getDb();
  const tx = db.transaction(
    ['students', 'exams', 'questions', 'photoAssets', 'studyPlans', 'appSettings', 'deletedEntities'],
    'readwrite'
  );
  const nowIso = new Date().toISOString();

  // 1. Find demo students
  const students: StudentProfile[] = await tx.objectStore('students').getAll();
  const demoStudentIds = new Set<string>();
  let deletedStudents = 0;

  for (const s of students) {
    const isDemoStu =
      s.isDemo ||
      s.id === 'demo-student-antalya-01' ||
      s.id.startsWith('demo-') ||
      (s.nickname && (s.nickname.includes('DEMO') || s.nickname.includes('Demo')));

    if (isDemoStu) {
      demoStudentIds.add(s.id);
      await tx.objectStore('students').delete(s.id);
      await tx.objectStore('deletedEntities').put({ id: s.id, entityType: 'student', deletedAt: nowIso });
      deletedStudents++;
    }
  }

  // 2. Find demo exams
  const exams: ExamRecord[] = await tx.objectStore('exams').getAll();
  const demoExamIds = new Set<string>();
  let deletedExams = 0;

  for (const e of exams) {
    const isDemoExam =
      e.isDemo ||
      e.id.startsWith('demo-') ||
      demoStudentIds.has(e.studentId) ||
      (e.name && (e.name.includes('DEMO') || e.name.includes('Demo'))) ||
      (e.publisher && (e.publisher.includes('DEMO') || e.publisher.includes('Demo')));

    if (isDemoExam) {
      demoExamIds.add(e.id);
      await tx.objectStore('exams').delete(e.id);
      await tx.objectStore('deletedEntities').put({ id: e.id, entityType: 'exam', deletedAt: nowIso });
      deletedExams++;
    }
  }

  // 3. Find demo questions
  const questions: QuestionRecord[] = await tx.objectStore('questions').getAll();
  let deletedQuestions = 0;

  for (const q of questions) {
    const isDemoQuestion =
      q.isDemo ||
      q.id.startsWith('demo-') ||
      demoStudentIds.has(q.studentId) ||
      demoExamIds.has(q.examId) ||
      (q.aiAnalysis?.extractedText && q.aiAnalysis.extractedText.includes('DEMO')) ||
      (q.studentNote && q.studentNote.includes('DEMO'));

    if (isDemoQuestion) {
      await tx.objectStore('questions').delete(q.id);
      await tx.objectStore('deletedEntities').put({ id: q.id, entityType: 'question', deletedAt: nowIso });
      deletedQuestions++;
    }
  }

  // 4. Find demo photos
  const photos: QuestionPhotoAsset[] = await tx.objectStore('photoAssets').getAll();
  let deletedPhotos = 0;

  for (const p of photos) {
    const isDemoPhoto =
      p.id.startsWith('demo-') ||
      demoStudentIds.has(p.studentId) ||
      demoExamIds.has(p.examId) ||
      (p.originalDataUrl && p.originalDataUrl.includes('DEMO'));

    if (isDemoPhoto) {
      await tx.objectStore('photoAssets').delete(p.id);
      await tx.objectStore('deletedEntities').put({ id: p.id, entityType: 'photo', deletedAt: nowIso });
      deletedPhotos++;
    }
  }

  // 5. Clean up any demo study plans
  const plans: WeeklyStudyPlan[] = await tx.objectStore('studyPlans').getAll();
  for (const pl of plans) {
    if (demoStudentIds.has(pl.studentId)) {
      await tx.objectStore('studyPlans').delete(pl.id);
      await tx.objectStore('deletedEntities').put({ id: pl.id, entityType: 'studyPlan', deletedAt: nowIso });
    }
  }

  // 6. If activeStudentId was a demo student, clear it
  const activeSetting = await tx.objectStore('appSettings').get('activeStudentId');
  if (activeSetting && demoStudentIds.has(activeSetting.value)) {
    await tx.objectStore('appSettings').delete('activeStudentId');
  }

  await tx.done;

  return {
    deletedStudents,
    deletedExams,
    deletedQuestions,
    deletedPhotos,
  };
}

export async function clearAllExamsAndQuestions(studentId?: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    ['exams', 'questions', 'photoAssets', 'deletedEntities'],
    'readwrite'
  );
  const nowIso = new Date().toISOString();

  if (studentId) {
    const exams = await tx.objectStore('exams').index('by-student').getAllKeys(studentId);
    for (const k of exams) {
      await tx.objectStore('exams').delete(k);
      await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'exam', deletedAt: nowIso });
    }
    const questions = await tx.objectStore('questions').index('by-student').getAllKeys(studentId);
    for (const k of questions) {
      await tx.objectStore('questions').delete(k);
      await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'question', deletedAt: nowIso });
    }
    const photos = await tx.objectStore('photoAssets').index('by-student').getAllKeys(studentId);
    for (const k of photos) {
      await tx.objectStore('photoAssets').delete(k);
      await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'photo', deletedAt: nowIso });
    }
  } else {
    const allExams = await tx.objectStore('exams').getAllKeys();
    for (const k of allExams) {
      await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'exam', deletedAt: nowIso });
    }
    await tx.objectStore('exams').clear();

    const allQ = await tx.objectStore('questions').getAllKeys();
    for (const k of allQ) {
      await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'question', deletedAt: nowIso });
    }
    await tx.objectStore('questions').clear();

    const allP = await tx.objectStore('photoAssets').getAllKeys();
    for (const k of allP) {
      await tx.objectStore('deletedEntities').put({ id: String(k), entityType: 'photo', deletedAt: nowIso });
    }
    await tx.objectStore('photoAssets').clear();
  }

  await tx.done;
}

// ==================== CLOUD SYNC DATA MERGING ====================
export interface CloudSyncDataPayload {
  students: StudentProfile[];
  exams: ExamRecord[];
  questions: QuestionRecord[];
  photoAssets: QuestionPhotoAsset[];
  studyPlans: WeeklyStudyPlan[];
  deletions: DeletedEntityRecord[];
}

export async function getAllDataForSync(sinceIso?: string | null): Promise<CloudSyncDataPayload> {
  const db = await getDb();
  const [students, exams, questions, photoAssets, studyPlans, deletions] = await Promise.all([
    db.getAll('students'),
    db.getAll('exams'),
    db.getAll('questions'),
    db.getAll('photoAssets'),
    db.getAll('studyPlans'),
    db.getAll('deletedEntities'),
  ]);

  if (!sinceIso) {
    return { students, exams, questions, photoAssets, studyPlans, deletions };
  }

  return {
    students: students.filter((s) => (s.updatedAt || s.createdAt) > sinceIso),
    exams: exams.filter((e) => (e.updatedAt || e.createdAt) > sinceIso),
    questions: questions.filter((q) => (q.updatedAt || q.createdAt) > sinceIso),
    photoAssets: photoAssets.filter((p) => p.createdAt > sinceIso),
    studyPlans: studyPlans.filter((sp) => sp.generatedAt > sinceIso),
    deletions: deletions.filter((d) => d.deletedAt > sinceIso),
  };
}

export async function mergeSyncPayload(remote: Partial<CloudSyncDataPayload>): Promise<{
  appliedStudents: number;
  appliedExams: number;
  appliedQuestions: number;
  appliedPhotos: number;
  appliedDeletions: number;
}> {
  const db = await getDb();
  const tx = db.transaction(
    ['students', 'exams', 'questions', 'photoAssets', 'studyPlans', 'deletedEntities'],
    'readwrite'
  );

  let appliedStudents = 0;
  let appliedExams = 0;
  let appliedQuestions = 0;
  let appliedPhotos = 0;
  let appliedDeletions = 0;

  // 1. Process deletions first
  for (const del of remote.deletions || []) {
    if (del.entityType === 'student') await tx.objectStore('students').delete(del.id);
    else if (del.entityType === 'exam') await tx.objectStore('exams').delete(del.id);
    else if (del.entityType === 'question') await tx.objectStore('questions').delete(del.id);
    else if (del.entityType === 'photo') await tx.objectStore('photoAssets').delete(del.id);
    else if (del.entityType === 'studyPlan') await tx.objectStore('studyPlans').delete(del.id);
    appliedDeletions++;
  }

  // 2. Merge students (Last-Write-Wins based on updatedAt)
  for (const s of remote.students || []) {
    const existing: StudentProfile | undefined = await tx.objectStore('students').get(s.id);
    if (!existing || (s.updatedAt || s.createdAt) > (existing.updatedAt || existing.createdAt)) {
      await tx.objectStore('students').put(s);
      appliedStudents++;
    }
  }

  // 3. Merge exams
  for (const e of remote.exams || []) {
    const existing: ExamRecord | undefined = await tx.objectStore('exams').get(e.id);
    if (!existing || (e.updatedAt || e.createdAt) > (existing.updatedAt || existing.createdAt)) {
      await tx.objectStore('exams').put(e);
      appliedExams++;
    }
  }

  // 4. Merge questions
  for (const q of remote.questions || []) {
    const existing: QuestionRecord | undefined = await tx.objectStore('questions').get(q.id);
    if (!existing || (q.updatedAt || q.createdAt) > (existing.updatedAt || existing.createdAt)) {
      await tx.objectStore('questions').put(q);
      appliedQuestions++;
    }
  }

  // 5. Merge photo assets
  for (const p of remote.photoAssets || []) {
    const existing: QuestionPhotoAsset | undefined = await tx.objectStore('photoAssets').get(p.id);
    if (!existing) {
      await tx.objectStore('photoAssets').put(p);
      appliedPhotos++;
    }
  }

  // 6. Merge study plans
  for (const sp of remote.studyPlans || []) {
    const existing: WeeklyStudyPlan | undefined = await tx.objectStore('studyPlans').get(sp.id);
    if (!existing || sp.generatedAt > existing.generatedAt) {
      await tx.objectStore('studyPlans').put(sp);
    }
  }

  await tx.done;

  return {
    appliedStudents,
    appliedExams,
    appliedQuestions,
    appliedPhotos,
    appliedDeletions,
  };
}

