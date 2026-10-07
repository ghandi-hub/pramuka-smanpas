export type SkuLevel = "bantara" | "laksana";

export type SkuCategory =
  | "Spiritual/Agama"
  | "Sosial & Emosional"
  | "Keterampilan/Intelektual"
  | "Fisik & Lingkungan";

export type ProgressStatus = "pending" | "verified" | "rejected";

export interface SkuItem {
  id: string;
  level: SkuLevel;
  point_number: number;
  category: SkuCategory;
  title: string;
  description: string;
  sub_points?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SkuProgress {
  id: string;
  user_id: string;
  point_id: string;
  status: ProgressStatus;
  notes?: string | null;
  evidence_url?: string | null;
  evidence_photos?: string[] | null;
  admin_notes?: string | null;
  submitted_at?: string | null;
  verified_at?: string | null;
  updated_at?: string | null;
}

export function useSkuService() {
  const { token } = useAdminAuth();

  const authHeaders = (): Record<string, string> =>
    token.value ? { Authorization: `Bearer ${token.value}` } : {};

  const fetchItems = async (level: SkuLevel): Promise<SkuItem[]> => {
    return await $fetch<SkuItem[]>("/api/sku/items", {
      query: { level },
    });
  };

  const fetchProgress = async (): Promise<SkuProgress[]> => {
    try {
      return await $fetch<SkuProgress[]>("/api/sku/progress", {
        headers: authHeaders(),
      });
    } catch {
      return [];
    }
  };

  const submitExam = async (payload: {
    point_id: string;
    notes?: string;
    evidence_url?: string;
    evidence_photos?: string[];
  }): Promise<SkuProgress> => {
    return await $fetch<SkuProgress>("/api/sku/progress", {
      method: "POST",
      headers: authHeaders(),
      body: payload,
    });
  };

  return { fetchItems, fetchProgress, submitExam };
}