/**
 * RestoreDialog.tsx
 * Dialog modal untuk menawarkan pemulihan sesi diskusi yang tersimpan di localStorage.
 * Mendukung Dark Mode dan navigasi keyboard.
 */
import { History, Play, Plus, X } from 'lucide-react'

interface RestoreDialogProps {
  onRestore: () => void
  onNewSession: () => void
  onDismiss: () => void
}

export default function RestoreDialog({
  onRestore,
  onNewSession,
  onDismiss,
}: RestoreDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Tutup dialog"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 id="restore-title" className="text-base font-bold text-slate-800 dark:text-slate-100">
            Sesi Diskusi Tersimpan Ditemukan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Sistem mendeteksi transkrip dan sesi diskusi sebelumnya yang tersimpan otomatis
            di peramban Anda. Apakah Anda ingin melanjutkan sesi tersebut atau memulai sesi baru?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            id="btn-restore-session"
            type="button"
            onClick={onRestore}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600
                       hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs
                       transition-colors active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Pulihkan Sesi</span>
          </button>

          <button
            id="btn-dismiss-new-session"
            type="button"
            onClick={onNewSession}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800
                       hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl
                       transition-colors active:scale-95 border border-slate-200/60 dark:border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mulai Sesi Baru</span>
          </button>
        </div>
      </div>
    </div>
  )
}
