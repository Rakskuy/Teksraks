/**
 * exportPdf.ts
 * Mengunduh transkripsi diskusi sebagai dokumen PDF (A4) menggunakan `jspdf`.
 *
 * Spesifikasi:
 * - Format: Serupa DOCX, ukuran A4 portrait
 * - Pagination otomatis, teks panjang tidak terpotong
 * - Footer: "Halaman X dari Y" di setiap halaman
 * - Metadata lengkap: Judul, tanggal, durasi, daftar pembicara, catatan
 * - Sanitasi karakter khusus agar simbol & aksen (é, ", —, dll.) tampil sempurna
 * - Opsi timestamp dan label pembicara
 */
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'
import type { ExportSessionPayload, ExportOptions } from './exportTxt'
import { formatFilename } from './filename'

/**
 * Normalisasi karakter unicode tipografi agar aman dirender di core font standard jsPDF (Helvetica)
 * tanpa merusak karakter Latin beraksen seperti é, è, á, ñ, dll.
 */
function normalizeForPdf(str: string): string {
  return str
    .replace(/[\u2014\u2015]/g, ' — ') // em-dash aman
    .replace(/[\u2012\u2013]/g, ' - ')  // en-dash
    .replace(/[\u201C\u201D]/g, '"')     // smart quotes
    .replace(/[\u2018\u2019]/g, "'")     // smart apostrophe
    .replace(/[\u2026]/g, '...')         // ellipsis
}

export function exportPdf(
  session: ExportSessionPayload,
  options: ExportOptions = {},
): void {
  const { includeTimestamp = true, includeSpeaker = true, useRawText = false } = options
  const speakerMap = new Map(session.speakers.map(s => [s.id, s.name]))
  const speakerNames = session.speakers.map(s => s.name).join(', ')

  const dateFormatted = session.date
    ? new Date(session.date + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : session.date

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageW = doc.internal.pageSize.getWidth()   // 210mm
  const pageH = doc.internal.pageSize.getHeight()  // 297mm
  const marginLeft = 20
  const marginRight = 20
  const marginTop = 22
  const marginBottom = 22
  const usableW = pageW - marginLeft - marginRight // 170mm

  let curY = marginTop

  // Helper untuk menambah halaman baru dengan top accent
  const checkNewPage = (neededHeight: number) => {
    if (curY + neededHeight > pageH - marginBottom) {
      doc.addPage()
      curY = marginTop
      drawPageAccent()
    }
  }

  const drawPageAccent = () => {
    // Garis aksen biru atas
    doc.setFillColor(37, 99, 235) // primary-600
    doc.rect(0, 0, pageW, 2.5, 'F')

    // Header kecil di setiap halaman
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184) // slate-400
    doc.text(
      normalizeForPdf(session.title || 'Transkripsi Diskusi Psikologi'),
      pageW - marginRight,
      12,
      { align: 'right' },
    )
  }

  // Draw accent on first page
  drawPageAccent()

  // ── Judul Dokumen ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(30, 58, 138) // blue-900
  const titleLines = doc.splitTextToSize(
    normalizeForPdf(session.title || 'Transkripsi Diskusi Mahasiswa Psikologi'),
    usableW,
  ) as string[]
  for (const line of titleLines) {
    checkNewPage(8)
    doc.text(line, marginLeft, curY)
    curY += 7
  }
  curY += 2

  // ── Kotak Metadata ──
  checkNewPage(30)
  doc.setFillColor(248, 250, 252) // slate-50
  doc.setDrawColor(226, 232, 240) // slate-200
  doc.setLineWidth(0.3)

  // Hitung tinggi kotak metadata dinamis
  const metaLinesCount = session.notes ? 4 : 3
  const metaBoxHeight = metaLinesCount * 5.5 + 4
  doc.roundedRect(marginLeft, curY, usableW, metaBoxHeight, 2, 2, 'FD')

  let metaY = curY + 5
  doc.setFontSize(9)

  // Tanggal
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(51, 65, 85)
  doc.text('Tanggal:', marginLeft + 4, metaY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text(normalizeForPdf(dateFormatted), marginLeft + 35, metaY)
  metaY += 5.5

  // Durasi
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(51, 65, 85)
  doc.text('Durasi Total:', marginLeft + 4, metaY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text(normalizeForPdf(session.durationFormatted || '—'), marginLeft + 35, metaY)
  metaY += 5.5

  // Pembicara
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(51, 65, 85)
  doc.text('Pembicara:', marginLeft + 4, metaY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  const speakersText = doc.splitTextToSize(normalizeForPdf(speakerNames || '—'), usableW - 40)
  doc.text(speakersText[0] || '—', marginLeft + 35, metaY)
  metaY += 5.5

  // Catatan (jika ada)
  if (session.notes && session.notes.trim()) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(51, 65, 85)
    doc.text('Catatan:', marginLeft + 4, metaY)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(71, 85, 105)
    const notesText = doc.splitTextToSize(normalizeForPdf(session.notes.trim()), usableW - 40)
    doc.text(notesText[0] || '', marginLeft + 35, metaY)
  }

  curY += metaBoxHeight + 6

  // ── Judul Bagian Transkrip ──
  checkNewPage(12)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(30, 64, 175) // primary-800
  doc.text('Isi Transkripsi', marginLeft, curY)
  curY += 2

  doc.setDrawColor(203, 213, 225) // slate-300
  doc.setLineWidth(0.4)
  doc.line(marginLeft, curY, pageW - marginRight, curY)
  curY += 6

  // ── Segmen-segmen Transkripsi ──
  const lineHeight = 5.2

  session.segments.forEach(seg => {
    const spName = speakerMap.get(seg.speakerId) || 'Pembicara'
    const tsPart = includeTimestamp ? `[${seg.startTime || seg.timestamp}] ` : ''
    const spPart = includeSpeaker ? `${spName}: ` : ''
    const prefix = `${tsPart}${spPart}`

    const textContent = useRawText
      ? (seg.rawText || seg.displayText || seg.text)
      : (seg.displayText || seg.text)
    const cleanSegmentText = normalizeForPdf(textContent)
    const combinedText = `${prefix}${cleanSegmentText}`

    // Split teks agar pas dengan lebar kolom
    const lines = doc.splitTextToSize(combinedText, usableW) as string[]

    checkNewPage(lines.length * lineHeight + 3)

    lines.forEach((line, lineIdx) => {
      checkNewPage(lineHeight)

      if (lineIdx === 0 && (includeSpeaker || includeTimestamp)) {
        // Baris pertama: beri styling tebal pada prefix jika ada
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(30, 41, 59) // slate-800
        doc.text(line, marginLeft, curY)
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(30, 41, 59)
        doc.text(line, marginLeft, curY)
      }
      curY += lineHeight
    })

    // Spasi antar segmen
    curY += 2.5
  })

  // ── Pagination Pass (Footers) ──
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Garis aksen bawah
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(marginLeft, pageH - 14, pageW - marginRight, pageH - 14)

    // Teks footer
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      'Diproses secara lokal di browser · Rahasia & Aman',
      marginLeft,
      pageH - 9,
    )
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageW - marginRight,
      pageH - 9,
      { align: 'right' },
    )
  }

  const filename = formatFilename(session.title, session.date)
  const blob = doc.output('blob')
  saveAs(blob, `${filename}.pdf`)
}
