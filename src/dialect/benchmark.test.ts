/**
 * benchmark.test.ts
 * Uji komprehensif 30+ kalimat percakapan Bekasi, campuran Indonesia-Inggris,
 * istilah psikologi terlindungi, dan nama orang/tempat.
 * Mengukur tingkat kesalahan:
 * - False Positives (kata yang salah diubah)
 * - False Negatives (kata yang terlewat tidak diubah)
 */
import { describe, it, expect } from 'vitest'
import { applyBekasi } from './bekasiTransform'

// ── 30+ Kalimat Percakapan Logat Bekasi ──────────────────────────────────────
export const BEKASI_CONVERSATION_CASES: {
  input: string
  intensity: 'light' | 'medium' | 'full'
  expectedKeywords: string[]
  forbiddenKeywords?: string[]
}[] = [
  // 1. Kata ganti & negasi
  {
    input: 'Aku tidak tahu kenapa dia tidak mau datang ke sini.',
    intensity: 'light',
    expectedKeywords: ['gue', 'kagak', 'die'],
  },
  // 2. Pertanyaan apa & kamu
  {
    input: 'Kamu mau apa dari saya sebenarnya?',
    intensity: 'light',
    expectedKeywords: ['lu'],
  },
  // 3. Kata ganti kita & sama
  {
    input: 'Kita harus pergi bersama dia sekarang juga.',
    intensity: 'medium',
    expectedKeywords: ['kite', 'die'],
  },
  // 4. Negasi & partikel saja
  {
    input: 'Saya tidak lapar, saya mau minum air saja.',
    intensity: 'light',
    expectedKeywords: ['kagak', 'aje'],
  },
  // 5. Partikel cuma & sekali
  {
    input: 'Tugas ini cuma sedikit tapi susah sekali untuk diselesaikan.',
    intensity: 'light',
    expectedKeywords: ['doang', 'banget'],
  },
  // 6. Pertanyaan bagaimana & kata ganti
  {
    input: 'Bagaimana kamu bisa menyelesaikan masalah itu kemarin?',
    intensity: 'medium',
    expectedKeywords: ['gimane', 'lu'],
  },
  // 7. Pertanyaan kenapa & nanti
  {
    input: 'Kenapa kamu baru datang sekarang? Nanti dosennya marah.',
    intensity: 'medium',
    expectedKeywords: ['kenape', 'lu', 'ntar'],
  },
  // 8. Kata ganti orang tua (ibu, bapak) & uang
  {
    input: 'Ibu dan bapak tidak punya uang untuk beli buku itu.',
    intensity: 'medium',
    expectedKeywords: ['nyokap', 'bokap', 'kagak', 'duit'],
  },
  // 9. Kosakata bohong & benar
  {
    input: 'Jangan bohong, apa yang kamu katakan itu benar tidak?',
    intensity: 'medium',
    expectedKeywords: ['boong', 'lu', 'bener', 'kagak'],
  },
  // 10. Kosakata memang & begitu
  {
    input: 'Memang kenyataannya sudah begitu sejak lama.',
    intensity: 'medium',
    expectedKeywords: ['emang', 'udah', 'gitu'],
  },
  // 11. Pertanyaan ke mana & dia
  {
    input: 'Dia mau pergi ke mana membawa tas besar itu?',
    intensity: 'medium',
    expectedKeywords: ['die', 'mane'],
  },
  // 12. Sedang & begini
  {
    input: 'Saya sedang memikirkan kenapa situasinya jadi begini.',
    intensity: 'medium',
    expectedKeywords: ['lagi', 'kenape', 'gini'],
  },
  // 13. Partikel ekspresif kenapa (ngapa) & tidak (nggak/kagak)
  {
    input: 'Kenapa kamu tidak ikut rapat mahasiswa tadi siang?',
    intensity: 'full',
    expectedKeywords: ['ngapa', 'lu', 'kagak'],
  },
  // 14. Whitelist fonologis -a -> -e (bisa -> bise, ada -> ade)
  {
    input: 'Dia bisa datang kalau ada kendaraan yang kosong.',
    intensity: 'full',
    expectedKeywords: ['die', 'bise', 'ade', 'nyang'],
  },
  // 15. Whitelist fonologis -a -> -e (bawa -> bawe, kata -> kate)
  {
    input: 'Kata dia, tolong bawa buku catatan ini ke sana.',
    intensity: 'full',
    expectedKeywords: ['kate', 'die', 'bawe'],
  },
  // 16. Whitelist fonologis -a -> -e (tanya -> tanye)
  {
    input: 'Coba kamu tanya sama dia langsung biar jelas.',
    intensity: 'full',
    expectedKeywords: ['lu', 'tanye', 'same', 'die'],
  },
  // 17. Kata ulang apa-apa
  {
    input: 'Tidak ada apa-apa yang perlu kamu takuti di ruangan ini.',
    intensity: 'full',
    expectedKeywords: ['kagak', 'ade', 'ape-ape', 'nyang', 'lu'],
  },
  // 18. Kata ulang benar-benar
  {
    input: 'Saya benar-benar tidak paham maksud perkataan kamu tadi.',
    intensity: 'medium',
    expectedKeywords: ['bener-bener', 'kagak', 'lu'],
  },
  // 19. Kata ulang sama-sama
  {
    input: 'Kita sama-sama mahasiswa yang sedang berjuang skripsi.',
    intensity: 'medium',
    expectedKeywords: ['kite', 'same-same', 'lagi'],
  },
  // 20. Kalimat penolakan tegas
  {
    input: 'Aku tidak akan pernah mau menerima uang dari kamu lagi.',
    intensity: 'medium',
    expectedKeywords: ['gue', 'kagak', 'duit', 'lu'],
  },
  // 21. Kalimat heran / tanya santai
  {
    input: 'Bagaimana ini? Kenapa kamu malah tertawa sendiri?',
    intensity: 'medium',
    expectedKeywords: ['gimane', 'kenape', 'lu'],
  },
  // 22. Kalimat santai kumpul teman
  {
    input: 'Nanti malam kita kumpul makan sama bapak di warung saja.',
    intensity: 'medium',
    expectedKeywords: ['ntar', 'kite', 'same', 'bokap', 'aje'],
  },
  // 23. Penggunaan memang + sekali
  {
    input: 'Ujian semester ini memang sulit sekali untuk mahasiswa.',
    intensity: 'medium',
    expectedKeywords: ['emang', 'banget'],
  },
  // 24. Tanya arah & tujuan
  {
    input: 'Kamu tahu ke mana dia pergi membawa sepeda motor itu?',
    intensity: 'medium',
    expectedKeywords: ['lu', 'mane', 'die'],
  },
  // 25. Kondisi finansial & belanja
  {
    input: 'Ibu bilang uang belanja sudah habis sama sekali.',
    intensity: 'medium',
    expectedKeywords: ['nyokap', 'duit', 'udah', 'same', 'banget'],
  },
  // 26. Partikel saja + cuma
  {
    input: 'Duduk di sini saja, cuma menunggu sebentar tidak lama.',
    intensity: 'light',
    expectedKeywords: ['aje', 'doang', 'kagak'],
  },
  // 27. Kesepakatan santai
  {
    input: 'Begitu saja rencana kita untuk kegiatan besok pagi.',
    intensity: 'medium',
    expectedKeywords: ['gitu', 'aje', 'kite'],
  },
  // 28. Penjelasan situasi
  {
    input: 'Begini ceritanya, waktu itu aku sedang tidak ada di rumah.',
    intensity: 'medium',
    expectedKeywords: ['gini', 'gue', 'lagi', 'kagak'],
  },
  // 29. Tanya alasan mendalam
  {
    input: 'Kenapa dia tidak mau bicara jujur sama kita dari awal?',
    intensity: 'medium',
    expectedKeywords: ['kenape', 'die', 'kagak', 'same', 'kite'],
  },
  // 30. Kalimat penegasan kebenaran
  {
    input: 'Memang benar apa yang dikatakan sama bapak kamu kemarin.',
    intensity: 'medium',
    expectedKeywords: ['emang', 'bener', 'same', 'bokap', 'lu'],
  },
  // 31. Dialog penuh dialek lokal (Intensitas Penuh)
  {
    input: 'Yang mana yang bisa dia bawa ke sana sekarang?',
    intensity: 'full',
    expectedKeywords: ['nyang', 'mane', 'bise', 'die', 'bawe'],
  },
  // 32. Pertanyaan santai
  {
    input: 'Kamu sedang apa di sana sendirian?',
    intensity: 'full',
    expectedKeywords: ['lu', 'lagi', 'ape'],
  },
]

// ── Kalimat Campuran Indonesia-Inggris (Code-Switching) ──────────────────────
export const MIXED_INDO_ENGLISH_CASES = [
  {
    input: 'Gue lagi burnout parah ngerjain tugas psikologi kognitif.',
    expectedKept: ['burnout'],
  },
  {
    input: 'Kamu sudah submit assignment ke portal e-learning belum?',
    expectedKept: ['submit', 'assignment', 'e-learning'],
  },
  {
    input: 'Dia punya coping mechanism yang menurut saya agak avoidance.',
    expectedKept: ['coping', 'mechanism', 'avoidance'],
  },
  {
    input: 'Kita butuh peer support group biar tidak overthinking.',
    expectedKept: ['peer', 'support', 'group', 'overthinking'],
  },
  {
    input: 'Presentation tadi benar-benar challenge banget buat public speaking kita.',
    expectedKept: ['Presentation', 'challenge', 'public', 'speaking'],
  },
]

// ── Istilah Psikologi yang Wajib Kebal dari Transformasi ────────────────────
export const PSYCHOLOGY_PRESERVATION_CASES = [
  'skizofrenia',
  'neuroplastisitas',
  'psikoanalisis',
  'kognitif',
  'amigdala',
  'hipokampus',
  'trauma',
  'katarsis',
  'desensitisasi',
  'empati',
  'afek',
  'sublimasi',
  'transferens',
  'psikosomatis',
  'delusi',
  'halusinasi',
  'psikodiagnostik',
  'prokrastinasi',
]

// ── Nama Orang & Lokasi yang Wajib Kebal dari Transformasi ──────────────────
export const ENTITY_PRESERVATION_CASES = [
  'Richard Lazarus',
  'Susan Folkman',
  'Carl Rogers',
  'Sigmund Freud',
  'Siti Rahmawati',
  'Budi Santoso',
  'Jakarta',
  'Bekasi',
  'Summarecon',
  'Tambun',
  'Cikarang',
]

describe('Benchmark Logat Bekasi (30+ Kasus Percakapan)', () => {
  it('berhasil mengonversi 32 skenario percakapan dengan kata kunci yang diharapkan', () => {
    let passedCount = 0

    for (const testCase of BEKASI_CONVERSATION_CASES) {
      const res = applyBekasi(testCase.input, { intensity: testCase.intensity })
      const lowerDisplay = res.displayText.toLowerCase()

      let allFound = true
      for (const kw of testCase.expectedKeywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i')
        if (!regex.test(lowerDisplay)) {
          allFound = false
          break
        }
      }

      if (allFound) {
        passedCount++
      }
    }

    // Seluruh 32 skenario percakapan harus lulus 100%
    expect(passedCount).toBe(BEKASI_CONVERSATION_CASES.length)
  })

  it('mempertahankan istilah bahasa Inggris dalam kalimat campuran (code-switching)', () => {
    for (const testCase of MIXED_INDO_ENGLISH_CASES) {
      const res = applyBekasi(testCase.input, { intensity: 'full' })
      for (const englishTerm of testCase.expectedKept) {
        expect(res.displayText).toContain(englishTerm)
      }
    }
  })

  it('melindungi seluruh istilah psikologi sensitif dari perubahan fonologis di mode full', () => {
    for (const term of PSYCHOLOGY_PRESERVATION_CASES) {
      const sentence = `Penelitian tentang ${term} sangat krusial bagi mahasiswa.`
      const res = applyBekasi(sentence, { intensity: 'full' })

      // Istilah psikologi tidak boleh berakhiran -e atau rusak
      expect(res.displayText).toContain(term)
    }
  })

  it('melindungi nama orang dan nama tempat dari perubahan fonologis di mode full', () => {
    for (const entity of ENTITY_PRESERVATION_CASES) {
      const sentence = `Kemarin ${entity} menghadiri seminar bersama kami.`
      const res = applyBekasi(sentence, { intensity: 'full' })

      // Nama orang/tempat harus tetap utuh
      expect(res.displayText).toContain(entity)
    }
  })

  it('menghitung metrik error rate (True Positives, False Positives, False Negatives)', () => {
    let totalTargetWords = 0
    let truePositives = 0
    let falsePositives = 0
    let falseNegatives = 0

    // Evaluasi 32 percakapan
    for (const testCase of BEKASI_CONVERSATION_CASES) {
      totalTargetWords += testCase.expectedKeywords.length
      const res = applyBekasi(testCase.input, { intensity: testCase.intensity })
      const lowerDisplay = res.displayText.toLowerCase()

      for (const kw of testCase.expectedKeywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i')
        if (regex.test(lowerDisplay)) {
          truePositives++
        } else {
          falseNegatives++
        }
      }
    }

    // Evaluasi False Positives pada kalimat psikologi murni
    for (const term of PSYCHOLOGY_PRESERVATION_CASES) {
      const res = applyBekasi(term, { intensity: 'full' })
      if (res.changes.length > 0) {
        falsePositives++
      }
    }

    // Evaluasi False Positives pada nama orang/tempat
    for (const entity of ENTITY_PRESERVATION_CASES) {
      const res = applyBekasi(entity, { intensity: 'full' })
      if (res.changes.length > 0) {
        falsePositives++
      }
    }

    // Akurasi kata target di percakapan
    const accuracy = (truePositives / totalTargetWords) * 100

    expect(accuracy).toBe(100)
    expect(falsePositives).toBe(0)
    expect(falseNegatives).toBe(0)
  })
})
