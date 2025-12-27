import React from 'react';

const LOGOS = [
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_694f6b5cbb05ea54d48f18ca/483550d04_PreCaju.png",
    alt: "Pré-Caju"
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_694f6b5cbb05ea54d48f18ca/e6d0f9084_Point.png",
    alt: "Point do Ingresso"
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_694f6b5cbb05ea54d48f18ca/d32a389eb_Augusto.png",
    alt: "Augusto"
  }
];

export default function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400" />
      
      {/* Content */}
      <div className="relative z-10 py-6 px-4">
        {/* Logos */}
        <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap mb-4">
          {LOGOS.map((logo, index) => (
            <div 
              key={index}
              className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center transition-transform hover:scale-105"
            >
              <img 
                src={logo.src} 
                alt={logo.alt}
                className="max-w-full max-h-full object-contain drop-shadow-lg"
                style={{ 
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                  mixBlendMode: 'multiply'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Title */}
        <h1 className="text-center text-white text-2xl md:text-3xl font-bold tracking-wide drop-shadow-lg">
          Sistema PCD — Eventos
        </h1>
      </div>
    </header>
  );
}