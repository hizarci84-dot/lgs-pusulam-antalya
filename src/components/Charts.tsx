import React from 'react';
import { LGS_SUBJECTS, SUBJECT_MAP } from '../data/curriculum';
import { ExamRecord, StudentProfile, SubjectId } from '../types/models';

interface NetTrendChartProps {
  exams: ExamRecord[];
  limit: 5 | 10;
  onSelectExam?: (examId: string) => void;
}

export const NetTrendChart: React.FC<NetTrendChartProps> = ({
  exams,
  limit,
  onSelectExam,
}) => {
  const chronological = [...exams]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-limit);

  if (chronological.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center text-sm text-slate-600">
        Gelişim grafiğini görüntülemek için henüz deneme verisi bulunmuyor. İlk denemenizi eklediğinizde gerçek net değişiminiz burada çizilecektir.
      </div>
    );
  }

  const width = 560;
  const height = 210;
  const padLeft = 38;
  const padRight = 22;
  const padTop = 24;
  const padBottom = 42;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const nets = chronological.map((e) => e.totalNet);
  const minVal = Math.max(0, Math.floor(Math.min(...nets) - 6));
  const maxVal = Math.min(90, Math.ceil(Math.max(...nets) + 6));
  const range = Math.max(10, maxVal - minVal);

  const getX = (idx: number) => {
    if (chronological.length === 1) return padLeft + plotW / 2;
    return padLeft + (idx / (chronological.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    return padTop + plotH - ((val - minVal) / range) * plotH;
  };

  const points = chronological.map((ex, i) => ({
    x: getX(i),
    y: getY(ex.totalNet),
    exam: ex,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints =
    points.length > 1
      ? `${points[0].x},${padTop + plotH} ${polylinePoints} ${
          points[points.length - 1].x
        },${padTop + plotH}`
      : '';

  const gridTicks = [0, 0.25, 0.5, 0.75, 1].map((t) =>
    Math.round(minVal + t * range)
  );

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label={`Son ${chronological.length} deneme net gelişim grafiği`}
      >
        <defs>
          <linearGradient id="netAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f8a9a" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#1f8a9a" stopOpacity="0.02" />
          </linearGradient>
        </defs>

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
                fontSize="11"
                fill="#64748b"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {points.length > 1 && (
          <>
            <polygon points={areaPoints} fill="url(#netAreaGrad)" />
            <polyline
              fill="none"
              stroke="#0c1c3d"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />
          </>
        )}

        {points.map((p, idx) => (
          <g
            key={p.exam.id}
            className={onSelectExam ? 'cursor-pointer' : ''}
            onClick={() => onSelectExam && onSelectExam(p.exam.id)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r="6"
              fill="#1f8a9a"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#0c1c3d"
            >
              {p.exam.totalNet.toFixed(1)}
            </text>
            <text
              x={p.x}
              y={padTop + plotH + 16}
              textAnchor="middle"
              fontSize="10"
              fill="#475569"
            >
              {p.exam.date.slice(5)}
            </text>
            <text
              x={p.x}
              y={padTop + plotH + 29}
              textAnchor="middle"
              fontSize="9.5"
              fill="#64748b"
            >
              #{idx + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

interface SubjectNetBarsProps {
  exam: ExamRecord;
  previousExam?: ExamRecord | null;
}

export const SubjectNetBars: React.FC<SubjectNetBarsProps> = ({
  exam,
  previousExam,
}) => {
  return (
    <div className="space-y-2.5">
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
          <div key={subj.id} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-navy-900">{subj.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  {sr?.correct || 0}D • {sr?.wrong || 0}Y • {sr?.blank || 0}B
                </span>
                <span className="font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {net.toFixed(2)} / {qCount} Net
                </span>
                {diff !== null && (
                  <span
                    className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
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
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
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
          <div key={ex.id} className="flex items-center gap-2 text-xs">
            <div className="w-24 truncate text-slate-600 font-medium" title={ex.name}>
              {ex.date.slice(5)} • {ex.name}
            </div>
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: subj.color }}
              />
            </div>
            <div className="w-24 text-right font-bold text-navy-900">
              {sr.net.toFixed(2)} Net ({sr.wrong}Y/{sr.blank}B)
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==================== YÜZDELİK DİLİM HİSTOGRAM GRAFİĞİ ====================
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
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center text-sm text-slate-600">
        Yüzdelik dilim histogramını oluşturmak için henüz deneme verisi bulunmuyor.
      </div>
    );
  }

  // 1. Gather percentiles from all exams
  const percentiles = exams.map((ex) => {
    if (ex.providerPercentile && ex.providerPercentile > 0) {
      return ex.providerPercentile;
    }
    // Fallback: estimate from subject results
    let weightedPoints = 0;
    for (const sr of ex.subjectResults) {
      const def = SUBJECT_MAP[sr.subjectId as SubjectId];
      if (def) {
        const net = Math.max(0, sr.correct - sr.wrong / 3);
        weightedPoints += (net / sr.questionCount) * def.defaultQuestionCount * def.coefficientWeight;
      }
    }
    const ratio = Math.max(0, Math.min(1, weightedPoints / 270));
    // Approximate curve
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

  // 2. Define histogram bins matching Antalya central exam schools
  const bins = [
    { label: '%0.01 - %1.0', min: 0, max: 1.0, title: 'Yusuf Ziya Öner vb. Üst Fen', color: '#0d9488' },
    { label: '%1.01 - %2.5', min: 1.0, max: 2.5, title: 'Antalya Anadolu, Adem Tolunay', color: '#14b8a6' },
    { label: '%2.51 - %5.0', min: 2.5, max: 5.0, title: 'Gazi Anadolu, Metin-Nuran', color: '#0284c7' },
    { label: '%5.01 - %8.0', min: 5.0, max: 8.0, title: 'Nitelikli Anadolu Liseleri', color: '#6366f1' },
    { label: '%8.01 - %15.0', min: 8.0, max: 15.0, title: 'Proje Anadolu & İHL', color: '#f59e0b' },
    { label: '%15.01+', min: 15.0, max: 100, title: 'Diğer Sınavlı Liseler', color: '#ef4444' },
  ];

  const counts = bins.map((bin) => {
    const matched = percentiles.filter((p) => p > bin.min && p <= bin.max);
    return matched.length;
  });

  const maxCount = Math.max(1, ...counts);

  return (
    <div className="space-y-4">
      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5">
          <div className="text-[11px] font-medium text-emerald-800">En İyi Dilim</div>
          <div className="text-base font-extrabold text-emerald-900">%{bestPercentile.toFixed(2)}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-2.5">
          <div className="text-[11px] font-medium text-blue-800">Ortalama Dilim</div>
          <div className="text-base font-extrabold text-blue-900">%{avgPercentile.toFixed(2)}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-2.5">
          <div className="text-[11px] font-medium text-purple-800">Son Deneme</div>
          <div className="text-base font-extrabold text-purple-900">
            {latestPercentile ? `%${Number(latestPercentile).toFixed(2)}` : '—'}
          </div>
        </div>
      </div>

      {/* Histogram Bars */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="text-xs font-bold text-navy-900 mb-2">
          Denemelerin Yüzdelik Dilim Dağılımı (Histogram Frekansı)
        </div>

        <div className="space-y-2.5">
          {bins.map((bin, idx) => {
            const count = counts[idx];
            const pctOfMax = (count / maxCount) * 100;
            const pctOfTotal = ((count / exams.length) * 100).toFixed(0);
            const isLatestInBin =
              latestPercentile && latestPercentile > bin.min && latestPercentile <= bin.max;

            return (
              <div key={bin.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 font-mono w-24">{bin.label}</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">({bin.title})</span>
                    {isLatestInBin && (
                      <span className="text-[9px] bg-purple-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                        Son Deneme
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-700">
                    {count} Deneme <span className="text-slate-400 font-normal">({pctOfTotal}%)</span>
                  </div>
                </div>

                <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex items-center">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(count > 0 ? 4 : 0, pctOfMax)}%`,
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

// ==================== DERS BAZLI DOĞRU, YANLIŞ VE BOŞ GRAFİKLERİ ====================
interface SubjectBreakdownBarChartProps {
  exams: ExamRecord[];
}

export const SubjectBreakdownBarChart: React.FC<SubjectBreakdownBarChartProps> = ({
  exams,
}) => {
  const [selectedExamId, setSelectedExamId] = React.useState<string>('average');

  if (exams.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center text-sm text-slate-600">
        Ders bazlı doğru/yanlış grafiği için henüz deneme verisi bulunmuyor.
      </div>
    );
  }

  // Calculate subject metrics based on selection (average vs single exam)
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
    <div className="space-y-4">
      {/* Exam Selector Dropdown */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700">Ders Performansı Kaynağı:</label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-navy-900 outline-none focus:ring-2 focus:ring-turquoise-500"
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
      <div className="flex items-center justify-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
          <span className="text-slate-700">Doğru</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
          <span className="text-slate-700">Yanlış</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
          <span className="text-slate-700">Boş</span>
        </div>
      </div>

      {/* Stacked / Grouped Bars for each Subject */}
      <div className="space-y-3">
        {subjectStats.map(({ subject, qCount, correct, wrong, blank, net }) => {
          const totalValid = Math.max(1, correct + wrong + blank);
          const cPct = (correct / qCount) * 100;
          const wPct = (wrong / qCount) * 100;
          const bPct = (blank / qCount) * 100;

          return (
            <div
              key={subject.id}
              className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 hover:border-turquoise-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-navy-900 text-sm">{subject.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">{correct} Doğru</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-rose-700 font-bold">{wrong} Yanlış</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-700 font-bold">{blank} Boş</span>
                  <span className="ml-2 font-extrabold text-navy-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {net} Net
                  </span>
                </div>
              </div>

              {/* Segmented Bar */}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

