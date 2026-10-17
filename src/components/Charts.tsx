import React from 'react';
import { LGS_SUBJECTS, SUBJECT_MAP } from '../data/curriculum';
import { ExamRecord, SubjectId } from '../types/models';

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
