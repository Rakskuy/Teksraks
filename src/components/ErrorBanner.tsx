/**
 * ErrorBanner.tsx
 * Menampilkan pesan error speech recognition dalam Bahasa Indonesia
 * dengan dukungan Dark Mode dan kontras WCAG AA.
 */
import { XCircle, X, Lightbulb } from 'lucide-react'
import type { SpeechError } from '../types/speech.d'

interface ErrorBannerProps {
  error: SpeechError
  onDismiss: () => void
}

export default function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/90
                 dark:bg-red-950/30 p-4 sm:p-5 animate-fade-in shadow-xs"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-red-800 dark:text-red-200">{error.title}</h3>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300 leading-relaxed">
            {error.message}
          </p>
          {error.tip && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
              <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
              <span>{error.tip}</span>
            </div>
          )}
        </div>

        {/* Dismiss */}
        <button
          id="btn-dismiss-error"
          type="button"
          onClick={onDismiss}
          aria-label="Tutup pesan error"
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                     text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100
                     dark:hover:bg-red-900/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
