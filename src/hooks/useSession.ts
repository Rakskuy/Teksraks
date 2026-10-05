/**
 * useSession.ts
 *
 * Hook utama untuk manajemen sesi diskusi:
 * - Metadata (judul, tanggal, catatan)
 * - Pembicara (tambah, ganti nama, pilih aktif, shortcut 1-9)
 * - Segmen (tambah, edit, hapus, gabung, ganti pembicara)
 * - Timestamp relatif per segmen
 * - AutoSave ke localStorage setiap 5 detik
 * - Restore sesi sebelumnya
 * - Find & Replace di semua segmen
 * - Statistik (kata, durasi, per pembicara)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type {
  Speaker,
  Segment,
  SessionData,
  SessionStats,
  SpeakerStats,
} from '../types/session'
import { SPEAKER_COLORS, SESSION_VERSION } from '../types/session'
import type { DialectChange, DialectIntensity } from '../dialect'
import { applyBekasi } from '../dialect'
import {
  SAMPLE_SPEAKERS,
  SAMPLE_TITLE,
  SAMPLE_NOTES,
  SAMPLE_SEGMENTS,
} from '../data/sampleTranscript'

// ─────────────────────────────────────────────────────────────────────────────
// Konstanta
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'psikologi-stt-session'
const AUTOSAVE_INTERVAL = 5000 // ms

const DEFAULT_SPEAKERS: Speaker[] = [
  { id: 'sp-1', name: 'Pembicara 1', color: SPEAKER_COLORS[0] },
  { id: 'sp-2', name: 'Pembicara 2', color: SPEAKER_COLORS[1] },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function normalizeSegment(
  s: Partial<Segment> & { id: string; speakerId: string },
): Segment {
  const rawText = s.rawText ?? s.text ?? ''
  const displayText = s.displayText ?? s.text ?? rawText
  const startTime = s.startTime ?? s.timestamp ?? '00:00'
  return {
    id: s.id,
    speakerId: s.speakerId,
    startTime,
    rawText,
    displayText,
    dialectChanges: s.dialectChanges || [],
    edited: s.edited ?? false,
    text: displayText,
    timestamp: startTime,
    relativeMs: s.relativeMs ?? 0,
  }
}

export function formatTimestamp(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDuration(ms: number): string {
  if (ms < 1000) return '0 detik'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h} jam`)
  if (m > 0) parts.push(`${m} menit`)
  if (s > 0) parts.push(`${s} detik`)
  return parts.join(' ')
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function buildSessionData(
  title: string,
  date: string,
  notes: string,
  speakers: Speaker[],
  segments: Segment[],
): SessionData {
  return {
    version: SESSION_VERSION,
    title,
    date,
    notes,
    speakers,
    segments,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function loadSaved(): SessionData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SessionData
    if (data.version !== SESSION_VERSION) return null
    if (!Array.isArray(data.segments)) return null
    data.segments = data.segments.map(normalizeSegment)
    return data
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useSession() {
  // ── Metadata ──────────────────────────────────────────────────────────────
  const [title, setTitle]   = useState('Diskusi Psikologi')
  const [date, setDate]     = useState(todayISO())
  const [notes, setNotes]   = useState('')

  // ── Pembicara ─────────────────────────────────────────────────────────────
  const [speakers, setSpeakers]             = useState<Speaker[]>(DEFAULT_SPEAKERS)
  const [activeSpeakerId, setActiveSpeakerIdState] = useState<string>(DEFAULT_SPEAKERS[0].id)
  // Ref untuk closure-safe reads (tidak stale dalam callbacks)
  const activeSpeakerIdRef = useRef<string>(DEFAULT_SPEAKERS[0].id)

  const setActiveSpeakerId = useCallback((id: string) => {
    setActiveSpeakerIdState(id)
    activeSpeakerIdRef.current = id
  }, [])

  // ── Segmen ────────────────────────────────────────────────────────────────
  const [segments, setSegments]             = useState<Segment[]>([])
  const [showTimestamps, setShowTimestamps]  = useState(true)

  // ── Find & Replace ────────────────────────────────────────────────────────
  const [findQuery, setFindQuery]       = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [findReplaceOpen, setFindReplaceOpen] = useState(false)
  const [replaceCount, setReplaceCount] = useState<number | null>(null)

  // ── Restore dialog ────────────────────────────────────────────────────────
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [pendingRestore, setPendingRestore]       = useState<SessionData | null>(null)

  // ── AutoSave ──────────────────────────────────────────────────────────────
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const isDirtyRef = useRef(false)

  // ── Timing (untuk timestamp relatif) ─────────────────────────────────────
  const recordingStartMsRef = useRef<number | null>(null)
  const totalPausedMsRef    = useRef<number>(0)
  const pausedAtRef         = useRef<number | null>(null)

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Cek restore saat mount
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = loadSaved()
    if (
      saved &&
      (saved.segments.length > 0 ||
        saved.title !== 'Diskusi Psikologi' ||
        saved.notes !== '')
    ) {
      setPendingRestore(saved)
      setShowRestoreDialog(true)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Mark dirty ketika data berubah
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => { isDirtyRef.current = true }, [segments, title, notes, speakers, date])

  // ─────────────────────────────────────────────────────────────────────────
  // 3. AutoSave setiap 5 detik
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDirtyRef.current) return
      try {
        const data = buildSessionData(title, date, notes, speakers, segments)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        isDirtyRef.current = false
        setLastSaved(new Date())
      } catch { /* localStorage penuh */ }
    }, AUTOSAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [title, date, notes, speakers, segments])

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Keyboard shortcut 1-9 pilih pembicara
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      const isEditable = (e.target as HTMLElement).isContentEditable
      // Jangan aktifkan saat sedang mengetik
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || isEditable) return
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 9) {
        const idx = num - 1
        if (speakers[idx]) {
          setActiveSpeakerId(speakers[idx].id)
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [speakers, setActiveSpeakerId])

  // ─────────────────────────────────────────────────────────────────────────
  // Timing helpers
  // ─────────────────────────────────────────────────────────────────────────
  const getRelativeMs = useCallback((): number => {
    if (recordingStartMsRef.current === null) return 0
    const paused = pausedAtRef.current ? Date.now() - pausedAtRef.current : 0
    return Date.now() - recordingStartMsRef.current - totalPausedMsRef.current - paused
  }, [])

  const onRecordingStart = useCallback(() => {
    recordingStartMsRef.current = Date.now()
    totalPausedMsRef.current = 0
    pausedAtRef.current = null
  }, [])

  const onRecordingPause = useCallback(() => {
    pausedAtRef.current = Date.now()
  }, [])

  const onRecordingResume = useCallback(() => {
    if (pausedAtRef.current !== null) {
      totalPausedMsRef.current += Date.now() - pausedAtRef.current
      pausedAtRef.current = null
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Append segment dari speech recognition
  // ─────────────────────────────────────────────────────────────────────────
  const appendSegment = useCallback(
    (
      payload:
        | string
        | {
            rawText: string
            displayText: string
            dialectChanges?: DialectChange[]
          },
    ) => {
      const rawText = (typeof payload === 'string' ? payload : payload.rawText).trim()
      const displayText = (typeof payload === 'string' ? payload : payload.displayText).trim()
      const dialectChanges =
        typeof payload === 'object' && payload.dialectChanges ? payload.dialectChanges : []
      if (!rawText && !displayText) return

      const relativeMs = getRelativeMs()
      const startTime = formatTimestamp(relativeMs)
      const segment: Segment = {
        id: makeId(),
        speakerId: activeSpeakerIdRef.current,
        startTime,
        rawText,
        displayText,
        dialectChanges,
        edited: false,
        text: displayText,
        timestamp: startTime,
        relativeMs,
      }
      setSegments(prev => [...prev, segment])
    },
    [getRelativeMs],
  )

  /** Append batch segmen sekaligus (misal dari transkripsi Whisper) */
  const appendBatchSegments = useCallback((newSegments: Segment[]) => {
    if (!newSegments || newSegments.length === 0) return
    setSegments(prev => [...prev, ...newSegments])
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD Segmen
  // ─────────────────────────────────────────────────────────────────────────
  const editSegment = useCallback((id: string, newText: string) => {
    setSegments(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              displayText: newText,
              text: newText,
              edited: true,
            }
          : s,
      ),
    )
  }, [])

  const deleteSegment = useCallback((id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id))
  }, [])

  /** Kembalikan segmen tunggal ke teks asli mesin (rawText) */
  const revertSegmentToRaw = useCallback((id: string) => {
    setSegments(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              displayText: s.rawText,
              text: s.rawText,
              dialectChanges: [],
              edited: false,
            }
          : s,
      ),
    )
  }, [])

  /** Kembalikan SEMUA segmen ke teks asli mesin (rawText) secara global */
  const revertAllSegmentsToRaw = useCallback(() => {
    setSegments(prev =>
      prev.map(s => ({
        ...s,
        displayText: s.rawText,
        text: s.rawText,
        dialectChanges: [],
        edited: false,
      })),
    )
  }, [])

  /** Terapkan ulang mode dialek ke segmen yang BELUM diedit manual */
  const reapplyDialectToUnedited = useCallback(
    (dialectMode: 'standard' | 'bekasi', intensity: DialectIntensity) => {
      setSegments(prev =>
        prev.map(s => {
          // Segmen yang sudah diedit manual (edited = true) TIDAK boleh ditimpa!
          if (s.edited) return s

          if (dialectMode === 'bekasi') {
            const transformed = applyBekasi(s.rawText, { intensity })
            return {
              ...s,
              displayText: transformed.displayText,
              text: transformed.displayText,
              dialectChanges: transformed.changes,
            }
          } else {
            return {
              ...s,
              displayText: s.rawText,
              text: s.rawText,
              dialectChanges: [],
            }
          }
        }),
      )
    },
    [],
  )

  /** Update kata tertentu dalam segmen (klik kata: kembalikan ke baku / pertahankan) */
  const updateSegmentWord = useCallback(
    (id: string, targetOriginal: string, targetReplacement: string) => {
      setSegments(prev =>
        prev.map(s => {
          if (s.id !== id) return s
          const regex = new RegExp(`\\b${targetReplacement}\\b`, 'gi')
          const updatedDisplay = s.displayText.replace(regex, targetOriginal)
          const remainingChanges = s.dialectChanges.filter(
            c => c.replacement.toLowerCase() !== targetReplacement.toLowerCase(),
          )
          return {
            ...s,
            displayText: updatedDisplay,
            text: updatedDisplay,
            dialectChanges: remainingChanges,
          }
        }),
      )
    },
    [],
  )

  /** Gabung segmen ke segmen tepat sebelumnya */
  const mergeWithPrevious = useCallback((id: string) => {
    setSegments(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx <= 0) return prev
      const merged = [...prev]
      const prevSeg = { ...merged[idx - 1] }
      const curSeg  = merged[idx]
      const mergedRaw = `${prevSeg.rawText || prevSeg.displayText || prevSeg.text} ${curSeg.rawText || curSeg.displayText || curSeg.text}`.trim()
      const mergedDisplay = `${prevSeg.displayText || prevSeg.text} ${curSeg.displayText || curSeg.text}`.trim()
      prevSeg.rawText = mergedRaw
      prevSeg.displayText = mergedDisplay
      prevSeg.text = mergedDisplay
      prevSeg.dialectChanges = [...prevSeg.dialectChanges, ...curSeg.dialectChanges]
      prevSeg.edited = prevSeg.edited || curSeg.edited
      merged.splice(idx - 1, 2, prevSeg)
      return merged
    })
  }, [])

  const changeSegmentSpeaker = useCallback((id: string, speakerId: string) => {
    setSegments(prev =>
      prev.map(s => (s.id === id ? { ...s, speakerId } : s)),
    )
  }, [])

  const batchTransformSegments = useCallback(
    (transformFn: (text: string) => string) => {
      setSegments(prev =>
        prev.map(s => {
          if (s.edited) return s
          const newText = transformFn(s.displayText || s.text)
          return {
            ...s,
            displayText: newText,
            text: newText,
          }
        }),
      )
    },
    [],
  )

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD Pembicara
  // ─────────────────────────────────────────────────────────────────────────
  const addSpeaker = useCallback(() => {
    setSpeakers(prev => {
      const num   = prev.length + 1
      const color = SPEAKER_COLORS[(prev.length) % SPEAKER_COLORS.length]
      return [
        ...prev,
        { id: makeId(), name: `Pembicara ${num}`, color },
      ]
    })
  }, [])

  const renameSpeaker = useCallback((id: string, name: string) => {
    setSpeakers(prev => prev.map(sp => (sp.id === id ? { ...sp, name } : sp)))
  }, [])

  const deleteSpeaker = useCallback(
    (id: string) => {
      if (speakers.length <= 1) return
      const fallback = speakers.find(sp => sp.id !== id)?.id ?? ''
      // Pindahkan segmen pembicara ini ke fallback
      setSegments(prev =>
        prev.map(s => (s.speakerId === id ? { ...s, speakerId: fallback } : s)),
      )
      setSpeakers(prev => prev.filter(sp => sp.id !== id))
      if (activeSpeakerIdRef.current === id) {
        setActiveSpeakerId(fallback)
      }
    },
    [speakers, setActiveSpeakerId],
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Find & Replace
  // ─────────────────────────────────────────────────────────────────────────
  const doReplaceAll = useCallback(() => {
    if (!findQuery.trim()) return
    let count = 0
    setSegments(prev =>
      prev.map(s => {
        const current = s.displayText || s.text
        const updated = current.split(findQuery).join(replaceQuery)
        if (updated !== current) count++
        return {
          ...s,
          displayText: updated,
          text: updated,
          edited: true,
        }
      }),
    )
    setReplaceCount(count)
  }, [findQuery, replaceQuery])

  const clearReplaceCount = useCallback(() => setReplaceCount(null), [])

  // ─────────────────────────────────────────────────────────────────────────
  // Session lifecycle
  // ─────────────────────────────────────────────────────────────────────────
  const restoreSession = useCallback(() => {
    if (!pendingRestore) return
    const d = pendingRestore
    setTitle(d.title)
    setDate(d.date)
    setNotes(d.notes)
    setSpeakers(d.speakers)
    setSegments(d.segments.map(normalizeSegment))
    if (d.speakers.length > 0) {
      setActiveSpeakerId(d.speakers[0].id)
    }
    setShowRestoreDialog(false)
    setPendingRestore(null)
  }, [pendingRestore, setActiveSpeakerId])

  const startNewSession = useCallback(() => {
    setTitle('Diskusi Psikologi')
    setDate(todayISO())
    setNotes('')
    setSpeakers(DEFAULT_SPEAKERS)
    setSegments([])
    setActiveSpeakerId(DEFAULT_SPEAKERS[0].id)
    setShowRestoreDialog(false)
    setPendingRestore(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }, [setActiveSpeakerId])

  const dismissRestore = useCallback(() => {
    setShowRestoreDialog(false)
    setPendingRestore(null)
  }, [])

  const clearAllSegments = useCallback(() => {
    setSegments([])
  }, [])

  const loadSampleData = useCallback(() => {
    setTitle(SAMPLE_TITLE)
    setDate(todayISO())
    setNotes(SAMPLE_NOTES)
    setSpeakers(SAMPLE_SPEAKERS)
    setSegments(SAMPLE_SEGMENTS.map(normalizeSegment))
    setActiveSpeakerId(SAMPLE_SPEAKERS[0].id)
  }, [setActiveSpeakerId])

  // ─────────────────────────────────────────────────────────────────────────
  // Statistik (memoized)
  // ─────────────────────────────────────────────────────────────────────────
  const stats: SessionStats = useMemo(() => {
    const totalWords = segments.reduce((sum, s) => sum + countWords(s.displayText || s.text), 0)
    const totalChars = segments.reduce((sum, s) => sum + (s.displayText || s.text).length, 0)
    const durationMs = segments.length > 0
      ? (segments[segments.length - 1].relativeMs ?? 0)
      : 0
    const perSpeaker: SpeakerStats[] = speakers.map(sp => ({
      speaker: sp,
      segmentCount: segments.filter(s => s.speakerId === sp.id).length,
      wordCount:    segments
        .filter(s => s.speakerId === sp.id)
        .reduce((sum, s) => sum + countWords(s.displayText || s.text), 0),
    }))
    return {
      totalSegments: segments.length,
      totalWords,
      totalChars,
      durationMs,
      durationFormatted: formatDuration(durationMs),
      perSpeaker,
    }
  }, [segments, speakers])

  // ─────────────────────────────────────────────────────────────────────────
  // Teks terformat untuk export
  // ─────────────────────────────────────────────────────────────────────────
  const getFormattedText = useCallback((useRawText: boolean = false): string => {
    const speakerMap = new Map(speakers.map(sp => [sp.id, sp.name]))
    const header = [
      `=== ${title} ===`,
      `Tanggal: ${new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })}`,
      notes ? `Catatan: ${notes}` : null,
      '',
      '─────────────────────────────────',
      '',
    ]
      .filter(Boolean)
      .join('\n')

    const body = segments
      .map(s => {
        const spName = speakerMap.get(s.speakerId) ?? 'Tidak Diketahui'
        const ts     = showTimestamps ? `[${s.startTime || s.timestamp}] ` : ''
        const textContent = useRawText ? (s.rawText || s.displayText) : (s.displayText || s.text)
        return `${ts}${spName}: ${textContent}`
      })
      .join('\n\n')

    return header + body
  }, [title, date, notes, segments, speakers, showTimestamps])

  // ─────────────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────────────
  return {
    // Metadata
    title, setTitle,
    date, setDate,
    notes, setNotes,
    // Pembicara
    speakers, activeSpeakerId,
    setActiveSpeakerId,
    addSpeaker, renameSpeaker, deleteSpeaker,
    // Segmen
    segments, showTimestamps, setShowTimestamps,
    appendSegment,
    appendBatchSegments,
    editSegment, deleteSegment, mergeWithPrevious, changeSegmentSpeaker,
    batchTransformSegments,
    revertSegmentToRaw,
    revertAllSegmentsToRaw,
    reapplyDialectToUnedited,
    updateSegmentWord,
    clearAllSegments,
    loadSampleData,
    // Find & Replace
    findQuery, setFindQuery,
    replaceQuery, setReplaceQuery,
    findReplaceOpen, setFindReplaceOpen,
    replaceCount, doReplaceAll, clearReplaceCount,
    // Session lifecycle
    showRestoreDialog,
    restoreSession, startNewSession, dismissRestore,
    // AutoSave
    lastSaved,
    // Timing (dipanggil dari App saat recording start/pause/resume)
    onRecordingStart, onRecordingPause, onRecordingResume,
    // Stats & export
    stats,
    getFormattedText,
  }
}
