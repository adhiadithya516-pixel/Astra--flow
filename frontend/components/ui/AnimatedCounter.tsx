"use client";
import { useEffect, useRef, useState } from "react";

interface Props { value: number; suffix?: string; decimals?: number; duration?: number; }

export default function AnimatedCounter({ value, suffix = "", decimals = 0, duration = 1500 }: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    if (!ref.current || started.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setCount((1 - Math.pow(1 - p, 3)) * value);
          if (p < 1) requestAnimationFrame(animate); else setCount(value);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);
  return <span ref={ref}>{count.toFixed(decimals)}{suffix}</span>;
}
