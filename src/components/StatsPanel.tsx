/**
 * StatsPanel.tsx
 * Menampilkan statistik sesi diskusi mahasiswa psikologi:
 * - Jumlah kata total
 * - Durasi total
 * - Jumlah segmen total
 * - Breakdown per pembicara (segmen dan kata)
 * Dilengkapi dukungan Dark Mode dan kontras WCAG AA.
 */
import { BarChart3, Clock, Type, Users } from 'lucide-react'
import type { SessionStats } from '../types/session'

interface StatsPanelProps {
  stats: SessionStats
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const hasData = stats.totalSegments > 0

  return (
    <section
      className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-in shadow-xs"
      aria-label="Statistik Sesi Diskusi"
    >
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          Statistik Diskusi
        </h3>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {hasData ? `${stats.totalSegments} segmen tercatat` : 'Belum ada data'}
        </span>
      </div>

      {/* Grid Ringkasan Utama */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
        {/* Total Kata */}
        <div className="bg-slate-50/90 dark:bg-slate-800/60 rounded-xl p-2.5 sm:p-3 border border-slate-100/80 dark:border-slate-700/60 flex flex-col items-center sm:items-start shadow-2xs">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold flex items-center gap-1">
            <Type className="w-3 h-3 text-primary-500" />
            Total Kata
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {stats.totalWords.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Durasi Total */}
        <div className="bg-slate-50/90 dark:bg-slate-800/60 rounded-xl p-2.5 sm:p-3 border border-slate-100/80 dark:border-slate-700/60 flex flex-col items-center sm:items-start shadow-2xs">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-500" />
            Durasi
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">
            {stats.durationFormatted}
          </span>
        </div>

        {/* Total Segmen */}
        <div className="bg-slate-50/90 dark:bg-slate-800/60 rounded-xl p-2.5 sm:p-3 border border-slate-100/80 dark:border-slate-700/60 flex flex-col items-center sm:items-start shadow-2xs">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold flex items-center gap-1">
            <Users className="w-3 h-3 text-violet-500" />
            Segmen
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {stats.totalSegments}
          </span>
        </div>
      </div>

      {/* Kontribusi Per Pembicara */}
      {hasData && (
        <div className="pt-1">
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
            Kontribusi Pembicara:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {stats.perSpeaker.map(({ speaker, segmentCount, wordCount }) => {
              const wordPct =
                stats.totalWords > 0
                  ? Math.round((wordCount / stats.totalWords) * 100)
                  : 0

              return (
                <div
                  key={speaker.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-150 dark:border-slate-700/80 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: speaker.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {speaker.name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 text-slate-600 dark:text-slate-400 text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{wordCount}</span> kata{' '}
                    <span className="text-slate-400 dark:text-slate-500">({wordPct}%)</span>
                    <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
                    <span>{segmentCount} seg</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
