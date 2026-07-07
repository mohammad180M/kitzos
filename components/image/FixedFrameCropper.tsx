"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useNonPassiveWheel } from "@/lib/hooks/use-non-passive-wheel";
import {
  centeredCoverState,
  clampPanZoom,
  computeCoverScale,
  computeFrameSize,
  cropStateToSourceRect,
  drawCropPreview,
  panToState,
  stateToPan,
  type CropShape,
  type CropState,
  type FrameSpec,
} from "@/lib/image/fixed-frame-crop";

const MAX_VIEW_W = 560;
const MAX_VIEW_H = 520;

export interface FixedFrameCropperProps {
  image: HTMLImageElement;
  /** Width ÷ height; null = free → largest square in viewport */
  aspect: number | null;
  shape: CropShape;
  radiusPct?: number;
  onChange: (state: CropState) => void;
  /** Optional controlled crop state */
  value?: CropState;
  checkerboard?: boolean;
  borderColor?: string;
  zoomLabel: string;
  className?: string;
}

export function FixedFrameCropper({
  image,
  aspect,
  shape,
  radiusPct = 24,
  onChange,
  value,
  checkerboard = false,
  borderColor,
  zoomLabel,
  className = "",
}: FixedFrameCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState({ vw: 320, vh: 320 });
  const [internalState, setInternalState] = useState<CropState>(centeredCoverState);
  const [dragging, setDragging] = useState(false);
  const cropState = value ?? internalState;

  const frameAspect = shape === "circle" ? 1 : aspect ?? 1;
  const { fw, fh } = computeFrameSize(viewport.vw, viewport.vh, frameAspect);
  const frameSpec: FrameSpec = useMemo(
    () => ({ aspect: frameAspect, shape, radiusPct }),
    [frameAspect, shape, radiusPct]
  );

  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const panDragRef = useRef<{ mx: number; my: number; panX: number; panY: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scaleMult: number } | null>(null);

  const updateState = useCallback(
    (next: CropState) => {
      if (!value) setInternalState(next);
      onChange(next);
    },
    [onChange, value]
  );

  const applyPanZoom = useCallback(
    (panX: number, panY: number, scaleMult: number) => {
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      const cover = computeCoverScale(iw, ih, fw, fh);
      const clamped = clampPanZoom(panX, panY, scaleMult, iw, ih, fw, fh, cover);
      updateState(panToState(clamped.panX, clamped.panY, clamped.scaleMult, iw, ih, cover));
    },
    [image.naturalWidth, image.naturalHeight, fw, fh, updateState]
  );

  const resetCover = useCallback(() => {
    updateState(centeredCoverState());
  }, [updateState]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vw = Math.min(MAX_VIEW_W, Math.max(200, Math.floor(rect.width)));
      setViewport({ vw, vh: MAX_VIEW_H });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image.naturalWidth) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(viewport.vw * dpr);
    canvas.height = Math.round(viewport.vh * dpr);
    canvas.style.width = `${viewport.vw}px`;
    canvas.style.height = `${viewport.vh}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCropPreview(
      ctx,
      image,
      cropState,
      frameSpec,
      { vw: viewport.vw, vh: viewport.vh, fw, fh },
      { checkerboard, borderColor }
    );
  }, [image, cropState, frameSpec, viewport, fw, fh, checkerboard, borderColor]);

  useEffect(() => {
    if (!image.naturalWidth) return;
    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    const cover = computeCoverScale(iw, ih, fw, fh);
    const { panX, panY, scaleMult } = stateToPan(cropState, iw, ih, cover);
    const clamped = clampPanZoom(panX, panY, scaleMult, iw, ih, fw, fh, cover);
    const reclamped = panToState(clamped.panX, clamped.panY, clamped.scaleMult, iw, ih, cover);
    if (
      reclamped.x !== cropState.x ||
      reclamped.y !== cropState.y ||
      reclamped.scale !== cropState.scale
    ) {
      updateState(reclamped);
    }
    // Re-clamp when frame geometry changes (aspect resize), not on every pan tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fw, fh, image.naturalWidth, image.naturalHeight]);

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvasRef.current?.setPointerCapture(e.pointerId);

    if (pointersRef.current.size === 1) {
      setDragging(true);
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      const cover = computeCoverScale(iw, ih, fw, fh);
      const { panX, panY } = stateToPan(cropState, iw, ih, cover);
      panDragRef.current = { mx: e.clientX, my: e.clientY, panX, panY };
    } else if (pointersRef.current.size === 2) {
      panDragRef.current = null;
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchRef.current = { dist, scaleMult: cropState.scale };
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const ratio = dist / pinchRef.current.dist;
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      const cover = computeCoverScale(iw, ih, fw, fh);
      const { panX, panY } = stateToPan(cropState, iw, ih, cover);
      applyPanZoom(panX, panY, pinchRef.current.scaleMult * ratio);
      return;
    }

    if (panDragRef.current) {
      const dx = e.clientX - panDragRef.current.mx;
      const dy = e.clientY - panDragRef.current.my;
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      const cover = computeCoverScale(iw, ih, fw, fh);
      applyPanZoom(
        panDragRef.current.panX + dx,
        panDragRef.current.panY + dy,
        cropState.scale
      );
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) {
      panDragRef.current = null;
      setDragging(false);
    }
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* released */
    }
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      const cover = computeCoverScale(iw, ih, fw, fh);
      const { panX, panY } = stateToPan(cropState, iw, ih, cover);
      applyPanZoom(panX, panY, cropState.scale + delta);
    },
    [image.naturalWidth, image.naturalHeight, fw, fh, cropState, applyPanZoom]
  );

  useNonPassiveWheel(canvasRef, handleWheel, Boolean(image.naturalWidth));

  const onDoubleClick = () => resetCover();

  const onZoomSlider = (pct: number) => {
    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    const cover = computeCoverScale(iw, ih, fw, fh);
    const { panX, panY } = stateToPan(cropState, iw, ih, cover);
    applyPanZoom(panX, panY, pct / 100);
  };

  const sliderValue = Math.round(cropState.scale * 100);

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        ref={containerRef}
        className="mx-auto w-full max-w-full overscroll-contain"
        style={{ height: viewport.vh, touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="mx-auto block touch-none select-none rounded-lg"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onDoubleClick}
          role="img"
          aria-label="Crop preview"
        />
      </div>
      <label className="block max-w-md text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {zoomLabel}: {sliderValue}%
        </span>
        <input
          type="range"
          min={100}
          max={400}
          value={sliderValue}
          onChange={(e) => onZoomSlider(Number(e.target.value))}
          className="mt-1 w-full accent-primary-600"
        />
      </label>
    </div>
  );
}

export { cropStateToSourceRect, renderCrop } from "@/lib/image/fixed-frame-crop";
