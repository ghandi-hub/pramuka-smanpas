export default defineNuxtRouteMiddleware(async (to, from) => {
  const { token, profile, fetchProfile } = useAdminAuth();

  if (token.value) {
    if (!profile.value) {
      await fetchProfile();
    }
    if (profile.value?.role === "admin") {
      return navigateTo("/admin?already_logged_in=true");
    }
    return navigateTo("/sku?already_logged_in=true");
  }
});
