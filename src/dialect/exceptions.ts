/**
 * Daftar Pengecualian Kata (Exceptions)
 * Kata-kata yang TIDAK BOLEH diubah ke logat Bekasi dalam situasi apa pun:
 * 1. Istilah psikologi & terminologi ilmiah
 * 2. Kata berakhiran -a yang bukan bagian pergeseran logat (manusia, dunia, bahasa, dll.)
 * 3. Nama tempat, entitas, dan kata majemuk/berimbuhan
 */

export const PSYCHOLOGY_EXCEPTIONS: string[] = [
  'psikologi',
  'psikiatri',
  'psikoterapi',
  'psikoanalisis',
  'kognitif',
  'afektif',
  'psikomotorik',
  'amigdala',
  'neuroplastisitas',
  'skizofrenia',
  'bipolar',
  'trauma',
  'stres',
  'depresi',
  'ansietas',
  'katarsis',
  'empati',
  'persepsi',
  'halusinasi',
  'delusi',
  'skala',
  'kuesioner',
  'terapi',
  'diagnosa',
  'diagnosis',
  'observasi',
  'intervensi',
  'konseling',
  'hipotesis',
  'validitas',
  'reliabilitas',
  'neurosa',
  'psikosis',
  'introver',
  'ekstrover',
  'introspeksi',
  'asertif',
  'stigma',
  'psikosomatis',
  'sublimasi',
  'rasionalisasi',
  'represi',
  'regresi',
  'proyeksi',
  'id',
  'ego',
  'superego',
  'behavioristik',
  'humanistik',
  'fobia'
];

export const NON_DIALECTAL_A_WORDS: string[] = [
  'bahasa',
  'manusia',
  'dunia',
  'kuliah',
  'mahasiswa',
  'agama',
  'udara',
  'budaya',
  'negara',
  'warna',
  'upaya',
  'karya',
  'daya',
  'suasana',
  'keluarga',
  'angka',
  'harga',
  'jiwa',
  'pria',
  'wanita',
  'usia',
  'norma',
  'fakta',
  'kriteria',
  'wacana',
  'sarana',
  'prasarana',
  'pustaka',
  'wahana',
  'rupa',
  'nama',
  'koma',
  'titik',
  'mata',
  'dada',
  'nyawa',
  'bencana',
  'panitia',
  'pembina',
  'peserta',
  'pancasila',
  'cita',
  'cita-cita',
  'kamera',
  'agenda',
  'rahasia'
];

export const COMPOUND_AND_AFFIX_EXCEPTIONS: string[] = [
  'apalagi',
  'apapun',
  'apatah',
  'manapun',
  'dimanapun',
  'bagaimanapun',
  'walaupun',
  'meskipun',
  'sebagaimana',
  'bersama',
  'kebersamaan',
  'persamaan',
  'menyamakan',
  'padahal',
  'padanya',
  'daripada',
  'kepada',
  'kemana',
  'dimana',
  'darimana',
  'mengapa',
  'mengapakah',
  'mengapain',
  'tidaklah',
  'sudahlah',
  'akurat',
  'adanya'
];

export const PROPER_NOUN_EXCEPTIONS: string[] = [
  'indonesia',
  'jawa',
  'bekasi',
  'jakarta',
  'bandung',
  'depok',
  'bogor',
  'tangerang',
  'america',
  'amerika',
  'eropa',
  'asia',
  'google',
  'chrome',
  'ugm',
  'ui',
  'unpad'
];

// Set gabungan untuk pencarian O(1)
export const DEFAULT_EXCEPTIONS = new Set<string>([
  ...PSYCHOLOGY_EXCEPTIONS.map(w => w.toLowerCase()),
  ...NON_DIALECTAL_A_WORDS.map(w => w.toLowerCase()),
  ...COMPOUND_AND_AFFIX_EXCEPTIONS.map(w => w.toLowerCase()),
  ...PROPER_NOUN_EXCEPTIONS.map(w => w.toLowerCase())
]);

/**
 * Memeriksa apakah suatu kata termasuk dalam daftar pengecualian.
 */
export function isException(
  word: string,
  customExceptions?: string[] | Set<string>
): boolean {
  const normalized = word.toLowerCase().trim();
  if (DEFAULT_EXCEPTIONS.has(normalized)) {
    return true;
  }
  if (customExceptions) {
    if (customExceptions instanceof Set) {
      if (customExceptions.has(normalized)) return true;
    } else if (Array.isArray(customExceptions)) {
      if (customExceptions.some(e => e.toLowerCase().trim() === normalized)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Deteksi URL / Web Address
 */
export function isUrl(token: string): boolean {
  return /^(https?:\/\/|www\.)[^\s]+$/i.test(token.trim());
}

/**
 * Deteksi Format Angka, Persentase, Jam, atau Mata Uang
 */
export function isNumberOrCurrency(token: string): boolean {
  return /^(Rp\.?|\$|€)?\s*[\d.,]+%?$/i.test(token.trim());
}
