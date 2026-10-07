export default defineNuxtRouteMiddleware(async (to, from) => {
  const { profile, token, fetchProfile } = useAdminAuth();

  if (!token.value) {
    return navigateTo("/auth/login?need_login=true");
  }

  if (!profile.value) {
    await fetchProfile();
    if (!profile.value) {
      return navigateTo("/auth/login?need_login=true");
    }
  }

  // Jika admin, biarkan atau admin bisa lihat preview
  // Jika bukan member dan bukan admin, tolak
  if (profile.value.role !== "member" && profile.value.role !== "admin") {
    return navigateTo("/auth/login?need_login=true");
  }
});
