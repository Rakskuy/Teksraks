/**
 * App.tsx
 * Root component aplikasi "Speech to Text untuk Diskusi Mahasiswa Psikologi".
 * Mengorkestrasi:
 * 1. Privasi data psikologi (catatan jelas, persetujuan sebelum rekam, hapus semua data)
 * 2. Aksesibilitas (WCAG AA, navigasi keyboard, dark mode)
 * 3. Tips perekaman audio berkualitas di UI
 * 4. Modal panduan Cara Pakai
 * 5. Peringatan beforeunload jika ada transkrip belum diunduh
 * 6. Pemrosesan suara real-time Web Speech API & manajemen sesi diskusi
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { useSession } from './hooks/useSession'
import { useDarkMode } from './hooks/useDarkMode'

// Komponen Tampilan
import Header from './components/Header'
import BrowserBanner from './components/BrowserBanner'
import ErrorBanner from './components/ErrorBanner'
import PrivacyBanner from './components/PrivacyBanner'
import AudioTipsPanel from './components/AudioTipsPanel'
import GuideModal from './components/GuideModal'
import SessionHeader from './components/SessionHeader'
import SpeakerPanel from './components/SpeakerPanel'
import ControlPanel from './components/ControlPanel'
import StatsPanel from './components/StatsPanel'
import TranscriptArea from './components/TranscriptArea'
import ExportPanel from './components/ExportPanel'
import Footer from './components/Footer'
import RestoreDialog from './components/RestoreDialog'
import DialectPreviewPanel from './components/DialectPreviewPanel'
import PersonalDictionaryModal from './components/PersonalDictionaryModal'
import WhisperModal from './components/WhisperModal'
import SettingsModal from './components/SettingsModal'
import MobileBottomBar from './components/MobileBottomBar'
import MobileSettingsSheet from './components/MobileSettingsSheet'
import { applyBekasi, type DialectMode, type DialectIntensity } from './dialect'

const PRIVACY_KEY = 'psikologi-stt-privacy-agreed'
const DIALECT_MODE_KEY = 'psikologi-stt-dialect-mode'
const DIALECT_INTENSITY_KEY = 'psikologi-stt-dialect-intensity'

export default function App() {
  // ── Tema Tampilan (Dark / Light Mode) ────────────────────
  const { isDark, toggleDarkMode } = useDarkMode()

  // ── Modal Panduan Cara Pakai ─────────────────────────────
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  // ── Modal Pengaturan Terpadu (Desktop & Tablet) ──────────
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // ── Menu Pengaturan Sekunder Mobile (Bottom Sheet) ────────
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // ── Persetujuan Privasi ──────────────────────────────────
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PRIVACY_KEY) === 'true'
    } catch {
      return false
    }
  })

  const handleTogglePrivacy = useCallback((agreed: boolean) => {
    setPrivacyAgreed(agreed)
    try {
      localStorage.setItem(PRIVACY_KEY, String(agreed))
    } catch { /* ignore */ }
  }, [])

  // ── State Pelacakan Unduhan Belum Tersimpan (beforeunload) ─
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const prevSegmentsLengthRef = useRef(0)

  // ── Session State & Actions ──────────────────────────────
  const session = useSession()

  // Tandai ada perubahan jika segmen bertambah
  useEffect(() => {
    if (session.segments.length > prevSegmentsLengthRef.current) {
      setHasUnsavedChanges(true)
    }
    prevSegmentsLengthRef.current = session.segments.length
  }, [session.segments.length])

  // Peringatan beforeunload jika transkrip belum diunduh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && session.segments.length > 0) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, session.segments.length])

  // ── Modal Kamus Pribadi ─────────────────────────────────
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false)

  // ── Modal Whisper (Mesin Transkripsi Ke-2) ──────────────
  const [isWhisperOpen, setIsWhisperOpen] = useState(false)

  // ── Mode Dialek (Standar Baku vs Logat Bekasi) ─────────────
  const [dialectMode, setDialectMode] = useState<DialectMode>(() => {
    try {
      const saved = localStorage.getItem(DIALECT_MODE_KEY)
      if (saved === 'standard' || saved === 'bekasi') return saved
    } catch { /* ignore */ }
    return 'standard'
  })

  const [bekasiIntensity, setBekasiIntensity] = useState<DialectIntensity>(() => {
    try {
      const saved = localStorage.getItem(DIALECT_INTENSITY_KEY)
      if (saved === 'light' || saved === 'medium' || saved === 'full') return saved
    } catch { /* ignore */ }
    return 'medium'
  })

  const handleDialectModeChange = useCallback(
    (newMode: DialectMode) => {
      setDialectMode(newMode)
      try {
        localStorage.setItem(DIALECT_MODE_KEY, newMode)
      } catch { /* ignore */ }
      // Terapkan ulang ke segmen yang belum diedit manual
      session.reapplyDialectToUnedited(newMode, bekasiIntensity)
    },
    [bekasiIntensity, session],
  )

  const handleDialectIntensityChange = useCallback(
    (newIntensity: DialectIntensity) => {
      setBekasiIntensity(newIntensity)
      try {
        localStorage.setItem(DIALECT_INTENSITY_KEY, newIntensity)
      } catch { /* ignore */ }
      if (dialectMode === 'bekasi') {
        session.reapplyDialectToUnedited('bekasi', newIntensity)
      }
    },
    [dialectMode, session],
  )

  const handleFinalChunk = useCallback(
    (rawChunkText: string) => {
      if (dialectMode === 'bekasi') {
        const res = applyBekasi(rawChunkText, { intensity: bekasiIntensity })
        session.appendSegment({
          rawText: rawChunkText,
          displayText: res.displayText,
          dialectChanges: res.changes,
        })
      } else {
        session.appendSegment({
          rawText: rawChunkText,
          displayText: rawChunkText,
          dialectChanges: [],
        })
      }
    },
    [dialectMode, bekasiIntensity, session],
  )

  const handleApplyDialectToAll = useCallback(() => {
    session.reapplyDialectToUnedited(dialectMode, bekasiIntensity)
  }, [session, dialectMode, bekasiIntensity])

  // ── Speech Recognition Engine ────────────────────────────
  const {
    interimText,
    status,
    isSupported,
    isBrowserWarning,
    isIOSSafari,
    error,
    lang,
    audioLevel,
    startRecording: rawStartRecording,
    pauseRecording: rawPauseRecording,
    resumeRecording: rawResumeRecording,
    stopRecording,
    clearError,
    setLang,
  } = useSpeechRecognition({
    onFinalChunk: handleFinalChunk,
    dialectMode,
  })

  // Sinkronisasi timer sesi dengan kontrol perekaman suara + cek privasi
  const handleStartRecording = useCallback(() => {
    if (!privacyAgreed) {
      // Fokus dan ingatkan pengguna untuk menyetujui pernyataan privasi
      const privacyEl = document.getElementById('checkbox-privacy-agree')
      if (privacyEl) {
        privacyEl.focus()
        privacyEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    session.onRecordingStart()
    rawStartRecording()
  }, [privacyAgreed, session, rawStartRecording])

  const handlePauseRecording = useCallback(() => {
    session.onRecordingPause()
    rawPauseRecording()
  }, [session, rawPauseRecording])

  const handleResumeRecording = useCallback(() => {
    session.onRecordingResume()
    rawResumeRecording()
  }, [session, rawResumeRecording])

  // Bersihkan semua data (Wipe Data)
  const handleClearAllData = useCallback(() => {
    session.startNewSession()
    setPrivacyAgreed(false)
    setHasUnsavedChanges(false)
    try {
      localStorage.removeItem(PRIVACY_KEY)
      localStorage.removeItem('psikologi-stt-session')
    } catch { /* ignore */ }
  }, [session])

  // Ketika pengguna berhasil mengunduh berkas
  const handleExportSuccess = useCallback(() => {
    setHasUnsavedChanges(false)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* ── Dialog Pemulihan Sesi (Autosave Restore) ── */}
      {session.showRestoreDialog && (
        <RestoreDialog
          onRestore={session.restoreSession}
          onNewSession={session.startNewSession}
          onDismiss={session.dismissRestore}
        />
      )}

      {/* ── Modal Panduan Cara Pakai ── */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* ── Modal Kamus Pribadi ── */}
      <PersonalDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        onDictionaryUpdated={() => {
          session.reapplyDialectToUnedited(dialectMode, bekasiIntensity)
        }}
      />

      {/* ── Modal Whisper (Mesin Transkripsi Ke-2: Groq / OpenAI) ── */}
      <WhisperModal
        isOpen={isWhisperOpen}
        onClose={() => setIsWhisperOpen(false)}
        speakers={session.speakers}
        activeSpeakerId={session.activeSpeakerId}
        dialectMode={dialectMode}
        dialectIntensity={bekasiIntensity}
        onSegmentsTranscribed={newSegments => {
          session.appendBatchSegments(newSegments)
          setHasUnsavedChanges(true)
        }}
      />

      {/* ── Modal Pengaturan Terpadu (Desktop & Tablet) ── */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenWhisper={() => setIsWhisperOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onLoadSampleData={session.loadSampleData}
        onClearAllData={handleClearAllData}
      />

      {/* ── Header Aplikasi ── */}
      <Header
        isDark={isDark}
        onToggleDark={toggleDarkMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* ── Konten Utama ── */}
      <main
        id="main-content"
        className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-3.5 sm:space-y-4 pb-44 sm:pb-8 overflow-x-hidden"
      >
        {/* Banner Peringatan Browser */}
        {isBrowserWarning && <BrowserBanner />}
        {!isBrowserWarning && isIOSSafari && (
          <BrowserBanner isIOS onOpenWhisper={() => setIsWhisperOpen(true)} />
        )}

        {/* Banner Notifikasi Error Web Speech API */}
        {error && <ErrorBanner error={error} onDismiss={clearError} />}

        {/* 1. Persetujuan Privasi (Ciut otomatis saat aktif) */}
        <PrivacyBanner
          agreed={privacyAgreed}
          onToggleAgree={handleTogglePrivacy}
        />

        {/* 2. Informasi Judul Sesi (Ringkas, satu baris) */}
        <SessionHeader
          title={session.title}
          date={session.date}
          notes={session.notes}
          lastSaved={session.lastSaved}
          onTitleChange={session.setTitle}
          onDateChange={session.setDate}
          onNotesChange={session.setNotes}
          onNewSession={session.startNewSession}
        />

        {/* 3. Pembicara (Chip ringkas dalam satu baris) */}
        <SpeakerPanel
          speakers={session.speakers}
          activeSpeakerId={session.activeSpeakerId}
          onSelect={session.setActiveSpeakerId}
          onAdd={session.addSpeaker}
          onRename={session.renameSpeaker}
          onDelete={session.deleteSpeaker}
        />

        {/* 4. KARTU REKAMAN UTAMA (Status, Tombol Rekam Besar, Bahasa, Kontrol Tunggal Mode Logat) */}
        <div className="hidden sm:block">
          <ControlPanel
            status={status}
            isSupported={isSupported}
            lang={lang}
            audioLevel={audioLevel}
            privacyAgreed={privacyAgreed}
            dialectMode={dialectMode}
            dialectIntensity={bekasiIntensity}
            onStart={handleStartRecording}
            onPause={handlePauseRecording}
            onResume={handleResumeRecording}
            onStop={stopRecording}
            onLangChange={setLang}
            onDialectModeChange={handleDialectModeChange}
            onDialectIntensityChange={handleDialectIntensityChange}
            onOpenWhisper={() => setIsWhisperOpen(true)}
            onApplyToAllSegments={handleApplyDialectToAll}
            segmentCount={session.segments.length}
          />
        </div>

        {/* 5. Transkrip Dialog (Area Terbesar & Paling Sentral) */}
        <TranscriptArea
          segments={session.segments}
          speakers={session.speakers}
          activeSpeakerId={session.activeSpeakerId}
          interimText={interimText}
          status={status}
          showTimestamps={session.showTimestamps}
          onToggleTimestamps={() =>
            session.setShowTimestamps(prev => !prev)
          }
          onEditSegment={session.editSegment}
          onDeleteSegment={session.deleteSegment}
          onMergeSegment={session.mergeWithPrevious}
          onChangeSegmentSpeaker={session.changeSegmentSpeaker}
          onClearAll={session.clearAllSegments}
          onRevertWord={session.updateSegmentWord}
          onRevertSegmentToRaw={session.revertSegmentToRaw}
          onRevertAllSegmentsToRaw={session.revertAllSegmentsToRaw}
          findReplaceOpen={session.findReplaceOpen}
          setFindReplaceOpen={session.setFindReplaceOpen}
          findQuery={session.findQuery}
          setFindQuery={session.setFindQuery}
          replaceQuery={session.replaceQuery}
          setReplaceQuery={session.setReplaceQuery}
          onReplaceAll={session.doReplaceAll}
          replaceCount={session.replaceCount}
          onClearReplaceCount={session.clearReplaceCount}
        />

        {/* 6. Pratinjau Logat (Hanya tampil & aktif saat Mode Logat = Bekasi) */}
        {dialectMode === 'bekasi' && (
          <DialectPreviewPanel
            intensity={bekasiIntensity}
            onIntensityChange={handleDialectIntensityChange}
            segments={session.segments}
          />
        )}

        {/* 7. Statistik Sesi (Ringkas, satu baris kecil) */}
        <StatsPanel stats={session.stats} />

        {/* 8. Tips Perekaman (Ciut secara default, terbuka saat kunjungan pertama) */}
        <AudioTipsPanel />

        {/* 9. Unduh Dokumen Transkrip (TXT, DOCX, PDF) */}
        <ExportPanel
          session={{
            title: session.title,
            date: session.date,
            notes: session.notes,
            durationFormatted: session.stats.durationFormatted,
            speakers: session.speakers,
            segments: session.segments,
          }}
          onExportSuccess={handleExportSuccess}
        />
      </main>

      {/* ── Bilah Kontrol Bawah Mobile (Sticky Bottom Bar) ── */}
      <MobileBottomBar
        status={status}
        isSupported={isSupported}
        audioLevel={audioLevel}
        durationFormatted={session.stats.durationFormatted}
        speakers={session.speakers}
        activeSpeakerId={session.activeSpeakerId}
        onSelectSpeaker={session.setActiveSpeakerId}
        onAddSpeaker={session.addSpeaker}
        onStart={handleStartRecording}
        onPause={handlePauseRecording}
        onResume={handleResumeRecording}
        onStop={stopRecording}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onOpenWhisper={() => setIsWhisperOpen(true)}
      />

      {/* ── Bottom Sheet Pengaturan Sekunder Mobile ── */}
      <MobileSettingsSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        lang={lang}
        onLangChange={setLang}
        dialectMode={dialectMode}
        dialectIntensity={bekasiIntensity}
        onDialectModeChange={handleDialectModeChange}
        onDialectIntensityChange={handleDialectIntensityChange}
        showTimestamps={session.showTimestamps}
        onToggleTimestamps={() =>
          session.setShowTimestamps(prev => !prev)
        }
        isDark={isDark}
        onToggleDark={toggleDarkMode}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenWhisper={() => setIsWhisperOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onLoadSampleData={session.loadSampleData}
        onClearAllData={handleClearAllData}
      />

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
