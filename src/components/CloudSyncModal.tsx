import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudLightning,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Laptop,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  UploadCloud,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { CloudProviderType, CloudSyncSettings, FirebaseConfigParams } from '../types/models';
import {
  getCloudSyncSettings,
  saveCloudSyncSettings,
  DEFAULT_CLOUD_SYNC_SETTINGS,
} from '../services/db';
import {
  syncWithCloud,
  testCloudConnection,
  pushAllLocalDataToCloud,
} from '../services/cloudSync';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [settings, setSettings] = useState<CloudSyncSettings>(DEFAULT_CLOUD_SYNC_SETTINGS);
  const [provider, setProvider] = useState<CloudProviderType>('google_script');
  const [familySyncId, setFamilySyncId] = useState('');
  const [familySecretPin, setFamilySecretPin] = useState('');
  const [autoSync, setAutoSync] = useState(true);

  // Firebase fields
  const [firebaseJsonInput, setFirebaseJsonInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  // Google script fields
  const [googleScriptUrl, setGoogleScriptUrl] = useState('');

  // UI state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const s = await getCloudSyncSettings();
    setSettings(s);
    setProvider(s.provider === 'none' ? 'google_script' : s.provider);
    setFamilySyncId(s.familySyncId || 'atakan-lgs-2026');
    setFamilySecretPin(s.familySecretPin || '');
    setAutoSync(s.autoSync);
    setGoogleScriptUrl(s.googleScriptUrl || '');

    if (s.firebaseConfig) {
      setApiKey(s.firebaseConfig.apiKey || '');
      setAuthDomain(s.firebaseConfig.authDomain || '');
      setProjectId(s.firebaseConfig.projectId || '');
      setStorageBucket(s.firebaseConfig.storageBucket || '');
      setMessagingSenderId(s.firebaseConfig.messagingSenderId || '');
      setAppId(s.firebaseConfig.appId || '');
      setFirebaseJsonInput(JSON.stringify(s.firebaseConfig, null, 2));
    }
    setTestResult(null);
    setSyncFeedback(null);
  };

  if (!isOpen) return null;

  const handleParseFirebaseJson = (raw: string) => {
    setFirebaseJsonInput(raw);
    try {
      // Clean possible js assignment like "const firebaseConfig = { ... };"
      let clean = raw.trim();
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.substring(firstBrace, lastBrace + 1);
      }
      // Simple eval or relaxed JSON parsing
      const parsed = JSON.parse(clean);
      if (parsed.projectId) {
        setProjectId(parsed.projectId || '');
        setApiKey(parsed.apiKey || '');
        setAuthDomain(parsed.authDomain || '');
        setStorageBucket(parsed.storageBucket || '');
        setMessagingSenderId(parsed.messagingSenderId || '');
        setAppId(parsed.appId || '');
      }
    } catch {
      // User might still be pasting
    }
  };

  const generateRandomFamilyCode = () => {
    const randomCode = 'LGS-' + Math.floor(1000 + Math.random() * 9000);
    setFamilySyncId(randomCode);
  };

  const buildCurrentSettings = (enableSync: boolean): CloudSyncSettings => {
    let fbConfig: FirebaseConfigParams | null = null;
    if (projectId) {
      fbConfig = {
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
      };
    }

    return {
      ...settings,
      enabled: enableSync,
      provider: enableSync ? provider : 'none',
      familySyncId: familySyncId.trim(),
      familySecretPin: familySecretPin.trim(),
      firebaseConfig: fbConfig,
      googleScriptUrl: googleScriptUrl.trim(),
      autoSync,
    };
  };

  const handleSave = async (enable: boolean = true) => {
    const updated = buildCurrentSettings(enable);
    await saveCloudSyncSettings(updated);
    setSettings(updated);
    setSyncFeedback(enable ? 'Ayarlar kaydedildi ve bulut aktif edildi!' : 'Bulut eşitleme kapatıldı.');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const toTest = buildCurrentSettings(true);
    const result = await testCloudConnection(toTest);
    setTestResult(result);
    setTesting(false);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    // Save first
    await handleSave(true);
    const result = await syncWithCloud(false);
    setSyncing(false);
    setSyncFeedback(result.message);
    if (result.success && onSyncComplete) {
      onSyncComplete();
    }
  };

  const handlePushAll = async () => {
    if (!confirm('Bu cihazdaki tüm öğrenci, deneme ve soru fotoğrafları buluta yüklenecek. Devam edilsin mi?')) {
      return;
    }
    setSyncing(true);
    setSyncFeedback(null);
    await handleSave(true);
    const result = await pushAllLocalDataToCloud();
    setSyncing(false);
    setSyncFeedback(result.message);
    if (result.success && onSyncComplete) {
      onSyncComplete();
    }
  };

  const copyAppsScriptCode = () => {
    const code = `/** LGS Pusulam Google Apps Script Sync Kodu **/
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  if (data.action === 'ping') return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  var folder = DriveApp.getFoldersByName('LGS Pusulam Antalya').hasNext() ? DriveApp.getFoldersByName('LGS Pusulam Antalya').next() : DriveApp.createFolder('LGS Pusulam Antalya');
  var file = folder.getFilesByName('lgs_data_' + (data.familySyncId || 'default') + '.json').hasNext() ? folder.getFilesByName('lgs_data_' + (data.familySyncId || 'default') + '.json').next() : folder.createFile('lgs_data_' + (data.familySyncId || 'default') + '.json', '{}', MimeType.PLAIN_TEXT);
  var cloud = JSON.parse(file.getBlob().getDataAsString() || '{}');
  ['students','exams','questions','photoAssets','studyPlans','deletions'].forEach(function(k){ if(!cloud[k]) cloud[k]={}; });
  var loc = data.localChanges || {};
  (loc.deletions||[]).forEach(function(d){ cloud.deletions[d.id]=d; if(cloud[d.entityType+'s']) delete cloud[d.entityType+'s'][d.id]; });
  ['students','exams','questions','photoAssets','studyPlans'].forEach(function(k){ (loc[k]||[]).forEach(function(item){ cloud[k][item.id]=item; }); });
  file.setContent(JSON.stringify(cloud));
  return ContentService.createTextOutput(JSON.stringify({success:true, remoteChanges:{
    students: Object.values(cloud.students), exams: Object.values(cloud.exams), questions: Object.values(cloud.questions),
    photoAssets: Object.values(cloud.photoAssets), studyPlans: Object.values(cloud.studyPlans), deletions: Object.values(cloud.deletions)
  }})).setMimeType(ContentService.MimeType.JSON);
}`;
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-900 text-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-turquoise-500/20 border border-turquoise-400/30 rounded-xl text-turquoise-300">
                <Cloud className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Bulut Senkronizasyon & Cihazlar Arası Eşitleme
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Telefonunuz, tabletiniz ve eşinizin telefonu arasında anlık ve güvenli veri köprüsü
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visual Device Pairing Banner */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-around text-center text-xs text-turquoise-200">
            <div className="flex flex-col items-center">
              <Smartphone className="w-5 h-5 mb-1 text-white" />
              <span>Sizin Telefonunuz</span>
            </div>
            <ArrowUpDown className="w-4 h-4 text-turquoise-400 animate-bounce" />
            <div className="flex flex-col items-center">
              <Tablet className="w-5 h-5 mb-1 text-white" />
              <span>Evin Tableti</span>
            </div>
            <ArrowUpDown className="w-4 h-4 text-turquoise-400 animate-bounce" />
            <div className="flex flex-col items-center">
              <Smartphone className="w-5 h-5 mb-1 text-white" />
              <span>Eşinizin Telefonu</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Alert if connected */}
          {settings.enabled && settings.lastSyncedAt && settings.lastSyncStatus === 'success' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Bulut Aktif:</strong> Son başarılı eşitleme:{' '}
                  {new Date(settings.lastSyncedAt).toLocaleTimeString('tr-TR')} (
                  {new Date(settings.lastSyncedAt).toLocaleDateString('tr-TR')})
                </span>
              </div>
              <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">
                {settings.provider === 'firebase' ? 'Firebase' : 'Google Drive'}
              </span>
            </div>
          )}

          {/* Explicit Error Diagnostic Banner */}
          {settings.enabled && settings.lastSyncStatus === 'error' && (
            <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-rose-900">
                      Google Apps Script İzin Onayı Gerekiyor
                    </h4>
                    <span className="text-[10px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                      30 Saniyede Çözüm
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    {settings.lastSyncMessage ||
                      'Google, güvenlik sebebiyle Apps Script Web App dağıtımında "Erişimi olanlar: Herkes" seçeneğini onaylamanızı bekliyor.'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-rose-100 text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-slate-900">Hızlı Çözüm Adımları:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>
                    Aşağıdaki mavi butona tıklayarak <strong>Google Apps Script</strong> projenizi açın.
                  </li>
                  <li>
                    Sağ üstteki mavi <strong>"Dağıt" (Deploy)</strong> butonuna tıklayıp <strong>"Yeni dağıtım" (New deployment)</strong> seçin.
                  </li>
                  <li>
                    <strong className="text-rose-700 underline">EN ÖNEMLİ ADIM:</strong> <strong>"Erişimi olanlar" (Who has access)</strong> ayarını mutlaka <strong>"Herkes" (Anyone)</strong> olarak seçin.
                  </li>
                  <li>
                    <strong>"Dağıt"</strong> butonuna basın, Google hesabınızla istenen onayları verin ve verilen Web App URL'sini kopyalayın.
                  </li>
                  <li>
                    Kopyaladığınız URL'yi aşağıdaki kutucuğa yapıştırıp <strong>"Şimdi Eşitle & Kaydet"</strong> butonuna basın!
                  </li>
                </ol>
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href="https://script.google.com/macros/d/1O6_TRZZ1mnJEw8Ti1WFhEL1kZ7ewLAT6ZmXlwC5SOvNMEo8aESWQBjmb/edit"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Google Apps Script Projemi Aç
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Family Pairing Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                1. Aile / Cihaz Eşitleme Kodu (Her Cihazda Aynı Olmalı)
              </label>
              <button
                type="button"
                onClick={generateRandomFamilyCode}
                className="text-xs text-turquoise-600 hover:text-turquoise-700 font-medium"
              >
                Rastgele Kod Üret
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={familySyncId}
                onChange={(e) => setFamilySyncId(e.target.value)}
                placeholder="Örn: atakan-lgs veya 6 haneli kod"
                className="flex-1 px-3.5 py-2.5 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-turquoise-500 focus:border-transparent outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Bu kodu tabletinize ve eşinizin telefonuna da aynen yazdığınızda tüm cihazlar ortak havuzda birleşir.
            </p>
          </div>

          {/* Step 2: Choose Cloud Provider */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              2. Bulut Depolama Tercihiniz
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('google_script')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  provider === 'google_script'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-400/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 text-navy-900 font-semibold text-sm mb-1">
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  <span>Google Drive (Seçiminiz)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Kendi Google hesabınızda 15 GB ücretsiz Drive alanında saklanır. Temizlenen sorular <strong>&quot;Atakan Temizlenmiş Deneme Fotoları&quot;</strong> klasörüne yedeklenir.
                </p>
                {provider === 'google_script' && (
                  <span className="absolute top-2 right-2 text-[10px] bg-emerald-600 text-white font-medium px-2 py-0.5 rounded">
                    Önerilen
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setProvider('firebase')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  provider === 'firebase'
                    ? 'border-turquoise-500 bg-turquoise-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 text-navy-900 font-semibold text-sm mb-1">
                  <CloudLightning className="w-4 h-4 text-amber-500" />
                  <span>Firebase (Google Cloud)</span>
                </div>
                <p className="text-xs text-slate-500">
                  Gerçek zamanlı alternatif bulut seçeneği.
                </p>
              </button>
            </div>
          </div>

          {/* Provider Specific Configuration */}
          {provider === 'firebase' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-navy-900">Firebase Yapılandırması</span>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-xs text-turquoise-600 hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showGuide ? 'Rehberi Gizle' : 'Nasıl Kurulur? (1 Dakika)'}
                </button>
              </div>

              {showGuide && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
                  <p className="font-semibold text-slate-800">Ücretsiz Firebase Projesi Açma:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-turquoise-600 font-medium inline-flex items-center gap-1"
                      >
                        console.firebase.google.com <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      adresine Google hesabınızla girin.
                    </li>
                    <li>"Proje Ekle" butonuna basıp projenize bir ad verin (Örn: LGS Pusulam).</li>
                    <li>Sol menüden <strong>Build -&gt; Firestore Database</strong> seçip "Veritabanı Oluştur" deyin (Test modunda başlatın).</li>
                    <li>Proje Ayarları (çark simgesi) -&gt; "Web uygulaması ekle (&lt;/&gt;)" seçin.</li>
                    <li>Size verilen <code className="bg-slate-100 px-1 py-0.5 rounded">firebaseConfig = &#123; ... &#125;</code> kodunu aşağıdaki kutuya yapıştırın!</li>
                  </ol>
                </div>
              )}

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Firebase Config Yapıştır (JSON veya JavaScript kodu):
                </label>
                <textarea
                  rows={4}
                  value={firebaseJsonInput}
                  onChange={(e) => handleParseFirebaseJson(e.target.value)}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "proje.firebaseapp.com",\n  "projectId": "proje-id",\n  "storageBucket": "proje.appspot.com",\n  "appId": "1:..."\n}`}
                  className="w-full p-2.5 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-turquoise-500 outline-none"
                />
              </div>

              {projectId && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Proje Tanındı: <strong>{projectId}</strong></span>
                </div>
              )}
            </div>
          )}

          {provider === 'google_script' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-navy-900">Google Drive & Apps Script Ayarı</span>
                <button
                  type="button"
                  onClick={copyAppsScriptCode}
                  className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Kod Kopyalandı!' : 'Apps Script Kodunu Kopyala'}
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2 bg-white p-3.5 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-800">1 Dakikada Kurulum veya Güncelleme:</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://script.google.com/macros/d/1O6_TRZZ1mnJEw8Ti1WFhEL1kZ7ewLAT6ZmXlwC5SOvNMEo8aESWQBjmb/edit"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1"
                  >
                    Mevcut Apps Script Projenizi Açın <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p>1. Projenizde sağ üstteki mavi <strong>"Dağıt" (Deploy)</strong> butonuna basıp <strong>"Yeni dağıtım" (New deployment)</strong> seçin.</p>
                <p>2. <strong>"Erişimi olanlar" (Who has access)</strong> ayarını mutlaka <strong>"Herkes" (Anyone)</strong> olarak belirleyin.</p>
                <p>3. <strong>"Dağıt"</strong> deyip Google onayını verdikten sonra verilen <strong>Web Uygulaması URL</strong> adresini aşağıdaki kutuya yapıştırın.</p>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Google Apps Script Web App URL:
                </label>
                <input
                  type="text"
                  value={googleScriptUrl}
                  onChange={(e) => setGoogleScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-turquoise-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Auto-Sync Checkbox */}
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
            <input
              type="checkbox"
              id="autoSync"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 text-turquoise-600 rounded border-slate-300 focus:ring-turquoise-500"
            />
            <label htmlFor="autoSync" className="text-xs text-slate-700 cursor-pointer">
              <strong>Otomatik Eşitle:</strong> Yeni deneme girildiğinde veya soru yüklendiğinde arka planda otomatik buluta gönder.
            </label>
          </div>

          {/* Test & Feedback Messages */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {syncFeedback && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={testing || syncing}
              onClick={handleTestConnection}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              {testing ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
            </button>

            <button
              type="button"
              disabled={testing || syncing}
              onClick={handlePushAll}
              title="Bu cihazdaki tüm mevcut verileri buluta kopyalar"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              Tüm Verileri Buluta Yükle
            </button>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            {settings.enabled && (
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Bulutu Kapat
              </button>
            )}

            <button
              type="button"
              disabled={syncing || testing}
              onClick={handleSyncNow}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-turquoise-600 to-navy-900 rounded-xl hover:from-turquoise-700 hover:to-navy-800 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-turquoise-600/20 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Eşitleniyor...' : 'Şimdi Eşitle & Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
