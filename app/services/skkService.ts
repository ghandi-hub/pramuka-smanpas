export type SkkColorCode = "kuning" | "merah" | "putih" | "hijau" | "biru";

export type SkkLevel = "purwa" | "madya" | "utama";

export type ProgressStatus = "pending" | "verified" | "rejected";

export interface SkkLevelDetail {
  shape: string;
  requirements: string[];
}

export interface SkkItem {
  id: string;
  code: string;
  name: string;
  field: string;
  color: string;
  color_code: SkkColorCode;
  icon_key: string;
  badge_icon?: string | null;
  is_mandatory: boolean;
  is_wajib?: boolean;
  order_number?: number;
  description: string;
  levels: Record<SkkLevel, SkkLevelDetail>;
  created_at?: string;
  updated_at?: string;
}

export interface SkkProgress {
  id: string;
  user_id: string;
  skk_id: string;
  level: SkkLevel;
  status: ProgressStatus;
  notes?: string | null;
  evidence_url?: string | null;
  evidence_photos?: string[] | null;
  admin_notes?: string | null;
  submitted_at?: string | null;
  verified_at?: string | null;
  updated_at?: string | null;
}

export function useSkkService() {
  const { token } = useAdminAuth();

  const authHeaders = (): Record<string, string> =>
    token.value ? { Authorization: `Bearer ${token.value}` } : {};

  const fetchItems = async (field?: SkkColorCode | "all"): Promise<SkkItem[]> => {
    try {
      const query: Record<string, string> = {};
      if (field && field !== "all") query.field = field;
      return await $fetch<SkkItem[]>("/api/skk/items", { query, timeout: 5000 });
    } catch (e) {
      console.error("fetchItems SKK error:", e);
      return [];
    }
  };

  const fetchProgress = async (): Promise<SkkProgress[]> => {
    try {
      return await $fetch<SkkProgress[]>("/api/skk/progress", {
        headers: authHeaders(),
        timeout: 5000,
      });
    } catch {
      return [];
    }
  };

  const submitVerification = async (payload: {
    skk_id: string;
    level: SkkLevel;
    notes?: string;
    evidence_url?: string;
    evidence_photos?: string[];
  }): Promise<SkkProgress> => {
    return await $fetch<SkkProgress>("/api/skk/progress", {
      method: "POST",
      headers: authHeaders(),
      body: payload,
    });
  };

  return { fetchItems, fetchProgress, submitVerification };
}