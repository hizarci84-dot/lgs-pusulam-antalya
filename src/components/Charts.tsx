import React, { useState } from 'react';
import { ERROR_REASONS, LGS_SUBJECTS, SUBJECT_MAP } from '../data/curriculum';
import { ErrorReasonCode, ExamRecord, QuestionRecord, StudentProfile, SubjectId } from '../types/models';

// ==================== 1. GELİŞİM TRENDİ GRAFİĞİ (NET / PUAN / YÜZDELİK DİLİM) ====================
interface NetTrendChartProps {
  exams: ExamRecord[];
  limit?: 5 | 10 | 'all';
  initialMetric?: 'net' | 'score' | 'percentile';
  onSelectExam?: (examId: string) => void;
}

export const NetTrendChart: React.FC<NetTrendChartProps> = ({
  exams,
  limit = 10,
  initialMetric = 'net',
  onSelectExam,
}) => {
  const [metric, setMetric] = useState<'net' | 'score' | 'percentile'>(initialMetric);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const chronologicalAll = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  const chronological = limit === 'all' ? chronologicalAll : chronologicalAll.slice(-limit);

  if (chronological.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-600 space-y-1">
        <p className="font-bold text-navy-900 text-sm">Gelişim Grafiği İçin Henüz Deneme Kaydı Yok</p>
        <p>Eklediğiniz denemeler kaydedildikçe zaman içerisindeki net, puan ve yüzdelik dilim değişiminiz burada grafik olarak çizilecektir.</p>
      </div>
    );
  }

  const width = 600;
  const height = 230;
  const padLeft = 45;
  const padRight = 24;
  const padTop = 28;
  const padBottom = 48;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Extract metric values
  const values = chronological.map((e) => {
    if (metric === 'score') {
      return e.providerScore && e.providerScore > 0 ? e.providerScore : 300;
    }
    if (metric === 'percentile') {
      return e.providerPercentile && e.providerPercentile > 0 ? e.providerPercentile : 10;
    }
    return e.totalNet;
  });

  // Calculate scales
  let minVal: number;
  let maxVal: number;

  if (metric === 'net') {
    minVal = Math.max(0, Math.floor(Math.min(...values) - 5));
    maxVal = Math.min(90, Math.ceil(Math.max(...values) + 5));
  } else if (metric === 'score') {
    minVal = Math.max(100, Math.floor(Math.min(...values) - 20));
    maxVal = Math.min(500, Math.ceil(Math.max(...values) + 20));
  } else {
    // Percentile (Lower is better: 0.1% is top)
    minVal = Math.max(0.1, Number((Math.min(...values) * 0.7).toFixed(1)));
    maxVal = Math.min(100, Number((Math.max(...values) * 1.3).toFixed(1)));
  }

  const range = Math.max(1, maxVal - minVal);

  const getX = (idx: number) => {
    if (chronological.length === 1) return padLeft + plotW / 2;
    return padLeft + (idx / (chronological.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    if (metric === 'percentile') {
      // For percentiles, lower is better (placed near top)
      return padTop + ((val - minVal) / range) * plotH;
    }
    // For net and score, higher is better (placed near top)
    return padTop + plotH - ((val - minVal) / range) * plotH;
  };

  const points = chronological.map((ex, i) => ({
    x: getX(i),
    y: getY(values[i]),
    val: values[i],
    exam: ex,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints =
    points.length > 1
      ? `${points[0].x},${padTop + plotH} ${polylinePoints} ${
          points[points.length - 1].x
        },${padTop + plotH}`
      : '';

  // Theme colors based on selected metric
  const colorScheme =
    metric === 'net'
      ? { stroke: '#0c1c3d', fillGrad: '#1f8a9a', text: '#1f8a9a', label: 'Net' }
      : metric === 'score'
      ? { stroke: '#047857', fillGrad: '#10b981', text: '#059669', label: 'Puan' }
      : { stroke: '#6d28d9', fillGrad: '#8b5cf6', text: '#7c3aed', label: 'Yüzdelik' };

  const gridTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const v = minVal + t * range;
    return metric === 'percentile' ? Number(v.toFixed(1)) : Math.round(v);
  });

  const activePoint = activePointIndex !== null ? points[activePointIndex] : null;

  return (
    <div className="space-y-3">
      {/* Metric Selector Pills (Mobile Friendly) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMetric('net')}
            className={`px-3 py-1.5 rounded-lg transition ${
              metric === 'net'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            📈 Toplam Net
          </button>
          <button
            type="button"
            onClick={() => setMetric('score')}
            className={`px-3 py-1.5 rounded-lg transition ${
              metric === 'score'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            🎯 2026 LGS Puanı
          </button>
          <button
            type="button"
            onClick={() => setMetric('percentile')}
            className={`px-3 py-1.5 rounded-lg transition ${
              metric === 'percentile'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            🏆 Yüzdelik Dilim
          </button>
        </div>

        <div className="text-[11px] font-semibold text-slate-500">
          {chronological.length} Deneme Verisi
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 sm:p-4 overflow-hidden relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none touch-pan-x"
          role="img"
          aria-label={`Deneme gelişim grafiği (${metric})`}
        >
          <defs>
            <linearGradient id={`trendAreaGrad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorScheme.fillGrad} stopOpacity="0.28" />
              <stop offset="100%" stopColor={colorScheme.fillGrad} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill="#64748b"
                >
                  {metric === 'percentile' ? `%${tick}` : tick}
                </text>
              </g>
            );
          })}

          {/* Area & Polyline */}
          {points.length > 1 && (
            <>
              <polygon points={areaPoints} fill={`url(#trendAreaGrad-${metric})`} />
              <polyline
                fill="none"
                stroke={colorScheme.stroke}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            </>
          )}

          {/* Data Points */}
          {points.map((p, idx) => {
            const isHovered = activePointIndex === idx;
            const formattedVal =
              metric === 'percentile'
                ? `%${p.val.toFixed(2)}`
                : metric === 'score'
                ? `${p.val.toFixed(1)} P`
                : `${p.val.toFixed(1)} Net`;

            return (
              <g
                key={p.exam.id}
                className="cursor-pointer"
                onMouseEnter={() => setActivePointIndex(idx)}
                onMouseLeave={() => setActivePointIndex(null)}
                onClick={() => {
                  setActivePointIndex(idx);
                  if (onSelectExam) onSelectExam(p.exam.id);
                }}
              >
                {/* Clickable Area Helper */}
                <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

                {/* Point Node */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? '7' : '5'}
                  fill={isHovered ? colorScheme.stroke : colorScheme.fillGrad}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? '3' : '2'}
                  className="transition-all"
                />

                {/* Point Value */}
                <text
                  x={p.x}
                  y={p.y - 9}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={colorScheme.stroke}
                >
                  {formattedVal}
                </text>

                {/* Date Label Below */}
                <text
                  x={p.x}
                  y={padTop + plotH + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="#475569"
                >
                  {p.exam.date.slice(5)}
                </text>

                {/* Index Subtext */}
                <text
                  x={p.x}
                  y={padTop + plotH + 28}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#94a3b8"
                >
                  #{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip for Active Point on Mobile/Desktop */}
        {activePoint && (
          <div className="mt-2 p-2.5 bg-navy-950 text-white rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
            <div>
              <span className="font-extrabold text-turquoise-300">{activePoint.exam.name}</span>
              <span className="text-slate-300 ml-2">({activePoint.exam.date})</span>
            </div>
            <div className="flex items-center gap-3 font-semibold text-[11px]">
              <span className="text-emerald-300">Net: {activePoint.exam.totalNet.toFixed(2)}</span>
              {activePoint.exam.providerScore && (
                <span className="text-sky-300">Puan: {activePoint.exam.providerScore.toFixed(2)}</span>
              )}
              {activePoint.exam.providerPercentile && (
                <span className="text-purple-300">Dilim: %{activePoint.exam.providerPercentile.toFixed(2)}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== 2. YÜZDELİK DİLİM HİSTOGRAM GRAFİĞİ ====================
interface PercentileHistogramChartProps {
  exams: ExamRecord[];
  student?: StudentProfile;
}

export const PercentileHistogramChart: React.FC<PercentileHistogramChartProps> = ({
  exams,
  student,
}) => {
  if (exams.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-600">
        Yüzdelik dilim histogramını oluşturmak için henüz deneme verisi bulunmuyor.
      </div>
    );
  }

  // Gather percentiles from all exams
  const percentiles = exams.map((ex) => {
    if (ex.providerPercentile && ex.providerPercentile > 0) {
      return ex.providerPercentile;
    }
    // Estimate if missing
    let weightedPoints = 0;
    for (const sr of ex.subjectResults) {
      const def = SUBJECT_MAP[sr.subjectId as SubjectId];
      if (def) {
        const net = Math.max(0, sr.correct - sr.wrong / 3);
        weightedPoints += (net / sr.questionCount) * def.defaultQuestionCount * def.coefficientWeight;
      }
    }
    const ratio = Math.max(0, Math.min(1, weightedPoints / 270));
    if (ratio >= 0.967) return 0.45;
    if (ratio >= 0.933) return 1.35;
    if (ratio >= 0.889) return 2.95;
    if (ratio >= 0.844) return 5.20;
    if (ratio >= 0.778) return 9.10;
    if (ratio >= 0.700) return 14.80;
    if (ratio >= 0.600) return 24.50;
    return 38.0;
  });

  const bestPercentile = Math.min(...percentiles);
  const avgPercentile = Number(
    (percentiles.reduce((a, b) => a + b, 0) / percentiles.length).toFixed(2)
  );
  const latestExam = [...exams].sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestPercentile = latestExam?.providerPercentile || percentiles[percentiles.length - 1];

  // Define histogram bins matching Antalya central exam high schools
  const bins = [
    { label: '%0.01 – %1.00', min: 0, max: 1.0, title: 'Yusuf Ziya Öner vb. Üst Fen', color: '#0d9488' },
    { label: '%1.01 – %2.50', min: 1.0, max: 2.5, title: 'Antalya Anadolu, Adem-Tolunay AL', color: '#14b8a6' },
    { label: '%2.51 – %5.00', min: 2.5, max: 5.0, title: 'TOBB Fen, Hüseyin Girenes FL', color: '#0284c7' },
    { label: '%5.01 – %8.00', min: 5.0, max: 8.0, title: 'Aksu Fen, İlhami Tankut AL, Gülveren', color: '#6366f1' },
    { label: '%8.01 – %15.00', min: 8.0, max: 15.0, title: 'Proje Anadolu & İHL Liseleri', color: '#f59e0b' },
    { label: '%15.01+', min: 15.0, max: 100, title: 'Diğer Sınavlı Liseler', color: '#ef4444' },
  ];

  const counts = bins.map((bin) => {
    const matched = percentiles.filter((p) => p > bin.min && p <= bin.max);
    return matched.length;
  });

  const maxCount = Math.max(1, ...counts);

  return (
    <div className="space-y-3">
      {/* Summary KPI Badges (Mobile Stackable Grid) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
          <div className="text-[10px] sm:text-xs font-semibold text-emerald-800">En İyi Dilim</div>
          <div className="text-sm sm:text-base font-extrabold text-emerald-950">%{bestPercentile.toFixed(2)}</div>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5">
          <div className="text-[10px] sm:text-xs font-semibold text-sky-800">Ortalama Dilim</div>
          <div className="text-sm sm:text-base font-extrabold text-sky-950">%{avgPercentile.toFixed(2)}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-2.5">
          <div className="text-[10px] sm:text-xs font-semibold text-purple-800">Son Deneme</div>
          <div className="text-sm sm:text-base font-extrabold text-purple-950">
            {latestPercentile ? `%${Number(latestPercentile).toFixed(2)}` : '—'}
          </div>
        </div>
      </div>

      {/* Histogram Bars */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-2.5">
        <div className="text-xs font-bold text-navy-900 mb-1 flex items-center justify-between">
          <span>Antalya Liseleri Yüzdelik Eşiklerine Göre Dağılım</span>
          <span className="text-[11px] text-slate-500 font-normal">Toplam {exams.length} Deneme</span>
        </div>

        <div className="space-y-2">
          {bins.map((bin, idx) => {
            const count = counts[idx];
            const pctOfMax = (count / maxCount) * 100;
            const pctOfTotal = ((count / exams.length) * 100).toFixed(0);
            const isLatestInBin =
              latestPercentile && latestPercentile > bin.min && latestPercentile <= bin.max;

            return (
              <div key={bin.label} className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between text-xs gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 font-mono text-[11px] sm:text-xs">
                      {bin.label}
                    </span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">
                      ({bin.title})
                    </span>
                    {isLatestInBin && (
                      <span className="text-[9px] bg-purple-700 text-white font-bold px-1.5 py-0.5 rounded-full">
                        Son Deneme
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-700 text-[11px]">
                    {count} Deneme <span className="text-slate-400 font-normal">({pctOfTotal}%)</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex items-center">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(count > 0 ? 5 : 0, pctOfMax)}%`,
                      backgroundColor: bin.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==================== 3. DERS BAZINDA DOĞRU, YANLIŞ VE BOŞ GRAFİKLERİ ====================
interface SubjectBreakdownBarChartProps {
  exams: ExamRecord[];
}

export const SubjectBreakdownBarChart: React.FC<SubjectBreakdownBarChartProps> = ({
  exams,
}) => {
  const [selectedExamId, setSelectedExamId] = React.useState<string>('average');

  if (exams.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-600">
        Ders bazlı doğru/yanlış grafiği için henüz deneme verisi bulunmuyor.
      </div>
    );
  }

  const isAvg = selectedExamId === 'average';
  const targetExam = isAvg ? null : exams.find((e) => e.id === selectedExamId);

  const subjectStats = LGS_SUBJECTS.map((subj) => {
    const qCount = subj.defaultQuestionCount;
    if (!isAvg && targetExam) {
      const sr = targetExam.subjectResults.find((s) => s.subjectId === subj.id);
      return {
        subject: subj,
        qCount,
        correct: sr?.correct || 0,
        wrong: sr?.wrong || 0,
        blank: sr?.blank || 0,
        net: sr?.net || 0,
      };
    } else {
      let totalC = 0;
      let totalW = 0;
      let totalB = 0;
      let totalN = 0;
      let matchCount = 0;

      for (const ex of exams) {
        const sr = ex.subjectResults.find((s) => s.subjectId === subj.id);
        if (sr) {
          totalC += sr.correct;
          totalW += sr.wrong;
          totalB += sr.blank;
          totalN += sr.net;
          matchCount++;
        }
      }

      const denom = Math.max(1, matchCount);
      return {
        subject: subj,
        qCount,
        correct: Number((totalC / denom).toFixed(1)),
        wrong: Number((totalW / denom).toFixed(1)),
        blank: Number((totalB / denom).toFixed(1)),
        net: Number((totalN / denom).toFixed(2)),
      };
    }
  });

  return (
    <div className="space-y-3">
      {/* Exam Selector Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700">Ders Performansı Kaynağı:</label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="text-xs font-semibold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-navy-900 outline-none focus:ring-2 focus:ring-turquoise-500 max-w-full"
        >
          <option value="average">📊 Tüm Denemelerin Ortalaması ({exams.length} Deneme)</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.date} — {ex.name} (Net: {ex.totalNet.toFixed(1)})
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs font-semibold bg-slate-50 p-2 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-800">Doğru</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-800">Yanlış</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          <span className="text-slate-800">Boş</span>
        </div>
      </div>

      {/* Stacked / Grouped Bars for each Subject (Mobile Optimized) */}
      <div className="space-y-2.5">
        {subjectStats.map(({ subject, qCount, correct, wrong, blank, net }) => {
          const cPct = (correct / qCount) * 100;
          const wPct = (wrong / qCount) * 100;
          const bPct = (blank / qCount) * 100;

          return (
            <div
              key={subject.id}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2 hover:border-turquoise-300 transition-colors"
            >
              {/* Row 1: Subject Name & Net */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-navy-900 text-sm">{subject.name}</span>
                <span className="font-extrabold text-navy-950 bg-turquoise-50 text-turquoise-900 px-2.5 py-0.5 rounded-lg border border-turquoise-200 text-xs">
                  {net} Net <span className="font-normal text-slate-500">/ {qCount}</span>
                </span>
              </div>

              {/* Row 2: Segmented Bar */}
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                {correct > 0 && (
                  <div
                    style={{ width: `${cPct}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300 flex items-center justify-center text-[9px] font-bold text-white"
                    title={`Doğru: ${correct}`}
                  >
                    {correct >= 2 ? correct : ''}
                  </div>
                )}
                {wrong > 0 && (
                  <div
                    style={{ width: `${wPct}%` }}
                    className="h-full bg-rose-500 transition-all duration-300 flex items-center justify-center text-[9px] font-bold text-white"
                    title={`Yanlış: ${wrong}`}
                  >
                    {wrong >= 1.5 ? wrong : ''}
                  </div>
                )}
                {blank > 0 && (
                  <div
                    style={{ width: `${bPct}%` }}
                    className="h-full bg-amber-400 transition-all duration-300 flex items-center justify-center text-[9px] font-bold text-amber-950"
                    title={`Boş: ${blank}`}
                  >
                    {blank >= 1.5 ? blank : ''}
                  </div>
                )}
              </div>

              {/* Row 3: Breakdown Counters */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                <span className="text-emerald-700 font-bold">{correct} Doğru</span>
                <span className="text-rose-700 font-bold">{wrong} Yanlış</span>
                <span className="text-amber-700 font-bold">{blank} Boş</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== 4. HATA NEDENLERİ DAĞILIM GRAFİĞİ ====================
interface ErrorReasonDistributionChartProps {
  questions: QuestionRecord[];
}

export const ErrorReasonDistributionChart: React.FC<ErrorReasonDistributionChartProps> = ({
  questions,
}) => {
  const wrongOrBlank = questions.filter((q) => q.status === 'wrong' || q.status === 'blank');

  if (wrongOrBlank.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-600 space-y-1">
        <p className="font-bold text-navy-900 text-sm">Hata Nedeni Dağılımı İçin Soru Kaydı Yok</p>
        <p>Yanlış ve boş sorularınızı fotoğraflayıp hata nedenlerini seçtiğinizde, en çok hangi sebepten puan kaybettiğiniz burada görselleştirilecektir.</p>
      </div>
    );
  }

  // Tally counts per error reason
  const reasonCounts: Record<string, number> = {};
  ERROR_REASONS.forEach((r) => {
    reasonCounts[r.code] = 0;
  });

  let taggedCount = 0;
  wrongOrBlank.forEach((q) => {
    if (q.errorReason) {
      reasonCounts[q.errorReason] = (reasonCounts[q.errorReason] || 0) + 1;
      taggedCount++;
    }
  });

  const totalErrors = Math.max(1, taggedCount);

  // Map to sorted list
  const reasonColors: Record<ErrorReasonCode, string> = {
    dikkat_hatasi: '#f97316', // Orange
    islem_hatasi: '#ef4444', // Red
    konu_eksigi: '#dc2626', // Deep Red
    yanlis_okuma: '#0284c7', // Sky
    sure_yetmedi: '#8b5cf6', // Purple
    cozum_yontemi_bulamama: '#6366f1', // Indigo
    bilgiyi_unutma: '#0d9488', // Teal
    diger: '#64748b', // Slate
  };

  const sortedReasons = ERROR_REASONS.map((r) => {
    const count = reasonCounts[r.code] || 0;
    const pct = Number(((count / totalErrors) * 100).toFixed(1));
    return {
      ...r,
      count,
      pct,
      color: reasonColors[r.code],
    };
  }).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(1, ...sortedReasons.map((r) => r.count));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-navy-900">Hata Nedenleri ve Kayıp Puan Kaynakları</span>
        <span className="text-[11px] text-slate-500 font-semibold">
          {taggedCount} / {wrongOrBlank.length} Soru Analiz Edildi
        </span>
      </div>

      <div className="space-y-2">
        {sortedReasons.map((r) => {
          const pctOfMax = (r.count / maxCount) * 100;
          return (
            <div
              key={r.code}
              className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{r.label}</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-navy-900">{r.count} Soru</span>
                  <span className="text-slate-400 font-normal">({r.pct}%)</span>
                </div>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(r.count > 0 ? 4 : 0, pctOfMax)}%`,
                    backgroundColor: r.color,
                  }}
                />
              </div>

              {r.count > 0 && (
                <div className="text-[10px] text-slate-500 italic">
                  Tavsiye: {r.recommendedAction}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== 5. DERS BAZINDA NET DEĞİŞİMİ GEÇMİŞ ÇİZGİ GRAFİĞİ ====================
interface SubjectHistoryComparisonChartProps {
  exams: ExamRecord[];
  selectedSubjectId: SubjectId;
}

export const SubjectHistoryComparisonChart: React.FC<
  SubjectHistoryComparisonChartProps
> = ({ exams, selectedSubjectId }) => {
  const subj = SUBJECT_MAP[selectedSubjectId];
  const chronological = [...exams]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);

  if (chronological.length === 0) {
    return (
      <div className="text-xs text-slate-500 p-4 text-center">
        Bu ders için henüz deneme verisi bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chronological.map((ex) => {
        const sr = ex.subjectResults.find(
          (s) => s.subjectId === selectedSubjectId
        );
        if (!sr) return null;
        const pct = Math.max(
          0,
          Math.min(100, (sr.net / Math.max(1, sr.questionCount)) * 100)
        );
        return (
          <div key={ex.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="truncate text-slate-700 font-semibold" title={ex.name}>
              {ex.date.slice(5)} • {ex.name}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: subj.color }}
                />
              </div>
              <div className="w-20 text-right font-extrabold text-navy-950">
                {sr.net.toFixed(2)} Net
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==================== 6. SON DENEME KARNESİ ÇUBUKLARI ====================
interface SubjectNetBarsProps {
  exam: ExamRecord;
  previousExam?: ExamRecord | null;
}

export const SubjectNetBars: React.FC<SubjectNetBarsProps> = ({
  exam,
  previousExam,
}) => {
  return (
    <div className="space-y-2">
      {LGS_SUBJECTS.map((subj) => {
        const sr = exam.subjectResults.find((s) => s.subjectId === subj.id);
        const prevSr = previousExam?.subjectResults.find(
          (s) => s.subjectId === subj.id
        );
        const qCount = sr?.questionCount || subj.defaultQuestionCount;
        const net = sr?.net ?? 0;
        const pct = Math.max(0, Math.min(100, (net / Math.max(1, qCount)) * 100));
        const diff = prevSr ? Number((net - prevSr.net).toFixed(2)) : null;

        return (
          <div key={subj.id} className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-navy-900">{subj.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">
                  {sr?.correct || 0}D • {sr?.wrong || 0}Y • {sr?.blank || 0}B
                </span>
                <span className="font-extrabold text-navy-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {net.toFixed(2)} Net
                </span>
                {diff !== null && (
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      diff > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : diff < 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  backgroundColor: subj.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
