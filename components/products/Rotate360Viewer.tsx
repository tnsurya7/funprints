'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

const TOTAL_FRAMES = 36;

export default function Rotate360Viewer({ basePath }: { basePath: string }) {
  const [frame, setFrame] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - lastX.current;
    if (Math.abs(delta) > 5) {
      setFrame((f) => (f + (delta > 0 ? 1 : -1) + TOTAL_FRAMES) % TOTAL_FRAMES);
      lastX.current = e.clientX;
    }
  };

  const onMouseUp = () => (dragging.current = false);

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    lastX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const delta = e.touches[0].clientX - lastX.current;
    if (Math.abs(delta) > 5) {
      setFrame((f) => (f + (delta > 0 ? 1 : -1) + TOTAL_FRAMES) % TOTAL_FRAMES);
      lastX.current = e.touches[0].clientX;
    }
  };

  const onTouchEnd = () => (dragging.current = false);

  return (
    <div
      className="relative w-full aspect-square select-none cursor-grab active:cursor-grabbing"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Image
        src={`${basePath}/360/frame_${String(frame * 10).padStart(3, '0')}.jpg`}
        alt="360 view"
        fill
        priority
        className="object-contain rounded-xl"
      />
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
        Frame {frame + 1} / {TOTAL_FRAMES}
      </div>
    </div>
  );
}
