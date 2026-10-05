/**
 * Kamus Pemetaan Kata Baku -> Logat Bekasi / Betawi Ora
 * Setiap entri memiliki level kepercayaan (confidence), kategori kata, dan flag risiko (risky).
 */

export type DialectMode = 'standard' | 'bekasi';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type LexiconCategory =
  | 'pronoun'   // Kata ganti orang (aku, kamu, dia, kita)
  | 'negation'  // Negasi (tidak, bukan)
  | 'particle'  // Partikel & kata tugas (saja, cuma, memang, yang, pada)
  | 'adverb'    // Keterangan (sekali, begini, begitu, sedang, nanti)
  | 'question'  // Kata tanya (apa, mana, kenapa, bagaimana)
  | 'family'    // Istilah kekerabatan (ibu, bapak)
  | 'general';  // Kosakata umum (uang, bohong, benar, sudah)

export interface LexiconEntry {
  standard: string;
  bekasi: string;
  confidence: ConfidenceLevel;
  risky: boolean;
  category: LexiconCategory;
  note?: string;
}

export const BEKASI_LEXICON: LexiconEntry[] = [
  // --- KATA GANTI (PRONOUN) ---
  {
    standard: 'aku',
    bekasi: 'gue',
    confidence: 'high',
    risky: false,
    category: 'pronoun',
    note: 'Kata ganti orang pertama informal khas Bekasi/Jabodetabek'
  },
  {
    standard: 'saya',
    bekasi: 'gue',
    confidence: 'high',
    risky: false,
    category: 'pronoun',
    note: 'Dalam konteks santai diubah menjadi gue'
  },
  {
    standard: 'kamu',
    bekasi: 'lu',
    confidence: 'high',
    risky: false,
    category: 'pronoun',
    note: 'Kata ganti orang kedua akrab'
  },
  {
    standard: 'dia',
    bekasi: 'die',
    confidence: 'high',
    risky: false,
    category: 'pronoun',
    note: 'Pergeseran vokal a -> e terbuka'
  },
  {
    standard: 'kita',
    bekasi: 'kite',
    confidence: 'high',
    risky: false,
    category: 'pronoun',
    note: 'Pergeseran vokal a -> e'
  },

  // --- KATA TANYA (QUESTION) ---
  {
    standard: 'apa',
    bekasi: 'ape',
    confidence: 'high',
    risky: false,
    category: 'question'
  },
  {
    standard: 'mana',
    bekasi: 'mane',
    confidence: 'high',
    risky: false,
    category: 'question'
  },
  {
    standard: 'kenapa',
    bekasi: 'kenape',
    confidence: 'high',
    risky: false,
    category: 'question'
  },
  {
    standard: 'bagaimana',
    bekasi: 'gimane',
    confidence: 'medium',
    risky: false,
    category: 'question',
    note: 'Bentuk ringkas dialek gimane / gimana'
  },
  {
    standard: 'gimana',
    bekasi: 'gimane',
    confidence: 'medium',
    risky: false,
    category: 'question'
  },

  // --- NEGASI (NEGATION) ---
  {
    standard: 'tidak',
    bekasi: 'kagak',
    confidence: 'high',
    risky: false,
    category: 'negation',
    note: 'Negasi khas Betawi/Bekasi Ora'
  },
  {
    standard: 'nggak',
    bekasi: 'kagak',
    confidence: 'medium',
    risky: false,
    category: 'negation'
  },
  {
    standard: 'tak',
    bekasi: 'kagak',
    confidence: 'medium',
    risky: false,
    category: 'negation'
  },

  // --- PARTIKEL & KATA TUGAS (PARTICLE) ---
  {
    standard: 'saja',
    bekasi: 'aje',
    confidence: 'high',
    risky: false,
    category: 'particle'
  },
  {
    standard: 'cuma',
    bekasi: 'doang',
    confidence: 'high',
    risky: false,
    category: 'particle'
  },
  {
    standard: 'hanya',
    bekasi: 'cuma',
    confidence: 'medium',
    risky: false,
    category: 'particle'
  },
  {
    standard: 'memang',
    bekasi: 'emang',
    confidence: 'high',
    risky: false,
    category: 'particle'
  },
  {
    standard: 'pada',
    bekasi: 'pade',
    confidence: 'medium',
    risky: false,
    category: 'particle'
  },
  {
    standard: 'yang',
    bekasi: 'nyang',
    confidence: 'low',
    risky: true,
    category: 'particle',
    note: 'Hanya aktif pada intensitas Penuh karena dapat mengubah ritme teks formal'
  },

  // --- KETERANGAN (ADVERB) ---
  {
    standard: 'sekali',
    bekasi: 'banget',
    confidence: 'high',
    risky: false,
    category: 'adverb'
  },
  {
    standard: 'begitu',
    bekasi: 'gitu',
    confidence: 'high',
    risky: false,
    category: 'adverb'
  },
  {
    standard: 'begini',
    bekasi: 'gini',
    confidence: 'high',
    risky: false,
    category: 'adverb'
  },
  {
    standard: 'sedang',
    bekasi: 'lagi',
    confidence: 'high',
    risky: false,
    category: 'adverb'
  },
  {
    standard: 'nanti',
    bekasi: 'ntar',
    confidence: 'high',
    risky: false,
    category: 'adverb'
  },

  // --- KOSAKATA UMUM (GENERAL) ---
  {
    standard: 'sama',
    bekasi: 'same',
    confidence: 'medium',
    risky: false,
    category: 'general'
  },
  {
    standard: 'sudah',
    bekasi: 'udah',
    confidence: 'high',
    risky: false,
    category: 'general'
  },
  {
    standard: 'sekarang',
    bekasi: 'sekarang',
    confidence: 'high',
    risky: false,
    category: 'general'
  },
  {
    standard: 'bohong',
    bekasi: 'boong',
    confidence: 'medium',
    risky: false,
    category: 'general'
  },
  {
    standard: 'benar',
    bekasi: 'bener',
    confidence: 'medium',
    risky: false,
    category: 'general'
  },
  {
    standard: 'uang',
    bekasi: 'duit',
    confidence: 'medium',
    risky: false,
    category: 'general'
  },

  // --- KELUARGA (FAMILY) ---
  {
    standard: 'ibu',
    bekasi: 'nyokap',
    confidence: 'medium',
    risky: false,
    category: 'family'
  },
  {
    standard: 'bapak',
    bekasi: 'bokap',
    confidence: 'medium',
    risky: false,
    category: 'family'
  },
  {
    standard: 'ayah',
    bekasi: 'bokap',
    confidence: 'medium',
    risky: false,
    category: 'family'
  }
];

/**
 * Peta pencarian cepat berdasarkan kata baku (lowercase).
 */
export const LEXICON_BY_STANDARD = new Map<string, LexiconEntry[]>();

for (const entry of BEKASI_LEXICON) {
  const key = entry.standard.toLowerCase();
  const existing = LEXICON_BY_STANDARD.get(key) || [];
  existing.push(entry);
  LEXICON_BY_STANDARD.set(key, existing);
}
