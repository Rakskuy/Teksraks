/**
 * useSpeechRecognition.ts
 *
 * Custom hook untuk Web Speech API:
 * - Bahasa id-ID / en-US / en-GB
 * - continuous=true, interimResults=true
 * - State machine aman: idle -> starting -> recording -> paused -> stopping -> idle
 * - Timeout pengaman 5 detik pada status 'starting' agar tombol tidak macet
 * - Penanganan Android Chrome kumulatif via mergeSpeechTranscript (satu kalimat = satu baris)
 * - Auto-commit saat hening >= 1.5 detik setelah hasil final terakhir
 * - Flush commit saat jeda, berhenti, ganti pembicara, atau auto-restart
 * - Mode Logat Standar melewati teks apa adanya
 * - Deteksi kesunyian >8 detik dengan pesan ramah Indonesia
 * - Perlindungan mikrofon: SpeechRecognition selalu start dulu, getUserMedia sekunder opsional di desktop, dinonaktifkan di mobile
 * - Deteksi lingkungan mobile, iOS/Safari
 * - Pembersihan memori lengkap & anti memory leak
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
import { mergeSpeechTranscript } from '../utils/transcriptDedupe'

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
  onaudiostart?: (() => void) | null
  onsoundstart?: (() => void) | null
  onspeechstart?: (() => void) | null
  onspeechend?: (() => void) | null
  onsoundend?: (() => void) | null
  onaudioend?: (() => void) | null
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
// Deteksi dukungan browser & perangkat mobile
// ─────────────────────────────────────────────────────────────────────────────
export function isMobileDevice(customUA?: string): boolean {
  const ua = customUA ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (!ua) return false
  return (
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function detectSupport(customUA?: string) {
  const hasApi =
    typeof window !== 'undefined'
      ? 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
      : false
  const ua = customUA ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|Android/.test(ua)
  const isIOSSafari = isIOS || isSafari
  return {
    isSupported: hasApi,
    isBrowserWarning: typeof window !== 'undefined' ? !hasApi : false,
    isIOSSafari,
  }
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

  const { isSupported, isBrowserWarning, isIOSSafari } = detectSupport()

  // ── Refs (tidak memicu re-render, aman dalam closure) ────────────────────
  const recognitionRef     = useRef<ISpeechRecognition | null>(null)
  const statusRef          = useRef<RecordingStatus>('idle')
  const langRef            = useRef<SupportedLang>('id-ID')
  const shouldRestartRef   = useRef<boolean>(false)
  const isRestartingRef    = useRef<boolean>(false)
  const restartTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const silenceTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const commitTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Callbacks
  const onLiveUpdateRef = useRef(options?.onLiveUpdate)
  useEffect(() => { onLiveUpdateRef.current = options?.onLiveUpdate }, [options?.onLiveUpdate])

  const onCommitRef = useRef(options?.onCommit)
  useEffect(() => { onCommitRef.current = options?.onCommit }, [options?.onCommit])

  const onFinalChunkRef = useRef(options?.onFinalChunk)
  useEffect(() => { onFinalChunkRef.current = options?.onFinalChunk }, [options?.onFinalChunk])

  const dialectModeRef = useRef(options?.dialectMode ?? 'standard')
  useEffect(() => { dialectModeRef.current = options?.dialectMode ?? 'standard' }, [options?.dialectMode])

  // Audio analyser refs
  const audioCtxRef         = useRef<AudioContext | null>(null)
  const animFrameRef        = useRef<number | null>(null)
  const streamRef           = useRef<MediaStream | null>(null)
  const analyserStartingRef = useRef<boolean>(false)

  // Sync statusRef
  useEffect(() => { statusRef.current = status }, [status])

  // ── Penanganan Timeout Status 'starting' (Anti Macet 5 Detik) ────────────
  const clearStartingTimeout = useCallback(() => {
    if (startingTimeoutRef.current) {
      clearTimeout(startingTimeoutRef.current)
      startingTimeoutRef.current = null
    }
  }, [])

  // ── Penanganan Pengingat Kesunyian (>8 detik) ─────────────────────────────
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer()
    if (statusRef.current === 'recording' || statusRef.current === 'starting') {
      silenceTimerRef.current = setTimeout(() => {
        if (statusRef.current === 'recording') {
          setError({
            code: 'no-speech-warning',
            title: 'Suara Tidak Terdeteksi',
            message: 'Mikrofon aktif tapi suara tidak terdeteksi, periksa izin atau coba headset',
            tip: 'Pastikan mikrofon tidak dibisukan (unmuted) pada perangkat atau coba gunakan headset.',
          })
        }
      }, 8000)
    }
  }, [clearSilenceTimer])

  // ── Penanganan Timer Auto-Commit (1.5 detik hening setelah kata) ──────────
  const clearCommitTimer = useCallback(() => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current)
      commitTimerRef.current = null
    }
  }, [])

  const flushCommit = useCallback(() => {
    clearCommitTimer()
    onCommitRef.current?.()
  }, [clearCommitTimer])

  // ── Pembersihan aman audio analyser (Anti Memory Leak) ───────────────────
  const stopAudioAnalyser = useCallback(() => {
    analyserStartingRef.current = false
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

  // ── Mulai audio analyser (Opsional, Desktop only, aman tanpa bentrok mic) ─
  const startAudioAnalyser = useCallback(async () => {
    if (isMobileDevice()) return
    if (analyserStartingRef.current || streamRef.current) return
    analyserStartingRef.current = true

    try {
      stopAudioAnalyser()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!analyserStartingRef.current || (statusRef.current !== 'recording' && statusRef.current !== 'starting')) {
        stream.getTracks().forEach(t => t.stop())
        return
      }
      streamRef.current = stream

      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtxClass) return

      const ctx = new AudioCtxClass()
      audioCtxRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.5
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
      setAudioLevel(0)
    } finally {
      analyserStartingRef.current = false
    }
  }, [stopAudioAnalyser])

  // ── Pembersihan aman instance SpeechRecognition (Anti Race Condition) ─────
  const cleanupRecognition = useCallback((rec: ISpeechRecognition | null) => {
    if (!rec) return
    rec.onstart = null
    rec.onaudiostart = null
    rec.onsoundstart = null
    rec.onspeechstart = null
    rec.onspeechend = null
    rec.onsoundend = null
    rec.onaudioend = null
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
      rec.onstart = () => {
        if (rec !== recognitionRef.current) return
        clearStartingTimeout()
        setStatus('recording')
        statusRef.current = 'recording'
        setError(prev => (prev?.code === 'no-speech-warning' || prev?.code === 'start-timeout' ? null : prev))
        resetSilenceTimer()
      }

      rec.onaudiostart = () => {
        if (rec !== recognitionRef.current) return
        resetSilenceTimer()
        if (!isMobileDevice() && !streamRef.current) {
          void startAudioAnalyser()
        }
      }

      rec.onsoundstart = () => {
        if (rec !== recognitionRef.current) return
        setError(prev => (prev?.code === 'no-speech-warning' ? null : prev))
        resetSilenceTimer()
        clearCommitTimer()
        if (!streamRef.current) {
          setAudioLevel(35)
        }
      }

      rec.onspeechstart = () => {
        if (rec !== recognitionRef.current) return
        setError(prev => (prev?.code === 'no-speech-warning' ? null : prev))
        resetSilenceTimer()
        clearCommitTimer()
        if (!streamRef.current) {
          setAudioLevel(70)
        }
      }

      rec.onspeechend = () => {
        if (rec !== recognitionRef.current) return
        if (!streamRef.current) {
          setAudioLevel(15)
        }
      }

      rec.onsoundend = () => {
        if (rec !== recognitionRef.current) return
        if (!streamRef.current) {
          setAudioLevel(0)
        }
      }

      rec.onresult = (event: ISpeechRecognitionEvent) => {
        if (rec !== recognitionRef.current) return
        setError(prev => (prev?.code === 'no-speech-warning' ? null : prev))
        resetSilenceTimer()
        clearCommitTimer()

        // 1. Bangun kalimat sesi aktif secara kumulatif dari event.results
        let currentPhrase = ''
        let hasFinalResult = false

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            hasFinalResult = true
          }

          let text = ''
          if (dialectModeRef.current === 'bekasi' && result.isFinal) {
            const alternatives: SpeechAlternativeItem[] = []
            const altLen = result.length || 0
            for (let j = 0; j < altLen; j++) {
              if (result[j]?.transcript) {
                alternatives.push({
                  transcript: result[j].transcript,
                  confidence: result[j].confidence,
                })
              }
            }
            const best = alternatives.length > 0 ? selectBestAlternative(alternatives) : null
            text = best?.selectedTranscript?.trim() || result[0]?.transcript?.trim() || ''
          } else {
            // Mode Standar (atau interim): ambil teks apa adanya
            text = result[0]?.transcript?.trim() || ''
          }

          if (text) {
            currentPhrase = mergeSpeechTranscript(currentPhrase, text)
          }
        }

        // 2. TIMPA (replace in place) live segment
        if (currentPhrase.trim()) {
          if (onLiveUpdateRef.current) {
            onLiveUpdateRef.current(currentPhrase.trim())
          } else {
            onFinalChunkRef.current?.(currentPhrase.trim())
          }
        }

        setInterimText(currentPhrase)
        if (!streamRef.current && currentPhrase) {
          setAudioLevel(Math.min(90, 45 + currentPhrase.length * 2))
        }

        // 3. Jika ada hasil final, jadwalkan commit saat hening >= 1.5 detik
        if (hasFinalResult) {
          clearCommitTimer()
          commitTimerRef.current = setTimeout(() => {
            commitTimerRef.current = null
            onCommitRef.current?.()
          }, 1500)
        }
      }

      rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
        if (rec !== recognitionRef.current) return
        const code = event.error
        if (code === 'aborted') return
        if (code === 'no-speech') {
          // Biarkan auto-restart menangani hening jika masih merekam
          return
        }

        clearStartingTimeout()
        clearSilenceTimer()
        clearCommitTimer()
        setError(buildError(code))
        shouldRestartRef.current = false
        setStatus('idle')
        statusRef.current = 'idle'
        stopAudioAnalyser()
      }

      rec.onend = () => {
        if (rec !== recognitionRef.current) return
        clearStartingTimeout()
        setInterimText('')

        // Flush live segment hanya jika sesi benar-benar berakhir (bukan auto-restart)
        // Saat auto-restart di Android, jangan commit live segment agar kalimat pembicara tidak terpotong-potong
        if (!shouldRestartRef.current) {
          flushCommit()
        }

        if (shouldRestartRef.current && (statusRef.current === 'recording' || statusRef.current === 'starting')) {
          if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current)
          }

          restartTimerRef.current = setTimeout(() => {
            restartTimerRef.current = null
            if (!shouldRestartRef.current || (statusRef.current !== 'recording' && statusRef.current !== 'starting') || isRestartingRef.current) {
              return
            }

            isRestartingRef.current = true
            const oldRec = recognitionRef.current
            recognitionRef.current = null
            cleanupRecognition(oldRec)

            const newRec = createRecognition()
            if (!newRec) {
              isRestartingRef.current = false
              return
            }

            attachListeners(newRec)
            recognitionRef.current = newRec

            try {
              newRec.start()
            } catch {
              // Jika peramban masih melepaskan stream, coba sekali lagi dalam 400ms
              setTimeout(() => {
                if (!shouldRestartRef.current || (statusRef.current !== 'recording' && statusRef.current !== 'starting')) {
                  isRestartingRef.current = false
                  return
                }
                try {
                  newRec.start()
                } catch {
                  shouldRestartRef.current = false
                  setStatus('idle')
                  statusRef.current = 'idle'
                  clearSilenceTimer()
                  stopAudioAnalyser()
                } finally {
                  isRestartingRef.current = false
                }
              }, 400)
              return
            }
            isRestartingRef.current = false
          }, 250)
        } else {
          if (statusRef.current === 'stopping' || statusRef.current === 'starting') {
            setStatus('idle')
            statusRef.current = 'idle'
            clearSilenceTimer()
          }
        }
      }
    },
    [
      createRecognition,
      stopAudioAnalyser,
      cleanupRecognition,
      startAudioAnalyser,
      resetSilenceTimer,
      clearSilenceTimer,
      clearCommitTimer,
      flushCommit,
      clearStartingTimeout,
    ],
  )

  // ── Cleanup saat unmount (Anti Memory Leak) ───────────────────────────────
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current)
        restartTimerRef.current = null
      }
      clearStartingTimeout()
      clearSilenceTimer()
      clearCommitTimer()
      cleanupRecognition(recognitionRef.current)
      recognitionRef.current = null
      stopAudioAnalyser()
    }
  }, [stopAudioAnalyser, cleanupRecognition, clearSilenceTimer, clearCommitTimer, clearStartingTimeout])

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
    clearCommitTimer()

    const oldRec = recognitionRef.current
    recognitionRef.current = null
    cleanupRecognition(oldRec)

    const rec = createRecognition()
    if (!rec) return

    attachListeners(rec)
    recognitionRef.current = rec
    shouldRestartRef.current = true

    // State machine: Set status 'starting' dengan pengaman 5 detik
    setStatus('starting')
    statusRef.current = 'starting'
    clearStartingTimeout()
    startingTimeoutRef.current = setTimeout(() => {
      if (statusRef.current === 'starting') {
        cleanupRecognition(recognitionRef.current)
        recognitionRef.current = null
        setStatus('idle')
        statusRef.current = 'idle'
        setError({
          code: 'start-timeout',
          title: 'Mikrofon Membutuhkan Waktu Lama',
          message: 'Peramban belum mengaktifkan mikrofon.',
          tip: 'Pastikan izin mikrofon telah diberikan di address bar lalu coba klik Rekam lagi.',
        })
      }
    }, 5000)

    try {
      rec.start()
      resetSilenceTimer()
    } catch (err: unknown) {
      // Penanganan InvalidStateError jika browser belum selesai menutup instance sebelumnya
      if (err instanceof DOMException && err.name === 'InvalidStateError') {
        setTimeout(() => {
          if (statusRef.current === 'starting' && recognitionRef.current) {
            try {
              recognitionRef.current.start()
              resetSilenceTimer()
            } catch {
              clearStartingTimeout()
              setStatus('idle')
              statusRef.current = 'idle'
              setError(buildError('audio-capture'))
            }
          }
        }, 300)
        return
      }

      clearStartingTimeout()
      setError(buildError('audio-capture'))
      shouldRestartRef.current = false
      setStatus('idle')
      statusRef.current = 'idle'
      clearSilenceTimer()
    }
  }, [
    isSupported,
    createRecognition,
    attachListeners,
    cleanupRecognition,
    resetSilenceTimer,
    clearSilenceTimer,
    clearStartingTimeout,
    clearCommitTimer,
  ])

  const pauseRecording = useCallback(() => {
    if (statusRef.current !== 'recording' && statusRef.current !== 'starting') return
    shouldRestartRef.current = false

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    clearStartingTimeout()
    clearSilenceTimer()
    flushCommit()

    const oldRec = recognitionRef.current
    recognitionRef.current = null
    cleanupRecognition(oldRec)

    setStatus('paused')
    statusRef.current = 'paused'
    setInterimText('')
    stopAudioAnalyser()
  }, [stopAudioAnalyser, cleanupRecognition, clearSilenceTimer, clearStartingTimeout, flushCommit])

  const resumeRecording = useCallback(() => {
    if (statusRef.current !== 'paused') return
    setError(null)
    setInterimText('')

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    clearCommitTimer()

    const oldRec = recognitionRef.current
    recognitionRef.current = null
    cleanupRecognition(oldRec)

    const rec = createRecognition()
    if (!rec) return

    attachListeners(rec)
    recognitionRef.current = rec
    shouldRestartRef.current = true

    setStatus('starting')
    statusRef.current = 'starting'
    clearStartingTimeout()
    startingTimeoutRef.current = setTimeout(() => {
      if (statusRef.current === 'starting') {
        cleanupRecognition(recognitionRef.current)
        recognitionRef.current = null
        setStatus('idle')
        statusRef.current = 'idle'
      }
    }, 5000)

    try {
      rec.start()
      resetSilenceTimer()
    } catch {
      clearStartingTimeout()
      setError(buildError('audio-capture'))
      shouldRestartRef.current = false
      setStatus('idle')
      statusRef.current = 'idle'
      clearSilenceTimer()
    }
  }, [
    createRecognition,
    attachListeners,
    cleanupRecognition,
    resetSilenceTimer,
    clearSilenceTimer,
    clearStartingTimeout,
    clearCommitTimer,
  ])

  const stopRecording = useCallback(() => {
    shouldRestartRef.current = false

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    clearStartingTimeout()
    clearSilenceTimer()
    flushCommit()

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
  }, [stopAudioAnalyser, cleanupRecognition, clearSilenceTimer, clearStartingTimeout, flushCommit])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const setLang = useCallback(
    (newLang: SupportedLang) => {
      setLangState(newLang)
      langRef.current = newLang
      if (statusRef.current === 'recording' || statusRef.current === 'starting') {
        shouldRestartRef.current = false
        if (restartTimerRef.current) {
          clearTimeout(restartTimerRef.current)
          restartTimerRef.current = null
        }
        clearStartingTimeout()
        clearSilenceTimer()
        flushCommit()

        const oldRec = recognitionRef.current
        recognitionRef.current = null
        cleanupRecognition(oldRec)

        restartTimerRef.current = setTimeout(() => {
          const rec = createRecognition()
          if (!rec) return
          attachListeners(rec)
          recognitionRef.current = rec
          shouldRestartRef.current = true
          try {
            rec.start()
            resetSilenceTimer()
          } catch {
            shouldRestartRef.current = false
            setStatus('idle')
            statusRef.current = 'idle'
          }
        }, 300)
      }
    },
    [
      createRecognition,
      attachListeners,
      cleanupRecognition,
      resetSilenceTimer,
      clearSilenceTimer,
      clearStartingTimeout,
      flushCommit,
    ],
  )

  return {
    interimText,
    status,
    isSupported,
    isBrowserWarning,
    isIOSSafari,
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
