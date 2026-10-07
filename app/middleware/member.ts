import { decodeJwtPayload, isTokenValid } from "~/utils/jwtHelper";

export default defineNuxtRouteMiddleware((to, from) => {
  const { profile, token, fetchProfile } = useAdminAuth();

  if (!token.value || !isTokenValid(token.value)) {
    return navigateTo("/auth/login?need_login=true");
  }

  const payload = decodeJwtPayload(token.value);
  if (!payload || (payload.role !== "member" && payload.role !== "admin")) {
    return navigateTo("/auth/login?need_login=true");
  }

  // Fetch full profile in background on client only
  if (import.meta.client && !profile.value) {
    fetchProfile().catch(() => {});
  }
});
