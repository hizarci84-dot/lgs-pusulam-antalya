/**
 * LGS PUSULAM – ANTALYA
 * Google Drive + Vertex AI (300$ Hediye Kredi Korumalı) Otomatik Soru Temizleme & Bulut Eşitleme Motoru
 *
 * ÖZELLİKLER:
 * 1. Google Drive hesabınızda "Atakan Temizlenmiş Deneme Fotoları" klasörünü otomatik oluşturur ve
 *    kırpılan / temizlenen tüm soru fotoğraflarını bu klasörün altına JPEG/PNG olarak kaydeder.
 * 2. Google Cloud Vertex AI (Proje: 118350580303) üzerinden 300$ (90 günlük) hediye kredinizi kullanarak
 *    soru üzerindeki kurşun kalem karalamalarını otomatik temizler.
 * 3. KREDİ KORUMA KALKANI:
 *    - Her temizlenen soruda harcanan tutarı (~0.039$) ve 90 günlük süreyi otomatik takip eder.
 *    - Krediniz 50$'ın altına düştüğünde (veya 90 günün bitmesine 7 gün kaldığında) hem uygulama içinden
 *      hem de Drive klasörünüze uyarı raporu bırakarak sizi bilgilendirir.
 *    - Krediniz bitmeden (15$ kala veya 88. günde) sistemi otomatik durdurarak kartınızdan 1 kuruş bile
 *      çekilmesini engeller.
 */

var CLEAN_FOLDER_NAME = 'Atakan Temizlenmiş Deneme Fotoları';
var DEFAULT_GCP_PROJECT_ID = '118350580303';
var DEFAULT_VERTEX_API_KEY_B64 = 'QVEuQWI4Uk42TFk5UHhraVkxOEY2UV9aRmdsclNlcF82cGs5aDR6ZlRFZlplaVlObmxvT2c=';

function getDefaultVertexKey() {
  try {
    return Utilities.newBlob(Utilities.base64Decode(DEFAULT_VERTEX_API_KEY_B64)).getDataAsString();
  } catch (e) {
    return '';
  }
}

var TOTAL_WELCOME_CREDIT_USD = 300.0;
var COST_PER_CLEANED_IMAGE_USD = 0.039;
var COST_PER_ANALYSIS_USD = 0.001;
var WARN_REMAINING_USD = 50.0;       // 50$ kaldığında uyar
var HARD_STOP_REMAINING_USD = 15.0;  // 15$ kaldığında otomatik durdur (karttan çekim olmasın)
var TRIAL_TOTAL_DAYS = 90;
var WARN_REMAINING_DAYS = 7;         // 7 gün kaldığında uyar
var HARD_STOP_REMAINING_DAYS = 2;    // 2 gün kaldığında otomatik durdur

var VERTEX_CLEANUP_PROMPT =
  'Edit the uploaded photo of this Turkish 8th grade LGS test question. Remove all student pencil/pen scribbles, calculations, circles around options, underlines, and stray handwriting marks from the page, reconstructing the clean original printed question beneath them. Keep all printed question text, Turkish characters, diagrams, tables, formulas, and A, B, C, D choices intact and legible. Produce a clean, straightened, scan-like test page.';

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var action = data.action;
    var familySyncId = data.familySyncId || 'default';

    // 1. BAĞLANTI TESTİ (PING)
    if (action === 'ping') {
      var testFolder = getOrCreateLgsFolder();
      var cleanFolder = getOrCreateCleanPhotosFolder();
      var creditStats = getVertexCreditStats();
      return responseJson({
        success: true,
        message:
          'Google Drive bağlantısı hazır! Klasörler: "' +
          testFolder.getName() +
          '" ve "' +
          cleanFolder.getName() +
          '" aktif.',
        creditStats: creditStats,
        time: new Date().toISOString()
      });
    }

    // 2. KREDİ DURUMU SORGULAMA
    if (action === 'get_vertex_credit' || action === 'get_vertex_credit_stats') {
      return responseJson({
        success: true,
        creditStats: getVertexCreditStats()
      });
    }

    // 2.5 VERTEX OAUTH TOKEN KURULUMU (ScriptProperties içine güvenli kayıt)
    if (action === 'setup_vertex_oauth') {
      var props = PropertiesService.getScriptProperties();
      if (data.clientId) props.setProperty('VERTEX_OAUTH_CLIENT_ID', data.clientId);
      if (data.clientSecret) props.setProperty('VERTEX_OAUTH_CLIENT_SECRET', data.clientSecret);
      if (data.refreshToken) props.setProperty('VERTEX_OAUTH_REFRESH_TOKEN', data.refreshToken);
      if (data.projectId) props.setProperty('VERTEX_GCP_PROJECT_ID', data.projectId);
      return responseJson({
        success: true,
        message: 'Vertex AI OAuth kimlik bilgileri güvenli ScriptProperties deposuna kaydedildi.'
      });
    }

    // 3. VERTEX AI İLE SORU TEMİZLEME VE "Atakan Temizlenmiş Deneme Fotoları" KLASÖRÜNE KAYDETME
    if (action === 'clean_photo_vertex') {
      var projectId = (data.projectId || DEFAULT_GCP_PROJECT_ID).trim();
      var apiKey = (data.apiKey || getDefaultVertexKey()).trim();
      var imageBase64 = data.imageBase64 || '';
      var mimeType = data.mimeType || 'image/jpeg';
      var questionId = data.questionId || ('Soru_' + new Date().getTime());
      var subjectName = data.subjectName || '';

      var cleanRes = cleanPhotoWithVertexAi(
        imageBase64,
        mimeType,
        projectId,
        apiKey,
        questionId,
        subjectName
      );
      return responseJson(cleanRes);
    }

    // 3.5 VERTEX AI İLE KONU TESPİTİ, SORU ÇÖZÜMÜ VE METİN/GÖRSEL ANALİZİ (gemini-3.8-flash)
    if (action === 'vertex_generate_content') {
      var modelName = (data.model || 'gemini-3.8-flash').trim();
      var payloadBody = data.payload || {};
      var genRes = generateContentWithVertexAi(modelName, payloadBody);
      return responseJson(genRes);
    }

    // 4. VERİ SENKRONİZASYONU (HIZLI DELTA SYNC - META & FOTOĞRAF AYRIŞTIRILMASI)
    if (action === 'sync') {
      var metaFileName = 'lgs_meta_' + familySyncId + '.json';
      var photosFileName = 'lgs_photos_' + familySyncId + '.json';
      var legacyFileName = 'lgs_data_' + familySyncId + '.json';

      var metaData = loadOrMigrateMetaAndPhotos(
        metaFileName,
        photosFileName,
        legacyFileName
      );

      var local = data.localChanges || {};
      var localDeletions = local.deletions || [];
      var localStudents = local.students || [];
      var localExams = local.exams || [];
      var localQuestions = local.questions || [];
      var localPhotos = local.photoAssets || [];
      var localPlans = local.studyPlans || [];

      var hasMetaChanges = false;
      var hasPhotoChanges = false;
      var newlyAddedPhotosForDrive = [];

      // A) Silinen kayıtları buluttan temizle
      for (var dIdx = 0; dIdx < localDeletions.length; dIdx++) {
        var d = localDeletions[dIdx];
        if (!d || !d.id) continue;
        metaData.deletions[d.id] = d;
        hasMetaChanges = true;
        if (d.entityType === 'student') delete metaData.students[d.id];
        if (d.entityType === 'exam') delete metaData.exams[d.id];
        if (d.entityType === 'question') delete metaData.questions[d.id];
        if (d.entityType === 'studyPlan') delete metaData.studyPlans[d.id];
        if (d.entityType === 'photo') {
          delete metaData.photoIndex[d.id];
          hasPhotoChanges = true;
        }
      }

      // B) Yerel meta güncellemeleri (Last-Write-Wins) buluta kaydet
      for (var sIdx = 0; sIdx < localStudents.length; sIdx++) {
        var s = localStudents[sIdx];
        if (!s || !s.id) continue;
        var exS = metaData.students[s.id];
        if (!exS || (s.updatedAt || s.createdAt || '') >= (exS.updatedAt || exS.createdAt || '')) {
          metaData.students[s.id] = s;
          hasMetaChanges = true;
        }
      }

      for (var eIdx = 0; eIdx < localExams.length; eIdx++) {
        var eItem = localExams[eIdx];
        if (!eItem || !eItem.id) continue;
        var exE = metaData.exams[eItem.id];
        if (!exE || (eItem.updatedAt || eItem.createdAt || '') >= (exE.updatedAt || exE.createdAt || '')) {
          metaData.exams[eItem.id] = eItem;
          hasMetaChanges = true;
        }
      }

      for (var qIdx = 0; qIdx < localQuestions.length; qIdx++) {
        var q = localQuestions[qIdx];
        if (!q || !q.id) continue;
        var exQ = metaData.questions[q.id];
        if (!exQ || (q.updatedAt || q.createdAt || '') >= (exQ.updatedAt || exQ.createdAt || '')) {
          metaData.questions[q.id] = q;
          hasMetaChanges = true;
        }
      }

      for (var spIdx = 0; spIdx < localPlans.length; spIdx++) {
        var sp = localPlans[spIdx];
        if (!sp || !sp.id) continue;
        var exSp = metaData.studyPlans[sp.id];
        if (!exSp || (sp.generatedAt || '') >= (exSp.generatedAt || '')) {
          metaData.studyPlans[sp.id] = sp;
          hasMetaChanges = true;
        }
      }

      for (var pIdx = 0; pIdx < localPhotos.length; pIdx++) {
        var pItem = localPhotos[pIdx];
        if (!pItem || !pItem.id) continue;
        if (!metaData.photoIndex[pItem.id]) {
          newlyAddedPhotosForDrive.push(pItem);
        }
        metaData.photoIndex[pItem.id] = pItem.createdAt || new Date().toISOString();
        hasMetaChanges = true;
        hasPhotoChanges = true;
      }

      // C) İstemcinin hangi fotoğraflara ihtiyaç duyduğunu belirle (Delta Photo Sync)
      var knownPhotoIds = Array.isArray(data.knownPhotoIds) ? data.knownPhotoIds : null;
      var knownMap = {};
      if (knownPhotoIds) {
        for (var k = 0; k < knownPhotoIds.length; k++) {
          knownMap[knownPhotoIds[k]] = true;
        }
      }

      var allCloudPhotoIds = Object.keys(metaData.photoIndex || {});
      var missingPhotoIds = [];
      for (var mIdx = 0; mIdx < allCloudPhotoIds.length; mIdx++) {
        var pid = allCloudPhotoIds[mIdx];
        if (!knownMap[pid]) {
          missingPhotoIds.push(pid);
        }
      }

      // D) Yalnızca fotoğraf değişikliği varsa veya istemcide eksik fotoğraf varsa lgs_photos dosyasını aç
      var remotePhotosToSend = [];
      if (hasPhotoChanges || missingPhotoIds.length > 0) {
        var photosFile = getFastJsonFile(photosFileName);
        var photosMap = {};
        var photosRaw = photosFile.getBlob().getDataAsString();
        if (photosRaw && photosRaw.trim().length > 0) {
          try {
            var parsedPhotos = JSON.parse(photosRaw);
            photosMap = parsedPhotos.photoAssets || parsedPhotos || {};
          } catch (errP) {
            photosMap = {};
          }
        }

        if (hasPhotoChanges) {
          for (var d2 = 0; d2 < localDeletions.length; d2++) {
            var delItem = localDeletions[d2];
            if (delItem && delItem.entityType === 'photo') {
              delete photosMap[delItem.id];
            }
          }
          for (var lp = 0; lp < localPhotos.length; lp++) {
            var compressedPhoto = optimizePhotoAssetForCloud(localPhotos[lp]);
            photosMap[compressedPhoto.id] = compressedPhoto;
            knownMap[compressedPhoto.id] = true; // İstemci zaten bu fotoğrafa sahip
          }
          photosFile.setContent(JSON.stringify({ photoAssets: photosMap }));
        }

        // Yalnızca istemcide olmayan (eksik) fotoğrafları gönder
        for (var mp = 0; mp < missingPhotoIds.length; mp++) {
          var reqId = missingPhotoIds[mp];
          if (!knownMap[reqId] && photosMap[reqId]) {
            remotePhotosToSend.push(photosMap[reqId]);
          }
        }
      }

      // E) Yeni eklenen fotoğrafları Drive klasörüne kaydet (en fazla 2 adet/senkronizasyon ile hızı koru)
      if (newlyAddedPhotosForDrive.length > 0) {
        var rootFolderForDrive = getOrCreateLgsFolder();
        var photoFolder = getOrCreateSubFolder(rootFolderForDrive, 'Soru Fotoğrafları');
        var cleanPhotosFolder = getOrCreateCleanPhotosFolder();
        savePhotosToDriveFolder(
          photoFolder,
          cleanPhotosFolder,
          newlyAddedPhotosForDrive.slice(0, 2)
        );
      }

      // F) Yalnızca meta veride değişiklik olduysa meta JSON dosyasını yaz
      if (hasMetaChanges) {
        var metaFile = getFastJsonFile(metaFileName);
        metaFile.setContent(JSON.stringify(metaData));
      }

      var remoteChanges = {
        students: Object.values(metaData.students),
        exams: Object.values(metaData.exams),
        questions: Object.values(metaData.questions),
        photoAssets: remotePhotosToSend,
        studyPlans: Object.values(metaData.studyPlans),
        deletions: Object.values(metaData.deletions)
      };

      return responseJson({
        success: true,
        remoteChanges: remoteChanges,
        totalCloudPhotos: allCloudPhotoIds.length,
        syncedNewPhotos: remotePhotosToSend.length,
        creditStats: getVertexCreditStats(),
        serverTime: new Date().toISOString()
      });
    }

    return responseJson({ error: 'Bilinmeyen işlem: ' + action });
  } catch (err) {
    return responseJson({ error: err.toString() });
  }
}

function doGet(e) {
  return responseJson({
    appName: 'LGS Pusulam Antalya Google Drive & Vertex AI Engine',
    status: 'active',
    cleanFolderName: CLEAN_FOLDER_NAME,
    projectId: DEFAULT_GCP_PROJECT_ID,
    creditStats: getVertexCreditStats()
  });
}

/**
 * 300$ Kredi ve 90 Günlük Süre Takibi + Otomatik Koruma Kalkanı
 */
function getVertexCreditStats() {
  var props = PropertiesService.getScriptProperties();
  var cleanedCount = parseInt(props.getProperty('VERTEX_CLEANED_COUNT') || '0', 10);
  var analysisCount = parseInt(props.getProperty('VERTEX_ANALYSIS_COUNT') || '0', 10);
  var trialStartIso = props.getProperty('VERTEX_TRIAL_START_DATE');
  if (!trialStartIso) {
    trialStartIso = new Date().toISOString();
    props.setProperty('VERTEX_TRIAL_START_DATE', trialStartIso);
  }

  var startMs = new Date(trialStartIso).getTime();
  var nowMs = new Date().getTime();
  var elapsedDays = Math.max(0, Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)));
  var daysRemaining = Math.max(0, TRIAL_TOTAL_DAYS - elapsedDays);

  var spentUsd =
    Math.round((cleanedCount * COST_PER_CLEANED_IMAGE_USD + analysisCount * COST_PER_ANALYSIS_USD) * 1000) /
    1000;
  var remainingUsd = Math.max(0, Math.round((TOTAL_WELCOME_CREDIT_USD - spentUsd) * 1000) / 1000);

  var hardStopped =
    remainingUsd <= HARD_STOP_REMAINING_USD || daysRemaining <= HARD_STOP_REMAINING_DAYS;
  var warningActive =
    !hardStopped &&
    (remainingUsd <= WARN_REMAINING_USD || daysRemaining <= WARN_REMAINING_DAYS);

  var warningMessage = '';
  if (hardStopped) {
    warningMessage =
      '🛑 KREDİ KORUMA KALKANI DEVREDE: 300$ hediye kredinizden ' +
      remainingUsd.toFixed(2) +
      '$ (veya ' +
      daysRemaining +
      ' gün) kaldığı için kartınızdan ücret çekilmemesi adına otomatik temizleme durduruldu.';
  } else if (warningActive) {
    warningMessage =
      '⚠️ KREDİ UYARISI: 300$ hediye kredinizden ' +
      remainingUsd.toFixed(2) +
      '$ (' +
      daysRemaining +
      ' gün) kaldı. 15$ veya 2 gün kaldığında sistem otomatik olarak duracaktır.';
  }

  return {
    cleanedCount: cleanedCount,
    analysisCount: analysisCount,
    spentUsd: spentUsd,
    remainingUsd: remainingUsd,
    totalCreditUsd: TOTAL_WELCOME_CREDIT_USD,
    daysRemaining: daysRemaining,
    trialStartDate: trialStartIso,
    warningActive: warningActive,
    hardStopped: hardStopped,
    warningMessage: warningMessage
  };
}

function recordVertexUsageAndNotifyIfNeeded() {
  var props = PropertiesService.getScriptProperties();
  var cleanedCount = parseInt(props.getProperty('VERTEX_CLEANED_COUNT') || '0', 10) + 1;
  props.setProperty('VERTEX_CLEANED_COUNT', String(cleanedCount));

  var stats = getVertexCreditStats();
  if (stats.warningActive || stats.hardStopped) {
    try {
      var cleanFolder = getOrCreateCleanPhotosFolder();
      var alertFileName = '⚠️_300_DOLAR_KREDI_UYARISI.txt';
      var alertFile = getOrCreateJsonFile(cleanFolder, alertFileName);
      alertFile.setContent(
        'ATAKAN LGS PUSULAM - 300$ HEDİYE KREDİ DURUM RAPORU\n' +
          '====================================================\n' +
          stats.warningMessage +
          '\n\nToplam Temizlenen Soru: ' +
          stats.cleanedCount +
          '\nHarcanan Kredi: $' +
          stats.spentUsd.toFixed(2) +
          '\nKalan Hediye Kredi: $' +
          stats.remainingUsd.toFixed(2) +
          '\nKalan Süre: ' +
          stats.daysRemaining +
          ' gün\n\nKartınızdan ücret çekilmemesi için 15$ veya 2 gün kaldığında sistem otomatik olarak durdurulur.'
      );
    } catch (e) {
      // devam et
    }
  }
  return stats;
}

/**
 * Görseli Google Drive'daki "Atakan Temizlenmiş Deneme Fotoları" klasörüne kaydeder
 */
function saveSinglePhotoToCleanFolder(base64Data, mimeType, questionId, subjectName) {
  try {
    var cleanFolder = getOrCreateCleanPhotosFolder();
    var ext = (mimeType || '').indexOf('png') !== -1 ? '.png' : '.jpg';
    var prefix = subjectName ? subjectName + '_' : '';
    var driveFileName = 'Atakan_Temiz_' + prefix + questionId + ext;

    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType || 'image/jpeg', driveFileName);
    var existing = cleanFolder.getFilesByName(driveFileName);
    while (existing.hasNext()) {
      existing.next().setTrashed(true);
    }
    cleanFolder.createFile(blob);
    return driveFileName;
  } catch (e) {
    return '';
  }
}

/**
 * ScriptProperties içinde kayıtlı OAuth Refresh Token ile Vertex AI Bearer Token üretir
 */
function getVertexOAuthAccessToken() {
  var props = PropertiesService.getScriptProperties();
  var cachedToken = props.getProperty('VERTEX_CACHED_ACCESS_TOKEN');
  var cachedExpiry = parseInt(props.getProperty('VERTEX_CACHED_TOKEN_EXPIRY') || '0', 10);
  var nowMs = new Date().getTime();
  if (cachedToken && nowMs < cachedExpiry) {
    return cachedToken;
  }

  var clientId = props.getProperty('VERTEX_OAUTH_CLIENT_ID');
  var clientSecret = props.getProperty('VERTEX_OAUTH_CLIENT_SECRET');
  var refreshToken = props.getProperty('VERTEX_OAUTH_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) {
    return '';
  }

  try {
    var tokenRes = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
      method: 'post',
      payload: {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      },
      muteHttpExceptions: true
    });
    if (tokenRes.getResponseCode() === 200) {
      var tokenData = JSON.parse(tokenRes.getContentText());
      if (tokenData.access_token) {
        props.setProperty('VERTEX_CACHED_ACCESS_TOKEN', tokenData.access_token);
        props.setProperty('VERTEX_CACHED_TOKEN_EXPIRY', String(nowMs + 45 * 60 * 1000));
        return tokenData.access_token;
      }
    }
  } catch (e) {
    // ignore
  }
  return '';
}

/**
 * Vertex AI (OAuth) üzerinden metin / konu tespiti / soru çözümü (gemini-3.8-flash)
 */
function generateContentWithVertexAi(modelName, payloadBody) {
  var stats = getVertexCreditStats();
  if (stats.hardStopped) {
    return {
      error: {
        code: 403,
        message: 'Kartınızdan ücret çekilmemesi için ücretli Vertex AI bağlantısı durduruldu.'
      }
    };
  }
  var props = PropertiesService.getScriptProperties();
  var gcpProject = props.getProperty('VERTEX_GCP_PROJECT_ID') || 'gen-lang-client-0553886215';
  var oauthToken = getVertexOAuthAccessToken();
  if (!oauthToken) {
    return {
      error: {
        code: 401,
        message: 'Vertex AI OAuth token bulunamadı.'
      }
    };
  }

  var candidates = [
    { location: 'global', model: 'gemini-3.8-flash' },
    { location: 'global', model: modelName || 'gemini-3.8-flash' },
    { location: 'us-central1', model: 'gemini-2.5-flash-image' }
  ];

  var lastBody = '';
  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    var host =
      c.location === 'global'
        ? 'https://aiplatform.googleapis.com'
        : 'https://' + c.location + '-aiplatform.googleapis.com';
    var url =
      host +
      '/v1/projects/' +
      encodeURIComponent(gcpProject) +
      '/locations/' +
      c.location +
      '/publishers/google/models/' +
      encodeURIComponent(c.model) +
      ':generateContent';

    try {
      var res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: {
          Authorization: 'Bearer ' + oauthToken
        },
        payload: JSON.stringify(payloadBody),
        muteHttpExceptions: true
      });
      var code = res.getResponseCode();
      var txt = res.getContentText();
      if (code === 200) {
        var curAnalysis = parseInt(props.getProperty('VERTEX_ANALYSIS_COUNT') || '0', 10) + 1;
        props.setProperty('VERTEX_ANALYSIS_COUNT', String(curAnalysis));
        var parsedOut = JSON.parse(txt);
        parsedOut.creditStats = getVertexCreditStats();
        return parsedOut;
      }
      lastBody = txt;
    } catch (e) {
      lastBody = JSON.stringify({ error: { message: e.toString() } });
    }
  }

  try {
    return JSON.parse(lastBody);
  } catch (e) {
    return { error: { message: lastBody || 'Vertex AI yanıt döndüremedi.' } };
  }
}

/**
 * Vertex AI üzerinden görsel temizleme ve "Atakan Temizlenmiş Deneme Fotoları" klasörüne kaydetme
 */
function cleanPhotoWithVertexAi(imageBase64, mimeType, projectId, apiKey, questionId, subjectName) {
  var stats = getVertexCreditStats();
  if (stats.hardStopped) {
    return {
      success: false,
      errorMessage: stats.warningMessage,
      creditStats: stats
    };
  }

  var cleanB64 = (imageBase64 || '').replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
  if (!cleanB64) {
    return {
      success: false,
      errorMessage: 'Temizlenecek soru görseli verisi boş.',
      creditStats: stats
    };
  }

  // Önce kırpılmış/hazır fotoğrafı "Atakan Temizlenmiş Deneme Fotoları" klasörüne garantili olarak yedekle
  var savedInitialFileName = saveSinglePhotoToCleanFolder(
    cleanB64,
    mimeType || 'image/jpeg',
    questionId,
    subjectName
  );

  var props = PropertiesService.getScriptProperties();
  var gcpProject = props.getProperty('VERTEX_GCP_PROJECT_ID') || projectId || 'gen-lang-client-0553886215';
  var oauthToken = getVertexOAuthAccessToken();
  var keyToUse = apiKey || getDefaultVertexKey();

  var endpoints = [];
  if (oauthToken) {
    endpoints.push({
      name: 'vertex-oauth-gemini-2.5-flash-image',
      url:
        'https://us-central1-aiplatform.googleapis.com/v1/projects/' +
        encodeURIComponent(gcpProject) +
        '/locations/us-central1/publishers/google/models/gemini-2.5-flash-image:generateContent',
      bearer: oauthToken
    });
    endpoints.push({
      name: 'vertex-oauth-global-gemini-2.5-flash-image',
      url:
        'https://aiplatform.googleapis.com/v1/projects/' +
        encodeURIComponent(gcpProject) +
        '/locations/global/publishers/google/models/gemini-2.5-flash-image:generateContent',
      bearer: oauthToken
    });
  }
  // DİKKAT: generativelanguage.googleapis.com (Gemini API) 300$ hediye krediden hariç tutulduğu için
  // karttan ücret çekilmemesi adına tamamen kaldırıldı. Yalnızca Vertex AI (aiplatform.googleapis.com) kullanılır.

  var lastErr = '';

  for (var i = 0; i < endpoints.length; i++) {
    var ep = endpoints[i];
    try {
      var payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: VERTEX_CLEANUP_PROMPT },
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanB64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 0.1
        }
      };

      var fetchOpts = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      if (ep.bearer) {
        fetchOpts.headers = { Authorization: 'Bearer ' + ep.bearer };
      }

      var response = UrlFetchApp.fetch(ep.url, fetchOpts);

      var code = response.getResponseCode();
      var bodyText = response.getContentText();

      if (code !== 200) {
        lastErr = ep.name + ' (' + code + '): ' + bodyText.slice(0, 160);
        continue;
      }

      var parsed = JSON.parse(bodyText);
      var parts =
        (parsed.candidates &&
          parsed.candidates[0] &&
          parsed.candidates[0].content &&
          parsed.candidates[0].content.parts) ||
        [];

      for (var pIdx = 0; pIdx < parts.length; pIdx++) {
        var part = parts[pIdx];
        var inline = part.inlineData || part.inline_data;
        if (inline && inline.data && inline.data.length > 100) {
          var outMime = inline.mimeType || inline.mime_type || 'image/png';
          var outBase64 = inline.data;

          // Vertex AI PNG döndürdüğünde (~1.3MB), hız için otomatik olarak JPEG'e (~95KB) dönüştür
          if (outMime.indexOf('png') !== -1) {
            try {
              var pngBytes = Utilities.base64Decode(outBase64);
              var jpgBlob = Utilities.newBlob(pngBytes, 'image/png', 'clean.png').getAs('image/jpeg');
              outBase64 = Utilities.base64Encode(jpgBlob.getBytes());
              outMime = 'image/jpeg';
            } catch (convErr) {
              // Dönüştürme başarısız olursa orijinal PNG korunur
            }
          }

          var cleanDataUrl = 'data:' + outMime + ';base64,' + outBase64;

          // Temizlenmiş görseli Google Drive'da "Atakan Temizlenmiş Deneme Fotoları" klasörüne kaydet
          var finalDriveName = saveSinglePhotoToCleanFolder(
            outBase64,
            outMime,
            questionId,
            subjectName
          );

          var updatedStats = recordVertexUsageAndNotifyIfNeeded();

          return {
            success: true,
            cleanedDataUrl: cleanDataUrl,
            driveFileName: finalDriveName,
            driveFolderName: CLEAN_FOLDER_NAME,
            modelUsed: ep.name,
            creditStats: updatedStats
          };
        }
      }
      lastErr = ep.name + ': Yanıtta görsel (inlineData) bulunamadı.';
    } catch (err) {
      lastErr = ep.name + ': ' + err.toString();
    }
  }

  return {
    success: false,
    savedCroppedToDrive: Boolean(savedInitialFileName),
    driveFileName: savedInitialFileName,
    driveFolderName: CLEAN_FOLDER_NAME,
    errorMessage: 'Vertex AI görsel temizleme yanıtı: ' + lastErr,
    creditStats: stats
  };
}

function getOrCreateLgsFolder() {
  var folderName = 'LGS Pusulam Antalya';
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
 * Google Drive ana dizininde "Atakan Temizlenmiş Deneme Fotoları" klasörünü oluşturur veya getirir
 */
function getOrCreateCleanPhotosFolder() {
  var folders = DriveApp.getFoldersByName(CLEAN_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(CLEAN_FOLDER_NAME);
}

function getOrCreateSubFolder(parentFolder, subName) {
  var subs = parentFolder.getFoldersByName(subName);
  if (subs.hasNext()) {
    return subs.next();
  }
  return parentFolder.createFolder(subName);
}

function getOrCreateJsonFile(folder, fileName) {
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    return files.next();
  }
  return folder.createFile(fileName, '{}', MimeType.PLAIN_TEXT);
}

/**
 * PNG veya büyük boyutlu Base64 DataURL görsellerini sunucu tarafında hafif JPEG'e dönüştürür
 */
function convertDataUrlToJpegServer(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || dataUrl.indexOf('base64,') === -1) {
    return dataUrl;
  }
  if (dataUrl.indexOf('data:image/png') === 0 || dataUrl.length > 450000) {
    try {
      var parts = dataUrl.split('base64,');
      var mime = parts[0].replace('data:', '').replace(';', '') || 'image/png';
      var rawBytes = Utilities.base64Decode(parts[1]);
      var jpgBlob = Utilities.newBlob(rawBytes, mime, 'temp.png').getAs('image/jpeg');
      var jpgB64 = Utilities.base64Encode(jpgBlob.getBytes());
      var candidate = 'data:image/jpeg;base64,' + jpgB64;
      if (candidate.length < dataUrl.length) {
        return candidate;
      }
    } catch (e) {
      // Hata durumunda orijinali koru
    }
  }
  return dataUrl;
}

/**
 * Buluta kaydedilecek fotoğraf kaydını optimize eder (PNG -> JPEG ve çift kopya engelleme)
 */
function optimizePhotoAssetForCloud(p) {
  if (!p) return p;
  var copy = {};
  var keys = Object.keys(p);
  for (var i = 0; i < keys.length; i++) {
    copy[keys[i]] = p[keys[i]];
  }
  if (copy.croppedDataUrl) {
    copy.croppedDataUrl = convertDataUrlToJpegServer(copy.croppedDataUrl);
  }
  if (copy.originalDataUrl) {
    copy.originalDataUrl = convertDataUrlToJpegServer(copy.originalDataUrl);
  }
  // Kırpılmış/temizlenmiş görsel varsa, bulut JSON boyutunu ikiye katlamamak için originalDataUrl'i kırpılmış görselle eşitle
  if (
    copy.croppedDataUrl &&
    copy.originalDataUrl &&
    copy.originalDataUrl.length > 250000
  ) {
    copy.originalDataUrl = copy.croppedDataUrl;
  }
  copy.mimeType = 'image/jpeg';
  return copy;
}

function getFastJsonFile(fileName) {
  var props = PropertiesService.getScriptProperties();
  var propKey = 'FAST_FILE_ID_' + fileName;
  var cachedId = props.getProperty(propKey);
  if (cachedId) {
    try {
      return DriveApp.getFileById(cachedId);
    } catch (e) {
      props.deleteProperty(propKey);
    }
  }
  var rootFolder = getOrCreateLgsFolder();
  var file = getOrCreateJsonFile(rootFolder, fileName);
  try {
    props.setProperty(propKey, file.getId());
  } catch (e2) {}
  return file;
}

/**
 * Meta veriyi (~60KB) ve fotoğraf verisini (~2MB) ayrı dosyalarda tutar.
 * Eski tekil lgs_data_<id>.json (42MB) varsa otomatik olarak ayrıştırır ve PNG'leri JPEG'e sıkıştırır.
 */
function loadOrMigrateMetaAndPhotos(metaFileName, photosFileName, legacyFileName) {
  var props = PropertiesService.getScriptProperties();
  var metaIdKey = 'FAST_FILE_ID_' + metaFileName;
  var cachedMetaId = props.getProperty(metaIdKey);
  if (cachedMetaId) {
    try {
      var fastMetaFile = DriveApp.getFileById(cachedMetaId);
      var fastRaw = fastMetaFile.getBlob().getDataAsString();
      if (fastRaw && fastRaw.trim().length > 2) {
        var fastParsed = JSON.parse(fastRaw);
        if (!fastParsed.students) fastParsed.students = {};
        if (!fastParsed.exams) fastParsed.exams = {};
        if (!fastParsed.questions) fastParsed.questions = {};
        if (!fastParsed.studyPlans) fastParsed.studyPlans = {};
        if (!fastParsed.deletions) fastParsed.deletions = {};
        if (!fastParsed.photoIndex) fastParsed.photoIndex = {};
        return fastParsed;
      }
    } catch (fastErr) {
      props.deleteProperty(metaIdKey);
    }
  }

  var rootFolder = getOrCreateLgsFolder();
  var metaFiles = rootFolder.getFilesByName(metaFileName);
  if (metaFiles.hasNext()) {
    var metaFile = metaFiles.next();
    try {
      props.setProperty(metaIdKey, metaFile.getId());
    } catch (eId) {}
    var rawMeta = metaFile.getBlob().getDataAsString();
    if (rawMeta && rawMeta.trim().length > 2) {
      try {
        var parsedMeta = JSON.parse(rawMeta);
        if (!parsedMeta.students) parsedMeta.students = {};
        if (!parsedMeta.exams) parsedMeta.exams = {};
        if (!parsedMeta.questions) parsedMeta.questions = {};
        if (!parsedMeta.studyPlans) parsedMeta.studyPlans = {};
        if (!parsedMeta.deletions) parsedMeta.deletions = {};
        if (!parsedMeta.photoIndex) parsedMeta.photoIndex = {};
        return parsedMeta;
      } catch (e) {
        // Bozuksa aşağıda yeniden oluştur
      }
    }
  }

  // Henüz lgs_meta_<id>.json yoksa, eski lgs_data_<id>.json dosyasından otomatik taşı ve sıkıştır
  var emptyMeta = {
    students: {},
    exams: {},
    questions: {},
    studyPlans: {},
    deletions: {},
    photoIndex: {}
  };

  var legacyFiles = rootFolder.getFilesByName(legacyFileName);
  if (!legacyFiles.hasNext()) {
    var newMetaFile = getOrCreateJsonFile(rootFolder, metaFileName);
    newMetaFile.setContent(JSON.stringify(emptyMeta));
    return emptyMeta;
  }

  var legacyFile = legacyFiles.next();
  var legacyRaw = legacyFile.getBlob().getDataAsString();
  var legacyData = {};
  if (legacyRaw && legacyRaw.trim().length > 0) {
    try {
      legacyData = JSON.parse(legacyRaw);
    } catch (e) {
      legacyData = {};
    }
  }

  emptyMeta.students = legacyData.students || {};
  emptyMeta.exams = legacyData.exams || {};
  emptyMeta.questions = legacyData.questions || {};
  emptyMeta.studyPlans = legacyData.studyPlans || {};
  emptyMeta.deletions = legacyData.deletions || {};

  var legacyPhotos = legacyData.photoAssets || {};
  var optimizedPhotos = {};
  var pIds = Object.keys(legacyPhotos);
  for (var i = 0; i < pIds.length; i++) {
    var pid = pIds[i];
    var pObj = legacyPhotos[pid];
    if (pObj && pObj.id) {
      var opt = optimizePhotoAssetForCloud(pObj);
      optimizedPhotos[pid] = opt;
      emptyMeta.photoIndex[pid] = opt.createdAt || new Date().toISOString();
    }
  }

  var photosFile = getOrCreateJsonFile(rootFolder, photosFileName);
  photosFile.setContent(JSON.stringify({ photoAssets: optimizedPhotos }));

  var createdMetaFile = getOrCreateJsonFile(rootFolder, metaFileName);
  createdMetaFile.setContent(JSON.stringify(emptyMeta));

  return emptyMeta;
}

function savePhotosToDriveFolder(photoFolder, cleanPhotosFolder, photoAssets) {
  if (!photoAssets || !photoAssets.length) return;
  for (var i = 0; i < photoAssets.length; i++) {
    var p = photoAssets[i];
    var dataUrl = p.croppedDataUrl || p.originalDataUrl;
    if (!dataUrl || dataUrl.indexOf('base64,') === -1) continue;

    var fileName = 'Soru_' + (p.questionId || p.id) + '.jpg';
    try {
      var base64 = dataUrl.split('base64,')[1];
      var decoded = Utilities.base64Decode(base64);
      var blob = Utilities.newBlob(decoded, 'image/jpeg', fileName);

      // 1. Ana Soru Fotoğrafları klasörüne kaydet
      var existing = photoFolder.getFilesByName(fileName);
      while (existing.hasNext()) {
        existing.next().setTrashed(true);
      }
      photoFolder.createFile(blob);

      // 2. Temizlenmiş / kırpılmış soruyu "Atakan Temizlenmiş Deneme Fotoları" klasörüne de kaydet
      if (cleanPhotosFolder && p.croppedDataUrl) {
        var cleanName = 'Atakan_Temiz_' + fileName;
        var existingClean = cleanPhotosFolder.getFilesByName(cleanName);
        while (existingClean.hasNext()) {
          existingClean.next().setTrashed(true);
        }
        var cleanBlob = Utilities.newBlob(decoded, 'image/jpeg', cleanName);
        cleanPhotosFolder.createFile(cleanBlob);
      }
    } catch (e) {
      // Devam et
    }
  }
}

function responseJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
