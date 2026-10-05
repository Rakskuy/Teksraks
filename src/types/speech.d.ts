// ============================================================
// Type definitions untuk Web Speech API + hook result
// ============================================================

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopping'

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
  /** Dipanggil setiap kali ada final chunk dari speech engine */
  onFinalChunk?: (text: string) => void
}

export interface SpeechRecognitionHookResult {
  interimText: string
  status: RecordingStatus
  isSupported: boolean
  isBrowserWarning: boolean
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
