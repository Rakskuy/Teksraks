/**
 * BrowserBanner.tsx
 * Banner peringatan untuk browser yang tidak mendukung Web Speech API
 * atau peringatan khusus keterbatasan Web Speech API pada iOS / Safari mobile.
 */
import { useState } from 'react'
import { MonitorX, Smartphone, ExternalLink, FileAudio, X } from 'lucide-react'

interface BrowserBannerProps {
  isIOS?: boolean
  onOpenWhisper?: () => void
}

export default function BrowserBanner({ isIOS = false, onOpenWhisper }: BrowserBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (isIOS) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50/90
                   dark:bg-sky-950/30 p-4 sm:p-5 animate-fade-in shadow-xs"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-sky-900 dark:text-sky-200">
                Peringatan Peramban iOS / Safari
              </h3>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Tutup pemberitahuan"
                className="text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
              Sistem operasi <strong>iOS / Safari</strong> membatasi pengenalan suara kontinu
              pada Web Speech API (rekaman dapat terhenti otomatis setelah jeda singkat).
              Untuk transkripsi panjang tanpa batas, gunakan <strong>Google Chrome</strong> di Laptop/PC
              atau manfaatkan fitur <strong>Whisper AI</strong>.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {onOpenWhisper && (
                <button
                  type="button"
                  onClick={onOpenWhisper}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                             bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-2xs"
                >
                  <FileAudio className="w-3.5 h-3.5" />
                  Gunakan Whisper AI
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/90
                 dark:bg-amber-950/30 p-4 sm:p-5 animate-fade-in shadow-xs"
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
