/**
 * PrivacyBanner.tsx
 * Komponen privasi etika data psikologi:
 * - Sebelum disetujui: Menampilkan kartu penjelasan privasi lengkap & checkbox persetujuan wajib
 * - Setelah disetujui: Ciut otomatis menjadi satu baris kecil "Persetujuan privasi aktif ✓" yang bisa dibuka kembali
 * - Tombol berbahaya "Hapus semua data" dipindahkan ke menu Pengaturan
 */

import { useState } from 'react'
import { ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

interface PrivacyBannerProps {
  agreed: boolean
  onToggleAgree: (agreed: boolean) => void
}

export default function PrivacyBanner({
  agreed,
  onToggleAgree,
}: PrivacyBannerProps) {
  const [expanded, setExpanded] = useState(false)

  // Jika sudah disetujui dan tidak sedang dibuka manual: Tampilkan bar ringkas 1 baris
  if (agreed && !expanded) {
    return (
      <aside
        aria-label="Status Persetujuan Privasi"
        className="flex items-center justify-between px-4 py-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs animate-fade-in"
      >
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="font-semibold text-emerald-900 dark:text-emerald-200 truncate">
            Persetujuan privasi aktif
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs hidden sm:inline">
            · Audio diproses peramban & transkrip disimpan lokal di perangkat Anda
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 font-medium flex items-center gap-1 flex-shrink-0 ml-2"
        >
          <span>Detail</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </aside>
    )
  }

  // Tampilan penuh (saat belum disetujui atau saat user membuka detail)
  return (
    <aside
      className="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-amber-500 animate-fade-in shadow-xs"
      aria-label="Pemberitahuan Privasi dan Etika Psikologi"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4" />
        </div>

        <div className="space-y-2.5 flex-1 min-w-0 text-xs">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wide">
              Pemberitahuan Privasi & Etika Data Psikologi
            </h3>
            {agreed && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
              >
                <span>Ciutkan</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
            <strong>Transkrip disimpan hanya di memori perangkat Anda.</strong> Pengenalan suara browser
            (Web Speech API) memproses audio melalui layanan cloud peramban. Jangan gunakan untuk data
            klien atau rekaman pasien yang identitasnya sangat rahasia tanpa persetujuan etik tertulis.
          </p>

          <div className="pt-1">
            <label
              htmlFor="checkbox-privacy-agree"
              className="inline-flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200 font-semibold select-none text-xs sm:text-sm"
            >
              <input
                id="checkbox-privacy-agree"
                type="checkbox"
                checked={agreed}
                onChange={e => {
                  onToggleAgree(e.target.checked)
                  if (e.target.checked) setExpanded(false)
                }}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 transition cursor-pointer"
              />
              <span>
                Saya memahami dan menyetujui ketentuan privasi ini sebelum merekam suara.
              </span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  )
}
