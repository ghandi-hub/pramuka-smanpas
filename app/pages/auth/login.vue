<script setup lang="ts">
import { LogIn, Loader2, ArrowLeft } from "lucide-vue-next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "~/composables/useAdminAuth";

definePageMeta({
  layout: false,
  middleware: ["guest"],
});

useHead({
  title: "Login Admin",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const resending = ref(false);
const errorMsg = ref("");
const isUnverified = ref(false);

const { setProfile } = useAdminAuth();
const route = useRoute();

onMounted(() => {
  if (route.query.unauthorized) {
    import("vue-sonner").then(({ toast }) => {
      toast.error("Silakan login terlebih dahulu untuk mengakses halaman admin", {
        id: "unauthorized-toast"
      });
    });
    router.replace({ query: {} });
  } else if (route.query.need_login) {
    import("vue-sonner").then(({ toast }) => {
      toast.info("Silakan login dengan akun anggota terlebih dahulu untuk mengakses fitur SKU & SKK Digital", {
        id: "need-login-toast"
      });
    });
    router.replace({ query: {} });
  }
});

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    }) as any;

    setProfile(response.user as any, response.token);
    if (response.user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/sku");
    }
  } catch (e: any) {
    if (e.statusCode === 403) {
      isUnverified.value = true;
    }
    errorMsg.value = e.data?.statusMessage || e.message || "Login gagal. Periksa kredensial Anda.";
  } finally {
    loading.value = false;
  }
};

const handleResendVerification = async () => {
  resending.value = true;
  try {
    const response = await $fetch("/api/auth/resend-verification", {
      method: "POST",
      body: { email: email.value },
    }) as any;

    import("vue-sonner").then(({ toast }) => {
      toast.success(response.message || "Email verifikasi telah dikirim ulang");
    });
    isUnverified.value = false; // Hide the button after success
  } catch (e: any) {
    import("vue-sonner").then(({ toast }) => {
      toast.error(e.data?.statusMessage || "Gagal mengirim ulang verifikasi");
    });
  } finally {
    resending.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/40 p-4">
    <div class="w-full max-w-md">
      <Card class="border-border/50 shadow-xl">
        <CardHeader class="text-center pb-2">
          <div class="flex items-center justify-center gap-3 mb-4">
            <img src="/images/logo_pa.webp" alt="Logo Ambalan Putra" class="h-14 w-14 object-contain" />
            <img src="/images/logo_pi.webp" alt="Logo Ambalan Putri" class="h-14 w-14 object-contain" />
          </div>
          <CardTitle class="text-2xl font-display font-bold">Login</CardTitle>
          <CardDescription>Masukkan kredensial</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Error message -->
            <div v-if="errorMsg"
              class="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex flex-col gap-2">
              <span>{{ errorMsg }}</span>
              <Button v-if="isUnverified" type="button" variant="link"
                class="text-destructive font-bold p-0 h-auto justify-start underline decoration-dotted underline-offset-4"
                @click="handleResendVerification" :disabled="resending">
                {{ resending ? "Mengirim ulang..." : "Kirim ulang email verifikasi" }}
              </Button>
            </div>

            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="email" type="email" placeholder="admin@pramuka.com" required
                autocomplete="email" />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="password">Password</Label>
                <NuxtLink to="/auth/forgot-password"
                  class="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Lupa password?
                </NuxtLink>
              </div>
              <Input id="password" v-model="password" type="password" required autocomplete="current-password" />
            </div>
            <Button type="submit" class="w-full" :disabled="loading">
              <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              <LogIn v-else class="w-4 h-4 mr-2" />
              {{ loading ? "Memproses..." : "Login" }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Back to Landing Page -->
      <div class="mt-6 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
          <ArrowLeft class="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Halaman Beranda
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
