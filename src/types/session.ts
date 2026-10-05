// ============================================================
// Session types — Speaker, Segment, SessionData, Stats
// ============================================================

export const SPEAKER_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#84CC16', // lime
  '#F97316', // orange
] as const

import type { DialectChange } from '../dialect'

export interface Speaker {
  id: string
  name: string
  color: string
}

export interface Segment {
  id: string
  speakerId: string
  startTime: string  // "mm:ss" atau "hh:mm:ss" relatif dari mulai rekaman
  rawText: string
  displayText: string
  dialectChanges: DialectChange[]
  edited: boolean
  /** Alias kompatibilitas mundur ke displayText */
  text: string
  /** Alias kompatibilitas mundur ke startTime */
  timestamp: string
  relativeMs?: number
}

export const SESSION_VERSION = 1

export interface SessionData {
  version: number
  title: string
  date: string        // YYYY-MM-DD
  notes: string
  speakers: Speaker[]
  segments: Segment[]
  createdAt: number   // Unix ms
  updatedAt: number
}

export interface SpeakerStats {
  speaker: Speaker
  segmentCount: number
  wordCount: number
}

export interface SessionStats {
  totalSegments: number
  totalWords: number
  totalChars: number
  durationMs: number
  durationFormatted: string
  perSpeaker: SpeakerStats[]
}
