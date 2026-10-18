import React, { useRef, useState } from 'react';
import {
  Check,
  Crop,
  Maximize2,
  Move,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import { CropRect } from '../types/models';

interface FreehandImageCropperProps {
  imageUrl: string;
  initialCropRect?: CropRect | null;
  onApplyCrop: (rect: CropRect) => Promise<void> | void;
  onCancel: () => void;
  onResetOriginal?: () => Promise<void> | void;
  isProcessing?: boolean;
}

type DragMode =
  | 'new'
  | 'move'
  | 'resize-tl'
  | 'resize-tr'
  | 'resize-bl'
  | 'resize-br'
  | 'resize-t'
  | 'resize-b'
  | 'resize-l'
  | 'resize-r'
  | null;

export const FreehandImageCropper: React.FC<FreehandImageCropperProps> = ({
  imageUrl,
  initialCropRect,
  onApplyCrop,
  onCancel,
  onResetOriginal,
  isProcessing = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cropRect, setCropRect] = useState<CropRect>(() => {
    if (
      initialCropRect &&
      typeof initialCropRect.x === 'number' &&
      typeof initialCropRect.width === 'number' &&
      initialCropRect.width > 5
    ) {
      return initialCropRect;
    }
    return { x: 5, y: 5, width: 90, height: 90 };
  });

  const [dragMode, setDragMode] = useState<DragMode>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialRect: CropRect;
  }>({
    startX: 0,
    startY: 0,
    initialRect: cropRect,
  });

  const getPercentageCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const startDrag = (
    mode: DragMode,
    clientX: number,
    clientY: number
  ) => {
    const { x, y } = getPercentageCoords(clientX, clientY);
    dragStartRef.current = {
      startX: x,
      startY: y,
      initialRect: { ...cropRect },
    };
    setDragMode(mode);
  };

  const handlePointerDownContainer = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicked on handle or move area, let their own handlers handle it
    const target = e.target as HTMLElement;
    if (target.dataset.cropHandle || target.dataset.cropMove) {
      return;
    }
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startDrag('new', e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragMode) return;
    e.preventDefault();

    const { x: curX, y: curY } = getPercentageCoords(e.clientX, e.clientY);
    const { startX, startY, initialRect } = dragStartRef.current;
    const dx = curX - startX;
    const dy = curY - startY;

    if (dragMode === 'new') {
      const x = Math.min(startX, curX);
      const y = Math.min(startY, curY);
      const width = Math.max(5, Math.abs(curX - startX));
      const height = Math.max(5, Math.abs(curY - startY));
      setCropRect({
        x: Math.round(Math.max(0, Math.min(100 - width, x))),
        y: Math.round(Math.max(0, Math.min(100 - height, y))),
        width: Math.round(Math.min(100, width)),
        height: Math.round(Math.min(100, height)),
      });
      return;
    }

    if (dragMode === 'move') {
      const newX = Math.max(0, Math.min(100 - initialRect.width, initialRect.x + dx));
      const newY = Math.max(0, Math.min(100 - initialRect.height, initialRect.y + dy));
      setCropRect({
        ...initialRect,
        x: Math.round(newX),
        y: Math.round(newY),
      });
      return;
    }

    if (dragMode === 'resize-br') {
      const newW = Math.max(5, Math.min(100 - initialRect.x, initialRect.width + dx));
      const newH = Math.max(5, Math.min(100 - initialRect.y, initialRect.height + dy));
      setCropRect({
        ...initialRect,
        width: Math.round(newW),
        height: Math.round(newH),
      });
      return;
    }

    if (dragMode === 'resize-tl') {
      const maxLeft = initialRect.x + initialRect.width - 5;
      const maxTop = initialRect.y + initialRect.height - 5;
      const newX = Math.max(0, Math.min(maxLeft, initialRect.x + dx));
      const newY = Math.max(0, Math.min(maxTop, initialRect.y + dy));
      const newW = initialRect.width - (newX - initialRect.x);
      const newH = initialRect.height - (newY - initialRect.y);
      setCropRect({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
      return;
    }

    if (dragMode === 'resize-tr') {
      const maxTop = initialRect.y + initialRect.height - 5;
      const newY = Math.max(0, Math.min(maxTop, initialRect.y + dy));
      const newW = Math.max(5, Math.min(100 - initialRect.x, initialRect.width + dx));
      const newH = initialRect.height - (newY - initialRect.y);
      setCropRect({
        x: initialRect.x,
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
      return;
    }

    if (dragMode === 'resize-bl') {
      const maxLeft = initialRect.x + initialRect.width - 5;
      const newX = Math.max(0, Math.min(maxLeft, initialRect.x + dx));
      const newW = initialRect.width - (newX - initialRect.x);
      const newH = Math.max(5, Math.min(100 - initialRect.y, initialRect.height + dy));
      setCropRect({
        x: Math.round(newX),
        y: initialRect.y,
        width: Math.round(newW),
        height: Math.round(newH),
      });
      return;
    }

    if (dragMode === 'resize-t') {
      const maxTop = initialRect.y + initialRect.height - 5;
      const newY = Math.max(0, Math.min(maxTop, initialRect.y + dy));
      const newH = initialRect.height - (newY - initialRect.y);
      setCropRect({
        ...initialRect,
        y: Math.round(newY),
        height: Math.round(newH),
      });
      return;
    }

    if (dragMode === 'resize-b') {
      const newH = Math.max(5, Math.min(100 - initialRect.y, initialRect.height + dy));
      setCropRect({
        ...initialRect,
        height: Math.round(newH),
      });
      return;
    }

    if (dragMode === 'resize-l') {
      const maxLeft = initialRect.x + initialRect.width - 5;
      const newX = Math.max(0, Math.min(maxLeft, initialRect.x + dx));
      const newW = initialRect.width - (newX - initialRect.x);
      setCropRect({
        ...initialRect,
        x: Math.round(newX),
        width: Math.round(newW),
      });
      return;
    }

    if (dragMode === 'resize-r') {
      const newW = Math.max(5, Math.min(100 - initialRect.x, initialRect.width + dx));
      setCropRect({
        ...initialRect,
        width: Math.round(newW),
      });
      return;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragMode) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setDragMode(null);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-3 sm:p-4 text-white space-y-3 border-2 border-turquoise-500 shadow-xl">
      {/* Header / Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-turquoise-500/20 text-turquoise-400 flex items-center justify-center">
            <Crop className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-turquoise-300">
              Serbest Elle Kırpma Aracı
            </h4>
            <p className="text-[11px] text-slate-300">
              Parmağınızla veya fareyle alanı sürükleyip tam soruyu çerçeveleyin
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setCropRect({ x: 0, y: 0, width: 100, height: 100 })}
            className="text-[11px] font-semibold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
          >
            Tüm Fotoğraf
          </button>
          <button
            type="button"
            onClick={() => setCropRect({ x: 5, y: 5, width: 90, height: 48 })}
            className="text-[11px] font-semibold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
          >
            Üst Soru
          </button>
          <button
            type="button"
            onClick={() => setCropRect({ x: 5, y: 48, width: 90, height: 48 })}
            className="text-[11px] font-semibold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
          >
            Alt Soru
          </button>
          <button
            type="button"
            onClick={() => setCropRect({ x: 10, y: 15, width: 80, height: 70 })}
            className="text-[11px] font-semibold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
          >
            Ortala
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas / Image Workspace */}
      <div className="relative bg-black rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[300px] max-h-[55vh]">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDownContainer}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative inline-block select-none touch-none cursor-crosshair"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {/* Base Image */}
          <img
            src={imageUrl}
            alt="Kırpılacak Soru"
            className="max-h-[50vh] max-w-full w-auto block select-none pointer-events-none rounded shadow"
            draggable={false}
          />

          {/* Dimmed backdrop masks outside the crop box */}
          {/* Top mask */}
          <div
            className="absolute left-0 right-0 top-0 bg-black/60 pointer-events-none"
            style={{ height: `${cropRect.y}%` }}
          />
          {/* Bottom mask */}
          <div
            className="absolute left-0 right-0 bottom-0 bg-black/60 pointer-events-none"
            style={{ height: `${Math.max(0, 100 - (cropRect.y + cropRect.height))}%` }}
          />
          {/* Left mask */}
          <div
            className="absolute left-0 bg-black/60 pointer-events-none"
            style={{
              top: `${cropRect.y}%`,
              height: `${cropRect.height}%`,
              width: `${cropRect.x}%`,
            }}
          />
          {/* Right mask */}
          <div
            className="absolute right-0 bg-black/60 pointer-events-none"
            style={{
              top: `${cropRect.y}%`,
              height: `${cropRect.height}%`,
              width: `${Math.max(0, 100 - (cropRect.x + cropRect.width))}%`,
            }}
          />

          {/* Interactive Crop Box */}
          <div
            className="absolute border-2 border-turquoise-400 bg-transparent shadow-2xl"
            style={{
              left: `${cropRect.x}%`,
              top: `${cropRect.y}%`,
              width: `${cropRect.width}%`,
              height: `${cropRect.height}%`,
            }}
          >
            {/* Rule of Thirds Guide Lines */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Move area in center */}
            <div
              data-crop-move="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
                startDrag('move', e.clientX, e.clientY);
              }}
              className="absolute inset-4 cursor-move flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-turquoise-500/10 rounded"
              title="Çerçeveyi taşımak için sürükleyin"
            >
              <div className="bg-navy-950/80 text-turquoise-300 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow pointer-events-none">
                <Move className="w-3 h-3" /> Taşı
              </div>
            </div>

            {/* 4 Large Touch Handles (Corners) */}
            {/* Top-Left */}
            <div
              data-crop-handle="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
                startDrag('resize-tl', e.clientX, e.clientY);
              }}
              className="absolute -top-3.5 -left-3.5 w-7 h-7 bg-white border-2 border-turquoise-500 rounded-full shadow-lg cursor-nwse-resize flex items-center justify-center touch-none z-10"
              title="Sol Üst Köşeden Boyutlandır"
            >
              <div className="w-2 h-2 bg-turquoise-600 rounded-full pointer-events-none" />
            </div>

            {/* Top-Right */}
            <div
              data-crop-handle="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
                startDrag('resize-tr', e.clientX, e.clientY);
              }}
              className="absolute -top-3.5 -right-3.5 w-7 h-7 bg-white border-2 border-turquoise-500 rounded-full shadow-lg cursor-nesw-resize flex items-center justify-center touch-none z-10"
              title="Sağ Üst Köşeden Boyutlandır"
            >
              <div className="w-2 h-2 bg-turquoise-600 rounded-full pointer-events-none" />
            </div>

            {/* Bottom-Left */}
            <div
              data-crop-handle="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
                startDrag('resize-bl', e.clientX, e.clientY);
              }}
              className="absolute -bottom-3.5 -left-3.5 w-7 h-7 bg-white border-2 border-turquoise-500 rounded-full shadow-lg cursor-nesw-resize flex items-center justify-center touch-none z-10"
              title="Sol Alt Köşeden Boyutlandır"
            >
              <div className="w-2 h-2 bg-turquoise-600 rounded-full pointer-events-none" />
            </div>

            {/* Bottom-Right */}
            <div
              data-crop-handle="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
                startDrag('resize-br', e.clientX, e.clientY);
              }}
              className="absolute -bottom-3.5 -right-3.5 w-7 h-7 bg-white border-2 border-turquoise-500 rounded-full shadow-lg cursor-nwse-resize flex items-center justify-center touch-none z-10"
              title="Sağ Alt Köşeden Boyutlandır"
            >
              <div className="w-2 h-2 bg-turquoise-600 rounded-full pointer-events-none" />
            </div>

            {/* Edge Handles */}
            {/* Top Edge */}
            <div
              data-crop-handle="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
                startDrag('resize-t', e.clientX, e.clientY);
              }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-white border border-turquoise-500 rounded-full cursor-ns-resize shadow flex items-center justify-center touch-none z-10"
            />
            {/* Bottom Edge */}
            <div
              data-crop-handle="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
                startDrag('resize-b', e.clientX, e.clientY);
              }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-white border border-turquoise-500 rounded-full cursor-ns-resize shadow flex items-center justify-center touch-none z-10"
            />
            {/* Left Edge */}
            <div
              data-crop-handle="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
                startDrag('resize-l', e.clientX, e.clientY);
              }}
              className="absolute -left-2 top-1/2 -translate-y-1/2 h-8 w-3.5 bg-white border border-turquoise-500 rounded-full cursor-ew-resize shadow flex items-center justify-center touch-none z-10"
            />
            {/* Right Edge */}
            <div
              data-crop-handle="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
                startDrag('resize-r', e.clientX, e.clientY);
              }}
              className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-3.5 bg-white border border-turquoise-500 rounded-full cursor-ew-resize shadow flex items-center justify-center touch-none z-10"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700">
        <div className="flex items-center gap-2">
          {onResetOriginal && (
            <button
              type="button"
              onClick={onResetOriginal}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1 border border-slate-600 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Orijinale Dön
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Vazgeç
          </button>
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onApplyCrop(cropRect)}
          className="px-4 py-2 text-xs font-bold text-navy-950 bg-turquoise-400 hover:bg-turquoise-300 disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-md transition"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-navy-900" />
              Kırpılıyor...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-navy-950" />
              Seçili Alanı Kırp ve Kaydet
            </>
          )}
        </button>
      </div>
    </div>
  );
};
