import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import {
  selectBestAlternative,
  applyBekasi,
  loadPersonalDictionary,
  addOrUpdatePersonalWord,
  deletePersonalWord,
  addPersonalException,
  deletePersonalException,
  importPersonalDictionaryJson,
  exportPersonalDictionaryJson,
} from './index'

// Mock localStorage for headless environment (node / vitest)
const mockStorage = new Map<string, string>()
const localStorageMock = {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, val: string) => { mockStorage.set(key, String(val)) },
  removeItem: (key: string) => { mockStorage.delete(key) },
  clear: () => { mockStorage.clear() },
  key: (index: number) => Array.from(mockStorage.keys())[index] ?? null,
  get length() { return mockStorage.size },
}

beforeAll(() => {
  if (typeof window === 'undefined') {
    // @ts-expect-error Mocking window in node
    globalThis.window = { localStorage: localStorageMock }
  } else {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  }
})

describe('Speech Alternative Selector (maxAlternatives & confidence scoring)', () => {
  it('selects alternative with highest dialect bonus when confidence is close', () => {
    const alternatives = [
      { transcript: 'saya tidak mau', confidence: 0.90 },
      { transcript: 'saya kagak mau', confidence: 0.88 }, // contains 'kagak' (+0.08) -> 0.96
    ]
    const best = selectBestAlternative(alternatives)
    expect(best.selectedTranscript).toBe('saya kagak mau')
    expect(best.score).toBeGreaterThan(0.90)
    expect(best.containsDialectWord).toBe(true)
  })

  it('rejects alternative if confidence drop > 0.25 without high-confidence dialect word', () => {
    const alternatives = [
      { transcript: 'bagaimana kabarmu', confidence: 0.95 },
      // confidence is 0.65 (drop of 0.30 > 0.25). Even if it has medium-confidence dialect word, margin guard prevents it
      { transcript: 'gimana kabarmu', confidence: 0.65 },
    ]
    const best = selectBestAlternative(alternatives)
    // 0.95 - 0.65 = 0.30 (> 0.25 threshold)
    // If not high confidence dialect, fallback to base
    expect(best.selectedTranscript).toBe('bagaimana kabarmu')
  })

  it('allows alternative with drop > 0.25 ONLY IF it contains high-confidence dialect word', () => {
    // Alt 0: confidence = 0.55, score = 0.55
    // Alt 1: confidence = 0.28 (drop = 0.27 > 0.25 threshold)
    // Alt 1 contains 4 high-confidence dialect words ('gue', 'kagak', 'ape', 'die') -> bonus = 0.32 -> score = 0.60 > 0.55
    const altsExceedingDrop = [
      { transcript: 'saya pergi', confidence: 0.55 },
      { transcript: 'gue kagak ape die', confidence: 0.28 },
    ]
    const best = selectBestAlternative(altsExceedingDrop)
    expect(best.selectedTranscript).toBe('gue kagak ape die')
    expect(best.hasHighConfidenceDialectWord).toBe(true)
  })

  it('caps pool strictly at 5 alternatives (maxAlternatives = 5)', () => {
    const alternatives = [
      { transcript: 'alt 1', confidence: 0.80 },
      { transcript: 'alt 2', confidence: 0.81 },
      { transcript: 'alt 3 kagak', confidence: 0.82 },
      { transcript: 'alt 4', confidence: 0.79 },
      { transcript: 'alt 5', confidence: 0.75 },
      { transcript: 'alt 6 kagak', confidence: 0.99 }, // 6th alternative should be ignored by slice(0, 5)
    ]
    const best = selectBestAlternative(alternatives)
    // alt 3 kagak (score 0.82 + 0.08 = 0.90) wins among pool of 5
    expect(best.selectedTranscript).toBe('alt 3 kagak')
  })
})

describe('Personal Dictionary (CRUD, LocalStorage, Top Priority)', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('adds and saves custom word pair with higher priority than default lexicon', () => {
    // Default lexicon: "kamu" -> "lu"
    // Personal dictionary overrides: "kamu" -> "ente"
    addOrUpdatePersonalWord('kamu', 'ente')
    const dict = loadPersonalDictionary()
    expect(dict.entries[0].standard).toBe('kamu')
    expect(dict.entries[0].bekasi).toBe('ente')

    // Apply bekasi should use personal dictionary
    const res = applyBekasi('kamu mau ke mana', { intensity: 'light' })
    expect(res.displayText).toContain('ente')
    expect(res.displayText).not.toContain('lu')
  })

  it('adds personal exception and prevents conversion', () => {
    // Default: "apa" -> "ape"
    // Add "apa" as personal exception
    addPersonalException('apa')
    const res = applyBekasi('apa yang terjadi', { intensity: 'full' })
    expect(res.displayText).toMatch(/^apa\b/)
  })

  it('removes custom word and custom exception', () => {
    const entry = addOrUpdatePersonalWord('makan', 'madang')
    expect(loadPersonalDictionary().entries.length).toBe(1)
    deletePersonalWord(entry.id)
    expect(loadPersonalDictionary().entries.length).toBe(0)

    addPersonalException('kemarin')
    expect(loadPersonalDictionary().exceptions.length).toBe(1)
    deletePersonalException('kemarin')
    expect(loadPersonalDictionary().exceptions.length).toBe(0)
  })

  it('exports and imports valid JSON correctly', () => {
    addOrUpdatePersonalWord('teman', 'sobat')
    addPersonalException('khusus')

    const jsonString = exportPersonalDictionaryJson()
    localStorageMock.clear()
    expect(loadPersonalDictionary().entries.length).toBe(0)

    const res = importPersonalDictionaryJson(jsonString)
    expect(res.success).toBe(true)

    const restored = loadPersonalDictionary()
    expect(restored.entries[0].standard).toBe('teman')
    expect(restored.entries[0].bekasi).toBe('sobat')
    expect(restored.exceptions).toContain('khusus')
  })

  it('rejects invalid JSON safely without crashing', () => {
    const res = importPersonalDictionaryJson('invalid-json{{{')
    expect(res.success).toBe(false)
  })
})

describe('Dialect Changes Tracking and Reversion', () => {
  it('tracks dialectChanges accurately with original and replacement', () => {
    const text = 'saya tidak tahu kenapa dia pergi'
    const res = applyBekasi(text, { intensity: 'medium' })
    expect(res.changes.length).toBeGreaterThan(0)

    const replacementWords = res.changes.map(c => c.replacement.toLowerCase())
    expect(replacementWords).toContain('kagak')
    expect(replacementWords).toContain('die')
  })

  it('simulates word-level reversion in segment displayText', () => {
    const segment = {
      id: 'seg-1',
      speakerId: 'sp-1',
      startTime: '00:01',
      rawText: 'saya tidak mau',
      displayText: 'saya kagak mau',
      dialectChanges: [{ original: 'tidak', replacement: 'kagak', index: 5, rule: 'lexicon' }],
      edited: false,
    }

    // Word revert: targetReplacement 'kagak' -> targetOriginal 'tidak'
    const regex = new RegExp(`\\b${'kagak'}\\b`, 'gi')
    const updatedDisplay = segment.displayText.replace(regex, 'tidak')
    const remainingChanges = segment.dialectChanges.filter(
      c => c.replacement.toLowerCase() !== 'kagak'.toLowerCase(),
    )

    expect(updatedDisplay).toBe('saya tidak mau')
    expect(remainingChanges).toHaveLength(0)
  })

  it('ensures manual edit flag preserves segment during reapply', () => {
    const segments = [
      {
        id: '1',
        speakerId: 'sp1',
        startTime: '00:01',
        rawText: 'apa kabar kamu',
        displayText: 'Sudah saya sunting secara manual untuk laporan',
        dialectChanges: [],
        edited: true, // MANUALLY EDITED
      },
      {
        id: '2',
        speakerId: 'sp1',
        startTime: '00:05',
        rawText: 'apa kabar kamu',
        displayText: 'ape kabar lu',
        dialectChanges: [],
        edited: false, // NOT EDITED
      },
    ]

    // Simulate reapply to unedited
    const updated = segments.map(s => {
      if (s.edited) return s // PRESERVED
      const res = applyBekasi(s.rawText, { intensity: 'light' })
      return {
        ...s,
        displayText: res.displayText,
        dialectChanges: res.changes,
      }
    })

    expect(updated[0].displayText).toBe('Sudah saya sunting secara manual untuk laporan')
    expect(updated[0].edited).toBe(true)
    expect(updated[1].displayText).toContain('lu')
  })
})
