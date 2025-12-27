// src/components/Header.tsx

import React from "react";

const basePath =
  // @ts-ignore
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

const LOGOS = [
  {
    src: `${basePath}logos/precaju.png`,
    alt: "Pré-Caju",
  },
  {
    src: `${basePath}logos/point.png`,
    alt: "Point do Ingresso",
  },
  {
    src: `${basePath}logos/augusto.png`,
    alt: "Augusto",
  },
];

export default function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Logos */}
        <div className="flex justify-center items-center gap-6 md:gap-12 flex-wrap">
          {LOGOS.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center
                         w-20 h-20
                         md:w-28 md:h-28
                         bg-white/90
                         rounded-xl
                         shadow-lg
                         transition-transform
                         hover:scale-105"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-w-[80%] max-h-[80%] object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Title */}
        <h1
          className="mt-5 text-center
                     text-white
                     text-xl md:text-2xl
                     font-bold
                     tracking-wide
                     drop-shadow-lg"
        >
          Sistema PCD — Gerenciamento de Eventos
        </h1>
      </div>
    </header>
  );
}
