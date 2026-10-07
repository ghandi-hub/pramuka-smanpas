import { decodeJwtPayload, isTokenValid } from "~/utils/jwtHelper";

export default defineNuxtRouteMiddleware((to, from) => {
  const { token } = useAdminAuth();

  if (token.value && isTokenValid(token.value)) {
    const payload = decodeJwtPayload(token.value);
    if (payload?.role === "admin") {
      return navigateTo("/admin?already_logged_in=true");
    }
    return navigateTo("/sku?already_logged_in=true");
  }
});
