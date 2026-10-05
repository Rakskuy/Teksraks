/**
 * whisperClient.test.ts
 * Unit tests untuk integrasi Whisper API (Groq & OpenAI),
 * penyimpanan lokal API Key, pemetaan respons verbose_json ke Segment,
 * dan penerapan pipeline dialek Bekasi & validasi privasi.
 */

import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import {
  loadWhisperSettings,
  saveWhisperSettings,
  transcribeAudioWithWhisper,
  mapWhisperResponseToSegments,
} from './whisperClient'
import {
  DEFAULT_BEKASI_PROMPT,
  WHISPER_SETTINGS_STORAGE_KEY,
  type WhisperApiResponse,
  type WhisperSettings,
} from '../types/whisper'

// Mock localStorage
const mockStorage = new Map<string, string>()
const localStorageMock = {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, val: string) => {
    mockStorage.set(key, String(val))
  },
  removeItem: (key: string) => {
    mockStorage.delete(key)
  },
  clear: () => {
    mockStorage.clear()
  },
  key: (index: number) => Array.from(mockStorage.keys())[index] ?? null,
  get length() {
    return mockStorage.size
  },
}

beforeAll(() => {
  globalThis.localStorage = localStorageMock as unknown as Storage
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  }
})

beforeEach(() => {
  mockStorage.clear()
  vi.restoreAllMocks()
})

describe('Whisper Client Settings (Local Storage Persistence)', () => {
  it('returns default settings when storage is empty', () => {
    const settings = loadWhisperSettings()
    expect(settings.provider).toBe('groq')
    expect(settings.apiKey).toBe('')
    expect(settings.prompt).toBe(DEFAULT_BEKASI_PROMPT)
    expect(settings.prompt).toContain('Gue kagak tau, lu mau kemane?')
    expect(settings.model).toBe('whisper-large-v3-turbo')
  })

  it('persists and reloads updated settings locally', () => {
    const newSettings: WhisperSettings = {
      provider: 'openai',
      apiKey: 'sk-test-1234567890abcdef',
      model: 'whisper-1',
      prompt: 'Contoh prompt khusus Bekasi.',
      temperature: 0.1,
    }

    saveWhisperSettings(newSettings)
    const stored = JSON.parse(mockStorage.get(WHISPER_SETTINGS_STORAGE_KEY) || '{}')
    expect(stored.apiKey).toBe('sk-test-1234567890abcdef')

    const loaded = loadWhisperSettings()
    expect(loaded.provider).toBe('openai')
    expect(loaded.apiKey).toBe('sk-test-1234567890abcdef')
    expect(loaded.model).toBe('whisper-1')
    expect(loaded.prompt).toBe('Contoh prompt khusus Bekasi.')
    expect(loaded.temperature).toBe(0.1)
  })
})

describe('Whisper Response Mapping to Segments', () => {
  const dummyVerboseResponse: WhisperApiResponse = {
    text: 'saya tidak tahu kamu mau ke mana nanti saya ke sana',
    segments: [
      {
        id: 0,
        start: 1.5,
        end: 4.2,
        text: 'saya tidak tahu kamu mau ke mana',
      },
      {
        id: 1,
        start: 5.0,
        end: 8.5,
        text: 'nanti saya ke sana memang benar begitu',
      },
    ],
  }

  it('correctly maps segments in Standard Mode without dialect transformation', () => {
    const segments = mapWhisperResponseToSegments(dummyVerboseResponse, {
      speakerId: 'sp-1',
      dialectMode: 'standard',
      dialectIntensity: 'medium',
    })

    expect(segments).toHaveLength(2)
    expect(segments[0].speakerId).toBe('sp-1')
    expect(segments[0].startTime).toBe('00:01')
    expect(segments[0].relativeMs).toBe(1500)
    expect(segments[0].rawText).toBe('saya tidak tahu kamu mau ke mana')
    expect(segments[0].displayText).toBe('saya tidak tahu kamu mau ke mana')
    expect(segments[0].dialectChanges).toHaveLength(0)
    expect(segments[0].edited).toBe(false)

    expect(segments[1].startTime).toBe('00:05')
    expect(segments[1].relativeMs).toBe(5000)
  })

  it('correctly transforms segments in Bekasi Dialect Mode and records dialectChanges', () => {
    const segments = mapWhisperResponseToSegments(dummyVerboseResponse, {
      speakerId: 'sp-2',
      dialectMode: 'bekasi',
      dialectIntensity: 'full',
    })

    expect(segments).toHaveLength(2)
    expect(segments[0].speakerId).toBe('sp-2')
    // "saya tidak tahu kamu mau ke mana" -> "gue kagak tau lu mau kemane"
    expect(segments[0].rawText).toBe('saya tidak tahu kamu mau ke mana')
    expect(segments[0].displayText).toContain('gue')
    expect(segments[0].displayText).toContain('kagak')
    expect(segments[0].displayText).toContain('lu')
    expect(segments[0].displayText).toContain('mane')
    expect(segments[0].dialectChanges.length).toBeGreaterThan(0)

    // Second segment: "nanti saya ke sana memang benar begitu" -> "ntar gue ke sana emang bener gitu"
    expect(segments[1].displayText).toContain('ntar')
    expect(segments[1].displayText).toContain('gue')
    expect(segments[1].displayText).toContain('emang')
    expect(segments[1].displayText).toContain('bener')
    expect(segments[1].displayText).toContain('gitu')
  })

  it('handles fallback plain text response when segments array is empty or absent', () => {
    const fallbackResponse: WhisperApiResponse = {
      text: 'Gue kagak tau lu mau kemane. Ntar gue ke sono dah.',
    }

    const segments = mapWhisperResponseToSegments(fallbackResponse, {
      speakerId: 'sp-1',
      dialectMode: 'standard',
      dialectIntensity: 'medium',
    })

    expect(segments.length).toBeGreaterThan(0)
    expect(segments[0].rawText).toBe('Gue kagak tau lu mau kemane.')
    expect(segments[1].rawText).toBe('Ntar gue ke sono dah.')
  })
})

describe('Whisper API Request Validation & Calling', () => {
  it('throws descriptive error if API key is empty', async () => {
    const dummyBlob = new Blob(['dummy audio content'], { type: 'audio/webm' })
    const emptyKeySettings: WhisperSettings = {
      provider: 'groq',
      apiKey: '   ',
      model: 'whisper-large-v3-turbo',
      prompt: DEFAULT_BEKASI_PROMPT,
    }

    await expect(
      transcribeAudioWithWhisper(dummyBlob, emptyKeySettings),
    ).rejects.toThrow('API Key belum diisi')
  })

  it('throws error if audio file size exceeds 25 MB limit', async () => {
    const hugeBlob = {
      size: 26 * 1024 * 1024,
      type: 'audio/mp3',
    } as unknown as Blob

    const settings: WhisperSettings = {
      provider: 'groq',
      apiKey: 'gsk_sample_key',
      model: 'whisper-large-v3-turbo',
      prompt: DEFAULT_BEKASI_PROMPT,
    }

    await expect(transcribeAudioWithWhisper(hugeBlob, settings)).rejects.toThrow(
      'melebihi batas maksimum 25 MB',
    )
  })

  it('sends correct headers, language=id, prompt, and response_format=verbose_json to fetch', async () => {
    const dummyBlob = new Blob(['mock audio bits'], { type: 'audio/wav' })
    const settings: WhisperSettings = {
      provider: 'groq',
      apiKey: 'gsk_test_123',
      model: 'whisper-large-v3-turbo',
      prompt: DEFAULT_BEKASI_PROMPT,
    }

    let capturedUrl = ''
    let capturedHeaders: Record<string, string> = {}
    let capturedBody: FormData | null = null

    const mockFetch = vi.fn().mockImplementation((url, options) => {
      capturedUrl = url
      capturedHeaders = options.headers
      capturedBody = options.body
      return Promise.resolve({
        ok: true,
        json: async () => ({
          text: 'halo tes audio berhasil',
          segments: [{ id: 0, start: 0.0, end: 2.0, text: 'halo tes audio berhasil' }],
        }),
      })
    })

    globalThis.fetch = mockFetch

    const result = await transcribeAudioWithWhisper(dummyBlob, settings)

    expect(capturedUrl).toContain('https://api.groq.com/openai/v1/audio/transcriptions')
    expect(capturedHeaders.Authorization).toBe('Bearer gsk_test_123')
    expect(capturedBody).toBeInstanceOf(FormData)
    const formData = capturedBody as unknown as FormData
    expect(formData.get('language')).toBe('id')
    expect(formData.get('response_format')).toBe('verbose_json')
    expect(formData.get('prompt')).toBe(DEFAULT_BEKASI_PROMPT)
    expect(result.text).toBe('halo tes audio berhasil')
    expect(result.segments).toHaveLength(1)
  })

  it('maps HTTP 401 error correctly with advice to check API key', async () => {
    const dummyBlob = new Blob(['mock audio'], { type: 'audio/mp3' })
    const settings: WhisperSettings = {
      provider: 'openai',
      apiKey: 'invalid_key',
      model: 'whisper-1',
      prompt: DEFAULT_BEKASI_PROMPT,
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: { message: 'Incorrect API key provided' } }),
    })
    globalThis.fetch = mockFetch

    await expect(transcribeAudioWithWhisper(dummyBlob, settings)).rejects.toThrow(
      'API Key OPENAI tidak valid atau otorisasi ditolak (401)',
    )
  })

  it('maps HTTP 429 error correctly with rate limit notification', async () => {
    const dummyBlob = new Blob(['mock audio'], { type: 'audio/mp3' })
    const settings: WhisperSettings = {
      provider: 'groq',
      apiKey: 'valid_key_exceeded',
      model: 'whisper-large-v3-turbo',
      prompt: DEFAULT_BEKASI_PROMPT,
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({ error: { message: 'Rate limit reached' } }),
    })
    globalThis.fetch = mockFetch

    await expect(transcribeAudioWithWhisper(dummyBlob, settings)).rejects.toThrow(
      'Batas kuota atau frekuensi pemanggilan API GROQ telah terlampaui (429 Rate Limit/Quota)',
    )
  })
})
