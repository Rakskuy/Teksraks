/**
 * GuideModal.tsx
 * Modal panduan singkat langkah penggunaan aplikasi Speech-to-Text Diskusi Psikologi.
 */
import { useEffect } from 'react'
import {
  HelpCircle,
  X,
  Keyboard,
  Mic,
  FileEdit,
  Download,
  CheckCircle,
  FileText,
} from 'lucide-react'

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
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

  const steps = [
    {
      num: '1',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      title: 'Atur Informasi Sesi',
      desc: 'Isi judul diskusi, tanggal, dan catatan kelompok. Header dapat dibuka/diciutkan.',
    },
    {
      num: '2',
      icon: <Keyboard className="w-4 h-4 text-violet-500" />,
      title: 'Pilih Pembicara (Shortcut 1–9)',
      desc: 'Tambah/ganti nama pembicara. Pilih siapa yang sedang berbicara dengan klik atau tekan angka 1-9 pada keyboard.',
    },
    {
      num: '3',
      icon: <Mic className="w-4 h-4 text-emerald-500" />,
      title: 'Mulai Rekam Suara / Unggah Audio',
      desc: 'Gunakan pengenalan suara browser real-time, atau pilih "Mesin Whisper" untuk mengunggah berkas rekaman audio (MP3/WAV) dengan Groq / OpenAI Whisper API.',
    },
    {
      num: '4',
      icon: <FileEdit className="w-4 h-4 text-amber-500" />,
      title: 'Koreksi & Edit Segmen',
      desc: 'Klik teks segmen mana saja untuk mengeditnya secara langsung. Gunakan fitur "Cari & Ganti" untuk membetulkan istilah psikologi.',
    },
    {
      num: '5',
      icon: <Download className="w-4 h-4 text-rose-500" />,
      title: 'Unduh Hasil Transkripsi',
      desc: 'Unduh dalam 3 format dokumen: TXT (UTF-8), Word (DOCX Calibri 12pt spasi 1.5), atau PDF (A4 auto-pagination).',
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 id="guide-title" className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Cara Pakai Singkat
              </h3>
              <p className="text-[11px] text-slate-400">
                Panduan 5 langkah mudah mentranskripsi diskusi psikologi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup panduan"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-3 py-1">
          {steps.map(step => (
            <div
              key={step.num}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100/80 dark:border-slate-700/60"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs mt-0.5">
                {step.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {step.icon}
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {step.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info & button */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            Tersimpan otomatis ke browser setiap 5 detik.
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold rounded-xl text-xs shadow-xs transition active:scale-95"
          >
            Mengerti & Mulai
          </button>
        </div>
      </div>
    </div>
  )
}
