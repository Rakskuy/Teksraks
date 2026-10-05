/**
 * StatsPanel.tsx
 * Baris statistik sesi yang ringkas dan efisien (satu baris kecil):
 * - Total kata, durasi waktu, dan jumlah segmen
 * - Distribusi per pembicara dengan dot warna
 */

import { Clock, Type, Users } from 'lucide-react'
import type { SessionStats } from '../types/session'

interface StatsPanelProps {
  stats: SessionStats
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const hasData = stats.totalSegments > 0

  return (
    <section
      className="glass-card rounded-2xl px-4 py-2.5 animate-fade-in shadow-xs border border-slate-200/80 dark:border-slate-800"
      aria-label="Statistik Sesi Diskusi"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Metrik Utama dalam Satu Baris */}
        <div className="flex items-center gap-3.5 sm:gap-5 flex-wrap">
          {/* Total Kata */}
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <Type className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-white font-bold">
                {stats.totalWords.toLocaleString('id-ID')}
              </strong>{' '}
              kata
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">·</span>

          {/* Durasi */}
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-white font-bold">
                {stats.durationFormatted}
              </strong>
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">·</span>

          {/* Total Segmen */}
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <Users className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-white font-bold">
                {stats.totalSegments}
              </strong>{' '}
              segmen
            </span>
          </div>
        </div>

        {/* Kontribusi Per Pembicara (Ringkas) */}
        {hasData && (
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-slate-400 font-medium">Pembicara:</span>
            {stats.perSpeaker.map(({ speaker, wordCount }) => {
              const wordPct =
                stats.totalWords > 0
                  ? Math.round((wordCount / stats.totalWords) * 100)
                  : 0

              return (
                <div
                  key={speaker.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: speaker.color }}
                  />
                  <span className="font-medium max-w-[80px] truncate">{speaker.name}</span>
                  <span className="text-slate-400 font-mono">({wordPct}%)</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
