import { useState, useRef, useEffect } from 'react'
import { Check, RotateCcw, Bookmark, X } from 'lucide-react'
import type { DialectChange } from '../dialect'
import { addOrUpdatePersonalWord, addPersonalException } from '../dialect'

interface WordDialectPopoverProps {
  change: DialectChange
  segmentId: string
  onRevertWord: (segmentId: string, original: string, replacement: string) => void
  onClose: () => void
}

export default function WordDialectPopover({
  change,
  segmentId,
  onRevertWord,
  onClose
}: WordDialectPopoverProps) {
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Tutup saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleRevertToBaku = () => {
    onRevertWord(segmentId, change.original, change.replacement)
    onClose()
  }

  const handleAlwaysUseBaku = () => {
    // Tambahkan kata baku ke daftar pengecualian kamus pribadi
    addPersonalException(change.original)
    onRevertWord(segmentId, change.original, change.replacement)
    setSavedFeedback('Disimpan: Selalu gunakan bentuk baku di Kamus Pribadi')
    setTimeout(() => onClose(), 1200)
  }

  const handleAlwaysUseDialect = () => {
    // Simpan ke kamus pribadi
    addOrUpdatePersonalWord(change.original, change.replacement, {
      confidence: 'high',
      notes: 'Pilihan pengguna via klik-kata'
    })
    setSavedFeedback('Disimpan: Selalu gunakan logat Bekasi di Kamus Pribadi')
    setTimeout(() => onClose(), 1200)
  }

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 mt-1 w-72 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 animate-fade-in"
      style={{ top: '100%', left: 0 }}
      role="dialog"
      aria-label="Pengaturan kata logat"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="font-bold text-amber-700 dark:text-amber-400">
          Penyesuaian Logat Kata
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {savedFeedback ? (
        <div className="py-3 text-center text-emerald-600 dark:text-emerald-400 font-medium">
          {savedFeedback}
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg space-y-1 text-[11px]">
            <div>
              <span className="text-slate-400">Kata Logat: </span>
              <strong className="text-amber-600 dark:text-amber-300 font-mono">
                {change.replacement}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Baku Asli: </span>
              <strong className="text-slate-800 dark:text-slate-100 font-mono">
                {change.original}
              </strong>
            </div>
            <div className="text-[10px] text-slate-400 italic">
              {change.reason}
            </div>
          </div>

          {/* Tombol aksi */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleRevertToBaku}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium transition-colors text-left"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
              <span>Kembalikan ke baku (<em>{change.original}</em>)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-medium transition-colors text-left"
            >
              <Check className="w-3.5 h-3.5 text-amber-600" />
              <span>Pertahankan logat (<em>{change.replacement}</em>)</span>
            </button>

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Simpan ke Kamus Pribadi:
              </span>
              <button
                type="button"
                onClick={handleAlwaysUseBaku}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <Bookmark className="w-3 h-3 text-slate-400" />
                <span>Selalu pakai baku (jangan diubah)</span>
              </button>
              <button
                type="button"
                onClick={handleAlwaysUseDialect}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors text-left"
              >
                <Bookmark className="w-3 h-3 text-amber-500" />
                <span>Selalu ubah ke "<em>{change.replacement}</em>"</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
