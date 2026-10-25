/**
 * LGS PUSULAM – ANTALYA
 * Google Drive & Google Apps Script Bulut Senkronizasyon Kodu
 * 
 * Bu kod Google Drive hesabınızda "LGS Pusulam Antalya" klasörü oluşturur.
 * İçerisine deneme sonuçlarını, öğrenci kayıtlarını ve soru fotoğraflarını 
 * otomatik olarak kaydeder ve telefonunuz, tabletiniz ve eşinizin telefonu arasında eşitler.
 * 
 * 1 DAKİKADA KURULUM ADIMLARI:
 * 1. https://script.google.com adresine Google hesabınızla gidin.
 * 2. Sol üstteki "Yeni Proje" (New Project) butonuna tıklayın.
 * 3. Proje adını "LGS Pusulam Sync" yapın.
 * 4. Bu dosyadaki kodun tamamını kopyalayıp editöre yapıştırın ve Kaydet (Ctrl+S) deyin.
 * 5. Sağ üstteki mavi "Dağıt" (Deploy) butonuna basıp "Yeni Dağıtım" (New Deployment) seçin.
 * 6. Sol taraftaki çark simgesinden "Web Uygulaması" (Web App) seçin.
 * 7. "Açıklama": LGS Pusulam V1
 *    "Web Uygulamasını Farklı Çalıştır": "Ben (hesabınız)"
 *    "Erişimi Olanlar": "Herkes" (Anyone) olarak seçin.
 * 8. "Dağıt" butonuna basın ve size verilen "Web Uygulaması URL" adresini kopyalayın.
 *    (Örn: https://script.google.com/macros/s/.../exec)
 * 9. LGS Pusulam uygulamasında "Bulut Eşitle" butonuna basıp bu URL'yi yapıştırın!
 */

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var action = data.action;
    var familySyncId = data.familySyncId || 'default';
    
    // 1. BAĞLANTI TESTİ (PING)
    if (action === 'ping') {
      var testFolder = getOrCreateLgsFolder();
      return responseJson({
        success: true,
        message: 'Google Drive bağlantısı başarılı! Klasör: "' + testFolder.getName() + '" hazır.',
        time: new Date().toISOString()
      });
    }

    // 2. VERİ SENKRONİZASYONU (SYNC)
    if (action === 'sync') {
      var rootFolder = getOrCreateLgsFolder();
      var photoFolder = getOrCreateSubFolder(rootFolder, 'Soru Fotoğrafları');
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

      // B) Yerel güncellemeleri buluta kaydet (Last-Write-Wins)
      (local.students || []).forEach(function(s) { cloudData.students[s.id] = s; });
      (local.exams || []).forEach(function(e) { cloudData.exams[e.id] = e; });
      (local.questions || []).forEach(function(q) { cloudData.questions[q.id] = q; });
      (local.photoAssets || []).forEach(function(p) { cloudData.photoAssets[p.id] = p; });
      (local.studyPlans || []).forEach(function(sp) { cloudData.studyPlans[sp.id] = sp; });

      // C) Fotoğrafları Google Drive'da "Soru Fotoğrafları" klasörüne JPEG dosyası olarak kaydet
      savePhotosToDriveFolder(photoFolder, local.photoAssets || []);

      // D) Buluttaki güncel veriyi ana JSON dosyasına yaz
      file.setContent(JSON.stringify(cloudData));

      // E) Buluttaki tüm güncel veriyi cihaza geri döndür
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
    appName: 'LGS Pusulam Antalya Google Drive Sync Engine',
    status: 'active',
    instructions: 'Bu URL LGS Pusulam uygulaması içerisinden Google Drive ile eşitlenmek içindir.'
  });
}

function getOrCreateLgsFolder() {
  var folderName = 'LGS Pusulam Antalya';
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
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

function savePhotosToDriveFolder(photoFolder, photoAssets) {
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
      var existing = photoFolder.getFilesByName(fileName);
      while (existing.hasNext()) {
        existing.next().setTrashed(true);
      }
      photoFolder.createFile(blob);
    } catch (e) {
      // Devam et
    }
  }
}

function responseJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
