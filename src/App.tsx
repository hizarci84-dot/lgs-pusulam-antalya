import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Compass,
  FileCheck2,
  GraduationCap,
  Home,
  Settings,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { AnalyticsView } from './components/AnalyticsView';
import { ExamsView } from './components/ExamsView';
import { HomeView } from './components/HomeView';
import { NotebookView } from './components/NotebookView';
import { ProfileAndSettingsModal } from './components/ProfileAndSettingsModal';
import { QuestionDetailModal } from './components/QuestionDetailModal';
import { QuickPhotoUploadModal } from './components/QuickPhotoUploadModal';
import { SchoolsView } from './components/SchoolsView';
import { computePercentileAndScoreEstimate } from './services/calculationEngine';
import {
  clearAllUserData,
  deleteExamRecord,
  deleteQuestionRecord,
  deleteStudentAndAllData,
  exportFullBackup,
  FullBackupPayload,
  getActiveStudentId,
  getAllStudents,
  getExamsByStudent,
  getOrSeedSchoolPrograms,
  getPhotoAssetsByStudent,
  getQuestionsByStudent,
  getStudyPlanByStudent,
  restoreFromBackup,
  saveExamRecord,
  savePhotoAsset,
  saveQuestionRecord,
  saveStudentProfile,
  saveStudyPlan,
  setActiveStudentId,
} from './services/db';
import { seedDemoStudentDataset } from './services/demoSeeder';
import {
  analyzeRecurringPatterns,
  generatePersonalizedStudyPlan,
  getReviewTasksForStudent,
} from './services/patternEngine';
import { filterAndCompareSchools } from './services/schoolComparisonEngine';
import {
  AntalyaSchoolProgram,
  ExamRecord,
  QuestionPhotoAsset,
  QuestionRecord,
  StudentProfile,
  SubjectId,
  WeeklyStudyPlan,
} from './types/models';

type BottomNavTab = 'home' | 'exams' | 'notebook' | 'schools' | 'analytics';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(
    null
  );
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [photoAssets, setPhotoAssets] = useState<QuestionPhotoAsset[]>([]);
  const [studyPlan, setStudyPlan] = useState<WeeklyStudyPlan | null>(null);
  const [schools, setSchools] = useState<AntalyaSchoolProgram[]>([]);

  // Navigation & Modal states
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [openCreateExamTrigger, setOpenCreateExamTrigger] = useState(0);
  const [activeQuestionModalId, setActiveQuestionModalId] = useState<
    string | null
  >(null);
  const [photoUploadConfig, setPhotoUploadConfig] = useState<{
    open: boolean;
    examId?: string;
    subjectId?: SubjectId;
    status?: 'wrong' | 'blank';
  }>({ open: false });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const loadStudentWorkspace = useCallback(async (studentId: string) => {
    const [allStu, stuExams, stuQuestions, stuPhotos, existingPlan, schoolList] =
      await Promise.all([
        getAllStudents(),
        getExamsByStudent(studentId),
        getQuestionsByStudent(studentId),
        getPhotoAssetsByStudent(studentId),
        getStudyPlanByStudent(studentId),
        getOrSeedSchoolPrograms(),
      ]);

    const currentStu = allStu.find((s) => s.id === studentId) || allStu[0] || null;
    setAllStudents(allStu);
    setActiveStudent(currentStu);
    setExams(stuExams);
    setQuestions(stuQuestions);
    setPhotoAssets(stuPhotos);
    setSchools(schoolList);

    if (currentStu) {
      const updatedPlan = generatePersonalizedStudyPlan(
        currentStu,
        stuExams,
        stuQuestions,
        existingPlan
      );
      await saveStudyPlan(updatedPlan);
      setStudyPlan(updatedPlan);
    } else {
      setStudyPlan(null);
    }
  }, []);

  const initializeApp = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsList, storedActiveId, schoolList] = await Promise.all([
        getAllStudents(),
        getActiveStudentId(),
        getOrSeedSchoolPrograms(),
      ]);
      setSchools(schoolList);
      setAllStudents(studentsList);

      if (studentsList.length === 0) {
        setActiveStudent(null);
      } else {
        const chosenId =
          storedActiveId && studentsList.some((s) => s.id === storedActiveId)
            ? storedActiveId
            : studentsList[0].id;
        await setActiveStudentId(chosenId);
        await loadStudentWorkspace(chosenId);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadStudentWorkspace]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Derived Real-Time Analytics
  const patternReport = useMemo(
    () => analyzeRecurringPatterns(exams, questions),
    [exams, questions]
  );

  const estimate = useMemo(
    () => computePercentileAndScoreEstimate(exams, activeStudent),
    [exams, activeStudent]
  );

  const reviewTasks = useMemo(
    () => getReviewTasksForStudent(questions, exams),
    [questions, exams]
  );

  const schoolComparisons = useMemo(
    () => filterAndCompareSchools(schools, estimate, {}),
    [schools, estimate]
  );

  const targetSchoolComparisons = useMemo(() => {
    if (!activeStudent) return [];
    const favs = schoolComparisons.filter((sc) =>
      activeStudent.targetSchoolIds.includes(sc.school.id)
    );
    return favs.length > 0 ? favs : schoolComparisons.slice(0, 4);
  }, [schoolComparisons, activeStudent]);

  // Handlers
  const handleSaveStudent = async (profile: StudentProfile) => {
    await saveStudentProfile(profile);
    await setActiveStudentId(profile.id);
    await loadStudentWorkspace(profile.id);
  };

  const handleSwitchStudent = async (studentId: string) => {
    await setActiveStudentId(studentId);
    setSelectedExamId(null);
    await loadStudentWorkspace(studentId);
  };

  const handleDeleteStudent = async (studentId: string) => {
    await deleteStudentAndAllData(studentId);
    await initializeApp();
  };

  const handleLoadDemoData = async () => {
    const demoStu = await seedDemoStudentDataset();
    await loadStudentWorkspace(demoStu.id);
  };

  const handleSaveExam = async (exam: ExamRecord) => {
    await saveExamRecord(exam);
    if (activeStudent) {
      await loadStudentWorkspace(activeStudent.id);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    await deleteExamRecord(examId);
    if (selectedExamId === examId) {
      setSelectedExamId(null);
    }
    if (activeStudent) {
      await loadStudentWorkspace(activeStudent.id);
    }
  };

  const handleSaveQuestion = async (updated: QuestionRecord) => {
    await saveQuestionRecord(updated);
    if (activeStudent) {
      await loadStudentWorkspace(activeStudent.id);
    }
  };

  const handleSavePhotoAsset = async (asset: QuestionPhotoAsset) => {
    await savePhotoAsset(asset);
    if (activeStudent) {
      const updatedPhotos = await getPhotoAssetsByStudent(activeStudent.id);
      setPhotoAssets(updatedPhotos);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestionRecord(questionId);
    if (activeStudent) {
      await loadStudentWorkspace(activeStudent.id);
    }
  };

  const handleSaveUploadedBatch = async (
    newQuestions: QuestionRecord[],
    newAssets: QuestionPhotoAsset[]
  ) => {
    for (const a of newAssets) {
      await savePhotoAsset(a);
    }
    for (const q of newQuestions) {
      await saveQuestionRecord(q);
    }
    if (activeStudent) {
      await loadStudentWorkspace(activeStudent.id);
    }
  };

  const handleToggleStudyTask = async (taskId: string) => {
    if (!studyPlan) return;
    const nowIso = new Date().toISOString();
    const updatedTasks = studyPlan.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? nowIso : null,
          }
        : t
    );
    const totalCompletedMinutes = updatedTasks
      .filter((t) => t.completed)
      .reduce((s, t) => s + t.durationMinutes, 0);

    const updatedPlan: WeeklyStudyPlan = {
      ...studyPlan,
      totalCompletedMinutes,
      tasks: updatedTasks,
    };
    await saveStudyPlan(updatedPlan);
    setStudyPlan(updatedPlan);
  };

  const handleRegenerateStudyPlan = async () => {
    if (!activeStudent) return;
    const freshPlan = generatePersonalizedStudyPlan(
      activeStudent,
      exams,
      questions,
      null
    );
    await saveStudyPlan(freshPlan);
    setStudyPlan(freshPlan);
  };

  const handleToggleFavoriteSchool = async (schoolId: string) => {
    if (!activeStudent) return;
    const exists = activeStudent.targetSchoolIds.includes(schoolId);
    const nextIds = exists
      ? activeStudent.targetSchoolIds.filter((id) => id !== schoolId)
      : [...activeStudent.targetSchoolIds, schoolId];
    const updatedProfile: StudentProfile = {
      ...activeStudent,
      targetSchoolIds: nextIds,
    };
    await saveStudentProfile(updatedProfile);
    setActiveStudent(updatedProfile);
  };

  const handleExportFullBackup = async () => {
    const payload = await exportFullBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LGS_Pusulam_Antalya_Tam_Yedek_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  };

  const handleRestoreFullBackup = async (payload: FullBackupPayload) => {
    await restoreFromBackup(payload);
    await initializeApp();
  };

  const handleClearAllData = async () => {
    await clearAllUserData();
    setSelectedExamId(null);
    setActiveQuestionModalId(null);
    await initializeApp();
  };

  const activeQuestionForModal = useMemo(
    () => questions.find((q) => q.id === activeQuestionModalId) || null,
    [questions, activeQuestionModalId]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex flex-col items-center justify-center p-6">
        <Compass className="w-12 h-12 text-turquoise-400 animate-spin mb-3" />
        <div className="font-extrabold text-base">LGS Pusulam – Antalya</div>
        <div className="text-xs text-turquoise-200 mt-1">
          Yerel veri tabanı ve analiz motoru hazırlanıyor...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col pb-20">
      {/* Top App Header Bar (Navy & Turquoise Theme) */}
      <header className="sticky top-0 z-30 bg-navy-900 text-white shadow-md border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-3.5 py-2.5 flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              setActiveTab('home');
              setSelectedExamId(null);
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-turquoise-500/20 border border-turquoise-400/40 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-turquoise-300" />
            </div>
            <div>
              <div className="font-extrabold text-sm leading-tight tracking-tight flex items-center gap-1.5">
                <span>LGS Pusulam</span>
                <span className="text-turquoise-300">Antalya</span>
              </div>
              <div className="text-[11px] text-slate-300 leading-tight">
                Deneme Analizi • Yanlış Defteri • Lise Tercih Asistanı
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online / Offline PWA Indicator */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${
                isOnline
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
              }`}
              title={
                isOnline
                  ? 'Çevrimiçi'
                  : 'Çevrimdışı Mod: Kayıtlı denemeler ve fotoğraflar yerel veri tabanından açılır'
              }
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Çevrimiçi</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Çevrimdışı Mod</span>
                </>
              )}
            </span>

            {/* Separate Profile, Backup & Settings Button (Section 20) */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <User className="w-3.5 h-3.5 text-turquoise-300" />
              <span className="max-w-[110px] truncate">
                {activeStudent?.nickname || 'Öğrenci Profili'}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-4 pt-4 flex-1">
        {activeStudent ? (
          <>
            {activeTab === 'home' && (
              <HomeView
                student={activeStudent}
                exams={exams}
                questions={questions}
                reviewTasks={reviewTasks}
                patternReport={patternReport}
                estimate={estimate}
                studyPlan={studyPlan}
                targetSchoolComparisons={targetSchoolComparisons}
                onQuickAddExam={() => {
                  setActiveTab('exams');
                  setSelectedExamId(null);
                  setOpenCreateExamTrigger((c) => c + 1);
                }}
                onQuickUploadPhoto={() => {
                  if (exams.length === 0) {
                    setActiveTab('exams');
                    setOpenCreateExamTrigger((c) => c + 1);
                  } else {
                    setPhotoUploadConfig({ open: true });
                  }
                }}
                onNavigateTab={(t) => {
                  setActiveTab(t);
                  if (t !== 'exams') setSelectedExamId(null);
                }}
                onSelectExamDetail={(examId) => {
                  setSelectedExamId(examId);
                  setActiveTab('exams');
                }}
                onOpenQuestionModal={(qId) => setActiveQuestionModalId(qId)}
                onToggleStudyTask={handleToggleStudyTask}
                onLoadDemoData={handleLoadDemoData}
              />
            )}

            {activeTab === 'exams' && (
              <ExamsView
                student={activeStudent}
                exams={exams}
                questions={questions}
                photoAssets={photoAssets}
                selectedExamId={selectedExamId}
                openCreateModalTrigger={openCreateExamTrigger}
                onSelectExamId={setSelectedExamId}
                onSaveExam={handleSaveExam}
                onDeleteExam={handleDeleteExam}
                onOpenQuestionModal={(qId) => setActiveQuestionModalId(qId)}
                onOpenPhotoUploadForExam={(examId, subjectId, status) =>
                  setPhotoUploadConfig({
                    open: true,
                    examId,
                    subjectId,
                    status,
                  })
                }
              />
            )}

            {activeTab === 'notebook' && (
              <NotebookView
                exams={exams}
                questions={questions}
                photoAssets={photoAssets}
                onOpenQuestionModal={(qId) => setActiveQuestionModalId(qId)}
                onQuickUploadPhoto={() => {
                  if (exams.length === 0) {
                    setActiveTab('exams');
                    setOpenCreateExamTrigger((c) => c + 1);
                  } else {
                    setPhotoUploadConfig({ open: true });
                  }
                }}
              />
            )}

            {activeTab === 'schools' && (
              <SchoolsView
                student={activeStudent}
                schools={schools}
                estimate={estimate}
                onToggleFavoriteSchool={handleToggleFavoriteSchool}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                student={activeStudent}
                exams={exams}
                questions={questions}
                photoAssets={photoAssets}
                patternReport={patternReport}
                estimate={estimate}
                studyPlan={studyPlan}
                schoolComparisons={schoolComparisons}
                onToggleStudyTask={handleToggleStudyTask}
                onRegenerateStudyPlan={handleRegenerateStudyPlan}
                onOpenQuestionModal={(qId) => setActiveQuestionModalId(qId)}
              />
            )}
          </>
        ) : null}
      </main>

      {/* Bottom Mobile-First 5-Tab Navigation Bar (Section 20) */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 shadow-lg"
        aria-label="Alt Gezinme Menüsü"
      >
        <div className="max-w-xl mx-auto grid grid-cols-5 h-16">
          {(
            [
              { id: 'home', label: 'Ana Sayfa', Icon: Home },
              {
                id: 'exams',
                label: 'Denemeler',
                Icon: FileCheck2,
                badge: exams.length,
              },
              {
                id: 'notebook',
                label: 'Yanlış Defteri',
                Icon: BookOpen,
                badge: questions.length,
              },
              { id: 'schools', label: 'Liseler', Icon: GraduationCap },
              { id: 'analytics', label: 'Analizler', Icon: BarChart3 },
            ] as const
          ).map((item) => {
            const active = activeTab === item.id;
            const Icon = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'exams') setSelectedExamId(null);
                }}
                className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition ${
                  active
                    ? 'text-navy-900 bg-turquoise-50/70 border-t-2 border-turquoise-600'
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    active ? 'text-turquoise-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate max-w-full px-1">{item.label}</span>
                {'badge' in item && item.badge > 0 && (
                  <span className="absolute top-1.5 right-3 bg-navy-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* First-Time Student Setup OR Profile/Backup/Settings Modal */}
      {(!activeStudent || isProfileModalOpen) && (
        <ProfileAndSettingsModal
          isFirstSetup={!activeStudent}
          activeStudent={activeStudent}
          allStudents={allStudents}
          onClose={() => setIsProfileModalOpen(false)}
          onSaveStudent={handleSaveStudent}
          onSwitchStudent={handleSwitchStudent}
          onDeleteStudent={handleDeleteStudent}
          onLoadDemoData={handleLoadDemoData}
          onExportBackup={handleExportFullBackup}
          onRestoreBackup={handleRestoreFullBackup}
          onClearAllData={handleClearAllData}
        />
      )}

      {/* Quick Photo Upload Modal */}
      {photoUploadConfig.open && activeStudent && (
        <QuickPhotoUploadModal
          student={activeStudent}
          exams={exams}
          defaultExamId={photoUploadConfig.examId}
          defaultSubjectId={photoUploadConfig.subjectId}
          defaultStatus={photoUploadConfig.status}
          onClose={() => setPhotoUploadConfig({ open: false })}
          onSaveUploadedBatch={handleSaveUploadedBatch}
        />
      )}

      {/* Question Detail, Crop, AI Vision & Spaced Repetition Modal */}
      {activeQuestionForModal && activeStudent && (
        <QuestionDetailModal
          question={activeQuestionForModal}
          exam={exams.find((e) => e.id === activeQuestionForModal.examId)}
          student={activeStudent}
          photoAssets={photoAssets}
          onClose={() => setActiveQuestionModalId(null)}
          onSaveQuestion={handleSaveQuestion}
          onSavePhotoAsset={handleSavePhotoAsset}
          onDeleteQuestion={handleDeleteQuestion}
        />
      )}
    </div>
  );
};
