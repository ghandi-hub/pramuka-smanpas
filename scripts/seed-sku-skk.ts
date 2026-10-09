import { MongoClient } from "mongodb";
import skkPenegakData from "./skk-penegak-data.json";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pramuka_db";
const DB_NAME = process.env.MONGODB_DATABASE || "pramuka_db";

interface SkuItem {
  id: string;
  _id?: string;
  level: "bantara" | "laksana";
  point_number: number;
  category: "Spiritual/Agama" | "Sosial & Emosional" | "Keterampilan/Intelektual" | "Fisik & Lingkungan";
  title: string;
  description: string;
  sub_points?: string[];
  created_at: string;
  updated_at: string;
}

interface SkkLevelDetail {
  shape: string;
  requirements: string[];
}

interface SkkItem {
  id: string;
  _id?: string;
  code: string;
  name: string;
  field: string;
  color: "Kuning" | "Merah" | "Putih" | "Hijau" | "Biru";
  color_code: "kuning" | "merah" | "putih" | "hijau" | "biru";
  icon_key: string;
  is_mandatory: boolean;
  is_wajib?: boolean;
  order_number?: number;
  description: string;
  levels: {
    purwa: SkkLevelDetail;
    madya: SkkLevelDetail;
    utama: SkkLevelDetail;
  };
  created_at: string;
  updated_at: string;
}

const now = new Date().toISOString();

// FULL 23 BUTIR PENEGAK BANTARA (SK KWARNAS NO. 199 TAHUN 2011)
const bantaraItems: Omit<SkuItem, "id" | "created_at" | "updated_at">[] = [
  {
    level: "bantara",
    point_number: 1,
    category: "Spiritual/Agama",
    title: "Memahami dan Mengamalkan Ajaran Agama",
    description: "Dapat menjelaskan makna Rukun Iman dan Rukun Islam bagi umat Islam, atau tata peribadatan dan ajaran keagamaan sesuai keyakinannya (Katolik, Kristen Protestan, Hindu, Buddha).",
    sub_points: [
      "Islam: Menjelaskan makna Rukun Iman & Islam, makna sholat berjamaah & mendirikan sholat sunah, makna & macam puasa, tata cara pengurusan jenazah (Tajhizul Jenazah), doa ijab qobul zakat, serta hafalan & penjelasan hadist.",
      "Katolik: Memahami makna dan arti Gereja Katolik, serta memimpin doa dan membuat gerakan cinta kasih pada keberagaman di luar Gereja Katolik.",
      "Kristen Protestan: Mendalami Hukum Kasih dan mengamalkannya dalam kehidupan sehari-hari.",
      "Hindu: Menjelaskan sejarah Hindu di Indonesia, hakikat persembahyangan, maksud kelahiran manusia, Tri Hita Karana, Asanas Hatta Yoga, melafalkan Dharma Gita, dan pura Sad Kahyangan.",
      "Buddha: Saddha Buddha Dharma, merumuskan keyakinan, sejarah Buddha Gotama, Tiratana, dan sejarah penulisan Tripitaka."
    ]
  },
  {
    level: "bantara",
    point_number: 2,
    category: "Sosial & Emosional",
    title: "Berani Menyampaikan Kritik dan Saran Santun",
    description: "Berani menyampaikan kritik dan saran dengan sopan dan santun kepada sesama teman.",
    sub_points: [
      "Berani mengemukakan saran dengan sopan dan santun tanpa menyinggung perasaan teman.",
      "Dapat mengungkapkan alasan dan memilih kata-kata yang konstruktif.",
      "Tahu waktu yang tepat untuk menyampaikan kritikan dan mampu membaca perasaan teman."
    ]
  },
  {
    level: "bantara",
    point_number: 3,
    category: "Sosial & Emosional",
    title: "Mengikuti Jalannya Diskusi dengan Baik",
    description: "Dapat mengikuti jalannya diskusi dengan baik.",
    sub_points: [
      "Memahami dan menaati tata tertib berdiskusi.",
      "Turut aktif menyampaikan pandangan dalam proses diskusi ambalan."
    ]
  },
  {
    level: "bantara",
    point_number: 4,
    category: "Spiritual/Agama",
    title: "Saling Menghormati dan Toleransi Beragama",
    description: "Dapat saling menghormati dan toleransi dalam bakti antar umat beragama.",
    sub_points: [
      "Selalu mengingatkan anggota lain untuk menunaikan kewajiban agamanya.",
      "Tahu cara bersikap toleran ketika orang lain melakukan kewajiban agamanya."
    ]
  },
  {
    level: "bantara",
    point_number: 5,
    category: "Sosial & Emosional",
    title: "Mengikuti Pertemuan Ambalan Rutin",
    description: "Mengikuti pertemuan Ambalan sekurang-kurangnya 2 kali setiap bulan.",
    sub_points: [
      "Tercatat hadir dalam pertemuan dan latihan rutin Ambalan sekurang-kurangnya 2 kali setiap bulan."
    ]
  },
  {
    level: "bantara",
    point_number: 6,
    category: "Sosial & Emosional",
    title: "Setia Membayar Iuran dari Usaha Sendiri",
    description: "Setia membayar iuran kepada gugus depan, dengan uang yang diperoleh dari usaha sendiri.",
    sub_points: [
      "Membayar iuran kepada gugus depan setiap latihan mingguan dengan uang yang seluruhnya atau sebagian diperoleh dari usaha sendiri."
    ]
  },
  {
    level: "bantara",
    point_number: 7,
    category: "Sosial & Emosional",
    title: "Berbahasa Indonesia yang Baik dan Benar",
    description: "Dapat berbahasa Indonesia dengan baik dan benar dalam pergaulan sehari-hari.",
    sub_points: [
      "Selalu menggunakan bahasa Indonesia dengan baik dan benar dalam pergaulan sehari-hari."
    ]
  },
  {
    level: "bantara",
    point_number: 8,
    category: "Sosial & Emosional",
    title: "Membantu Mengelola Kegiatan di Ambalan",
    description: "Telah membantu mengelola kegiatan di Ambalan.",
    sub_points: [
      "Aktif dan terlibat dalam Sangga Kerja pengelolaan kegiatan ambalan."
    ]
  },
  {
    level: "bantara",
    point_number: 9,
    category: "Sosial & Emosional",
    title: "Aktif Kerja Bakti di Masyarakat",
    description: "Telah ikut aktif kerja bakti di masyarakat minimal 2 kali.",
    sub_points: [
      "Minimal 2 kali mengikuti kegiatan kerja bakti di lingkungan tempat tinggal atau masyarakat."
    ]
  },
  {
    level: "bantara",
    point_number: 10,
    category: "Sosial & Emosional",
    title: "Menampilkan Kesenian Daerah di Depan Umum",
    description: "Dapat menampilkan kesenian daerah di depan umum minimal satu kali.",
    sub_points: [
      "Secara perorangan maupun bersama teman-temannya menampilkan salah satu kesenian daerah."
    ]
  },
  {
    level: "bantara",
    point_number: 11,
    category: "Keterampilan/Intelektual",
    title: "Memahami AD & ART Gerakan Pramuka",
    description: "Mengenal, mengerti dan memahami isi AD & ART Gerakan Pramuka.",
    sub_points: [
      "Dapat menyebutkan nomor SK Keppres tentang AD Gerakan Pramuka dan SK Kwarnas tentang ART Gerakan Pramuka.",
      "Dapat menyebutkan pasal-pasal pokok tentang tujuan, tugas pokok, prinsip dasar kepramukaan, dan metode kepramukaan."
    ]
  },
  {
    level: "bantara",
    point_number: 12,
    category: "Keterampilan/Intelektual",
    title: "Sejarah Kepramukaan Indonesia dan Dunia",
    description: "Dapat menjelaskan sejarah Kepramukaan Indonesia dan Dunia.",
    sub_points: [
      "Menyebutkan pendiri kepramukaan dunia (Baden Powell), sejarah pramuka dunia, dan karya buku yang dihasilkan.",
      "Menceritakan masuknya kepramukaan ke Indonesia hingga perkembangan Gerakan Pramuka sampai saat ini."
    ]
  },
  {
    level: "bantara",
    point_number: 13,
    category: "Keterampilan/Intelektual",
    title: "Navigasi Jam, Kompas, dan Tanda Jejak",
    description: "Dapat menggunakan jam, kompas, tanda jejak dan tanda-tanda alam lainnya dalam pengembaraan.",
    sub_points: [
      "Dapat memperkirakan waktu tanpa melihat jam.",
      "Dapat menjelaskan bagian-bagian kompas, azimuth, back-azimuth, resection, dan intersection.",
      "Membaca dan membuat tanda jejak, tanda alam, serta membuat peta perjalanan."
    ]
  },
  {
    level: "bantara",
    point_number: 14,
    category: "Sosial & Emosional",
    title: "Pengamalan Pancasila dalam Kehidupan Sehari-hari",
    description: "Dapat menjelaskan bentuk pengamalan Pancasila dalam kehidupan sehari-hari.",
    sub_points: [
      "Menyebutkan butir-butir Pancasila dan menyampaikan contoh konkret pengamalannya dalam kehidupan sehari-hari."
    ]
  },
  {
    level: "bantara",
    point_number: 15,
    category: "Keterampilan/Intelektual",
    title: "Mengenal Organisasi ASEAN dan PBB",
    description: "Dapat menjelaskan tentang organisasi ASEAN dan PBB.",
    sub_points: [
      "Menjelaskan kepengurusan, sekretaris jenderal, alamat sekretariat, dan badan organisasi di bawah ASEAN.",
      "Menjelaskan kepengurusan, sekretaris jenderal, alamat markas, dan badan organisasi di bawah PBB."
    ]
  },
  {
    level: "bantara",
    point_number: 16,
    category: "Keterampilan/Intelektual",
    title: "Pengetahuan dan Praktik Kewirausahaan",
    description: "Dapat menjelaskan tentang kewirausahaan.",
    sub_points: [
      "Menjelaskan konsep kewirausahaan dan telah melakukan salah satu kegiatan kewirausahaan secara nyata."
    ]
  },
  {
    level: "bantara",
    point_number: 17,
    category: "Keterampilan/Intelektual",
    title: "Daur Ulang Barang Bekas Bermanfaat",
    description: "Dapat mendaur ulang barang bekas menjadi barang yang bermanfaat.",
    sub_points: [
      "Dapat menjelaskan prosesnya serta menunjukkan karya hasil daur ulang barang bekas yang bermanfaat."
    ]
  },
  {
    level: "bantara",
    point_number: 18,
    category: "Keterampilan/Intelektual",
    title: "Penerapan Tali Temali dan Pionering",
    description: "Dapat menerapkan pengetahuannya tentang tali temali dan pionering dalam kehidupan sehari-hari.",
    sub_points: [
      "Dapat menguasai serta menggunakan aneka simpul dan ikatan kepramukaan dalam kehidupan sehari-hari."
    ]
  },
  {
    level: "bantara",
    point_number: 19,
    category: "Fisik & Lingkungan",
    title: "Olahraga Teratur, Renang Gaya Bebas, dan Olahraga Tim",
    description: "Selalu berolahraga, mampu melakukan olahraga renang gaya bebas dan menguasai 1 (satu) cabang olahraga tim.",
    sub_points: [
      "Melakukan olahraga secara teratur minimal satu minggu sekali.",
      "Mampu mempraktikkan renang gaya bebas dengan teknik pernapasan yang benar.",
      "Dapat menjelaskan peraturan permainan dan mempraktikkan satu cabang olahraga tim."
    ]
  },
  {
    level: "bantara",
    point_number: 20,
    category: "Fisik & Lingkungan",
    title: "Perkembangan Fisik Laki-laki dan Perempuan",
    description: "Dapat menjelaskan perkembangan fisik laki-laki dan perempuan.",
    sub_points: [
      "Dapat memaparkan di depan ambalan mengenai perubahan perkembangan fisik dan psikis pada laki-laki dan perempuan."
    ]
  },
  {
    level: "bantara",
    point_number: 21,
    category: "Fisik & Lingkungan",
    title: "Memimpin Peraturan Baris Berbaris (PBB)",
    description: "Dapat memimpin baris berbaris dan menjelaskan peraturannya kepada anggota sangganya.",
    sub_points: [
      "Dapat menjelaskan dan memperagakan minimal 15 gerakan dasar baris-berbaris kepada anggota sangga.",
      "Dapat memimpin komando barisan dan baris berbaris secara tertib."
    ]
  },
  {
    level: "bantara",
    point_number: 22,
    category: "Fisik & Lingkungan",
    title: "Penyakit Infeksi, Degeneratif, dan Pola Hidup Sehat",
    description: "Dapat menyebutkan beberapa penyakit infeksi, degeneratif dan penyakit yang disebabkan perilaku tidak sehat.",
    sub_points: [
      "Menyebutkan sedikitnya 3 penyakit infeksi beserta penyebabnya.",
      "Menyebutkan sedikitnya 3 penyakit degeneratif beserta faktor penyebabnya.",
      "Menyebutkan sedikitnya 3 penyakit akibat perilaku tidak sehat."
    ]
  },
  {
    level: "bantara",
    point_number: 23,
    category: "Fisik & Lingkungan",
    title: "Mengikuti Perkemahan 3 Hari Berturut-turut",
    description: "Ikut serta dalam perkemahan selama 3 hari berturut – turut.",
    sub_points: [
      "Aktif mengikuti dan menyelesaikan kegiatan perkemahan selama minimal 3 hari 2 malam berturut-turut."
    ]
  }
];

// FULL 22 BUTIR PENEGAK LAKSANA (SK KWARNAS NO. 199 TAHUN 2011)
const laksanaItems: Omit<SkuItem, "id" | "created_at" | "updated_at">[] = [
  {
    level: "laksana",
    point_number: 1,
    category: "Spiritual/Agama",
    title: "Pendalaman dan Pengamalan Ajaran Agama",
    description: "Mampu memahami terhadap perbedaan keyakinan yang dianut oleh orang lain serta bersikap konsisten terhadap pelaksanaan agama yang diyakininya.",
    sub_points: [
      "Islam: Menjelaskan rukun iman & islam di muka ambalan/penggalang, rukun sholat & sholat sunah, rukun puasa & puasa sunah, merawat jenazah, pernah jadi amil zakat, dan hafal ayat tematik Al-Qur'an.",
      "Katolik: Memahami 7 sakramen, menceritakan riwayat Santo/Santa, dan membahas 10 Perintah Allah dalam kehidupan sehari-hari.",
      "Kristen Protestan: Bersaksi di depan jemaat/teman sebaya, aktif melayani di gereja, dan mengikuti katekisasi.",
      "Hindu: Menjelaskan candi/kerajaan Hindu, memimpin Panca Sembah, ajaran Samsara/Punarbawa, Asta Brata, Yoga Asanas, Dharma Gita, dan seni sakral Hindu.",
      "Buddha: Memimpin kebaktian & hari besar Buddha, mendeskripsikan intisari Tripitaka, puja & doa, sila dalam delapan jalan utama, dan kebenaran Tripitaka."
    ]
  },
  {
    level: "laksana",
    point_number: 2,
    category: "Sosial & Emosional",
    title: "Menerima Kritik dan Menyampaikan Pendapat Santun",
    description: "Dapat menerima kritik dari orang lain, serta berani mengeluarkan pendapatnya dengan tertib, sopan dan santun kepada orang-orang di sekitarnya.",
    sub_points: [
      "Mendengar pendapat orang lain dengan lapang dada.",
      "Mampu menyampaikan pendapatnya dengan santun tanpa menyinggung orang lain.",
      "Memahami dan menaati tata cara mengeluarkan pendapat secara tertib."
    ]
  },
  {
    level: "laksana",
    point_number: 3,
    category: "Sosial & Emosional",
    title: "Memimpin Diskusi Ambalan dan Mengambil Keputusan",
    description: "Dapat mengikuti dan atau memimpin diskusi Ambalan dan mampu mengambil keputusan.",
    sub_points: [
      "Mengetahui tata cara memimpin forum diskusi.",
      "Pernah memimpin sebuah diskusi ambalan.",
      "Pernah mengambil keputusan dengan mempertimbangkan risiko dan konsekuensi keputusan."
    ]
  },
  {
    level: "laksana",
    point_number: 4,
    category: "Sosial & Emosional",
    title: "Menjadi Penengah dan Pemberi Solusi Kelompok",
    description: "Dapat menjadi penengah (memberi solusi), jika terjadi ketidaksepahaman dalam kelompoknya.",
    sub_points: [
      "Menyimak dan menyikapi masalah dengan pikiran jernih tanpa prasangka.",
      "Memberikan pendapat secara santun dan objektif.",
      "Memberikan solusi pemecahan yang adil dan tidak memihak."
    ]
  },
  {
    level: "laksana",
    point_number: 5,
    category: "Sosial & Emosional",
    title: "Keaktifan Pertemuan Ambalan (Minimal 3 Kali Sebulan)",
    description: "Mengikuti pertemuan Ambalan sekurang-kurangnya 3 kali setiap bulan.",
    sub_points: [
      "Telah mengikuti pertemuan Ambalan sekurang-kurangnya 3 kali setiap bulan dalam kurun waktu minimal 4 bulan."
    ]
  },
  {
    level: "laksana",
    point_number: 6,
    category: "Sosial & Emosional",
    title: "Iuran Mandiri dan Mengelola Administrasi Keuangan",
    description: "Setia membayar iuran kepada gugus depannya, dengan uang diperoleh dari usaha sendiri, serta membantu Ambalan dalam mengelola administrasi keuangan.",
    sub_points: [
      "Setiap latihan mingguan membayar iuran gudep dari hasil usaha sendiri.",
      "Pernah membantu mengelola administrasi pembukuan keuangan Ambalan."
    ]
  },
  {
    level: "laksana",
    point_number: 7,
    category: "Sosial & Emosional",
    title: "Memimpin Rapat dan Membuat Risalah",
    description: "Dapat memimpin rapat dan membuat risalah dengan baik.",
    sub_points: [
      "Pernah memimpin jalannya rapat ambalan secara efektif.",
      "Menyusun dan menyampaikan risalah rapat sesuai kaidah penulisan risalah dalam buku ambalan."
    ]
  },
  {
    level: "laksana",
    point_number: 8,
    category: "Sosial & Emosional",
    title: "Memimpin Kegiatan di Tingkat Ambalan",
    description: "Pernah memimpin kegiatan di tingkat Ambalan.",
    sub_points: [
      "Pernah memimpin pelaksanaan salah satu kegiatan ambalan sebagai Ketua Sangga Kerja."
    ]
  },
  {
    level: "laksana",
    point_number: 9,
    category: "Sosial & Emosional",
    title: "Memimpin Kerja Bakti di Masyarakat",
    description: "Pernah memimpin kerja bakti di masyarakat minimal 2 kali.",
    sub_points: [
      "Pernah memimpin kerja bakti di lingkungan masyarakat minimal 2 kali yang diikuti oleh warga masyarakat."
    ]
  },
  {
    level: "laksana",
    point_number: 10,
    category: "Sosial & Emosional",
    title: "Memimpin Kelompok Menampilkan Kesenian Daerah",
    description: "Dapat memimpin kelompok dalam menampilkan salah satu jenis kesenian daerah.",
    sub_points: [
      "Pernah memimpin anggota ambalan menampilkan kesenian daerah dalam suatu perkemahan atau acara resmi."
    ]
  },
  {
    level: "laksana",
    point_number: 11,
    category: "Keterampilan/Intelektual",
    title: "Menjelaskan Isi AD & ART di Depan Ambalan",
    description: "Dapat menjelaskan isi AD & ART Gerakan Pramuka kepada Ambalan.",
    sub_points: [
      "Telah memaparkan Tujuan, Tugas Pokok, Fungsi, Prinsip Dasar, dan Metode Kepramukaan di depan anggota ambalan."
    ]
  },
  {
    level: "laksana",
    point_number: 12,
    category: "Keterampilan/Intelektual",
    title: "Menjelaskan Sejarah Kepramukaan di Muka Umum",
    description: "Dapat menjelaskan di muka umum tentang sejarah kepramukaan Indonesia dan dunia.",
    sub_points: [
      "Telah menjelaskan sejarah kepramukaan Indonesia dan dunia secara sistematis di muka perindukan Siaga atau pasukan Penggalang."
    ]
  },
  {
    level: "laksana",
    point_number: 13,
    category: "Keterampilan/Intelektual",
    title: "Melakukan Pengembaraan 3 Hari atau Mengatur Perkemahan",
    description: "Dapat melakukan pengembaraan selama 3 hari dan atau mengatur kehidupan perkemahan selama minimal 3 hari.",
    sub_points: [
      "Membuat rencana pengembaraan, izin, logistik, dan melapor ke kepolisian di jalur pengembaraan.",
      "Merencanakan dan mengatur kehidupan perkemahan minimal 3 hari (jadwal, perlengkapan, dan anggaran)."
    ]
  },
  {
    level: "laksana",
    point_number: 14,
    category: "Keterampilan/Intelektual",
    title: "Sejarah, Arti, dan Tata Cara Penggunaan Sang Merah Putih",
    description: "Dapat menjelaskan sejarah, arti, tatacara penggunaan dan kiasan Sang Merah Putih.",
    sub_points: [
      "Dapat menyebutkan isi UU No. 24 Tahun 2009 tentang Bendera, Bahasa, Lambang Negara, serta Lagu Kebangsaan."
    ]
  },
  {
    level: "laksana",
    point_number: 15,
    category: "Keterampilan/Intelektual",
    title: "Peranan Indonesia dalam ASEAN dan PBB",
    description: "Dapat menjelaskan peran Indonesia dalam organisasi ASEAN dan PBB.",
    sub_points: [
      "Mampu menjelaskan kontribusi dan peranan strategis Indonesia dalam organisasi ASEAN dan PBB."
    ]
  },
  {
    level: "laksana",
    point_number: 16,
    category: "Keterampilan/Intelektual",
    title: "Keterampilan Kewirausahaan yang Menghasilkan Uang",
    description: "Telah memiliki keterampilan kewirausahaan yang dapat menghasilkan uang.",
    sub_points: [
      "Pernah menjalankan usaha mandiri maupun kelompok yang menghasilkan keuntungan nyata secara berkala."
    ]
  },
  {
    level: "laksana",
    point_number: 17,
    category: "Keterampilan/Intelektual",
    title: "Membuat Peralatan Teknologi Tepat Guna (TTG)",
    description: "Dapat membuat salah satu jenis peralatan teknologi tepat guna.",
    sub_points: [
      "Mampu merancang dan menunjukkan peralatan teknologi tepat guna kreasi sendiri yang berdaya guna."
    ]
  },
  {
    level: "laksana",
    point_number: 18,
    category: "Keterampilan/Intelektual",
    title: "Membuat Struktur Pionering Bermanfaat Bagi Masyarakat",
    description: "Secara berkelompok dapat membuat struktur dari keterampilan tali temali dan pionering, yang dapat digunakan masyarakat.",
    sub_points: [
      "Membuat struktur pionering (jembatan, gapura, pos pantau) bersama anggota lain yang dapat dimanfaatkan langsung oleh masyarakat."
    ]
  },
  {
    level: "laksana",
    point_number: 19,
    category: "Fisik & Lingkungan",
    title: "Olahraga Rutin, Renang Gaya Selain Bebas, dan Cabang Olahraga",
    description: "Selalu berolahraga, Dapat melakukan olahraga renang selain gaya bebas dan menguasai 1 (satu) cabang olahraga lainnya.",
    sub_points: [
      "Rutin berolahraga setiap minggu.",
      "Mampu mempraktikkan minimal satu gaya renang selain gaya bebas (dada/punggung/kupu-kupu) dengan benar.",
      "Menguasai satu cabang olahraga lainnya dan memahami tata peraturannya."
    ]
  },
  {
    level: "laksana",
    point_number: 20,
    category: "Fisik & Lingkungan",
    title: "Memahami dan Menjelaskan Kesehatan Reproduksi",
    description: "Dapat memahami dan menjelaskan tentang kesehatan reproduksi.",
    sub_points: [
      "Dapat menjelaskan pemahaman kesehatan reproduksi secara ilmiah dan santun kepada anggota ambalan."
    ]
  },
  {
    level: "laksana",
    point_number: 21,
    category: "Fisik & Lingkungan",
    title: "Mempersiapkan dan Melaksanakan Upacara Umum",
    description: "Dapat mempersiapkan dan melaksanakan upacara umum minimal 3 kali.",
    sub_points: [
      "Menyusun persiapan upacara pembukaan dan penutupan latihan minimal 3 kali.",
      "Melaksanakan dan bertugas dalam upacara pembukaan dan penutupan latihan minimal 3 kali."
    ]
  },
  {
    level: "laksana",
    point_number: 22,
    category: "Fisik & Lingkungan",
    title: "Penyebab dan Pencegahan Penyakit Infeksi & Degeneratif",
    description: "Dapat menyebutkan penyebab dan cara pencegahan penyakit infeksi, degeneratif dan penyakit yang disebabkan perilaku tidak sehat.",
    sub_points: [
      "Menyebutkan minimal 3 penyakit infeksi, penyebab, dan cara pencegahannya.",
      "Menyebutkan minimal 3 penyakit degeneratif, penyebab, dan cara pencegahannya.",
      "Menyebutkan minimal 3 penyakit akibat perilaku tidak sehat dan langkah pencegahannya."
    ]
  }
];

// 81 SKK PENEGAK (SK KWARTIR NASIONAL NO. 134/1976 & SK 132/1979)
const skkData: Omit<SkkItem, "created_at" | "updated_at">[] = skkPenegakData as any;

async function seed() {
  console.log(`Menghubungkan ke MongoDB (${MONGO_URI}) ...`);
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log("Memulai proses seeding SKU dan SKK items...");

  // 1. SEED SKU ITEMS
  const skuCollection = db.collection("sku_items");
  
  // Format Bantara Items
  const fullBantara: SkuItem[] = bantaraItems.map((item) => ({
    ...item,
    id: `bantara-${item.point_number}`,
    _id: `bantara-${item.point_number}`,
    created_at: now,
    updated_at: now,
  }));

  // Format Laksana Items
  const fullLaksana: SkuItem[] = laksanaItems.map((item) => ({
    ...item,
    id: `laksana-${item.point_number}`,
    _id: `laksana-${item.point_number}`,
    created_at: now,
    updated_at: now,
  }));

  const allSku = [...fullBantara, ...fullLaksana];

  for (const item of allSku) {
    await skuCollection.updateOne(
      { id: item.id },
      { $set: item },
      { upsert: true }
    );
  }
  console.log(`Berhasil upsert ${fullBantara.length} butir SKU Bantara.`);
  console.log(`Berhasil upsert ${fullLaksana.length} butir SKU Laksana.`);
  console.log(`Total SKU Items tersimpan: ${allSku.length}`);

  // 2. SEED SKK ITEMS
  const skkCollection = db.collection("skk_items");

  const allSkk: SkkItem[] = skkData.map((item, index) => ({
    ...item,
    is_wajib: item.is_mandatory,
    order_number: index + 1,
    _id: item.id,
    created_at: now,
    updated_at: now,
  }));

  for (const item of allSkk) {
    await skkCollection.updateOne(
      { id: item.id },
      { $set: item },
      { upsert: true }
    );
  }
  const validSkkIds = allSkk.map((item) => item.id);
  await skkCollection.deleteMany({ id: { $nin: validSkkIds } });
  console.log(`Berhasil upsert ${allSkk.length} SKK items untuk Penegak.`);

  // Create indexes for fast lookup
  await skuCollection.createIndex({ level: 1, point_number: 1 }, { unique: true });
  await skuCollection.createIndex({ category: 1 });
  await skkCollection.createIndex({ id: 1 }, { unique: true });
  await skkCollection.createIndex({ color_code: 1 });

  // User progress collection indexes
  await db.collection("sku_progress").createIndex({ user_id: 1, sku_item_id: 1 }, { unique: true, sparse: true });
  await db.collection("sku_progress").createIndex({ status: 1 });
  await db.collection("skk_progress").createIndex({ user_id: 1, skk_item_id: 1, level_name: 1 }, { unique: true, sparse: true });
  await db.collection("skk_progress").createIndex({ status: 1 });

  console.log("Semua indeks database SKU & SKK berhasil dipersiapkan.");
  console.log("Seeding selesai dengan sukses!");

  await client.close();
}

seed().catch((err) => {
  console.error("Gagal melakukan seed SKU & SKK:", err);
  process.exit(1);
});
