/**
 * whisperClient.ts
 * Utilitas komunikasi API Whisper (Groq & OpenAI) untuk transkripsi audio.
 * Menyimpan pengaturan dan API Key HANYA secara lokal di perangkat pengguna.
 */

import {
  type WhisperProvider,
  type WhisperSettings,
  type WhisperApiResponse,
  DEFAULT_BEKASI_PROMPT,
  WHISPER_SETTINGS_STORAGE_KEY,
  DEFAULT_WHISPER_SETTINGS,
} from '../types/whisper'
import { applyBekasi, type DialectMode, type DialectIntensity } from '../dialect'
import type { Segment } from '../types/session'

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
    if (typeof localStorage !== 'undefined') return localStorage
  } catch {
    // Abaikan jika storage akses dibatasi
  }
  return null
}

/**
 * Memuat pengaturan Whisper dari localStorage
 */
export function loadWhisperSettings(): WhisperSettings {
  try {
    const storage = getStorage()
    const raw = storage ? storage.getItem(WHISPER_SETTINGS_STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WhisperSettings>
      const provider: WhisperProvider = parsed.provider === 'openai' ? 'openai' : 'groq'
      return {
        provider,
        apiKey: parsed.apiKey || '',
        model: parsed.model || DEFAULT_WHISPER_SETTINGS[provider].model,
        prompt: parsed.prompt || DEFAULT_BEKASI_PROMPT,
        temperature: typeof parsed.temperature === 'number' ? parsed.temperature : 0.2,
      }
    }
  } catch {
    // Abaikan jika localStorage tidak tersedia atau corrupt
  }

  return {
    provider: 'groq',
    apiKey: '',
    model: DEFAULT_WHISPER_SETTINGS.groq.model,
    prompt: DEFAULT_BEKASI_PROMPT,
    temperature: 0.2,
  }
}

/**
 * Menyimpan pengaturan Whisper ke localStorage (hanya di perangkat pengguna)
 */
export function saveWhisperSettings(settings: WhisperSettings): void {
  try {
    const storage = getStorage()
    if (storage) {
      storage.setItem(WHISPER_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    }
  } catch {
    // Abaikan jika storage penuh
  }
}

/**
 * Format detik ke string penanda waktu "mm:ss" atau "hh:mm:ss"
 */
function formatSecondsToTimestamp(sec: number): string {
  const totalSeconds = Math.max(0, Math.floor(sec))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

/**
 * Mengirim berkas audio ke API OpenAI atau Groq Whisper
 */
export async function transcribeAudioWithWhisper(
  audioFile: Blob | File,
  settings: WhisperSettings,
  onProgress?: (message: string) => void,
): Promise<WhisperApiResponse> {
  if (!settings.apiKey.trim()) {
    throw new Error('API Key belum diisi. Silakan masukkan API Key Anda di pengaturan Whisper.')
  }

  // Cek batas ukuran 25MB standar API Whisper
  const maxBytes = 25 * 1024 * 1024
  if (audioFile.size > maxBytes) {
    const sizeMb = (audioFile.size / (1024 * 1024)).toFixed(1)
    throw new Error(
      `Ukuran berkas audio (${sizeMb} MB) melebihi batas maksimum 25 MB API Whisper. Silakan kompres atau potong berkas terlebih dahulu.`,
    )
  }

  const endpoint = DEFAULT_WHISPER_SETTINGS[settings.provider].defaultEndpoint
  const model = settings.model || DEFAULT_WHISPER_SETTINGS[settings.provider].model

  onProgress?.(`Menyiapkan data audio untuk dikirim ke ${settings.provider.toUpperCase()}...`)

  // Siapkan file multipart/form-data
  const formData = new FormData()

  // Berikan ekstensi dan nama file yang valid jika berupa Blob
  let fileToSend: File | Blob = audioFile
  if (!(audioFile instanceof File)) {
    const mime = audioFile.type || 'audio/webm'
    const ext = mime.includes('webm') ? 'webm' : mime.includes('mp4') ? 'mp4' : mime.includes('ogg') ? 'ogg' : 'wav'
    fileToSend = new File([audioFile], `audio-recording-${Date.now()}.${ext}`, { type: mime })
  }
  formData.append('file', fileToSend)
  formData.append('model', model)
  formData.append('language', 'id') // Parameter bahasa Indonesia sesuai spesifikasi
  formData.append('response_format', 'verbose_json') // Format verbose_json untuk segmentasi waktu

  if (settings.prompt && settings.prompt.trim()) {
    formData.append('prompt', settings.prompt.trim()) // Prompt gaya bicara Bekasi
  }

  if (typeof settings.temperature === 'number') {
    formData.append('temperature', String(settings.temperature))
  }

  onProgress?.(`Mengunggah berkas audio ke server ${settings.provider.toUpperCase()}...`)

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.apiKey.trim()}`,
      },
      body: formData,
    })
  } catch (netErr) {
    throw new Error(
      `Gagal menghubungi server ${settings.provider.toUpperCase()}. Periksa koneksi internet Anda atau pastikan browser tidak memblokir permintaan lintas domain (CORS). Detail: ${
        netErr instanceof Error ? netErr.message : 'Network Error'
      }`,
    )
  }

  if (!response.ok) {
    let errorDetail = ''
    try {
      const errJson = (await response.json()) as { error?: { message?: string } }
      errorDetail = errJson?.error?.message || ''
    } catch {
      // Gagal parse JSON error
    }

    if (response.status === 401) {
      throw new Error(
        `API Key ${settings.provider.toUpperCase()} tidak valid atau otorisasi ditolak (401). Periksa kembali API Key Anda di pengaturan. ${errorDetail}`,
      )
    }

    if (response.status === 429) {
      throw new Error(
        `Batas kuota atau frekuensi pemanggilan API ${settings.provider.toUpperCase()} telah terlampaui (429 Rate Limit/Quota). Silakan periksa saldo akun Anda atau coba beberapa saat lagi. ${errorDetail}`,
      )
    }

    if (response.status === 413) {
      throw new Error(
        `Ukuran audio terlalu besar untuk diproses oleh server ${settings.provider.toUpperCase()} (413 Payload Too Large).`,
      )
    }

    throw new Error(
      `Permintaan transkripsi gagal dengan status ${response.status} (${response.statusText}). ${errorDetail}`,
    )
  }

  onProgress?.('Menerima hasil transkripsi...')
  const data = (await response.json()) as WhisperApiResponse
  return data
}

/**
 * Mengubah hasil respons Whisper API menjadi format Segment aplikasi,
 * lengkap dengan mapping logat Bekasi jika mode logat aktif.
 */
export function mapWhisperResponseToSegments(
  whisperData: WhisperApiResponse,
  options: {
    speakerId: string
    dialectMode: DialectMode
    dialectIntensity: DialectIntensity
  },
): Segment[] {
  const { speakerId, dialectMode, dialectIntensity } = options
  const results: Segment[] = []

  // Jika Whisper mengembalikan array segments dengan timestamp
  if (Array.isArray(whisperData.segments) && whisperData.segments.length > 0) {
    for (const item of whisperData.segments) {
      const rawText = item.text.trim()
      if (!rawText) continue

      const startTime = formatSecondsToTimestamp(item.start)
      const relativeMs = Math.round(item.start * 1000)

      let displayText = rawText
      let dialectChanges: Segment['dialectChanges'] = []

      if (dialectMode === 'bekasi') {
        const transformed = applyBekasi(rawText, { intensity: dialectIntensity })
        displayText = transformed.displayText
        dialectChanges = transformed.changes
      }

      const id = `whisper-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      results.push({
        id,
        speakerId,
        startTime,
        rawText,
        displayText,
        dialectChanges,
        edited: false,
        text: displayText,
        timestamp: startTime,
        relativeMs,
      })
    }
  } else if (whisperData.text && whisperData.text.trim()) {
    // Fallback: Jika response_format hanya berupa teks tunggal tanpa array segments,
    // pecah menjadi segmen-segmen per kalimat
    const rawParagraph = whisperData.text.trim()
    const sentenceChunks = rawParagraph.split(/(?<=[.?!])\s+/).filter(Boolean)

    let currentSec = 0
    for (const chunk of sentenceChunks) {
      const rawText = chunk.trim()
      if (!rawText) continue

      const startTime = formatSecondsToTimestamp(currentSec)
      const relativeMs = currentSec * 1000

      let displayText = rawText
      let dialectChanges: Segment['dialectChanges'] = []

      if (dialectMode === 'bekasi') {
        const transformed = applyBekasi(rawText, { intensity: dialectIntensity })
        displayText = transformed.displayText
        dialectChanges = transformed.changes
      }

      const id = `whisper-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      results.push({
        id,
        speakerId,
        startTime,
        rawText,
        displayText,
        dialectChanges,
        edited: false,
        text: displayText,
        timestamp: startTime,
        relativeMs,
      })

      // Estimasi durasi per kalimat sekitar 3-5 detik untuk penanda waktu berikutnya
      currentSec += Math.max(3, Math.round(rawText.split(/\s+/).length * 0.4))
    }
  }

  return results
}
