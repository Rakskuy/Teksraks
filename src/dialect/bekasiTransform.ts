/**
 * Modul Pasca-Proses Dialek Bekasi (Pure Transformation Layer)
 * Mengubah teks transkrip bahasa baku menjadi logat Bekasi/Betawi Ora
 * sesuai tingkat intensitas dan aturan keamanan linguistik.
 */

import { BEKASI_LEXICON, LexiconEntry, ConfidenceLevel } from './bekasiLexicon';
import { isException, isUrl, isNumberOrCurrency } from './exceptions';
import { applyPhonologicalShift, matchCasing } from './rules';
import { getPersonalLexiconEntries, loadPersonalDictionary } from './personalDictionary';

export type DialectIntensity = 'light' | 'medium' | 'full';

export interface BekasiOptions {
  /** Tingkat intensitas perubahan: 'light' (Ringan), 'medium' (Sedang), 'full' (Penuh) */
  intensity?: DialectIntensity;
  /** Mengaktifkan/menonaktifkan modul transformasi */
  enabled?: boolean;
  /** Jangan ubah kata di dalam tanda kutip (misal: "istilah ilmiah", 'terminologi') */
  preserveQuotes?: boolean;
  /** Daftar kata tambahan dari pengguna yang tidak boleh diubah */
  customExceptions?: string[];
  /** Entri leksikon tambahan/kustom (misal dari Kamus Pribadi) */
  customLexicon?: LexiconEntry[];
  /** Mengaktifkan aturan fonologis -a -> -e (otomatis true pada 'full') */
  enablePhonologicalRules?: boolean;
  /** Mengizinkan perubahan berisiko tinggi seperti yang -> nyang (otomatis true pada 'full') */
  allowRisky?: boolean;
}

export interface DialectChange {
  original: string;
  replacement: string;
  startIndex: number;
  endIndex: number;
  reason: string;
  confidence: ConfidenceLevel;
}

export interface BekasiResult {
  displayText: string;
  changes: DialectChange[];
}

/**
 * Filter entri kamus yang berlaku untuk tingkat intensitas tertentu.
 */
function getActiveLexiconMap(
  intensity: DialectIntensity,
  allowRiskyOverride?: boolean,
  customLexicon?: LexiconEntry[]
): Map<string, LexiconEntry> {
  const map = new Map<string, LexiconEntry>();

  const allowRisky = allowRiskyOverride ?? (intensity === 'full');

  for (const entry of BEKASI_LEXICON) {
    // Lewati entri berisiko jika allowRisky tidak aktif
    if (entry.risky && !allowRisky) {
      continue;
    }

    if (intensity === 'light') {
      // Ringan: hanya kata ganti, negasi, partikel, keterangan, dan tanya dengan confidence high
      const allowedCategories = ['pronoun', 'negation', 'particle', 'adverb', 'question'];
      if (entry.confidence === 'high' && allowedCategories.includes(entry.category)) {
        if (!map.has(entry.standard.toLowerCase())) {
          map.set(entry.standard.toLowerCase(), entry);
        }
      }
    } else if (intensity === 'medium') {
      // Sedang: semua kategori umum dengan confidence high dan medium (tanpa risky)
      if (entry.confidence === 'high' || entry.confidence === 'medium') {
        if (!map.has(entry.standard.toLowerCase())) {
          map.set(entry.standard.toLowerCase(), entry);
        }
      }
    } else {
      // Penuh: semua entri termasuk low confidence dan risky
      if (!map.has(entry.standard.toLowerCase())) {
        map.set(entry.standard.toLowerCase(), entry);
      }
    }
  }

  // Masukkan entri Kamus Pribadi (Personal Dictionary) dengan PRIORITAS TERTINGGI
  const personalEntries = customLexicon || getPersonalLexiconEntries();
  for (const pEntry of personalEntries) {
    map.set(pEntry.standard.toLowerCase(), pEntry);
  }

  return map;
}

/**
 * Menemukan rentang indeks karakter yang berada di dalam tanda kutip
 * ("...", '...', “...”, ‘...’, «...»).
 */
function getQuotedRanges(text: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const quoteRegex = /"([^"]*)"|'([^']*)'|“([^”]*)”|‘([^’]*)’|«([^»]*)»/g;
  let match: RegExpExecArray | null;

  while ((match = quoteRegex.exec(text)) !== null) {
    // Indeks awal dan akhir termasuk tanda kutip
    ranges.push({
      start: match.index,
      end: match.index + match[0].length
    });
  }

  return ranges;
}

/**
 * Memeriksa apakah suatu offset karakter berada dalam rentang kutipan
 */
function isInsideRanges(index: number, ranges: Array<{ start: number; end: number }>): boolean {
  for (const range of ranges) {
    if (index >= range.start && index < range.end) {
      return true;
    }
  }
  return false;
}

/**
 * Fungsi murni (pure function) untuk mentransformasikan teks ke dialek Bekasi.
 *
 * @param text Teks asli berbahasa Indonesia
 * @param options Pengaturan intensitas dan filter keamanan
 * @returns Objek hasil berisi `displayText` dan catatan `changes[]`
 */
export function applyBekasi(text: string, options: BekasiOptions = {}): BekasiResult {
  // Jika input kosong atau modul dinonaktifkan
  if (!text || options.enabled === false) {
    return {
      displayText: text || '',
      changes: []
    };
  }

  const intensity: DialectIntensity = options.intensity || 'medium';
  const preserveQuotes = options.preserveQuotes !== false; // default true
  const personalData = loadPersonalDictionary();
  const customExceptions = [
    ...(options.customExceptions || []),
    ...personalData.exceptions
  ];
  const enablePhono =
    options.enablePhonologicalRules !== undefined
      ? options.enablePhonologicalRules
      : intensity === 'full';
  const allowRisky =
    options.allowRisky !== undefined
      ? options.allowRisky
      : intensity === 'full';

  const activeLexicon = getActiveLexiconMap(intensity, allowRisky, options.customLexicon);
  const quotedRanges = preserveQuotes ? getQuotedRanges(text) : [];

  // Pola pencocokan kata: mencakup huruf latin beraksen dan kata berpenghubung (misal: cita-cita)
  // \b boundary menghormati spasi, tanda baca, awal/akhir baris
  const tokenRegex = /\b[a-zA-Z\u00C0-\u024F]+(?:-[a-zA-Z\u00C0-\u024F]+)*\b/g;

  const changes: DialectChange[] = [];
  let resultText = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const rawWord = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + rawWord.length;

    // Masukkan teks non-kata (spasi, tanda baca, simbol) sebelum kata ini
    resultText += text.substring(lastIndex, startIndex);
    lastIndex = endIndex;

    // 1. Pemeriksaan Keamanan: Kutipan istilah
    if (preserveQuotes && isInsideRanges(startIndex, quotedRanges)) {
      resultText += rawWord;
      continue;
    }

    // 2. Pemeriksaan Keamanan: URL atau Angka
    if (isUrl(rawWord) || isNumberOrCurrency(rawWord)) {
      resultText += rawWord;
      continue;
    }

    // 3. Pemeriksaan Keamanan: Kata dalam daftar pengecualian (psikologi, manusia, apalagi, dll.)
    if (isException(rawWord, customExceptions)) {
      resultText += rawWord;
      continue;
    }

    const lowerWord = rawWord.toLowerCase();
    let replaced = false;

    // 4. Pencocokan Kata Ulang (Reduplication, misal: apa-apa -> ape-ape, sama-sama -> same-same)
    if (rawWord.includes('-')) {
      const parts = rawWord.split('-');
      if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
        const subWord = parts[0].toLowerCase();
        let subRepl: string | null = null;
        let subConfidence: ConfidenceLevel = 'medium';
        let subReason = '';

        const subLex = activeLexicon.get(subWord);
        if (subLex) {
          subRepl = subLex.bekasi;
          subConfidence = subLex.confidence;
          subReason = subLex.note || `Kata ulang (${subLex.category}): "${rawWord}" -> "${subRepl}-${subRepl}"`;
        } else if (enablePhono) {
          const phMatch = applyPhonologicalShift(parts[0], customExceptions);
          if (phMatch) {
            subRepl = phMatch.replacement;
            subConfidence = 'medium';
            subReason = `Kata ulang fonologis: "${rawWord}" -> "${subRepl}-${subRepl}"`;
          }
        }

        if (subRepl) {
          const r1 = matchCasing(parts[0], subRepl);
          const r2 = matchCasing(parts[1], subRepl);
          const fullRepl = `${r1}-${r2}`;

          changes.push({
            original: rawWord,
            replacement: fullRepl,
            startIndex,
            endIndex,
            reason: subReason,
            confidence: subConfidence
          });

          resultText += fullRepl;
          replaced = true;
        }
      }
    }

    // 5. Pencocokan Kamus Leksikon Tunggal (Lexicon Mapping)
    if (!replaced) {
      const lexiconEntry = activeLexicon.get(lowerWord);
      if (lexiconEntry) {
        // Penyesuaian khusus: jika intensity full dan kata "kenapa", bisa menggunakan "ngapa" bila diinginkan
        let targetBekasi = lexiconEntry.bekasi;
        if (intensity === 'full' && lowerWord === 'kenapa' && allowRisky) {
          targetBekasi = 'ngapa';
        }

        const replacement = matchCasing(rawWord, targetBekasi);
        changes.push({
          original: rawWord,
          replacement,
          startIndex,
          endIndex,
          reason: lexiconEntry.note || `Pemetaan kamus (${lexiconEntry.category}): "${rawWord}" -> "${replacement}"`,
          confidence: lexiconEntry.confidence
        });

        resultText += replacement;
        replaced = true;
      }
    }

    // 6. Aturan Fonologis Whitelist (hanya jika aktif dan kata belum diganti)
    if (!replaced && enablePhono) {
      const phonoMatch = applyPhonologicalShift(rawWord, customExceptions);
      if (phonoMatch) {
        changes.push({
          original: rawWord,
          replacement: phonoMatch.replacement,
          startIndex,
          endIndex,
          reason: phonoMatch.reason,
          confidence: 'medium'
        });

        resultText += phonoMatch.replacement;
        replaced = true;
      }
    }

    // Jika tidak ada aturan yang cocok, pertahankan kata asli apa adanya
    if (!replaced) {
      resultText += rawWord;
    }
  }

  // Tambahkan sisa teks setelah token terakhir
  resultText += text.substring(lastIndex);

  return {
    displayText: resultText,
    changes
  };
}
