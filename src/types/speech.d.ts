// ============================================================
// Type definitions untuk Web Speech API + hook result
// ============================================================

export type RecordingStatus = 'idle' | 'starting' | 'recording' | 'paused' | 'stopping'

export type SpeechErrorCode =
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported'

export interface SpeechError {
  code: SpeechErrorCode | string
  title: string
  message: string
  tip?: string
}

export type SupportedLang = 'id-ID' | 'en-US' | 'en-GB'

/** Options diteruskan ke useSpeechRecognition */
export interface UseSpeechRecognitionOptions {
  /** Dipanggil setiap kali ada pembaruan teks live (interim atau final bertahap) */
  onLiveUpdate?: (text: string) => void
  /** Dipanggil saat live segment harus dicommit menjadi segmen permanen */
  onCommit?: () => void
  /** Dipanggil setiap kali ada final chunk dari speech engine (kompatibilitas mundur) */
  onFinalChunk?: (text: string) => void
  /** Mode dialek: 'standard' (apa adanya) atau 'bekasi' (evaluasi alternatif) */
  dialectMode?: 'standard' | 'bekasi'
}

export interface SpeechRecognitionHookResult {
  interimText: string
  status: RecordingStatus
  isSupported: boolean
  isBrowserWarning: boolean
  isIOSSafari: boolean
  error: SpeechError | null
  lang: SupportedLang
  audioLevel: number
  startRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  clearError: () => void
  setLang: (lang: SupportedLang) => void
}
