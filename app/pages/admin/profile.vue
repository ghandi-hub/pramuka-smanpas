<script setup lang="ts">
import { ref, watch } from "vue";
import { toast } from "vue-sonner";
import { Save, KeyRound, UserRound, Upload, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-vue-next";
import Button from "~/components/ui/button/Button.vue";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "~/components/ui/card";
import ImageUploader from "~/components/admin/ImageUploader.vue";
import { useImageService } from "~/services/imageService";

definePageMeta({ layout: "admin", middleware: "admin" });
useHead({
  title: "Profil Saya",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { profile, updateProfile, changePassword } = useAdminAuth();

const profileForm = ref({
  name: "",
  email: "",
  religion: "islam",
  avatar_url: "",
});
const savingProfile = ref(false);
const uploading = ref(false);
const selectedFile = ref<File | null>(null);
const { uploadImage, deleteImage } = useImageService();

watch(
  profile,
  (newVal) => {
    if (newVal) {
      profileForm.value = {
        name: newVal.name || "",
        email: newVal.email || "",
        religion: (newVal as any).religion || "islam",
        avatar_url: newVal.avatar_url || "",
      };
    }
  },
  { immediate: true }
);

const handleProfileSubmit = async () => {
  if (!profileForm.value.name || !profileForm.value.email) {
    toast.error("Nama dan email wajib diisi.");
    return;
  }

  savingProfile.value = true;
  try {
    if (selectedFile.value) {
      uploading.value = true;
      const imageUrl = await uploadImage(selectedFile.value);

      // Optionally delete old image if replacing
      if (profile.value?.avatar_url && profile.value.avatar_url !== imageUrl) {
        await deleteImage(profile.value.avatar_url);
      }

      profileForm.value.avatar_url = imageUrl;
      uploading.value = false;
    }

    await updateProfile(profileForm.value);
    toast.success("Profil berhasil diperbarui!");
    selectedFile.value = null; // Clear selected file after successful upload/save
  } catch (err: any) {
    toast.error(err.data?.statusMessage || err.message || "Gagal memperbarui profil.");
  } finally {
    savingProfile.value = false;
    uploading.value = false;
  }
};

const passwordForm = ref({
  old_password: "",
  new_password: "",
  confirm_password: "",
});
const changingPassword = ref(false);

const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const handlePasswordSubmit = async () => {
  if (!passwordForm.value.old_password || !passwordForm.value.new_password) {
    toast.error("Semua field password wajib diisi.");
    return;
  }
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    toast.error("Konfirmasi password tidak cocok.");
    return;
  }
  if (passwordForm.value.new_password.length < 6) {
    toast.error("Password baru minimal 6 karakter.");
    return;
  }

  changingPassword.value = true;
  try {
    await changePassword(passwordForm.value.old_password, passwordForm.value.new_password);
    toast.success("Password berhasil diubah!");
    passwordForm.value = { old_password: "", new_password: "", confirm_password: "" };
  } catch (err: any) {
    toast.error(err.data?.statusMessage || "Gagal mengubah password.");
  } finally {
    changingPassword.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-6 max-w-4xl mx-auto w-full">
    <div>
      <h1 class="text-2xl lg:text-3xl font-display font-bold text-foreground tracking-tight">
        Pengaturan Profil
      </h1>
      <p class="text-muted-foreground mt-1">
        Kelola informasi pribadi dan keamanan akun Anda
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 items-start">
      <!-- Edit Profile Card -->
      <Card class="flex flex-col h-full shadow-sm border-muted">
        <CardHeader class="pb-4">
          <div class="flex items-center gap-2 text-primary mb-1">
            <UserRound class="w-5 h-5" />
            <CardTitle class="text-xl">Detail Profil</CardTitle>
          </div>
          <CardDescription>
            Perbarui informasi dasar profil dan avatar Anda.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex-1 space-y-5">
          <div class="space-y-3">
            <Label>Avatar Profil</Label>
            <div class="p-1 border border-dashed border-border rounded-lg bg-muted/20">
              <ImageUploader :model-value="profileForm.avatar_url" :loading="uploading"
                @file-selected="(f) => (selectedFile = f)" @update:model-value="
                  (v) => {
                    if (!v) selectedFile = null;
                    profileForm.avatar_url = v || '';
                  }
                " />
            </div>
            <p class="text-xs text-muted-foreground">Disarankan ukuran 1:1, format JPG/PNG max 2MB.</p>
          </div>

          <div class="space-y-3">
            <Label for="name">Nama Lengkap</Label>
            <Input id="name" v-model="profileForm.name" placeholder="Masukkan nama lengkap" class="bg-background" />
          </div>

          <div class="space-y-3">
            <Label for="email">Alamat Email</Label>
            <Input id="email" type="email" v-model="profileForm.email" placeholder="email@example.com"
              class="bg-background" />
          </div>

          <div class="space-y-3">
            <Label for="religion">Agama</Label>
            <Select v-model="profileForm.religion">
              <SelectTrigger id="religion" class="bg-background">
                <SelectValue placeholder="Pilih agama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="islam">Islam</SelectItem>
                <SelectItem value="katolik">Katolik</SelectItem>
                <SelectItem value="kristen">Kristen Protestan</SelectItem>
                <SelectItem value="hindu">Hindu</SelectItem>
                <SelectItem value="buddha">Buddha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-3 pt-2">
            <Label>Peran Pengguna</Label>
            <div class="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground">
              <ShieldCheck class="w-4 h-4 text-primary" />
              <span class="text-sm font-medium capitalize">{{ profile?.role || 'Admin' }}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter class="pt-6 pb-6 border-t bg-muted/10">
          <Button class="w-full sm:w-auto" @click="handleProfileSubmit" :disabled="savingProfile || uploading">
            <Loader2 v-if="savingProfile || uploading" class="w-4 h-4 mr-2 animate-spin" />
            <Save v-else class="w-4 h-4 mr-2" />
            {{ savingProfile || uploading ? "Menyimpan..." : "Simpan Perubahan" }}
          </Button>
        </CardFooter>
      </Card>

      <!-- Change Password Card -->
      <Card class="flex flex-col h-auto shadow-sm border-muted">
        <CardHeader class="pb-4">
          <div class="flex items-center gap-2 text-primary mb-1">
            <KeyRound class="w-5 h-5" />
            <CardTitle class="text-xl">Keamanan Akun</CardTitle>
          </div>
          <CardDescription>
            Ubah password untuk menjaga keamanan akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="space-y-3">
            <Label for="old_password">Password Lama</Label>
            <div class="relative">
              <Input id="old_password" :type="showOldPassword ? 'text' : 'password'" v-model="passwordForm.old_password" placeholder="••••••••"
                class="bg-background pr-10" />
              <button type="button" @click="showOldPassword = !showOldPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <EyeOff v-if="showOldPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <Separator class="my-4" />

          <div class="space-y-3">
            <Label for="new_password">Password Baru</Label>
            <div class="relative">
              <Input id="new_password" :type="showNewPassword ? 'text' : 'password'" v-model="passwordForm.new_password" placeholder="••••••••"
                class="bg-background pr-10" />
              <button type="button" @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <EyeOff v-if="showNewPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <Label for="confirm_password">Konfirmasi Password Baru</Label>
            <div class="relative">
              <Input id="confirm_password" :type="showConfirmPassword ? 'text' : 'password'" v-model="passwordForm.confirm_password" placeholder="••••••••"
                class="bg-background pr-10" />
              <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-muted-foreground">Pastikan sesuai dengan password baru Anda.</p>
          </div>
        </CardContent>
        <CardFooter class="pt-6 pb-6 border-t bg-muted/10">
          <Button variant="secondary" class="w-full sm:w-auto" @click="handlePasswordSubmit"
            :disabled="changingPassword">
            <Loader2 v-if="changingPassword" class="w-4 h-4 mr-2 animate-spin" />
            <KeyRound v-else class="w-4 h-4 mr-2" />
            {{ changingPassword ? "Memperbarui..." : "Perbarui Password" }}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
