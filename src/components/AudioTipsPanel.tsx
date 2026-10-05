/**
 * AudioTipsPanel.tsx
 * Panel panduan rekaman optimal untuk diskusi mahasiswa psikologi:
 * - Tampil ciut secara default, terbuka otomatis hanya pada kunjungan pertama
 * - Pilihan ciut/buka tersimpan di localStorage
 */

import { useState } from 'react'
import { Sparkles, Mic, Headphones, Users2, MessageSquareX, ChevronDown, ChevronUp } from 'lucide-react'

const TIPS_VISITED_KEY = 'teksraks-tips-visited'
const TIPS_COLLAPSED_KEY = 'teksraks-tips-collapsed'

export default function AudioTipsPanel() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const visited = localStorage.getItem(TIPS_VISITED_KEY)
      if (!visited) {
        // Kunjungan pertama: Buka otomatis lalu simpan flag sudah berkunjung
        localStorage.setItem(TIPS_VISITED_KEY, 'true')
        return false
      }
      const saved = localStorage.getItem(TIPS_COLLAPSED_KEY)
      return saved !== null ? saved === 'true' : true // Ciut secara default
    } catch {
      return true
    }
  })

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem(TIPS_COLLAPSED_KEY, String(next))
      } catch { /* ignore */ }
      return next
    })
  }

  const tips = [
    {
      icon: <Mic className="w-4 h-4 text-blue-500" />,
      title: 'Bicara Jelas & Tenang',
      desc: 'Artikulasikan kata dengan wajar agar fonem suara dan logat dikenali akurat.',
    },
    {
      icon: <MessageSquareX className="w-4 h-4 text-rose-500" />,
      title: 'Bicara Bergantian',
      desc: 'Hindari berbicara bersamaan (crosstalk) yang dapat mengaburkan segmen transkrip.',
    },
    {
      icon: <Headphones className="w-4 h-4 text-emerald-500" />,
      title: 'Gunakan Headset / Mic',
      desc: 'Headset berkabel atau mic terpisah meminimalkan pantulan dan desau ruangan.',
    },
    {
      icon: <Users2 className="w-4 h-4 text-violet-500" />,
      title: 'Ruangan Minim Gema',
      desc: 'Pilih ruang tenang dan jauhkan mic dari desau kipas atau pendingin udara.',
    },
  ]

  return (
    <section
      className="glass-card rounded-2xl overflow-hidden animate-fade-in shadow-xs border border-slate-200/80 dark:border-slate-800"
      aria-label="Tips Perekaman Optimal"
    >
      {/* Header bar / Toggle */}
      <button
        type="button"
        id="btn-toggle-audio-tips"
        onClick={toggleCollapsed}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors text-left"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Tips Perekaman Audio
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{collapsed ? 'Buka Tips' : 'Ciutkan'}</span>
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Grid Tips (bila dibuka) */}
      {!collapsed && (
        <div className="px-4 sm:px-5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-50/30 dark:bg-slate-900/30 animate-fade-in">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-150 dark:border-slate-700/60 flex flex-col gap-1 shadow-2xs"
            >
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex-shrink-0">
                  {tip.icon}
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {tip.title}
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
