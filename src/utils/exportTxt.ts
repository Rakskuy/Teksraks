/**
 * exportTxt.ts
 * Mengunduh teks transkripsi sebagai file .txt dengan encoding UTF-8
 * Format: [mm:ss] Nama Pembicara: teks, dengan header judul, tanggal, durasi, pembicara, dan catatan.
 */
import { saveAs } from 'file-saver'
import type { Segment, Speaker } from '../types/session'
import { formatFilename } from './filename'

export interface ExportOptions {
  includeTimestamp?: boolean
  includeSpeaker?: boolean
  useRawText?: boolean // opsi ekspor teks asli (tanpa konversi logat)
}

export interface ExportSessionPayload {
  title: string
  date: string
  notes?: string
  durationFormatted?: string
  speakers: Speaker[]
  segments: Segment[]
}

export function exportTxt(
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

  const lines: string[] = [
    `=== ${session.title || 'Transkripsi Diskusi Mahasiswa Psikologi'} ===`,
    `Tanggal   : ${dateFormatted}`,
  ]

  if (session.durationFormatted) {
    lines.push(`Durasi    : ${session.durationFormatted}`)
  }

  if (speakerNames) {
    lines.push(`Pembicara : ${speakerNames}`)
  }

  if (session.notes && session.notes.trim()) {
    lines.push(`Catatan   : ${session.notes.trim()}`)
  }

  lines.push('============================================================')
  lines.push('')

  session.segments.forEach(seg => {
    const spName = speakerMap.get(seg.speakerId) || 'Pembicara'
    const tsPart = includeTimestamp ? `[${seg.startTime || seg.timestamp}] ` : ''
    const spPart = includeSpeaker ? `${spName}: ` : ''
    const content = useRawText
      ? (seg.rawText || seg.displayText || seg.text)
      : (seg.displayText || seg.text)
    lines.push(`${tsPart}${spPart}${content}`)
    lines.push('') // Baris pemisah antar segmen
  })

  const fullText = lines.join('\n')

  // Menggunakan UTF-8 BOM (\uFEFF) agar simbol dan karakter Indonesia (é, ", —, dll.)
  // terbaca sempurna di seluruh text editor termasuk Windows Notepad.
  const blob = new Blob(['\uFEFF' + fullText], {
    type: 'text/plain;charset=utf-8',
  })

  const filename = formatFilename(session.title, session.date)
  saveAs(blob, `${filename}.txt`)
}
