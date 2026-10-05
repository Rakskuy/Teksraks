/**
 * alternativeSelector.ts
 * Logika pemilihan alternatif pengenalan suara (Speech Recognition Alternatives)
 * berdasarkan confidence mesin dan bobot leksikon logat Bekasi.
 */

import { BEKASI_LEXICON } from './bekasiLexicon';
import { PHONOLOGICAL_A_TO_E_WHITELIST } from './rules';

export interface SpeechAlternativeItem {
  transcript: string;
  confidence?: number;
}

export interface AlternativeScoreResult {
  selectedTranscript: string;
  selectedIndex: number;
  confidence: number;
  score: number;
  bonus: number;
  containsDialectWord: boolean;
  hasHighConfidenceDialectWord: boolean;
}

// ── Konstanta Pembobotan ─────────────────────────────────────────────────────
export const BEKASI_BONUS_PER_WORD = 0.08;
export const MAX_BEKASI_BONUS = 0.32;
export const MAX_CONFIDENCE_DIFF_THRESHOLD = 0.25;

// Himpunan kata Bekasi sisi `bekasi` untuk pencarian O(1)
const BEKASI_TARGET_WORDS = new Set<string>();
const HIGH_CONFIDENCE_BEKASI_WORDS = new Set<string>();

for (const entry of BEKASI_LEXICON) {
  const bekasiLower = entry.bekasi.toLowerCase();
  BEKASI_TARGET_WORDS.add(bekasiLower);
  if (entry.confidence === 'high') {
    HIGH_CONFIDENCE_BEKASI_WORDS.add(bekasiLower);
  }
}

// Tambahkan kata hasil whitelist fonologis ke target kata
for (const target of Object.values(PHONOLOGICAL_A_TO_E_WHITELIST)) {
  BEKASI_TARGET_WORDS.add(target.toLowerCase());
  HIGH_CONFIDENCE_BEKASI_WORDS.add(target.toLowerCase());
}

/**
 * Menghitung kecocokan kata dialek Bekasi pada sebuah transkrip
 */
export function analyzeDialectWords(transcript: string): {
  count: number;
  hasHighConfidence: boolean;
  matchedWords: string[];
} {
  const tokens = transcript.toLowerCase().match(/\b[a-zA-Z\u00C0-\u024F]+(?:-[a-zA-Z\u00C0-\u024F]+)*\b/g) || [];
  let count = 0;
  let hasHighConfidence = false;
  const matchedWords: string[] = [];

  for (const token of tokens) {
    if (BEKASI_TARGET_WORDS.has(token)) {
      count++;
      matchedWords.push(token);
      if (HIGH_CONFIDENCE_BEKASI_WORDS.has(token)) {
        hasHighConfidence = true;
      }
    }
  }

  return { count, hasHighConfidence, matchedWords };
}

/**
 * Memilih alternatif terbaik dari daftar maxAlternatives SpeechRecognition.
 *
 * Aturan Pemilihan:
 * 1. Skor = confidence mesin + bonus kata dialek Bekasi
 * 2. Alternatif dengan skor tertinggi dipilih
 * 3. JANGAN pilih alternatif jika selisih confidence-nya > 0.25 di bawah alternatif utama (indeks 0),
 *    KECUALI alternatif tersebut memuat kata logat ber-confidence high.
 */
export function selectBestAlternative(
  alternatives: SpeechAlternativeItem[]
): AlternativeScoreResult {
  if (!alternatives || alternatives.length === 0) {
    return {
      selectedTranscript: '',
      selectedIndex: 0,
      confidence: 0,
      score: 0,
      bonus: 0,
      containsDialectWord: false,
      hasHighConfidenceDialectWord: false
    };
  }

  // Batasi pool hingga maksimal 5 alternatif (maxAlternatives = 5)
  const pool = alternatives.slice(0, 5);

  if (pool.length === 1) {
    const single = pool[0];
    const conf = single.confidence ?? 0.85;
    const { count, hasHighConfidence } = analyzeDialectWords(single.transcript);
    const bonus = Math.min(count * BEKASI_BONUS_PER_WORD, MAX_BEKASI_BONUS);
    return {
      selectedTranscript: single.transcript,
      selectedIndex: 0,
      confidence: conf,
      score: conf + bonus,
      bonus,
      containsDialectWord: bonus > 0,
      hasHighConfidenceDialectWord: hasHighConfidence
    };
  }

  // Alternatif utama mesin (indeks 0)
  const primaryAlt = pool[0];
  const primaryConfidence = primaryAlt.confidence ?? 0.85;

  let bestIndex = 0;
  let bestScore = -1;
  let bestConfidence = primaryConfidence;
  let bestBonus = 0;
  let bestHasHigh = false;

  for (let i = 0; i < pool.length; i++) {
    const alt = pool[i];
    const conf = alt.confidence ?? (primaryConfidence - i * 0.05);
    const { count, hasHighConfidence } = analyzeDialectWords(alt.transcript);
    const bonus = Math.min(count * BEKASI_BONUS_PER_WORD, MAX_BEKASI_BONUS);
    const score = conf + bonus;

    // Evaluasi aturan selisih confidence > 0.25 di bawah alternatif utama
    const diff = primaryConfidence - conf;
    const isTooLow = diff > MAX_CONFIDENCE_DIFF_THRESHOLD;

    if (isTooLow && !hasHighConfidence) {
      // Abaikan alternatif ini karena confidence terlalu anjlok tanpa adanya kata logat high
      continue;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
      bestConfidence = conf;
      bestBonus = bonus;
      bestHasHigh = hasHighConfidence;
    }
  }

  return {
    selectedTranscript: pool[bestIndex].transcript,
    selectedIndex: bestIndex,
    confidence: bestConfidence,
    score: bestScore,
    bonus: bestBonus,
    containsDialectWord: bestBonus > 0,
    hasHighConfidenceDialectWord: bestHasHigh
  };
}
