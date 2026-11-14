"use client";

import { useEffect, useRef, useState } from "react";

const figures = [
  { value: 50, label: "children directly sponsored", suffix: "" },
  { value: 2000, label: "children indirectly supported", suffix: "" },
  { value: 8000, label: "sanitary pads donated", suffix: "+" },
  { value: 20, label: "workshops held", suffix: "+" },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function ImpactCounters() {
  const [started, setStarted] = useState(false);
  const [values, setValues] = useState(figures.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setValues(figures.map((figure) => figure.value));
      return;
    }

    const duration = 1800;
    let animationId = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValues(figures.map((figure) => Math.round(figure.value * eased)));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [started]);

  return (
    <div className="container impact-grid" ref={sectionRef}>
      {figures.map((figure, index) => (
        <div className="impact-item" key={figure.label}>
          <strong aria-label={`${formatNumber(figure.value)}${figure.suffix}`}>
            {formatNumber(values[index])}{figure.suffix}
          </strong>
          <span>{figure.label}</span>
        </div>
      ))}
    </div>
  );
}
