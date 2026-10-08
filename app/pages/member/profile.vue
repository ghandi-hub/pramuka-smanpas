<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "#imports";
import { toast } from "vue-sonner";
import {
  Save,
  KeyRound,
  UserRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-vue-next";
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
  CardFooter,
} from "~/components/ui/card";
import ImageUploader from "~/components/admin/ImageUploader.vue";
import { useImageService } from "~/services/imageService";

definePageMeta({ layout: "member", middleware: "member" });
useHead({
  title: "Pengaturan Akun",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { t } = useI18n();
const { profile, updateProfile, changePassword } = useAdminAuth();

const profileForm = ref({
  name: "",
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
        religion: (newVal as any).religion || "islam",
        avatar_url: newVal.avatar_url || "",
      };
    }
  },
  { immediate: true },
);

const handleProfileSubmit = async () => {
  if (!profileForm.value.name) {
    toast.error(t("member.profile.error_name"));
    return;
  }

  savingProfile.value = true;
  try {
    if (selectedFile.value) {
      uploading.value = true;
      const imageUrl = await uploadImage(selectedFile.value);

      if (profile.value?.avatar_url && profile.value.avatar_url !== imageUrl) {
        await deleteImage(profile.value.avatar_url);
      }

      profileForm.value.avatar_url = imageUrl;
      uploading.value = false;
    }

    await updateProfile(profileForm.value);
    toast.success(t("member.profile.success_profile"));
    selectedFile.value = null;
  } catch (err: any) {
    toast.error(
      err.data?.statusMessage ||
        err.message ||
        t("member.profile.error_profile"),
    );
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
    toast.error(t("member.profile.error_password_fields"));
    return;
  }
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    toast.error(t("member.profile.error_password_match"));
    return;
  }
  if (passwordForm.value.new_password.length < 6) {
    toast.error(t("member.profile.error_password_length"));
    return;
  }

  changingPassword.value = true;
  try {
    await changePassword(
      passwordForm.value.old_password,
      passwordForm.value.new_password,
    );
    toast.success(t("member.profile.success_password"));
    passwordForm.value = {
      old_password: "",
      new_password: "",
      confirm_password: "",
    };
  } catch (err: any) {
    toast.error(
      err.data?.statusMessage || t("member.profile.error_password"),
    );
  } finally {
    changingPassword.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-6 max-w-4xl mx-auto w-full">
    <div>
      <h1 class="text-2xl lg:text-3xl font-display font-bold text-foreground tracking-tight">
        {{ t("member.profile.title") }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ t("member.profile.subtitle") }}
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 items-start">
      <!-- Edit Profile Card -->
      <Card class="flex flex-col h-full shadow-sm border-muted">
        <CardHeader class="pb-4">
          <div class="flex items-center gap-2 text-primary mb-1">
            <UserRound class="w-5 h-5" />
            <CardTitle class="text-xl">{{ t("member.profile.detail") }}</CardTitle>
          </div>
          <CardDescription>
            {{ t("member.profile.detail_desc") }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex-1 space-y-5">
          <div class="space-y-3">
            <Label>{{ t("member.profile.avatar") }}</Label>
            <div class="p-1 border border-dashed border-border rounded-lg bg-muted/20">
              <ImageUploader
                :model-value="profileForm.avatar_url"
                :loading="uploading"
                @file-selected="(f) => (selectedFile = f)"
                @update:model-value="
                  (v) => {
                    if (!v) selectedFile = null;
                    profileForm.avatar_url = v || '';
                  }
                "
              />
            </div>
            <p class="text-xs text-muted-foreground">{{ t("member.profile.avatar_hint") }}</p>
          </div>

          <div class="space-y-3">
            <Label for="name">{{ t("member.profile.name") }}</Label>
            <Input
              id="name"
              v-model="profileForm.name"
              :placeholder="t('member.profile.name_placeholder')"
              class="bg-background"
            />
          </div>

          <div class="space-y-3">
            <Label for="religion">{{ t("member.profile.religion") }}</Label>
            <Select v-model="profileForm.religion">
              <SelectTrigger id="religion" class="bg-background">
                <SelectValue :placeholder="t('member.profile.religion')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="islam">Islam</SelectItem>
                <SelectItem value="katolik">Katolik</SelectItem>
                <SelectItem value="kristen">Kristen Protestan</SelectItem>
                <SelectItem value="hindu">Hindu</SelectItem>
                <SelectItem value="buddha">Buddha</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">{{ t("member.profile.religion_hint") }}</p>
          </div>

          <div class="space-y-3 pt-2">
            <Label>{{ t("member.profile.role") }}</Label>
            <div class="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground">
              <ShieldCheck class="w-4 h-4 text-primary" />
              <span class="text-sm font-medium capitalize">{{ profile?.role || "member" }}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter class="pt-6 pb-6 border-t bg-muted/10">
          <Button class="w-full sm:w-auto" :disabled="savingProfile || uploading" @click="handleProfileSubmit">
            <Loader2 v-if="savingProfile || uploading" class="w-4 h-4 mr-2 animate-spin" />
            <Save v-else class="w-4 h-4 mr-2" />
            {{ savingProfile || uploading ? t("member.profile.saving") : t("member.profile.save") }}
          </Button>
        </CardFooter>
      </Card>

      <!-- Change Password Card -->
      <Card class="flex flex-col h-auto shadow-sm border-muted">
        <CardHeader class="pb-4">
          <div class="flex items-center gap-2 text-primary mb-1">
            <KeyRound class="w-5 h-5" />
            <CardTitle class="text-xl">{{ t("member.profile.security") }}</CardTitle>
          </div>
          <CardDescription>
            {{ t("member.profile.security_desc") }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="space-y-3">
            <Label for="old_password">{{ t("member.profile.old_password") }}</Label>
            <div class="relative">
              <Input
                id="old_password"
                :type="showOldPassword ? 'text' : 'password'"
                v-model="passwordForm.old_password"
                placeholder="••••••••"
                class="bg-background pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="showOldPassword = !showOldPassword"
              >
                <EyeOff v-if="showOldPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <Separator class="my-4" />

          <div class="space-y-3">
            <Label for="new_password">{{ t("member.profile.new_password") }}</Label>
            <div class="relative">
              <Input
                id="new_password"
                :type="showNewPassword ? 'text' : 'password'"
                v-model="passwordForm.new_password"
                placeholder="••••••••"
                class="bg-background pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="showNewPassword = !showNewPassword"
              >
                <EyeOff v-if="showNewPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <Label for="confirm_password">{{ t("member.profile.confirm_password") }}</Label>
            <div class="relative">
              <Input
                id="confirm_password"
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="passwordForm.confirm_password"
                placeholder="••••••••"
                class="bg-background pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-muted-foreground">{{ t("member.profile.confirm_hint") }}</p>
          </div>
        </CardContent>
        <CardFooter class="pt-6 pb-6 border-t bg-muted/10">
          <Button
            variant="secondary"
            class="w-full sm:w-auto"
            :disabled="changingPassword"
            @click="handlePasswordSubmit"
          >
            <Loader2 v-if="changingPassword" class="w-4 h-4 mr-2 animate-spin" />
            <KeyRound v-else class="w-4 h-4 mr-2" />
            {{ changingPassword ? t("member.profile.updating") : t("member.profile.update_password") }}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>