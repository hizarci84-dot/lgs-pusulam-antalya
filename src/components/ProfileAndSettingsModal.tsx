import React, { useEffect, useState } from 'react';
import {
  Award,
  Cloud,
  Download,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { ANTALYA_DISTRICTS } from '../data/curriculum';
import { ANTALYA_SCHOOL_PROGRAMS } from '../data/antalyaSchools';
import { FullBackupPayload } from '../services/db';
import { SchoolType, StudentProfile } from '../types/models';

interface ProfileAndSettingsModalProps {
  isFirstSetup?: boolean;
  activeStudent: StudentProfile | null;
  allStudents: StudentProfile[];
  onClose?: () => void;
  onSaveStudent: (profile: StudentProfile) => Promise<void>;
  onSwitchStudent: (studentId: string) => Promise<void>;
  onDeleteStudent: (studentId: string) => Promise<void>;
  onExportBackup: () => Promise<void>;
  onRestoreBackup: (payload: FullBackupPayload) => Promise<void>;
  onClearAllData: () => Promise<void>;
  onOpenCloudSync?: () => void;
}

const SCHOOL_TYPES: SchoolType[] = [
  'Fen Lisesi',
  'Anadolu Lisesi',
  'Sosyal Bilimler Lisesi',
  'Anadolu İmam Hatip Lisesi',
  'Mesleki ve Teknik Anadolu Lisesi',
];

const LANGUAGES = ['İngilizce', 'Almanca', 'Fransızca', 'Arapça'];

export const ProfileAndSettingsModal: React.FC<ProfileAndSettingsModalProps> = ({
  isFirstSetup = false,
  activeStudent,
  allStudents,
  onClose,
  onSaveStudent,
  onSwitchStudent,
  onDeleteStudent,
  onExportBackup,
  onRestoreBackup,
  onClearAllData,
  onOpenCloudSync,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'backup' | 'privacy'>(
    'profile'
  );
  const [editingNew, setEditingNew] = useState(isFirstSetup || !activeStudent);

  const [nickname, setNickname] = useState(activeStudent?.nickname || '');
  const [gradeLevel, setGradeLevel] = useState<StudentProfile['gradeLevel']>(
    activeStudent?.gradeLevel || '8. Sınıf'
  );
  const [antalyaDistrict, setAntalyaDistrict] = useState(
    activeStudent?.antalyaDistrict || 'Muratpaşa'
  );
  const [targetPercentile, setTargetPercentile] = useState<string>(
    String(activeStudent?.targetPercentile ?? 2.5)
  );
  const [weeklyStudyHours, setWeeklyStudyHours] = useState<string>(
    String(activeStudent?.weeklyStudyHours ?? 14)
  );
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState<string>(
    String(activeStudent?.dailyStudyMinutes ?? 120)
  );
  const [boardingPreference, setBoardingPreference] = useState<
    StudentProfile['boardingPreference']
  >(activeStudent?.boardingPreference || 'farketmez');
  const [targetSchoolTypes, setTargetSchoolTypes] = useState<SchoolType[]>(
    activeStudent?.targetSchoolTypes || ['Fen Lisesi', 'Anadolu Lisesi']
  );
  const [targetSchoolIds, setTargetSchoolIds] = useState<string[]>(
    activeStudent?.targetSchoolIds || [
      'ant-yusuf-ziya-oner-fl',
      'ant-antalya-anadolu-lisesi',
    ]
  );
  const [foreignLanguages, setForeignLanguages] = useState<string[]>(
    activeStudent?.foreignLanguagePreferences || ['İngilizce']
  );
  const [preferredDistricts, setPreferredDistricts] = useState<string[]>(
    activeStudent?.preferredDistricts || ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Döşemealtı']
  );
  const [interval1, setInterval1] = useState<string>(
    String(activeStudent?.reviewIntervalsDays?.[1] ?? 1)
  );
  const [interval2, setInterval2] = useState<string>(
    String(activeStudent?.reviewIntervalsDays?.[2] ?? 3)
  );
  const [interval3, setInterval3] = useState<string>(
    String(activeStudent?.reviewIntervalsDays?.[3] ?? 7)
  );

  // Official LGS Result fields (only recorded if explicitly entered)
  const [hasOfficialResult, setHasOfficialResult] = useState<boolean>(
    Boolean(activeStudent?.officialLgsResult)
  );
  const [officialScore, setOfficialScore] = useState<string>(
    activeStudent?.officialLgsResult?.officialScore
      ? String(activeStudent.officialLgsResult.officialScore)
      : ''
  );
  const [officialPercentile, setOfficialPercentile] = useState<string>(
    activeStudent?.officialLgsResult?.officialGeneralPercentile
      ? String(activeStudent.officialLgsResult.officialGeneralPercentile)
      : ''
  );

  const [aiServerStatus, setAiServerStatus] = useState<{
    configured: boolean;
    provider: string;
    model: string | null;
    privacyNotice: string;
  } | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  useEffect(() => {
    if (activeStudent && !editingNew) {
      setNickname(activeStudent.nickname || '');
      setGradeLevel(activeStudent.gradeLevel);
      setAntalyaDistrict(activeStudent.antalyaDistrict);
      setTargetPercentile(String(activeStudent.targetPercentile));
      setWeeklyStudyHours(String(activeStudent.weeklyStudyHours));
      setDailyStudyMinutes(String(activeStudent.dailyStudyMinutes));
      setBoardingPreference(activeStudent.boardingPreference);
      setTargetSchoolTypes(activeStudent.targetSchoolTypes);
      setTargetSchoolIds(activeStudent.targetSchoolIds);
      setForeignLanguages(activeStudent.foreignLanguagePreferences);
      setPreferredDistricts(activeStudent.preferredDistricts);
      setInterval1(String(activeStudent.reviewIntervalsDays?.[1] ?? 1));
      setInterval2(String(activeStudent.reviewIntervalsDays?.[2] ?? 3));
      setInterval3(String(activeStudent.reviewIntervalsDays?.[3] ?? 7));
      setHasOfficialResult(Boolean(activeStudent.officialLgsResult));
      setOfficialScore(
        activeStudent.officialLgsResult?.officialScore
          ? String(activeStudent.officialLgsResult.officialScore)
          : ''
      );
      setOfficialPercentile(
        activeStudent.officialLgsResult?.officialGeneralPercentile
          ? String(activeStudent.officialLgsResult.officialGeneralPercentile)
          : ''
      );
    }
  }, [activeStudent?.id, editingNew]);

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((data) => setAiServerStatus(data))
      .catch(() =>
        setAiServerStatus({
          configured: false,
          provider: 'none',
          model: null,
          privacyNotice:
            'Çevrimdışı mod aktif. Verileriniz tamamen cihazınızdaki IndexedDB veri tabanında güvenle saklanır.',
        })
      );
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const nowIso = new Date().toISOString();
    const id =
      editingNew || !activeStudent
        ? `stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        : activeStudent.id;

    const officialLgsResult =
      hasOfficialResult &&
      officialScore &&
      officialPercentile &&
      Number(officialScore) >= 100 &&
      Number(officialScore) <= 500
        ? {
            year: 2026,
            officialScore: Number(officialScore),
            officialGeneralPercentile: Number(officialPercentile),
            recordedAt: nowIso,
          }
        : null;

    const profile: StudentProfile = {
      id,
      nickname: nickname.trim(), // Optional! Not mandatory.
      gradeLevel,
      antalyaDistrict,
      targetSchoolIds,
      targetSchoolTypes:
        targetSchoolTypes.length > 0 ? targetSchoolTypes : ['Fen Lisesi'],
      targetPercentile: Math.max(0.01, Math.min(99, Number(targetPercentile) || 3)),
      weeklyStudyHours: Math.max(1, Math.min(60, Number(weeklyStudyHours) || 12)),
      dailyStudyMinutes: Math.max(20, Math.min(480, Number(dailyStudyMinutes) || 120)),
      boardingPreference,
      foreignLanguagePreferences: foreignLanguages,
      preferredDistricts:
        preferredDistricts.length > 0 ? preferredDistricts : [antalyaDistrict],
      reviewIntervalsDays: [
        0,
        Math.max(1, Number(interval1) || 1),
        Math.max(2, Number(interval2) || 3),
        Math.max(4, Number(interval3) || 7),
      ],
      officialLgsResult,
      isDemo: editingNew ? false : activeStudent?.isDemo,
      createdAt: editingNew || !activeStudent ? nowIso : activeStudent.createdAt,
      updatedAt: nowIso,
    };

    await onSaveStudent(profile);
    setEditingNew(false);
    setStatusBanner('Öğrenci profili ve hedefler kaydedildi.');
    if (isFirstSetup && onClose) {
      onClose();
    }
  };

  const handleRestoreFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as FullBackupPayload;
      await onRestoreBackup(parsed);
      setStatusBanner('Yedek dosyası başarıyla geri yüklendi!');
    } catch (err: any) {
      alert(
        `Yedek dosyası okunamadı: ${err?.message || 'Geçersiz JSON dosyası.'}`
      );
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col overflow-hidden">
        <div className="bg-navy-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-base">
              {isFirstSetup
                ? 'LGS Pusulam – Antalya • Hoş Geldiniz'
                : 'Öğrenci Profili, Yedekleme ve Ayarlar'}
            </h2>
            <p className="text-xs text-turquoise-200">
              {isFirstSetup
                ? 'Başlamak için öğrenci hedeflerini belirleyin veya örnek demo verisiyle keşfedin.'
                : 'Çoklu öğrenci profilleri, yedekleme ve gizlilik yönetimi'}
            </p>
          </div>
          {onClose && !isFirstSetup && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        {!isFirstSetup && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 ${
                activeTab === 'profile'
                  ? 'border-navy-900 text-navy-900 bg-white'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Öğrenci & Hedefler
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 ${
                activeTab === 'backup'
                  ? 'border-navy-900 text-navy-900 bg-white'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Yedekleme & Bulut Eşitleme
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 ${
                activeTab === 'privacy'
                  ? 'border-navy-900 text-navy-900 bg-white'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Gizlilik & Yapay Zekâ Durumu
            </button>
          </div>
        )}

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {statusBanner && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-xl text-xs font-semibold">
              {statusBanner}
            </div>
          )}

          {activeTab === 'profile' && (
            <>
              {/* Multi-student switcher */}
              {allStudents.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-turquoise-600" />
                      Kayıtlı Öğrenci Profilleri ({allStudents.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNew(true);
                        setNickname('');
                      }}
                      className="text-xs font-bold text-turquoise-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Yeni Öğrenci Profili Ekle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allStudents.map((stu, idx) => {
                      const isActive =
                        !editingNew && activeStudent?.id === stu.id;
                      return (
                        <div
                          key={stu.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                            isActive
                              ? 'bg-navy-900 text-white border-navy-900'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                          onClick={async () => {
                            setEditingNew(false);
                            await onSwitchStudent(stu.id);
                          }}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>
                            {stu.nickname || `Öğrenci #${idx + 1}`} ({stu.antalyaDistrict})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Öğrenci Adı veya Takma Adı (İsteğe Bağlı)
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Zorunlu değil (Örn: Atakan)"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Sınıf Seviyesi
                    </label>
                    <select
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium"
                    >
                      <option value="8. Sınıf">8. Sınıf (LGS Adayı)</option>
                      <option value="7. Sınıf">7. Sınıf (Erken Hazırlık)</option>
                      <option value="Mezun / Hazırlık">Mezun / Hazırlık</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Yaşadığı Antalya İlçesi
                    </label>
                    <select
                      value={antalyaDistrict}
                      onChange={(e) => setAntalyaDistrict(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium"
                    >
                      {ANTALYA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hedef Yüzdelik Dilim (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.05"
                      max="50"
                      value={targetPercentile}
                      onChange={(e) => setTargetPercentile(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Haftalık Çalışma Süresi (Saat)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={weeklyStudyHours}
                      onChange={(e) => setWeeklyStudyHours(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Günlük Çalışma Hedefi (Dakika)
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="400"
                      value={dailyStudyMinutes}
                      onChange={(e) => setDailyStudyMinutes(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Target School Types & Boarding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hedef Okul Türleri
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SCHOOL_TYPES.map((st) => {
                        const checked = targetSchoolTypes.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() =>
                              setTargetSchoolTypes((prev) =>
                                checked
                                  ? prev.filter((x) => x !== st)
                                  : [...prev, st]
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                              checked
                                ? 'bg-navy-900 text-white border-navy-900'
                                : 'bg-white text-slate-600 border-slate-300'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pansiyon ve Yabancı Dil Tercihi (İsteğe Bağlı)
                    </label>
                    <select
                      value={boardingPreference}
                      onChange={(e) =>
                        setBoardingPreference(e.target.value as any)
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white mb-2"
                    >
                      <option value="farketmez">Pansiyon: Farketmez</option>
                      <option value="gunduzlu">Gündüzlü (Pansiyonsuz)</option>
                      <option value="yatili_istiyorum">Pansiyonlu Okul İstiyorum</option>
                    </select>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGES.map((lang) => {
                        const active = foreignLanguages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() =>
                              setForeignLanguages((prev) =>
                                active
                                  ? prev.filter((l) => l !== lang)
                                  : [...prev, lang]
                              )
                            }
                            className={`px-2 py-0.5 rounded border text-[11px] ${
                              active
                                ? 'bg-turquoise-600 text-white border-turquoise-600'
                                : 'bg-white text-slate-600 border-slate-300'
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Target Antalya High Schools */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Antalya Hedef Liseler (Seçili: {targetSchoolIds.length} okul)
                  </label>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-50">
                    {ANTALYA_SCHOOL_PROGRAMS.filter(
                      (s) => s.admissionType === 'Merkezî Sınav (LGS Puanı)'
                    ).map((s) => {
                      const selected = targetSchoolIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer text-[11px] ${
                            selected
                              ? 'bg-turquoise-50 border-turquoise-400 font-semibold text-navy-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              setTargetSchoolIds((prev) =>
                                selected
                                  ? prev.filter((id) => id !== s.id)
                                  : [...prev, s.id]
                              )
                            }
                          />
                          <span className="truncate">
                            {s.schoolName} ({s.district})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Adjustable Spaced Repetition Intervals */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="block font-bold text-navy-900 mb-1.5">
                    Akıllı Tekrar Aralıkları (Gün Olarak Ayarlanabilir)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-600">2. Tekrar (Gün)</span>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={interval1}
                        onChange={(e) => setInterval1(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600">3. Tekrar (Gün)</span>
                      <input
                        type="number"
                        min={2}
                        max={30}
                        value={interval2}
                        onChange={(e) => setInterval2(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600">4. Tekrar (Gün)</span>
                      <input
                        type="number"
                        min={4}
                        max={60}
                        value={interval3}
                        onChange={(e) => setInterval3(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Official LGS Result Entry (Section 7 & 15) */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2">
                  <label className="flex items-center gap-2 font-bold text-navy-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasOfficialResult}
                      onChange={(e) => setHasOfficialResult(e.target.checked)}
                    />
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>
                      Resmî MEB LGS Sonucu Açıklandı (Yalnızca resmî sınav sonucunuz açıklandığında girin)
                    </span>
                  </label>
                  {hasOfficialResult && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="block text-[11px] text-slate-700 mb-0.5">
                          Resmî LGS Puanı (100–500)
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="100"
                          max="500"
                          value={officialScore}
                          onChange={(e) => setOfficialScore(e.target.value)}
                          placeholder="Örn: 468.42"
                          className="w-full border border-amber-300 rounded-lg px-2.5 py-1.5 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-700 mb-0.5">
                          Resmî Türkiye Geneli Yüzdelik Dilim (%)
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="99.99"
                          value={officialPercentile}
                          onChange={(e) => setOfficialPercentile(e.target.value)}
                          placeholder="Örn: 1.45"
                          className="w-full border border-amber-300 rounded-lg px-2.5 py-1.5 bg-white font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  {!editingNew && activeStudent && allStudents.length > 1 ? (
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          window.confirm(
                            'Bu öğrenci profilini ve bağlı tüm deneme/fotoğraf kayıtlarını silmek istediğinize emin misiniz?'
                          )
                        ) {
                          await onDeleteStudent(activeStudent.id);
                        }
                      }}
                      className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 rounded-xl flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Bu Profili Sil
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl shadow-sm"
                  >
                    {isFirstSetup
                      ? 'Profili Oluştur ve Başla'
                      : 'Profili ve Hedefleri Kaydet'}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs">
              {/* Cloud Sync Hero Card */}
              <div className="bg-gradient-to-r from-navy-900 to-indigo-900 text-white rounded-xl p-4 space-y-3 shadow-md border border-navy-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-turquoise-500/20 border border-turquoise-400/30 rounded-lg text-turquoise-300">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        Bulut & Cihazlar Arası Eşitleme
                      </h4>
                      <p className="text-[11px] text-turquoise-200">
                        Telefonunuz, tabletiniz ve eşinizin telefonu arasında anlık köprü
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-turquoise-500/20 text-turquoise-300 border border-turquoise-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                    Önerilen
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Manuel dosya indirip yüklemeye gerek kalmadan tüm denemeleri, soru fotoğraflarını ve analizleri Firebase veya Google Drive üzerinden cihazlarınız arasında anlık eşitleyin.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    onOpenCloudSync?.();
                  }}
                  className="px-4 py-2 bg-turquoise-500 hover:bg-turquoise-600 text-navy-950 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Bulut Eşitleme ve Cihaz Eşleştirme Ayarlarını Aç</span>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-sm text-navy-900">
                  Manuel Dosya Yedekleme (.json)
                </h4>
                <p className="text-slate-600">
                  Tüm öğrenci profillerinizi, deneme sınavlarınızı, yanlış defteri fotoğraflarınızı ve çalışma planlarınızı tek bir JSON yedek dosyası olarak telefonunuza/bilgisayarınıza indirebilir ve istediğiniz zaman geri yükleyebilirsiniz.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onExportBackup}
                    className="px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-bold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-turquoise-400" />
                    Tam Yedek Dosyası İndir (.json)
                  </button>

                  <label className="cursor-pointer px-4 py-2.5 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-xl font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Yedekten Geri Yükle (.json)</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleRestoreFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2.5">
                <h4 className="font-bold text-sm text-rose-900">
                  Tüm Verileri Sıfırla / Sil
                </h4>
                <p className="text-rose-800">
                  Cihazdaki tüm öğrenci profillerini, denemeleri ve soru fotoğraflarını kalıcı olarak siler. İşlem öncesi yedek almanız önerilir.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      window.confirm(
                        'Cihazdaki TÜM öğrenci, deneme ve fotoğraf verilerini kalıcı olarak silmek istediğinize emin misiniz?'
                      )
                    ) {
                      await onClearAllData();
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Tüm Kullanıcı Verilerini Sil
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Veri Gizliliği ve Yerel Depolama Güvencesi
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>
                    Öğrencinin kimlik numarası, açık adresi veya gereksiz kişisel verileri toplanmaz; öğrenci adı dahi isteğe bağlıdır.
                  </li>
                  <li>
                    Tüm deneme sonuçları, soru fotoğrafları ve çalışma planları varsayılan olarak cihazınızdaki <strong>IndexedDB</strong> yerel veri tabanında saklanır; izinsiz hiçbir üçüncü taraf sunucuya gönderilmez.
                  </li>
                  <li>
                    Öğrenci fotoğrafları ile Antalya lise verileri ayrı veri depolarında (object store) izole biçimde tutulur.
                  </li>
                  <li>
                    API anahtarları ön yüz (istemci) kodunda yer almaz; yalnızca sunucu tarafında (<code>.env</code>) yönetilir.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-sm text-navy-900">
                  Yapay Zekâ Görüntü Analizi Entegrasyon Durumu
                </h4>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      aiServerStatus?.configured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {aiServerStatus?.configured
                      ? `Aktif (${aiServerStatus.provider.toUpperCase()} • ${aiServerStatus.model})`
                      : 'Harici API Anahtarı Tanımlı Değil (Çevrimdışı / Manuel Mod Aktif)'}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {aiServerStatus?.privacyNotice}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
