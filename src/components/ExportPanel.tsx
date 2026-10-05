/**
 * ExportPanel.tsx
 * Panel ekspor berkas transkrip dalam 3 format (TXT, DOCX, PDF):
 * - Opsi waktu [mm:ss], nama pembicara, dan ekspor teks baku
 * - Tooltip penjelasan saat tombol nonaktif: "Rekam atau muat data uji dulu"
 * - Hierarki visual bersih tanpa tombol pemuat data uji yang mengganggu pengguna akhir
 */

import { useState } from 'react'
import {
  FileText,
  FileType,
  Download,
  Loader2,
  Clock,
  UserCheck,
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
  onExportSuccess?: () => void
}

type ExportFormat = 'txt' | 'docx' | 'pdf'

export default function ExportPanel({
  session,
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
  const disabledTooltip = !hasSegments ? 'Rekam atau muat data uji dulu' : undefined

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
      className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-in space-y-3.5 shadow-xs border border-slate-200/80 dark:border-slate-800"
      aria-label="Panel unduh berkas transkrip"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span>Unduh Berkas Transkrip</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {hasSegments
              ? `Tersedia ${session.segments.length} segmen (${totalWords.toLocaleString('id-ID')} kata). Bebas tanpa watermark.`
              : 'Rekam atau muat data uji dulu untuk mengunduh dokumen.'}
          </p>
        </div>
      </div>

      {/* Opsi sebelum unduh */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-5 bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-200">Opsi Ekspor:</span>

        {/* Toggle Timestamp */}
        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
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
            Waktu ([mm:ss])
          </span>
        </label>

        {/* Toggle Speaker */}
        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
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
            Nama Pembicara
          </span>
        </label>

        {/* Toggle Raw Text */}
        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
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
            Teks Baku Asli
          </span>
        </label>

        {/* Filename preview */}
        <div className="w-full sm:w-auto sm:ml-auto text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 pt-1 sm:pt-0">
          <FileCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Berkas: </span>
          <code className="text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {previewBaseName}.[ext]
          </code>
        </div>
      </div>

      {/* Buttons: Hierarki jelas (Word DOCX sebagai primer terfokus, TXT & PDF sekunder) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* DOCX - Primary Card */}
        <button
          id="btn-export-docx"
          type="button"
          onClick={() => handleExport('docx')}
          disabled={!hasSegments || loading !== null}
          title={disabledTooltip}
          aria-label="Unduh sebagai dokumen Word DOCX"
          className="flex items-center justify-center gap-3 p-3.5 rounded-xl border border-slate-800 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs hover:bg-black dark:hover:bg-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
        >
          {loading === 'docx' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileType className="w-5 h-5" />
          )}
          <div className="text-left leading-tight">
            <div className="text-xs sm:text-sm font-bold">Unduh Dokumen Word</div>
            <div className="text-[11px] opacity-80 font-normal">DOCX (Format Rapi)</div>
          </div>
        </button>

        {/* TXT - Secondary Card */}
        <button
          id="btn-export-txt"
          type="button"
          onClick={() => handleExport('txt')}
          disabled={!hasSegments || loading !== null}
          title={disabledTooltip}
          aria-label="Unduh sebagai file teks TXT"
          className="flex items-center justify-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
        >
          {loading === 'txt' ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          )}
          <div className="text-left leading-tight">
            <div className="text-xs sm:text-sm font-bold">Unduh Teks Biasa</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">TXT (UTF-8)</div>
          </div>
        </button>

        {/* PDF - Secondary Card */}
        <button
          id="btn-export-pdf"
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={!hasSegments || loading !== null}
          title={disabledTooltip}
          aria-label="Unduh sebagai dokumen PDF"
          className="flex items-center justify-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
        >
          {loading === 'pdf' ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            <Download className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          )}
          <div className="text-left leading-tight">
            <div className="text-xs sm:text-sm font-bold">Unduh PDF</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">PDF A4 (Cetak)</div>
          </div>
        </button>
      </div>
    </section>
  )
}
