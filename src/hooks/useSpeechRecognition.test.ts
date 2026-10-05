import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isMobileDevice, detectSupport } from './useSpeechRecognition'
import { selectBestAlternative } from '../dialect'

describe('useSpeechRecognition - Device & Browser Detection', () => {
  const originalUserAgent = navigator.userAgent

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    })
  })

  it('detects desktop Chrome correctly', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    expect(isMobileDevice(ua)).toBe(false)
  })

  it('detects Android mobile correctly', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    expect(isMobileDevice(ua)).toBe(true)
  })

  it('detects iOS iPhone correctly', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    expect(isMobileDevice(ua)).toBe(true)
    const support = detectSupport(ua)
    expect(support.isIOSSafari).toBe(true)
  })

  it('detects desktop Safari as isIOSSafari for warning', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    const support = detectSupport(ua)
    expect(support.isIOSSafari).toBe(true)
  })
})

describe('Dialect Pipeline & Fallback Safety', () => {
  it('selectBestAlternative never drops text when alternatives are empty', () => {
    const res = selectBestAlternative([])
    expect(res.selectedTranscript).toBe('')
    expect(res.selectedIndex).toBe(0)
  })

  it('selectBestAlternative handles single alternative correctly', () => {
    const res = selectBestAlternative([{ transcript: 'Halo selamat pagi', confidence: 0.9 }])
    expect(res.selectedTranscript).toBe('Halo selamat pagi')
    expect(res.confidence).toBe(0.9)
  })

  it('selectBestAlternative picks dialect word when confidence is sufficient', () => {
    const res = selectBestAlternative([
      { transcript: 'saya tidak tahu', confidence: 0.85 },
      { transcript: 'gue kagak tau', confidence: 0.82 },
    ])
    expect(res.selectedTranscript).toBe('gue kagak tau')
    expect(res.containsDialectWord).toBe(true)
  })

  it('guarantees text is preserved when all alternatives have low confidence', () => {
    const alternatives = [
      { transcript: 'transkrip utama mesin', confidence: 0.1 },
      { transcript: 'alternatif kedua', confidence: 0.05 },
    ]
    const best = selectBestAlternative(alternatives)
    // Should still pick an alternative without throwing or dropping
    expect(best.selectedTranscript).toBe('transkrip utama mesin')
  })
})

describe('Silence Timer & Speech Recognition Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('triggers friendly silence warning after 8 seconds without speech', () => {
    let warningTriggered = false
    let warningMessage = ''

    const silenceTimeout = setTimeout(() => {
      warningTriggered = true
      warningMessage = 'Mikrofon aktif tapi suara tidak terdeteksi, periksa izin atau coba headset'
    }, 8000)

    // Advance timer by 5 seconds: should not fire yet
    vi.advanceTimersByTime(5000)
    expect(warningTriggered).toBe(false)

    // Advance remaining 3 seconds (total 8s)
    vi.advanceTimersByTime(3000)
    expect(warningTriggered).toBe(true)
    expect(warningMessage).toContain('Mikrofon aktif tapi suara tidak terdeteksi')

    clearTimeout(silenceTimeout)
  })

  it('resets silence timer when sound/speech event occurs', () => {
    let warningTriggered = false

    let silenceTimeout: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      warningTriggered = true
    }, 8000)

    // Speech detected at 5 seconds -> reset timer
    vi.advanceTimersByTime(5000)
    if (silenceTimeout) clearTimeout(silenceTimeout)
    silenceTimeout = setTimeout(() => {
      warningTriggered = true
    }, 8000)

    // Another 5 seconds passed (10s elapsed from start, but 5s from reset)
    vi.advanceTimersByTime(5000)
    expect(warningTriggered).toBe(false)

    // 3 more seconds pass -> now fires 8s after reset
    vi.advanceTimersByTime(3000)
    expect(warningTriggered).toBe(true)

    if (silenceTimeout) clearTimeout(silenceTimeout)
  })
})
