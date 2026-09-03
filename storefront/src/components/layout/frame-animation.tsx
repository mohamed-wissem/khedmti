"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FRAME_COUNT = 142;
const FRAME_RATE = 24;

function framePath(frame: number) {
  return `/orn/frame_${String(frame).padStart(3, "0")}.png`;
}

export function FrameAnimation() {
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const timer = window.setInterval(() => {
      setFrame((current) => {
        if (current === FRAME_COUNT) {
          window.clearInterval(timer);
          return current;
        }

        return current + 1;
      });
    }, 1000 / FRAME_RATE);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    for (let nextFrame = 1; nextFrame <= FRAME_COUNT; nextFrame += 1) {
      const image = new window.Image();
      image.src = framePath(nextFrame);
    }
  }, []);

  return (
    <div className="bf-frame-animation">
      <Image
        src={framePath(frame)}
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
      />
    </div>
  );
}