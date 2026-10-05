/**
 * personalDictionary.ts
 * Manajemen Kamus Pribadi (Personal Dictionary) yang disimpan di localStorage.
 * Memungkinkan pengguna:
 * 1. Menambahkan pemetaan kata kustom (Baku <-> Bekasi) dengan prioritas di atas kamus bawaan
 * 2. Menambahkan daftar kata pengecualian kustom
 * 3. Ekspor & Impor berkas format JSON
 */

import type { LexiconEntry } from './bekasiLexicon';

export interface PersonalLexiconEntry {
  id: string;
  standard: string;
  bekasi: string;
  confidence: 'high' | 'medium' | 'low';
  risky: boolean;
  notes?: string;
  createdAt: number;
}

export interface PersonalDictionaryData {
  version: number;
  entries: PersonalLexiconEntry[];
  exceptions: string[];
  updatedAt: number;
}

const STORAGE_KEY = 'psikologi-stt-personal-dictionary';

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Ignore error in restricted environments
  }
  return null;
}

function getDefaultPersonalData(): PersonalDictionaryData {
  return {
    version: 1,
    entries: [],
    exceptions: [],
    updatedAt: Date.now()
  };
}

/**
 * Memuat kamus pribadi dari localStorage.
 */
export function loadPersonalDictionary(): PersonalDictionaryData {
  const storage = getStorage();
  if (!storage) return getDefaultPersonalData();

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPersonalData();
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.entries) && Array.isArray(parsed.exceptions)) {
      return parsed as PersonalDictionaryData;
    }
  } catch {
    // Abaikan jika format corrupt, kembalikan default
  }
  return getDefaultPersonalData();
}

/**
 * Menyimpan kamus pribadi ke localStorage.
 */
export function savePersonalDictionary(data: PersonalDictionaryData): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const payload = {
      ...data,
      updatedAt: Date.now()
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Menambahkan atau memperbarui entri kata di kamus pribadi.
 */
export function addOrUpdatePersonalWord(
  standard: string,
  bekasi: string,
  options?: { notes?: string; confidence?: 'high' | 'medium' | 'low'; risky?: boolean }
): PersonalLexiconEntry {
  const data = loadPersonalDictionary();
  const stdLower = standard.trim().toLowerCase();
  const bekasiClean = bekasi.trim();

  // Cari apakah sudah ada entri dengan kata baku yang sama
  const existingIdx = data.entries.findIndex(
    e => e.standard.toLowerCase() === stdLower
  );

  const entry: PersonalLexiconEntry = {
    id: existingIdx >= 0 ? data.entries[existingIdx].id : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    standard: standard.trim(),
    bekasi: bekasiClean,
    confidence: options?.confidence || 'high',
    risky: options?.risky || false,
    notes: options?.notes || 'Entri Kamus Pribadi Pengguna',
    createdAt: existingIdx >= 0 ? data.entries[existingIdx].createdAt : Date.now()
  };

  if (existingIdx >= 0) {
    data.entries[existingIdx] = entry;
  } else {
    data.entries.push(entry);
  }

  savePersonalDictionary(data);
  return entry;
}

/**
 * Menghapus entri kata dari kamus pribadi.
 */
export function deletePersonalWord(id: string): void {
  const data = loadPersonalDictionary();
  data.entries = data.entries.filter(e => e.id !== id);
  savePersonalDictionary(data);
}

/**
 * Menambahkan kata ke daftar pengecualian pribadi.
 */
export function addPersonalException(word: string): void {
  const data = loadPersonalDictionary();
  const clean = word.trim().toLowerCase();
  if (clean && !data.exceptions.includes(clean)) {
    data.exceptions.push(clean);
    savePersonalDictionary(data);
  }
}

/**
 * Menghapus kata dari daftar pengecualian pribadi.
 */
export function deletePersonalException(word: string): void {
  const data = loadPersonalDictionary();
  const clean = word.trim().toLowerCase();
  data.exceptions = data.exceptions.filter(e => e.toLowerCase() !== clean);
  savePersonalDictionary(data);
}

/**
 * Mengubah entri kamus pribadi ke bentuk LexiconEntry untuk digabungkan ke pipeline transform.
 */
export function getPersonalLexiconEntries(): LexiconEntry[] {
  const data = loadPersonalDictionary();
  return data.entries.map(e => ({
    standard: e.standard,
    bekasi: e.bekasi,
    confidence: e.confidence,
    risky: e.risky,
    category: 'general',
    note: e.notes || 'Entri Kamus Pribadi'
  }));
}

/**
 * Ekspor kamus pribadi ke string JSON.
 */
export function exportPersonalDictionaryJson(): string {
  const data = loadPersonalDictionary();
  return JSON.stringify(data, null, 2);
}

/**
 * Impor kamus pribadi dari string JSON (merge atau replace).
 */
export function importPersonalDictionaryJson(
  jsonStr: string,
  mode: 'merge' | 'replace' = 'merge'
): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !Array.isArray(parsed.entries) || !Array.isArray(parsed.exceptions)) {
      return { success: false, count: 0, error: 'Format berkas JSON tidak valid. Harus memuat array entries dan exceptions.' };
    }

    if (mode === 'replace') {
      const newData: PersonalDictionaryData = {
        version: 1,
        entries: parsed.entries,
        exceptions: parsed.exceptions.map((w: string) => String(w).trim().toLowerCase()),
        updatedAt: Date.now()
      };
      savePersonalDictionary(newData);
      return { success: true, count: newData.entries.length + newData.exceptions.length };
    }

    // Mode Merge
    const current = loadPersonalDictionary();
    let addedCount = 0;

    for (const newEntry of parsed.entries) {
      if (newEntry && newEntry.standard && newEntry.bekasi) {
        const stdLower = String(newEntry.standard).trim().toLowerCase();
        const existingIdx = current.entries.findIndex(
          e => e.standard.toLowerCase() === stdLower
        );
        const entry: PersonalLexiconEntry = {
          id: existingIdx >= 0 ? current.entries[existingIdx].id : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          standard: String(newEntry.standard).trim(),
          bekasi: String(newEntry.bekasi).trim(),
          confidence: newEntry.confidence || 'high',
          risky: Boolean(newEntry.risky),
          notes: newEntry.notes || 'Entri Impor JSON',
          createdAt: existingIdx >= 0 ? current.entries[existingIdx].createdAt : Date.now()
        };
        if (existingIdx >= 0) {
          current.entries[existingIdx] = entry;
        } else {
          current.entries.push(entry);
        }
        addedCount++;
      }
    }

    for (const exc of parsed.exceptions) {
      if (typeof exc === 'string' && exc.trim()) {
        const clean = exc.trim().toLowerCase();
        if (!current.exceptions.includes(clean)) {
          current.exceptions.push(clean);
          addedCount++;
        }
      }
    }

    savePersonalDictionary(current);
    return { success: true, count: addedCount };
  } catch (err) {
    return { success: false, count: 0, error: err instanceof Error ? err.message : 'Gagal membaca berkas JSON' };
  }
}
