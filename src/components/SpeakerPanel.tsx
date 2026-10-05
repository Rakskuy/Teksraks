/**
 * SpeakerPanel.tsx
 * Panel manajemen pembicara: tambah, ganti nama, pilih aktif (klik + shortcut 1-9), hapus
 * Lengkap dengan dukungan Dark Mode dan kontras WCAG AA.
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
  const [editName, setEditName]   = useState('')

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
      className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-in shadow-xs"
      aria-label="Panel manajemen pembicara"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Daftar Pembicara
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            · tekan angka 1–{Math.min(speakers.length, 9)} di keyboard
          </span>
        </div>
        <button
          id="btn-add-speaker"
          type="button"
          onClick={onAdd}
          disabled={speakers.length >= 9}
          title="Tambah pembicara baru (maksimal 9)"
          aria-label="Tambah pembicara"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400
                     hover:bg-primary-50 dark:hover:bg-primary-950/40 px-2.5 py-1.5 rounded-xl border border-primary-200
                     dark:border-primary-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* ── Speaker list ── */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pilihan pembicara">
        {speakers.map((sp, idx) => {
          const isActive  = sp.id === activeSpeakerId
          const isEditing = editingId === sp.id
          const shortcut  = idx < 9 ? idx + 1 : null

          return (
            <div
              key={sp.id}
              className={`
                flex items-center gap-1.5 rounded-xl transition-all duration-200
                ${isActive
                  ? 'border-2 shadow-xs'
                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
              style={
                isActive
                  ? {
                      borderColor: sp.color,
                      backgroundColor: `${sp.color}15`,
                    }
                  : {}
              }
            >
              {isEditing ? (
                /* Edit mode */
                <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                  <input
                    autoFocus
                    id={`speaker-name-input-${sp.id}`}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(sp.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="w-28 text-xs font-semibold bg-transparent border-b border-primary-500
                               text-slate-800 dark:text-slate-100 focus:outline-none"
                    maxLength={30}
                    aria-label={`Ubah nama ${sp.name}`}
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
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Normal mode */
                <>
                  {/* Color dot + name — klik untuk pilih */}
                  <button
                    type="button"
                    id={`btn-speaker-${sp.id}`}
                    onClick={() => onSelect(sp.id)}
                    aria-label={`Pilih pembicara ${sp.name}${shortcut ? ` (tekan tombol ${shortcut})` : ''}`}
                    aria-pressed={isActive}
                    className="flex items-center gap-2 pl-2.5 pr-1 py-1.5 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-shadow"
                      style={{
                        backgroundColor: sp.color,
                        boxShadow: isActive ? `0 0 0 2px #ffffff, 0 0 0 4px ${sp.color}` : 'none',
                      }}
                    />
                    <span
                      className="text-xs font-bold max-w-[110px] truncate text-slate-800 dark:text-slate-200"
                      style={{ color: isActive ? sp.color : undefined }}
                    >
                      {sp.name}
                    </span>
                    {shortcut && (
                      <span className="hidden sm:inline text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1 py-0.2 rounded">
                        {shortcut}
                      </span>
                    )}
                    {isActive && (
                      <Check
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: sp.color }}
                        strokeWidth={3}
                      />
                    )}
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 pr-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(sp)}
                      aria-label={`Ganti nama ${sp.name}`}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {speakers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDelete(sp.id)}
                        aria-label={`Hapus ${sp.name}`}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Tip ── */}
      <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
        Pembicara aktif:{' '}
        <span
          className="font-bold underline decoration-2 underline-offset-2"
          style={{ color: speakers.find(s => s.id === activeSpeakerId)?.color }}
        >
          {speakers.find(s => s.id === activeSpeakerId)?.name ?? '—'}
        </span>
        {' '}· Setiap perkataan yang Anda rekam akan otomatis dilabeli atas nama pembicara aktif ini.
      </p>
    </section>
  )
}
