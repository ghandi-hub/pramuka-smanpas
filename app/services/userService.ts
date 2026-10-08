import useMongoCrud from "~/composables/useMongoCrud";
import { useImageService } from "./imageService";

export interface Profiles {
  id: string;
  name: string;
  email: string;
  role: string;
  religion?: string;
  avatar_url: string | null;
  created_at: string;
}

export function useUserService() {
  const crud = useMongoCrud<Profiles>("profiles");
  const { data, loading } = crud;
  const { uploadImage, deleteImage } = useImageService();

  const { token } = useAdminAuth();

  const createUser = async (user: {
    name: string;
    email: string;
    password: string;
    avatar_url: string;
    role?: string;
    religion?: string;
  }) => {
    const response = await $fetch("/api/auth/register", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        religion: user.religion || "islam",
        avatar_url: user.avatar_url,
      },
    });

    return response;
  };

  const fetchAll = async () => {
    loading.value = true;
    try {
      const result = await $fetch<Profiles[]>("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      data.value = result;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id: string, profileData: Partial<Profiles>) => {
    loading.value = true;
    try {
      const result = await $fetch<Profiles>(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        body: profileData,
      });
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const removeUser = async (id: string, avatarUrl?: string | null) => {
    loading.value = true;
    try {
      if (avatarUrl) {
        await deleteImage(avatarUrl);
      }
      await $fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    loading,
    fetchAll,
    insert: createUser,
    update,
    remove: removeUser,
    uploadImage,
  };
}
