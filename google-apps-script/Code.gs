/**
 * LGS PUSULAM – ANTALYA
 * Google Apps Script & Google Drive Bulut Senkronizasyon Kodu
 * 
 * KURULUM ADIMLARI (1 Dakika):
 * 1. https://script.google.com adresine gidin.
 * 2. "Yeni Proje" (New Project) butonuna tıklayın.
 * 3. Proje adını "LGS Pusulam Sync" yapın.
 * 4. Bu dosyadaki kodun tamamını kopyalayıp editöre yapıştırın ve Kaydet (Ctrl+S) deyin.
 * 5. Sağ üstteki "Dağıt" (Deploy) -> "Yeni Dağıtım" (New Deployment) seçeneğine tıklayın.
 * 6. Sol taraftaki çark simgesinden "Web Uygulaması" (Web App) seçin.
 * 7. "Erişimi olanlar" (Who has access) kısmını "Herkes" (Anyone) olarak seçin.
 * 8. "Dağıt" butonuna basın ve size verilen "Web Uygulaması URL" adresini kopyalayın.
 * 9. LGS Pusulam uygulamasında Ayarlar -> Bulut & Eşitleme ekranına bu URL'yi yapıştırın!
 */

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var action = data.action;
    var familySyncId = data.familySyncId || 'default';
    
    // 1. PING / TEST BAĞLANTISI
    if (action === 'ping') {
      return responseJson({
        success: true,
        message: 'Google Apps Script bağlantısı başarılı! Sistem hazır.',
        time: new Date().toISOString()
      });
    }

    // 2. VERİ SENKRONİZASYONU
    if (action === 'sync') {
      var folder = getOrCreateLgsFolder();
      var fileName = 'lgs_data_' + familySyncId + '.json';
      var file = getOrCreateJsonFile(folder, fileName);
      
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

      // A) Silinenleri işle
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

      // Buluttaki güncel veriyi dosyaya yaz
      file.setContent(JSON.stringify(cloudData));

      // C) Buluttaki tüm veriyi diziye dönüştürüp cihaza geri gönder
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
    appName: 'LGS Pusulam Antalya Cloud Sync Engine',
    status: 'active',
    instructions: 'Bu URL LGS Pusulam uygulaması içerisinden veri eşitlemek içindir.'
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

function getOrCreateJsonFile(folder, fileName) {
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    return files.next();
  }
  return folder.createFile(fileName, '{}', MimeType.PLAIN_TEXT);
}

function responseJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
