/**
 * exportDocx.ts
 * Mengunduh transkripsi diskusi sebagai dokumen Word (.docx) menggunakan library `docx`.
 *
 * Spesifikasi:
 * - Font: Calibri / Times New Roman 12pt (size 24)
 * - Spasi 1.5 (spacing: { line: 360 })
 * - Margin standar (1440 twips = 1 inch)
 * - Metadata: Judul (H1 tebal), tanggal, durasi, daftar pembicara, catatan
 * - Transkrip: Nama pembicara dicetak tebal, timestamp abu-abu, teks segmen
 * - Opsi timestamp & pembicara
 * - File-saver untuk unduhan
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer as DocxFooter,
  PageNumber,
} from 'docx'
import { saveAs } from 'file-saver'
import type { ExportSessionPayload, ExportOptions } from './exportTxt'
import { formatFilename } from './filename'

export async function exportDocx(
  session: ExportSessionPayload,
  options: ExportOptions = {},
): Promise<void> {
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

  // Header document
  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: session.title || 'Transkripsi Diskusi Mahasiswa Psikologi',
            font: 'Calibri',
            size: 18, // 9pt
            color: '64748B',
            italics: true,
          }),
        ],
      }),
    ],
  })

  // Footer document dengan nomor halaman
  const footer = new DocxFooter({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Halaman ',
            font: 'Calibri',
            size: 18,
            color: '94A3B8',
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            font: 'Calibri',
            size: 18,
            color: '94A3B8',
          }),
          new TextRun({
            text: ' dari ',
            font: 'Calibri',
            size: 18,
            color: '94A3B8',
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            font: 'Calibri',
            size: 18,
            color: '94A3B8',
          }),
          new TextRun({
            text: '  ·  Diproses secara lokal di browser',
            font: 'Calibri',
            size: 16,
            color: '94A3B8',
          }),
        ],
      }),
    ],
  })

  const children: Paragraph[] = [
    // Judul
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: session.title || 'Transkripsi Diskusi Mahasiswa Psikologi',
          font: 'Calibri',
          bold: true,
          size: 36, // 18pt
          color: '1E40AF',
        }),
      ],
      spacing: { after: 160 },
    }),

    // Metadata Tanggal
    new Paragraph({
      children: [
        new TextRun({
          text: 'Tanggal: ',
          font: 'Calibri',
          bold: true,
          size: 22, // 11pt
          color: '334155',
        }),
        new TextRun({
          text: dateFormatted,
          font: 'Calibri',
          size: 22,
          color: '475569',
        }),
      ],
      spacing: { after: 80 },
    }),

    // Metadata Durasi
    new Paragraph({
      children: [
        new TextRun({
          text: 'Durasi Total: ',
          font: 'Calibri',
          bold: true,
          size: 22,
          color: '334155',
        }),
        new TextRun({
          text: session.durationFormatted || '—',
          font: 'Calibri',
          size: 22,
          color: '475569',
        }),
      ],
      spacing: { after: 80 },
    }),

    // Metadata Pembicara
    new Paragraph({
      children: [
        new TextRun({
          text: 'Daftar Pembicara: ',
          font: 'Calibri',
          bold: true,
          size: 22,
          color: '334155',
        }),
        new TextRun({
          text: speakerNames || '—',
          font: 'Calibri',
          size: 22,
          color: '475569',
        }),
      ],
      spacing: { after: session.notes ? 80 : 240 },
    }),
  ]

  // Catatan (opsional)
  if (session.notes && session.notes.trim()) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Catatan Sesi: ',
            font: 'Calibri',
            bold: true,
            size: 22,
            color: '334155',
          }),
          new TextRun({
            text: session.notes.trim(),
            font: 'Calibri',
            size: 22,
            italics: true,
            color: '475569',
          }),
        ],
        spacing: { after: 240 },
      }),
    )
  }

  // Heading Transkrip
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: 'Isi Transkripsi',
          font: 'Calibri',
          bold: true,
          size: 28, // 14pt
          color: '1E3A8A',
        }),
      ],
      spacing: { before: 240, after: 180 },
    }),
  )

  // Segmen-segmen transkrip
  session.segments.forEach(seg => {
    const spName = speakerMap.get(seg.speakerId) || 'Pembicara'
    const runs: TextRun[] = []

    if (includeTimestamp) {
      runs.push(
        new TextRun({
          text: `[${seg.startTime || seg.timestamp}] `,
          font: 'Calibri',
          size: 20, // 10pt
          color: '64748B',
        }),
      )
    }

    if (includeSpeaker) {
      runs.push(
        new TextRun({
          text: `${spName}: `,
          font: 'Calibri',
          bold: true,
          size: 24, // 12pt
          color: '0F172A',
        }),
      )
    }

    const textContent = useRawText
      ? (seg.rawText || seg.displayText || seg.text)
      : (seg.displayText || seg.text)

    runs.push(
      new TextRun({
        text: textContent,
        font: 'Calibri',
        size: 24, // 12pt
        color: '1E293B',
      }),
    )

    children.push(
      new Paragraph({
        children: runs,
        spacing: {
          line: 360,  // Spasi 1.5
          after: 160, // Jarak antar paragraf
        },
      }),
    )
  })

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          run: {
            font: 'Calibri',
            size: 24, // 12pt
          },
          paragraph: {
            spacing: { line: 360 }, // 1.5 line spacing
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch = 1440 twips (margin standar)
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const filename = formatFilename(session.title, session.date)
  saveAs(blob, `${filename}.docx`)
}
