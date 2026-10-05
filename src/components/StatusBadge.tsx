import type { RecordingStatus } from '../types/speech.d'

interface StatusBadgeProps {
  status: RecordingStatus
  audioLevel?: number
}

const statusConfig: Record<
  RecordingStatus,
  { label: string; dotColor: string; bgColor: string; textColor: string; borderColor: string }
> = {
  idle: {
    label: 'Siap',
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
  },
  recording: {
    label: 'Merekam',
    dotColor: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  paused: {
    label: 'Dijeda',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  stopping: {
    label: 'Menghentikan…',
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-500',
    borderColor: 'border-slate-200',
  },
}

export default function StatusBadge({ status, audioLevel = 0 }: StatusBadgeProps) {
  const cfg = statusConfig[status]
  const isRecording = status === 'recording'

  // Skala tinggi wave bar berdasarkan audioLevel (8px–28px)
  const barHeight = (i: number): string => {
    const base = 8
    const range = 20
    // Tiap bar punya sedikit variasi dari audioLevel
    const jitter = ((i * 37) % 30) - 15
    const h = Math.max(base, Math.min(base + range, base + (audioLevel / 100) * range + jitter))
    return `${Math.round(h)}px`
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                  border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} transition-colors duration-300`}
      role="status"
      aria-live="polite"
      aria-label={`Status: ${cfg.label}`}
    >
      {/* Dot / ping */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        {isRecording && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dotColor}`} />
      </span>

      {/* Wave bars when recording */}
      {isRecording && (
        <span className="flex items-end gap-px" aria-hidden="true" style={{ height: '20px' }}>
          {[0, 1, 2, 3, 4].map(i => (
            <span
              key={i}
              className="wave-bar"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: barHeight(i),
              }}
            />
          ))}
        </span>
      )}

      {/* Pause icon */}
      {status === 'paused' && (
        <span aria-hidden="true" className="flex gap-0.5">
          <span className="w-1 h-3 rounded-sm bg-amber-500 opacity-80" />
          <span className="w-1 h-3 rounded-sm bg-amber-500 opacity-80" />
        </span>
      )}

      <span>{cfg.label}</span>
    </div>
  )
}
