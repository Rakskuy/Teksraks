import { useState, useRef } from 'react'
import {
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  BookOpen,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import {
  loadPersonalDictionary,
  addOrUpdatePersonalWord,
  deletePersonalWord,
  addPersonalException,
  deletePersonalException,
  exportPersonalDictionaryJson,
  importPersonalDictionaryJson,
  PersonalLexiconEntry
} from '../dialect'

interface PersonalDictionaryModalProps {
  isOpen: boolean
  onClose: () => void
  onDictionaryUpdated?: () => void
}

export default function PersonalDictionaryModal({
  isOpen,
  onClose,
  onDictionaryUpdated
}: PersonalDictionaryModalProps) {
  const [activeTab, setActiveTab] = useState<'lexicon' | 'exceptions'>('lexicon')
  const [dictData, setDictData] = useState(() => loadPersonalDictionary())

  // Form input kata khusus
  const [standardInput, setStandardInput] = useState('')
  const [bekasiInput, setBekasiInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form input pengecualian
  const [exceptionInput, setExceptionInput] = useState('')

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')

  // Notification feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const refreshData = () => {
    const updated = loadPersonalDictionary()
    setDictData(updated)
    onDictionaryUpdated?.()
  }

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3000)
  }

  // ── Tambah / Edit Entri Kata ──────────────────────────────────────────────
  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!standardInput.trim() || !bekasiInput.trim()) {
      showFeedback('error', 'Kata baku dan kata Bekasi wajib diisi.')
      return
    }

    addOrUpdatePersonalWord(standardInput, bekasiInput, {
      confidence: 'high',
      notes: editingId ? 'Diedit oleh pengguna' : 'Ditambahkan pengguna'
    })

    setStandardInput('')
    setBekasiInput('')
    setEditingId(null)
    refreshData()
    showFeedback('success', `Kata "${standardInput.trim()}" berhasil disimpan ke Kamus Pribadi!`)
  }

  const handleStartEdit = (entry: PersonalLexiconEntry) => {
    setEditingId(entry.id)
    setStandardInput(entry.standard)
    setBekasiInput(entry.bekasi)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setStandardInput('')
    setBekasiInput('')
  }

  const handleDeleteWord = (id: string, word: string) => {
    deletePersonalWord(id)
    refreshData()
    showFeedback('success', `Kata "${word}" dihapus dari Kamus Pribadi.`)
  }

  // ── Tambah / Hapus Pengecualian ───────────────────────────────────────────
  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault()
    if (!exceptionInput.trim()) return

    addPersonalException(exceptionInput)
    setExceptionInput('')
    refreshData()
    showFeedback('success', `"${exceptionInput.trim()}" ditambahkan ke daftar pengecualian.`)
  }

  const handleDeleteException = (word: string) => {
    deletePersonalException(word)
    refreshData()
    showFeedback('success', `"${word}" dihapus dari daftar pengecualian.`)
  }

  // ── Ekspor JSON ───────────────────────────────────────────────────────────
  const handleExportJson = () => {
    const jsonStr = exportPersonalDictionaryJson()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kamus-pribadi-bekasi-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showFeedback('success', 'Kamus Pribadi berhasil diekspor ke berkas JSON.')
  }

  // ── Impor JSON ────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (!content) return

      const result = importPersonalDictionaryJson(content, 'merge')
      if (result.success) {
        refreshData()
        showFeedback('success', `Berhasil mengimpor ${result.count} data ke Kamus Pribadi!`)
      } else {
        showFeedback('error', result.error || 'Gagal membaca berkas JSON.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Filter list
  const filteredEntries = dictData.entries.filter(
    e =>
      e.standard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.bekasi.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredExceptions = dictData.exceptions.filter(e =>
    e.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Halaman Kamus Pribadi"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Kamus Pribadi (Kustomisasi Logat)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur pemetaan kata baku ↔ Bekasi dan kata pengecualian kustom Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-b border-red-200 dark:border-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Navigation & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('lexicon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'lexicon'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Kata Khusus ({dictData.entries.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exceptions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'exceptions'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pengecualian ({dictData.exceptions.length})
            </button>
          </div>

          <input
            type="text"
            placeholder="Cari kata di kamus..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Konten Tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'lexicon' ? (
            <div className="space-y-4">
              {/* Form Tambah/Edit */}
              <form onSubmit={handleSaveWord} className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-800/60 space-y-3">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                  {editingId ? 'Edit Entri Kata Pribadi' : 'Tambah Pemetaan Kata Baru (Prioritas Utama)'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      Kata Baku:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: bagaimana"
                      value={standardInput}
                      onChange={e => setStandardInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      Padanan Bekasi:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: pegimane"
                      value={bekasiInput}
                      onChange={e => setBekasiInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end pt-1">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingId ? 'Simpan Perubahan' : 'Tambah ke Kamus'}</span>
                  </button>
                </div>
              </form>

              {/* Daftar Kata Khusus */}
              {filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  {dictData.entries.length === 0
                    ? 'Belum ada kata khusus. Tambahkan kata di atas atau via fitur klik-kata pada transkrip.'
                    : 'Tidak ada kata yang cocok dengan pencarian.'}
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs">
                            {entry.standard}
                          </span>
                          <span className="text-slate-400 text-xs">→</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                            {entry.bekasi}
                          </span>
                        </div>
                        {entry.notes && (
                          <div className="text-[10px] text-slate-400 italic">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(entry)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWord(entry.id, entry.standard)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md"
                          title="Hapus entri"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Form Tambah Pengecualian */}
              <form onSubmit={handleAddException} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary-500" />
                  Tambah Kata Pengecualian (Jangan Pernah Diubah)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kata di daftar ini akan selalu diabaikan oleh transformasi logat Bekasi.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: skripsi, dekanat, konselor"
                    value={exceptionInput}
                    onChange={e => setExceptionInput(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </form>

              {/* Tag Pengecualian */}
              {filteredExceptions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  {dictData.exceptions.length === 0
                    ? 'Belum ada kata pengecualian kustom.'
                    : 'Tidak ada kata yang cocok dengan pencarian.'}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredExceptions.map(exc => (
                    <span
                      key={exc}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700"
                    >
                      <span>{exc}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteException(exc)}
                        className="text-slate-400 hover:text-red-500"
                        title="Hapus pengecualian"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Modal: Ekspor & Impor JSON */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-primary-500" />
              <span>Ekspor JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span>Impor JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}
