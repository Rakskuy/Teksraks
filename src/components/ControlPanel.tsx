/**
 * ControlPanel.tsx
 * KARTU REKAMAN UTAMA Teksraks:
 * - Status rekaman & visualizer level audio
 * - Tombol aksi utama: Rekam (besar, primer), Jeda/Lanjut, Berhenti
 * - Tombol sekunder: Unggah Audio (Whisper)
 * - Pemilih bahasa transkripsi
 * - KONTROL TUNGGAL Mode Logat (Standar | Bekasi) + Intensitas (Ringan/Sedang/Penuh)
 * - Link info aturan panduan logat ringkas
 */

import { useState } from 'react'
import {
  Mic,
  Pause,
  Play,
  Square,
  Globe,
  Sparkles,
  Info,
  FileAudio,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { RecordingStatus, SupportedLang } from '../types/speech.d'
import type { DialectMode, DialectIntensity } from '../dialect'
import StatusBadge from './StatusBadge'

interface ControlPanelProps {
  status: RecordingStatus
  isSupported: boolean
  lang: SupportedLang
  audioLevel: number
  privacyAgreed?: boolean
  dialectMode?: DialectMode
  dialectIntensity?: DialectIntensity
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onLangChange: (lang: SupportedLang) => void
  onDialectModeChange?: (mode: DialectMode) => void
  onDialectIntensityChange?: (intensity: DialectIntensity) => void
  onOpenWhisper?: () => void
  onApplyToAllSegments?: () => void
  segmentCount?: number
}

const LANGUAGES: { value: SupportedLang; label: string; flag: string }[] = [
  { value: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
]

export default function ControlPanel({
  status,
  isSupported,
  lang,
  audioLevel,
  dialectMode = 'standard',
  dialectIntensity = 'medium',
  onStart,
  onPause,
  onResume,
  onStop,
  onLangChange,
  onDialectModeChange,
  onDialectIntensityChange,
  onOpenWhisper,
  onApplyToAllSegments,
  segmentCount = 0,
}: ControlPanelProps) {
  const [showRuleInfo, setShowRuleInfo] = useState(false)

  const isIdle = status === 'idle'
  const isRecording = status === 'recording'
  const isPaused = status === 'paused'
  const isStopping = status === 'stopping'

  const isBekasi = dialectMode === 'bekasi'

  return (
    <section
      className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-in shadow-xs border border-slate-200/80 dark:border-slate-800"
      aria-label="Panel kontrol perekaman suara"
    >
      <div className="flex flex-col gap-3.5">
        {/* ── 1. Baris Atas: Status Rekaman & Pemilih Bahasa ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} audioLevel={audioLevel} />
          </div>

          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <label htmlFor="lang-select" className="sr-only">
              Pilih Bahasa Transkrip
            </label>
            <select
              id="lang-select"
              value={lang}
              onChange={e => onLangChange(e.target.value as SupportedLang)}
              disabled={isStopping}
              aria-label="Pilih bahasa transkrip"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer disabled:opacity-40 appearance-none pr-7 bg-no-repeat shadow-2xs"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 8px center',
              }}
            >
              {LANGUAGES.map(({ value, label, flag }) => (
                <option key={value} value={value} className="dark:bg-slate-800">
                  {flag} {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── 2. Baris Utama Aksi Rekam (Satu Tombol Primer) ── */}
        <div className="flex items-center justify-center gap-3 py-1 flex-wrap">
          {/* Status IDLE: Tombol REKAM primer + Tombol Unggah Audio sekunder */}
          {isIdle && (
            <>
              <button
                id="btn-start-recording"
                type="button"
                onClick={onStart}
                disabled={!isSupported || isStopping}
                aria-label="Mulai merekam suara"
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white shadow-sm hover:shadow active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Mic className="w-5 h-5 text-rose-500 dark:text-rose-600" strokeWidth={2.4} />
                <span>Rekam</span>
              </button>

              {onOpenWhisper && (
                <button
                  id="btn-open-whisper"
                  type="button"
                  onClick={onOpenWhisper}
                  disabled={isStopping}
                  aria-label="Unggah berkas audio untuk ditranskripsi"
                  title="Unggah berkas audio via mesin Whisper AI"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95 transition-all"
                >
                  <FileAudio className="w-4 h-4 text-slate-500" />
                  <span>Unggah Audio</span>
                </button>
              )}
            </>
          )}

          {/* Status RECORDING: Tombol Jeda (primer) + Tombol Berhenti (sekunder berbahaya) */}
          {isRecording && (
            <>
              <button
                id="btn-pause-recording"
                type="button"
                onClick={onPause}
                aria-label="Jeda rekaman sementara"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow animate-pulse active:scale-95 transition-all"
              >
                <Pause className="w-4 h-4" strokeWidth={2.5} />
                <span>Jeda</span>
              </button>

              <button
                id="btn-stop-recording"
                type="button"
                onClick={onStop}
                aria-label="Berhenti merekam"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 active:scale-95 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Berhenti</span>
              </button>
            </>
          )}

          {/* Status PAUSED: Tombol Lanjut (primer) + Tombol Berhenti (sekunder berbahaya) */}
          {isPaused && (
            <>
              <button
                id="btn-resume-recording"
                type="button"
                onClick={onResume}
                aria-label="Lanjutkan rekaman"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white shadow-sm active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 ml-0.5" />
                <span>Lanjut Rekam</span>
              </button>

              <button
                id="btn-stop-recording-paused"
                type="button"
                onClick={onStop}
                aria-label="Berhenti merekam"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 active:scale-95 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Berhenti</span>
              </button>
            </>
          )}
        </div>

        {/* ── 3. SATU Kontrol Tunggal Mode Logat (Standar | Bekasi) + Intensitas ── */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Mode Logat:</span>
              </span>

              {/* Segmented Toggle: Standar vs Bekasi */}
              <div
                className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                role="group"
                aria-label="Pilihan mode logat"
              >
                <button
                  type="button"
                  id="btn-mode-standard"
                  onClick={() => onDialectModeChange?.('standard')}
                  aria-pressed={!isBekasi}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    !isBekasi
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Standar
                </button>
                <button
                  type="button"
                  id="btn-mode-bekasi"
                  onClick={() => onDialectModeChange?.('bekasi')}
                  aria-pressed={isBekasi}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    isBekasi
                      ? 'bg-amber-500 text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Bekasi
                </button>
              </div>

              {/* Intensitas (Muncul HANYA saat Mode Bekasi dipilih) */}
              {isBekasi && (
                <div
                  className="flex items-center gap-1 animate-fade-in pl-1"
                  role="group"
                  aria-label="Pilihan tingkat intensitas logat Bekasi"
                >
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Intensitas:
                  </span>
                  {(['light', 'medium', 'full'] as const).map(lvl => {
                    const labelMap = { light: 'Ringan', medium: 'Sedang', full: 'Penuh' }
                    const isSelected = dialectIntensity === lvl
                    return (
                      <button
                        key={lvl}
                        type="button"
                        id={`btn-intensity-${lvl}`}
                        onClick={() => onDialectIntensityChange?.(lvl)}
                        aria-pressed={isSelected}
                        className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
                          isSelected
                            ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {labelMap[lvl]}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Aksi Sampingan Logat: Konversi Segmen & Panduan Aturan */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {isBekasi && segmentCount > 0 && onApplyToAllSegments && (
                <button
                  type="button"
                  onClick={onApplyToAllSegments}
                  title="Konversi seluruh segmen transkrip yang ada ke Logat Bekasi"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg transition-colors"
                >
                  <Wand2 className="w-3 h-3 text-amber-500" />
                  <span>Konversi {segmentCount} Segmen</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowRuleInfo(v => !v)}
                aria-expanded={showRuleInfo}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Panduan Aturan</span>
                {showRuleInfo ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Catatan Kuning Dipersingkat Menjadi 1 Baris */}
          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300/90 pt-0.5">
            <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="truncate">
              Pengenalan suara peramban berbasis bahasa baku; logat disesuaikan pasca-transkripsi.
            </span>
          </div>

          {/* Panduan Aturan Dropdown (Bila Diketuk) */}
          {showRuleInfo && (
            <div className="mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 animate-fade-in">
              <span className="font-bold text-slate-800 dark:text-slate-100 block">
                Aturan Keamanan Bahasa & Istilah:
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <strong>Istilah Psikologi Terlindungi:</strong> Kata seperti <em>psikologi, kognitif, amigdala, neuroplastisitas, katarsis, ego</em> tidak pernah diubah.
                </li>
                <li>
                  <strong>Bentuk Baku Non-Logat:</strong> Kata berakhiran -a seperti <em>manusia, dunia, bahasa, mahasiswa, kuliah</em> tetap baku.
                </li>
                <li>
                  <strong>Teks dalam Kutipan:</strong> Kalimat di dalam tanda petik (&ldquo;...&rdquo;) dipertahankan apa adanya.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
