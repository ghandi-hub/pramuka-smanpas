// Data & helper sub-butir Poin 1 (Agama/Spiritual) SKU Penegak.
// Dipakai bersama oleh frontend (app) dan backend (server) via alias #shared.

export type SkuLevelKey = "bantara" | "laksana";

export type ReligionKey = "islam" | "katolik" | "kristen" | "hindu" | "buddha";

export interface SkuSubPoint {
  title: string;
  description: string;
}

export const SKU_RELIGIONS: { key: ReligionKey; label: string }[] = [
  { key: "islam", label: "Islam" },
  { key: "katolik", label: "Katolik" },
  { key: "kristen", label: "Kristen Protestan" },
  { key: "hindu", label: "Hindu" },
  { key: "buddha", label: "Buddha" },
];

export const POINT1_SUBPOINTS: Record<
  SkuLevelKey,
  Record<ReligionKey, SkuSubPoint[]>
> = {
  bantara: {
    islam: [
      {
        title: "Menjelaskan Makna Rukun Iman dan Rukun Islam",
        description:
          "Dapat menjelaskan makna Rukun Iman dan Rukun Islam di muka Ambalan Penegak.",
      },
      {
        title: "Keutamaan dan Mendirikan Shalat Berjamaah",
        description:
          "Mampu menjelaskan keutamaan shalat berjamaah dan mendirikan shalat berjamaah.",
      },
      {
        title: "Makna dan Macam-Macam Puasa",
        description:
          "Mampu menjelaskan makna puasa serta macam-macam puasa.",
      },
      {
        title: "Zakat Fitrah dan Zakat Mal",
        description:
          "Mengetahui waktu dan tata cara membayar zakat fitrah dan zakat mal.",
      },
      {
        title: "Tata Cara Merawat Jenazah",
        description:
          "Mampu menjelaskan tata cara merawat jenazah (memandikan, mengafani, menyalatkan, menguburkan).",
      },
      {
        title: "Hafalan Doa Harian dan Surat Pendek Juz 'Amma",
        description: "Hafal minimal doa harian dan surat-surat pendek Juz 'Amma.",
      },
    ],
    katolik: [
      {
        title: "Makna Sakramen Baptis dan Ekaristi",
        description:
          "Dapat menjelaskan makna Sakramen Baptis dan Ekaristi dalam iman Katolik.",
      },
      {
        title: "Mengikuti Misa Mingguan",
        description: "Rajin mengikuti misa mingguan di gereja.",
      },
      {
        title: "Doa Dasar Katolik",
        description:
          "Mampu berdoa Bapa Kami, Salam Maria, dan Kemuliaan.",
      },
      {
        title: "Sepuluh Perintah Allah dan Hukum Kasih",
        description:
          "Memahami Sepuluh Perintah Allah dan Hukum Kasih dalam kehidupan sehari-hari.",
      },
      {
        title: "Sakramen Tobat dan Komuni",
        description:
          "Mengenal Sakramen Tobat dan penerimaan Komuni Kudus.",
      },
      {
        title: "Hafalan Doa Harian dan Mazmur Pendek",
        description: "Hafal doa-doa harian dan mazmur pendek.",
      },
    ],
    kristen: [
      {
        title: "Makna Iman kepada Tuhan Yesus Kristus",
        description:
          "Dapat menjelaskan makna iman kepada Tuhan Yesus Kristus sebagai Juruselamat.",
      },
      {
        title: "Rajin Beribadah di Gereja",
        description: "Rajin beribadah di gereja secara teratur.",
      },
      {
        title: "Hukum Kasih dan Sepuluh Hukum Taurat",
        description:
          "Memahami Hukum Kasih dan Sepuluh Hukum Taurat.",
      },
      {
        title: "Doa Harian dan Mazmur",
        description: "Berdoa secara teratur serta menghafal mazmur pilihan.",
      },
      {
        title: "Sakramen Baptis dan Perjamuan Kudus",
        description:
          "Mengenal makna Sakramen Baptis dan Perjamuan Kudus.",
      },
      {
        title: "Membaca Alkitab secara Teratur",
        description: "Membiasakan membaca Alkitab secara teratur.",
      },
    ],
    hindu: [
      {
        title: "Memahami Panca Sradha",
        description: "Dapat menjelaskan Panca Sradha sebagai dasar keimanan Hindu.",
      },
      {
        title: "Melaksanakan Tri Sandhya",
        description: "Rutin melaksanakan Tri Sandhya setiap hari.",
      },
      {
        title: "Memahami Tri Hita Karana",
        description:
          "Memahami Tri Hita Karana dan penerapannya dalam kehidupan.",
      },
      {
        title: "Mengenal Kitab Weda dan Bhagavad Gita",
        description: "Mengenal kitab suci Weda dan Bhagavad Gita.",
      },
      {
        title: "Hari Raya Nyepi dan Galungan",
        description: "Mengenal makna Hari Raya Nyepi dan Galungan.",
      },
      {
        title: "Hafalan Doa dan Sloka Harian",
        description: "Hafal doa dan sloka harian.",
      },
    ],
    buddha: [
      {
        title: "Memahami Triratna",
        description: "Dapat menjelaskan Triratna sebagai pelindung umat Buddha.",
      },
      {
        title: "Memahami Empat Kesunyataan Mulia",
        description: "Memahami Empat Kesunyataan Mulia.",
      },
      {
        title: "Memahami Delapan Jalan Utama",
        description: "Memahami Delapan Jalan Utama sebagai jalan pembebasan.",
      },
      {
        title: "Melaksanakan Puja Bakti",
        description: "Melaksanakan puja bakti secara teratur.",
      },
      {
        title: "Mengenal Pancasila Buddhis",
        description: "Mengenal dan menerapkan Pancasila Buddhis.",
      },
      {
        title: "Hafalan Paritta dan Gatha Harian",
        description: "Hafal paritta dan gatha harian.",
      },
    ],
  },
  laksana: {
    islam: [
      {
        title: "Memimpin Shalat Berjamaah",
        description: "Mampu memimpin shalat berjamaah.",
      },
      {
        title: "Menjadi Muadzin atau Iqamah",
        description: "Mampu menjadi muadzin atau mengumandangkan iqamah.",
      },
      {
        title: "Kultum Singkat di Ambalan",
        description: "Memberikan kultum singkat di ambalan.",
      },
      {
        title: "Pendalaman Materi Keagamaan",
        description: "Melakukan pendalaman materi keagamaan.",
      },
    ],
    katolik: [
      {
        title: "Memimpin Doa Rosario atau Renungan",
        description: "Mampu memimpin doa rosario atau renungan bersama.",
      },
      {
        title: "Menjadi Lektor atau Pemazmur",
        description: "Mampu bertugas sebagai lektor atau pemazmur dalam liturgi.",
      },
      {
        title: "Renungan Singkat di Ambalan",
        description: "Memberikan renungan singkat di ambalan.",
      },
      {
        title: "Pendalaman Materi Keagamaan",
        description:
          "Pendalaman materi keagamaan (Sakramen dan Ajaran Sosial Gereja).",
      },
    ],
    kristen: [
      {
        title: "Memimpin Doa atau Ibadah Kelompok",
        description: "Mampu memimpin doa atau ibadah kelompok.",
      },
      {
        title: "Pelayan Liturgi",
        description:
          "Mampu menjadi pelayan liturgi (pembaca Alkitab atau pemusik).",
      },
      {
        title: "Renungan Singkat di Ambalan",
        description: "Memberikan renungan singkat di ambalan.",
      },
      {
        title: "Pendalaman Materi Keagamaan",
        description: "Pendalaman materi keagamaan (katekisasi).",
      },
    ],
    hindu: [
      {
        title: "Memimpin Doa Bersama (Tri Sandhya)",
        description: "Mampu memimpin doa bersama Tri Sandhya.",
      },
      {
        title: "Pemangku Upacara atau Pembaca Sloka",
        description:
          "Mampu menjadi pemangku upacara sederhana atau pembaca sloka.",
      },
      {
        title: "Dharmawacana Singkat di Ambalan",
        description: "Memberikan dharmawacana singkat di ambalan.",
      },
      {
        title: "Pendalaman Ajaran Agama Hindu",
        description: "Melakukan pendalaman ajaran agama Hindu.",
      },
    ],
    buddha: [
      {
        title: "Memimpin Puja Bakti Bersama",
        description: "Mampu memimpin puja bakti bersama.",
      },
      {
        title: "Pembaca Paritta atau Gatha",
        description: "Mampu menjadi pembaca paritta atau gatha.",
      },
      {
        title: "Ceramah Dhamma Singkat di Ambalan",
        description: "Memberikan ceramah Dhamma singkat di ambalan.",
      },
      {
        title: "Pendalaman Ajaran Buddha",
        description: "Melakukan pendalaman ajaran Buddha.",
      },
    ],
  },
};

export function normalizeSkuLevel(value: unknown): SkuLevelKey | null {
  const str = String(value ?? "").toLowerCase();
  return str === "bantara" || str === "laksana" ? str : null;
}

export function normalizeReligion(value: unknown): ReligionKey | null {
  const str = String(value ?? "").toLowerCase();
  return (SKU_RELIGIONS.find((r) => r.key === str)?.key as ReligionKey) ?? null;
}

export function getPoint1SubPoints(
  level: SkuLevelKey,
  religion: ReligionKey,
): SkuSubPoint[] {
  return POINT1_SUBPOINTS[level][religion] ?? [];
}

export function getSubPointOffset(
  level: SkuLevelKey,
  religion: ReligionKey,
): number {
  let offset = 0;
  for (const r of SKU_RELIGIONS) {
    if (r.key === religion) break;
    offset += POINT1_SUBPOINTS[level][r.key].length;
  }
  return offset;
}

// ID progress sub-butir: `[item_id]_sub_[subIndex]`.
// subIndex bersifat global lintas agama agar tidak bertabrakan.
// Islam berada di urutan pertama sehingga menghasilkan `bantara-1_sub_0`, dst.
export function getPoint1SubPointIds(
  level: SkuLevelKey,
  religion: ReligionKey,
): string[] {
  const offset = getSubPointOffset(level, religion);
  return POINT1_SUBPOINTS[level][religion].map(
    (_sub, index) => `${level}-1_sub_${offset + index}`,
  );
}

export function getPoint1SubPointId(
  level: SkuLevelKey,
  religion: ReligionKey,
  localIndex: number,
): string {
  return `${level}-1_sub_${getSubPointOffset(level, religion) + localIndex}`;
}

export interface ParsedSubPointId {
  baseId: string;
  subIndex: number;
}

export function parseSkuSubPointId(pointId: unknown): ParsedSubPointId | null {
  const match = /^(.+)_sub_(\d+)$/.exec(String(pointId ?? ""));
  if (!match) return null;
  return { baseId: match[1], subIndex: Number(match[2]) };
}

export interface ResolvedSubPoint extends SkuSubPoint {
  religion: ReligionKey;
  localIndex: number;
  label: string;
}

export function resolvePoint1SubPoint(
  level: SkuLevelKey,
  subIndex: number,
): ResolvedSubPoint | null {
  let offset = 0;
  for (const r of SKU_RELIGIONS) {
    const subs = POINT1_SUBPOINTS[level][r.key];
    if (subIndex < offset + subs.length) {
      const localIndex = subIndex - offset;
      const sub = subs[localIndex];
      return {
        religion: r.key,
        localIndex,
        label: `1.${localIndex + 1}`,
        title: sub.title,
        description: sub.description,
      };
    }
    offset += subs.length;
  }
  return null;
}