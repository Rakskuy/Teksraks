/**
 * BrowserBanner.tsx
 * Banner peringatan untuk browser yang tidak mendukung Web Speech API
 */
import { MonitorX, ExternalLink } from 'lucide-react'

export default function BrowserBanner() {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50
                 dark:from-amber-950/40 dark:to-orange-950/30 p-4 sm:p-5 animate-fade-in shadow-xs"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center">
          <MonitorX className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Browser Tidak Didukung
          </h3>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Browser yang Anda gunakan <strong>tidak mendukung Web Speech API</strong>.
            Fitur perekaman suara membutuhkan{' '}
            <strong>Google Chrome</strong> atau{' '}
            <strong>Microsoft Edge</strong>.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <a
              href="https://www.google.com/chrome/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                         bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3 h-3" />
              Unduh Chrome
            </a>
            <a
              href="https://www.microsoft.com/edge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                         bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-300
                         dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3 h-3" />
              Unduh Edge
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
