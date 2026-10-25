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

    // 4. VERİ SENKRONİZASYONU (SYNC)
    if (action === 'sync') {
      var rootFolder = getOrCreateLgsFolder();
      var photoFolder = getOrCreateSubFolder(rootFolder, 'Soru Fotoğrafları');
      var cleanPhotosFolder = getOrCreateCleanPhotosFolder();
      var fileName = 'lgs_data_' + familySyncId + '.json';
      var file = getOrCreateJsonFile(rootFolder, fileName);

      var cloudData = {};
      var fileContent = file.getBlob().getDataAsString();
      if (fileContent && fileContent.trim().length > 0) {
        try {
          cloudData = JSON.parse(fileContent);
        } catch (err) {
          cloudData = {};
        }
      }

      if (!cloudData.students) cloudData.students = {};
      if (!cloudData.exams) cloudData.exams = {};
      if (!cloudData.questions) cloudData.questions = {};
      if (!cloudData.photoAssets) cloudData.photoAssets = {};
      if (!cloudData.studyPlans) cloudData.studyPlans = {};
      if (!cloudData.deletions) cloudData.deletions = {};

      var local = data.localChanges || {};

      // A) Silinen kayıtları buluttan temizle
      (local.deletions || []).forEach(function(d) {
        cloudData.deletions[d.id] = d;
        if (d.entityType === 'student') delete cloudData.students[d.id];
        if (d.entityType === 'exam') delete cloudData.exams[d.id];
        if (d.entityType === 'question') delete cloudData.questions[d.id];
        if (d.entityType === 'photo') delete cloudData.photoAssets[d.id];
        if (d.entityType === 'studyPlan') delete cloudData.studyPlans[d.id];
      });

      // B) Yerel güncellemeleri buluta kaydet
      (local.students || []).forEach(function(s) { cloudData.students[s.id] = s; });
      (local.exams || []).forEach(function(e) { cloudData.exams[e.id] = e; });
      (local.questions || []).forEach(function(q) { cloudData.questions[q.id] = q; });
      (local.photoAssets || []).forEach(function(p) { cloudData.photoAssets[p.id] = p; });
      (local.studyPlans || []).forEach(function(sp) { cloudData.studyPlans[sp.id] = sp; });

      // C) Fotoğrafları Google Drive klasörlerine kaydet
      savePhotosToDriveFolder(photoFolder, cleanPhotosFolder, local.photoAssets || []);

      // D) Buluttaki güncel veriyi ana JSON dosyasına yaz
      file.setContent(JSON.stringify(cloudData));

      var remoteChanges = {
        students: Object.values(cloudData.students),
        exams: Object.values(cloudData.exams),
        questions: Object.values(cloudData.questions),
        photoAssets: Object.values(cloudData.photoAssets),
        studyPlans: Object.values(cloudData.studyPlans),
        deletions: Object.values(cloudData.deletions)
      };

      return responseJson({
        success: true,
        remoteChanges: remoteChanges,
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
  var trialStartIso = props.getProperty('VERTEX_TRIAL_START_DATE');
  if (!trialStartIso) {
    trialStartIso = new Date().toISOString();
    props.setProperty('VERTEX_TRIAL_START_DATE', trialStartIso);
  }

  var startMs = new Date(trialStartIso).getTime();
  var nowMs = new Date().getTime();
  var elapsedDays = Math.max(0, Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)));
  var daysRemaining = Math.max(0, TRIAL_TOTAL_DAYS - elapsedDays);

  var spentUsd = Math.round(cleanedCount * COST_PER_CLEANED_IMAGE_USD * 100) / 100;
  var remainingUsd = Math.max(0, Math.round((TOTAL_WELCOME_CREDIT_USD - spentUsd) * 100) / 100);

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
  endpoints.push({
    name: 'gemini-api-2.5-flash-image',
    url:
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' +
      encodeURIComponent(keyToUse),
    bearer: ''
  });

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
          var cleanDataUrl = 'data:' + outMime + ';base64,' + inline.data;

          // Temizlenmiş görseli Google Drive'da "Atakan Temizlenmiş Deneme Fotoları" klasörüne kaydet
          var finalDriveName = saveSinglePhotoToCleanFolder(
            inline.data,
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
