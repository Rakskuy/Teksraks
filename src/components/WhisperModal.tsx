/**
 * WhisperModal.tsx
 * Dialog modal untuk mesin transkripsi kedua menggunakan Whisper (OpenAI / Groq API).
 * Mendukung:
 * 1. Unggah berkas audio (MP3, WAV, M4A, WebM, OGG, FLAC hingga 25MB)
 * 2. Rekam audio langsung di browser lalu proses
 * 3. Pengaturan API Key lokal & prompt primer logat Bekasi
 * 4. Peringatan privasi pihak ketiga & persetujuan eksplisit sebelum kirim
 * 5. Integrasi hasil langsung ke pipeline segmen sesi transkrip
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  X,
  Upload,
  Mic,
  Key,
  Settings,
  ShieldAlert,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  FileAudio,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'
import {
  type WhisperSettings,
  DEFAULT_BEKASI_PROMPT,
  DEFAULT_WHISPER_SETTINGS,
} from '../types/whisper'
import {
  loadWhisperSettings,
  saveWhisperSettings,
  transcribeAudioWithWhisper,
  mapWhisperResponseToSegments,
} from '../utils/whisperClient'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import type { Segment, Speaker } from '../types/session'
import type { DialectMode, DialectIntensity } from '../dialect'

interface WhisperModalProps {
  isOpen: boolean
  onClose: () => void
  speakers: Speaker[]
  activeSpeakerId: string
  dialectMode: DialectMode
  dialectIntensity: DialectIntensity
  onSegmentsTranscribed: (segments: Segment[]) => void
}

export default function WhisperModal({
  isOpen,
  onClose,
  speakers,
  activeSpeakerId,
  dialectMode,
  dialectIntensity,
  onSegmentsTranscribed,
}: WhisperModalProps) {
  // ── Mode Tab ─────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<'upload' | 'record' | 'settings'>('upload')

  // ── File Selection ───────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileAudioUrl, setFileAudioUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Direct Audio Recording ───────────────────────────────────────────────
  const recorder = useAudioRecorder()

  // ── Settings ─────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<WhisperSettings>(loadWhisperSettings)
  const [showApiKey, setShowApiKey] = useState(false)
  const [targetSpeakerId, setTargetSpeakerId] = useState(activeSpeakerId)

  // ── Privacy Explicit Consent ─────────────────────────────────────────────
  const [privacyConsent, setPrivacyConsent] = useState(false)

  // ── Processing State ─────────────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{ segmentCount: number; wordCount: number } | null>(null)

  // Sinkronisasi target speaker saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setTargetSpeakerId(activeSpeakerId)
      setErrorMsg(null)
      setSuccessInfo(null)
    }
  }, [isOpen, activeSpeakerId])

  // Cleanup object URL file upload
  useEffect(() => {
    return () => {
      if (fileAudioUrl) {
        URL.revokeObjectURL(fileAudioUrl)
      }
    }
  }, [fileAudioUrl])

  // Simpan pengaturan otomatis saat berubah
  const handleUpdateSettings = (updates: Partial<WhisperSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      // Jika provider ganti, sesuaikan model default
      if (updates.provider && updates.provider !== prev.provider) {
        next.model = DEFAULT_WHISPER_SETTINGS[updates.provider].model
      }
      saveWhisperSettings(next)
      return next
    })
  }

  // Handle file drop & select
  const handleFileChange = (file: File | null) => {
    if (fileAudioUrl) {
      URL.revokeObjectURL(fileAudioUrl)
      setFileAudioUrl(null)
    }
    setErrorMsg(null)
    setSuccessInfo(null)

    if (file) {
      const validTypes = ['audio/', 'video/mp4', 'video/webm', 'video/ogg']
      const isValid = validTypes.some(t => file.type.startsWith(t)) || file.name.match(/\.(mp3|wav|m4a|webm|ogg|flac|mp4|aac)$/i)
      if (!isValid) {
        setErrorMsg('Format berkas tidak didukung. Harap pilih berkas audio (MP3, WAV, M4A, WebM, OGG, atau FLAC).')
        setSelectedFile(null)
        return
      }

      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('Ukuran berkas melebihi batas 25 MB. Silakan kompres audio terlebih dahulu.')
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setFileAudioUrl(URL.createObjectURL(file))
    } else {
      setSelectedFile(null)
    }
  }

  // Audio yang akan dikirim (dari file atau rekaman langsung)
  const audioToSend: Blob | File | null = useMemo(() => {
    if (tab === 'upload') return selectedFile
    if (tab === 'record') return recorder.audioBlob
    return null
  }, [tab, selectedFile, recorder.audioBlob])

  // Validasi kesiapan proses
  const isReadyToProcess = Boolean(
    audioToSend &&
    settings.apiKey.trim() &&
    privacyConsent &&
    !isProcessing &&
    !recorder.isRecording
  )

  // Eksekusi Transkripsi Whisper
  const handleProcessAudio = async () => {
    if (!audioToSend) {
      setErrorMsg('Pilih berkas audio atau rekam suara terlebih dahulu.')
      return
    }

    if (!settings.apiKey.trim()) {
      setTab('settings')
      setErrorMsg(`Harap masukkan API Key ${settings.provider.toUpperCase()} Anda terlebih dahulu.`)
      return
    }

    if (!privacyConsent) {
      setErrorMsg('Harap berikan centang persetujuan eksplisit pengiriman data ke server pihak ketiga.')
      return
    }

    setIsProcessing(true)
    setErrorMsg(null)
    setSuccessInfo(null)
    setProgressMsg('Menghubungkan ke API Whisper...')

    try {
      const response = await transcribeAudioWithWhisper(audioToSend, settings, msg => {
        setProgressMsg(msg)
      })

      setProgressMsg('Menerapkan pemetaan segmen dan leksikon logat...')
      const newSegments = mapWhisperResponseToSegments(response, {
        speakerId: targetSpeakerId,
        dialectMode,
        dialectIntensity,
      })

      if (newSegments.length === 0) {
        throw new Error('Tidak ada ucapan terdeteksi dalam berkas audio ini.')
      }

      const totalWords = newSegments.reduce(
        (sum, s) => sum + (s.displayText.trim() ? s.displayText.trim().split(/\s+/).length : 0),
        0,
      )

      onSegmentsTranscribed(newSegments)
      setSuccessInfo({
        segmentCount: newSegments.length,
        wordCount: totalWords,
      })

      // Bersihkan audio setelah sukses
      if (tab === 'record') {
        recorder.resetRecording()
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses audio.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whisper-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-600/10 via-primary-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="whisper-modal-title" className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Transkripsi Whisper</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  Mesin Ke-2 (Groq / OpenAI)
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah berkas rekaman atau rekam langsung dengan model Whisper AI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela Whisper"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 sm:px-5 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all ${
              tab === 'upload'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Berkas Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('record')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all ${
              tab === 'record'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Rekam Lalu Proses</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('settings')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all ml-auto ${
              tab === 'settings'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan API</span>
            {!settings.apiKey && (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="API Key belum diisi" />
            )}
          </button>
        </div>

        {/* ── Modal Body Content ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-300 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Gagal: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successInfo && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Transkripsi Berhasil! </span>
                <span>
                  {successInfo.segmentCount} segmen ({successInfo.wordCount.toLocaleString('id-ID')} kata) berhasil ditambahkan ke sesi diskusi dan siap diedit/diekspor.
                </span>
              </div>
            </div>
          )}

          {/* ── TAB 1: UNGGAH BERKAS ── */}
          {tab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.flac,.mp4,.aac"
                className="hidden"
                onChange={e => handleFileChange(e.target.files?.[0] || null)}
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    handleFileChange(e.dataTransfer.files?.[0] || null)
                  }}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center gap-2 group"
                >
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-xs group-hover:scale-110 transition-transform">
                    <FileAudio className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Klik atau seret berkas audio ke sini
                  </p>
                  <p className="text-xs text-slate-400">
                    Mendukung MP3, WAV, M4A, WebM, OGG, FLAC (Maks. 25 MB)
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileAudio className="w-6 h-6 text-violet-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'audio'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFileChange(null)}
                      className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors font-medium"
                    >
                      Ganti Berkas
                    </button>
                  </div>

                  {fileAudioUrl && (
                    <audio controls src={fileAudioUrl} className="w-full h-8" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: REKAM LANGSUNG ── */}
          {tab === 'record' && (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center space-y-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100">
                  {Math.floor(recorder.durationSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(recorder.durationSeconds % 60).toString().padStart(2, '0')}
                </span>

                {recorder.isRecording && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span>Merekam Audio Mikrofon...</span>
                  </div>
                )}
                {recorder.isPaused && (
                  <span className="text-xs text-amber-600 font-semibold">Rekaman Dijeda</span>
                )}
              </div>

              {/* Sound level visualizer */}
              {recorder.isRecording && (
                <div className="w-48 h-2 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 transition-all duration-100"
                    style={{ width: `${recorder.audioLevel}%` }}
                  />
                </div>
              )}

              {/* Recorder Actions */}
              <div className="flex items-center justify-center gap-3">
                {!recorder.isRecording && !recorder.isPaused ? (
                  <button
                    type="button"
                    onClick={recorder.startRecording}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-md active:scale-95 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Mulai Rekam Suara</span>
                  </button>
                ) : (
                  <>
                    {recorder.isRecording ? (
                      <button
                        type="button"
                        onClick={recorder.pauseRecording}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-amber-600 border border-amber-300 dark:border-amber-600"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Jeda</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={recorder.resumeRecording}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Play className="w-4 h-4" />
                        <span>Lanjut</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={recorder.stopRecording}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900"
                    >
                      <span>Selesai Rekam</span>
                    </button>
                  </>
                )}

                {recorder.audioBlob && !recorder.isRecording && (
                  <button
                    type="button"
                    onClick={recorder.resetRecording}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"
                    title="Ulangi rekaman"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Recorded preview */}
              {recorder.audioUrl && (
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400 mb-1">Pratinjau Hasil Rekaman:</p>
                  <audio controls src={recorder.audioUrl} className="w-full h-8" />
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: PENGATURAN API ── */}
          {tab === 'settings' && (
            <div className="space-y-4 text-xs">
              {/* Provider Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Penyedia Layanan API:
                </label>
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  {(['groq', 'openai'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleUpdateSettings({ provider: p })}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        settings.provider === p
                          ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full font-bold">
                        <span>{p === 'groq' ? '⚡ Groq Cloud' : '🤖 OpenAI Whisper'}</span>
                        {p === 'groq' && (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                            Super Cepat
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] opacity-80 mt-0.5">
                        {p === 'groq' ? 'whisper-large-v3-turbo' : 'whisper-1'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  API Key {settings.provider.toUpperCase()}:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={e => handleUpdateSettings({ apiKey: e.target.value })}
                    placeholder={`Masukkan API key ${settings.provider === 'groq' ? 'gsk_...' : 'sk-...'}`}
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs focus:ring-2 focus:ring-violet-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  🔒 API Key disimpan <strong>hanya di perangkat lokal Anda</strong> (localStorage browser). Tidak pernah dikirim ke server aplikasi ini.
                </p>
              </div>

              {/* Prompt Primer Logat Bekasi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Prompt Konteks Bahasa (Gaya Bicara Bekasi):
                  </label>
                  <button
                    type="button"
                    onClick={() => handleUpdateSettings({ prompt: DEFAULT_BEKASI_PROMPT })}
                    className="text-[10px] text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    Reset ke Default
                  </button>
                </div>
                <textarea
                  value={settings.prompt}
                  onChange={e => handleUpdateSettings({ prompt: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-violet-400 focus:outline-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Prompt ini memandu model Whisper agar mempertahankan kosakata informal dan dialek daerah, alih-alih memformalkan kalimat secara berlebihan.
                </p>
              </div>
            </div>
          )}

          {/* ── Metadata Pembicara & Dialek ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Label Pembicara:
              </label>
              <select
                value={targetSpeakerId}
                onChange={e => setTargetSpeakerId(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                {speakers.map(sp => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Mode Logat Aktif:
              </label>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium">
                <span>{dialectMode === 'bekasi' ? '🗣️ Logat Bekasi' : '📝 Standar Baku'}</span>
                {dialectMode === 'bekasi' && (
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    Intensitas: {dialectIntensity}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── PERINGATAN PRIVASI & PERSETUJUAN EKSPLISIT ── */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/50 dark:border-amber-700/50 text-xs space-y-2">
            <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Peringatan Privasi Pemrosesan Audio Pihak Ketiga:</p>
                <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                  Audio yang Anda proses akan dikirim langsung dari peramban ke server penyedia AI ({settings.provider === 'groq' ? 'Groq Inc.' : 'OpenAI Inc.'}).
                  Pastikan Anda tidak mengunggah data rekaman klien atau pasien psikologi yang memuat identitas sensitif tanpa persetujuan tertulis (*informed consent*).
                </p>
              </div>
            </div>

            <label className="flex items-start gap-2 pt-1 border-t border-amber-200/50 dark:border-amber-800/40 cursor-pointer select-none">
              <input
                type="checkbox"
                id="checkbox-whisper-privacy"
                checked={privacyConsent}
                onChange={e => setPrivacyConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-violet-600 focus:ring-violet-500 border-amber-400 dark:bg-slate-900"
              />
              <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                Saya memahami dan memberikan persetujuan eksplisit untuk mengirimkan audio ini ke API {settings.provider.toUpperCase()} untuk ditranskripsikan.
              </span>
            </label>
          </div>
        </div>

        {/* ── Modal Footer Bar ── */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isProcessing && (
              <span className="flex items-center gap-1.5 font-medium text-violet-600 dark:text-violet-400 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{progressMsg}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Tutup
            </button>

            <button
              type="button"
              id="btn-execute-whisper"
              onClick={handleProcessAudio}
              disabled={!isReadyToProcess}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-primary-600 hover:from-violet-700 hover:to-primary-700 shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mentranskripsi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Mulai Transkripsi ({settings.provider.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
