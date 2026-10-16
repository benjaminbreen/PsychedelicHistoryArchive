"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import styles from "./reader.module.css";

// Full-screen page viewer: wheel, pinch or double-click to zoom; drag to pan; arrow keys to turn pages.
export function Lightbox({ images, labels, index, onIndex, onClose, alt }: { images: string[]; labels: string[]; index: number; onIndex: (i: number) => void; onClose: () => void; alt: string }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;

  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, [index]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; previous?.focus(); };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < count - 1) onIndex(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [index, count, onIndex, onClose]);

  const setZ = (z: number) => { const next = Math.min(4, Math.max(1, z)); setZoom(next); if (next === 1) setPan({ x: 0, y: 0 }); };

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={labels[index]}>
      <div className={styles.lbTop}>
        <span>{labels[index]} <em>of {count}</em></span>
        <div>
          <button type="button" aria-label="Zoom out" onClick={() => setZ(zoom - 0.5)}><Minus size={17} /></button>
          <span className={styles.lbZoom}>{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="Zoom in" onClick={() => setZ(zoom + 0.5)}><Plus size={17} /></button>
          <button ref={closeRef} type="button" aria-label="Close" onClick={onClose}><X size={19} /></button>
        </div>
      </div>
      <div
        className={styles.lbStage}
        data-zoomed={zoom > 1}
        onWheel={e => setZ(zoom - e.deltaY * 0.002)}
        onDoubleClick={() => setZ(zoom > 1 ? 1 : 2.5)}
        onPointerDown={e => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; }}
        onPointerMove={e => {
          if (!pointers.current.has(e.pointerId)) return;
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const pts = [...pointers.current.values()];
          if (pts.length === 2) {
            const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            if (!pinch.current) pinch.current = { d, z: zoom };
            setZ(pinch.current.z * (d / pinch.current.d));
          } else if (drag.current && zoom > 1) {
            setPan({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y });
          }
        }}
        onPointerUp={e => { pointers.current.delete(e.pointerId); if (pointers.current.size < 2) pinch.current = null; drag.current = null; }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={index} src={images[index]} alt={`${alt}, ${labels[index]}`} draggable={false} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} />
      </div>
      <button type="button" className={`${styles.lbNav} ${styles.lbPrev}`} aria-label="Previous page" disabled={index === 0} onClick={() => onIndex(index - 1)}><ChevronLeft size={26} /></button>
      <button type="button" className={`${styles.lbNav} ${styles.lbNext}`} aria-label="Next page" disabled={index === count - 1} onClick={() => onIndex(index + 1)}><ChevronRight size={26} /></button>
    </div>
  );
}
