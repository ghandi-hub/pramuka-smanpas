// Data & helper sub-butir Poin 1 (Agama/Spiritual) SKU Penegak.
// Dipakai bersama oleh frontend (app) dan backend (server).

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
        title: "Makna Rukun Iman dan Rukun Islam",
        description: "Dapat menjelaskan makna Rukun Iman dan Rukun Islam.",
      },
      {
        title: "Makna Sholat Berjamaah & Sholat Sunah",
        description:
          "Mampu menjelaskan makna Sholat berjamaah dan dapat mendirikan Sholat sunah secara individu.",
      },
      {
        title: "Makna dan Macam-macam Puasa",
        description: "Mampu menjelaskan makna berpuasa serta macam-macam Puasa.",
      },
      {
        title: "Tata Cara Mengurus Jenazah (Tajhizul Jenazah)",
        description:
          "Tahu tata cara merawat atau mengurus jenazah (Tajhizul Jenazah).",
      },
      {
        title: "Doa Ijab Qobul Zakat",
        description: "Dapat membaca doa Ijab Qobul Zakat.",
      },
      {
        title: "Hafalan dan Penjelasan Hadist Pilihan",
        description:
          "Dapat menghafal minimal sebuah hadist dan menjelaskan hadist tersebut.",
      },
    ],
    katolik: [
      {
        title: "Makna dan Arti Gereja Katolik",
        description: "Tahu dan paham makna dan arti Gereja Katolik.",
      },
      {
        title: "Memimpin Doa & Gerakan Cinta Kasih Keberagaman",
        description:
          "Dapat memimpin doa dan membangun serta membuat gerakan cinta kasih pada keberagaman agama di luar Gereja Katolik.",
      },
    ],
    kristen: [
      {
        title: "Pendalaman dan Pengamalan Hukum Kasih",
        description:
          "Mendalami Hukum Kasih dan mengamalkannya dalam kehidupan sehari-hari.",
      },
    ],
    hindu: [
      {
        title: "Sejarah Perkembangan Agama Hindu di Indonesia",
        description:
          "Dapat menjelaskan sejarah perkembangan agama Hindu di Indonesia.",
      },
      {
        title: "Makna & Hakikat Persembahyangan",
        description:
          "Dapat menjelaskan makna dan hakikat dari tujuan melaksanakan persembahyangan sehari-hari dan hari besar keagamaan Hindu.",
      },
      {
        title: "Maksud dan Tujuan Kelahiran Manusia",
        description:
          "Dapat menjelaskan maksud dan tujuan kelahiran menjadi manusia menurut agama Hindu.",
      },
      {
        title: "Makna & Hakikat Ajaran Tri Hita Karana",
        description:
          "Dapat menjelaskan makna dan hakekat ajaran Tri Hita Karana dengan pelestarian alam lingkungan.",
      },
      {
        title: "Gerakan Asanas dari Hatta Yoga",
        description:
          "Dapat mempraktikkan bentuk gerakan Asanas dari Hatta Yoga.",
      },
      {
        title: "Melafalkan dan Mengkidungkan Dharma Gita",
        description:
          "Dapat melafalkan dan mengkidungkan salah satu bentuk Dharma Gita.",
      },
      {
        title: "Struktur, Fungsi, dan Sejarah Pura Sad Kahyangan",
        description:
          "Dapat mendeskripsikan struktur, fungsi dan sejarah pura dalam cakupan Sad Kahyangan.",
      },
    ],
    buddha: [
      {
        title: "Saddha - Buddha Dharma Sebagai Agama",
        description:
          "Saddha - Mengungkapkan Buddha Dharma sebagai salah satu agama.",
      },
      {
        title: "Dasar-dasar Keyakinan & Pengembangannya",
        description:
          "Merumuskan dasar-dasar keyakinan dan cara mengembangkannya.",
      },
      {
        title: "Sejarah Buddha Gotama",
        description: "Menjelaskan sejarah Buddha Gotama.",
      },
      {
        title: "Tiratana Sebagai Pelindung",
        description: "Menjelaskan Tiratana sebagai pelindung.",
      },
      {
        title: "Sejarah Penulisan Kitab Suci Tripitaka",
        description:
          "Menjelaskan kisah-kisah sejarah penulisan kitab suci tripitaka.",
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
        title: "Pembaca Sloka atau Pemimpin Upacara",
        description: "Mampu membaca sloka atau memimpin persembahyangan.",
      },
      {
        title: "Dharma Wacana Singkat di Ambalan",
        description: "Memberikan dharma wacana singkat di ambalan.",
      },
      {
        title: "Pendalaman Materi Keagamaan",
        description: "Pendalaman materi ajaran Hindu.",
      },
    ],
    buddha: [
      {
        title: "Memimpin Puja Bakti",
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

export function normalizeReligion(value: unknown): ReligionKey {
  const str = String(value ?? "").toLowerCase().trim();
  const found = SKU_RELIGIONS.find((r) => r.key === str);
  return found ? found.key : "islam";
}

export function getPoint1SubPoints(
  level: SkuLevelKey,
  religion: ReligionKey,
): SkuSubPoint[] {
  return POINT1_SUBPOINTS[level]?.[religion] ?? [];
}

// ID progress sub-butir: `[level]-1_[religion]_[localIndex]`
export function getPoint1SubPointId(
  level: SkuLevelKey,
  religion: ReligionKey,
  localIndex: number,
): string {
  return `${level}-1_${religion}_${localIndex}`;
}

export function getPoint1SubPointIds(
  level: SkuLevelKey,
  religion: ReligionKey,
): string[] {
  const list = POINT1_SUBPOINTS[level]?.[religion] ?? [];
  return list.map((_, idx) => `${level}-1_${religion}_${idx}`);
}

export interface ParsedSubPointId {
  baseId: string;
  level: SkuLevelKey;
  religion: ReligionKey;
  localIndex: number;
}

export function parseSkuSubPointId(pointId: unknown): ParsedSubPointId | null {
  const str = String(pointId ?? "").trim();
  // Format baru: bantara-1_islam_0
  const matchNamed = /^(bantara|laksana)-1_(islam|katolik|kristen|hindu|buddha)_(\d+)$/.exec(str);
  if (matchNamed && matchNamed[1] && matchNamed[2] && matchNamed[3] !== undefined) {
    return {
      baseId: `${matchNamed[1]}-1`,
      level: matchNamed[1] as SkuLevelKey,
      religion: matchNamed[2] as ReligionKey,
      localIndex: Number(matchNamed[3]),
    };
  }

  // Format lama legacy: bantara-1_sub_0
  const matchOld = /^(bantara|laksana)-1_sub_(\d+)$/.exec(str);
  if (matchOld && matchOld[1] && matchOld[2] !== undefined) {
    const lvl = matchOld[1] as SkuLevelKey;
    const oldIdx = Number(matchOld[2]);
    return {
      baseId: `${lvl}-1`,
      level: lvl,
      religion: "islam",
      localIndex: oldIdx,
    };
  }

  return null;
}

export interface ResolvedSubPoint extends SkuSubPoint {
  religion: ReligionKey;
  localIndex: number;
  label: string;
}

export function resolvePoint1SubPoint(
  level: SkuLevelKey,
  religion: ReligionKey,
  localIndex: number,
): ResolvedSubPoint | null {
  const subs = POINT1_SUBPOINTS[level]?.[religion];
  if (!subs || !subs[localIndex]) return null;
  const sub = subs[localIndex];
  return {
    religion,
    localIndex,
    label: `1.${localIndex + 1}`,
    title: sub.title,
    description: sub.description,
  };
}
