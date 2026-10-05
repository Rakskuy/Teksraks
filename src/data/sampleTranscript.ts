import type { Speaker, Segment } from '../types/session'
import { SPEAKER_COLORS } from '../types/session'

export const SAMPLE_SPEAKERS: Speaker[] = [
  { id: 'sp-mod', name: 'Moderator (Dr. Rian)', color: SPEAKER_COLORS[0] }, // blue
  { id: 'sp-1', name: 'Siti (NIM 21081)', color: SPEAKER_COLORS[1] },       // violet
  { id: 'sp-2', name: 'Budi (NIM 21045)', color: SPEAKER_COLORS[2] },       // emerald
]

export const SAMPLE_TITLE = 'Focus Group Discussion: Regulasi Emosi, Beban Kognitif, dan Kesejahteraan Mental Mahasiswa'
export const SAMPLE_NOTES = 'Diskusi komprehensif mata kuliah Psikologi Klinis & Kognitif semester ganjil. Membahas fenomena burnout, stres akademik, neuroplastisitas, distorsi kognitif, evaluasi psikodiagnostik, dan strategi coping mechanism adaptif di lingkungan perguruan tinggi.'

/**
 * 2.000+ kata transkrip diskusi psikologi dengan 3 pembicara,
 * lengkap dengan istilah psikologi, karakter khusus (é, —, ", '),
 * dan timestamp berurutan.
 */
const RAW_SEGMENTS = [
  {
    id: 'seg-001',
    speakerId: 'sp-mod',
    timestamp: '00:00',
    relativeMs: 0,
    text: 'Selamat pagi rekan-rekan mahasiswa sekalian. Terima kasih telah hadir dalam forum diskusi terfokus (focus group discussion) kali ini. Topik utama yang akan kita bedah hari ini berpusat pada dinamika "regulasi emosi" serta akumulasi "beban kognitif" (cognitive load) yang dialami oleh mahasiswa selama masa perkuliahan intensif dan ujian akhir semester. Sebagaimana kita ketahui bersama dalam literatur psikologi kontemporer, interaksi antara stresor lingkungan dan kapasitas memori kerja memainkan peranan krusial terhadap performa akademik dan kesejahteraan psikologis (psychological well-being).',
  },
  {
    id: 'seg-002',
    speakerId: 'sp-mod',
    timestamp: '00:45',
    relativeMs: 45000,
    text: 'Sebelum kita masuk ke analisis studi kasus, saya ingin membuka forum dengan pertanyaan pemantik untuk Saudari Siti: Dari perspektif teori penilaian kognitif (cognitive appraisal theory) yang dirumuskan oleh Richard Lazarus dan Susan Folkman, bagaimana Saudari melihat transisi respons afektif mahasiswa ketika menghadapi rentang tenggat waktu tugas yang sangat padat dan menuntut konsentrasi tinggi?',
  },
  {
    id: 'seg-003',
    speakerId: 'sp-1',
    timestamp: '01:25',
    relativeMs: 85000,
    text: 'Terima kasih banyak atas pertanyaannya, Dokter Rian. Menurut pengamatan empiris serta refleksi pengalaman rekan-rekan sekelas, proses appraisal primer — yaitu bagaimana individu menilai apakah suatu situasi merupakan ancaman (threat), tantangan (challenge), atau kerugian (harm/loss) — sangat menentukan timbulnya distres psikologis. Ketika mahasiswa mempersepsikan tumpukan tugas sebagai ancaman langsung terhadap harga diri (self-esteem) atau kelulusan, respons fisiologis sistem saraf simpatik langsung teraktivasi secara intensif.',
  },
  {
    id: 'seg-004',
    speakerId: 'sp-1',
    timestamp: '02:15',
    relativeMs: 135000,
    text: 'Dampaknya, terjadi fenomena penyempitan fokus perhatian (attentional narrowing) dan disregulasi emosional. Mahasiswa kesulitan melakukan regulasi emosi secara sadar (conscious emotion regulation), sehingga mekanisme penanggulangan (coping mechanism) yang muncul sering kali maladaptif, seperti prokrastinasi akademis yang kronis, perilaku menghindar (avoidance behavior), kecanduan media sosial sebagai pelarian sementara, atau ruminasi pikiran negatif yang berulang-ulang tanpa henti.',
  },
  {
    id: 'seg-005',
    speakerId: 'sp-2',
    timestamp: '03:05',
    relativeMs: 185000,
    text: 'Saya sangat sepakat dengan poin yang disampaikan Siti mengenai mekanisme penanggulangan yang maladaptif tersebut. Namun, saya ingin menambahkan satu dimensi krusial dari kacamata neurosains kognitif. Ketika amigdala terpicu oleh kecemasan yang berlarut-larut, fungsi eksekutif yang dikendalikan oleh korteks prefrontal (prefrontal cortex) mengalami hambatan fungsional yang signifikan. Hal ini menjelaskan mengapa saat mahasiswa mengalami stres akut, kemampuan pemecahan masalah (problem-solving), pengambilan keputusan rasional, dan fleksibilitas kognitif mereka menurun drastis.',
  },
  {
    id: 'seg-006',
    speakerId: 'sp-2',
    timestamp: '03:55',
    relativeMs: 235000,
    text: 'Dalam kaitannya dengan teori beban kognitif (cognitive load theory) karya John Sweller, kapasitas memori kerja (working memory) kita itu bersifat sangat terbatas — rata-rata hanya mampu menampung empat hingga tujuh bongkahan informasi (chunks) sekaligus. Beban kognitif intrinsik dari materi kuliah yang rumit ditambah dengan beban kognitif ekstrinsik — berupa instruksi tugas yang ambigu, format presentasi yang berbelit-belit, dan kecemasan emosional internal — menyebabkan terjadinya kelebihan beban informasi (cognitive overload). Akibatnya, transfer pengetahuan menuju retensi memori jangka panjang menjadi sangat terganggu.',
  },
  {
    id: 'seg-007',
    speakerId: 'sp-mod',
    timestamp: '04:50',
    relativeMs: 290000,
    text: 'Poin yang sangat tajam dari Budi mengenai keterbatasan memori kerja dan disfungsi eksekutif sementara di korteks prefrontal. Ini membawa kita pada konsep efikasi diri (self-efficacy) dari Albert Bandura. Bagaimana keyakinan individu terhadap kemampuannya sendiri dapat memoderasi hubungan antara beban tugas yang berat dan timbulnya sindrom kelelahan emosional atau burnout akademik? Silakan Siti atau Budi menanggapi.',
  },
  {
    id: 'seg-008',
    speakerId: 'sp-1',
    timestamp: '05:35',
    relativeMs: 335000,
    text: 'Izinkan saya merespons hal ini terlebih dahulu, Dokter Rian. Efikasi diri bertindak sebagai penyangga psikologis (psychological buffer) yang luar biasa kuat. Mahasiswa yang memiliki efikasi diri tinggi cenderung menginterpretasikan tekanan akademis bukan sebagai ancaman yang melemahkan, melainkan sebagai tantangan yang memotivasi (eustress). Mereka memiliki keyakinan kendali internal (internal locus of control) bahwa usaha terencana dan strategi belajar yang tepat akan membuahkan hasil positif yang sepadan.',
  },
  {
    id: 'seg-009',
    speakerId: 'sp-1',
    timestamp: '06:25',
    relativeMs: 385000,
    text: 'Sebaliknya, mahasiswa dengan efikasi diri rendah rentan terjebak dalam kondisi ketidakberdayaan yang dipelajari (learned helplessness), sebagaimana dijelaskan dalam eksperimen klasik Martin Seligman. Mereka merasa bahwa sekeras apa pun mereka belajar atau merevisi tugas, hasil akhirnya tetap akan mengecewakan dan tidak dinilai adil. Perasaan putus asa inilah yang secara bertahap mengikis motivasi intrinsik dan mempercepat terjadinya depersonalisasi, sinisme terhadap dunia perkuliahan, serta kelelahan mental menyeluruh.',
  },
  {
    id: 'seg-010',
    speakerId: 'sp-2',
    timestamp: '07:20',
    relativeMs: 440000,
    text: 'Betul sekali, Siti. Terkait fenomena hilangnya motivasi tersebut, saya teringat akan pentingnya konsep restrukturisasi kognitif (cognitive restructuring) dalam intervensi terapi perilaku kognitif (cognitive behavioral therapy atau CBT). Mahasiswa perlu dilatih untuk mengidentifikasi distorsi kognitif yang kerap muncul secara otomatis, seperti pemikiran serba-hitam-putih (all-or-nothing thinking), generalisasi berlebihan (overgeneralization), penyaringan mental negatif (mental filtering), dan katastrofisasi (catastrophizing) terhadap nilai ujian.',
  },
  {
    id: 'seg-011',
    speakerId: 'sp-2',
    timestamp: '08:15',
    relativeMs: 495000,
    text: 'Misalnya, ketika seorang mahasiswa mendapat nilai C pada tugas pertama, pikiran otomatis yang muncul sering berupa dialog internal destruktif: "Saya memang tidak berbakat di jurusan psikologi ini, saya pasti gagal menjadi sarjana dan mengecewakan orang tua saya." Jika pola pikir irasional dan bias atribusi ini dibiarkan berkembang biak tanpa sanggahan logis berdasarkan bukti objektif, dampaknya adalah terbentuknya skema diri (self-schema) yang rapuh, mudah putus asa, dan rentan terhadap gangguan kecemasan umum.',
  },
  {
    id: 'seg-012',
    speakerId: 'sp-mod',
    timestamp: '09:10',
    relativeMs: 550000,
    text: 'Menarik sekali pembahasan Saudara Budi mengenai distorsi kognitif dan pembentukan skema diri yang maladaptif. Sekarang mari kita elaborasi aspek intervensi praktis dan aplikatif. Dalam setting kampus perguruan tinggi, program psikoedukasi macam apa yang menurut Anda berdua paling efektif untuk membantu mahasiswa meregulasi emosi serta mengelola beban kognitif mereka sehari-hari? Mari kita dengarkan pandangan mendalam dari Siti terlebih dahulu.',
  },
  {
    id: 'seg-013',
    speakerId: 'sp-1',
    timestamp: '10:05',
    relativeMs: 605000,
    text: 'Menurut hemat saya, intervensi berbasis kesadaran penuh (mindfulness-based stress reduction atau MBSR) memiliki bukti empiris yang sangat solid dalam ranah psikologi klinis dan kesehatan mental. Latihan mindfulness membantu mahasiswa mengembangkan kemampuan metakognisi — yaitu kesadaran tingkat tinggi untuk mengamati proses berpikir, aliran emosi, dan sensasi badaniah mereka sendiri dari jarak aman tanpa langsung menghakimi atau mengidentifikasi diri secara berlebihan. Dengan demikian, mahasiswa tidak mudah terjerumus dalam pola reaktif impulsif saat menghadapi kejutan stresor mendadak.',
  },
  {
    id: 'seg-014',
    speakerId: 'sp-1',
    timestamp: '11:00',
    relativeMs: 660000,
    text: 'Di samping latihan mindfulness formal, teknik penguraian tugas (task chunking) dan prinsip desain pembelajaran yang meminimalkan beban kognitif ekstrinsik juga harus disosialisasikan secara luas kepada para dosen dan pengajar. Melalui teknik ini, sebuah proyek penelitian atau laporan praktikum besar dipecah menjadi unit-unit tindakan harian yang lebih kecil dan terukur secara bertahap. Ketika sebuah subtugas selesai dikerjakan, sirkuit penghargaan di otak melepaskan dopamin yang memberikan rasa pencapaian (sense of mastery), sehingga memperkuat efikasi diri dan stamina mental mahasiswa.',
  },
  {
    id: 'seg-015',
    speakerId: 'sp-2',
    timestamp: '11:55',
    relativeMs: 715000,
    text: 'Saya ingin melengkapi perspektif Siti dengan menekankan faktor lingkungan sosial, khususnya dukungan sosial (social support). Dalam psikologi sosial dan kesehatan mental masyarakat, kelompok sebaya (peer support group) terbukti menjadi faktor protektif yang sangat esensial terhadap pencegahan depresi klinis. Ketika mahasiswa dapat berkumpul dan berbagi keluh kesah dalam suasana yang penuh empati, validasi afektif, dan penerimaan tanpa syarat (unconditional positive regard), kadar hormon kortisol dalam aliran darah terbukti menurun secara signifikan.',
  },
  {
    id: 'seg-016',
    speakerId: 'sp-2',
    timestamp: '12:50',
    relativeMs: 770000,
    text: 'Selain itu, kita tidak boleh melupakan fondasi biologis manusia: higiene tidur (sleep hygiene) dan nutrisi seimbang. Dalam keadaan kurang tidur yang kronis (chronic sleep deprivation), neurotoksin metabolik menumpuk di parenkim otak karena sistem glimfatik tidak dapat bekerja optimal sebagaimana semestinya saat fase tidur gelombang lambat (slow-wave sleep). Banyak mahasiswa mengira bahwa mengurangi jam tidur demi belajar adalah bentuk dedikasi, padahal dari perspektif neurobiologi, itu adalah tindakan sabotase diri yang menghancurkan integritas plastisitas sinaptik dan konsolidasi memori deklaratif.',
  },
  {
    id: 'seg-017',
    speakerId: 'sp-mod',
    timestamp: '13:50',
    relativeMs: 830000,
    text: 'Analisis yang sangat komprehensif, Budi. Hal ini memperjelas bahwa intervensi psikologis tidak bisa berdiri sendiri secara terisolasi tanpa memperhatikan variabel biologis dan ekologis di sekitarnya. Sekarang, bagaimana dengan aspek psikodiagnostik dan asesmen kepribadian? Apakah tipe kepribadian tertentu — misalnya neurotisme tinggi atau perfeksionisme maladaptif dalam model Big Five — memiliki kerentanan lebih besar terhadap stres kognitif dan emosional ini?',
  },
  {
    id: 'seg-018',
    speakerId: 'sp-1',
    timestamp: '14:45',
    relativeMs: 885000,
    text: 'Tentu saja, Dokter Rian. Dimensi neurotisme (neuroticism) dalam teori kepribadian Five-Factor Model dari Costa dan McCrae memang berkorelasi positif sangat kuat dengan reaktivitas emosional negatif dan kecenderungan mengalami afek yang labil. Mahasiswa dengan tingkat neurotisme tinggi memiliki ambang batas kepekaan sistem saraf otonom yang lebih rendah terhadap stimulasi yang mengancam. Mereka cenderung membesar-besarkan risiko potensial dan memprediksi skenario terburuk bahkan sebelum situasi tersebut terjadi.',
  },
  {
    id: 'seg-019',
    speakerId: 'sp-1',
    timestamp: '15:40',
    relativeMs: 940000,
    text: 'Selain neurotisme, kita juga perlu mencermati fenomena perfeksionisme evaluatif sosial (socially prescribed perfectionism). Mahasiswa tipe ini meyakini bahwa lingkungan sosial menuntut mereka untuk selalu tampil tanpa cela di setiap presentasi dan ujian. Ketika terjadi sedikit saja ketidaksempurnaan — misalnya salah menjawab satu pertanyaan dosen di kelas — mereka mengalami déjà vu rasa malu yang mendalam (shame-proneness) dan perasaan tidak berharga. Akibatnya, energi kognitif mereka terkuras habis bukan untuk memahami konsep ilmu, melainkan untuk mempertahankan topeng kesempurnaan palsu.',
  },
  {
    id: 'seg-020',
    speakerId: 'sp-2',
    timestamp: '16:35',
    relativeMs: 995000,
    text: 'Tepat sekali. Sebaliknya, trait kepribadian seperti conscientiousness (kesadaran berencana) dan psychological hardiness (ketangguhan kepribadian) justru menjadi perisai pertahanan yang tangguh. Individu yang memiliki hardiness tinggi memperlihatkan tiga karakteristik utama yang dikenal sebagai 3C: komitmen (commitment) terhadap tujuan hidup, kendali (control) atas pilihan tindakan diri, dan memandang perubahan atau krisis sebagai tantangan (challenge) yang memperkaya wawasan, bukan bencana kehancuran.',
  },
  {
    id: 'seg-021',
    speakerId: 'sp-2',
    timestamp: '17:30',
    relativeMs: 1050000,
    text: 'Dalam kaitannya dengan neuroplastisitas (neuroplasticity), kabar baiknya adalah sifat-sifat adaptif ini bukanlah takdir genetik yang kaku dan statis seumur hidup. Otak manusia mempertahankan kemampuan plastisitas sinaptik sepanjang siklus kehidupan. Melalui pembiasaan perilaku baru, terapi psikologis yang terarah, latihan reframing kognitif yang konsisten, dan penguatan lingkungan belajar yang suportif, jalur-jalur neural yang mendukung resiliensi dapat dibangun kembali dan diperkuat secara anatomis.',
  },
  {
    id: 'seg-021b',
    speakerId: 'sp-mod',
    timestamp: '18:10',
    relativeMs: 1090000,
    text: 'Ulasan neuroplastisitas yang sangat mencerahkan. Sebelum melangkah lebih jauh, saya ingin mengundang tanggapan dari Saudari Siti terkait pertolongan pertama pada luka psikologis (Psychological First Aid atau PFA) di tingkat fakultas. Bagaimana mahasiswa dapat mengidentifikasi tanda-tanda dekompensasi psikologis pada kawan dekatnya sebelum terlambat, dan intervensi non-klinis apa yang dapat segera dipraktikkan tanpa melangkahi wewenang profesional?',
  },
  {
    id: 'seg-021c',
    speakerId: 'sp-1',
    timestamp: '18:55',
    relativeMs: 1135000,
    text: 'Pertanyaan yang sangat krusial, Dokter Rian. Kerangka kerja Psychological First Aid bertumpu pada tiga pilar utama: Look, Listen, and Link. Pertama, "Look": kita mencermati perubahan perilaku drastis, seperti penarikan diri dari interaksi sosial, tatapan kosong, penurunan higienitas diri, atau penurunan prestasi mendadak. Kedua, "Listen": mendengarkan secara aktif tanpa menghakimi, memvalidasi emosi tanpa terburu-buru memberikan nasihat klise seperti "kamu kurang bersyukur". Ketiga, "Link": menghubungkan yang bersangkutan dengan sumber daya bantuan profesional, seperti konselor sebaya atau psikolog di pusat layanan kesehatan mahasiswa.',
  },
  {
    id: 'seg-021d',
    speakerId: 'sp-2',
    timestamp: '19:40',
    relativeMs: 1180000,
    text: 'Saya ingin menambahkan bahwa dalam proses "Listen" tersebut, kita perlu mewaspadai fenomena kelelahan welas asih (compassion fatigue) pada diri kita sendiri sebagai penolong sebaya. Mahasiswa yang mendampingi temannya yang sedang krisis sering kali terseret ke dalam pusaran trauma sekunder (secondary traumatic stress). Oleh karena itu, penetapan batasan interpersonal yang sehat (healthy psychological boundaries) merupakan bagian integral dari etika pendampingan psikologis komunitas.',
  },
  {
    id: 'seg-022',
    speakerId: 'sp-mod',
    timestamp: '18:25',
    relativeMs: 1105000,
    text: 'Sebuah pesan optimisme ilmiah yang sangat berharga dari Saudara Budi. Konsep neuroplastisitas menegaskan bahwa manusia memiliki agensi untuk mentransformasi cara berpikir dan merespons lingkungannya. Sekarang, mari kita sentuh aspek etika dan metodologi penelitian. Ketika mahasiswa psikologi menyelenggarakan riset tentang topik sensitif seperti depresi, kecemasan, atau trauma emosional pada rekan sebayanya, rambu-rambu etika apa yang paling mendesak untuk ditegakkan tanpa kompromi?',
  },
  {
    id: 'seg-023',
    speakerId: 'sp-1',
    timestamp: '19:20',
    relativeMs: 1160000,
    text: 'Prinsip nomor satu yang tidak boleh ditawar adalah "primum non nocere" — jangan membahayakan subjek penelitian (non-maleficence). Peneliti mahasiswa wajib menyusun prosedur persetujuan setelah penjelasan (informed consent) yang transparan, sukarela, dan mudah dipahami. Partisipan harus diberi tahu secara lugas mengenai hak mereka untuk mengundurkan diri sewaktu-waktu tanpa konsekuensi atau sanksi apa pun.',
  },
  {
    id: 'seg-024',
    speakerId: 'sp-1',
    timestamp: '20:15',
    relativeMs: 1215000,
    text: 'Selanjutnya, protokol kerahasiaan data (confidentiality and anonymization) harus diterapkan dengan standar enkripsi yang ketat. Jika wawancara kualitatif memicu reaktivasi memori traumatis (retraumatization) pada subjek, peneliti wajib menyediakan jalur rujukan langsung ke unit konseling psikologis kampus yang profesional untuk proses debriefing klinis yang memadai.',
  },
  {
    id: 'seg-025',
    speakerId: 'sp-2',
    timestamp: '21:10',
    relativeMs: 1270000,
    text: 'Menyambung penjelasan Siti mengenai etika riset, dari sudut pandang integritas akademis, penting juga bagi kita untuk menghindari bias konfirmasi (confirmation bias) dan manipulasi data kuantitatif demi memaksakan nilai signifikansi p-value yang semu. Dalam psikologi terbuka (open science movement), preregistrasi desain penelitian dan transparansi instrumen ukur adalah langkah penting demi memastikan replikabilitas temuan ilmiah yang kita hasilkan.',
  },
  {
    id: 'seg-026',
    speakerId: 'sp-mod',
    timestamp: '22:05',
    relativeMs: 1325000,
    text: 'Luar biasa komprehensif dan mendalam. Kita telah merangkai benang merah dari aspek neurobiologis, psikologis individual (kognisi, afeksi, dan regulasi emosi), dinamika kepribadian, dimensi sosial antarmahasiswa, hingga standar baku etika keilmuan psikologi. Sebagai sintesis akhir dari diskusi kita hari ini, saya ingin meminta masing-masing narasumber memberikan satu pernyataan penutup (closing statement) yang merangkum pesan terpenting bagi civitas akademika kita.',
  },
  {
    id: 'seg-027',
    speakerId: 'sp-1',
    timestamp: '23:00',
    relativeMs: 1380000,
    text: 'Pesan penutup dari saya: Mahasiswa perlu menyadari bahwa kerentanan emosional bukanlah sebuah tanda aib atau kelemahan karakter, melainkan sinyal biologis manusiawi bahwa sistem psikis kita sedang memerlukan pemulihan dan penataan ulang strategi adaptasi. Dengan menumbuhkan welas asih pada diri sendiri (self-compassion), menjauhi perfeksionisme semu, dan proaktif mempraktikkan regulasi emosi yang sehat, kita dapat menyelesaikan studi dengan integritas tinggi dan jiwa yang tetap utuh.',
  },
  {
    id: 'seg-028',
    speakerId: 'sp-2',
    timestamp: '23:55',
    relativeMs: 1435000,
    text: 'Dari saya, marilah kita membiasakan diri untuk mengenali batasan kapasitas kognitif kita tanpa rasa bersalah. Belajar secara efektif bukan tentang memaksakan diri begadang sepanjang malam hingga batas ambang kelelahan ekstrem, melainkan tentang mengoptimalkan alokasi sumber daya mental secara bijak dan proporsional. Sinergi antara disiplin manajemen waktu yang realistis, istirahat berkualitas, dukungan teman sebaya, dan kesediaan mencari pertolongan profesional saat dibutuhkan adalah kunci utama ketahanan hidup akademis jangka panjang.',
  },
  {
    id: 'seg-029',
    speakerId: 'sp-mod',
    timestamp: '24:50',
    relativeMs: 1490000,
    text: 'Terima kasih yang sebesar-besarnya kepada Saudari Siti dan Saudara Budi atas kontribusi pemikiran yang sangat bernas, kritis, dan mendalam sepanjang forum ini berlangsung. Notula dan transkrip lengkap diskusi ini akan segera kami formulasikan dalam format dokumen resmi (TXT, DOCX, dan PDF) untuk didistribusikan kepada seluruh peserta serta dijadikan arsip referensi kajian mahasiswa psikologi. Forum diskusi resmi ditutup. Selamat siang, salam hangat, dan salam sehat jiwa bagi kita semua.',
  },
]

export const SAMPLE_SEGMENTS: Segment[] = RAW_SEGMENTS.map(s => ({
  ...s,
  startTime: s.timestamp,
  rawText: s.text,
  displayText: s.text,
  dialectChanges: [],
  edited: false,
}))
