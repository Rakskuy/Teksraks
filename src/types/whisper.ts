/**
 * whisper.ts
 * Tipe data untuk integrasi mesin kedua Speech-to-Text: OpenAI / Groq Whisper API
 */

export type WhisperProvider = 'groq' | 'openai'

export interface WhisperSettings {
  provider: WhisperProvider
  apiKey: string
  model: string
  prompt: string
  temperature?: number
}

export interface WhisperSegmentItem {
  id: number
  seek?: number
  start: number // detik, misal 1.25
  end: number   // detik, misal 4.50
  text: string
  tokens?: number[]
  temperature?: number
  avg_logprob?: number
  compression_ratio?: number
  no_speech_prob?: number
}

export interface WhisperApiResponse {
  text: string
  task?: string
  language?: string
  duration?: number
  segments?: WhisperSegmentItem[]
}

export interface WhisperProcessingState {
  status: 'idle' | 'preparing' | 'uploading' | 'processing' | 'converting-dialect' | 'success' | 'error'
  progressMessage: string
  errorMessage?: string
}

export const DEFAULT_BEKASI_PROMPT =
  'Gue kagak tau, lu mau kemane? Ntar gue ke sono dah, emang bener sih.'

export const WHISPER_SETTINGS_STORAGE_KEY = 'psikologi-stt-whisper-settings'

export const DEFAULT_WHISPER_SETTINGS: Record<WhisperProvider, { model: string; defaultEndpoint: string }> = {
  groq: {
    model: 'whisper-large-v3-turbo',
    defaultEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
  },
  openai: {
    model: 'whisper-1',
    defaultEndpoint: 'https://api.openai.com/v1/audio/transcriptions',
  },
}
