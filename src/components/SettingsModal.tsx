/**
 * SettingsModal.tsx
 * Dialog Pengaturan & Alat Terpadu (Desktop & Tablet):
 * - Kamus Pribadi & Leksikon
 * - Konfigurasi Mesin Whisper (API Key OpenAI/Groq)
 * - Panduan Cara Pakai Aplikasi
 * - Mode Pengembang: Muat Data Uji (2.000+ kata untuk pengujian ekspor)
 * - Zona Berbahaya: Hapus Semua Data Saya (dengan konfirmasi wajib)
 */

import { useState, useEffect } from 'react'
import {
  X,
  Settings,
  BookOpen,
  FileAudio,
  HelpCircle,
  Code2,
  Trash2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenDictionary: () => void
  onOpenWhisper: () => void
  onOpenGuide: () => void
  onLoadSampleData?: () => void
  onClearAllData: () => void
}

export default function SettingsModal({
  isOpen,
  onClose,
  onOpenDictionary,
  onOpenWhisper,
  onOpenGuide,
  onLoadSampleData,
  onClearAllData,
}: SettingsModalProps) {
  const [showConfirmWipe, setShowConfirmWipe] = useState(false)
  const [sampleLoadedFeedback, setSampleLoadedFeedback] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleLoadSample = () => {
    onLoadSampleData?.()
    setSampleLoadedFeedback(true)
    setTimeout(() => {
      setSampleLoadedFeedback(false)
      onClose()
    }, 1200)
  }

  const handleConfirmWipe = () => {
    onClearAllData()
    setShowConfirmWipe(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Pengaturan & Preferensi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola kamus pribadi, mesin AI, dan alat pengembang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. Kamus Pribadi */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                <span>Kamus Pribadi & Pengecualian</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur kata logat kustom dan proteksi istilah psikologi tertentu.
              </p>
            </div>
            <button
              type="button"
              id="btn-settings-open-dict"
              onClick={() => {
                onClose()
                onOpenDictionary()
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors flex-shrink-0"
            >
              Kelola →
            </button>
          </div>

          {/* 2. Konfigurasi Whisper */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                <FileAudio className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>Mesin Transkripsi Whisper AI</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konfigurasi API key OpenAI / Groq dan unggah berkas rekaman audio.
              </p>
            </div>
            <button
              type="button"
              id="btn-settings-open-whisper"
              onClick={() => {
                onClose()
                onOpenWhisper()
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors flex-shrink-0"
            >
              Atur →
            </button>
          </div>

          {/* 3. Panduan Cara Pakai */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Panduan Cara Pakai Teksraks</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pelajari pintasan keyboard, manajemen pembicara, dan tips audio.
              </p>
            </div>
            <button
              type="button"
              id="btn-settings-open-guide"
              onClick={() => {
                onClose()
                onOpenGuide()
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors flex-shrink-0"
            >
              Buka →
            </button>
          </div>

          {/* 4. Mode Pengembang (Data Uji untuk QA & Simulasi) */}
          {onLoadSampleData && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                  <Code2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mode Pengembang & Pengujian</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  QA Test
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Muat transkrip simulasi diskusi psikologi 2.000+ kata (3 pembicara) untuk uji coba fitur ekspor.
              </p>
              <button
                type="button"
                id="btn-settings-load-sample"
                onClick={handleLoadSample}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {sampleLoadedFeedback ? '✓ Data Uji Berhasil Dimuat' : 'Muat Data Uji (2.000+ Kata)'}
                </span>
              </button>
            </div>
          )}

          {/* 5. Zona Berbahaya (Hapus Semua Data) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Zona Berbahaya</span>
            </span>

            {!showConfirmWipe ? (
              <button
                type="button"
                id="btn-settings-wipe-data"
                onClick={() => setShowConfirmWipe(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua Data Sesi Saya</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-100/90 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 space-y-3 animate-fade-in text-xs">
                <p className="font-semibold text-rose-900 dark:text-rose-200 text-center leading-relaxed">
                  Apakah Anda yakin? Seluruh transkrip, rekaman sesi, dan preferensi akan dihapus permanen dari perangkat ini.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmWipe(false)}
                    className="py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmWipe}
                    className="py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
                  >
                    Ya, Hapus Semua
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
