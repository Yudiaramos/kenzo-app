'use client';

import Image from 'next/image';
import Link from 'next/link';
import { WEDDING_CONFIG, getCurrentStage, getStageLabel } from '@/config/wedding';

export default function HomePage() {
  const currentStage = getCurrentStage();

  return (
    <main className="flex-1 flex flex-col hero-bg">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Decorative element */}
        <div className="mb-6 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-full gold-gradient opacity-20 absolute -inset-2 blur-xl" />
            <div className="relative w-16 h-16 rounded-full bg-white border-2 border-[#e0d5c1]
                            flex items-center justify-center shadow-lg shadow-[#c9a84c]/10">
              <span className="text-3xl">💍</span>
            </div>
          </div>
        </div>

        {/* Couple name */}
        <h1
          className="font-[var(--font-serif)] text-4xl md:text-5xl font-light text-[#2a2a2a]
                     tracking-wide mb-3 animate-fade-in-up"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          {WEDDING_CONFIG.coupleName}
        </h1>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 mb-4 animate-fade-in-up delay-100">
          <div className="w-12 h-px bg-[#c9a84c]/40" />
          <span className="text-[#c9a84c] text-sm">✦</span>
          <div className="w-12 h-px bg-[#c9a84c]/40" />
        </div>

        {/* Date */}
        <p className="text-[#999] text-sm uppercase tracking-[0.2em] mb-8 animate-fade-in-up delay-200"
           style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
          {WEDDING_CONFIG.weddingDate !== "2026-00-00"
            ? new Date(WEDDING_CONFIG.weddingDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Data a definir'}
        </p>

        {/* Welcome text */}
        <p className="text-[#777] text-lg max-w-sm leading-relaxed mb-10 animate-fade-in-up delay-300">
          {WEDDING_CONFIG.welcomeText}
        </p>

        <div className="w-full max-w-4xl mb-10 animate-fade-in-up delay-400">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-[#e6dbc8] bg-white/80 p-2 shadow-[0_24px_70px_rgba(128,101,37,0.16)]">
            <div className="absolute inset-x-10 top-0 h-24 bg-[#f2e4bd]/50 blur-3xl" />
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem]">
              <Image
                src="/giullie-kenzo.webp"
                alt="Giullie e Kenzo"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2d2312]/25 via-transparent to-[#fff7ea]/15" />
              <div className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#6f5a27] backdrop-blur-sm">
                Giullie & Kenzo
              </div>
            </div>
          </div>
        </div>

        {/* Current stage indicator */}
        {currentStage && (
          <div className="mb-8 animate-fade-in-up delay-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                            bg-[#c9a84c]/10 border border-[#c9a84c]/20">
              <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse-gold" />
              <span className="text-sm text-[#c9a84c] font-medium">
                Agora: {getStageLabel(currentStage)}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs animate-fade-in-up delay-500">
          <Link
            href="/upload"
            className="flex items-center justify-center gap-3 w-full py-4 px-6
                       gold-gradient text-white rounded-2xl font-medium text-lg
                       shadow-lg shadow-[#c9a84c]/25
                       hover:shadow-xl hover:shadow-[#c9a84c]/30
                       active:scale-[0.98] transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Enviar foto ou vídeo
          </Link>

          <Link
            href="/stories"
            className="flex items-center justify-center gap-3 w-full py-4 px-6
                       bg-white text-[#555] rounded-2xl font-medium text-lg
                       border border-[#e0d5c1] shadow-sm
                       hover:bg-[#f8f5f0] hover:border-[#c9a84c]/30 hover:shadow-md
                       active:scale-[0.98] transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ver stories
          </Link>

          <Link
            href="/admin"
            className="flex items-center justify-center gap-3 w-full py-4 px-6
                       bg-[#2a2a2a] text-white rounded-2xl font-medium text-lg
                       border border-[#2a2a2a] shadow-sm
                       hover:bg-[#1f1f1f] hover:border-[#1f1f1f] hover:shadow-md
                       active:scale-[0.98] transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 11c1.657 0 3-1.343 3-3V7a3 3 0 10-6 0v1c0 1.657 1.343 3 3 3zm-7 9a7 7 0 1114 0H5z" />
            </svg>
            Área admin
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 px-4">
        <p className="text-xs text-[#ccc]">
          Feito com 💛 para um dia inesquecível
        </p>
      </footer>
    </main>
  );
}
