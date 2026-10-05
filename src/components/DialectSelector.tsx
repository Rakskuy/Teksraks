import { useState } from 'react'
import { Sparkles, Info, Check, Wand2 } from 'lucide-react'
import type { DialectIntensity } from '../dialect'

export type DialectMode = 'standard' | 'bekasi'

interface DialectSelectorProps {
  mode: DialectMode
  intensity: DialectIntensity
  onModeChange: (mode: DialectMode) => void
  onIntensityChange: (intensity: DialectIntensity) => void
  onApplyToAllSegments?: () => void
  segmentCount: number
}

const INTENSITY_DETAILS: Record<
  DialectIntensity,
  { label: string; badge: string; desc: string; examples: string }
> = {
  light: {
    label: 'Ringan',
    badge: 'Kata Ganti & Negasi',
    desc: 'Hanya mengubah kata ganti orang (aku→gue, kamu→lu, dia→die), negasi (tidak→kagak), dan partikel frekuen (saja→aje, cuma→doang, sekali→banget).',
    examples: 'Kamu tidak tahu saja → Lu kagak tahu aje'
  },
  medium: {
    label: 'Sedang',
    badge: 'Kamus Umum (Default)',
    desc: 'Mencakup tingkat ringan ditambah kosakata umum sehari-hari (uang→duit, bohong→boong, benar→bener, ibu/bapak→nyokap/bokap, sama→same).',
    examples: 'Ibu tidak punya uang sama sekali → Nyokap kagak punya duit same banget'
  },
  full: {
    label: 'Penuh',
    badge: 'Kamus + Fonologis -a→-e',
    desc: 'Mencakup seluruh kosakata, pergeseran vokal fonologis (-a→-e pada whitelist: bisa→bise, ada→ade), serta partikel ekspresif (yang→nyang, kenapa→ngapa).',
    examples: 'Yang bisa dia bawa ke sana → Nyang bise die bawe ke mane'
  }
}

export default function DialectSelector({
  mode,
  intensity,
  onModeChange,
  onIntensityChange,
  onApplyToAllSegments,
  segmentCount
}: DialectSelectorProps) {
  const [showInfo, setShowInfo] = useState(false)
  const isBekasi = mode === 'bekasi'

  return (
    <div
      className={`glass-card rounded-2xl p-4 sm:p-5 transition-all duration-300 border ${
        isBekasi
          ? 'border-amber-400/60 dark:border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
      role="region"
      aria-label="Pengaturan Mode Dialek dan Bahasa"
    >
      <div className="flex flex-col gap-3.5">
        {/* Header baris atas */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                isBekasi
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                Lapisan Pasca-Proses Bahasa & Dialek
                {isBekasi && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    Aktif
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih gaya bahasa teks transkripsi (Standar Baku atau Logat Bekasi)
              </p>
            </div>
          </div>

          {/* Toggle Info Penjelasan */}
          <button
            type="button"
            onClick={() => setShowInfo(prev => !prev)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            title="Pelajari tentang lapisan dialek"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showInfo ? 'Tutup Info' : 'Panduan Aturan'}</span>
          </button>
        </div>

        {/* Pemilihan Mode: Standar vs Logat Bekasi */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-sm">
            <button
              type="button"
              onClick={() => onModeChange('standard')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                !isBekasi
                  ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {!isBekasi && <Check className="w-3.5 h-3.5" />}
              <span>Standar (Baku)</span>
            </button>

            <button
              type="button"
              onClick={() => onModeChange('bekasi')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                isBekasi
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {isBekasi && <Check className="w-3.5 h-3.5" />}
              <span>Logat Bekasi</span>
            </button>
          </div>

          {/* Tombol Aksi Konversi Segmen yang Ada */}
          {isBekasi && segmentCount > 0 && onApplyToAllSegments && (
            <button
              type="button"
              onClick={onApplyToAllSegments}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 transition-colors ml-auto"
              title="Konversi seluruh segmen transkrip yang ada saat ini ke Logat Bekasi"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Konversi {segmentCount} Segmen Sekarang</span>
            </button>
          )}
        </div>

        {/* Kontrol Tingkat Intensitas (Hanya tampil jika Logat Bekasi aktif) */}
        {isBekasi && (
          <div className="pt-2 border-t border-amber-200/50 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Tingkat Intensitas:
              </span>
              <div className="inline-flex rounded-lg p-0.5 bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
                {(['light', 'medium', 'full'] as DialectIntensity[]).map(tier => {
                  const isActive = intensity === tier
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => onIntensityChange(tier)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-amber-900 dark:text-amber-200 hover:bg-amber-200/60 dark:hover:bg-amber-900/40'
                      }`}
                    >
                      {INTENSITY_DETAILS[tier].label}
                    </button>
                  )
                })}
              </div>
            </div>

            <span className="text-[11px] text-amber-700 dark:text-amber-300 italic">
              {INTENSITY_DETAILS[intensity].badge}
            </span>
          </div>
        )}

        {/* Panel Informasi / Panduan Aturan Keamanan */}
        {showInfo && (
          <div className="mt-1 p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 space-y-2 animate-fade-in">
            <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary-500" />
              <span>Aturan Keamanan Linguistik & Pengecualian:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <li>
                <strong>Istilah Psikologi Terlindungi:</strong> Kata seperti <em>psikologi, kognitif, amigdala, neuroplastisitas, katarsis, ego</em> tidak akan pernah diubah.
              </li>
              <li>
                <strong>Batas Kata Aman:</strong> Kata majemuk/imbuhan seperti <em>apalagi, apapun, bersama, padahal</em> tidak terpotong sebagian.
              </li>
              <li>
                <strong>Kata -a Non-Logat:</strong> Kata baku seperti <em>manusia, dunia, bahasa, mahasiswa, kuliah, agama</em> dipertahankan tetap baku.
              </li>
              <li>
                <strong>Kutipan Terproteksi:</strong> Istilah atau kalimat di dalam tanda kutip (&ldquo;...&rdquo; atau &lsquo;...&rsquo;) tidak disentuh.
              </li>
            </ul>
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
              <strong>Contoh Aktif ({INTENSITY_DETAILS[intensity].label}):</strong>{' '}
              <span className="text-amber-700 dark:text-amber-300 font-mono">
                {INTENSITY_DETAILS[intensity].examples}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
