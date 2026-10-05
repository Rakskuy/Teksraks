/**
 * SegmentItem.tsx
 * Satu segmen transkripsi dialog:
 * - Inline click-to-edit dengan auto-resize textarea
 * - Dropdown ganti pembicara dengan label warna
 * - Gabung dengan segmen sebelumnya & hapus segmen
 * - Dukungan penuh Dark Mode dan kontras WCAG AA
 */
import { useState, useRef, useEffect } from 'react'
import { Trash2, Merge, ChevronDown, RotateCcw, Sparkles } from 'lucide-react'
import type { Segment, Speaker } from '../types/session'
import type { DialectChange } from '../dialect'
import WordDialectPopover from './WordDialectPopover'

interface SegmentItemProps {
  segment: Segment
  speaker: Speaker | undefined
  speakers: Speaker[]
  showTimestamp: boolean
  isFirst: boolean
  onEdit: (id: string, text: string) => void
  onDelete: (id: string) => void
  onMerge: (id: string) => void
  onChangeSpeaker: (id: string, speakerId: string) => void
  onRevertWord?: (id: string, original: string, replacement: string) => void
  onRevertToRaw?: (id: string) => void
}

export default function SegmentItem({
  segment,
  speaker,
  speakers,
  showTimestamp,
  isFirst,
  onEdit,
  onDelete,
  onMerge,
  onChangeSpeaker,
  onRevertWord,
  onRevertToRaw,
}: SegmentItemProps) {
  const [isEditing, setIsEditing]       = useState(false)
  const currentDisplayText = segment.displayText || segment.text || ''
  const [editText, setEditText]         = useState(currentDisplayText)
  const [showSpeakerMenu, setShowSpeakerMenu] = useState(false)
  const [activeChange, setActiveChange] = useState<DialectChange | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const menuRef     = useRef<HTMLDivElement>(null)

  // Sync editText saat segment.displayText berubah dari luar (mis. find-replace atau dialek)
  useEffect(() => {
    if (!isEditing) setEditText(segment.displayText || segment.text || '')
  }, [segment.displayText, segment.text, isEditing])

  // Fokus textarea saat masuk edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const ta = textareaRef.current
      ta.focus()
      ta.setSelectionRange(ta.value.length, ta.value.length)
    }
  }, [isEditing])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [editText, isEditing])

  // Tutup speaker menu saat klik di luar
  useEffect(() => {
    if (!showSpeakerMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSpeakerMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSpeakerMenu])

  const commitEdit = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== segment.text) onEdit(segment.id, trimmed)
    else setEditText(segment.text)
    setIsEditing(false)
  }

  const speakerColor = speaker?.color ?? '#94A3B8'

  return (
    <div
      className="group relative flex gap-3 px-4 sm:px-5 py-3.5
                 border-b border-slate-100 dark:border-slate-800 last:border-b-0
                 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-150"
    >
      {/* ── Left: speaker color bar ── */}
      <div
        className="flex-shrink-0 w-1 rounded-full self-stretch opacity-80"
        style={{ backgroundColor: speakerColor }}
      />

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        {/* Speaker label + timestamp + speaker picker */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {/* Speaker name button → opens picker */}
          <div className="relative" ref={menuRef}>
            <button
              id={`btn-segment-speaker-${segment.id}`}
              type="button"
              onClick={() => setShowSpeakerMenu(v => !v)}
              aria-label={`Ganti pembicara segmen ini (saat ini ${speaker?.name ?? 'Tidak Diketahui'})`}
              className="flex items-center gap-1 text-xs font-bold rounded-md px-1.5 py-0.5
                         hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: speakerColor }}
            >
              <span>{speaker?.name ?? 'Tidak Diketahui'}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
            </button>

            {/* Dropdown speaker picker */}
            {showSpeakerMenu && (
              <div
                className="absolute z-20 top-full left-0 mt-1 min-w-[150px] bg-white dark:bg-slate-800
                           border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 animate-fade-in"
              >
                {speakers.map((sp, i) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => { onChangeSpeaker(segment.id, sp.id); setShowSpeakerMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-50
                               dark:hover:bg-slate-700/60 text-left transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sp.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{sp.name}</span>
                    {i < 9 && (
                      <span className="ml-auto text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-1 rounded">
                        {i + 1}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timestamp & Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {showTimestamp && (
              <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                {segment.startTime || segment.timestamp}
              </span>
            )}
            {segment.edited && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 italic bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200/40 dark:border-slate-700/40">
                diedit manual
              </span>
            )}
            {segment.dialectChanges && segment.dialectChanges.length > 0 && (
              <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/60 font-medium flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                {segment.dialectChanges.length} logat
              </span>
            )}
          </div>
        </div>

        {/* ── Text: edit mode atau display mode ── */}
        {isEditing ? (
          <textarea
            ref={textareaRef}
            id={`segment-edit-${segment.id}`}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Escape') { setEditText(segment.displayText || segment.text); setIsEditing(false) }
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commitEdit()
            }}
            className="w-full text-sm text-slate-800 dark:text-slate-100 leading-relaxed bg-primary-50/70
                       dark:bg-slate-800 border border-primary-300 dark:border-primary-600 rounded-lg px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none overflow-hidden"
            rows={1}
            aria-label="Edit teks segmen"
          />
        ) : (
          <div
            className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed cursor-text break-words select-text"
            onClick={() => setIsEditing(true)}
            title="Klik area teks untuk mengedit langsung"
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter') setIsEditing(true)
            }}
          >
            {/* Tampilkan kata dengan highlight jika ada perubahan dialek */}
            {segment.dialectChanges && segment.dialectChanges.length > 0 ? (
              (() => {
                const textToRender = segment.displayText || segment.text || ''
                const changeMap = new Map<string, DialectChange>()
                for (const ch of segment.dialectChanges) {
                  changeMap.set(ch.replacement.toLowerCase(), ch)
                }

                const tokens = textToRender.split(/(\b[a-zA-Z\u00C0-\u024F]+(?:-[a-zA-Z\u00C0-\u024F]+)*\b)/g)

                return tokens.map((token, idx) => {
                  const lower = token.toLowerCase()
                  const matchedChange = changeMap.get(lower)

                  if (matchedChange) {
                    const isPopoverOpen =
                      activeChange?.replacement.toLowerCase() === matchedChange.replacement.toLowerCase()

                    return (
                      <span key={idx} className="relative inline-block my-0.5">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            setActiveChange(isPopoverOpen ? null : matchedChange)
                          }}
                          aria-label={`Kata logat "${matchedChange.replacement}", bentuk baku: "${matchedChange.original}". Klik untuk opsi pemulihan atau kamus pribadi.`}
                          aria-haspopup="dialog"
                          aria-expanded={isPopoverOpen}
                          className="bg-amber-100/90 hover:bg-amber-200/90 dark:bg-amber-900/50 dark:hover:bg-amber-900/80
                                     text-amber-950 dark:text-amber-100 font-semibold
                                     underline underline-offset-4 decoration-dashed decoration-amber-600 dark:decoration-amber-400 decoration-2
                                     border-b-2 border-dashed border-amber-500/70 dark:border-amber-400/80
                                     rounded-sm px-1 py-0.5 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-amber-500"
                          title={`Kata logat: "${matchedChange.replacement}" (Baku: "${matchedChange.original}") — Klik untuk opsi`}
                        >
                          {token}
                        </button>

                        {isPopoverOpen && onRevertWord && (
                          <WordDialectPopover
                            change={matchedChange}
                            segmentId={segment.id}
                            onRevertWord={onRevertWord}
                            onClose={() => setActiveChange(null)}
                          />
                        )}
                      </span>
                    )
                  }

                  return <span key={idx}>{token}</span>
                })
              })()
            ) : (
              <span>{segment.displayText || segment.text}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Action buttons (muncul saat hover / fokus) ── */}
      <div
        className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100
                   group-focus-within:opacity-100 transition-opacity duration-150 pt-0.5"
      >
        {/* Tombol kembalikan ke teks asli mesin */}
        {onRevertToRaw && (segment.rawText !== (segment.displayText || segment.text) || segment.edited) && (
          <button
            id={`btn-revert-${segment.id}`}
            type="button"
            onClick={() => onRevertToRaw(segment.id)}
            title="Kembalikan ke teks asli mesin (rawText)"
            aria-label="Kembalikan ke teks asli mesin"
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400
                       hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Gabung dengan segmen sebelumnya */}
        {!isFirst && (
          <button
            id={`btn-merge-${segment.id}`}
            type="button"
            onClick={() => onMerge(segment.id)}
            title="Gabung dengan segmen sebelumnya"
            aria-label="Gabung dengan segmen sebelumnya"
            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400
                       hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
          >
            <Merge className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Hapus segmen */}
        <button
          id={`btn-delete-segment-${segment.id}`}
          type="button"
          onClick={() => onDelete(segment.id)}
          title="Hapus segmen ini"
          aria-label="Hapus segmen ini"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400
                     hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
