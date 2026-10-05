/**
 * PrivacyBanner.tsx
 * Komponen privasi khusus untuk diskusi psikologi:
 * - Menampilkan catatan privasi wajib
 * - Checkbox persetujuan sebelum perekaman
 * - Tombol "Hapus semua data saya" dengan konfirmasi dialog
 */
import { useState } from 'react'
import { ShieldAlert, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react'

interface PrivacyBannerProps {
  agreed: boolean
  onToggleAgree: (agreed: boolean) => void
  onClearAllData: () => void
}

export default function PrivacyBanner({
  agreed,
  onToggleAgree,
  onClearAllData,
}: PrivacyBannerProps) {
  const [showConfirmWipe, setShowConfirmWipe] = useState(false)

  const handleConfirmWipe = () => {
    onClearAllData()
    setShowConfirmWipe(false)
  }

  return (
    <section
      className="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-amber-500 animate-fade-in shadow-xs"
      aria-label="Pemberitahuan Privasi dan Etika Psikologi"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        {/* Konten Privasi */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide text-[11px]">
                Pemberitahuan Privasi & Etika Data Psikologi
              </span>
              {agreed ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Persetujuan Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Wajib Disetujui
                </span>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Transkrip disimpan hanya di perangkat Anda.</strong> Namun pengenalan suara browser
              Chrome memproses audio lewat layanan Google. Jangan gunakan untuk data klien/pasien yang
              identitasnya sensitif tanpa persetujuan.
            </p>

            {/* Checkbox Persetujuan */}
            <div className="pt-1">
              <label
                htmlFor="checkbox-privacy-agree"
                className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200 font-medium select-none"
              >
                <input
                  id="checkbox-privacy-agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => onToggleAgree(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 transition"
                />
                <span>
                  Saya memahami dan menyetujui ketentuan privasi ini sebelum merekam suara.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Tombol Hapus Semua Data Saya */}
        <div className="flex-shrink-0 self-end sm:self-start pt-1 sm:pt-0">
          <button
            type="button"
            id="btn-wipe-all-data"
            onClick={() => setShowConfirmWipe(true)}
            title="Hapus semua transkrip, rekaman sesi, dan preferensi yang tersimpan di browser ini"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400
                       hover:text-white hover:bg-red-600 dark:hover:bg-red-600 border border-red-200 dark:border-red-900/60
                       rounded-xl transition-colors shadow-2xs active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus semua data saya</span>
          </button>
        </div>
      </div>

      {/* Modal Dialog Konfirmasi Hapus Semua Data */}
      {showConfirmWipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="wipe-dialog-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowConfirmWipe(false)}
                aria-label="Tutup dialog"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 id="wipe-dialog-title" className="text-base font-bold text-slate-800 dark:text-slate-100">
                Hapus Seluruh Data Aplikasi?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Tindakan ini akan <strong>menghapus permanen</strong> seluruh transkrip diskusi,
                daftar pembicara, catatan sesi, dan preferensi yang tersimpan di memori browser (localStorage) Anda.
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                id="btn-confirm-wipe-all"
                type="button"
                onClick={handleConfirmWipe}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700
                           text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Semua</span>
              </button>
              <button
                id="btn-cancel-wipe-all"
                type="button"
                onClick={() => setShowConfirmWipe(false)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800
                           hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs
                           font-semibold rounded-xl transition active:scale-95"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
