import { openDB, IDBPDatabase } from 'idb';
import { ANTALYA_SCHOOL_PROGRAMS } from '../data/antalyaSchools';
import {
  AntalyaSchoolProgram,
  ExamRecord,
  QuestionPhotoAsset,
  QuestionRecord,
  StudentProfile,
  WeeklyStudyPlan,
} from '../types/models';

const DB_NAME = 'lgs-pusulam-antalya-db';
const DB_VERSION = 1;

export interface FullBackupPayload {
  appName: 'LGS Pusulam – Antalya';
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
      },
    });
  }
  return dbPromise;
}

// ==================== APP SETTINGS ====================
export async function getActiveStudentId(): Promise<string | null> {
  const db = await getDb();
  const entry = await db.get('appSettings', 'activeStudentId');
  return entry?.value ?? null;
}

export async function setActiveStudentId(studentId: string | null): Promise<void> {
  const db = await getDb();
  await db.put('appSettings', { key: 'activeStudentId', value: studentId });
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
    ['students', 'exams', 'questions', 'photoAssets', 'studyPlans'],
    'readwrite'
  );

  await tx.objectStore('students').delete(studentId);

  const exams = await tx.objectStore('exams').index('by-student').getAllKeys(studentId);
  for (const k of exams) await tx.objectStore('exams').delete(k);

  const questions = await tx.objectStore('questions').index('by-student').getAllKeys(studentId);
  for (const k of questions) await tx.objectStore('questions').delete(k);

  const photos = await tx.objectStore('photoAssets').index('by-student').getAllKeys(studentId);
  for (const k of photos) await tx.objectStore('photoAssets').delete(k);

  const plans = await tx.objectStore('studyPlans').index('by-student').getAllKeys(studentId);
  for (const k of plans) await tx.objectStore('studyPlans').delete(k);

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
  const tx = db.transaction(['exams', 'questions', 'photoAssets'], 'readwrite');
  await tx.objectStore('exams').delete(examId);

  const qKeys = await tx.objectStore('questions').index('by-exam').getAllKeys(examId);
  for (const k of qKeys) await tx.objectStore('questions').delete(k);

  const pKeys = await tx.objectStore('photoAssets').index('by-exam').getAllKeys(examId);
  for (const k of pKeys) await tx.objectStore('photoAssets').delete(k);

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
  const tx = db.transaction(['questions', 'photoAssets'], 'readwrite');
  await tx.objectStore('questions').delete(questionId);
  const pKeys = await tx.objectStore('photoAssets').index('by-question').getAllKeys(questionId);
  for (const k of pKeys) await tx.objectStore('photoAssets').delete(k);
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
  await db.delete('photoAssets', photoId);
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
    appName: 'LGS Pusulam – Antalya',
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
    ['students', 'exams', 'questions', 'photoAssets', 'studyPlans', 'appSettings'],
    'readwrite'
  );
  await tx.objectStore('students').clear();
  await tx.objectStore('exams').clear();
  await tx.objectStore('questions').clear();
  await tx.objectStore('photoAssets').clear();
  await tx.objectStore('studyPlans').clear();
  await tx.objectStore('appSettings').clear();
  await tx.done;
}
