/**
 * Membersihkan judul dan tanggal agar aman digunakan sebagai nama file:
 * Format: transkrip-[judul]-[YYYY-MM-DD]
 * Karakter ilegal (<>:"/\|?*) dibersihkan.
 */
export function formatFilename(title: string, date: string): string {
  const cleanTitle = (title || 'diskusi')
    .trim()
    .toLowerCase()
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Hapus karakter ilegal OS
    .replace(/\s+/g, '-')                  // Ganti spasi dengan strip
    .replace(/-+/g, '-')                   // Gabungkan strip berulang
    .replace(/^[-.]+|[-.]+$/g, '')          // Hapus strip di awal/akhir
    .slice(0, 60)                          // Batasi panjang nama
    || 'diskusi'

  const cleanDate = (date || new Date().toISOString().slice(0, 10))
    .trim()
    .replace(/[^0-9-]/g, '')

  return `transkrip-${cleanTitle}-${cleanDate}`
}
