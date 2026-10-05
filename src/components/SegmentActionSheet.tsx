/**
 * SegmentActionSheet.tsx
 * Bottom sheet untuk tindakan segmen di perangkat mobile:
 * - Edit teks langsung
 * - Ganti pembicara dengan daftar chip
 * - Gabung ke segmen sebelumnya
 * - Kembalikan ke teks asli mesin (rawText)
 * - Hapus segmen
 * Target sentuh minimal 44x44px dan aman dari gesture scroll yang tidak disengaja.
 */

import { useEffect } from 'react'
import {
  X,
  Edit3,
  Merge,
  RotateCcw,
  Trash2,
  UserCheck,
} from 'lucide-react'
import type { Segment, Speaker } from '../types/session'
import { triggerHaptic } from '../utils/haptics'

interface SegmentActionSheetProps {
  isOpen: boolean
  onClose: () => void
  segment: Segment | null
  speaker: Speaker | undefined
  speakers: Speaker[]
  isFirst: boolean
  onStartEdit: (segmentId: string) => void
  onChangeSpeaker: (segmentId: string, speakerId: string) => void
  onMerge: (segmentId: string) => void
  onRevertToRaw?: (segmentId: string) => void
  onDelete: (segmentId: string) => void
}

export default function SegmentActionSheet({
  isOpen,
  onClose,
  segment,
  speaker,
  speakers,
  isFirst,
  onStartEdit,
  onChangeSpeaker,
  onMerge,
  onRevertToRaw,
  onDelete,
}: SegmentActionSheetProps) {
  // Tutup dengan Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !segment) return null

  const displayText = segment.displayText || segment.text || ''
  const hasRawDiff =
    Boolean(onRevertToRaw) &&
    (segment.rawText !== displayText || segment.edited)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="segment-actions-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg max-h-[85dvh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-hidden pb-[calc(env(safe-area-inset-bottom,16px)+8px)] animate-slide-up">
        {/* Drag Handle */}
        <div className="flex items-center justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header with Segment Info */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: speaker?.color ?? '#94A3B8' }}
            />
            <div className="min-w-0">
              <h2 id="segment-actions-title" className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Aksi Segmen ({speaker?.name ?? 'Pembicara'})
              </h2>
              {segment.startTime && (
                <span className="text-[11px] font-mono text-slate-400">
                  Waktu: {segment.startTime}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup aksi segmen"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snippet Teks */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/80">
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
            "{displayText}"
          </p>
        </div>

        {/* Actions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. Edit Teks */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap')
              onClose()
              onStartEdit(segment.id)
            }}
            className="w-full min-h-[48px] px-4 rounded-xl flex items-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-primary-500" />
            <span>Edit Teks Segmen Ini</span>
          </button>

          {/* 2. Ganti Pembicara */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Ganti Pembicara</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {speakers.map(sp => {
                const isSelected = sp.id === segment.speakerId
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap')
                      onChangeSpeaker(segment.id, sp.id)
                      onClose()
                    }}
                    className={`min-h-[44px] px-3 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sp.color }}
                    />
                    <span className="truncate">{sp.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Gabung dengan Segmen Sebelumnya */}
          {!isFirst && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap')
                onMerge(segment.id)
                onClose()
              }}
              className="w-full min-h-[48px] px-4 rounded-xl flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              <Merge className="w-4 h-4 text-violet-500" />
              <span>Gabung dengan Segmen Sebelumnya</span>
            </button>
          )}

          {/* 4. Kembalikan ke Teks Asli Mesin (jika pernah diedit/diterapkan dialek) */}
          {hasRawDiff && onRevertToRaw && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap')
                onRevertToRaw(segment.id)
                onClose()
              }}
              className="w-full min-h-[48px] px-4 rounded-xl flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-semibold text-sm hover:bg-amber-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Kembalikan ke Teks Asli (rawText)</span>
            </button>
          )}

          {/* 5. Hapus Segmen */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('stop')
                onDelete(segment.id)
                onClose()
              }}
              className="w-full min-h-[48px] px-4 rounded-xl flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-sm hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Segmen Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
