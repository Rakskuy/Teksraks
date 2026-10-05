/**
 * Header.tsx
 * Header utama aplikasi: logo psikologi, judul, keterangan singkat,
 * tombol panduan Cara Pakai, dan tombol toggle Dark Mode.
 */
import { Brain, HelpCircle, Moon, Sun } from 'lucide-react'

interface HeaderProps {
  isDark: boolean
  onToggleDark: () => void
  onOpenGuide: () => void
}

export default function Header({
  isDark,
  onToggleDark,
  onOpenGuide,
}: HeaderProps) {
  return (
    <header
      role="banner"
      className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-violet-800 text-white shadow-md"
    >
      {/* Aksesibilitas: Skip Link ke Konten Utama */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50
                   focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:font-bold
                   focus:rounded-xl focus:shadow-xl focus:ring-2 focus:ring-primary-500"
      >
        Lompat ke konten utama
      </a>

      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-400/10 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          {/* Sisi Kiri: Logo & Judul */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Icon */}
            <div className="flex-shrink-0 w-13 h-13 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-md">
              <Brain className="w-7 h-7 text-white" strokeWidth={1.8} />
            </div>

            {/* Title & Desc */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                Transkripsi Diskusi{' '}
                <span className="text-primary-200">Psikologi</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-primary-100 max-w-lg leading-relaxed">
                Rekam suara diskusi kelompok, transkrip per pembicara secara real-time,
                koreksi istilah psikologi, dan unduh dokumen tanpa backend.
              </p>

              {/* Badges */}
              <div className="mt-2.5 flex flex-wrap justify-center sm:justify-start gap-2 text-[11px]">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white font-medium">
                  🇮🇩 Bahasa Indonesia
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white font-medium">
                  🔒 Diproses di Browser
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white font-medium">
                  ⚡ Dialog Multi-Pembicara
                </span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Action Buttons (Cara Pakai + Dark Mode) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Tombol Panduan Cara Pakai */}
            <button
              type="button"
              id="btn-open-guide"
              onClick={onOpenGuide}
              aria-label="Buka panduan cara pakai aplikasi"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25
                         border border-white/20 text-white text-xs font-semibold backdrop-blur-xs
                         transition-all active:scale-95 shadow-2xs"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Cara Pakai</span>
            </button>

            {/* Tombol Toggle Dark Mode */}
            <button
              type="button"
              id="btn-toggle-dark-mode"
              onClick={onToggleDark}
              aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white
                         backdrop-blur-xs transition-all active:scale-95 shadow-2xs"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-100" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
