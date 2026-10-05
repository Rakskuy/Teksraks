import { Mic, Pause, Play, Square, Globe, ShieldAlert, Sparkles, BookOpen, Info, FileAudio } from 'lucide-react'
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
  onOpenDictionary?: () => void
  onOpenWhisper?: () => void
}

const LANGUAGES: { value: SupportedLang; label: string; flag: string }[] = [
  { value: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { value: 'en-US', label: 'English (US)',      flag: '🇺🇸' },
  { value: 'en-GB', label: 'English (UK)',      flag: '🇬🇧' },
]

export default function ControlPanel({
  status,
  isSupported,
  lang,
  audioLevel,
  privacyAgreed = true,
  dialectMode = 'standard',
  dialectIntensity = 'medium',
  onStart,
  onPause,
  onResume,
  onStop,
  onLangChange,
  onDialectModeChange,
  onDialectIntensityChange,
  onOpenDictionary,
  onOpenWhisper,
}: ControlPanelProps) {
  const isIdle      = status === 'idle'
  const isRecording = status === 'recording'
  const isPaused    = status === 'paused'
  const isStopping  = status === 'stopping'
  const isActive    = isRecording || isPaused

  return (
    <section
      className="glass-card rounded-2xl p-5 sm:p-6 animate-fade-in shadow-xs"
      aria-label="Panel kontrol perekaman suara"
    >
      <div className="flex flex-col gap-4">

        {/* ── Baris atas: Status + Language Selector ── */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
          {/* Status */}
          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">
              Status Rekaman
            </span>
            <StatusBadge status={status} audioLevel={audioLevel} />
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400 dark:text-slate-400 flex-shrink-0" />
            <label htmlFor="lang-select" className="text-xs text-slate-500 sr-only">
              Pilih Bahasa Transkripsi
            </label>
            <select
              id="lang-select"
              value={lang}
              onChange={e => onLangChange(e.target.value as SupportedLang)}
              disabled={isStopping}
              aria-label="Pilih bahasa transkripsi"
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800
                         border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none
                         focus:ring-2 focus:ring-primary-400 hover:border-slate-300 dark:hover:border-slate-600
                         transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                         appearance-none pr-8 bg-no-repeat shadow-2xs"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 10px center',
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

        {/* ── Mode Logat & Kamus Pribadi ── */}
        <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Mode Logat:
              </span>
              {/* Toggle Mode: Standar vs Bekasi */}
              <div
                className="inline-flex rounded-lg p-0.5 bg-slate-200/80 dark:bg-slate-700"
                role="group"
                aria-label="Pilihan mode pengenalan ucapan dan logat"
              >
                <button
                  type="button"
                  id="btn-mode-standard"
                  onClick={() => onDialectModeChange?.('standard')}
                  aria-pressed={dialectMode === 'standard'}
                  aria-label="Pilih Mode Standar (Bahasa Indonesia Baku)"
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    dialectMode === 'standard'
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Standar
                </button>
                <button
                  type="button"
                  id="btn-mode-bekasi"
                  onClick={() => onDialectModeChange?.('bekasi')}
                  aria-pressed={dialectMode === 'bekasi'}
                  aria-label="Pilih Mode Logat Bekasi (Betawi Ora)"
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                    dialectMode === 'bekasi'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Bekasi</span>
                </button>
              </div>

              {/* Intensitas (hanya jika mode Bekasi) */}
              {dialectMode === 'bekasi' && (
                <div
                  className="flex items-center gap-1.5 animate-fade-in pl-1"
                  role="group"
                  aria-label="Pilihan tingkat intensitas konversi logat Bekasi"
                >
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Intensitas:</span>
                  {(['light', 'medium', 'full'] as const).map(level => {
                    const labelMap = { light: 'Ringan', medium: 'Sedang', full: 'Penuh' }
                    const isSelected = dialectIntensity === level
                    return (
                      <button
                        key={level}
                        type="button"
                        id={`btn-intensity-${level}`}
                        onClick={() => onDialectIntensityChange?.(level)}
                        aria-pressed={isSelected}
                        aria-label={`Pilih tingkat intensitas ${labelMap[level]}`}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors ${
                          isSelected
                            ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                        }`}
                      >
                        {labelMap[level]}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Tombol Kamus Pribadi & Whisper Modal */}
            <div className="flex items-center gap-2 flex-wrap">
              {onOpenWhisper && (
                <button
                  type="button"
                  id="btn-quick-whisper"
                  onClick={onOpenWhisper}
                  disabled={isRecording}
                  aria-label="Buka dialog transkripsi Whisper (Unggah berkas / rekam)"
                  title="Mesin ke-2: Unggah audio / rekam via Whisper AI (OpenAI / Groq)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 border border-violet-200 dark:border-violet-800 rounded-lg shadow-2xs transition-colors disabled:opacity-40"
                >
                  <FileAudio className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Mesin Whisper</span>
                </button>
              )}

              {onOpenDictionary && (
                <button
                  type="button"
                  id="btn-open-dictionary"
                  onClick={onOpenDictionary}
                  aria-label="Buka dialog Kamus Pribadi untuk mengelola leksikon dan pengecualian"
                  title="Kelola Kamus Pribadi (entri kata & daftar pengecualian)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                  <span>Kamus Pribadi</span>
                </button>
              )}
            </div>
          </div>

          {/* Catatan Jelas Pengenalan Suara Logat */}
          <div
            className="flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-800/60 leading-relaxed animate-fade-in"
            role="note"
            aria-label="Catatan pengenalan suara logat daerah"
          >
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Catatan:</strong> Pengenalan suara browser dilatih untuk bahasa baku, jadi logat daerah bisa terdengar berbeda dari hasil tulis. Fitur ini membantu menyesuaikan, namun periksa kembali hasilnya.
            </span>
          </div>
        </div>

        {/* ── Baris tengah: Tombol utama ── */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Tombol MULAI — tampil saat idle */}
            {isIdle && (
              <>
                <button
                  id="btn-start-recording"
                  type="button"
                  onClick={onStart}
                  disabled={!isSupported || isStopping}
                  aria-label="Mulai merekam suara"
                  className="relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm text-white
                             bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700
                             focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900
                             shadow-md hover:shadow-lg active:scale-95 transition-all duration-200
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <span className="relative flex items-center justify-center w-5 h-5">
                    <Mic className="w-5 h-5 relative z-10" strokeWidth={2} />
                  </span>
                  <span>Mulai Rekam</span>
                </button>

                {onOpenWhisper && (
                  <button
                    id="btn-open-whisper"
                    type="button"
                    onClick={onOpenWhisper}
                    disabled={isStopping}
                    aria-label="Buka transkripsi Whisper (Unggah Audio atau Rekam)"
                    title="Mesin Kedua: Whisper AI (OpenAI / Groq) dengan retensi kosakata Bekasi"
                    className="flex items-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-sm text-violet-700 dark:text-violet-300 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 shadow-2xs hover:shadow-xs active:scale-95 transition-all duration-200"
                  >
                    <FileAudio className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span>Unggah / Whisper AI</span>
                  </button>
                )}
              </>
            )}

            {/* Tombol JEDA — tampil saat recording */}
            {isRecording && (
              <button
                id="btn-pause-recording"
                type="button"
                onClick={onPause}
                aria-label="Jeda rekaman sementara"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm
                           bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400
                           border-2 border-amber-300 dark:border-amber-600 hover:bg-amber-50
                           dark:hover:bg-amber-950/40 focus:outline-none focus:ring-4 focus:ring-amber-200
                           shadow-xs hover:shadow active:scale-95 transition-all duration-200"
              >
                <Pause className="w-4 h-4" strokeWidth={2.5} />
                <span>Jeda</span>
              </button>
            )}

            {/* Tombol LANJUTKAN — tampil saat paused */}
            {isPaused && (
              <button
                id="btn-resume-recording"
                type="button"
                onClick={onResume}
                aria-label="Lanjutkan rekaman suara"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white
                           bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600
                           focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-900
                           shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
              >
                <Play className="w-4 h-4" strokeWidth={2.5} fill="currentColor" />
                <span>Lanjutkan</span>
              </button>
            )}

            {/* Tombol BERHENTI — tampil saat ada sesi aktif */}
            {isActive && (
              <button
                id="btn-stop-recording"
                type="button"
                onClick={onStop}
                disabled={isStopping}
                aria-label="Berhenti merekam dan simpan hasil"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white
                           bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700
                           focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900
                           shadow-md hover:shadow-lg active:scale-95 transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                <Square className="w-4 h-4" strokeWidth={0} fill="currentColor" />
                <span>Berhenti</span>
              </button>
            )}

            {/* Spinner saat stopping */}
            {isStopping && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span>Menghentikan…</span>
              </div>
            )}
          </div>

          {/* Privacy Reminder when not agreed */}
          {!privacyAgreed && isIdle && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium animate-fade-in">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Harap centang persetujuan privasi di atas sebelum merekam.</span>
            </p>
          )}
        </div>

        {/* ── Baris bawah: Info audio + tip ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
          {/* Audio level bar */}
          {isRecording ? (
            <div className="flex items-center gap-2" aria-label={`Tingkat audio: ${audioLevel} persen`}>
              <span>Level suara:</span>
              <div className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${audioLevel}%`,
                    background: audioLevel > 70
                      ? 'linear-gradient(to right, #22c55e, #ef4444)'
                      : 'linear-gradient(to right, #22c55e, #86efac)',
                  }}
                />
              </div>
              <span className="w-6 text-right font-mono text-[11px]">{audioLevel}%</span>
            </div>
          ) : (
            <span>
              {isPaused
                ? '⏸ Rekaman dijeda — kalimat yang diucapkan saat ini tidak akan dicatat.'
                : '💡 Gunakan Chrome atau Edge untuk akurasi pengenalan suara terbaik.'}
            </span>
          )}

          {isRecording && (
            <span className="flex items-center gap-1 text-[11px]">
              🌐 Pengenalan suara memerlukan koneksi internet aktif
            </span>
          )}
        </div>

      </div>
    </section>
  )
}
