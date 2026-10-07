export default defineNuxtRouteMiddleware(async (to, from) => {
  //   Skip on server side if needed, but Nuxt middleware runs on both
  // Allow access to login page without auth
  if (to.path === "/auth/login") return;
  const { profile, token, fetchProfile } = useAdminAuth();
  if (!token.value) {
    return navigateTo("/auth/login?unauthorized=true");
  }
  // Fetch profile if not already loaded (this will use our custom fetchProfile)
  if (!profile.value) {
    await fetchProfile();
    // If still no profile, it means token is invalid or expired
    if (!profile.value) {
      return navigateTo("/auth/login?unauthorized=true");
    }
  }
  // Double check if role is admin
  if (profile.value.role !== "admin") {
    return navigateTo("/sku?unauthorized=true");
  }
});
