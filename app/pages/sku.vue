<script setup lang="ts">
definePageMeta({ middleware: "member" });

import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "#imports";
import {
  CheckCircle2,
  Clock,
  FileWarning,
  CircleDashed,
  Send,
  LogIn,
  Award,
  Loader2,
  ExternalLink,
  Lock,
  AlertTriangle,
} from "lucide-vue-next";
import Button from "~/components/ui/button/Button.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import MultiImageUploader from "~/components/admin/MultiImageUploader.vue";
import {
  useSkuService,
  type ProgressStatus,
  type SkuItem,
  type SkuLevel,
} from "~/services/skuService";

const { t } = useI18n();
const localePath = useLocalePath();
const { profile } = useAdminAuth();
const { fetchItems, fetchProgress, submitExam } = useSkuService();

const levels: SkuLevel[] = ["bantara", "laksana"];
const level = ref<SkuLevel>("bantara");

const categories = [
  { value: "all", key: "sku.categories.all" },
  { value: "Spiritual/Agama", key: "sku.categories.spiritual" },
  { value: "Sosial & Emosional", key: "sku.categories.social" },
  { value: "Keterampilan/Intelektual", key: "sku.categories.skill" },
  { value: "Fisik & Lingkungan", key: "sku.categories.physical" },
] as const;

const activeCategory = ref<string>("all");

const items = ref<SkuItem[]>([]);
const progress = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);

const dialogOpen = ref(false);
const activeItem = ref<SkuItem | null>(null);
const notes = ref("");
const evidencePhotos = ref<string[]>([]);
const uploading = ref(false);

// Butir Bantara (semua) untuk hitung prasyarat Laksana.
const bantaraItems = ref<SkuItem[]>([]);

const progressMap = computed(() => {
  const map = new Map<string, any>();
  for (const p of progress.value) {
    if (p.point_id) map.set(String(p.point_id), p);
  }
  return map;
});

const filteredItems = computed(() => {
  if (activeCategory.value === "all") return items.value;
  return items.value.filter((i) => i.category === activeCategory.value);
});

const isVerified = (id: unknown): boolean =>
  progressMap.value.get(String(id))?.status === "verified";

const bantaraRemaining = computed(
  () => bantaraItems.value.filter((i) => !isVerified(i.id)).length,
);

// Laksana terkunci jika ada >= 3 butir Bantara yang belum verified.
const laksanaLocked = computed(
  () => level.value === "laksana" && bantaraRemaining.value >= 3,
);

const canSubmit = computed(() => {
  if (!activeItem.value) return false;
  if (level.value === "laksana" && laksanaLocked.value) return false;
  if (!evidencePhotos.value.length) return false;
  return !submitting.value && !uploading.value;
});

const verifiedCount = computed(
  () =>
    items.value.filter(
      (i) => progressMap.value.get(String(i.id))?.status === "verified",
    ).length,
);
const totalCount = computed(() => items.value.length);
const percentage = computed(() =>
  totalCount.value ? Math.round((verifiedCount.value / totalCount.value) * 100) : 0,
);

const statusOf = (item: SkuItem): ProgressStatus | "none" => {
  return progressMap.value.get(String(item.id))?.status ?? "none";
};

const statusMeta: Record<
  string,
  { label: string; class: string; icon: any }
> = {
  none: {
    label: "sku.status.not_tested",
    class: "bg-muted text-muted-foreground border-border",
    icon: CircleDashed,
  },
  pending: {
    label: "sku.status.pending",
    class: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    icon: Clock,
  },
  verified: {
    label: "sku.status.verified",
    class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "sku.status.rejected",
    class: "bg-destructive/10 text-destructive border-destructive/30",
    icon: FileWarning,
  },
};

const load = async () => {
  loading.value = true;
  try {
    const [fetchedItems, fetchedProgress, allBantara] = await Promise.all([
      fetchItems(level.value),
      fetchProgress(),
      fetchItems("bantara"),
    ]);
    items.value = fetchedItems;
    progress.value = fetchedProgress;
    bantaraItems.value = allBantara;
  } finally {
    loading.value = false;
  }
};

watch(level, () => {
  activeCategory.value = "all";
  load();
});

const openSubmit = (item: SkuItem) => {
  activeItem.value = item;
  const existing = progressMap.value.get(String(item.id));
  notes.value = existing?.notes ?? "";
  evidencePhotos.value = Array.isArray(existing?.evidence_photos)
    ? existing.evidence_photos.filter((p: unknown) => typeof p === "string")
    : existing?.evidence_url
      ? [existing.evidence_url]
      : [];
  dialogOpen.value = true;
};

const handleSubmit = async () => {
  if (!activeItem.value) return;
  if (level.value === "laksana" && laksanaLocked.value) {
    const { toast } = await import("vue-sonner");
    toast.error(t("sku.lock.message", { remaining: bantaraRemaining.value }));
    return;
  }
  if (!evidencePhotos.value.length) {
    const { toast } = await import("vue-sonner");
    toast.error(t("sku.dialog.evidence_required"));
    return;
  }
  submitting.value = true;
  try {
    await submitExam({
      point_id: String(activeItem.value.id),
      notes: notes.value,
      evidence_photos: evidencePhotos.value,
      evidence_url: evidencePhotos.value[0],
    });
    const { toast } = await import("vue-sonner");
    toast.success(t("sku.dialog.success"));
    dialogOpen.value = false;
    await load();
  } catch (e: any) {
    const { toast } = await import("vue-sonner");
    toast.error(e.data?.statusMessage || t("sku.dialog.error"));
  } finally {
    submitting.value = false;
  }
};

useHead({ title: () => t("seo.sku.title") });
useSeoMeta({
  description: () => t("seo.sku.description"),
});

const route = useRoute();

onMounted(() => {
  load();
  if (route.query.unauthorized) {
    import("vue-sonner").then(({ toast }) => {
      toast.error("Halaman admin hanya dapat diakses oleh akun pembina/admin.");
    });
  }
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-card">
    <!-- Header -->
    <header class="bg-background py-20 border-b border-border">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
        <p
          class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4"
        >
          <Award class="w-4 h-4" />
          {{ t("sku.header.badge") }}
        </p>
        <h1
          class="font-display text-4xl md:text-6xl font-bold text-foreground mb-6"
        >
          {{ t("sku.header.title") }}
        </h1>
        <p
          class="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
        >
          {{ t("sku.header.description") }}
        </p>
      </div>
    </header>

    <section class="py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <!-- Level toggle -->
        <div class="flex flex-col items-center gap-8 mb-12">
          <div
            class="inline-flex p-1.5 rounded-full border border-border bg-background"
          >
            <button
              v-for="lvl in levels"
              :key="lvl"
              class="px-6 sm:px-8 py-2.5 rounded-full text-sm font-semibold transition-all"
              :class="
                level === lvl
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="level = lvl"
            >
              {{ t(`sku.levels.${lvl}`) }}
            </button>
          </div>

          <!-- Badge icon -->
          <img
            :src="`/images/sku/${level}.svg`"
            :alt="t(`sku.levels.${level}`)"
            class="h-28 w-auto object-contain drop-shadow-md transition-all duration-500"
          />
        </div>

        <!-- Laksana lock warning -->
        <div
          v-if="laksanaLocked"
          class="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-700 dark:text-amber-400"
        >
          <AlertTriangle class="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <p class="font-semibold flex items-center gap-2">
              {{ t("sku.lock.title") }}
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-bold uppercase tracking-wider"
              >
                <Lock class="w-3 h-3" />
                {{ t("sku.lock.badge") }}
              </span>
            </p>
            <p class="text-sm mt-1.5 leading-relaxed">
              {{ t("sku.lock.message", { remaining: bantaraRemaining }) }}
            </p>
          </div>
        </div>

        <!-- Progress -->
        <div
          class="bg-background border border-border rounded-2xl p-6 mb-10 shadow-sm"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold text-foreground">
              {{ t("sku.progress.title") }}
            </span>
            <span class="text-sm font-bold text-primary">
              {{ verifiedCount }}/{{ totalCount }} &middot; {{ percentage }}%
            </span>
          </div>
          <div class="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              class="h-full rounded-full bg-primary transition-all duration-500"
              :style="{ width: `${percentage}%` }"
            />
          </div>
          <p v-if="!profile" class="text-xs text-muted-foreground mt-3">
            {{ t("sku.progress.login_hint") }}
          </p>
        </div>

        <!-- Category filter -->
        <div class="flex flex-wrap gap-2 mb-8">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="px-4 py-2 rounded-full text-xs font-semibold border transition-all"
            :class="
              activeCategory === cat.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            "
            @click="activeCategory = cat.value"
          >
            {{ t(cat.key) }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-20">
          <Loader2 class="w-8 h-8 text-primary animate-spin" />
        </div>

        <!-- List -->
        <div v-else class="space-y-4">
          <article
            v-for="item in filteredItems"
            :key="item.id"
            class="bg-background border border-border rounded-2xl p-5 sm:p-6 hover:border-primary/40 transition-colors"
          >
            <div class="flex items-start gap-4">
              <div
                class="shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-lg"
              >
                {{ item.point_number }}
              </div>
              <div class="flex-1 min-w-0">
                <div
                  class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2"
                >
                  <h3
                    class="font-display text-lg font-bold text-foreground leading-snug"
                  >
                    {{ item.title }}
                  </h3>
                  <span
                    class="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    :class="statusMeta[statusOf(item)].class"
                  >
                    <component
                      :is="statusMeta[statusOf(item)].icon"
                      class="w-3 h-3"
                    />
                    {{ t(statusMeta[statusOf(item)].label) }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground leading-relaxed">
                  {{ item.description }}
                </p>

                <div
                  v-if="progressMap.get(String(item.id))?.admin_notes"
                  class="mt-3 text-xs rounded-lg bg-muted/60 border border-border p-3"
                >
                  <span class="font-semibold text-foreground"
                    >{{ t("sku.card.examiner_notes") }}:</span
                  >
                  {{ progressMap.get(String(item.id)).admin_notes }}
                </div>

                <div class="mt-4 flex items-center gap-3">
                  <template v-if="profile">
                    <Button
                      size="sm"
                      variant="outline"
                      class="rounded-full"
                      :disabled="level === 'laksana' && laksanaLocked"
                      :title="
                        level === 'laksana' && laksanaLocked
                          ? t('sku.lock.tooltip')
                          : undefined
                      "
                      @click="openSubmit(item)"
                    >
                      <Lock
                        v-if="level === 'laksana' && laksanaLocked"
                        class="w-3.5 h-3.5 mr-1.5"
                      />
                      <Send v-else class="w-3.5 h-3.5 mr-1.5" />
                      {{
                        level === "laksana" && laksanaLocked
                          ? t("sku.lock.badge")
                          : statusOf(item) === "none"
                            ? t("sku.card.submit")
                            : t("sku.card.resubmit")
                      }}
                    </Button>
                    <a
                      v-if="progressMap.get(String(item.id))?.evidence_url"
                      :href="progressMap.get(String(item.id)).evidence_url"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink class="w-3 h-3" />
                      {{ t("sku.card.evidence") }}
                    </a>
                  </template>
                  <NuxtLink
                    v-else
                    :to="localePath('/auth/login')"
                    class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <LogIn class="w-3.5 h-3.5" />
                    {{ t("sku.card.login_prompt") }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </article>

          <div
            v-if="!filteredItems.length"
            class="text-center py-16 text-muted-foreground"
          >
            {{ t("sku.empty") }}
          </div>
        </div>
      </div>
    </section>

    <!-- Submit dialog -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ t("sku.dialog.title") }}</DialogTitle>
          <DialogDescription>
            {{ activeItem?.title }}
          </DialogDescription>
        </DialogHeader>
        <form class="space-y-4 pt-2" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="sku-notes">{{ t("sku.dialog.notes") }}</Label>
            <Textarea
              id="sku-notes"
              v-model="notes"
              :placeholder="t('sku.dialog.notes_placeholder')"
              class="h-[120px] resize-none"
            />
          </div>
          <div class="space-y-2">
            <Label>{{ t("sku.dialog.evidence") }}</Label>
            <MultiImageUploader
              v-model="evidencePhotos"
              v-model:loading="uploading"
              :max-photos="5"
            />
          </div>
          <DialogFooter class="gap-2">
            <Button
              type="button"
              variant="outline"
              @click="dialogOpen = false"
            >
              {{ t("sku.dialog.cancel") }}
            </Button>
            <Button type="submit" :disabled="!canSubmit">
              <Loader2
                v-if="submitting || uploading"
                class="w-4 h-4 mr-2 animate-spin"
              />
              <Lock
                v-else-if="laksanaLocked"
                class="w-4 h-4 mr-2"
              />
              {{ submitting ? t("sku.dialog.sending") : t("sku.dialog.submit") }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>