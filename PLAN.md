# PLAN.md — Speech to Text untuk Diskusi Mahasiswa Psikologi

## 1. Gambaran Umum

Aplikasi web berbasis browser yang dirancang khusus untuk mahasiswa dan peneliti psikologi dalam merekam suara diskusi/focus group discussion (FGD), mengubahnya menjadi teks Bahasa Indonesia secara real-time dengan Web Speech API, mengelompokkan percakapan per pembicara dengan label warna unik, mengedit segmen dialog secara langsung, melakukan find & replace istilah psikologi, serta mengunduh hasil transkripsi lengkap dalam format TXT, DOCX (Word), dan PDF — seluruh proses berjalan di sisi klien (browser) tanpa backend untuk menjamin kerahasiaan dan privasi data penelitian.

---

## 2. Tech Stack

| Layer        | Teknologi                                  |
|--------------|--------------------------------------------|
| Framework    | Vite + React 18 + TypeScript               |
| Styling      | Tailwind CSS v3 + Lucide React Icons       |
| Speech API   | Web Speech API (`SpeechRecognition`)       |
| Export DOCX  | `docx` (npm)                               |
| Export PDF   | `jspdf` (npm)                              |
| File Saver   | `file-saver` (npm)                         |
| Storage      | Browser `localStorage` (Autosave 5 detik)  |
| Theme        | Dark Mode & Light Mode (Tailwind Class)    |
| Linting      | ESLint 9 + TypeScript ESLint               |

---

## 3. Struktur Proyek

```
speech-to-text/
├── public/
│   └── favicon.svg
├── scripts/
│   └── test-export.cjs             # Skrip uji otomatis ekspor 2.000+ kata (TXT/DOCX/PDF)
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Header.tsx              # Judul, icon, tombol Cara Pakai, dan toggle Dark Mode
│   │   ├── BrowserBanner.tsx       # Banner peringatan browser non-Chromium
│   │   ├── ErrorBanner.tsx         # Banner penanganan error Web Speech API ramah pengguna
│   │   ├── PrivacyBanner.tsx       # Banner privasi data etika psikologi, persetujuan & hapus data
│   │   ├── AudioTipsPanel.tsx      # Tips rekaman: posisi mic, ruang tenang, bicara bergantian
│   │   ├── GuideModal.tsx          # Modal panduan 5 langkah singkat penggunaan aplikasi
│   │   ├── SessionHeader.tsx       # Metadata sesi: judul, tanggal, catatan, info autosave
│   │   ├── SpeakerPanel.tsx        # Manajemen pembicara, label warna, shortcut keyboard 1-9
│   │   ├── ControlPanel.tsx        # Kontrol rekam (Mulai/Jeda/Lanjut/Stop), bahasa, level audio
│   │   ├── StatusBadge.tsx         # Indikator status animasi (merekam, dijeda, berhenti)
│   │   ├── StatsPanel.tsx          # Statistik kata total, durasi, dan distribusi per pembicara
│   │   ├── FindReplaceBar.tsx      # Fitur cari dan ganti cepat istilah psikologi
│   │   ├── TranscriptArea.tsx      # Area transkripsi: daftar segmen, live interim, toolbar
│   │   ├── SegmentItem.tsx         # Item segmen: inline editing, ganti pembicara, gabung, hapus
│   │   ├── ExportPanel.tsx         # Panel unduh TXT/DOCX/PDF + opsi + muat data uji
│   │   ├── RestoreDialog.tsx       # Dialog modal pemulihan sesi autosave
│   │   └── Footer.tsx              # Kredit, lisensi, dan jaminan privasi lokal
│   ├── data/
│   │   └── sampleTranscript.ts     # Data sampel diskusi psikologi 2.000+ kata (3 pembicara)
│   ├── hooks/
│   │   ├── useSpeechRecognition.ts # Custom hook Web Speech API (continuous, restart, anti-duplicate)
│   │   ├── useSession.ts           # State sesi, pembicara, segmen, autosave, find & replace
│   │   └── useDarkMode.ts          # State tema tampilan dark/light mode ke localStorage
│   ├── types/
│   │   ├── session.ts              # Interface Speaker, Segment, SessionData, SessionStats
│   │   └── speech.d.ts             # Interface Web Speech API, RecordingStatus, Error codes
│   ├── utils/
│   │   ├── filename.ts             # Sanitasi nama berkas aman OS (transkrip-[judul]-[tanggal])
│   │   ├── exportTxt.ts            # Ekspor TXT UTF-8 BOM lengkap metadata & opsi
│   │   ├── exportDocx.ts           # Ekspor DOCX Calibri 12pt spasi 1.5 pembicara tebal
│   │   └── exportPdf.ts            # Ekspor PDF A4 auto-pagination nomor halaman X dari Y
│   ├── App.tsx                     # Orkestrasi state sesi, Web Speech API, privasi & beforeunload
│   ├── main.tsx                    # Entry point React
│   └── index.css                   # Tailwind directives + dark mode + custom utility classes
├── test-output/                    # Hasil verifikasi ekspor TXT, DOCX, dan PDF
├── TESTING.md                      # Dokumentasi skenario uji manual & otomatis
├── PLAN.md                         # Dokumen arsitektur dan rencana proyek
└── package.json
```

---

## 4. Alur Data (Data Flow)

```
                       [ Mikrofon Pengguna ]
                                 │
                                 ▼
                     useSpeechRecognition Hook
                   (continuous, interimResults,
                  auto-restart on silence/error)
                                 │
             ┌───────────────────┴───────────────────┐
             ▼ (interim)                             ▼ (final chunk)
     Preview Teks Miring                   useSession.appendSegment()
     di TranscriptArea                     (waktu relatif, pembicara aktif)
                                                     │
                                                     ▼
                                          Daftar Segmen Dialog
                                          (state: SessionData)
                                                     │
                     ┌───────────────────────────────┼───────────────────────────────┐
                     ▼                               ▼                               ▼
            Autosave (5s)                   Find & Replace /                Panel Ekspor
            ke localStorage                 Edit / Gabung / Hapus           (TXT, DOCX, PDF)
```

---

## 5. Status Tahapan Pengembangan

| Tahap | Fitur                                                               | Status   |
|-------|---------------------------------------------------------------------|----------|
| 1     | Scaffold Vite + React + TS + Tailwind + PLAN.md                     | Selesai  |
| 2     | Web Speech API Hook, Bahasa, Error Handling, Visualizer             | Selesai  |
| 3     | Mode Diskusi: Pembicara (1-9), Timestamp, Editor, Stats             | Selesai  |
| 4     | Fitur Ekspor 3 Format (TXT, DOCX, PDF) + Opsi + Uji 2.000+ Kata     | Selesai  |
| 5     | Pemolesan: Privasi Etika, Aksesibilitas WCAG AA, Dark Mode, Tips UI, Modal Panduan, Beforeunload | Selesai  |
