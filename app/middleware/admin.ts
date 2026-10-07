import { decodeJwtPayload, isTokenValid } from "~/utils/jwtHelper";

export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === "/auth/login") return;
  const { profile, token, fetchProfile } = useAdminAuth();

  if (!token.value || !isTokenValid(token.value)) {
    return navigateTo("/auth/login?unauthorized=true");
  }

  const payload = decodeJwtPayload(token.value);
  if (!payload || payload.role !== "admin") {
    return navigateTo("/member?unauthorized=true");
  }

  if (import.meta.client && !profile.value) {
    fetchProfile().catch(() => {});
  }
});
