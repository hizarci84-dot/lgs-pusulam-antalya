import { ERROR_REASON_MAP, SUBJECT_MAP, resolveEffectiveTopic } from '../data/curriculum';
import {
  ExamRecord,
  PercentileAndScoreEstimate,
  QuestionPhotoAsset,
  QuestionRecord,
  SchoolComparisonResult,
  StudentProfile,
  WeeklyStudyPlan,
} from '../types/models';
import { ComprehensivePatternReport } from './patternEngine';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

function escapeCsvCell(val: unknown): string {
  const str = val === null || val === undefined ? '' : String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports all exam results and subject nets as UTF-8 BOM CSV (Excel compatible in Turkish locale)
 */
export function exportExamsToCsv(student: StudentProfile, exams: ExamRecord[]) {
  const headers = [
    'Deneme Adı',
    'Tarih',
    'Yayınevi / Kurum',
    'Deneme Türü',
    'Toplam Doğru',
    'Toplam Yanlış',
    'Toplam Boş',
    'Toplam Net',
    'Sağlayıcı Puanı',
    'Katılımcı Sayısı',
    'Sıralama',
    'Türkçe Net',
    'Matematik Net',
    'Fen Bilimleri Net',
    'İnkılap Net',
    'Din Kültürü Net',
    'İngilizce Net',
    'Notlar',
  ];

  const rows = exams.map((ex) => {
    const getSubjNet = (id: string) =>
      ex.subjectResults.find((s) => s.subjectId === id)?.net?.toFixed(2) || '0.00';

    return [
      ex.name,
      ex.date,
      ex.publisher,
      ex.examType,
      ex.totalCorrect,
      ex.totalWrong,
      ex.totalBlank,
      ex.totalNet.toFixed(2),
      ex.providerScore ?? '',
      ex.participantCount ?? '',
      ex.rankInExam ?? '',
      getSubjNet('turkce'),
      getSubjNet('matematik'),
      getSubjNet('fen'),
      getSubjNet('inkilap'),
      getSubjNet('din'),
      getSubjNet('ingilizce'),
      ex.notes || '',
    ];
  });

  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCsvCell).join(';'), ...rows.map((r) => r.map(escapeCsvCell).join(';'))].join(
      '\r\n'
    );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const safeName = (student.nickname || 'ogrenci').replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_-]/g, '_');
  triggerDownload(
    blob,
    `LGS_Pusulam_Denemeler_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`
  );
}

/**
 * Exports Digital Wrong/Blank Notebook as UTF-8 BOM CSV for Excel
 */
export function exportQuestionsToCsv(
  student: StudentProfile,
  questions: QuestionRecord[],
  exams: ExamRecord[]
) {
  const examMap = new Map(exams.map((e) => [e.id, e.name]));

  const headers = [
    'Soru Kimliği',
    'Deneme',
    'Ders',
    'Soru No',
    'Durum',
    'Konu',
    'Alt Konu',
    'Konu Doğrulandı Mı',
    'Hata Nedeni',
    'Öğrenci Cevabı',
    'Doğru Cevap',
    'Öğrenme Durumu',
    'Tekrar Aşaması',
    'Sonraki Tekrar Tarihi',
    'Öğrenci Notu',
  ];

  const learningMap: Record<string, string> = {
    unsolved: 'Çözülmedi',
    needs_topic_study: 'Hâlâ Çözemiyor (Konu Çalışma Listesinde)',
    understood_with_help: 'Yardımla / Çözümü Görerek Anladı',
    mastered_independent: 'Yardımsız Doğru Çözdü',
  };

  const rows = questions.map((q) => {
    const resolved = resolveEffectiveTopic(q);
    return [
      q.id,
      examMap.get(q.examId) || q.examId,
      SUBJECT_MAP[q.subjectId]?.name || q.subjectId,
      q.questionNumber ?? '',
      q.status === 'wrong' ? 'Yanlış' : 'Boş',
      resolved.topicName,
      q.subtopicName || '',
      resolved.isVerified ? 'Evet' : 'Hayır',
      q.errorReason ? ERROR_REASON_MAP[q.errorReason]?.label || q.errorReason : 'Belirtilmedi',
      q.studentAnswer || '',
      q.correctAnswer || '',
      learningMap[q.learningStatus] || q.learningStatus,
      q.reviewStage,
      q.nextReviewDate || '',
      q.studentNote || '',
    ];
  });

  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCsvCell).join(';'), ...rows.map((r) => r.map(escapeCsvCell).join(';'))].join(
      '\r\n'
    );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const safeName = (student.nickname || 'ogrenci').replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_-]/g, '_');
  triggerDownload(
    blob,
    `LGS_Pusulam_Yanlis_Defteri_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`
  );
}

/**
 * Generates a comprehensive, printable PDF / HTML report for Parents & Students
 * with optional embedded question photo thumbnails or separate photo appendix export.
 */
export function generateComprehensivePdfReport(params: {
  student: StudentProfile;
  exams: ExamRecord[];
  questions: QuestionRecord[];
  photoAssets: QuestionPhotoAsset[];
  patternReport: ComprehensivePatternReport;
  estimate: PercentileAndScoreEstimate;
  studyPlan: WeeklyStudyPlan | null;
  schoolComparisons: SchoolComparisonResult[];
  includePhotos: boolean;
}) {
  const {
    student,
    exams,
    questions,
    photoAssets,
    patternReport,
    estimate,
    studyPlan,
    schoolComparisons,
    includePhotos,
  } = params;

  const photoMap = new Map(photoAssets.map((p) => [p.id, p]));
  const examMap = new Map(exams.map((e) => [e.id, e]));
  const maxInlinePhotos = 24;
  const hasTooManyPhotos = includePhotos && photoAssets.length > maxInlinePhotos;

  const examsRowsHtml = exams
    .map(
      (ex) => `
      <tr>
        <td><strong>${ex.name}</strong><br/><span style="color:#64748b;font-size:11px;">${ex.publisher}</span></td>
        <td>${ex.date}</td>
        <td>${ex.totalCorrect} D / ${ex.totalWrong} Y / ${ex.totalBlank} B</td>
        <td><strong>${ex.totalNet.toFixed(2)}</strong></td>
        <td>${ex.providerScore ? ex.providerScore.toFixed(2) : '-'}</td>
      </tr>`
    )
    .join('');

  const recurringRowsHtml = patternReport.topicMetrics
    .slice(0, 10)
    .map(
      (tm) => `
      <tr>
        <td>${SUBJECT_MAP[tm.subjectId]?.name || tm.subjectId}</td>
        <td><strong>${tm.topicName}</strong></td>
        <td>${tm.totalWrongCount} Y / ${tm.totalBlankCount} B (${tm.examsWithErrorsCount} deneme)</td>
        <td><strong>${tm.priorityScore}/100</strong></td>
        <td style="font-size:11px;">${tm.explanationText}</td>
      </tr>`
    )
    .join('');

  const targetSchoolRowsHtml = schoolComparisons
    .slice(0, 8)
    .map(
      (sc) => `
      <tr>
        <td><strong>${sc.school.schoolName}</strong><br/><span style="font-size:11px;color:#64748b;">${sc.school.programName} (${sc.school.district})</span></td>
        <td>${sc.latestVerifiedYear || '-'}</td>
        <td>${sc.latestMinScore ? sc.latestMinScore.toFixed(2) : '-'}</td>
        <td>${sc.latestPercentile ? `%${sc.latestPercentile.toFixed(2)}` : '-'}</td>
        <td><strong>${sc.categoryLabel}</strong></td>
      </tr>`
    )
    .join('');

  const studyPlanRowsHtml = (studyPlan?.tasks || [])
    .map(
      (t) => `
      <tr>
        <td>${t.dayName}</td>
        <td>${SUBJECT_MAP[t.subjectId]?.name || t.subjectId}</td>
        <td><strong>${t.topicName}</strong><br/><span style="font-size:11px;color:#475569;">${t.priorityReason}</span></td>
        <td>${t.durationMinutes} dk / ${t.targetQuestionCount} soru</td>
        <td>${t.completed ? 'Tamamlandı' : 'Bekliyor'}</td>
      </tr>`
    )
    .join('');

  let photosSectionHtml = '';
  if (includePhotos && questions.length > 0) {
    const subset = questions.slice(0, maxInlinePhotos);
    const cards = subset
      .map((q) => {
        const resolved = resolveEffectiveTopic(q);
        const pId = q.photoIds[0];
        const asset = pId ? photoMap.get(pId) : undefined;
        const imgSrc = asset ? asset.croppedDataUrl || asset.originalDataUrl : null;
        const exName = examMap.get(q.examId)?.name || '';
        return `
        <div style="border:1px solid #cbd5e1;border-radius:8px;padding:10px;break-inside:avoid;background:#f8fafc;">
          <div style="font-size:12px;font-weight:bold;color:#0c1c3d;margin-bottom:4px;">
            ${SUBJECT_MAP[q.subjectId]?.name} • ${resolved.topicName} (${q.status === 'wrong' ? 'Yanlış' : 'Boş'})
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${exName}</div>
          ${
            imgSrc
              ? `<img src="${imgSrc}" style="max-width:100%;max-height:150px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;display:block;margin-bottom:6px;" />`
              : ''
          }
          <div style="font-size:11px;color:#334155;">Not: ${q.studentNote || '-'}</div>
        </div>`;
      })
      .join('');

    photosSectionHtml = `
      <h2>5. Yanlış ve Boş Soru Görsel Arşivi ${
        hasTooManyPhotos
          ? `(İlk ${maxInlinePhotos} soru gösteriliyor; toplam ${photoAssets.length} görsel için Ek Dosya seçeneğini kullanabilirsiniz)`
          : ''
      }</h2>
      <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:12px;margin-top:10px;">
        ${cards}
      </div>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>LGS Pusulam – Antalya Gelişim ve Analiz Raporu</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 24px; line-height: 1.45; }
    .header { background: #0c1c3d; color: #ffffff; padding: 20px 24px; border-radius: 12px; margin-bottom: 20px; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; }
    .header p { margin: 0; font-size: 13px; color: #b4eef0; }
    h2 { color: #0c1c3d; font-size: 16px; border-bottom: 2px solid #1f8a9a; padding-bottom: 6px; margin-top: 22px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; color: #0c1c3d; font-weight: 700; }
    .grid-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .stat-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
    .stat-val { font-size: 18px; font-weight: bold; color: #0c1c3d; margin-top: 4px; }
    .notice { background: #effcfc; border-left: 4px solid #1f8a9a; padding: 10px 14px; font-size: 12px; margin: 12px 0; }
    @media print {
      .no-print { display: none !important; }
      body { margin: 10px; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:16px;display:flex;gap:10px;">
    <button onclick="window.print()" style="background:#0c1c3d;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-weight:bold;cursor:pointer;">
      PDF Olarak Kaydet / Yazdır
    </button>
    <button onclick="window.close()" style="background:#e2e8f0;color:#0f172a;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;">
      Kapat
    </button>
  </div>

  <div class="header">
    <h1>LGS Pusulam – Antalya | Veli & Öğrenci Gelişim Raporu</h1>
    <p>Öğrenci: ${student.nickname || 'Öğrenci'} (${student.gradeLevel} • ${student.antalyaDistrict}) | Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
  </div>

  <div class="grid-summary">
    <div class="stat-box">
      <div class="stat-label">Kayıtlı Deneme Sayısı</div>
      <div class="stat-val">${exams.length} Deneme</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Son Deneme Neti</div>
      <div class="stat-val">${estimate.latestExamNet !== null ? `${estimate.latestExamNet.toFixed(2)} / 90` : 'Veri Yok'}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Tahmini Türkiye Geneli Yüzdelik Bandı</div>
      <div class="stat-val">${
        estimate.estimatedNationalPercentileRange
          ? `%${estimate.estimatedNationalPercentileRange[0]} – %${estimate.estimatedNationalPercentileRange[1]}`
          : 'Yeterli Veri Yok'
      }</div>
    </div>
  </div>

  <div class="notice">
    <strong>Tahmin Modeli ve Güven Notu:</strong> ${estimate.uncertaintyNotice}
  </div>

  <h2>1. Deneme Sınavları Geçmişi ve Net Gelişimi</h2>
  ${
    exams.length === 0
      ? '<p>Henüz kayıtlı deneme sınavı bulunmamaktadır.</p>'
      : `<table>
          <thead>
            <tr>
              <th>Deneme Adı</th>
              <th>Tarih</th>
              <th>Doğru / Yanlış / Boş</th>
              <th>Toplam Net</th>
              <th>Sağlayıcı Puanı</th>
            </tr>
          </thead>
          <tbody>${examsRowsHtml}</tbody>
        </table>`
  }

  <h2>2. Tekrarlayan Hata ve Konu Eksikliği Analizi</h2>
  ${
    patternReport.topicMetrics.length === 0
      ? '<p>Henüz konu bazlı yanlış/boş kaydı bulunmamaktadır.</p>'
      : `<table>
          <thead>
            <tr>
              <th>Ders</th>
              <th>Konu</th>
              <th>Hata Dağılımı</th>
              <th>Öncelik Puanı</th>
              <th>Sistem Değerlendirmesi</th>
            </tr>
          </thead>
          <tbody>${recurringRowsHtml}</tbody>
        </table>`
  }

  <h2>3. Kişiselleştirilmiş Haftalık Çalışma Planı</h2>
  ${
    !studyPlan || studyPlan.tasks.length === 0
      ? '<p>Haftalık çalışma planı oluşturulmadı.</p>'
      : `<p style="font-size:12px;color:#334155;">${studyPlan.weeklySummaryReport}</p>
        <table>
          <thead>
            <tr>
              <th>Gün</th>
              <th>Ders</th>
              <th>Konu ve Öncelik Gerekçesi</th>
              <th>Süre / Hedef</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>${studyPlanRowsHtml}</tbody>
        </table>`
  }

  <h2>4. Antalya Hedef Liselerle Karşılaştırma</h2>
  <table>
    <thead>
      <tr>
        <th>Okul ve Program</th>
        <th>Son Veri Yılı</th>
        <th>Taban Puan</th>
        <th>Yüzdelik Dilim</th>
        <th>Hedef Kategorisi</th>
      </tr>
    </thead>
    <tbody>${targetSchoolRowsHtml}</tbody>
  </table>

  ${photosSectionHtml}
</body>
</html>`;

  const reportWindow = window.open('', '_blank');
  if (reportWindow) {
    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
  } else {
    // Fallback download as HTML report if popup blocked
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    triggerDownload(
      blob,
      `LGS_Pusulam_Gelisim_Raporu_${new Date().toISOString().slice(0, 10)}.html`
    );
  }
}

export function exportPhotosAppendixFile(
  student: StudentProfile,
  questions: QuestionRecord[],
  photoAssets: QuestionPhotoAsset[]
) {
  const payload = {
    appName: 'LGS Pusulam – Antalya (Soru Fotoğrafları Ek Arşivi)',
    studentNickname: student.nickname,
    exportedAt: new Date().toISOString(),
    questionCount: questions.length,
    photoCount: photoAssets.length,
    photoAssets,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  triggerDownload(
    blob,
    `LGS_Pusulam_Fotograf_Ek_Arsivi_${new Date().toISOString().slice(0, 10)}.json`
  );
}
