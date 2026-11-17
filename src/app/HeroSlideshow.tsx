"use client";

import { useEffect, useState } from "react";

const heroImages = [
  "/images/hero/hero.jfif",
  "/images/hero/hero%202.jpg",
  "/images/hero/hero%203.JPG",
];

export default function HeroSlideshow() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="hero-photo" role="img" aria-label="Children and community activities supported by Reach One Child Foundation">
      {heroImages.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          className={index === activeImage ? "hero-slide is-active" : "hero-slide"}
          fetchPriority={index === 0 ? "high" : "auto"}
        />
      ))}
    </div>
  );
}
