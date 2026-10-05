/**
 * SessionHeader.tsx
 * Field judul sesi, tanggal otomatis, dan catatan opsional
 * Dilengkapi dukungan Dark Mode dan kontras aksesibel WCAG AA.
 */
import { FileText, Calendar, StickyNote, ChevronDown, ChevronUp, Save, RotateCcw } from 'lucide-react'
import { useState } from 'react'

interface SessionHeaderProps {
  title: string
  date: string
  notes: string
  lastSaved: Date | null
  onTitleChange: (v: string) => void
  onDateChange: (v: string) => void
  onNotesChange: (v: string) => void
  onNewSession: () => void
}

export default function SessionHeader({
  title,
  date,
  notes,
  lastSaved,
  onTitleChange,
  onDateChange,
  onNotesChange,
  onNewSession,
}: SessionHeaderProps) {
  const [expanded, setExpanded] = useState(false)

  const savedLabel = lastSaved
    ? `Tersimpan ${lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    : 'Belum disimpan'

  return (
    <section
      className="glass-card rounded-2xl overflow-hidden animate-fade-in shadow-xs"
      aria-label="Informasi Sesi Diskusi"
    >
      {/* ── Collapsed bar ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-5 py-3.5 cursor-pointer
                   hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
        onClick={() => setExpanded(v => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded(v => !v)
          }
        }}
        aria-expanded={expanded}
        aria-label="Tampilkan atau sembunyikan formulir detail sesi"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Save className="w-3.5 h-3.5 text-emerald-500" />
            {savedLabel}
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />
          }
        </div>
      </div>

      {/* ── Expanded form ── */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-5 py-4 space-y-3 bg-white/70 dark:bg-slate-900/60">
          {/* Judul */}
          <div>
            <label htmlFor="session-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Sesi
            </label>
            <input
              id="session-title"
              type="text"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="Contoh: Diskusi Kelompok Topik Stres Akademik"
              className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800
                         border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none
                         focus:ring-2 focus:ring-primary-400 placeholder:text-slate-400 transition-shadow"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Tanggal */}
            <div className="flex-1">
              <label htmlFor="session-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                Tanggal
              </label>
              <input
                id="session-date"
                type="date"
                value={date}
                onChange={e => onDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800
                           border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none
                           focus:ring-2 focus:ring-primary-400 transition-shadow"
              />
            </div>

            {/* AutoSave info */}
            <div className="flex-shrink-0 flex flex-col justify-end">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 py-2">
                <Save className="w-3.5 h-3.5 text-emerald-500" />
                <span>Autosave: {savedLabel}</span>
              </p>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label htmlFor="session-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <StickyNote className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
              Catatan Sesi (opsional)
            </label>
            <textarea
              id="session-notes"
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Konteks, topik diskusi, daftar peserta, atau catatan khusus..."
              rows={2}
              className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800
                         border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none
                         focus:ring-2 focus:ring-primary-400 placeholder:text-slate-400 resize-none transition-shadow"
            />
          </div>

          {/* Tombol sesi baru */}
          <div className="pt-1 flex justify-end">
            <button
              id="btn-new-session"
              type="button"
              onClick={onNewSession}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300
                         hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40
                         px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700
                         hover:border-red-200 dark:hover:border-red-800 transition-all active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Mulai Sesi Baru</span>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
