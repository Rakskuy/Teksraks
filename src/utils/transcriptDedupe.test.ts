import { describe, it, expect } from 'vitest'
import {
  normalizeText,
  mergeSpeechTranscript,
  dedupeAgainstCommitted,
} from './transcriptDedupe'

describe('transcriptDedupe - Unit Tests', () => {
  // Scenario 1: Normalization
  it('1. normalizes text correctly by trimming, lowercasing, and removing punctuation', () => {
    expect(normalizeText('  Halo, Apa Kabar?!  ')).toBe('halo apa kabar')
    expect(normalizeText('')).toBe('')
  })

  // Scenario 2: Progressive accumulation on Android Chrome
  it('2. merges progressive cumulative Android Chrome chunks into single longest text', () => {
    let current = 'Oke jadi kali'
    current = mergeSpeechTranscript(current, 'Oke jadi kali ini')
    expect(current).toBe('Oke jadi kali ini')

    current = mergeSpeechTranscript(current, 'Oke jadi kali ini gua')
    expect(current).toBe('Oke jadi kali ini gua')

    current = mergeSpeechTranscript(current, 'Oke jadi kali ini gua mau bahas')
    expect(current).toBe('Oke jadi kali ini gua mau bahas')
  })

  // Scenario 3: Identical duplicate events
  it('3. handles identical duplicate events without repeating words', () => {
    const res = mergeSpeechTranscript('Halo selamat pagi', 'Halo selamat pagi')
    expect(res).toBe('Halo selamat pagi')
  })

  // Scenario 4: Browser jitter (incoming is shorter prefix of current)
  it('4. preserves longer existing text when incoming is shorter due to engine jitter', () => {
    const res = mergeSpeechTranscript('Selamat datang di studio transkripsi', 'Selamat datang di studio')
    expect(res).toBe('Selamat datang di studio transkripsi')
  })

  // Scenario 5: Word boundary overlap
  it('5. merges cleanly when there is a partial word overlap between chunks', () => {
    const prev = 'hari ini kita akan membahas tentang'
    const incoming = 'tentang teori perkembangan kognitif'
    const res = mergeSpeechTranscript(prev, incoming)
    expect(res).toBe('hari ini kita akan membahas tentang teori perkembangan kognitif')
  })

  // Scenario 6: Disjoint new phrase in same speaker turn
  it('6. appends disjoint phrases with a clean space', () => {
    const prev = 'Teori ini sangat menarik.'
    const incoming = 'Mari kita lanjutkan ke poin berikutnya.'
    const res = mergeSpeechTranscript(prev, incoming)
    expect(res).toBe('Teori ini sangat menarik. Mari kita lanjutkan ke poin berikutnya.')
  })

  // Scenario 7: Dedupe against already committed segment (exact match)
  it('7. completely filters out text that is identical to already committed segment', () => {
    const committed = 'Halo semua, selamat pagi.'
    const incoming = 'Halo semua, selamat pagi.'
    const remaining = dedupeAgainstCommitted(committed, incoming)
    expect(remaining).toBe('')
  })

  // Scenario 8: Dedupe against committed with new words appended
  it('8. strips committed prefix when incoming contains committed text plus new words', () => {
    const committed = 'Selamat pagi semuanya'
    const incoming = 'Selamat pagi semuanya hari ini kita mulai diskusi'
    const remaining = dedupeAgainstCommitted(committed, incoming)
    expect(remaining).toBe('hari ini kita mulai diskusi')
  })

  // Scenario 9: Dedupe against committed with boundary overlap
  it('9. strips overlapping tail of committed text from head of incoming text', () => {
    const committed = 'Kita sepakat untuk bertemu lagi minggu depan'
    const incoming = 'minggu depan kita evaluasi kembali'
    const remaining = dedupeAgainstCommitted(committed, incoming)
    expect(remaining).toBe('kita evaluasi kembali')
  })

  // Scenario 10: Empty string handling
  it('10. safely handles empty strings in merge and dedupe', () => {
    expect(mergeSpeechTranscript('', 'Teks baru')).toBe('Teks baru')
    expect(mergeSpeechTranscript('Teks lama', '')).toBe('Teks lama')
    expect(dedupeAgainstCommitted('', 'Teks baru')).toBe('Teks baru')
    expect(dedupeAgainstCommitted('Teks lama', '')).toBe('')
  })

  // Scenario 11: Multi-step realistic Android recognition sequence results in 1 segment
  it('11. verifies a 6-step Android cumulative recognition sequence produces exactly 1 coherent sentence', () => {
    const chunks = [
      'Oke',
      'Oke jadi',
      'Oke jadi kali ini',
      'Oke jadi kali ini kita',
      'Oke jadi kali ini kita akan membahas',
      'Oke jadi kali ini kita akan membahas materi psikologi kognitif',
    ]

    let accumulated = ''
    for (const chunk of chunks) {
      accumulated = mergeSpeechTranscript(accumulated, chunk)
    }

    expect(accumulated).toBe('Oke jadi kali ini kita akan membahas materi psikologi kognitif')
  })

  // Scenario 12: Case insensitivity and punctuation resilience during progressive update
  it('12. handles punctuation differences gracefully without duplication', () => {
    const res = mergeSpeechTranscript('Sudah selesai,', 'sudah selesai, sekarang kita istirahat')
    expect(res).toBe('sudah selesai, sekarang kita istirahat')
  })

  // Scenario 13: 1 long sentence with 10 incremental progressive steps produces 1 segment
  it('13. simulates a speaker speaking 1 long sentence in 10 progressive steps, resulting in exactly 1 segment upon commit', () => {
    const progressiveSteps = [
      'Halo',
      'Halo teman-teman',
      'Halo teman-teman selamat siang',
      'Halo teman-teman selamat siang hari ini',
      'Halo teman-teman selamat siang hari ini kita',
      'Halo teman-teman selamat siang hari ini kita akan',
      'Halo teman-teman selamat siang hari ini kita akan membahas',
      'Halo teman-teman selamat siang hari ini kita akan membahas tentang',
      'Halo teman-teman selamat siang hari ini kita akan membahas tentang dinamika',
      'Halo teman-teman selamat siang hari ini kita akan membahas tentang dinamika kelompok',
    ]

    // Simulate liveSegment state
    let liveSegment: { rawText: string; startTime: string } | null = null
    const committedSegments: Array<{ id: string; rawText: string; startTime: string }> = []

    for (const step of progressiveSteps) {
      if (!liveSegment) {
        liveSegment = { rawText: step, startTime: '00:00' }
      } else {
        const curr = liveSegment as { rawText: string; startTime: string }
        liveSegment = {
          rawText: mergeSpeechTranscript(curr.rawText, step),
          startTime: curr.startTime,
        }
      }
    }

    // Simulate commit
    if (liveSegment) {
      committedSegments.push({
        id: 'seg-1',
        rawText: liveSegment.rawText,
        startTime: liveSegment.startTime,
      })
      liveSegment = null
    }

    expect(committedSegments).toHaveLength(1)
    expect(committedSegments[0].rawText).toBe(
      'Halo teman-teman selamat siang hari ini kita akan membahas tentang dinamika kelompok',
    )
    expect(committedSegments[0].startTime).toBe('00:00')
    expect(liveSegment).toBeNull()
  })

  // Scenario 14: Mobile Chrome Android cumulative continuation after intermediate commit
  it('14. prevents stacking on mobile when Chrome Android sends cumulative sentence extending an already committed segment', () => {
    // Suppose segment 1 was committed after a brief pause
    const committedSegments: Array<{ id: string; rawText: string; startTime: string }> = [
      { id: 'seg-1', rawText: 'Oke jadi kali', startTime: '00:00' },
    ]
    let liveSegment: { id: string; rawText: string; startTime: string } | null = null

    // Chrome Android emits cumulative longer text
    const incomingChunks = [
      'Oke jadi kali ini',
      'Oke jadi kali ini saya mau',
      'Oke jadi kali ini saya mau bahas materi',
    ]

    function processIncoming(raw: string) {
      if (liveSegment) {
        liveSegment.rawText = mergeSpeechTranscript(liveSegment.rawText, raw)
        return
      }

      // Check last committed segment
      const last = committedSegments[committedSegments.length - 1]
      if (last && normalizeText(raw).startsWith(normalizeText(last.rawText))) {
        // Re-absorb!
        committedSegments.pop()
        liveSegment = {
          id: last.id,
          startTime: last.startTime,
          rawText: raw,
        }
        return
      }

      liveSegment = { id: 'new', startTime: '00:05', rawText: raw }
    }

    for (const chunk of incomingChunks) {
      processIncoming(chunk)
    }

    // Now commit after 1.5s silence
    if (liveSegment) {
      const seg = liveSegment as { id: string; rawText: string; startTime: string }
      committedSegments.push({ id: seg.id, rawText: seg.rawText, startTime: seg.startTime })
      liveSegment = null
    }

    // Verify: exactly ONE segment was produced, NOT multiple stacked segments!
    expect(committedSegments).toHaveLength(1)
    expect(committedSegments[0].rawText).toBe('Oke jadi kali ini saya mau bahas materi')
    expect(committedSegments[0].startTime).toBe('00:00')
  })
})
