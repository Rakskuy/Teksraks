/**
 * SessionHeader.tsx
 * Baris informasi judul sesi, tanggal, dan autosave yang ringkas dalam satu baris.
 * Catatan sesi dan opsi sesi baru dapat dibuka dengan mudah bila diperlukan.
 */

import { useState } from 'react'
import { FileText, Calendar, StickyNote, ChevronDown, ChevronUp, Save, RotateCcw } from 'lucide-react'

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
      {/* ── Baris Utama Ringkas (Satu Baris) ── */}
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <input
            id="session-title-inline"
            type="text"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="Judul Sesi Diskusi..."
            aria-label="Judul sesi diskusi"
            className="font-bold text-sm text-slate-800 dark:text-slate-100 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-slate-200 dark:focus:border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full max-w-md transition-colors"
          />
        </div>

        {/* Tanggal & Aksi Tambahan */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <span className="hidden md:flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Save className="w-3 h-3 text-emerald-500" />
            <span>{savedLabel}</span>
          </span>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>

          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>

          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            aria-label="Buka catatan dan opsi sesi"
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <span className="text-xs">{expanded ? 'Tutup' : 'Catatan'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Bagian Catatan & Opsi Tambahan (Bila Dibuka) ── */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/40 animate-fade-in text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tanggal Edit */}
            <div>
              <label htmlFor="session-date-input" className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                <Calendar className="w-3 h-3 inline mr-1 text-slate-400" />
                Tanggal Sesi
              </label>
              <input
                id="session-date-input"
                type="date"
                value={date}
                onChange={e => onDateChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Catatan Sesi */}
            <div className="sm:col-span-2">
              <label htmlFor="session-notes-input" className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                <StickyNote className="w-3 h-3 inline mr-1 text-slate-400" />
                Catatan / Konteks Diskusi
              </label>
              <textarea
                id="session-notes-input"
                value={notes}
                onChange={e => onNotesChange(e.target.value)}
                placeholder="Catatan topik diskusi, nama peserta, atau latar belakang..."
                rows={2}
                className="w-full px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              id="btn-new-session-header"
              onClick={onNewSession}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors"
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
