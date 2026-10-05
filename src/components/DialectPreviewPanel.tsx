/**
 * DialectPreviewPanel.tsx
 * Panel "Pratinjau Logat" dengan komparasi dua kolom:
 * - Kolom Kiri: Teks Asli (Mesin / Baku) — interaktif dengan preset uji coba cepat
 * - Kolom Kanan: Hasil Konversi (Logat Bekasi) — highlight kata logat dengan garis bawah putus-putus
 * - Dukungan inspeksi segmen sesi aktif dan pengujian kalimat kustom
 * - Aksesibilitas WCAG AA, dark mode, dan label ARIA lengkap
 */
import { useState, useMemo } from 'react'
import {
  Eye,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  FileText,
} from 'lucide-react'
import { applyBekasi, type DialectIntensity } from '../dialect'
import type { Segment } from '../types/session'

interface DialectPreviewPanelProps {
  intensity: DialectIntensity
  onIntensityChange?: (intensity: DialectIntensity) => void
  segments?: Segment[]
}

const PRESET_SENTENCES = [
  {
    label: 'Percakapan Harian',
    text: 'Kamu tidak tahu kalau saya mau pergi ke mana sekarang? Dia sama sekali belum punya uang.',
    category: 'daily',
  },
  {
    label: 'Campuran Indo-Inggris',
    text: 'Saya lagi burnout banget sama tugas kuliah, kamu sudah submit assignment presentation belum?',
    category: 'mixed',
  },
  {
    label: 'Istilah Psikologi & Nama',
    text: 'Dr. Richard Lazarus dan Susan Folkman meneliti cognitive appraisal dan skizofrenia pada manusia.',
    category: 'psychology',
  },
  {
    label: 'Kata Ulang & Negasi',
    text: 'Dia tidak apa-apa sama sekali, cuma bohong doang waktu ditanya sama ibu dan bapak.',
    category: 'reduplication',
  },
]

export default function DialectPreviewPanel({
  intensity,
  onIntensityChange,
  segments = [],
}: DialectPreviewPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'custom' | 'session'>('custom')
  const [inputText, setInputText] = useState(
    'Kamu tidak tahu kalau saya mau pergi ke mana sekarang? Dia sama sekali belum punya uang.',
  )
  const [copied, setCopied] = useState(false)

  // Transform teks kustom secara live
  const transformResult = useMemo(() => {
    return applyBekasi(inputText, { intensity })
  }, [inputText, intensity])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transformResult.displayText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore clipboard write error
    }
  }

  // Tokenize hasil konversi untuk highlight visual dengan garis bawah putus-putus
  const renderedConvertedTokens = useMemo(() => {
    if (!transformResult.displayText) return null

    const changeMap = new Map<string, string>()
    for (const ch of transformResult.changes) {
      changeMap.set(ch.replacement.toLowerCase(), ch.original)
    }

    const tokens = transformResult.displayText.split(
      /(\b[a-zA-Z\u00C0-\u024F]+(?:-[a-zA-Z\u00C0-\u024F]+)*\b)/g,
    )

    return tokens.map((token, idx) => {
      const lower = token.toLowerCase()
      const originalWord = changeMap.get(lower)

      if (originalWord) {
        return (
          <span
            key={idx}
            className="inline-block bg-amber-100/90 dark:bg-amber-900/50 text-amber-950 dark:text-amber-100 font-semibold px-1 py-0.5 rounded-sm border-b-2 border-dashed border-amber-500/80 dark:border-amber-400/80 underline decoration-dashed decoration-amber-600 dark:decoration-amber-400 decoration-2 underline-offset-4"
            title={`Diubah dari kata baku: "${originalWord}"`}
            aria-label={`Kata logat ${token}, bentuk baku: ${originalWord}`}
          >
            {token}
          </span>
        )
      }

      return <span key={idx}>{token}</span>
    })
  }, [transformResult])

  return (
    <section
      className="glass-card rounded-2xl overflow-hidden animate-fade-in shadow-xs border border-slate-200/80 dark:border-slate-800"
      aria-label="Panel Pratinjau dan Komparasi Logat Bekasi"
    >
      {/* Header Bar Accordion */}
      <button
        type="button"
        id="btn-toggle-dialect-preview"
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
        aria-controls="dialect-preview-content"
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pratinjau Logat (Komparasi Teks)</span>
              <span className="text-[10px] lowercase font-normal px-2 py-0.5 bg-amber-100/80 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-full border border-amber-300/40 dark:border-amber-700/40">
                2 kolom
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Bandingkan teks asli (kiri) dengan hasil konversi logat Bekasi (kanan) secara instan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>{isOpen ? 'Ciutkan' : 'Buka Pratinjau'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Konten Pratinjau */}
      {isOpen && (
        <div
          id="dialect-preview-content"
          className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-slate-50/40 dark:bg-slate-900/30"
        >
          {/* Bar Kontrol & Pilihan Preset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tab: Uji Coba Kustom vs Segmen Sesi */}
            <div className="inline-flex p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-xs" role="tablist">
              <button
                type="button"
                role="tab"
                id="tab-preview-custom"
                aria-selected={activeTab === 'custom'}
                onClick={() => setActiveTab('custom')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                  activeTab === 'custom'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Uji Kalimat Kustom</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-preview-session"
                aria-selected={activeTab === 'session'}
                onClick={() => setActiveTab('session')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                  activeTab === 'session'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Segmen Sesi Aktif ({segments.length})</span>
              </button>
            </div>

            {/* Intensitas Selector Pills di Pratinjau */}
            {onIntensityChange && (
              <div className="flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Intensitas:</span>
                {(['light', 'medium', 'full'] as const).map(lvl => {
                  const lblMap = { light: 'Ringan', medium: 'Sedang', full: 'Penuh' }
                  const isSel = intensity === lvl
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => onIntensityChange(lvl)}
                      aria-pressed={isSel}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors ${
                        isSel
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {lblMap[lvl]}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* TAB 1: UJI COBA KALIMAT KUSTOM */}
          {activeTab === 'custom' && (
            <div className="space-y-3">
              {/* Preset Tombol Cepat */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mr-1">
                  Coba Kalimat:
                </span>
                {PRESET_SENTENCES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(preset.text)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  title="Kosongkan teks input"
                  className="px-2 py-1 text-[11px] rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Grid 2 Kolom Komparasi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kolom Kiri: Teks Asli Mesin / Baku */}
                <div className="flex flex-col bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/60 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Kolom Kiri: Teks Asli (Mesin / Baku)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} kata
                    </span>
                  </div>

                  <textarea
                    id="textarea-preview-original"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Ketik atau tempel kalimat di sini untuk melihat konversi logat secara langsung..."
                    rows={4}
                    aria-label="Input teks asli untuk pratinjau konversi logat"
                    className="w-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-transparent resize-y focus:outline-none placeholder-slate-400 leading-relaxed"
                  />
                </div>

                {/* Kolom Kanan: Hasil Konversi Logat Bekasi */}
                <div className="flex flex-col bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-3.5 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/60 dark:border-amber-800/40 text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Kolom Kanan: Hasil Konversi (Logat Bekasi)
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-300/40 dark:border-amber-700/40">
                        {transformResult.changes.length} kata diubah
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!transformResult.displayText}
                        title="Salin hasil konversi ke clipboard"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors disabled:opacity-30"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  <div
                    id="preview-converted-output"
                    className="flex-1 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed break-words min-h-[80px]"
                    aria-live="polite"
                  >
                    {transformResult.displayText ? (
                      renderedConvertedTokens
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Hasil konversi logat akan muncul di sini...
                      </span>
                    )}
                  </div>

                  {/* Ringkasan Perubahan Kata */}
                  {transformResult.changes.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-amber-200/50 dark:border-amber-800/40 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Perubahan:</span>
                      {transformResult.changes.map((ch, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-amber-800 font-mono text-[10px]"
                        >
                          <span className="line-through text-slate-400">{ch.original}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-amber-500" />
                          <span className="font-bold text-amber-600 dark:text-amber-400">{ch.replacement}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRATINJAU SEGMEN SESI AKTIF */}
          {activeTab === 'session' && (
            <div className="space-y-3">
              {segments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  Belum ada segmen transkrip pada sesi ini. Mulai merekam atau muat data uji untuk melihat perbandingan per segmen.
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {segments.slice(0, 8).map(seg => (
                    <div
                      key={seg.id}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                    >
                      {/* Teks Asli Segmen */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <span>{seg.startTime || seg.timestamp}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Teks Asli Mesin:</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                          {seg.rawText || seg.text}
                        </p>
                      </div>

                      {/* Teks Display Segmen */}
                      <div className="space-y-1 bg-amber-50/30 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/40">
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>Hasil Tampil (Logat / Suntingan):</span>
                          {seg.edited && (
                            <span className="ml-auto text-[9px] text-slate-400 italic font-normal">
                              (diedit manual)
                            </span>
                          )}
                        </div>
                        <p className="text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                          {seg.displayText || seg.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {segments.length > 8 && (
                    <p className="text-[11px] text-center text-slate-400 pt-1">
                      Menampilkan 8 segmen pertama dari total {segments.length} segmen.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
