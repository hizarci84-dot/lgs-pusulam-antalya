import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import {
  CloudSyncSettings,
  CloudProviderType,
} from '../types/models';
import {
  getCloudSyncSettings,
  saveCloudSyncSettings,
  getAllDataForSync,
  mergeSyncPayload,
  clearPendingDeletions,
  CloudSyncDataPayload,
} from './db';

let isSyncing = false;

// Event helper to notify React components across the app
export function notifySyncStateChanged(settings: CloudSyncSettings) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('lgs-sync-status-changed', {
        detail: settings,
      })
    );
  }
}

export function notifyDataUpdated(source: string = 'cloud-sync') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('lgs-data-updated', {
        detail: { source },
      })
    );
  }
}

// ==================== FIREBASE HELPER ====================
function getOrInitFirebase(settings: CloudSyncSettings) {
  if (!settings.firebaseConfig || !settings.firebaseConfig.projectId) {
    throw new Error('Firebase yapılandırma bilgileri eksik. Lütfen proje ayarlarını kontrol edin.');
  }

  const appName = `lgs-pusulam-${settings.familySyncId || 'default'}`;
  const existingApps = getApps();
  const found = existingApps.find((a) => a.name === appName);
  if (found) {
    return { app: found, db: getFirestore(found) };
  }

  const app = initializeApp(settings.firebaseConfig, appName);
  const db = getFirestore(app);
  return { app, db };
}

// ==================== TEST CONNECTION ====================
export async function testCloudConnection(
  settings: CloudSyncSettings
): Promise<{ success: boolean; message: string }> {
  try {
    if (!settings.enabled || settings.provider === 'none') {
      return { success: false, message: 'Bulut eşitleme kapalı.' };
    }

    if (!settings.familySyncId || settings.familySyncId.trim().length < 3) {
      return {
        success: false,
        message: 'Lütfen en az 3 karakterden oluşan bir Aile / Cihaz Eşitleme Kodu girin.',
      };
    }

    if (settings.provider === 'firebase') {
      const { db } = getOrInitFirebase(settings);
      // Try writing a heartbeat ping doc
      const pingRef = doc(
        db,
        'lgs_pusulam_families',
        settings.familySyncId,
        'system',
        'connection_test'
      );
      await setDoc(pingRef, {
        testedAt: new Date().toISOString(),
        client: navigator.userAgent,
      });
      return {
        success: true,
        message: 'Firebase bağlantısı başarılı! Cihazlar arası eşitleme hazır.',
      };
    }

    if (settings.provider === 'google_script') {
      if (!settings.googleScriptUrl || !settings.googleScriptUrl.startsWith('https://script.google.com')) {
        return {
          success: false,
          message: 'Geçersiz Google Apps Script Web App URL adresi.',
        };
      }

      let res: Response;
      try {
        res = await fetch(settings.googleScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'ping',
            familySyncId: settings.familySyncId,
            familySecretPin: settings.familySecretPin,
            testedAt: new Date().toISOString(),
          }),
        });
      } catch (networkErr: any) {
        return {
          success: false,
          message:
            'Google Apps Script sunucusuna bağlanılamadı. CORS veya internet bağlantısı sorunu olabilir.',
        };
      }

      const text = await res.text().catch(() => '');
      if (
        res.status === 401 ||
        res.status === 403 ||
        text.includes('Erişime ihtiyacınız var') ||
        text.includes('dokümanı doğrudan açın') ||
        text.includes('accounts.google.com')
      ) {
        return {
          success: false,
          message:
            'Google İzin Hatası: Apps Script Web App dağıtımında "Erişimi olanlar" ayarı "Herkes" (Anyone) olarak seçilmelidir.',
        };
      }

      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch {
        return {
          success: false,
          message:
            'Google Apps Script geçersiz yanıt döndürdü. Lütfen "Erişimi olanlar: Herkes" seçeneğiyle yeni dağıtım yaptığınızdan emin olun.',
        };
      }

      if (json.success || res.ok) {
        return {
          success: true,
          message: 'Google Drive / Apps Script bağlantısı başarılı!',
        };
      } else {
        return {
          success: false,
          message: json.message || `Sunucu yanıtı: ${res.statusText}`,
        };
      }
    }

    return { success: false, message: 'Bilinmeyen bulut sağlayıcı.' };
  } catch (err: any) {
    return {
      success: false,
      message: `Bağlantı hatası: ${err?.message || 'Bilinmeyen hata'}`,
    };
  }
}

// ==================== FIREBASE SYNC IMPLEMENTATION ====================
async function syncWithFirebase(settings: CloudSyncSettings): Promise<string> {
  const { db } = getOrInitFirebase(settings);
  const familyId = settings.familySyncId;
  const rootCol = `lgs_pusulam_families/${familyId}`;

  // 1. Get local modifications since last sync
  const localData = await getAllDataForSync(settings.lastSyncedAt);

  // 2. Upload local updates to Firestore using Batches (up to 400 docs per batch)
  const batch = writeBatch(db);
  let batchCount = 0;

  // Students
  for (const s of localData.students) {
    const ref = doc(db, rootCol, 'students', s.id);
    batch.set(ref, s, { merge: true });
    batchCount++;
  }

  // Exams
  for (const e of localData.exams) {
    const ref = doc(db, rootCol, 'exams', e.id);
    batch.set(ref, e, { merge: true });
    batchCount++;
  }

  // Questions
  for (const q of localData.questions) {
    const ref = doc(db, rootCol, 'questions', q.id);
    batch.set(ref, q, { merge: true });
    batchCount++;
  }

  // Photo Assets (Base64 JPEG data)
  for (const p of localData.photoAssets) {
    const ref = doc(db, rootCol, 'photoAssets', p.id);
    batch.set(ref, p, { merge: true });
    batchCount++;
  }

  // Study plans
  for (const sp of localData.studyPlans) {
    const ref = doc(db, rootCol, 'studyPlans', sp.id);
    batch.set(ref, sp, { merge: true });
    batchCount++;
  }

  // Deletions
  for (const d of localData.deletions) {
    const ref = doc(db, rootCol, 'deletions', d.id);
    batch.set(ref, d, { merge: true });
    batchCount++;
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  // 3. Download remote updates from Firestore
  const [stuSnap, examSnap, qSnap, photoSnap, planSnap, delSnap] = await Promise.all([
    getDocs(collection(db, rootCol, 'students')),
    getDocs(collection(db, rootCol, 'exams')),
    getDocs(collection(db, rootCol, 'questions')),
    getDocs(collection(db, rootCol, 'photoAssets')),
    getDocs(collection(db, rootCol, 'studyPlans')),
    getDocs(collection(db, rootCol, 'deletions')),
  ]);

  const remotePayload: CloudSyncDataPayload = {
    students: stuSnap.docs.map((d) => d.data() as any),
    exams: examSnap.docs.map((d) => d.data() as any),
    questions: qSnap.docs.map((d) => d.data() as any),
    photoAssets: photoSnap.docs.map((d) => d.data() as any),
    studyPlans: planSnap.docs.map((d) => d.data() as any),
    deletions: delSnap.docs.map((d) => d.data() as any),
  };

  // 4. Merge remote records into local IndexedDB
  const mergeResult = await mergeSyncPayload(remotePayload);

  // 5. Clean up pending deletions since they are committed to cloud
  await clearPendingDeletions();

  return `Firebase ile eşitlendi (${mergeResult.appliedExams} deneme, ${mergeResult.appliedQuestions} soru, ${mergeResult.appliedPhotos} fotoğraf güncellendi).`;
}

// ==================== GOOGLE APPS SCRIPT SYNC IMPLEMENTATION ====================
async function syncWithGoogleScript(settings: CloudSyncSettings): Promise<string> {
  if (!settings.googleScriptUrl) {
    throw new Error('Google Apps Script URL girilmedi.');
  }

  const localData = await getAllDataForSync(settings.lastSyncedAt);

  let res: Response;
  try {
    res = await fetch(settings.googleScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'sync',
        familySyncId: settings.familySyncId,
        familySecretPin: settings.familySecretPin,
        lastSyncedAt: settings.lastSyncedAt,
        localChanges: localData,
      }),
    });
  } catch (err: any) {
    throw new Error('Google Apps Script bağlantısı kurulamadı. İnternet veya CORS bağlantınızı kontrol edin.');
  }

  const text = await res.text().catch(() => '');
  if (
    res.status === 401 ||
    res.status === 403 ||
    text.includes('Erişime ihtiyacınız var') ||
    text.includes('dokümanı doğrudan açın') ||
    text.includes('accounts.google.com') ||
    (text.trim().startsWith('<') && !res.ok)
  ) {
    throw new Error(
      'Google Apps Script erişim izni gerekiyor: Dağıtım ayarlarında "Erişimi olanlar" seçeneğini "Herkes" (Anyone) olarak seçmelisiniz.'
    );
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      'Google Apps Script geçerli JSON döndürmedi. Lütfen Web App dağıtım ayarlarında "Erişimi olanlar: Herkes" seçili olduğundan emin olun.'
    );
  }

  if (json.error) {
    throw new Error(json.error);
  }

  const remotePayload: Partial<CloudSyncDataPayload> = json.remoteChanges || {
    students: [],
    exams: [],
    questions: [],
    photoAssets: [],
    studyPlans: [],
    deletions: [],
  };

  const mergeResult = await mergeSyncPayload(remotePayload);
  await clearPendingDeletions();

  return `Google Drive / Apps Script ile eşitlendi (${mergeResult.appliedExams} deneme, ${mergeResult.appliedQuestions} soru güncellendi).`;
}

// ==================== MAIN SYNC NOW FUNCTION ====================
export async function syncWithCloud(force: boolean = false): Promise<{
  success: boolean;
  message: string;
}> {
  if (isSyncing) {
    return { success: false, message: 'Eşitleme zaten devam ediyor...' };
  }

  const settings = await getCloudSyncSettings();
  if (!settings.enabled || settings.provider === 'none') {
    return { success: false, message: 'Bulut eşitleme yapılandırılmamış.' };
  }

  if (!settings.familySyncId) {
    return { success: false, message: 'Aile / Cihaz Eşitleme Kodu belirlenmemiş.' };
  }

  isSyncing = true;
  await saveCloudSyncSettings({
    lastSyncStatus: 'syncing',
    lastSyncMessage: 'Bulut ile eşitleniyor...',
  });
  notifySyncStateChanged({
    ...settings,
    lastSyncStatus: 'syncing',
    lastSyncMessage: 'Bulut ile eşitleniyor...',
  });

  try {
    let resultMessage = '';
    if (settings.provider === 'firebase') {
      resultMessage = await syncWithFirebase(settings);
    } else if (settings.provider === 'google_script') {
      resultMessage = await syncWithGoogleScript(settings);
    }

    const nowIso = new Date().toISOString();
    const updated = await saveCloudSyncSettings({
      lastSyncedAt: nowIso,
      lastSyncStatus: 'success',
      lastSyncMessage: resultMessage,
    });

    notifySyncStateChanged(updated);
    notifyDataUpdated('cloud-sync-success');

    return { success: true, message: resultMessage };
  } catch (err: any) {
    const errorMsg = err?.message || 'Bilinmeyen bir eşitleme hatası oluştu.';
    const updated = await saveCloudSyncSettings({
      lastSyncStatus: 'error',
      lastSyncMessage: errorMsg,
    });
    notifySyncStateChanged(updated);
    return { success: false, message: errorMsg };
  } finally {
    isSyncing = false;
  }
}

// Push all current local data to cloud (Initial seed)
export async function pushAllLocalDataToCloud(): Promise<{
  success: boolean;
  message: string;
}> {
  const settings = await getCloudSyncSettings();
  if (!settings.enabled) {
    return { success: false, message: 'Bulut eşitleme aktif değil.' };
  }
  // Reset lastSyncedAt to null to force full export
  await saveCloudSyncSettings({ lastSyncedAt: null });
  return syncWithCloud(true);
}
