/**
 * MobileSettingsSheet.tsx
 * Bottom sheet menu untuk pengaturan sekunder di perangkat mobile:
 * - Bahasa transkripsi
 * - Mode Logat Bekasi & Intensitas
 * - Opsi tampilan stempel waktu & tema
 * - Tombol Kamus Pribadi & Cari/Ganti
 * - Zona Berbahaya: Hapus semua data (dijauhkan dari kontrol utama, wajib konfirmasi)
 * Semua target sentuh minimal 44x44px.
 */

import { useState, useEffect } from 'react'
import {
  X,
  Globe,
  Sparkles,
  BookOpen,
  Clock,
  Moon,
  Sun,
  AlertTriangle,
  Trash2,
  HelpCircle,
  FileAudio,
} from 'lucide-react'
import type { SupportedLang } from '../types/speech.d'
import type { DialectMode, DialectIntensity } from '../dialect'
import { triggerHaptic } from '../utils/haptics'

interface MobileSettingsSheetProps {
  isOpen: boolean
  onClose: () => void
  lang: SupportedLang
  onLangChange: (lang: SupportedLang) => void
  dialectMode: DialectMode
  dialectIntensity: DialectIntensity
  onDialectModeChange: (mode: DialectMode) => void
  onDialectIntensityChange: (intensity: DialectIntensity) => void
  showTimestamps: boolean
  onToggleTimestamps: () => void
  isDark: boolean
  onToggleDark: () => void
  onOpenDictionary: () => void
  onOpenWhisper: () => void
  onOpenGuide: () => void
  onClearAllData: () => void
}

const LANGUAGES: { value: SupportedLang; label: string; flag: string }[] = [
  { value: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
]

export default function MobileSettingsSheet({
  isOpen,
  onClose,
  lang,
  onLangChange,
  dialectMode,
  dialectIntensity,
  onDialectModeChange,
  onDialectIntensityChange,
  showTimestamps,
  onToggleTimestamps,
  isDark,
  onToggleDark,
  onOpenDictionary,
  onOpenWhisper,
  onOpenGuide,
  onClearAllData,
}: MobileSettingsSheetProps) {
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-settings-title"
    >
      {/* Backdrop tap to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg max-h-[85dvh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-hidden pb-[env(safe-area-inset-bottom,16px)] animate-slide-up">
        {/* Drag Handle Bar */}
        <div className="flex items-center justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 id="mobile-settings-title" className="text-base font-bold text-slate-900 dark:text-white">
            Pengaturan & Alat
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. Bahasa Transkripsi */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Bahasa Pengenalan Suara</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {LANGUAGES.map(item => {
                const isSelected = lang === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap')
                      onLangChange(item.value)
                    }}
                    className={`min-h-[48px] px-4 rounded-xl flex items-center justify-between text-sm font-medium border transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{item.flag}</span>
                      <span>{item.label}</span>
                    </span>
                    {isSelected && <span className="text-xs font-bold">Aktif</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Mode Logat Bekasi */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Mode Logat Daerah</span>
            </label>

            {/* Segmented Mode: Standar vs Bekasi */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap')
                  onDialectModeChange('standard')
                }}
                className={`min-h-[44px] rounded-lg text-xs font-bold transition-all ${
                  dialectMode === 'standard'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Standar Baku
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap')
                  onDialectModeChange('bekasi')
                }}
                className={`min-h-[44px] rounded-lg text-xs font-bold transition-all ${
                  dialectMode === 'bekasi'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Logat Bekasi
              </button>
            </div>

            {/* Tingkat Intensitas jika Bekasi aktif */}
            {dialectMode === 'bekasi' && (
              <div className="space-y-1.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 animate-fade-in">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 block">
                  Tingkat Intensitas Logat:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'medium', 'full'] as const).map(lvl => {
                    const labelMap = { light: 'Ringan', medium: 'Sedang', full: 'Penuh' }
                    const isSelected = dialectIntensity === lvl
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          triggerHaptic('tap')
                          onDialectIntensityChange(lvl)
                        }}
                        className={`min-h-[44px] rounded-lg text-xs font-bold border transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {labelMap[lvl]}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Tampilan & Pengaturan Sesi */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tampilan Transkrip
            </label>
            <div className="grid grid-cols-1 gap-2">
              {/* Toggle Timestamp */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap')
                  onToggleTimestamps()
                }}
                className="min-h-[48px] px-4 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Tampilkan Penanda Waktu (Timestamp)</span>
                </span>
                <span
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    showTimestamps ? 'bg-slate-900 dark:bg-white justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full transition-transform ${
                      showTimestamps ? 'bg-white dark:bg-slate-900' : 'bg-white'
                    }`}
                  />
                </span>
              </button>

              {/* Toggle Dark Mode */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap')
                  onToggleDark()
                }}
                className="min-h-[48px] px-4 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                  <span>Mode Tampilan: {isDark ? 'Gelap (Dark)' : 'Terang (Light)'}</span>
                </span>
                <span className="text-xs text-slate-400">Ganti</span>
              </button>
            </div>
          </div>

          {/* 4. Menu Alat Tambahan */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alat & Panduan
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenDictionary()
                }}
                className="min-h-[48px] px-4 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  <span>Kamus Pribadi & Pengecualian</span>
                </span>
                <span className="text-xs text-slate-400">Kelola →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenWhisper()
                }}
                className="min-h-[48px] px-4 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750"
              >
                <span className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>Mesin Whisper (Unggah Berkas Audio)</span>
                </span>
                <span className="text-xs text-slate-400">Buka →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenGuide()
                }}
                className="min-h-[48px] px-4 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Panduan Cara Pakai Teksraks</span>
                </span>
                <span className="text-xs text-slate-400">Buka →</span>
              </button>
            </div>
          </div>

          {/* 5. Zona Berbahaya (Hapus Semua Data) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <label className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Zona Berbahaya</span>
            </label>

            {!showConfirmClear ? (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="w-full min-h-[48px] px-4 rounded-xl flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-sm font-bold hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Semua Data Sesi Saya</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-100/90 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 space-y-3 animate-fade-in">
                <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 text-center leading-relaxed">
                  Apakah Anda yakin? Seluruh transkrip, catatan, dan nama pembicara akan dihapus permanen dari perangkat ini.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmClear(false)}
                    className="min-h-[44px] rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('stop')
                      onClearAllData()
                      setShowConfirmClear(false)
                      onClose()
                    }}
                    className="min-h-[44px] rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
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
