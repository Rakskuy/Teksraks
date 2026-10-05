/**
 * AudioTipsPanel.tsx
 * Panel panduan rekaman optimal untuk diskusi mahasiswa psikologi:
 * - Posisi mic
 * - Ruangan tenang
 * - Bicara bergantian
 * - Jangan berbicara bersamaan
 */
import { useState } from 'react'
import { Sparkles, Mic, Headphones, Users2, MessageSquareX, ChevronDown, ChevronUp } from 'lucide-react'

export default function AudioTipsPanel() {
  const [collapsed, setCollapsed] = useState(false)

  const tips = [
    {
      icon: <Mic className="w-4 h-4 text-blue-500" />,
      title: 'Bicara Jelas & Tidak Terlalu Cepat',
      desc: 'Artikulasikan kata dengan wajar dan tidak terburu-buru agar fonem suara dan logat dikenali optimal.',
    },
    {
      icon: <MessageSquareX className="w-4 h-4 text-rose-500" />,
      title: 'Hindari Tumpang Tindih Suara',
      desc: 'Bicaralah bergantian satu per satu. Hindari berbicara bersamaan (crosstalk) yang mengaburkan transkrip.',
    },
    {
      icon: <Headphones className="w-4 h-4 text-emerald-500" />,
      title: 'Gunakan Headset / Mic Terpisah',
      desc: 'Gunakan headset berkabel atau mic clip-on dekat mulut untuk meminimalkan gema dan desau ruangan.',
    },
    {
      icon: <Users2 className="w-4 h-4 text-violet-500" />,
      title: 'Pilih Ruangan Tenang',
      desc: 'Pilih ruang minim pantulan suara. Jauhkan mic dari desau kipas angin, pendingin udara, atau jalan raya.',
    },
  ]

  return (
    <section
      className="glass-card rounded-2xl overflow-hidden animate-fade-in shadow-xs"
      aria-label="Tips Perekaman Optimal"
    >
      {/* Header bar / Toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(prev => !prev)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors text-left"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Tips Perekaman & Diskusi Berkualitas
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{collapsed ? 'Tampilkan' : 'Ciutkan'}</span>
          {collapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Grid Tips */}
      {!collapsed && (
        <div className="px-4 sm:px-5 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white/50 dark:bg-slate-900/40">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex flex-col gap-1.5 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  {tip.icon}
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {tip.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
