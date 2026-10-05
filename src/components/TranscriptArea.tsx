/**
 * TranscriptArea.tsx
 * Area transkripsi diskusi berbasis segmen:
 * - Menampilkan daftar segmen per pembicara dengan warna masing-masing
 * - Preview live teks sementara (interim) dengan indikator aktif
 * - Toolbar: toggle timestamp, cari & ganti kata, hapus semua dengan konfirmasi
 * - Dukungan edit teks langsung, ubah pembicara, gabung segmen, dan hapus segmen
 * - Dukungan penuh Dark Mode dan aksesibilitas WCAG AA
 */
import { useState } from 'react'
import {
  Trash2,
  Clock,
  Search,
  AlertTriangle,
  Radio,
  Sparkles,
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

  const activeSpeaker =
    speakers.find(s => s.id === activeSpeakerId) || speakers[0]

  const isRecording = status === 'recording'
  const isPaused = status === 'paused'
  const isEmpty = segments.length === 0 && !interimText.trim()

  const handleConfirmClear = () => {
    onClearAll()
    setShowConfirmClear(false)
  }

  return (
    <section
      className="glass-card rounded-2xl overflow-hidden animate-fade-in shadow-xs"
      aria-label="Area transkripsi diskusi"
    >
      {/* ── Toolbar Utama ── */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex-wrap gap-2">
        {/* Judul & Status */}
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-violet-500 flex-shrink-0" />
            Transkripsi Dialog Diskusi
          </h2>

          {isRecording && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
              Merekam Live
            </span>
          )}

          {isPaused && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
              ⏸ Dijeda
            </span>
          )}

          <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400 font-normal">
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
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
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
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
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
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold
                         bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700
                         hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Teks Asli</span>
            </button>
          )}

          {/* Clear All Segments */}
          <button
            type="button"
            id="btn-clear-transcript"
            onClick={() => setShowConfirmClear(true)}
            disabled={segments.length === 0}
            title="Bersihkan seluruh segmen transkrip"
            aria-label="Bersihkan semua segmen"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300
                       hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700
                       hover:border-red-200 dark:hover:border-red-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bersihkan</span>
          </button>
        </div>
      </div>

      {/* ── Dialog Konfirmasi Hapus Semua ── */}
      {showConfirmClear && (
        <div
          className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-900/60 animate-fade-in"
          role="alertdialog"
        >
          <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Hapus semua {segments.length} segmen transkrip?</strong> Tindakan ini
              tidak dapat dibatalkan.
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              id="btn-confirm-clear"
              type="button"
              onClick={handleConfirmClear}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Ya, Hapus
            </button>
            <button
              id="btn-cancel-clear"
              type="button"
              onClick={() => setShowConfirmClear(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition"
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
      <div className="min-h-[260px] max-h-[580px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/90">
        {/* Empty State */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-slate-400 dark:text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-violet-100 dark:from-primary-950 dark:to-violet-950 flex items-center justify-center text-primary-500 dark:text-primary-400 shadow-inner">
              <Radio className="w-8 h-8 opacity-75" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Belum ada rekaman transkripsi diskusi
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Pilih pembicara aktif di atas (atau tekan angka 1-9 pada keyboard),
                lalu klik <strong>Mulai Rekam</strong> untuk merekam suara secara real-time.
              </p>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              Tip: Anda dapat langsung mengklik teks segmen mana pun nanti untuk mengeditnya.
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
            className="flex gap-3 px-4 sm:px-5 py-3.5 bg-primary-50/40 dark:bg-primary-950/20 border-t border-dashed border-primary-200 dark:border-primary-800 animate-fade-in"
            aria-live="polite"
          >
            {/* Color bar pembicara aktif */}
            <div
              className="flex-shrink-0 w-1 rounded-full self-stretch animate-pulse"
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

                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 dark:text-primary-400 italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping inline-block" />
                  Mendengarkan…
                </span>
              </div>

              {/* Interim Text (abu-abu, miring) */}
              <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                {interimText}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
