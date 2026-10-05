/**
 * Aturan Fonologis Dialek Bekasi (Vowel Shift -a -> -e)
 * PERHATIAN: Aturan ini HANYA berlaku pada kata-kata yang terdaftar dalam WHITELIST resmi.
 * Tidak boleh digeneralisasi ke semua kata berakhiran -a agar istilah formal/ilmiah tidak rusak.
 */

import { isException } from './exceptions';

/**
 * Daftar kata baku berakhiran -a yang sah bergeser menjadi -e dalam dialek Betawi/Bekasi.
 */
export const PHONOLOGICAL_A_TO_E_WHITELIST: Record<string, string> = {
  ada: 'ade',
  baca: 'bace',
  bahaya: 'bahaye',
  bawa: 'bawe',
  beda: 'bede',
  bicara: 'bicare',
  bila: 'bile',
  bisa: 'bise',
  buka: 'buke',
  buta: 'bute',
  coba: 'cobe',
  duga: 'duge',
  gila: 'gile',
  hampa: 'hampe',
  hina: 'hine',
  jaga: 'jage',
  jumpa: 'jumpe',
  kata: 'kate',
  kerja: 'kerje',
  kira: 'kire',
  luka: 'luke',
  lupa: 'lupe',
  mana: 'mane',
  minta: 'minte',
  muda: 'mude',
  muka: 'muke',
  nyata: 'nyate',
  percaya: 'percaye',
  pesta: 'peste',
  pinta: 'pinte',
  punya: 'punye',
  puasa: 'puase',
  rasa: 'rase',
  rela: 'rele',
  rupa: 'rupe',
  saja: 'saje',
  sama: 'same',
  sangka: 'sangke',
  sapa: 'sape',
  sedia: 'sedie',
  siksa: 'sikse',
  suka: 'suke',
  tanda: 'tande',
  tanya: 'tanye',
  terima: 'terime',
  tiba: 'tibe',
  tua: 'tue',
  utama: 'utame',
  warga: 'warge'
};

/**
 * Mempertahankan gaya huruf (Title Case / UPPERCASE / lowercase)
 */
export function matchCasing(source: string, target: string): string {
  if (!source || !target) return target;

  // UPPERCASE penuh (misal: "BISA" -> "BISE")
  if (source === source.toUpperCase() && source !== source.toLowerCase()) {
    return target.toUpperCase();
  }

  // Title Case (misal: "Bisa" -> "Bise")
  if (source[0] === source[0].toUpperCase() && source.slice(1) === source.slice(1).toLowerCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1).toLowerCase();
  }

  // lowercase (misal: "bisa" -> "bise")
  return target.toLowerCase();
}

export interface PhonologicalMatch {
  matched: boolean;
  replacement: string;
  reason: string;
}

/**
 * Menerapkan aturan fonologis akhiran -a -> -e hanya jika kata ada di whitelist dan bukan exception.
 */
export function applyPhonologicalShift(
  rawWord: string,
  customExceptions?: string[]
): PhonologicalMatch | null {
  const lower = rawWord.toLowerCase();

  // Wajib lewati jika ada di daftar pengecualian
  if (isException(lower, customExceptions)) {
    return null;
  }

  const target = PHONOLOGICAL_A_TO_E_WHITELIST[lower];
  if (target) {
    return {
      matched: true,
      replacement: matchCasing(rawWord, target),
      reason: `Aturan fonologis whitelist (-a -> -e): "${rawWord}" -> "${target}"`
    };
  }

  return null;
}
