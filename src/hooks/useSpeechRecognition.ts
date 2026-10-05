/**
 * useSpeechRecognition.ts
 *
 * Custom hook untuk Web Speech API:
 * - Bahasa id-ID / en-US / en-GB
 * - continuous=true, interimResults=true
 * - Auto-restart saat Chrome berhenti karena hening
 * - Setiap final chunk dikirim via onFinalChunk callback
 * - Pause/Resume aman tanpa race condition
 * - Proteksi anti-duplikasi teks via lastFinalProcessedIndex
 * - Penanganan semua error (pesan Indonesia)
 * - Pembersihan memori (AudioContext & media stream) tanpa memory leak
 * - Deteksi browser tidak didukung
 * - Cleanup saat unmount
 */

import { useRef, useState, useCallback, useEffect } from 'react'
import type {
  RecordingStatus,
  SpeechError,
  SpeechRecognitionHookResult,
  SupportedLang,
  UseSpeechRecognitionOptions,
} from '../types/speech.d'
import { selectBestAlternative, type SpeechAlternativeItem } from '../dialect'

// ─────────────────────────────────────────────────────────────────────────────
// Browser type shims
// ─────────────────────────────────────────────────────────────────────────────
interface ISpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence?: number
}

interface ISpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  readonly [index: number]: ISpeechRecognitionAlternative
}

interface ISpeechRecognitionResultList {
  readonly length: number
  readonly [index: number]: ISpeechRecognitionResult
}

interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: ISpeechRecognitionResultList
}

interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string
}

interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error messages Bahasa Indonesia
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<string, SpeechError> = {
  'not-allowed': {
    code: 'not-allowed',
    title: 'Akses Mikrofon Ditolak',
    message: 'Browser tidak mendapat izin untuk menggunakan mikrofon Anda.',
    tip: 'Klik ikon gembok 🔒 di address bar → ubah Mikrofon menjadi "Izinkan" → muat ulang halaman.',
  },
  'no-speech': {
    code: 'no-speech',
    title: 'Tidak Ada Suara',
    message: 'Tidak ada suara terdeteksi dalam batas waktu tertentu.',
    tip: 'Pastikan mikrofon tidak dibisukan lalu bicara lebih keras.',
  },
  'audio-capture': {
    code: 'audio-capture',
    title: 'Mikrofon Tidak Ditemukan',
    message: 'Tidak ada perangkat mikrofon yang tersedia.',
    tip: 'Pastikan mikrofon terpasang dan tidak digunakan aplikasi lain.',
  },
  'network': {
    code: 'network',
    title: 'Masalah Jaringan',
    message: 'Koneksi internet diperlukan agar speech recognition berfungsi.',
    tip: 'Periksa koneksi internet Anda. Halaman harus dibuka via HTTPS atau localhost.',
  },
  'service-not-allowed': {
    code: 'service-not-allowed',
    title: 'Layanan Diblokir',
    message: 'Layanan speech recognition diblokir oleh kebijakan browser.',
    tip: 'Coba buka halaman via HTTPS atau localhost.',
  },
  'language-not-supported': {
    code: 'language-not-supported',
    title: 'Bahasa Tidak Didukung',
    message: 'Bahasa yang dipilih tidak didukung browser ini.',
    tip: 'Coba pilih bahasa lain atau update Google Chrome ke versi terbaru.',
  },
}

function buildError(code: string): SpeechError {
  return (
    ERROR_MESSAGES[code] ?? {
      code,
      title: 'Terjadi Kesalahan',
      message: `Error: ${code}`,
      tip: 'Coba muat ulang halaman dan mulai rekaman lagi.',
    }
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Deteksi dukungan browser
// ─────────────────────────────────────────────────────────────────────────────
function detectSupport() {
  if (typeof window === 'undefined') return { isSupported: false, isBrowserWarning: false }
  const hasApi = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  return { isSupported: hasApi, isBrowserWarning: !hasApi }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook utama
// ─────────────────────────────────────────────────────────────────────────────
export function useSpeechRecognition(
  options?: UseSpeechRecognitionOptions,
): SpeechRecognitionHookResult {
  const [interimText, setInterimText] = useState<string>('')
  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [error, setError] = useState<SpeechError | null>(null)
  const [lang, setLangState] = useState<SupportedLang>('id-ID')
  const [audioLevel, setAudioLevel] = useState<number>(0)

  const { isSupported, isBrowserWarning } = detectSupport()

  // ── Refs (tidak memicu re-render, aman dalam closure) ────────────────────
  const recognitionRef   = useRef<ISpeechRecognition | null>(null)
  const statusRef        = useRef<RecordingStatus>('idle')
  const langRef          = useRef<SupportedLang>('id-ID')
  const shouldRestartRef = useRef<boolean>(false)
  const restartTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref untuk callback onFinalChunk — selalu terkini tanpa re-init recognition
  const onFinalChunkRef = useRef(options?.onFinalChunk)
  useEffect(() => { onFinalChunkRef.current = options?.onFinalChunk }, [options?.onFinalChunk])

  // Audio analyser refs (dicegah dari kebocoran memori)
  const audioCtxRef     = useRef<AudioContext | null>(null)
  const animFrameRef    = useRef<number | null>(null)
  const streamRef       = useRef<MediaStream | null>(null)

  // Sync statusRef
  useEffect(() => { statusRef.current = status }, [status])

  // ── Pembersihan aman audio analyser (Anti Memory Leak) ───────────────────
  const stopAudioAnalyser = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setAudioLevel(0)
  }, [])

  // ── Mulai audio analyser ─────────────────────────────────────────────────
  const startAudioAnalyser = useCallback(async () => {
    try {
      // Pastikan analyser sebelumnya sudah bersih sebelum membuat baru
      stopAudioAnalyser()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtxClass) return

      const ctx = new AudioCtxClass()
      audioCtxRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        if (!audioCtxRef.current) return
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((s, v) => s + v, 0) / data.length
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)))
        animFrameRef.current = requestAnimationFrame(tick)
      }
      animFrameRef.current = requestAnimationFrame(tick)
    } catch {
      // Gagal diam-diam jika mic tidak mendukung analyser
    }
  }, [stopAudioAnalyser])

  // ── Pembersihan aman instance SpeechRecognition (Anti Race Condition) ─────
  const cleanupRecognition = useCallback((rec: ISpeechRecognition | null) => {
    if (!rec) return
    rec.onstart = null
    rec.onresult = null
    rec.onerror = null
    rec.onend = null
    try {
      rec.abort()
    } catch { /* ignore */ }
  }, [])

  // ── Buat instance SpeechRecognition baru ────────────────────────────────
  const createRecognition = useCallback((): ISpeechRecognition | null => {
    if (!isSupported) return null
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!API) return null
    const rec = new API()
    rec.lang = langRef.current
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 5
    return rec
  }, [isSupported])

  // ── Pasang event listeners ───────────────────────────────────────────────
  const attachListeners = useCallback(
    (rec: ISpeechRecognition) => {
      // Pelacak index final untuk menjamin ANTI-DUPLIKASI
      let lastFinalProcessedIndex = -1

      rec.onstart = () => {
        if (rec !== recognitionRef.current) return
        setError(null)
      }

      rec.onresult = (event: ISpeechRecognitionEvent) => {
        if (rec !== recognitionRef.current) return
        let interim = ''
        let finalChunk = ''

        // Cegah duplikasi teks jika resultIndex berulang dari browser
        const startIndex = Math.max(event.resultIndex, lastFinalProcessedIndex + 1)
        for (let i = startIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            // Evaluasi semua alternatif (hingga 5 alternatif)
            const alternatives: SpeechAlternativeItem[] = []
            const altLen = result.length || 1
            for (let j = 0; j < altLen; j++) {
              if (result[j]) {
                alternatives.push({
                  transcript: result[j].transcript,
                  confidence: result[j].confidence,
                })
              }
            }
            const best = selectBestAlternative(alternatives)
            finalChunk += best.selectedTranscript
            lastFinalProcessedIndex = i
          } else {
            // Interim tidak dikonversi logat, murni hasil sementara
            interim += result[0].transcript
          }
        }
        if (finalChunk.trim()) {
          onFinalChunkRef.current?.(finalChunk.trim())
        }
        setInterimText(interim)
      }

      rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
        if (rec !== recognitionRef.current) return
        const code = event.error
        if (code === 'aborted') return
        if (code === 'no-speech') return // biarkan auto-restart menangani jika masih mode rekam

        setError(buildError(code))
        shouldRestartRef.current = false
        setStatus('idle')
        statusRef.current = 'idle'
        stopAudioAnalyser()
      }

      rec.onend = () => {
        // Abaikan jika instance ini sudah kedaluwarsa atau digantikan
        if (rec !== recognitionRef.current) return
        setInterimText('')

        if (shouldRestartRef.current) {
          // Auto-restart untuk mengatasi Chrome yang berhenti saat hening
          restartTimerRef.current = setTimeout(() => {
            if (!shouldRestartRef.current) return
            cleanupRecognition(recognitionRef.current)
            const newRec = createRecognition()
            if (!newRec) return
            attachListeners(newRec)
            recognitionRef.current = newRec
            try {
              newRec.start()
            } catch {
              shouldRestartRef.current = false
              setStatus('idle')
              statusRef.current = 'idle'
            }
          }, 300)
        } else {
          if (statusRef.current === 'stopping') {
            setStatus('idle')
            statusRef.current = 'idle'
          }
        }
      }
    },
    [createRecognition, stopAudioAnalyser, cleanupRecognition],
  )

  // ── Cleanup saat unmount (Anti Memory Leak) ───────────────────────────────
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current)
        restartTimerRef.current = null
      }
      cleanupRecognition(recognitionRef.current)
      recognitionRef.current = null
      stopAudioAnalyser()
    }
  }, [stopAudioAnalyser, cleanupRecognition])

  // ─────────────────────────────────────────────────────────────────────────
  // Public actions (Mulai, Jeda, Lanjut, Berhenti)
  // ─────────────────────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (!isSupported) return
    setError(null)
    setInterimText('')

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }

    cleanupRecognition(recognitionRef.current)
    const rec = createRecognition()
    if (!rec) return

    attachListeners(rec)
    recognitionRef.current = rec
    shouldRestartRef.current = true

    try {
      rec.start()
      setStatus('recording')
      statusRef.current = 'recording'
      void startAudioAnalyser()
    } catch {
      setError(buildError('audio-capture'))
      shouldRestartRef.current = false
      setStatus('idle')
      statusRef.current = 'idle'
    }
  }, [isSupported, createRecognition, attachListeners, startAudioAnalyser, cleanupRecognition])

  const pauseRecording = useCallback(() => {
    if (statusRef.current !== 'recording') return
    shouldRestartRef.current = false

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }

    // Stop recognition saat ini secara rapi
    cleanupRecognition(recognitionRef.current)
    recognitionRef.current = null

    setStatus('paused')
    statusRef.current = 'paused'
    setInterimText('')
    stopAudioAnalyser()
  }, [stopAudioAnalyser, cleanupRecognition])

  const resumeRecording = useCallback(() => {
    if (statusRef.current !== 'paused') return
    setError(null)
    setInterimText('')

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }

    cleanupRecognition(recognitionRef.current)
    const rec = createRecognition()
    if (!rec) return

    attachListeners(rec)
    recognitionRef.current = rec
    shouldRestartRef.current = true

    try {
      rec.start()
      setStatus('recording')
      statusRef.current = 'recording'
      void startAudioAnalyser()
    } catch {
      setError(buildError('audio-capture'))
      shouldRestartRef.current = false
      setStatus('idle')
      statusRef.current = 'idle'
    }
  }, [createRecognition, attachListeners, startAudioAnalyser, cleanupRecognition])

  const stopRecording = useCallback(() => {
    shouldRestartRef.current = false

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }

    setStatus('stopping')
    statusRef.current = 'stopping'
    setInterimText('')
    stopAudioAnalyser()

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        cleanupRecognition(recognitionRef.current)
      }
    }
    setTimeout(() => {
      cleanupRecognition(recognitionRef.current)
      recognitionRef.current = null
      setStatus('idle')
      statusRef.current = 'idle'
    }, 400)
  }, [stopAudioAnalyser, cleanupRecognition])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const setLang = useCallback(
    (newLang: SupportedLang) => {
      setLangState(newLang)
      langRef.current = newLang
      if (statusRef.current === 'recording') {
        shouldRestartRef.current = false
        if (restartTimerRef.current) {
          clearTimeout(restartTimerRef.current)
          restartTimerRef.current = null
        }
        cleanupRecognition(recognitionRef.current)

        restartTimerRef.current = setTimeout(() => {
          const rec = createRecognition()
          if (!rec) return
          attachListeners(rec)
          recognitionRef.current = rec
          shouldRestartRef.current = true
          try {
            rec.start()
          } catch {
            shouldRestartRef.current = false
            setStatus('idle')
            statusRef.current = 'idle'
          }
        }, 300)
      }
    },
    [createRecognition, attachListeners, cleanupRecognition],
  )

  return {
    interimText,
    status,
    isSupported,
    isBrowserWarning,
    error,
    lang,
    audioLevel,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearError,
    setLang,
  }
}
