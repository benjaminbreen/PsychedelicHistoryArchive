"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
export function CmsModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} aria-labelledby={id} className="cms-dialog" onCancel={onClose} onClick={e => { if (e.target === ref.current) { const rect = ref.current.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose(); } }}><h2 id={id}>{title}</h2>{children}</dialog>;
}
