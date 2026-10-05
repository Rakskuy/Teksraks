/**
 * Header.tsx
 * Header utama aplikasi Teksraks:
 * Desain modern, editorial, dan profesional (tanpa gradien AI artifisial).
 */
import { HelpCircle, Moon, Sun, ShieldCheck } from 'lucide-react'

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
      className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-colors duration-200"
    >
      {/* Aksesibilitas: Skip Link ke Konten Utama */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50
                   focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white dark:focus:bg-white dark:focus:text-slate-900 focus:font-bold
                   focus:rounded-xl focus:shadow-xl focus:ring-2 focus:ring-primary-500"
      >
        Lompat ke konten utama
      </a>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Sisi Kiri: Brand Teksraks & Keterangan */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo Mark Teksraks */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo Teksraks"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Nama & Deskripsi */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Teksraks
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                  Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                Transkripsi Diskusi Kelompok & Wawancara Psikologi
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Badges + Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Status Keamanan Lokal */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Privat & Lokal</span>
            </div>

            {/* Tombol Panduan Cara Pakai */}
            <button
              type="button"
              id="btn-open-guide"
              onClick={onOpenGuide}
              aria-label="Buka panduan cara pakai aplikasi"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750
                         border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold
                         transition-colors active:scale-95 shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Cara Pakai</span>
            </button>

            {/* Tombol Toggle Dark Mode */}
            <button
              type="button"
              id="btn-toggle-dark-mode"
              onClick={onToggleDark}
              aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750
                         border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200
                         transition-colors active:scale-95 shadow-2xs"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
