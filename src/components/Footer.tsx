/**
 * Footer.tsx
 * Footer aplikasi Teksraks dengan info privasi, versi, dan hak cipta.
 */
import { ShieldCheck, Cpu } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          {/* Left: Branding */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 dark:text-slate-100">
              Teksraks
            </span>
            <span>·</span>
            <span>Studio v1.2</span>
            <span>·</span>
            <span>© {year}</span>
          </div>

          {/* Center: Privacy badges */}
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Penyimpanan Lokal Perangkat
            </span>
          </div>

          {/* Right: Engine info */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>Web Speech API & Whisper Engine</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
