export type SubmissionType = "all" | "sku" | "skk";
export type SubmissionStatus = "all" | "pending" | "verified" | "rejected";

export interface SubmissionItem {
  point_number?: number | null;
  title?: string | null;
  level?: string | null;
  name?: string | null;
  category?: string | null;
  field?: string | null;
}

export interface Submission {
  id: string;
  user_id: string;
  type: "sku" | "skk";
  status: SubmissionStatus;
  point_id?: string | null;
  skk_id?: string | null;
  level?: string | null;
  notes?: string | null;
  evidence_url?: string | null;
  admin_notes?: string | null;
  submitted_at?: string | null;
  verified_at?: string | null;
  updated_at?: string | null;
  member_name?: string | null;
  member_email?: string | null;
  item?: SubmissionItem | null;
}

export function useSkuSkkAdminService() {
  const { token } = useAdminAuth();

  const authHeaders = (): Record<string, string> => ({
    Authorization: `Bearer ${token.value}`,
  });

  const fetchSubmissions = async (
    type: SubmissionType = "all",
    status: SubmissionStatus = "all",
  ): Promise<Submission[]> => {
    return await $fetch<Submission[]>("/api/admin/sku-skk/submissions", {
      headers: authHeaders(),
      query: { type, status },
    });
  };

  const verify = async (payload: {
    type: "sku" | "skk";
    id: string;
    status: "verified" | "rejected";
    admin_notes?: string;
  }): Promise<Submission> => {
    return await $fetch<Submission>("/api/admin/sku-skk/verify", {
      method: "PUT",
      headers: authHeaders(),
      body: payload,
    });
  };

  return { fetchSubmissions, verify };
}