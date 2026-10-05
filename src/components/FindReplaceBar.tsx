/**
 * FindReplaceBar.tsx
 * Bar pencarian dan penggantian kata di seluruh transkrip diskusi
 * Sangat berguna untuk koreksi cepat istilah psikologi (mis. kognitif, amigdala, coping).
 * Mendukung Dark Mode dan kontras aksesibel WCAG AA.
 */
import { Search, Replace, CheckCircle2, X } from 'lucide-react'

interface FindReplaceBarProps {
  findQuery: string
  setFindQuery: (v: string) => void
  replaceQuery: string
  setReplaceQuery: (v: string) => void
  onReplaceAll: () => void
  replaceCount: number | null
  onClearCount: () => void
  onClose: () => void
}

export default function FindReplaceBar({
  findQuery,
  setFindQuery,
  replaceQuery,
  setReplaceQuery,
  onReplaceAll,
  replaceCount,
  onClearCount,
  onClose,
}: FindReplaceBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onReplaceAll()
    }
  }

  return (
    <div
      className="p-3 bg-slate-50 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 animate-fade-in text-xs space-y-2.5"
      role="search"
      aria-label="Cari dan ganti istilah dalam transkripsi"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-primary-500" />
          Cari & Ganti Istilah Psikologi
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pencarian"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Input Cari */}
        <div className="relative flex-1">
          <input
            id="input-find"
            type="text"
            value={findQuery}
            onChange={e => {
              setFindQuery(e.target.value)
              if (replaceCount !== null) onClearCount()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cari kata/istilah (mis: kognitif)…"
            aria-label="Kata atau istilah yang dicari"
            className="w-full pl-3 pr-4 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100
                       border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2
                       focus:ring-primary-400 placeholder:text-slate-400"
          />
        </div>

        {/* Input Ganti */}
        <div className="relative flex-1">
          <input
            id="input-replace"
            type="text"
            value={replaceQuery}
            onChange={e => {
              setReplaceQuery(e.target.value)
              if (replaceCount !== null) onClearCount()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ganti dengan…"
            aria-label="Kata pengganti"
            className="w-full pl-3 pr-4 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100
                       border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2
                       focus:ring-primary-400 placeholder:text-slate-400"
          />
        </div>

        {/* Tombol Eksekusi */}
        <button
          id="btn-do-replace"
          type="button"
          onClick={onReplaceAll}
          disabled={!findQuery.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700
                     text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-40
                     disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
        >
          <Replace className="w-3.5 h-3.5" />
          <span>Ganti Semua</span>
        </button>
      </div>

      {/* Hasil Penggantian */}
      {replaceCount !== null && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {replaceCount === 0
              ? 'Tidak ditemukan kecocokan untuk kata tersebut.'
              : `Berhasil mengganti kata pada ${replaceCount} segmen transkrip.`}
          </span>
        </div>
      )}
    </div>
  )
}
