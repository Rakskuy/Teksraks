/**
 * TranscriptArea.tsx
 * Area transkrip dialog berbasis segmen:
 * - Menampilkan daftar segmen per pembicara dengan warna masing-masing
 * - Preview live teks sementara (interim) dengan indikator aktif
 * - Toolbar: toggle timestamp, cari & ganti kata, tombol bersihkan merah dijauhkan
 * - Auto-scroll halus ke teks terbaru saat proses rekaman berlangsung
 * - Font minimum 16px pada input/edit untuk mencegah iOS auto-zoom
 * - Satu empty state bersih tanpa teks berulang
 */

import { useState, useRef, useEffect } from 'react'
import {
  Trash2,
  Clock,
  Search,
  AlertTriangle,
  Radio,
  RotateCcw,
} from 'lucide-react'
import type { Segment, Speaker } from '../types/session'
import type { RecordingStatus } from '../types/speech.d'
import SegmentItem from './SegmentItem'
import FindReplaceBar from './FindReplaceBar'

interface TranscriptAreaProps {
  segments: Segment[]
  speakers: Speaker[]
  activeSpeakerId: string
  interimText: string
  status: RecordingStatus
  showTimestamps: boolean
  onToggleTimestamps: () => void
  onEditSegment: (id: string, text: string) => void
  onDeleteSegment: (id: string) => void
  onMergeSegment: (id: string) => void
  onChangeSegmentSpeaker: (id: string, speakerId: string) => void
  onClearAll: () => void
  onRevertWord?: (id: string, original: string, replacement: string) => void
  onRevertSegmentToRaw?: (id: string) => void
  onRevertAllSegmentsToRaw?: () => void
  // Find & Replace
  findReplaceOpen: boolean
  setFindReplaceOpen: (v: boolean) => void
  findQuery: string
  setFindQuery: (v: string) => void
  replaceQuery: string
  setReplaceQuery: (v: string) => void
  onReplaceAll: () => void
  replaceCount: number | null
  onClearReplaceCount: () => void
}

export default function TranscriptArea({
  segments,
  speakers,
  activeSpeakerId,
  interimText,
  status,
  showTimestamps,
  onToggleTimestamps,
  onEditSegment,
  onDeleteSegment,
  onMergeSegment,
  onChangeSegmentSpeaker,
  onClearAll,
  onRevertWord,
  onRevertSegmentToRaw,
  onRevertAllSegmentsToRaw,
  findReplaceOpen,
  setFindReplaceOpen,
  findQuery,
  setFindQuery,
  replaceQuery,
  setReplaceQuery,
  onReplaceAll,
  replaceCount,
  onClearReplaceCount,
}: TranscriptAreaProps) {
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const bottomAnchorRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const activeSpeaker =
    speakers.find(s => s.id === activeSpeakerId) || speakers[0]

  const isRecording = status === 'recording'
  const isPaused = status === 'paused'
  const isEmpty = segments.length === 0 && !interimText.trim()

  // Auto-scroll ke bagian bawah saat rekaman aktif dan ada teks baru
  useEffect(() => {
    if (isRecording && bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [segments.length, interimText, isRecording])

  const handleConfirmClear = () => {
    onClearAll()
    setShowConfirmClear(false)
  }

  return (
    <section
      className="glass-card rounded-2xl overflow-hidden animate-fade-in shadow-xs border border-slate-200/80 dark:border-slate-800"
      aria-label="Area transkrip diskusi"
    >
      {/* ── Toolbar Utama ── */}
      <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex-wrap gap-2">
        {/* Judul & Status */}
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white flex-shrink-0" />
            <span>Transkrip Dialog</span>
          </h2>

          {isRecording && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
              Live
            </span>
          )}

          {isPaused && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
              ⏸ Dijeda
            </span>
          )}

          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            ({segments.length} segmen)
          </span>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Toggle Timestamp */}
          <button
            type="button"
            id="btn-toggle-timestamps"
            onClick={onToggleTimestamps}
            title={showTimestamps ? 'Sembunyikan Waktu [mm:ss]' : 'Tampilkan Waktu [mm:ss]'}
            className={`min-h-[38px] inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              showTimestamps
                ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Waktu</span>
          </button>

          {/* Toggle Find & Replace */}
          <button
            type="button"
            id="btn-toggle-find-replace"
            onClick={() => setFindReplaceOpen(!findReplaceOpen)}
            title="Cari dan Ganti Istilah Psikologi"
            className={`min-h-[38px] inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              findReplaceOpen
                ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cari & Ganti</span>
          </button>

          {/* Revert All to Raw Text */}
          {onRevertAllSegmentsToRaw && segments.length > 0 && (
            <button
              type="button"
              id="btn-revert-all-transcript"
              onClick={onRevertAllSegmentsToRaw}
              title="Kembalikan seluruh segmen ke teks asli rekaman mesin"
              aria-label="Kembalikan semua segmen ke teks asli"
              className="min-h-[38px] inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Teks Asli</span>
            </button>
          )}

          {/* Divider pemisah tombol berbahaya */}
          <div className="h-4 w-px bg-slate-200 dark:border-slate-700 mx-0.5" />

          {/* Clear All Segments (Destructive styling & separated) */}
          <button
            type="button"
            id="btn-clear-transcript"
            onClick={() => setShowConfirmClear(true)}
            disabled={segments.length === 0}
            title="Bersihkan seluruh isi transkrip"
            aria-label="Bersihkan semua segmen"
            className="min-h-[38px] inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bersihkan</span>
          </button>
        </div>
      </div>

      {/* ── Dialog Konfirmasi Hapus Transkrip ── */}
      {showConfirmClear && (
        <div
          className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-900/60 animate-fade-in"
          role="alertdialog"
        >
          <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Bersihkan seluruh {segments.length} segmen transkrip?</strong> Tindakan ini tidak dapat dibatalkan.
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              id="btn-confirm-clear"
              type="button"
              onClick={handleConfirmClear}
              className="min-h-[36px] px-3.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              Ya, Bersihkan
            </button>
            <button
              id="btn-cancel-clear"
              type="button"
              onClick={() => setShowConfirmClear(false)}
              className="min-h-[36px] px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* ── Find & Replace Bar (Collapsible) ── */}
      {findReplaceOpen && (
        <FindReplaceBar
          findQuery={findQuery}
          setFindQuery={setFindQuery}
          replaceQuery={replaceQuery}
          setReplaceQuery={setReplaceQuery}
          onReplaceAll={onReplaceAll}
          replaceCount={replaceCount}
          onClearCount={onClearReplaceCount}
          onClose={() => setFindReplaceOpen(false)}
        />
      )}

      {/* ── Konten Segmen & Interim ── */}
      <div
        ref={scrollContainerRef}
        className="min-h-[260px] max-h-[60vh] sm:max-h-[580px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/90"
      >
        {/* Single Clean Empty State (Hilangkan teks berulang) */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center text-slate-400 dark:text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Radio className="w-6 h-6 opacity-80" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Belum ada transkrip rekaman
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Pilih pembicara aktif, lalu klik tombol <strong>Rekam</strong> untuk mulai mentranskripsi dialog secara langsung.
              </p>
            </div>
          </div>
        )}

        {/* Daftar Segmen yang Sudah Final */}
        {segments.map((segment, index) => {
          const speaker = speakers.find(s => s.id === segment.speakerId)
          return (
            <SegmentItem
              key={segment.id}
              segment={segment}
              speaker={speaker}
              speakers={speakers}
              showTimestamp={showTimestamps}
              isFirst={index === 0}
              onEdit={onEditSegment}
              onDelete={onDeleteSegment}
              onMerge={onMergeSegment}
              onChangeSpeaker={onChangeSegmentSpeaker}
              onRevertWord={onRevertWord}
              onRevertToRaw={onRevertSegmentToRaw}
            />
          )
        })}

        {/* ── Preview Teks Sementara (Interim) yang Sedang Didengarkan ── */}
        {interimText && (
          <div
            className="flex gap-2.5 sm:gap-3 px-3 sm:px-5 py-3 bg-primary-50/40 dark:bg-primary-950/20 border-t border-dashed border-primary-200 dark:border-primary-800 animate-fade-in"
            aria-live="polite"
          >
            {/* Color bar pembicara aktif */}
            <div
              className="flex-shrink-0 w-1.5 sm:w-1 rounded-full self-stretch animate-pulse"
              style={{ backgroundColor: activeSpeaker.color }}
            />

            <div className="flex-1 min-w-0">
              {/* Speaker tag & live indicator */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${activeSpeaker.color}20`,
                    color: activeSpeaker.color,
                  }}
                >
                  {activeSpeaker.name}
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping inline-block" />
                  Mendengarkan…
                </span>
              </div>

              {/* Interim Text */}
              <p className="text-base sm:text-sm text-slate-600 dark:text-slate-300 italic leading-[1.6]">
                {interimText}
              </p>
            </div>
          </div>
        )}

        {/* Anchor untuk auto-scroll ke bawah */}
        <div ref={bottomAnchorRef} className="h-2" />
      </div>
    </section>
  )
}
