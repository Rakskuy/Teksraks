import { describe, it, expect } from 'vitest';
import { applyBekasi, BekasiOptions } from './bekasiTransform';

describe('Modul Dialek Bekasi - Unit Tests & Edge Cases', () => {
  // ==========================================
  // KELOMPOK 1: UJI KASUS WAJIB & JEBAKAN UTAMA
  // ==========================================

  it('1. Uji wajib: "Kamu mau ke mana?" -> "Lu mau ke mane?"', () => {
    const input = 'Kamu mau ke mana?';
    const result = applyBekasi(input, { intensity: 'medium' });
    expect(result.displayText).toBe('Lu mau ke mane?');
    expect(result.changes).toHaveLength(2);
    expect(result.changes[0].original).toBe('Kamu');
    expect(result.changes[0].replacement).toBe('Lu');
    expect(result.changes[1].original).toBe('mana');
    expect(result.changes[1].replacement).toBe('mane');
  });

  it('2. Uji wajib: "Saya tidak tahu apa itu psikologi" -> istilah psikologi tidak berubah', () => {
    const input = 'Saya tidak tahu apa itu psikologi';
    const result = applyBekasi(input, { intensity: 'medium' });
    expect(result.displayText).toBe('Gue kagak tahu ape itu psikologi');
    expect(result.displayText).toContain('psikologi');
    expect(result.displayText).not.toContain('psikologe');
  });

  it('3. Uji wajib jebakan: "apalagi" tetap "apalagi" (bukan apelagi)', () => {
    const input = 'Apalagi kalau bukan kamu yang datang.';
    const result = applyBekasi(input, { intensity: 'medium' });
    expect(result.displayText).toContain('Apalagi');
    expect(result.displayText).not.toContain('Apelagi');
    expect(result.displayText).not.toContain('apelagi');
  });

  it('4. Uji wajib: Kalimat campur baku dan logat tidak rusak', () => {
    const input = 'Udah dari sananya die emang kognitifnya bagus.';
    const result = applyBekasi(input, { intensity: 'medium' });
    expect(result.displayText).toBe('Udah dari sananya die emang kognitifnya bagus.');
  });

  // ==========================================
  // KELOMPOK 2: BATAS KATA & ANTI-FRAGMENTASI IMBUHAN
  // ==========================================

  it('5. "apapun" tidak berubah menjadi "apepun"', () => {
    const res = applyBekasi('Apapun masalahnya, kita hadapi bersama.', { intensity: 'medium' });
    expect(res.displayText).toContain('Apapun');
    expect(res.displayText).not.toContain('Apepun');
  });

  it('6. "manapun" tidak berubah menjadi "manepun"', () => {
    const res = applyBekasi('Di manapun kamu berada, jangan bohong.', { intensity: 'medium' });
    expect(res.displayText).toBe('Di manapun lu berada, jangan boong.');
  });

  it('7. "bagaimanapun" tidak terpotong sebagian', () => {
    const res = applyBekasi('Bagaimanapun hasilnya, dia sudah berusaha.', { intensity: 'medium' });
    expect(res.displayText).toBe('Bagaimanapun hasilnya, die udah berusaha.');
  });

  it('8. "bersama" dan "kebersamaan" tidak berubah menjadi "bersame"', () => {
    const res = applyBekasi('Nilai kebersamaan tercipta saat kita belajar bersama.', { intensity: 'medium' });
    expect(res.displayText).toBe('Nilai kebersamaan tercipta saat kite belajar bersama.');
  });

  it('9. "persamaan" dan "menyamakan" tidak berubah', () => {
    const res = applyBekasi('Jangan menyamakan persamaan dua variabel ini.', { intensity: 'medium' });
    expect(res.displayText).toBe('Jangan menyamakan persamaan dua variabel ini.');
  });

  it('10. "padahal" tidak berubah menjadi "padehal"', () => {
    const res = applyBekasi('Padahal dia tidak tahu apa-apa.', { intensity: 'medium' });
    expect(res.displayText).toBe('Padahal die kagak tahu ape-ape.');
  });

  it('11. "daripada" dan "kepada" tidak berubah', () => {
    const res = applyBekasi('Kirimkan kepada saya daripada ke dia.', { intensity: 'medium' });
    expect(res.displayText).toBe('Kirimkan kepada gue daripada ke die.');
  });

  it('12. "akurat" tidak berubah menjadi "guerat" (awalan aku- aman)', () => {
    const res = applyBekasi('Data penelitian ini sangat akurat.', { intensity: 'medium' });
    expect(res.displayText).toBe('Data penelitian ini sangat akurat.');
  });

  it('13. "sudahlah" tidak terdistorsi', () => {
    const res = applyBekasi('Sudahlah, kamu tidak usah memikirkan itu.', { intensity: 'medium' });
    expect(res.displayText).toBe('Sudahlah, lu kagak usah memikirkan itu.');
  });

  it('14. "mengapa" tidak terdistorsi menjadi kata aneh', () => {
    const res = applyBekasi('Mengapa kamu diam saja?', { intensity: 'medium' });
    expect(res.displayText).toBe('Mengapa lu diam aje?');
  });

  // ==========================================
  // KELOMPOK 3: KEAMANAN ISTILAH PSIKOLOGI
  // ==========================================

  it('15. Istilah kognitif, afektif, dan psikomotorik tetap utuh', () => {
    const input = 'Aspek kognitif dan afektif penting dalam proses konseling.';
    const res = applyBekasi(input, { intensity: 'medium' });
    expect(res.displayText).toBe('Aspek kognitif dan afektif penting dalam proses konseling.');
  });

  it('16. Istilah amigdala dan neuroplastisitas tidak berakhiran -e', () => {
    const input = 'Fungsi amigdala berkaitan dengan memori trauma dan neuroplastisitas otak.';
    const res = applyBekasi(input, { intensity: 'full' });
    expect(res.displayText).toContain('amigdala');
    expect(res.displayText).toContain('neuroplastisitas');
    expect(res.displayText).not.toContain('amigdale');
  });

  it('17. Istilah skizofrenia dan bipolar tidak terpengaruh', () => {
    const input = 'Dia didiagnosis skizofrenia dan gangguan bipolar.';
    const res = applyBekasi(input, { intensity: 'medium' });
    expect(res.displayText).toBe('Die didiagnosis skizofrenia dan gangguan bipolar.');
  });

  it('18. Istilah psikoanalisis: id, ego, superego aman', () => {
    const input = 'Menurut Freud, ego menjembatani id dan superego.';
    const res = applyBekasi(input, { intensity: 'full' });
    expect(res.displayText).toBe('Menurut Freud, ego menjembatani id dan superego.');
  });

  it('19. Istilah katarsis dan empati tetap standar', () => {
    const input = 'Klien mengalami katarsis emosional saat terapis menunjukkan empati.';
    const res = applyBekasi(input, { intensity: 'medium' });
    expect(res.displayText).toBe('Klien mengalami katarsis emosional saat terapis menunjukkan empati.');
  });

  it('20. Istilah metodologi: validitas, reliabilitas, hipotesis aman', () => {
    const input = 'Kita perlu menguji validitas dan reliabilitas instrumen ini.';
    const res = applyBekasi(input, { intensity: 'medium' });
    expect(res.displayText).toBe('Kite perlu menguji validitas dan reliabilitas instrumen ini.');
  });

  // ==========================================
  // KELOMPOK 4: KATA AKHIRAN -A NON-LOGAT
  // ==========================================

  it('21. "bahasa" tidak menjadi "bahese"', () => {
    const res = applyBekasi('Bahasa Indonesia adalah bahasa persatuan.', { intensity: 'full' });
    expect(res.displayText).toBe('Bahasa Indonesia adalah bahasa persatuan.');
    expect(res.displayText).not.toContain('bahese');
  });

  it('22. "manusia" tidak menjadi "manusie"', () => {
    const res = applyBekasi('Perilaku manusia dipengaruhi oleh lingkungan.', { intensity: 'full' });
    expect(res.displayText).toBe('Perilaku manusia dipengaruhi oleh lingkungan.');
    expect(res.displayText).not.toContain('manusie');
  });

  it('23. "dunia" tidak menjadi "dunie"', () => {
    const res = applyBekasi('Dunia psikologi terus berkembang pesat.', { intensity: 'full' });
    expect(res.displayText).toBe('Dunia psikologi terus berkembang pesat.');
  });

  it('24. "mahasiswa" dan "kuliah" tidak berubah', () => {
    const res = applyBekasi('Mahasiswa psikologi sedang kuliah di kampus.', { intensity: 'medium' });
    expect(res.displayText).toBe('Mahasiswa psikologi lagi kuliah di kampus.');
    expect(res.displayText).not.toContain('mahasiswe');
  });

  it('25. "agama" dan "budaya" tidak berubah fonologisnya', () => {
    const res = applyBekasi('Faktor agama dan budaya membentuk kepribadian kita.', { intensity: 'full' });
    expect(res.displayText).toBe('Faktor agama dan budaya membentuk kepribadian kite.');
  });

  it('26. "keluarga", "fakta", dan "kriteria" tidak berakhiran -e', () => {
    const res = applyBekasi('Fakta menunjukkan kriteria keharmonisan keluarga terpenuhi.', { intensity: 'full' });
    expect(res.displayText).toBe('Fakta menunjukkan kriteria keharmonisan keluarga terpenuhi.');
  });

  it('27. "udara", "suasana", dan "warna" tetap baku', () => {
    const res = applyBekasi('Suasana ruangan dan warna dinding mempengaruhi suasana hati.', { intensity: 'full' });
    expect(res.displayText).toBe('Suasana ruangan dan warna dinding mempengaruhi suasana hati.');
  });

  // ==========================================
  // KELOMPOK 5: PRESERVASI KAPITALISASI & TANDA BACA
  // ==========================================

  it('28. Kapitalisasi awal kalimat (Title Case) terjaga', () => {
    const res = applyBekasi('Kamu tahu tidak? Dia datang kemarin.', { intensity: 'medium' });
    expect(res.displayText).toBe('Lu tahu kagak? Die datang kemarin.');
  });

  it('29. Huruf kapital seluruhnya (ALL CAPS) disesuaikan', () => {
    const res = applyBekasi('KITA TIDAK BOHONG SAMA DIA!', { intensity: 'medium' });
    expect(res.displayText).toBe('KITE KAGAK BOONG SAME DIE!');
  });

  it('30. Tanda baca ganda dan simbol tetap rapi', () => {
    const res = applyBekasi('Apa?! Benar kamu tidak tahu?!', { intensity: 'medium' });
    expect(res.displayText).toBe('Ape?! Bener lu kagak tahu?!');
  });

  it('31. Elipsis (...) dan tanda kutip ganda tetap terjaga', () => {
    const res = applyBekasi('Nanti... kita bicarakan lagi ya.', { intensity: 'medium' });
    expect(res.displayText).toBe('Ntar... kite bicarakan lagi ya.');
  });

  // ==========================================
  // KELOMPOK 6: KEAMANAN KUTIPAN (PRESERVE QUOTES)
  // ==========================================

  it('32. Kata di dalam tanda kutip ganda ("...") tidak boleh diubah', () => {
    const input = 'Dia berkata "saya tidak tahu apa itu" saat wawancara.';
    const res = applyBekasi(input, { intensity: 'medium', preserveQuotes: true });
    expect(res.displayText).toBe('Die berkata "saya tidak tahu apa itu" saat wawancara.');
  });

  it('33. Kata di dalam tanda kutip tunggal (\'...\') dan kutip cerdas (“...”) terlindungi', () => {
    const input = 'Istilah “locus of control” dan ‘defense mechanism’ dibahas dia.';
    const res = applyBekasi(input, { intensity: 'medium', preserveQuotes: true });
    expect(res.displayText).toBe('Istilah “locus of control” dan ‘defense mechanism’ dibahas die.');
  });

  // ==========================================
  // KELOMPOK 7: KEAMANAN URL & ANGKA/MATA UANG
  // ==========================================

  it('34. URL tidak mengalami perubahan kata', () => {
    const input = 'Silakan baca di https://contoh.com/apa-dan-kenapa sekarang.';
    const res = applyBekasi(input, { intensity: 'medium' });
    expect(res.displayText).toBe('Silakan baca di https://contoh.com/apa-dan-kenapa sekarang.');
  });

  it('35. Angka dan mata uang tidak terganggu', () => {
    const input = 'Biaya pendaftarannya cuma Rp50.000 saja per orang.';
    const res = applyBekasi(input, { intensity: 'medium' });
    expect(res.displayText).toBe('Biaya pendaftarannya doang Rp50.000 aje per orang.');
  });

  // ==========================================
  // KELOMPOK 8: PERBEDAAN TINGKAT INTENSITAS
  // ==========================================

  it('36. Intensitas Ringan (light): hanya kata ganti, negasi, partikel dasar', () => {
    const input = 'Ibu dan bapak sedang tidak punya uang sama sekali.';
    const res = applyBekasi(input, { intensity: 'light' });
    // Ibu, bapak, uang tetap baku di tingkat Ringan; sedang->lagi, tidak->kagak, sekali->banget
    expect(res.displayText).toBe('Ibu dan bapak lagi kagak punya uang sama banget.');
  });

  it('37. Intensitas Sedang (medium): mencakup kosakata umum (nyokap, bokap, duit, same)', () => {
    const input = 'Ibu dan bapak sedang tidak punya uang sama sekali.';
    const res = applyBekasi(input, { intensity: 'medium' });
    expect(res.displayText).toBe('Nyokap dan bokap lagi kagak punya duit same banget.');
  });

  it('38. Intensitas Penuh (full): mengaktifkan aturan fonologis whitelist (bisa->bise, ada->ade)', () => {
    const input = 'Apakah dia bisa membaca buku yang ada di sana?';
    const res = applyBekasi(input, { intensity: 'full' });
    // apakah -> tidak diubah (kata formal), dia->die, bisa->bise, yang->nyang (risky), ada->ade
    expect(res.displayText).toContain('die bise');
    expect(res.displayText).toContain('nyang ade');
  });

  it('39. Aturan "kenapa" pada mode Penuh beralih ke "ngapa"', () => {
    const input = 'Kenapa kamu melamun?';
    const res = applyBekasi(input, { intensity: 'full' });
    expect(res.displayText).toBe('Ngapa lu melamun?');
  });

  // ==========================================
  // KELOMPOK 9: PENGECUALIAN KUSTOM PENGGUNA
  // ==========================================

  it('40. Pengguna dapat menambahkan customExceptions dinamis', () => {
    const input = 'Kamu harus transfer uang ke Rina besok.';
    const options: BekasiOptions = {
      intensity: 'medium',
      customExceptions: ['uang', 'rina']
    };
    const res = applyBekasi(input, options);
    // uang tidak berubah jadi duit karena didaftarkan di customExceptions
    expect(res.displayText).toBe('Lu harus transfer uang ke Rina besok.');
  });

  // ==========================================
  // KELOMPOK 10: SIFAT PURE FUNCTION & EDGE INPUT
  // ==========================================

  it('41. Fungsi murni: input kosong menghasilkan output kosong', () => {
    const res = applyBekasi('');
    expect(res.displayText).toBe('');
    expect(res.changes).toHaveLength(0);
  });

  it('42. Opsi enabled: false mengembalikan teks asli tanpa perubahan', () => {
    const input = 'Kamu tidak boleh pergi sama dia.';
    const res = applyBekasi(input, { enabled: false });
    expect(res.displayText).toBe(input);
    expect(res.changes).toHaveLength(0);
  });

  it('43. Determinisme: pemanggilan berulang menghasilkan output persis sama', () => {
    const input = 'Kamu mau ke mana sama dia nanti?';
    const res1 = applyBekasi(input, { intensity: 'medium' });
    const res2 = applyBekasi(input, { intensity: 'medium' });
    expect(res1.displayText).toBe(res2.displayText);
    expect(res1.changes).toEqual(res2.changes);
  });

  it('44. Peta perubahan (changes) mencatat offset, kata asal, dan kata ganti dengan presisi', () => {
    const input = 'Aku tidak bohong.';
    const res = applyBekasi(input, { intensity: 'medium' });
    expect(res.changes).toHaveLength(3);
    expect(res.changes[0]).toMatchObject({
      original: 'Aku',
      replacement: 'Gue',
      startIndex: 0,
      endIndex: 3
    });
    expect(res.changes[1]).toMatchObject({
      original: 'tidak',
      replacement: 'kagak',
      startIndex: 4,
      endIndex: 9
    });
    expect(res.changes[2]).toMatchObject({
      original: 'bohong',
      replacement: 'boong',
      startIndex: 10,
      endIndex: 16
    });
  });

  it('45. Percakapan panjang campur psikologi & bahasa sehari-hari tetap konsisten', () => {
    const input = 'Saya rasa kamu sedang stres karena tugas kognitif itu sulit sekali, padahal kita sudah belajar bersama.';
    const res = applyBekasi(input, { intensity: 'medium' });
    // Saya -> Gue, kamu -> lu, sedang -> lagi, stres -> stres, sekali -> banget, padahal -> padahal, kita -> kite, sudah -> udah, bersama -> bersama
    expect(res.displayText).toBe(
      'Gue rasa lu lagi stres karena tugas kognitif itu sulit banget, padahal kite udah belajar bersama.'
    );
  });
});
