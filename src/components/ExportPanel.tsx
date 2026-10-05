/**
 * ExportPanel.tsx
 * Panel ekspor transkripsi dalam 3 format (TXT, DOCX, PDF)
 * Dilengkapi opsi timestamp, opsi nama pembicara, pratinjau nama file otomatis,
 * tombol pemuat data uji (2.000+ kata, 3 pembicara), dan callback unduh sukses.
 */
import { useState } from 'react'
import {
  FileText,
  FileType,
  Download,
  Loader2,
  Clock,
  UserCheck,
  Sparkles,
  FileCheck,
  RotateCcw,
} from 'lucide-react'
import { exportTxt } from '../utils/exportTxt'
import { exportDocx } from '../utils/exportDocx'
import { exportPdf } from '../utils/exportPdf'
import { formatFilename } from '../utils/filename'
import type { ExportSessionPayload, ExportOptions } from '../utils/exportTxt'

interface ExportPanelProps {
  session: ExportSessionPayload
  onLoadSampleData?: () => void
  onExportSuccess?: () => void
}

type ExportFormat = 'txt' | 'docx' | 'pdf'

export default function ExportPanel({
  session,
  onLoadSampleData,
  onExportSuccess,
}: ExportPanelProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null)
  const [options, setOptions] = useState<ExportOptions>({
    includeTimestamp: true,
    includeSpeaker: true,
    useRawText: false,
  })

  const hasSegments = session.segments.length > 0
  const totalWords = session.segments.reduce((acc, s) => {
    const t = options.useRawText ? (s.rawText || s.displayText || s.text) : (s.displayText || s.text)
    return acc + (t && t.trim() ? t.trim().split(/\s+/).length : 0)
  }, 0)

  const previewBaseName = formatFilename(session.title, session.date)

  const handleExport = async (format: ExportFormat) => {
    if (!hasSegments || loading !== null) return
    setLoading(format)
    try {
      if (format === 'txt') {
        exportTxt(session, options)
      } else if (format === 'docx') {
        await exportDocx(session, options)
      } else if (format === 'pdf') {
        exportPdf(session, options)
      }
      onExportSuccess?.()
    } catch {
      alert(`Gagal mengekspor berkas ${format.toUpperCase()}. Silakan coba lagi.`)
    } finally {
      setTimeout(() => setLoading(null), 500)
    }
  }

  return (
    <section
      className="glass-card rounded-2xl p-5 sm:p-6 animate-fade-in space-y-4 shadow-xs"
      aria-label="Panel unduh berkas transkripsi"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            Unduh Dokumen Transkripsi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {hasSegments
              ? `Tersedia ${session.segments.length} segmen (${totalWords.toLocaleString('id-ID')} kata). Bebas tanpa watermark.`
              : 'Mulai merekam atau muat data sampel untuk mengunduh dokumen.'}
          </p>
        </div>

        {/* Load sample data button for quick verification */}
        {onLoadSampleData && (
          <button
            type="button"
            id="btn-load-sample"
            onClick={onLoadSampleData}
            title="Muat transkrip dummy panjang psikologi (2.000+ kata, 3 pembicara) untuk uji coba unduhan"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700
                       dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100
                       dark:hover:bg-primary-900/60 border border-primary-200/80 dark:border-primary-800
                       rounded-xl transition-colors shadow-2xs active:scale-95 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Muat Data Uji (2.000+ Kata)</span>
          </button>
        )}
      </div>

      {/* Opsi sebelum unduh */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300">Opsi Ekspor:</span>

        {/* Toggle Timestamp */}
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="checkbox-opt-timestamp"
            checked={options.includeTimestamp}
            onChange={e =>
              setOptions(prev => ({ ...prev, includeTimestamp: e.target.checked }))
            }
            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900 transition"
          />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Sertakan Waktu ([mm:ss])
          </span>
        </label>

        {/* Toggle Speaker */}
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="checkbox-opt-speaker"
            checked={options.includeSpeaker}
            onChange={e =>
              setOptions(prev => ({ ...prev, includeSpeaker: e.target.checked }))
            }
            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900 transition"
          />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            Sertakan Nama Pembicara
          </span>
        </label>

        {/* Toggle Raw Text */}
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="checkbox-opt-rawtext"
            checked={options.useRawText}
            onChange={e =>
              setOptions(prev => ({ ...prev, useRawText: e.target.checked }))
            }
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900 transition"
          />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-medium">
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            Ekspor teks asli (tanpa logat)
          </span>
        </label>

        {/* Filename preview */}
        <div className="w-full sm:w-auto sm:ml-auto text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
          <FileCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Nama berkas: </span>
          <code className="text-slate-700 dark:text-slate-200 font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {previewBaseName}.[ext]
          </code>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* TXT */}
        <button
          id="btn-export-txt"
          type="button"
          onClick={() => handleExport('txt')}
          disabled={!hasSegments || loading !== null}
          aria-label="Unduh sebagai file teks TXT"
          className="flex items-center justify-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700
                     hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50
                     dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold shadow-xs
                     transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-98"
        >
          {loading === 'txt' ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform" />
          )}
          <div className="text-left leading-tight">
            <div className="text-sm font-bold">Unduh TXT</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Teks Biasa (UTF-8)</div>
          </div>
        </button>

        {/* DOCX */}
        <button
          id="btn-export-docx"
          type="button"
          onClick={() => handleExport('docx')}
          disabled={!hasSegments || loading !== null}
          aria-label="Unduh sebagai dokumen Word DOCX"
          className="flex items-center justify-center gap-3 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60
                     hover:border-blue-300 dark:hover:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50
                     dark:hover:bg-blue-950/50 text-blue-900 dark:text-blue-300 font-bold shadow-xs
                     transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-98"
        >
          {loading === 'docx' ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          ) : (
            <FileType className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          )}
          <div className="text-left leading-tight">
            <div className="text-sm font-bold">Unduh Word (DOCX)</div>
            <div className="text-[11px] text-blue-700/80 dark:text-blue-400 font-normal">Spasi 1.5, Calibri 12pt</div>
          </div>
        </button>

        {/* PDF */}
        <button
          id="btn-export-pdf"
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={!hasSegments || loading !== null}
          aria-label="Unduh sebagai dokumen PDF"
          className="flex items-center justify-center gap-3 p-3.5 rounded-xl border border-red-200 dark:border-red-900/60
                     hover:border-red-300 dark:hover:border-red-800 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-50
                     dark:hover:bg-red-950/50 text-red-900 dark:text-red-300 font-bold shadow-xs
                     transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-98"
        >
          {loading === 'pdf' ? (
            <Loader2 className="w-5 h-5 animate-spin text-red-600 dark:text-red-400" />
          ) : (
            <Download className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
          )}
          <div className="text-left leading-tight">
            <div className="text-sm font-bold">Unduh PDF</div>
            <div className="text-[11px] text-red-700/80 dark:text-red-400 font-normal">A4, Halaman Otomatis</div>
          </div>
        </button>
      </div>
    </section>
  )
}
