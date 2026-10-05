/**
 * SpeakerPanel.tsx
 * Panel manajemen pembicara yang ringkas dalam satu baris (horizontal chips):
 * - Memilih pembicara aktif langsung dengan mengetuk chip
 * - Tambah pembicara baru (+ Tambah)
 * - Ubah nama atau hapus pembicara
 */

import { useState } from 'react'
import { UserPlus, Check, Pencil, Trash2, X, Users } from 'lucide-react'
import type { Speaker } from '../types/session'

interface SpeakerPanelProps {
  speakers: Speaker[]
  activeSpeakerId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export default function SpeakerPanel({
  speakers,
  activeSpeakerId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: SpeakerPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const startEdit = (sp: Speaker) => {
    setEditingId(sp.id)
    setEditName(sp.name)
  }

  const commitEdit = (id: string) => {
    if (editName.trim()) onRename(id, editName.trim())
    setEditingId(null)
  }

  const cancelEdit = () => setEditingId(null)

  return (
    <section
      className="glass-card rounded-2xl px-3.5 sm:px-4 py-2.5 animate-fade-in shadow-xs"
      aria-label="Panel pemilihan pembicara aktif"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Label ringkas */}
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1 flex-shrink-0">
          <Users className="w-3.5 h-3.5" />
          <span>Pembicara:</span>
        </span>

        {/* Daftar Chips Pembicara */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0" role="group" aria-label="Pilihan pembicara">
          {speakers.map((sp, idx) => {
            const isActive = sp.id === activeSpeakerId
            const isEditing = editingId === sp.id
            const shortcut = idx < 9 ? idx + 1 : null

            if (isEditing) {
              return (
                <div
                  key={sp.id}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600"
                >
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(sp.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="w-24 text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
                    maxLength={25}
                  />
                  <button
                    type="button"
                    onClick={() => commitEdit(sp.id)}
                    aria-label="Simpan nama"
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 p-0.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    aria-label="Batal ubah nama"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            }

            return (
              <div
                key={sp.id}
                className={`group/chip inline-flex items-center rounded-xl transition-all duration-150 border ${
                  isActive
                    ? 'border-slate-800 dark:border-white shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/80'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${sp.color}15`,
                        borderColor: sp.color,
                      }
                    : {}
                }
              >
                <button
                  type="button"
                  id={`btn-speaker-${sp.id}`}
                  onClick={() => onSelect(sp.id)}
                  aria-pressed={isActive}
                  aria-label={`Pilih pembicara ${sp.name}${shortcut ? ` (tekan tombol ${shortcut})` : ''}`}
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-semibold focus:outline-none"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sp.color }}
                  />
                  <span
                    className="truncate max-w-[120px]"
                    style={{ color: isActive ? sp.color : undefined }}
                  >
                    {sp.name}
                  </span>
                  {isActive ? (
                    <Check className="w-3 h-3 stroke-[3]" style={{ color: sp.color }} />
                  ) : shortcut ? (
                    <span className="hidden sm:inline text-[10px] font-mono text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-1 py-0.2 rounded">
                      {shortcut}
                    </span>
                  ) : null}
                </button>

                {/* Edit & Hapus (tampil saat hover / fokus) */}
                <div className="flex items-center pr-1.5 opacity-60 group-hover/chip:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => startEdit(sp)}
                    aria-label={`Ubah nama ${sp.name}`}
                    title="Ubah nama pembicara"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  {speakers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDelete(sp.id)}
                      aria-label={`Hapus ${sp.name}`}
                      title="Hapus pembicara ini"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Tombol Tambah Pembicara */}
          <button
            type="button"
            id="btn-add-speaker"
            onClick={onAdd}
            disabled={speakers.length >= 9}
            aria-label="Tambah pembicara baru"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 px-2.5 py-1 rounded-xl border border-dashed border-primary-300 dark:border-primary-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>
    </section>
  )
}
