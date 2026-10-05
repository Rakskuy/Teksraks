# 🎙️ Transkripsi Diskusi Mahasiswa Psikologi (Speech to Text)

Aplikasi web berbasis browser (*client-side*) yang dirancang khusus untuk memfasilitasi mahasiswa, dosen, dan peneliti psikologi dalam mentranskripsikan diskusi kelompok terfokus (*Focus Group Discussion* / FGD), wawancara kualitatif, serta seminar akademik secara real-time ke dalam teks Bahasa Indonesia.

Seluruh data transkripsi diproses dan disimpan secara lokal di browser Anda tanpa perantara server backend, menjamin kerahasiaan dan privasi subjek penelitian.

---

## 🌟 Fitur Unggulan

### 1. 🎙️ Perekaman Suara Real-Time (Web Speech API)
- **Auto-Restart Pintar**: Mengatasi kendala bawaan browser Google Chrome yang kerap memutus rekaman saat jeda hening (*silence timeout*).
- **Anti-Duplikasi Teks**: Pelacakan indeks segmen final yang presisi sehingga tidak ada kalimat yang berulang saat engine melakukan auto-restart.
- **Preview Live Interim**: Menampilkan teks sementara yang sedang diucapkan dengan format miring dan indikator pembicara aktif secara dinamis.
- **Pilihan Bahasa**: Mendukung Bahasa Indonesia (`id-ID`, default), Bahasa Inggris AS (`en-US`), dan Bahasa Inggris Britania (`en-GB`).
- **Visualizer Audio**: Indikator tingkat volume suara (*audio level meter*) responsif saat mikrofon menangkap suara.

### 2. 👥 Mode Diskusi Multi-Pembicara
- **Manajemen Pembicara Fleksibel**: Tambah, ubah nama (misal: "Moderator", "Dr. Sarah", "Klien A"), atau hapus pembicara (hingga 9 pembicara).
- **Shortcut Keyboard Cepat (1–9)**: Beralih pembicara aktif secara instan cukup dengan menekan angka **1–9** pada keyboard saat diskusi berlangsung.
- **Identifikasi Visual Warna**: Setiap pembicara memiliki warna aksen khusus yang ditandai pada setiap segmen dialog transkrip.

### 3. ⏱️ Editor Segmen & Timestamp Relatif
- **Timestamp Akurat**: Setiap segmen dialog mencantumkan waktu relatif sejak rekaman dimulai (`[mm:ss]` atau `[hh:mm:ss]` untuk sesi > 1 jam). Waktu dijeda otomatis saat rekaman di-*pause*.
- **Inline Click-to-Edit**: Klik langsung teks segmen mana pun untuk mengoreksi kalimat menggunakan textarea yang otomatis menyesuaikan tinggi (*auto-resize*).
- **Koreksi Pembicara**: Dropdown pada segmen memudahkan penggantian pembicara jika terjadi salah pilih saat merekam.
- **Gabung Segmen (*Merge*)**: Gabungkan segmen dengan segmen di atasnya secara rapi hanya dengan satu klik.

### 4. 🔍 Cari & Ganti Cepat Istilah Psikologi (*Find & Replace*)
- Fitur pencarian dan penggantian kata di seluruh transkrip secara massal.
- Sangat berguna untuk membakukan istilah teknis psikologi (misalnya mengoreksi *kognitif*, *afektif*, *amigdala*, *neuroplastisitas*, atau *coping mechanism*).

### 5. 🛡️ Kepatuhan Privasi & Etika Data Psikologi
- **Pernyataan Privasi Jelas**: Catatan transparan mengenai pemrosesan audio lokal vs layanan speech recognition peramban.
- **Persetujuan Wajib**: Checkbox persetujuan etika data sebelum pengguna dapat memulai rekaman pertama.
- **Tombol Hapus Semua Data**: Membersihkan seluruh data sesi, transkrip, dan preferensi dari `localStorage` dengan konfirmasi keamanan.
- **Peringatan `beforeunload`**: Browser memunculkan dialog konfirmasi jika tab hendak ditutup saat ada transkrip yang belum diunduh.

### 6. 📊 Statistik Sesi Diskusi
- Ringkasan otomatis total kata, durasi diskusi, dan total segmen.
- Rincian distribusi kontribusi kata dan persentase per pembicara untuk analisis dinamika kelompok.

### 7. 📥 Ekspor 3 Format Dokumen Standar
- **TXT**: Berkas teks bersih dengan encoding **UTF-8 BOM** (`\uFEFF`) agar seluruh karakter aksen (*é*, *—*, tanda kutip) terbaca sempurna di Windows Notepad maupun editor teks lainnya.
- **DOCX (Microsoft Word)**: Format rapi sesuai standar penulisan akademik — font **Calibri 12pt**, **spasi 1.5**, margin standar 1 inci (1440 twips), nama pembicara dicetak **tebal**, dilengkapi header dan nomor halaman footer.
- **PDF (A4)**: Dokumen siap cetak dengan tata letak resmi, pembagian halaman otomatis (*multi-page auto-pagination*), penomoran `"Halaman X dari Y"`, dan sanitasi tipografi aman.
- **Opsi Ekspor**: Pengguna dapat menyertakan atau menyembunyikan tanda waktu (*timestamp*) dan label pembicara sesuai kebutuhan laporan.

### 8. ♿ Aksesibilitas & Dark Mode
- **Dark Mode**: Pilihan tema gelap dan terang dengan kontras warna memenuhi standar **WCAG AA** (minimal 4.5:1).
- **Aksesibilitas Penuh**: Tautan *"Lompat ke konten utama"*, navigasi keyboard penuh, dan atribut ARIA semantik.

### 9. 🗣️ Mode Logat Bekasi (Betawi Ora) & Integrasi Leksikon

Aplikasi dilengkapi modul pasca-proses cerdas untuk memfasilitasi diskusi yang menggunakan logat daerah Bekasi (Betawi Ora) tanpa mengubah kehandalan mode Standar Bahasa Indonesia baku:

- **Toggle Mode & Intensitas di Panel Kontrol**:
  - *Standar*: 100% teks asli mesin tanpa perubahan.
  - *Bekasi*: Menerapkan pemetaan leksikon dengan 3 tingkat intensitas:
    - **Ringan**: Kata ganti (*aku $\rightarrow$ gue*, *kamu $\rightarrow$ lu*, *dia $\rightarrow$ die*), negasi (*tidak $\rightarrow$ kagak*), dan partikel frekuen (*saja $\rightarrow$ aje*, *cuma $\rightarrow$ doang*, *sekali $\rightarrow$ banget*).
    - **Sedang**: Kosakata percakapan umum (*uang $\rightarrow$ duit*, *bohong $\rightarrow$ boong*, *benar $\rightarrow$ bener*, *ibu $\rightarrow$ nyokap*, *bapak $\rightarrow$ bokap*, *sama $\rightarrow$ same*, *sudah $\rightarrow$ udah*).
    - **Penuh**: Mencakup whitelist pergeseran vokal fonologis *-a $\rightarrow$ -e* (*bisa $\rightarrow$ bise*, *ada $\rightarrow$ ade*, *bawa $\rightarrow$ bawe*, *tanya $\rightarrow$ tanye*) dan partikel ekspresif (*yang $\rightarrow$ nyang*, *kenapa $\rightarrow$ ngapa*).
- **Evaluasi Multi-Alternatif Mesin (`maxAlternatives = 5`)**:
  - Mesin ucapan mengambil hingga 5 alternatif transkripsi untuk setiap kalimat final.
  - Skor dihitung dari $\text{Confidence Mesin} + \text{Bonus Kata Bekasi}$.
  - Alternatif dengan penurunan confidence $> 0.25$ di bawah alternatif utama otomatis diabaikan, *kecuali* memuat kata logat berstatus `confidence: high`.
- **Struktur Segmen Dual-Layer & Keamanan Suntingan Manual**:
  - Menyimpan `{ rawText, displayText, dialectChanges[], edited }`.
  - `rawText` tidak pernah ditimpa oleh konversi logat.
  - Segmen yang sudah disunting manual (`edited: true`) tidak akan pernah ditimpa ulang saat mode logat diubah.
- **Interaksi Klik-Kata & Popover Cerdas**:
  - Kata logat otomatis diberi penanda *highlight* dengan **garis bawah putus-putus** (`underline decoration-dashed decoration-2`) yang ramah aksesibilitas.
  - Klik pada kata memunculkan opsi: *"Kembalikan ke baku"*, *"Pertahankan logat"*, atau *"Selalu pakai bentuk ini"*.
- **Kamus Pribadi & Daftar Pengecualian**:
  - Menyimpan leksikon kustom pengguna di `localStorage` dengan prioritas tertinggi di atas kamus bawaan.
  - Dilengkapi fitur **Ekspor & Impor JSON** untuk mencadangkan atau membagikan kamus.
- **Panel Pratinjau Komparasi 2 Kolom**:
  - Komparasi side-by-side instan antara Kolom Kiri (*Teks Asli*) dan Kolom Kanan (*Hasil Konversi Logat Bekasi*).
- **Ekspor Dokumen Fleksibel**:
  - Ekspor TXT, DOCX, dan PDF secara default menggunakan `displayText`, dengan opsi checkbox *"Ekspor teks asli (tanpa logat)"* untuk kebutuhan arsip formal.

#### ⚠️ Keterbatasan Mode Logat Bekasi (*Known Limitations*)
1. **Bias Model Suara Browser**: Mesin pengenal suara Google Chrome dilatih pada korpus formal Bahasa Indonesia baku. Fonem logat lokal pekat dapat dikenali sebagai kata baku terdekat sebelum masuk ke lapisan pasca-proses aplikasi.
2. **Konteks Kata Homofon**: Kata *"bisa"* dapat berarti racun (biologis) atau mampu (dialek: *bise*). Jika konteks kalimat bermakna racun biologis, pengguna dapat mengklik kata dan memilih *"Kembalikan ke baku"*.
3. **Nama Tokoh Asing Berakhiran "-a"**: Nama diri asing di luar leksikon umum (misal: *Kafka*, *Spinoza*) disarankan dimasukkan ke **Daftar Pengecualian** di Kamus Pribadi agar tidak terpengaruh aturan fonologis *-a $\rightarrow$ -e*.

### 10. ⚡ Mesin Transkripsi Ke-2: Whisper AI (OpenAI & Groq Cloud)

Selain pengenalan suara bawaan browser (*Web Speech API*), aplikasi kini menyediakan opsi mesin transkripsi kedua berstandar industri menggunakan model **Whisper AI**:

- **Dua Metode Input Fleksibel**:
  1. **Unggah Berkas Rekaman Audio**: Mendukung format MP3, WAV, M4A, WebM, OGG, FLAC, dan MP4 (hingga 25 MB).
  2. **Rekam Langsung Lalu Proses**: Merekam suara langsung di browser dengan MediaRecorder API, pengukur volume suara, dan pratinjau audio sebelum dikirimkan.
- **Penyedia API (Groq Cloud & OpenAI)**:
  - **Groq Cloud** (`whisper-large-v3-turbo`): Transkripsi super cepat (hanya 1–3 detik) dengan tingkat akurasi tinggi.
  - **OpenAI** (`whisper-1`): Model Whisper resmi dari OpenAI.
- **Keamanan & Penyimpanan Kunci API Lokal**:
  - API Key dimasukkan sendiri oleh pengguna di modal Pengaturan.
  - Tersimpan **hanya di perangkat lokal Anda (`localStorage`)**, tidak pernah dikirimkan atau disimpan di server aplikasi.
- **Priming Konteks Logat Bekasi**:
  - Mengirim parameter `language=id` dan prompt primer gaya bicara Bekasi:
    `"Gue kagak tau, lu mau kemane? Ntar gue ke sono dah, emang bener sih."`
  - Memandu model Whisper agar mempertahankan kosakata santai dan dialek Bekasi/informal tanpa memformalkannya secara berlebihan menjadi bahasa baku kaku.
- **Integrasi Penuh Pipeline Aplikasi**:
  - Hasil transkripsi dengan format `verbose_json` memetakan segmen waktu (`start` dan `end`) ke penanda waktu `[mm:ss]` dan `relativeMs`.
  - Melewati penetapan pembicara, editor teks segmen, konversi dialek Bekasi (`applyBekasi`), dan kamus pribadi yang sama.
- **Peringatan Privasi & Persetujuan Eksplisit**:
  - Menampilkan pemberitahuan transparan bahwa audio dikirim ke server pihak ketiga (Groq / OpenAI).
  - Wajib menyetujui checkbox persetujuan eksplisit sebelum audio dapat diunggah atau diproses.

---

## 💻 Kebutuhan Sistem & Browser yang Didukung

Aplikasi ini menggunakan teknologi **Web Speech API** yang terintegrasi langsung pada peramban:

| Browser | Status Dukungan | Rekomendasi | Catatan |
|---|---|---|---|
| **Google Chrome (Desktop)** | ✅ **Didukung Penuh** | ⭐ **Sangat Direkomendasikan** | Akurasi tertinggi, mendukung continuous recognition & interim results. |
| **Microsoft Edge (Desktop)** | ✅ **Didukung Penuh** | ⭐ **Sangat Direkomendasikan** | Berbasis Chromium, performa dan akurasi setara Chrome. |
| **Brave / Opera / Vivaldi** | ⚠️ Didukung Sebagian | Opsional | Pastikan fitur Google Services / Web Speech API tidak diblokir di setelan privasi browser. |
| **Mozilla Firefox** | ❌ Tidak Didukung | Tidak Disarankan | Firefox belum mengimplementasikan Web Speech API secara default. Aplikasi akan menampilkan banner peringatan. |
| **Safari (macOS / iOS)** | ⚠️ Terbatas | Tidak Disarankan | Dukungan Web Speech API pada Safari terbatas dan sering memutus koneksi continuous. |

> ⚠️ **Catatan Penting Koneksi Internet**: Meskipun antarmuka dan penyimpanan data berjalan 100% lokal di browser Anda, mesin *SpeechRecognition* pada Google Chrome membutuhkan koneksi internet aktif untuk memproses fonem audio melalui server pengenalan ucapan Google.

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.0.0 atau lebih baru.
- npm versi 9.0.0 atau lebih baru.

### Langkah Instalasi

1. **Clone atau Buka Direktori Proyek**:
   ```bash
   cd "membuat web speech to text"
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Server Pengembangan (Dev Server)**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di: **`http://localhost:5173/`**.

4. **Kompilasi untuk Produksi (Production Build)**:
   ```bash
   npm run build
   ```

5. **Pratinjau Hasil Build**:
   ```bash
   npm run preview
   ```

6. **Pemeriksaan Linter**:
   ```bash
   npm run lint
   ```

---

## 🚀 Panduan Deployment (HTTPS Wajib untuk Mikrofon)

> [!IMPORTANT]
> **Mengapa HTTPS Wajib?**  
> Fitur mikrofon (`navigator.mediaDevices.getUserMedia` dan Web Speech API) diklasifikasikan oleh browser modern sebagai fitur berisiko tinggi (*Powerful Feature*). Browser seperti Google Chrome dan Microsoft Edge **memblokir akses mikrofon pada protokol HTTP biasa** (hanya diizinkan di `localhost` dan `https://`).  
> Mengunggah ke **Vercel** atau **Netlify** akan otomatis memberikan sertifikat SSL/HTTPS gratis dan konfigurasi header izin mikrofon (*Permissions-Policy: microphone=(self)*).

Proyek ini sudah dilengkapi berkas konfigurasi siap pakai:
- `vercel.json` (konfigurasi rewrite SPA dan security headers Vercel)
- `netlify.toml` (konfigurasi build, SPA redirect, dan security headers Netlify)
- `.gitignore` (mencegah folder `node_modules`, `dist`, dan log terunggah)

---

### Opsi A: Deploy ke Vercel (Direkomendasikan)

#### Metode 1 — Melalui Dashboard Vercel (Paling Mudah)
1. **Push Proyek ke GitHub**:
   - Buat repositori baru di akun GitHub Anda (misal: `speech-to-text-psikologi`).
   - Jalankan perintah berikut di terminal:
     ```bash
     git init
     git add .
     git commit -m "feat: rilis speech to text psikologi"
     git branch -M main
     git remote add origin https://github.com/<username-anda>/<nama-repo>.git
     git push -u origin main
     ```
2. **Impor ke Vercel**:
   - Buka [vercel.com](https://vercel.com/) dan login menggunakan akun GitHub Anda.
   - Klik tombol **"Add New..."** lalu pilih **"Project"**.
   - Pilih repositori yang baru Anda unggah, lalu klik **"Import"**.
3. **Konfigurasi Project**:
   - Vercel akan otomatis mengenali framework **Vite**.
   - Biarkan pengaturan default:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Klik **"Deploy"**.
4. **Selesai**:
   - Dalam 1–2 menit, Vercel akan memberikan domain HTTPS gratis (contoh: `https://speech-to-text-psikologi.vercel.app`).
   - Buka URL tersebut di Google Chrome atau Microsoft Edge dan izinkan mikrofon.

#### Metode 2 — Menggunakan Vercel CLI (Dari Terminal)
1. Jalankan Vercel CLI via npx (tanpa perlu instalasi global):
   ```bash
   npx vercel
   ```
2. Ikuti instruksi di terminal (login, pilih scope akun, hubungkan proyek).
3. Untuk langsung deploy ke production domain:
   ```bash
   npx vercel --prod
   ```

---

### Opsi B: Deploy ke Netlify

#### Metode 1 — Melalui Dashboard Netlify
1. Push proyek ke repositori GitHub seperti pada langkah di atas.
2. Buka [app.netlify.com](https://app.netlify.com/) dan login dengan GitHub.
3. Klik **"Add new site"** -> **"Import an existing project"** -> **"GitHub"**.
4. Pilih repositori proyek Anda.
5. Netlify akan membaca berkas `netlify.toml` yang sudah tersedia:
   - **Base directory**: (kosongkan)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Klik **"Deploy site"**.
7. Netlify akan menyediakan URL HTTPS (contoh: `https://diskusi-psikologi.netlify.app`).

#### Metode 2 — Menggunakan Netlify CLI
1. Jalankan Netlify CLI:
   ```bash
   npx netlify deploy --build --prod
   ```
2. Ikuti panduan autentikasi di peramban dan konfirmasi publish directory `dist`.

---


## 📖 Panduan Cara Pakai

1. **Atur Informasi Sesi**:
   Buka accordion formulir sesi di bagian atas untuk mengisi judul diskusi (misal: *"Focus Group Discussion: Stres Akademik"*), tanggal, dan catatan tambahan.
2. **Kelola Pembicara**:
   Sesuaikan nama pembicara pada panel daftar pembicara. Pilih pembicara yang sedang berbicara dengan mengklik namanya atau menekan angka **1–9** pada keyboard.
3. **Mulai Merekam**:
   Centang checkbox persetujuan privasi etika psikologi, lalu klik tombol **Mulai Rekam**. Izinkan akses mikrofon saat browser meminta konfirmasi.
4. **Berbicara Bergantian**:
   Bicaralah dengan tempo normal dan artikulasi jelas. Teks akan muncul secara real-time di area transkrip.
5. **Koreksi & Edit Teks**:
   Jika terdapat kata yang keliru, klik langsung pada teks segmen untuk memperbaikinya, atau gunakan tombol **Cari & Ganti** di toolbar transkrip.
6. **Unduh Dokumen**:
   Pilih opsi format di bagian bawah (**TXT**, **DOCX**, atau **PDF**), atur preferensi tanda waktu dan nama pembicara, lalu klik tombol unduh.

---

## ⚠️ Keterbatasan Akurasi & Rekomendasi Penggunaan

1. **Aksen & Dialek Daerah**:
   Model pengenalan suara Google dilatih terutama pada Bahasa Indonesia baku (*Standard Indonesian*). Penggunaan bahasa daerah kental, bahasa prokem/slang, atau singkatan informal dapat mengurangi akurasi transkrip.
2. **Istilah Teknis Psikologi Serapan**:
   Istilah psikologi berbahasa Inggris atau Latin (misal: *neuroplasticity*, *locus of control*, *transference*) terkadang ditranskripsikan secara fonetik dalam ejaan bahasa Indonesia. Gunakan fitur **Cari & Ganti** untuk standardisasi istilah tersebut setelah perekaman selesai.
3. **Kualitas Perangkat Keras & Akustik Ruangan**:
   Gema ruangan (*reverberation*), derau pendingin ruangan (AC), serta mikrofon internal laptop berkualitas rendah dapat menurunkan akurasi pengenalan kata. Disarankan menggunakan mikrofon eksternal (*clip-on* atau *headset*) berjarak 15–30 cm dari pembicara.
4. **Pembicara Bersamaan (*Cross-talk*)**:
   Web Speech API tidak mendukung pemisahan sumber audio (*diarization* otomatis). Dua orang yang berbicara bersamaan akan menghasilkan teks yang terdistorsi. Pastikan peserta diskusi berbicara secara bergantian.
5. **Batas Waktu Hening Browser**:
   Chrome memiliki mekanisme internal yang otomatis menghentikan recognition saat tidak mendeteksi suara selama beberapa detik. Aplikasi telah dilengkapi fitur *auto-restart* otomatis, namun jeda hening yang sangat lama dapat menyebabkan delay 0.3 detik saat mesin menyala kembali.

---

## 📁 Struktur Direktori

```
membuat web speech to text/
├── public/                 # Aset statis & favicon
├── scripts/
│   ├── test-export.cjs     # Uji ekspor dataset standar (2.044 kata)
│   └── test-edge-cases.cjs # Uji ekspor edge case (>3.500 kata & karakter khusus)
├── src/
│   ├── assets/             # Logo & grafis
│   ├── components/         # Komponen UI modular
│   │   ├── Header.tsx          # Navigasi, Cara Pakai & Dark Mode
│   │   ├── PrivacyBanner.tsx   # Persetujuan etika & hapus data
│   │   ├── AudioTipsPanel.tsx  # Tips rekaman audio berkualitas
│   │   ├── GuideModal.tsx      # Modal petunjuk penggunaan
│   │   ├── SessionHeader.tsx   # Metadata sesi & autosave
│   │   ├── SpeakerPanel.tsx    # Manajemen pembicara (1-9)
│   │   ├── ControlPanel.tsx    # Mulai/Jeda/Lanjut/Stop & bahasa
│   │   ├── StatsPanel.tsx      # Metrik kata, durasi & segmen
│   │   ├── TranscriptArea.tsx  # Area dialog & live interim
│   │   ├── SegmentItem.tsx     # Editor segmen dialog
│   │   ├── FindReplaceBar.tsx  # Pencarian istilah massal
│   │   ├── ExportPanel.tsx     # Ekspor TXT, DOCX, PDF
│   │   ├── RestoreDialog.tsx   # Pemulihan sesi autosave
│   │   └── Footer.tsx          # Hak cipta & privasi
│   ├── data/
│   │   └── sampleTranscript.ts # Dataset sampel diskusi psikologi 2.000+ kata
│   ├── hooks/
│   │   ├── useSpeechRecognition.ts # Custom hook Web Speech API hardened
│   │   ├── useSession.ts           # Manajemen state sesi, segmen, autosave
│   │   └── useDarkMode.ts          # Pengendali tema gelap/terang
│   ├── types/              # Definisi tipe data TypeScript
│   ├── utils/              # Generator berkas TXT, DOCX, PDF & sanitasi nama
│   ├── App.tsx             # Root Application
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind base, components, & dark mode
├── test-output/            # Hasil verifikasi berkas uji
├── .gitignore              # Proteksi pengunggahan node_modules & dist
├── vercel.json             # Konfigurasi deployment & permissions header Vercel
├── netlify.toml            # Konfigurasi deployment & SPA redirect Netlify
├── PLAN.md                 # Dokumen arsitektur perangkat lunak
├── TESTING.md              # Laporan audit QA lengkap
└── package.json
```

---

## 📄 Lisensi & Privasi

Dikembangkan untuk keperluan akademik dan penelitian psikologi. Seluruh pemrosesan teks berjalan di sisi pengguna (*client-side*). Selalu patuhi kode etik psikologi (seperti penandatanganan *Informed Consent*) sebelum merekam wawancara dengan klien atau partisipan penelitian.
