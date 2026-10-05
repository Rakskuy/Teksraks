/**
 * MobileBottomBar.tsx
 * Bilah kontrol bawah tetap (sticky bottom bar) untuk mobile (HP 320-430px):
 * 1. Status indikator: Titik merah berkedip saat merekam, durasi waktu (mm:ss), dan level suara visual
 * 2. Strip chip pembicara: Horizontal scroll-snap tepat di atas tombol kontrol, active state (warna + ikon check)
 * 3. Tombol utama jempol: Rekam/Jeda besar di tengah (68px), Berhenti/Whisper di kiri, Menu/Pengaturan di kanan
 * 4. Getaran haptik (navigator.vibrate) saat mulai, jeda, dan berhenti
 * 5. Safe-area aware (env(safe-area-inset-bottom))
 */

import { useRef, useEffect } from 'react'
import {
  Mic,
  Pause,
  Play,
  Square,
  SlidersHorizontal,
  Plus,
  Check,
  FileAudio,
} from 'lucide-react'
import type { RecordingStatus } from '../types/speech.d'
import type { Speaker } from '../types/session'
import { triggerHaptic } from '../utils/haptics'

interface MobileBottomBarProps {
  status: RecordingStatus
  isSupported: boolean
  audioLevel: number
  durationFormatted: string
  speakers: Speaker[]
  activeSpeakerId: string
  onSelectSpeaker: (id: string) => void
  onAddSpeaker: () => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onOpenMenu: () => void
  onOpenWhisper: () => void
}

export default function MobileBottomBar({
  status,
  isSupported,
  audioLevel,
  durationFormatted,
  speakers,
  activeSpeakerId,
  onSelectSpeaker,
  onAddSpeaker,
  onStart,
  onPause,
  onResume,
  onStop,
  onOpenMenu,
  onOpenWhisper,
}: MobileBottomBarProps) {
  const isRecording = status === 'recording'
  const isPaused = status === 'paused'
  const isIdle = status === 'idle'

  // Scroll active speaker chip into view when activeSpeakerId changes
  const activeChipRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (activeChipRef.current) {
      activeChipRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [activeSpeakerId])

  const handleCenterAction = () => {
    if (!isSupported) return
    if (isIdle) {
      triggerHaptic('start')
      onStart()
    } else if (isRecording) {
      triggerHaptic('tap')
      onPause()
    } else if (isPaused) {
      triggerHaptic('start')
      onResume()
    }
  }

  const handleStopAction = () => {
    triggerHaptic('stop')
    onStop()
  }

  // Mini audio visualizer bars calculation
  const clampedLevel = Math.min(1, Math.max(0, audioLevel))
  const barHeights = isRecording
    ? [
        Math.max(4, Math.round(clampedLevel * 18)),
        Math.max(6, Math.round(clampedLevel * 24)),
        Math.max(8, Math.round(clampedLevel * 28)),
        Math.max(6, Math.round(clampedLevel * 22)),
        Math.max(4, Math.round(clampedLevel * 16)),
      ]
    : [4, 4, 4, 4, 4]

  return (
    <nav
      aria-label="Bilah kontrol perekaman mobile"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 shadow-2xl transition-all duration-200 select-none"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
      }}
    >
      {/* ── 1. Mini Status Bar (Indikator + Timer + Visualizer Level Suara) ── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 text-xs">
        {/* Status Mode */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isRecording ? (
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
              <span>Merekam</span>
            </span>
          ) : isPaused ? (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Dijeda</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 inline-block" />
              <span>Siap</span>
            </span>
          )}
        </div>

        {/* Mini Audio Visualizer Wave */}
        <div
          className="flex items-end gap-1 h-5 px-2"
          aria-label={`Level suara: ${Math.round(clampedLevel * 100)}%`}
        >
          {barHeights.map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-75 ${
                isRecording
                  ? 'bg-rose-500 dark:bg-rose-400'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        {/* Timer Durasi */}
        <div className="flex items-center gap-1 font-mono font-bold text-xs text-slate-700 dark:text-slate-200">
          <span>{durationFormatted || '00:00'}</span>
        </div>
      </div>

      {/* ── 2. Strip Chip Pembicara (Horizontal Scroll-Snap tepat di atas kontrol) ── */}
      <div className="px-3 pt-2 pb-1">
        <div
          className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory py-0.5"
          role="region"
          aria-label="Pilihan Pembicara Aktif"
        >
          {speakers.map(sp => {
            const isActive = sp.id === activeSpeakerId
            return (
              <button
                key={sp.id}
                ref={isActive ? activeChipRef : null}
                type="button"
                onClick={() => {
                  triggerHaptic('tap')
                  onSelectSpeaker(sp.id)
                }}
                aria-pressed={isActive}
                aria-label={`Pilih ${sp.name} sebagai pembicara aktif`}
                className={`snap-start min-h-[44px] px-3.5 rounded-full flex items-center gap-1.5 text-xs font-bold border transition-all active:scale-95 flex-shrink-0 ${
                  isActive
                    ? 'shadow-xs text-white'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: sp.color,
                        borderColor: sp.color,
                      }
                    : {
                        borderColor: `${sp.color}50`,
                      }
                }
              >
                {/* Visual aktif dibedakan warna DAN ikon checkmark */}
                {isActive ? (
                  <Check className="w-3.5 h-3.5 stroke-[3] text-white flex-shrink-0" />
                ) : (
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sp.color }}
                  />
                )}
                <span className="truncate max-w-[120px]">{sp.name}</span>
              </button>
            )
          })}

          {/* Tombol Tambah Pembicara Baru */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap')
              onAddSpeaker()
            }}
            aria-label="Tambah pembicara baru"
            title="Tambah pembicara baru"
            className="snap-start min-w-[44px] min-h-[44px] rounded-full border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 3. Tombol Aksi Jempol (Ergonomi Tangan Satu) ── */}
      <div className="flex items-center justify-around px-4 pt-1 pb-1">
        {/* Tombol Kiri: Stop jika aktif, Whisper jika idle */}
        {!isIdle ? (
          <button
            type="button"
            id="btn-mobile-stop"
            onClick={handleStopAction}
            aria-label="Berhenti merekam"
            className="min-w-[56px] min-h-[56px] rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900/70 flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all shadow-xs"
          >
            <Square className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-bold">Stop</span>
          </button>
        ) : (
          <button
            type="button"
            id="btn-mobile-whisper"
            onClick={() => {
              triggerHaptic('tap')
              onOpenWhisper()
            }}
            aria-label="Unggah audio ke Whisper"
            className="min-w-[56px] min-h-[56px] rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all shadow-2xs"
          >
            <FileAudio className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-semibold">Audio</span>
          </button>
        )}

        {/* Tombol Tengah: Rekam/Jeda Besar (68px) */}
        <button
          type="button"
          id="btn-mobile-record-main"
          onClick={handleCenterAction}
          disabled={!isSupported}
          aria-label={
            isIdle
              ? 'Mulai merekam percakapan'
              : isRecording
              ? 'Jeda rekaman'
              : 'Lanjutkan rekaman'
          }
          className={`w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 focus:outline-none shadow-lg ${
            !isSupported
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              : isIdle
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/35 active:bg-rose-800'
              : isRecording
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/35 animate-pulse'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/35'
          }`}
        >
          {isIdle ? (
            <Mic className="w-8 h-8" />
          ) : isRecording ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-0.5" />
          )}
        </button>

        {/* Tombol Kanan: Menu Pengaturan Sekunder */}
        <button
          type="button"
          id="btn-mobile-menu"
          onClick={() => {
            triggerHaptic('tap')
            onOpenMenu()
          }}
          aria-label="Buka menu pengaturan dan alat"
          className="min-w-[56px] min-h-[56px] rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all shadow-2xs"
        >
          <SlidersHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <span className="text-[10px] font-semibold">Menu</span>
        </button>
      </div>
    </nav>
  )
}
