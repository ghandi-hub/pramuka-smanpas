<script setup lang="ts">
definePageMeta({ middleware: "member" });

import { computed, onMounted, ref } from "vue";
import { useI18n } from "#imports";
import {
  CheckCircle2,
  Clock,
  FileWarning,
  CircleDashed,
  Send,
  LogIn,
  Loader2,
  ExternalLink,
  Star,
  Lock,
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
  useSkkService,
  type ProgressStatus,
  type SkkColorCode,
  type SkkItem,
  type SkkLevel,
} from "~/services/skkService";

const { t } = useI18n();
const localePath = useLocalePath();
const { profile } = useAdminAuth();
const { fetchItems, fetchProgress, submitVerification } = useSkkService();

const fields = [
  { value: "all", color: "all", labelKey: "skk.fields.all" },
  { value: "kuning", color: "#eab308", labelKey: "skk.fields.kuning" },
  { value: "merah", color: "#dc2626", labelKey: "skk.fields.merah" },
  { value: "putih", color: "#f1f5f9", labelKey: "skk.fields.putih" },
  { value: "hijau", color: "#16a34a", labelKey: "skk.fields.hijau" },
  { value: "biru", color: "#2563eb", labelKey: "skk.fields.biru" },
] as const;

const activeField = ref<SkkColorCode | "all">("all");

const items = ref<SkkItem[]>([]);
const progress = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);

const dialogOpen = ref(false);
const activeItem = ref<SkkItem | null>(null);
const activeLevel = ref<SkkLevel>("purwa");
const notes = ref("");
const evidencePhotos = ref<string[]>([]);
const uploading = ref(false);

const skkLevels: SkkLevel[] = ["purwa", "madya", "utama"];
const levelIndex: Record<SkkLevel, number> = { purwa: 0, madya: 1, utama: 2 };

const progressMap = computed(() => {
  const map = new Map<string, any>();
  for (const p of progress.value) {
    if (p.skk_id) map.set(`${p.skk_id}:${p.level}`, p);
  }
  return map;
});

const filteredItems = computed(() => {
  if (activeField.value === "all") return items.value;
  return items.value.filter((i) => i.color_code === activeField.value);
});

const statusOf = (skkId: string, level: SkkLevel): ProgressStatus | "none" => {
  return progressMap.value.get(`${skkId}:${level}`)?.status ?? "none";
};

const previousLevel = (level: SkkLevel): SkkLevel | null => {
  const idx = levelIndex[level];
  return idx > 0 ? skkLevels[idx - 1] : null;
};

// Tingkat terkunci jika tingkat sebelumnya (skk_id sama) belum verified.
const isLevelLocked = (skkId: string, level: SkkLevel): boolean => {
  const prev = previousLevel(level);
  if (!prev) return false;
  return statusOf(skkId, prev) !== "verified";
};

const lockReason = (skkId: string, level: SkkLevel): string => {
  const prev = previousLevel(level);
  if (!prev) return "";
  return t("skk.lock.tooltip", {
    level: t(`skk.levels.${level}`),
    prev: t(`skk.levels.${prev}`),
  });
};

const canSubmit = computed(() => {
  if (!activeItem.value) return false;
  if (isLevelLocked(activeItem.value.id, activeLevel.value)) return false;
  if (!evidencePhotos.value.length) return false;
  return !submitting.value && !uploading.value;
});

const overallStatus = (skkId: string): ProgressStatus | "none" => {
  const statuses = skkLevels.map((l) => statusOf(skkId, l));
  if (statuses.includes("pending")) return "pending";
  if (statuses.includes("verified")) return "verified";
  if (statuses.includes("rejected")) return "rejected";
  return "none";
};

const statusMeta: Record<string, { label: string; class: string; icon: any }> =
  {
    none: {
      label: "skk.status.not_tested",
      class: "bg-muted text-muted-foreground border-border",
      icon: CircleDashed,
    },
    pending: {
      label: "skk.status.pending",
      class: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      icon: Clock,
    },
    verified: {
      label: "skk.status.verified",
      class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      icon: CheckCircle2,
    },
    rejected: {
      label: "skk.status.rejected",
      class: "bg-destructive/10 text-destructive border-destructive/30",
      icon: FileWarning,
    },
  };

const colorHex: Record<string, string> = {
  kuning: "#eab308",
  merah: "#dc2626",
  putih: "#f1f5f9",
  hijau: "#16a34a",
  biru: "#2563eb",
};

const badgeIcon = (item: SkkItem): string =>
  item.badge_icon || `/images/skk/${item.icon_key}.svg`;

const frameFor = (item: SkkItem, level: SkkLevel): string =>
  `/images/skk/${level}-${item.color_code}.svg`;

const load = async () => {
  loading.value = true;
  try {
    const [fetchedItems, fetchedProgress] = await Promise.all([
      fetchItems(),
      fetchProgress(),
    ]);
    items.value = fetchedItems;
    progress.value = fetchedProgress;
  } finally {
    loading.value = false;
  }
};

const openDetail = (item: SkkItem) => {
  activeItem.value = item;
  activeLevel.value = "purwa";
  notes.value = "";
  evidencePhotos.value = [];
  dialogOpen.value = true;
};

const selectLevel = (lvl: SkkLevel) => {
  activeLevel.value = lvl;
  const existing = progressMap.value.get(`${activeItem.value?.id}:${lvl}`);
  notes.value = existing?.notes ?? "";
  evidencePhotos.value = Array.isArray(existing?.evidence_photos)
    ? existing.evidence_photos.filter((p: unknown) => typeof p === "string")
    : existing?.evidence_url
      ? [existing.evidence_url]
      : [];
};

const handleSubmit = async () => {
  if (!activeItem.value) return;
  if (isLevelLocked(activeItem.value.id, activeLevel.value)) {
    const { toast } = await import("vue-sonner");
    toast.error(lockReason(activeItem.value.id, activeLevel.value));
    return;
  }
  if (!evidencePhotos.value.length) {
    const { toast } = await import("vue-sonner");
    toast.error(t("sku.dialog.evidence_required"));
    return;
  }
  submitting.value = true;
  try {
    await submitVerification({
      skk_id: String(activeItem.value.id),
      level: activeLevel.value,
      notes: notes.value,
      evidence_photos: evidencePhotos.value,
      evidence_url: evidencePhotos.value[0],
    });
    const { toast } = await import("vue-sonner");
    toast.success(t("skk.dialog.success"));
    await load();
    selectLevel(activeLevel.value);
  } catch (e: any) {
    const { toast } = await import("vue-sonner");
    toast.error(e.data?.statusMessage || t("skk.dialog.error"));
  } finally {
    submitting.value = false;
  }
};

useHead({ title: () => t("seo.skk.title") });
useSeoMeta({
  description: () => t("seo.skk.description"),
});

onMounted(load);
</script>

<template>
  <div class="flex flex-col min-h-screen bg-card">
    <!-- Header -->
    <header
      class="relative bg-background py-20 border-b border-border overflow-hidden"
    >
      <div
        class="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-10 blur-2xl"
        style="background: conic-gradient(#eab308, #dc2626, #f1f5f9, #16a34a, #2563eb)"
      />
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        <div class="max-w-3xl">
          <p
            class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4"
          >
            <Star class="w-4 h-4" />
            {{ t("skk.header.badge") }}
          </p>
          <h1
            class="font-display text-4xl md:text-6xl font-bold text-foreground mb-6"
          >
            {{ t("skk.header.title") }}
          </h1>
          <p
            class="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8"
          >
            {{ t("skk.header.description") }}
          </p>

          <!-- Color legends -->
          <div class="flex flex-wrap gap-3">
            <div
              v-for="f in fields.filter((x) => x.value !== 'all')"
              :key="f.value"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-foreground"
            >
              <span
                class="w-3 h-3 rounded-full border border-black/10"
                :style="{ backgroundColor: f.color }"
              />
              {{ t(f.labelKey) }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <!-- Field filter -->
        <div class="flex flex-wrap gap-2 mb-10">
          <button
            v-for="f in fields"
            :key="f.value"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all"
            :class="
              activeField === f.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            "
            @click="activeField = f.value"
          >
            <span
              v-if="f.value !== 'all'"
              class="w-3 h-3 rounded-full border border-black/10"
              :style="{ backgroundColor: f.color }"
            />
            {{ t(f.labelKey) }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-20">
          <Loader2 class="w-8 h-8 text-primary animate-spin" />
        </div>

        <!-- Grid -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <button
            v-for="item in filteredItems"
            :key="item.id"
            class="group text-left bg-background border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
            @click="openDetail(item)"
          >
            <!-- Badge preview -->
            <div class="relative w-28 h-28 mx-auto mb-5">
              <img
                :src="frameFor(item, 'purwa')"
                class="absolute inset-0 w-full h-full object-contain"
                alt=""
              />
              <img
                :src="badgeIcon(item)"
                class="absolute inset-0 w-full h-full object-contain p-6"
                :alt="item.name"
              />
            </div>

            <div class="text-center">
              <div class="flex items-center justify-center gap-2 mb-2">
                <span
                  class="w-2.5 h-2.5 rounded-full border border-black/10"
                  :style="{ backgroundColor: colorHex[item.color_code] }"
                />
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {{ item.field }}
                </span>
              </div>
              <h3
                class="font-display text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors"
              >
                {{ item.name }}
              </h3>
              <span
                v-if="item.is_mandatory"
                class="inline-block text-[10px] font-bold uppercase tracking-wider text-accent mb-3"
              >
                {{ t("skk.card.mandatory") }}
              </span>
            </div>

            <!-- Level chips -->
            <div class="flex items-center justify-center gap-1.5 mt-3">
              <span
                v-for="lvl in skkLevels"
                :key="lvl"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                :class="statusMeta[statusOf(item.id, lvl)].class"
                :title="t(statusMeta[statusOf(item.id, lvl)].label)"
              >
                {{ t(`skk.levels.${lvl}`) }}
              </span>
            </div>
          </button>

          <div
            v-if="!filteredItems.length"
            class="col-span-full text-center py-16 text-muted-foreground"
          >
            {{ t("skk.empty") }}
          </div>
        </div>
      </div>
    </section>

    <!-- Detail dialog -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div class="flex items-start gap-4">
            <div class="relative w-20 h-20 shrink-0">
              <img
                :src="frameFor(activeItem!, activeLevel)"
                class="absolute inset-0 w-full h-full object-contain"
                alt=""
              />
              <img
                v-if="activeItem"
                :src="badgeIcon(activeItem)"
                class="absolute inset-0 w-full h-full object-contain p-4"
                :alt="activeItem.name"
              />
            </div>
            <div class="min-w-0">
              <DialogTitle class="font-display text-xl">
                {{ activeItem?.name }}
              </DialogTitle>
              <DialogDescription class="mt-1">
                {{ activeItem?.field }}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p class="text-sm text-muted-foreground leading-relaxed">
          {{ activeItem?.description }}
        </p>

        <!-- Level tabs -->
        <div
          class="inline-flex w-full p-1 rounded-xl border border-border bg-muted/40"
        >
          <button
            v-for="lvl in skkLevels"
            :key="lvl"
            class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize"
            :class="
              activeLevel === lvl
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="selectLevel(lvl)"
          >
            <Lock
              v-if="activeItem && isLevelLocked(activeItem.id, lvl)"
              class="w-3 h-3 text-amber-500"
            />
            {{ t(`skk.levels.${lvl}`) }}
          </button>
        </div>

        <!-- Requirements -->
        <div v-if="activeItem" class="space-y-3">
          <div
            class="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <span>{{ t("skk.dialog.requirements") }}</span>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border normal-case"
              :class="statusMeta[statusOf(activeItem.id, activeLevel)].class"
            >
              <component
                :is="statusMeta[statusOf(activeItem.id, activeLevel)].icon"
                class="w-3 h-3"
              />
              {{ t(statusMeta[statusOf(activeItem.id, activeLevel)].label) }}
            </span>
          </div>
          <ul class="space-y-2">
            <li
              v-for="(req, idx) in activeItem.levels[activeLevel].requirements"
              :key="idx"
              class="flex gap-3 text-sm text-foreground/90 leading-relaxed"
            >
              <span
                class="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5"
              >
                {{ idx + 1 }}
              </span>
              {{ req }}
            </li>
          </ul>

          <div
            v-if="progressMap.get(`${activeItem.id}:${activeLevel}`)?.admin_notes"
            class="text-xs rounded-lg bg-muted/60 border border-border p-3"
          >
            <span class="font-semibold text-foreground"
              >{{ t("skk.dialog.examiner_notes") }}:</span
            >
            {{ progressMap.get(`${activeItem.id}:${activeLevel}`).admin_notes }}
          </div>
        </div>

        <!-- Submit section -->
        <form
          v-if="profile"
          class="space-y-4 pt-2 border-t border-border"
          @submit.prevent="handleSubmit"
        >
          <div
            v-if="activeItem && isLevelLocked(activeItem.id, activeLevel)"
            class="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400"
          >
            <Lock class="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold">{{ t("skk.lock.title") }}</p>
              <p class="text-xs mt-1 leading-relaxed">
                {{ lockReason(activeItem.id, activeLevel) }}
              </p>
            </div>
          </div>

          <div class="space-y-2 pt-4">
            <Label for="skk-notes">{{ t("skk.dialog.notes") }}</Label>
            <Textarea
              id="skk-notes"
              v-model="notes"
              :placeholder="t('skk.dialog.notes_placeholder')"
              class="h-[100px] resize-none"
            />
          </div>
          <div class="space-y-2">
            <Label>{{ t("skk.dialog.evidence") }}</Label>
            <MultiImageUploader
              v-model="evidencePhotos"
              v-model:loading="uploading"
              :max-photos="5"
            />
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <Button type="submit" :disabled="!canSubmit">
              <Loader2
                v-if="submitting || uploading"
                class="w-4 h-4 mr-2 animate-spin"
              />
              <Lock
                v-else-if="activeItem && isLevelLocked(activeItem.id, activeLevel)"
                class="w-4 h-4 mr-2"
              />
              <Send v-else class="w-4 h-4 mr-2" />
              {{ submitting ? t("skk.dialog.sending") : t("skk.dialog.submit") }}
            </Button>
            <span
              v-if="activeItem && isLevelLocked(activeItem.id, activeLevel)"
              class="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"
            >
              <Lock class="w-3 h-3" />
              {{ t("skk.lock.badge") }}
            </span>
          </div>

          <!-- Evidence gallery -->
          <div
            v-if="progressMap.get(`${activeItem?.id}:${activeLevel}`)?.evidence_photos?.length"
            class="space-y-2 pt-2"
          >
            <Label>{{ t("skk.dialog.evidence_uploaded") }}</Label>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <a
                v-for="url in progressMap.get(`${activeItem?.id}:${activeLevel}`)
                  .evidence_photos"
                :key="url"
                :href="url"
                target="_blank"
                rel="noopener"
                class="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group"
              >
                <img
                  :src="url"
                  class="w-full h-full object-cover"
                  alt="Bukti foto"
                />
                <span
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <ExternalLink class="w-4 h-4" />
                </span>
              </a>
            </div>
          </div>
        </form>

        <div
          v-else
          class="pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground"
        >
          <LogIn class="w-4 h-4" />
          <NuxtLink
            :to="localePath('/auth/login')"
            class="font-semibold text-primary hover:underline"
          >
            {{ t("skk.card.login_prompt") }}
          </NuxtLink>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>