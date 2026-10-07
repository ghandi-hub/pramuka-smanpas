import type { Profiles } from "~/services/userService";

let inFlightFetch: Promise<Profiles | null> | null = null;
let inFlightRefresh: Promise<string | null> | null = null;

export const useAdminAuth = () => {
  const profile = useState<Profiles | null>("admin-profile", () => null);
  const loading = useState<boolean>("admin-profile-loading", () => false);
  const isSecure = import.meta.client
    ? window.location.protocol === "https:"
    : false;

  const token = useCookie("auth_token", {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    secure: isSecure,
    path: "/",
  });

  const refreshAccessToken = async (): Promise<string | null> => {
    if (inFlightRefresh) return inFlightRefresh;

    inFlightRefresh = (async () => {
      try {
        const response = (await $fetch("/api/auth/refresh", {
          method: "POST",
        })) as any;

        if (response?.token) {
          token.value = response.token;
          return response.token as string;
        }
        await clearProfile();
        return null;
      } catch (e) {
        await clearProfile();
        return null;
      } finally {
        inFlightRefresh = null;
      }
    })();

    return inFlightRefresh;
  };

  const fetchProfile = async (isRetry = false): Promise<Profiles | null> => {
    if (!token.value) {
      profile.value = null;
      return null;
    }

    if (profile.value) return profile.value;
    if (inFlightFetch) return inFlightFetch;

    loading.value = true;
    inFlightFetch = (async () => {
      try {
        const data = await $fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        });

        if (data) {
          profile.value = data as Profiles;
          return profile.value;
        }
        return null;
      } catch (e: any) {
        if (e.statusCode === 401 && !isRetry) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            return await fetchProfile(true);
          }
        }
        profile.value = null;
        token.value = null;
        return null;
      } finally {
        loading.value = false;
        inFlightFetch = null;
      }
    })();

    return inFlightFetch;
  };

  const updateProfile = async (data: Partial<Profiles>) => {
    try {
      const response = await $fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        body: data,
      });
      if (response && profile.value) {
        profile.value = { ...profile.value, ...response } as Profiles;
      }
      return response;
    } catch (e) {
      throw e;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await $fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        body: {
          old_password: oldPassword,
          new_password: newPassword,
        },
      });
      return response;
    } catch (e) {
      throw e;
    }
  };

  const setProfile = (data: Profiles, jwt: string) => {
    profile.value = data;
    token.value = jwt;
  };

  const clearProfile = async () => {
    try {
      await $fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore logout errors
    } finally {
      // Clear local state immediately to prevent middleware race conditions
      profile.value = null;
      token.value = null;
    }
  };

  return {
    profile,
    loading,
    token,
    fetchProfile,
    setProfile,
    clearProfile,
    updateProfile,
    changePassword,
  };
};
