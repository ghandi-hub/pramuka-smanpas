import { useImageService } from "~/services/imageService";

export default function useSupabaseCrud<T extends Record<string, any>>(
  tableName: string,
) {
  const { token } = useAdminAuth();
  const { deleteImage } = useImageService();

  const data = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Helper to check if we should use the admin endpoint
  const useProxy = () => !!token.value;

  const getBaseEndpoint = () => {
    return useProxy()
      ? `/api/admin/db/${tableName}`
      : `/api/public/db/${tableName}`;
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (useProxy() && token.value) {
      return { Authorization: `Bearer ${token.value}` };
    }
    return {};
  };

  const fetchAll = async (
    orderBy: string = "created_at",
    ascending: boolean = false,
    limit?: number,
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const endpoint = getBaseEndpoint();
      const headers = getAuthHeaders();
      const query: Record<string, any> = {
        orderBy,
        ascending: String(ascending),
      };
      if (limit) {
        query.limit = limit;
      }

      const result = await $fetch<T[]>(endpoint, {
        headers,
        query,
      });

      data.value = (result as T[]) ?? [];
      return data.value;
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || "Failed to fetch data";
      data.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchById = async (id: string): Promise<T | null> => {
    loading.value = true;
    error.value = null;

    try {
      const endpoint = getBaseEndpoint();
      const headers = getAuthHeaders();

      const result = await $fetch<T>(`${endpoint}/${id}`, {
        headers,
      });

      return result ?? null;
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || "Failed to fetch data";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchByField = async (field: string, value: any): Promise<T | null> => {
    loading.value = true;
    error.value = null;

    try {
      const endpoint = getBaseEndpoint();
      const headers = getAuthHeaders();

      const result = await $fetch<T>(endpoint, {
        headers,
        query: {
          field,
          value,
          single: "true",
        },
      });

      return result ?? null;
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || "Failed to fetch data";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchCount = async (): Promise<number> => {
    try {
      const endpoint = getBaseEndpoint();
      const headers = getAuthHeaders();

      const result = await $fetch<{ count: number }>(endpoint, {
        headers,
        query: { count: "true" },
      });

      return result?.count ?? 0;
    } catch (e: any) {
      console.error("Failed to fetch count:", e);
      return 0;
    }
  };

  const insert = async (item: Partial<T>): Promise<T> => {
    if (!useProxy()) {
      throw new Error("Unauthorized: Only admins can perform this action");
    }

    loading.value = true;
    error.value = null;

    try {
      const result = await $fetch<T>(`/api/admin/db/${tableName}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token.value}` },
        body: item,
      });

      return result as T;
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || "Failed to insert";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const update = async (
    id: string,
    payload: Partial<T>,
    oldImageUrl?: string | null,
  ): Promise<T | undefined> => {
    if (!useProxy()) {
      throw new Error("Unauthorized: Only admins can perform this action");
    }

    loading.value = true;
    error.value = null;

    try {
      const result = await $fetch<T>(`/api/admin/db/${tableName}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token.value}` },
        body: payload,
      });

      // Cleanup old image if replaced
      const imgFields = [
        "image_url",
        "cover_image",
        "photo",
        "frame_url",
        "avatar_url",
      ];
      for (const field of imgFields) {
        const newValue = (payload as any)[field];
        if (oldImageUrl && newValue && oldImageUrl !== newValue) {
          await deleteImage(oldImageUrl);
          break;
        }
      }

      return result;
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || "Failed to update record";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const remove = async (id: string, imageUrl?: string | null): Promise<void> => {
    if (!useProxy()) {
      throw new Error("Unauthorized: Only admins can perform this action");
    }

    loading.value = true;
    error.value = null;

    try {
      if (imageUrl) {
        await deleteImage(imageUrl);
      }

      await $fetch(`/api/admin/db/${tableName}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token.value}` },
      });
    } catch (e: any) {
      error.value = e.data?.statusMessage || e.message || "Failed to delete";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    loading,
    error,
    fetchAll,
    fetchById,
    fetchByField,
    fetchCount,
    insert,
    update,
    remove,
  };
}
