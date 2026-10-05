/**
 * transcriptDedupe.ts
 *
 * Logika deduplikasi dan penggabungan teks transkripsi cerdas untuk mengatasi
 * perilaku Chrome Android yang mengirim hasil kumulatif berulang (isFinal bertahap).
 *
 * Menjamin:
 * 1. Satu pembicara yang berbicara = SATU baris/segmen yang diperbarui di tempat (in-place).
 * 2. Hasil isFinal bertahap ("Oke", "Oke jadi", "Oke jadi kali ini") digabung menjadi teks terpanjang yang konsisten.
 * 3. Teks yang sudah dicommit tidak diulang kembali saat auto-restart peramban.
 */

/**
 * Normalisasi teks untuk perbandingan:
 * - Huruf kecil (lowercase)
 * - Hilangkan tanda baca yang tidak esensial
 * - Satukan spasi berlebih
 */
export function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Gabungkan atau timpa teks lama dengan teks baru yang masuk:
 * - Jika teks baru merupakan ekstensi/kelanjutan dari teks lama -> pilih teks baru.
 * - Jika teks lama lebih panjang dan memuat teks baru (jitter peramban) -> pertahankan teks lama.
 * - Jika terdapat kata tumpang tindih (overlap) di batas akhir dan awal -> gabungkan tanpa duplikasi.
 * - Jika benar-benar teks baru yang terpisah -> sambung dengan spasi.
 */
export function mergeSpeechTranscript(prevText: string, incomingText: string): string {
  const p = prevText.trim()
  const inc = incomingText.trim()

  if (!p) return inc
  if (!inc) return p

  const normP = normalizeText(p)
  const normInc = normalizeText(inc)

  // 1. Teks identik
  if (normP === normInc) {
    return inc.length >= p.length ? inc : p
  }

  // 2. Teks baru adalah kelanjutan/awalan dari teks lama (Chrome Android kumulatif)
  // Contoh: prev = "Oke jadi kali", incoming = "Oke jadi kali ini saya mau"
  if (normInc.startsWith(normP)) {
    return inc
  }

  // 3. Teks lama lebih panjang dari teks baru (jitter/fluktuasi mesin)
  // Contoh: prev = "Oke jadi kali ini saya", incoming = "Oke jadi kali"
  if (normP.startsWith(normInc)) {
    return p
  }

  // 4. Cari tumpang tindih kata di batas akhir prev dan awal incoming
  // Contoh: prev = "kita akan bahas tentang", incoming = "tentang teori kognitif"
  const wordsP = p.split(/\s+/)
  const wordsInc = inc.split(/\s+/)

  const maxCheck = Math.min(wordsP.length, wordsInc.length, 8)
  for (let len = maxCheck; len >= 1; len--) {
    const tailWords = wordsP.slice(-len).map(w => normalizeText(w)).join(' ')
    const headWords = wordsInc.slice(0, len).map(w => normalizeText(w)).join(' ')

    if (tailWords && tailWords === headWords) {
      // Ada overlap sepanjang `len` kata
      const uniqueSuffix = wordsInc.slice(len).join(' ')
      return uniqueSuffix ? `${p} ${uniqueSuffix}` : p
    }
  }

  // 5. Jika tidak ada overlap, sambung sebagai kalimat baru dalam segmen yang sama
  return `${p} ${inc}`
}

/**
 * Bersihkan teks yang masuk dari bagian yang SUDAH DICOMMIT sebelumnya.
 * Sangat penting saat SpeechRecognition melakukan auto-restart dan mengirim ulang
 * awal kalimat yang sudah masuk ke daftar segmen permanen.
 */
export function dedupeAgainstCommitted(committedText: string, incomingText: string): string {
  const c = committedText.trim()
  const inc = incomingText.trim()

  if (!c || !inc) return inc

  const normC = normalizeText(c)
  const normInc = normalizeText(inc)

  // Jika teks yang masuk persis sama atau sudah ada di dalam committed -> abaikan
  if (normC === normInc || normC.endsWith(normInc)) {
    return ''
  }

  // Jika incomingText diawali oleh seluruh committedText
  // Contoh: committed = "Selamat pagi teman-teman", incoming = "Selamat pagi teman-teman hari ini kita"
  if (normInc.startsWith(normC)) {
    // Ambil sisa teks setelah panjang committedText
    const remaining = inc.slice(c.length).trim()
    return remaining
  }

  // Cek apakah ada ekor committedText yang tumpang tindih dengan kepala incomingText
  const wordsC = c.split(/\s+/)
  const wordsInc = inc.split(/\s+/)

  const maxCheck = Math.min(wordsC.length, wordsInc.length, 8)
  for (let len = maxCheck; len >= 1; len--) {
    const tail = wordsC.slice(-len).map(w => normalizeText(w)).join(' ')
    const head = wordsInc.slice(0, len).map(w => normalizeText(w)).join(' ')

    if (tail && tail === head) {
      const remainingWords = wordsInc.slice(len).join(' ')
      return remainingWords
    }
  }

  return inc
}
