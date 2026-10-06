import { MongoClient } from "mongodb";

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

// FULL 23 BUTIR PENEGAK BANTARA (SK KWARNAS 198/2011)
const bantaraItems: Omit<SkuItem, "id" | "created_at" | "updated_at">[] = [
  {
    level: "bantara",
    point_number: 1,
    category: "Spiritual/Agama",
    title: "Memahami dan Mengamalkan Ajaran Agama",
    description: "Dapat menjelaskan makna Rukun Iman dan Rukun Islam bagi umat Islam, atau tata peribadatan dan ajaran keagamaan sesuai agama yang dianutnya (Katolik, Kristen Protestan, Hindu, Buddha).",
    sub_points: [
      "Islam: Dapat menjelaskan rukun iman dan rukun islam, mampu menjelaskan rukun shalat dan mendirikan shalat berjamaah, menjelaskan rukun dan hikmah puasa, serta hafal 5 doa harian dan 3 surat pendek juz 'amma.",
      "Katolik: Memahami makna Sakramen Baptis dan Ekaristi, rajin mengikuti misa mingguan, dan mampu berdoa Bapa Kami serta Salam Maria.",
      "Kristen Protestan: Rajin beribadah di gereja, memahami Hukum Kasih dan Sepuluh Hukum Taurat, serta berdoa secara teratur.",
      "Hindu: Memahami Panca Sradha, Tri Hita Karana, dan rutin melaksanakan Tri Sandhya.",
      "Buddha: Memahami Triratna, Empat Kesunyataan Mulia, dan Delapan Jalan Utama."
    ]
  },
  {
    level: "bantara",
    point_number: 2,
    category: "Sosial & Emosional",
    title: "Menyampaikan Kritik dan Saran Secara Sopan",
    description: "Berani menyampaikan kritik dan saran dengan sopan dan santun kepada sesama teman ambalan demi perbaikan bersama.",
    sub_points: [
      "Menggunakan tutur kata yang santun tanpa merendahkan martabat orang lain.",
      "Menyampaikan masukan konstruktif yang berlandaskan data atau fakta yang objektif."
    ]
  },
  {
    level: "bantara",
    point_number: 3,
    category: "Sosial & Emosional",
    title: "Mengikuti Jalannya Diskusi dengan Baik",
    description: "Dapat mengikuti jalannya diskusi dengan baik, menghargai pandangan yang berbeda, dan tidak memaksakan kehendak pribadi.",
    sub_points: [
      "Aktif menyampaikan pendapat secara tertib dan mendengarkan penjelasan peserta lain.",
      "Menerima keputusan mufakat bersama dengan lapang dada."
    ]
  },
  {
    level: "bantara",
    point_number: 4,
    category: "Spiritual/Agama",
    title: "Toleransi dan Kerukunan Antarumat Beragama",
    description: "Dapat saling menghormati dan menunjukkan toleransi dalam bakti antarumat beragama di lingkungan sekolah maupun masyarakat.",
    sub_points: [
      "Menghormati teman yang sedang menjalankan ibadah keagamaan.",
      "Ikut serta dalam kegiatan kemanusiaan dan bakti sosial tanpa membedakan latar belakang agama."
    ]
  },
  {
    level: "bantara",
    point_number: 5,
    category: "Sosial & Emosional",
    title: "Keaktifan Pertemuan Ambalan",
    description: "Mengikuti pertemuan Ambalan sekurang-kurangnya 2 kali setiap bulan secara rutin dan bertanggung jawab.",
    sub_points: [
      "Tercatat hadir dalam absensi latihan mingguan atau pertemuan rutin ambalan.",
      "Berpartisipasi aktif dalam sesi materi dan dinamika sangga."
    ]
  },
  {
    level: "bantara",
    point_number: 6,
    category: "Sosial & Emosional",
    title: "Membayar Iuran dari Usaha Sendiri",
    description: "Setia membayar iuran kepada ambalannya dengan uang yang seluruhnya atau sebagian diperoleh dari usaha sendiri.",
    sub_points: [
      "Membayar uang kas ambalan tepat waktu.",
      "Menjelaskan sumber penghasilan mandiri yang digunakan (wirausaha kecil, jasa, atau penyisihan tabungan jerih payah sendiri)."
    ]
  },
  {
    level: "bantara",
    point_number: 7,
    category: "Sosial & Emosional",
    title: "Berbahasa Indonesia yang Baik dan Benar",
    description: "Dapat berbahasa Indonesia dengan baik dan benar dalam pergaulan sehari-hari serta menjaga etika berkomunikasi.",
    sub_points: [
      "Menerapkan kaidah bahasa Indonesia yang santun saat berbicara kepada rekan maupun pembina.",
      "Menghindari penggunaan kata-kata kasar atau provokatif."
    ]
  },
  {
    level: "bantara",
    point_number: 8,
    category: "Sosial & Emosional",
    title: "Membantu Mengelola Kegiatan Ambalan",
    description: "Telah ikut aktif membantu Sangga Kerja dalam mengelola kegiatan di Ambalan.",
    sub_points: [
      "Terlibat sebagai panitia pelaksana kegiatan ambalan.",
      "Menjalankan tugas kepanitiaan dengan disiplin dan penuh tanggung jawab."
    ]
  },
  {
    level: "bantara",
    point_number: 9,
    category: "Sosial & Emosional",
    title: "Kerja Bakti di Masyarakat",
    description: "Telah ikut aktif dalam kegiatan kerja bakti di lingkungan masyarakat minimal 2 kali.",
    sub_points: [
      "Melampirkan bukti keikutsertaan kerja bakti (surat keterangan RT/RW atau dokumentasi kegiatan).",
      "Memberikan kontribusi nyata dalam menjaga kebersihan fasilitas umum."
    ]
  },
  {
    level: "bantara",
    point_number: 10,
    category: "Keterampilan/Intelektual",
    title: "Menampilkan Kesenian Daerah",
    description: "Dapat menampilkan satu macam kesenian daerah di depan ambalan atau di depan umum.",
    sub_points: [
      "Menampilkan seni tari daerah, memainkan alat musik tradisional, atau menyanyikan lagu daerah.",
      "Mampu menjelaskan filosofi atau makna budaya dari kesenian yang dibawakan."
    ]
  },
  {
    level: "bantara",
    point_number: 11,
    category: "Keterampilan/Intelektual",
    title: "Memahami AD & ART Gerakan Pramuka",
    description: "Mengenal, mengerti, dan memahami isi Anggaran Dasar dan Anggaran Rumah Tangga Gerakan Pramuka.",
    sub_points: [
      "Menjelaskan asas, tujuan, dan prinsip dasar kepramukaan.",
      "Menjelaskan metode kepramukaan dan kiasan dasar kepenegakan."
    ]
  },
  {
    level: "bantara",
    point_number: 12,
    category: "Keterampilan/Intelektual",
    title: "Sejarah Kepramukaan Indonesia dan Dunia",
    description: "Dapat menjelaskan sejarah kepramukaan Indonesia dan dunia secara sistematis.",
    sub_points: [
      "Menceritakan riwayat hidup Lord Baden Powell of Gilwell.",
      "Menceritakan tonggak berdirinya kepanduan dunia dan sejarah Keppres No. 238 Tahun 1961 di Indonesia."
    ]
  },
  {
    level: "bantara",
    point_number: 13,
    category: "Keterampilan/Intelektual",
    title: "Penggunaan Kompas, Jam, dan Tanda Alam",
    description: "Dapat menggunakan jam, kompas, tanda jejak, dan tanda-tanda alam lainnya dalam pengembaraan.",
    sub_points: [
      "Menentukan arah mata angin dengan kompas bidik (azimuth & back-azimuth).",
      "Menentukan arah mata angin menggunakan jarum jam dan bayangan matahari.",
      "Membaca minimal 8 jenis tanda jejak di alam terbuka."
    ]
  },
  {
    level: "bantara",
    point_number: 14,
    category: "Sosial & Emosional",
    title: "Pengamalan Butir-Butir Pancasila",
    description: "Dapat menjelaskan bentuk pengamalan Pancasila dalam kehidupan sehari-hari.",
    sub_points: [
      "Menyebutkan contoh konkret penerapan sila pertama hingga kelima dalam kehidupan bermasyarakat.",
      "Menunjukkan sikap nasionalisme, gotong royong, dan keadilan sosial."
    ]
  },
  {
    level: "bantara",
    point_number: 15,
    category: "Keterampilan/Intelektual",
    title: "Mengenal Organisasi ASEAN dan PBB",
    description: "Dapat menjelaskan tentang sejarah dan peran organisasi ASEAN dan Perserikatan Bangsa-Bangsa (PBB).",
    sub_points: [
      "Menjelaskan latar belakang Deklarasi Bangkok 1967 dan anggota ASEAN.",
      "Menjelaskan tujuan PBB dan badan-badan khususnya (UNESCO, UNICEF, WHO, UNHCR)."
    ]
  },
  {
    level: "bantara",
    point_number: 16,
    category: "Keterampilan/Intelektual",
    title: "Tali Temali dan Pionering",
    description: "Dapat menerapkan pengetahuannya tentang tali temali dan pionering dalam kehidupan sehari-hari.",
    sub_points: [
      "Dapat membuat simpul hidup, mati, pangkal, tiang, jangkar, dan tarik.",
      "Dapat mengaplikasikan ikatan palang, silang, dan canggah pada konstruksi pionering (misal: tiang bendera atau rak piring)."
    ]
  },
  {
    level: "bantara",
    point_number: 17,
    category: "Fisik & Lingkungan",
    title: "Kerapian Berpakaian dan Kebersihan Lingkungan",
    description: "Selalu berpakaian rapi dan memelihara kesehatan serta kebersihan diri dan lingkungannya.",
    sub_points: [
      "Mengenakan seragam Pramuka lengkap sesuai aturan SK Kwarnas.",
      "Menjaga kebersihan sanggar ambalan dan lingkungan tempat beraktivitas."
    ]
  },
  {
    level: "bantara",
    point_number: 18,
    category: "Keterampilan/Intelektual",
    title: "Memimpin Peraturan Baris Berbaris (PBB)",
    description: "Dapat memimpin baris berbaris dan menjelaskan peraturannya kepada anggota sangganya.",
    sub_points: [
      "Menguasai aba-aba di tempat (sikap sempurna, istirahat, hadap kanan/kiri, balik kanan, jalan di tempat).",
      "Menguasai aba-aba pindah tempat dan formasi barisan serta dapat memberi komando dengan tegas."
    ]
  },
  {
    level: "bantara",
    point_number: 19,
    category: "Fisik & Lingkungan",
    title: "Mengenal Jenis Penyakit dan Pola Sehat",
    description: "Dapat menyebutkan beberapa penyakit infeksi, degeneratif, dan penyakit yang disebabkan perilaku tidak sehat.",
    sub_points: [
      "Menjelaskan contoh dan penularan penyakit infeksi (TBC, DBD, influenza).",
      "Menjelaskan contoh penyakit degeneratif (diabetes, hipertensi, jantung).",
      "Menjelaskan langkah pencegahan melalui Pola Hidup Bersih dan Sehat (PHBS)."
    ]
  },
  {
    level: "bantara",
    point_number: 20,
    category: "Fisik & Lingkungan",
    title: "Perkemahan 3 Hari Berturut-turut",
    description: "Melakukan perencanaan dan pelaksanaan perkemahan sedikitnya 3 hari berturut-turut.",
    sub_points: [
      "Menyusun proposal perencanaan logistik dan tata tertib tapak tenda bersama sangga.",
      "Melaksanakan perkemahan 3 hari 2 malam dengan mandiri dan menjaga kebersihan alam sekitar."
    ]
  },
  {
    level: "bantara",
    point_number: 21,
    category: "Fisik & Lingkungan",
    title: "Mengenal Organ Tubuh Manusia dan Fungsinya",
    description: "Dapat menyebutkan organ tubuh manusia beserta fungsi utamanya.",
    sub_points: [
      "Menjelaskan fungsi jantung, paru-paru, lambung, ginjal, hati, dan otak.",
      "Menjelaskan cara menjaga kesehatan sistem metabolisme dan peredaran darah."
    ]
  },
  {
    level: "bantara",
    point_number: 22,
    category: "Fisik & Lingkungan",
    title: "Bahaya Narkoba, HIV/AIDS, dan Pergaulan Bebas",
    description: "Memahami tentang bahaya narkoba, HIV/AIDS, dan pergaulan bebas bagi masa depan generasi muda.",
    sub_points: [
      "Menjelaskan jenis zat narkotika, psikotropika, dan bahaya ketergantungan fisik-mental.",
      "Menjelaskan cara penularan dan pencegahan HIV/AIDS serta menolak pergaulan bebas."
    ]
  },
  {
    level: "bantara",
    point_number: 23,
    category: "Fisik & Lingkungan",
    title: "Olahraga dan Senam Kebugaran Jasmani (SKJ)",
    description: "Menguasai minimal satu cabang olahraga dan dapat melakukan senam kesegaran jasmani (SKJ).",
    sub_points: [
      "Mempraktikkan teknik dasar salah satu cabang olahraga atletik atau permainan (lari, bulutangkis, futsal, renang, dll).",
      "Dapat melakukan gerakan SKJ secara runtut dan bugar."
    ]
  }
];

// FULL 22 BUTIR PENEGAK LAKSANA (SK KWARNAS 198/2011)
const laksanaItems: Omit<SkuItem, "id" | "created_at" | "updated_at">[] = [
  {
    level: "laksana",
    point_number: 1,
    category: "Spiritual/Agama",
    title: "Pendalaman Ajaran Agama di Muka Ambalan",
    description: "Dapat menjelaskan makna rukun iman dan rukun islam di muka ambalan (atau materi ajaran keagamaan Katolik/Kristen/Hindu/Buddha) dan memimpin doa.",
    sub_points: [
      "Menyampaikan tausiyah / renungan keagamaan singkat di hadapan peserta upacara atau latihan ambalan.",
      "Memimpin ibadah bersama sesuai tuntunan agama yang dianut."
    ]
  },
  {
    level: "laksana",
    point_number: 2,
    category: "Sosial & Emosional",
    title: "Menyampaikan Masukan Konstruktif untuk Gugusdepan",
    description: "Berani menyampaikan usulan, kritik, dan saran dengan sopan dan santun dalam musyawarah Ambalan atau Gugusdepan.",
    sub_points: [
      "Memberikan telaah kritis demi kemajuan organisasi gugusdepan.",
      "Menjaga adab bermusyawarah dan mengutamakan kepentingan bersama."
    ]
  },
  {
    level: "laksana",
    point_number: 3,
    category: "Sosial & Emosional",
    title: "Memimpin Jalannya Diskusi dengan Baik",
    description: "Dapat bertindak sebagai moderator atau memimpin jalannya diskusi ambalan dengan adil, tertib, dan menghasilkan keputusan bermutu.",
    sub_points: [
      "Mampu mengarahkan jalannya tukar pikiran agar tidak menyimpang dari agenda.",
      "Mampu menyimpulkan hasil musyawarah secara lugas."
    ]
  },
  {
    level: "laksana",
    point_number: 4,
    category: "Spiritual/Agama",
    title: "Pelopor Kerukunan dan Bakti Antarumat Beragama",
    description: "Dapat mengajak anggota ambalan untuk saling menghormati dan menunjukkan toleransi dalam bakti antarumat beragama.",
    sub_points: [
      "Menginisiasi kegiatan bakti kemanusiaan lintas agama.",
      "Menjadi teladan dalam memelihara kerukunan antarumat beragama di ambalan."
    ]
  },
  {
    level: "laksana",
    point_number: 5,
    category: "Sosial & Emosional",
    title: "Keaktifan Intensif Pertemuan Ambalan",
    description: "Mengikuti pertemuan Ambalan sekurang-kurangnya 3 kali setiap bulan dan aktif membina dinamika sangga.",
    sub_points: [
      "Menunjukkan absensi konsisten pada minimal 3 pertemuan rutin per bulan.",
      "Membantu dewan ambalan dalam menyiapkan materi latihan mingguan."
    ]
  },
  {
    level: "laksana",
    point_number: 6,
    category: "Sosial & Emosional",
    title: "Kemandirian Usaha dan Membantu Rekan",
    description: "Setia membayar iuran kepada ambalannya dengan uang yang seluruhnya diperoleh dari usaha sendiri serta dapat membantu teman merencanakan usaha mandiri.",
    sub_points: [
      "Memiliki sumber dana mandiri untuk kebutuhan kepramukaan tanpa membebani orang tua.",
      "Membantu rekan ambalan merancang ide bisnis / usaha kreatif sangga."
    ]
  },
  {
    level: "laksana",
    point_number: 7,
    category: "Sosial & Emosional",
    title: "Berbahasa Indonesia Baku dalam Forum Resmi",
    description: "Dapat berbahasa Indonesia dengan baik dan benar dalam pertemuan resmi ambalan dan forum formal.",
    sub_points: [
      "Mampu menyampaikan sambutan, laporan kegiatan, atau presentasi formal menggunakan bahasa baku.",
      "Menguasai tata bahasa dan etika protokoler kepramukaan."
    ]
  },
  {
    level: "laksana",
    point_number: 8,
    category: "Sosial & Emosional",
    title: "Pernah Memimpin Kegiatan di Ambalan/Gudep",
    description: "Pernah menjadi ketua sangga kerja atau koordinator utama dalam pelaksanaan kegiatan ambalan atau gugusdepan.",
    sub_points: [
      "Melampirkan surat keputusan / mandat sebagai pimpinan kegiatan ambalan.",
      "Menyusun laporan pertanggungjawaban (LPJ) pelaksanaan kegiatan."
    ]
  },
  {
    level: "laksana",
    point_number: 9,
    category: "Sosial & Emosional",
    title: "Memimpin Bakti Masyarakat Minimal 3 Kali",
    description: "Pernah memimpin bakti di masyarakat minimal 3 kali dan memberikan dampak positif nyata.",
    sub_points: [
      "Menginisiasi aksi sosial kemasyarakatan (donor darah, santunan, pembersihan sungai, dll).",
      "Mengoordinir regu kerja lapangan secara terstruktur."
    ]
  },
  {
    level: "laksana",
    point_number: 10,
    category: "Keterampilan/Intelektual",
    title: "Memimpin Pertunjukan Kesenian Tradisional",
    description: "Dapat memimpin dan menampilkan pertunjukan seni budaya daerah di depan umum.",
    sub_points: [
      "Mengatur tata artistik pentas seni budaya tradisional.",
      "Tampil memukau sebagai pemeran utama / dirigen / pemimpin pertunjukan kesenian."
    ]
  },
  {
    level: "laksana",
    point_number: 11,
    category: "Keterampilan/Intelektual",
    title: "Menjelaskan Isi AD & ART Gerakan Pramuka",
    description: "Dapat menjelaskan isi AD & ART Gerakan Pramuka kepada anggota ambalan dan adik penegak.",
    sub_points: [
      "Mampu memberikan materi sosialisasi AD & ART kepada calon penegak bantara.",
      "Memahami fungsi dewan kehormatan dan mekanisme musyawarah gugusdepan."
    ]
  },
  {
    level: "laksana",
    point_number: 12,
    category: "Keterampilan/Intelektual",
    title: "Menjelaskan Sejarah Kepramukaan Dunia dan Nasional",
    description: "Dapat menjelaskan sejarah perkembangan kepramukaan Indonesia dan dunia secara mendalam kepada ambalan.",
    sub_points: [
      "Memaparkan tonggak Jambore Dunia dan deklarasi kepanduan internasional.",
      "Menjelaskan peran tokoh-tokoh pandu nasional seperti Sri Sultan Hamengkubuwono IX."
    ]
  },
  {
    level: "laksana",
    point_number: 13,
    category: "Keterampilan/Intelektual",
    title: "Navigasi Darat Peta Topografi",
    description: "Dapat menggunakan navigasi darat (kompas bidik, peta topografi, teknik resection dan intersection) dalam pengembaraan.",
    sub_points: [
      "Mampu membaca garis kontur ketinggian, koordinat UTM/grid, dan skala peta.",
      "Mampu menentukan koordinat posisi sendiri dengan teknik resection di medan terbuka."
    ]
  },
  {
    level: "laksana",
    point_number: 14,
    category: "Sosial & Emosional",
    title: "Mengaplikasikan Nilai Pancasila di Ambalan",
    description: "Dapat menjelaskan dan mengaplikasikan butir-butir Pancasila kepada anggota ambalan dalam tindakan nyata.",
    sub_points: [
      "Menyusun program kerja sangga berlandaskan semangat kebhinekaan.",
      "Menyelesaikan dinamika sangga secara musyawarah mufakat."
    ]
  },
  {
    level: "laksana",
    point_number: 15,
    category: "Keterampilan/Intelektual",
    title: "Memaparkan Diplomasi Indonesia di ASEAN & PBB",
    description: "Dapat memaparkan hubungan Indonesia dalam organisasi internasional ASEAN dan PBB serta politik luar negeri bebas aktif.",
    sub_points: [
      "Menjelaskan kontribusi Pasukan Garuda Indonesia dalam misi penjaga perdamaian PBB.",
      "Menjelaskan peran strategis Indonesia sebagai salah satu pendiri ASEAN."
    ]
  },
  {
    level: "laksana",
    point_number: 16,
    category: "Keterampilan/Intelektual",
    title: "Rancang Bangun Pionering Lanjutan",
    description: "Dapat membuat rancangan dan memimpin pembuatan pionering jembatan, tiang bendera kaki tiga berputar, atau menara pandang.",
    sub_points: [
      "Menyusun sketsa kerja teknis pionering berskala.",
      "Memimpin perakitan konstruksi bambu/tongkat yang kokoh dan aman."
    ]
  },
  {
    level: "laksana",
    point_number: 17,
    category: "Fisik & Lingkungan",
    title: "Pelopor Sanitasi dan Kelestarian Alam",
    description: "Selalu membiasakan diri hidup bersih dan memimpin gerakan kebersihan lingkungan perkemahan dan masyarakat.",
    sub_points: [
      "Menerapkan sistem pengelolaan sampah terpadu (reduce, reuse, recycle) di perkemahan.",
      "Menjaga sumber air bersih perkemahan bebas dari kontaminasi kimia/limbah sabun."
    ]
  },
  {
    level: "laksana",
    point_number: 18,
    category: "Keterampilan/Intelektual",
    title: "Melatih Baris Berbaris (Instruktur PBB)",
    description: "Mampu melatih baris berbaris dan peraturan PBB kepada tingkatan di bawahnya (Penggalang atau Penegak Bantara).",
    sub_points: [
      "Menjadi instruktur latihan baris berbaris dan variasi formasi.",
      "Mampu mengoreksi gerakan anggota dengan metode instruksi yang efektif."
    ]
  },
  {
    level: "laksana",
    point_number: 19,
    category: "Fisik & Lingkungan",
    title: "Pertolongan Pertama dan Pencegahan Penyakit",
    description: "Mampu memberikan pertolongan pertama pada gawat darurat dan pencegahan terhadap penyakit menular serta degeneratif.",
    sub_points: [
      "Mampu melakukan pembidaian fraktur tulang, penanganan hipotermia, dan balut tekan perdarahan.",
      "Mampu menyosialisasikan pola hidup sehat kepada warga sekolah."
    ]
  },
  {
    level: "laksana",
    point_number: 20,
    category: "Fisik & Lingkungan",
    title: "Memimpin Ekspedisi Perkemahan 3 Hari",
    description: "Pernah merencanakan, membiayai, dan melaksanakan perkemahan selama 3 hari berturut-turut secara mandiri.",
    sub_points: [
      "Membuat estimasi anggaran biaya logistik perkemahan secara akurat.",
      "Memimpin operasi tapak kemah dari pendirian hingga pembongkaran tenda."
    ]
  },
  {
    level: "laksana",
    point_number: 21,
    category: "Fisik & Lingkungan",
    title: "Edukasi Kesehatan Reproduksi Remaja",
    description: "Dapat menjelaskan organ reproduksi manusia dan cara menjaga kesehatan reproduksi bagi remaja secara ilmiah dan santun.",
    sub_points: [
      "Menjelaskan proses perubahan pubertas dan fisiologi organ reproduksi.",
      "Menjelaskan pentingnya menjaga higienitas reproduksi dan pencegahan penyakit menular."
    ]
  },
  {
    level: "laksana",
    point_number: 22,
    category: "Fisik & Lingkungan",
    title: "Memimpin Olahraga dan Senam Jasmani",
    description: "Aktif melakukan satu cabang olahraga serta dapat memimpin senam kesegaran jasmani di depan khalayak ambalan.",
    sub_points: [
      "Menjadi instruktur pemanasan, senam inti, dan pendinginan.",
      "Menunjukkan kebugaran jasmani prima dan sportivitas tinggi."
    ]
  }
];

// 10 TKK WAJIB + 1 TKK KUNING (PENABUNG)
const skkData: Omit<SkkItem, "created_at" | "updated_at">[] = [
  {
    id: "berkemah",
    code: "TKK-KEMAH",
    name: "Berkemah",
    field: "Patriotisme & Seni Budaya",
    color: "Merah",
    color_code: "merah",
    icon_key: "berkemah",
    is_mandatory: true,
    description: "Kecakapan mendirikan tenda, mengelola tapak perkemahan, dan bertahan hidup di alam bebas dengan tertib dan berdisiplin.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Sedikitnya telah 3 kali mengikuti perkemahan sehari semalam (Persami).",
          "Dapat mendirikan tenda regu bersama teman-temannya dalam waktu maksimal 30 menit.",
          "Tahu cara merawat dan melipat tenda dengan benar dan rapi.",
          "Mengetahui syarat-syarat memilih lokasi perkemahan yang aman, dekat sumber air, dan higienis."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Berkemah Purwa.",
          "Tahu cara membuat tenda darurat (bivak) dari ponco atau dedaunan alam.",
          "Mampu membuat fasilitas perkemahan (rak piring, tempat jemuran, rak sepatu) dari tongkat/bambu.",
          "Pernah berkemah sekurang-kurangnya 3 hari berturut-turut di alam terbuka."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Berkemah Madya.",
          "Mampu memimpin dan mengorganisir sebuah perkemahan ambalan.",
          "Mampu menyusun anggaran, rencana konsumsi, dan sanitasi perkemahan berskala besar.",
          "Menguasai teknik bertahan hidup di alam (survival camp) selama minimal 2 hari."
        ]
      }
    }
  },
  {
    id: "juru-masak",
    code: "TKK-MASAK",
    name: "Juru Masak",
    field: "Keterampilan & Teknik Pembangunan",
    color: "Hijau",
    color_code: "hijau",
    icon_key: "juru-masak",
    is_mandatory: true,
    description: "Kecakapan meracik bahan, mengolah masakan bergizi, dan menjaga sanitasi konsumsi regu di alam terbuka.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Dapat membuat dan menyalakan api untuk memasak tanpa minyak tanah.",
          "Mampu menanak nasi untuk 4 orang dan memasak satu jenis sayur serta lauk sederhana.",
          "Tahu cara mencuci dan merawat peralatan dapur perkemahan agar tetap higienis."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Juru Masak Purwa.",
          "Mampu memasak hidangan bergizi seimbang (4 sehat 5 sempurna) untuk satu sangga penuh.",
          "Tahu cara menyimpan dan mengawetkan bahan makanan segar di alam terbuka.",
          "Mampu membuat satu jenis hidangan penutup atau kue tradisional nusantara."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Juru Masak Madya.",
          "Mampu merencanakan menu bergizi dan menghitung anggaran konsumsi untuk perkemahan 3 hari.",
          "Mampu memasak makanan darurat rimba menggunakan tumbuhan dan hewan liar yang aman dikonsumsi.",
          "Memahami standar kebersihan pangan (food safety) dapur umum berskala besar."
        ]
      }
    }
  },
  {
    id: "pengamat",
    code: "TKK-AMAT",
    name: "Pengamat / Penjelajah",
    field: "Keterampilan & Teknik Pembangunan",
    color: "Hijau",
    color_code: "hijau",
    icon_key: "pengamat",
    is_mandatory: true,
    description: "Kecakapan daya ingat, orientasi medan, ketajaman panca indera, dan navigasi pelacakan jejak di alam bebas.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Dapat mengingat 10 dari 15 macam benda yang dilihatnya selama 1 menit (Kim Penglihatan).",
          "Mampu mengenali dan menirukan minimal 3 jejak binatang atau tanda jejak buatan manusia.",
          "Mampu mengenali arah mata angin tanpa menggunakan kompas di siang dan malam hari."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Pengamat Purwa.",
          "Mampu mengingat 15 dari 20 benda dalam permainan Kim Penglihatan dan Kim Pendengaran.",
          "Mampu mengikuti rute pengembaraan sejauh minimal 3 km dengan panduan tanda-tanda alam.",
          "Mampu membuat peta pita dari perjalanan penjelajahan yang dilalui."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Pengamat Madya.",
          "Mampu membuat peta panorama dan peta topografi sederhana dari suatu wilayah penjelajahan.",
          "Mampu melacak jejak samar dan membaca situasi medan pengembaraan dalam kondisi cuaca buruk.",
          "Memimpin ekspedisi penjelajahan rintisan sejauh minimal 10 km."
        ]
      }
    }
  },
  {
    id: "p3k",
    code: "TKK-P3K",
    name: "Pertolongan Pertama Pada Kecelakaan (P3K)",
    field: "Sosial, Ketertiban & Lingkungan Hidup",
    color: "Biru",
    color_code: "biru",
    icon_key: "p3k",
    is_mandatory: true,
    description: "Kecakapan memberikan pertolongan medis pertama, pembalutan, pembidaian, dan evakuasi korban kecelakaan darurat.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Mengetahui isi kotak P3K standar dan kegunaan masing-masing obat/peralatan medis.",
          "Mampu membalut luka gores, luka lecet, dan membalut pergelangan kaki terkilir dengan kain mitela.",
          "Tahu cara menolong korban yang pingsan, syok, atau tersedak benda asing."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK P3K Purwa.",
          "Mampu melakukan pembidaian fraktur patah tulang pada lengan dan tungkai kaki.",
          "Mampu menghentikan pendarahan luar pada pembuluh darah nadi (arteri) dengan teknik tekan langsung.",
          "Mampu membuat tandu darurat dan mempraktikkan cara mengevakuasi korban dengan aman."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK P3K Madya.",
          "Menguasai teknik Resusitasi Jantung Paru (RJP / CPR) pada korban henti napas.",
          "Mampu memberikan pertolongan pertama pada korban tenggelam, keracunan, gigitan ular berbisa, dan luka bakar derajat dua.",
          "Mampu bertindak sebagai komandan pos medis lapangan saat kegiatan perkemahan akbar."
        ]
      }
    }
  },
  {
    id: "pengatur-ruangan",
    code: "TKK-RUANG",
    name: "Pengatur Ruangan",
    field: "Patriotisme & Seni Budaya",
    color: "Merah",
    color_code: "merah",
    icon_key: "pengatur-ruangan",
    is_mandatory: true,
    description: "Kecakapan merancang tata letak perabot, estetika, sirkulasi udara, dan kerapian ruangan serbaguna ambalan.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Dapat mengatur dan menata meja, kursi, dan perlengkapan di ruang kelas atau sanggar.",
          "Mampu memasang dan merapikan tirai jendela, taplak meja, serta memajang hiasan dinding secara harmonis.",
          "Menjaga sirkulasi udara dan pencahayaan ruangan tetap sehat dan terang."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Pengatur Ruangan Purwa.",
          "Mampu merangkai bunga segar atau dekorasi alami untuk meja tamu dan podium.",
          "Mampu merancang denah tata letak (layout) ruang pertemuan untuk kapasitas minimal 30 orang.",
          "Mengetahui cara memelihara kebersihan karpet, lantai, dan dinding ruangan."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Pengatur Ruangan Madya.",
          "Mampu merancang tata panggung dan dekorasi aula untuk kegiatan pelantikan atau upacara Hari Pramuka.",
          "Mengetahui prinsip dasar ergonomi interior, pencahayaan panggung, dan akustik ruangan."
        ]
      }
    }
  },
  {
    id: "menjahit",
    code: "TKK-JAHIT",
    name: "Menjahit",
    field: "Keterampilan & Teknik Pembangunan",
    color: "Hijau",
    color_code: "hijau",
    icon_key: "menjahit",
    is_mandatory: true,
    description: "Kecakapan tusuk jahit tangan, penggunaan mesin jahit, pasang kancing, ritsleting, dan reparasi pakaian lapangan.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Dapat memasang kancing baju (berlubang dua dan empat) dengan jahitan kuat dan rapi.",
          "Dapat menjahit keliman tepi kain dengan tusuk jelujur dan tusuk flanel.",
          "Mampu menambal kain sobek sederhana menggunakan jarum tangan."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Menjahit Purwa.",
          "Dapat mengoperasikan mesin jahit mekanik atau listrik dengan lancar.",
          "Mampu menjahit dan memasang ritsleting pada celana atau rok seragam Pramuka.",
          "Mampu memotong bahan dan membuat sarung bantal atau tas kain (totebag) sendiri."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Menjahit Madya.",
          "Mampu mengukur badan, membuat pola pakaian, dan menjahit kemeja seragam Pramuka secara lengkap.",
          "Mampu memodifikasi atau memperbaiki perlengkapan dinas lapangan (PDL) dan tenda yang sobek."
        ]
      }
    }
  },
  {
    id: "juru-kebun",
    code: "TKK-KEBUN",
    name: "Juru Kebun",
    field: "Keterampilan & Teknik Pembangunan",
    color: "Hijau",
    color_code: "hijau",
    icon_key: "juru-kebun",
    is_mandatory: true,
    description: "Kecakapan bercocok tanam, perbanyakan bibit tanaman, pemupukan organik, dan pemeliharaan apotek hidup.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Mengenal minimal 5 jenis tanaman hias, 5 jenis sayuran, dan 3 jenis pohon pelindung.",
          "Dapat mencangkul, menggemburkan tanah, dan membuat bedengan kecil.",
          "Mampu merawat satu petak tanaman kebun atau pot bunga selama sedikitnya 1 bulan hingga tumbuh subur."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Juru Kebun Purwa.",
          "Mampu mempraktikkan teknik perbanyakan tanaman secara vegetatif (mencangkok, setek batang, atau okulasi).",
          "Mampu membuat pupuk kompos organik dari sampah dedaunan atau limbah dapur.",
          "Mengetahui cara memberantas hama tanaman secara alami tanpa pestisida kimia berbahaya."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Juru Kebun Madya.",
          "Mampu mengelola apotek hidup (tanaman obat keluarga / TOGA) dan instalasi hidroponik sekolah.",
          "Mampu menyusun jadwal tanam dan panen sayuran untuk mendukung ketahanan pangan sangga."
        ]
      }
    }
  },
  {
    id: "pengatur-lalu-lintas",
    code: "TKK-LANTAS",
    name: "Pengatur Lalu Lintas",
    field: "Sosial, Ketertiban & Lingkungan Hidup",
    color: "Biru",
    color_code: "biru",
    icon_key: "pengatur-lalu-lintas",
    is_mandatory: true,
    description: "Kecakapan 12 gerakan pengaturan lalu lintas, pemahaman rambu jalan, dan ketertiban transportasi darat.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Mengetahui dan mempraktikkan 12 gerakan dasar pengaturan lalu lintas tangan dan tiupan peluit.",
          "Mengetahui arti rambu-rambu lalu lintas peringatan, larangan, perintah, dan petunjuk jalan.",
          "Mampu membantu menyeberangkan anak sekolah atau pejalan kaki dengan aman di zebra cross."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Pengatur Lalu Lintas Purwa.",
          "Memahami aturan tertib berkendara sesuai UU Lalu Lintas dan Angkutan Jalan.",
          "Mampu bertugas mengatur arus lalu lintas di gerbang sekolah atau perempatan saat kegiatan massal.",
          "Tahu tindakan pertolongan pertama dan pengamanan TKP jika terjadi kecelakaan lalu lintas ringan."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Pengatur Lalu Lintas Madya.",
          "Berpartisipasi aktif dalam kegiatan Karya Bakti Lebaran atau pengamanan arus mudik bersama Saka Bhayangkara / Kepolisian.",
          "Mampu membuat skema rekayasa jalur arus kendaraan dan kantong parkir untuk perkemahan akbar."
        ]
      }
    }
  },
  {
    id: "pengaman-kampung",
    code: "TKK-AMAN",
    name: "Pengaman Kampung / Lingkungan",
    field: "Sosial, Ketertiban & Lingkungan Hidup",
    color: "Biru",
    color_code: "biru",
    icon_key: "pengaman-kampung",
    is_mandatory: true,
    description: "Kecakapan sistem keamanan lingkungan (Siskamling), kode kentongan, pemadaman api, dan penanganan ketertiban.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Mengenal peta lingkungan pemukiman RT/RW, letak pos ronda, hidran pemadam, dan kantor RT/RW.",
          "Mengetahui isyarat bunyi kentongan pos ronda (kebakaran, pencurian, bencana banjir, dan situasi aman).",
          "Pernah ikut serta dalam kegiatan siskamling / ronda malam sedikitnya 2 kali."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Pengaman Kampung Purwa.",
          "Tahu cara memadamkan api kebakaran awal menggunakan karung basah atau APAR sederhana.",
          "Mampu membuat jadwal giliran ronda dan mencatat buku mutasi pos kamling.",
          "Mampu menangani orang mencurigakan dengan tenang tanpa melakukan tindakan main hakim sendiri."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Pengaman Kampung Madya.",
          "Mampu menyusun rencana mitigasi bencana dan denah jalur evakuasi warga saat kebakaran atau banjir.",
          "Mampu mengoordinir pemuda setempat dalam posko siaga bencana dan satgas keamanan swakarsa."
        ]
      }
    }
  },
  {
    id: "gerak-jalan",
    code: "TKK-JALAN",
    name: "Gerak Jalan",
    field: "Ketangkasan & Kesehatan",
    color: "Putih",
    color_code: "putih",
    icon_key: "gerak-jalan",
    is_mandatory: true,
    description: "Kecakapan ketahanan fisik berjalan kaki jarak jauh, postur pernapasan, dan kedisiplinan barisan pengembaraan.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Mengetahui postur jalan kaki yang benar dan teknik pernapasan irama saat gerak jalan.",
          "Pernah mengikuti gerak jalan santai menempuh jarak sedikitnya 8 km untuk putra atau 6 km untuk putri tanpa kepayahan berlebih.",
          "Tahu jenis alas kaki yang cocok dan cara merawat kaki agar tidak lecet saat menempuh rute jalan kaki."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Gerak Jalan Purwa.",
          "Mampu memimpin satu regu dalam perlombaan gerak jalan sejauh 15 km dengan menjaga barisan tetap rapi.",
          "Mengerti tanda-tanda dehidrasi, heat stroke, dan kram otot serta cara penanganan pertamanya di jalan raya."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Gerak Jalan Madya.",
          "Pernah menempuh rute long march pengembaraan sejauh minimal 25 km dengan memanggul ransel beban minimal 5 kg.",
          "Mampu merancang rute penjelajahan jalan kaki yang aman dari bahaya tanah longsor dan kepadatan kendaraan bermotor."
        ]
      }
    }
  },
  {
    id: "penabung",
    code: "TKK-NABUNG",
    name: "Penabung",
    field: "Agama, Mental & Moral",
    color: "Kuning",
    color_code: "kuning",
    icon_key: "penabung",
    is_mandatory: false,
    description: "Kecakapan berhemat, pembukuan kas pribadi, dan kedisiplinan menabung uang secara mandiri dan berkala.",
    levels: {
      purwa: {
        shape: "lingkaran",
        requirements: [
          "Memiliki buku tabungan di bank atau koperasi dan menabung teratur sekurang-kurangnya 3 bulan berturut-turut.",
          "Membayar uang tabungan dari hasil jerih payah atau penyisihan uang saku sendiri.",
          "Dapat menjelaskan manfaat hidup hemat dan bahaya perilaku konsumtif bagi generasi muda."
        ]
      },
      madya: {
        shape: "persegi",
        requirements: [
          "Telah memenuhi SKK Penabung Purwa.",
          "Menabung secara teratur selama sedikitnya 6 bulan berturut-turut.",
          "Mampu membuat catatan pembukuan pemasukan dan pengeluaran keuangan pribadi sehari-hari secara tertib."
        ]
      },
      utama: {
        shape: "segilima",
        requirements: [
          "Telah memenuhi SKK Penabung Madya.",
          "Menabung secara konsisten sekurang-kurangnya selama 1 tahun penuh.",
          "Dapat mengelola pembukuan kas Sangga / Ambalan atau merencanakan investasi tabungan usaha produktif sangga."
        ]
      }
    }
  }
];

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
  console.log(`Berhasil upsert ${allSkk.length} SKK items (termasuk 10 TKK Wajib dan 5 Bidang Warna).`);

  // Create indexes for fast lookup
  await skuCollection.createIndex({ level: 1, point_number: 1 }, { unique: true });
  await skuCollection.createIndex({ category: 1 });
  await skkCollection.createIndex({ id: 1 }, { unique: true });
  await skkCollection.createIndex({ color_code: 1 });

  // User progress collection indexes
  await db.collection("sku_progress").createIndex({ user_id: 1, sku_item_id: 1 }, { unique: true });
  await db.collection("sku_progress").createIndex({ status: 1 });
  await db.collection("skk_progress").createIndex({ user_id: 1, skk_item_id: 1, level_name: 1 }, { unique: true });
  await db.collection("skk_progress").createIndex({ status: 1 });

  console.log("Semua indeks database SKU & SKK berhasil dipersiapkan.");
  console.log("Seeding selesai dengan sukses!");

  await client.close();
}

seed().catch((err) => {
  console.error("Gagal melakukan seed SKU & SKK:", err);
  process.exit(1);
});
