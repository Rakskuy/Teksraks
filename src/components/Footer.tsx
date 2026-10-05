/**
 * Footer.tsx
 * Footer aplikasi dengan info privasi, lisensi, dan teknologi.
 * Mendukung Dark Mode dan kontras WCAG AA.
 */
import { Shield, Zap, Sparkles } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          {/* Left: Branding */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              Transkripsi Diskusi Psikologi
            </span>
            <span>·</span>
            <span>v1.0.0</span>
            <span>·</span>
            <span>© {year}</span>
          </div>

          {/* Center: Privacy badges */}
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              Data tersimpan lokal
            </span>
            <span className="flex items-center gap-1 text-primary-700 dark:text-primary-400">
              <Zap className="w-3.5 h-3.5" />
              Diproses 100% di browser
            </span>
          </div>

          {/* Right: Tech stack */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3 h-3 text-violet-500" />
            <span>React + TypeScript + Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
