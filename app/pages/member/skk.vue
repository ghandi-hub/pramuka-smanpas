<script setup lang="ts">
definePageMeta({ layout: "member", middleware: "member" });

import { computed, ref } from "vue";
import { useAsyncData, useHead, useI18n, useSeoMeta } from "#imports";
import {
  CheckCircle2,
  Clock,
  FileWarning,
  CircleDashed,
  Send,
  Loader2,
  ExternalLink,
  Star,
  Lock,
  AlertTriangle,
  Award,
} from "lucide-vue-next";
import Button from "~/components/ui/button/Button.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  type SkkProgress,
} from "~/services/skkService";

const { t } = useI18n();
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

const colorHex: Record<string, string> = {
  kuning: "#eab308",
  merah: "#dc2626",
  putih: "#f1f5f9",
  hijau: "#16a34a",
  biru: "#2563eb",
};

const activeField = ref<SkkColorCode | "all">("all");

const { data: skkData, pending: loading, refresh } = await useAsyncData(
  "member-skk-data",
  async () => {
    const [fetchedItems, fetchedProgress] = await Promise.all([
      fetchItems(),
      fetchProgress(),
    ]);
    return {
      items: fetchedItems || [],
      progress: fetchedProgress || [],
    };
  },
);

const items = computed<SkkItem[]>(() => skkData.value?.items ?? []);
const progress = computed<SkkProgress[]>(() => skkData.value?.progress ?? []);

const submitting = ref(false);
const uploading = ref(false);

const dialogOpen = ref(false);
const activeItem = ref<SkkItem | null>(null);
const activeLevel = ref<SkkLevel>("purwa");
const notes = ref("");
const evidencePhotos = ref<string[]>([]);

const skkLevels: SkkLevel[] = ["purwa", "madya", "utama"];
const levelIndex: Record<SkkLevel, number> = { purwa: 0, madya: 1, utama: 2 };

const progressMap = computed(() => {
  const map = new Map<string, any>();
  for (const p of progress.value) {
    const skkId = p.skk_id || (p as any).skk_item_id;
    const lvl = p.level || (p as any).level_name;
    if (skkId && lvl) {
      map.set(`${skkId}:${lvl}`, p);
    }
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
  return idx > 0 ? skkLevels[idx - 1] ?? null : null;
};

// Tingkat terkunci jika tingkat sebelumnya pada TKK sama belum verified
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

// Progress Summary
const totalTargetCount = computed(() => items.value.length * 3);
const verifiedCount = computed(() => {
  return progress.value.filter((p) => p.status === "verified").length;
});
const percentage = computed(() => {
  if (!totalTargetCount.value) return 0;
  return Math.min(100, Math.round((verifiedCount.value / totalTargetCount.value) * 100));
});

// Level Status Meta for Compact Badges
const getLevelStatusInfo = (skkId: string, lvl: SkkLevel) => {
  const locked = isLevelLocked(skkId, lvl);
  if (locked) {
    return {
      label: t("skk.status_short.locked"),
      fullLabel: t("skk.lock.badge"),
      class: "bg-muted/40 text-muted-foreground/80 border-border border-dashed",
      icon: Lock,
      iconClass: "text-amber-500",
      isLocked: true,
    };
  }

  const st = statusOf(skkId, lvl);
  switch (st) {
    case "verified":
      return {
        label: t("skk.status_short.verified"),
        fullLabel: t("skk.status.verified"),
        class: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold",
        icon: CheckCircle2,
        iconClass: "text-emerald-600 dark:text-emerald-400",
        isLocked: false,
      };
    case "pending":
      return {
        label: t("skk.status_short.pending"),
        fullLabel: t("skk.status.pending"),
        class: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold",
        icon: Clock,
        iconClass: "text-amber-600 dark:text-amber-400",
        isLocked: false,
      };
    case "rejected":
      return {
        label: t("skk.status_short.rejected"),
        fullLabel: t("skk.status.rejected"),
        class: "bg-destructive/10 text-destructive border-destructive/30 font-semibold",
        icon: FileWarning,
        iconClass: "text-destructive",
        isLocked: false,
      };
    default:
      return {
        label: t("skk.status_short.none"),
        fullLabel: t("skk.status.not_tested"),
        class: "bg-muted/50 text-muted-foreground border-border",
        icon: CircleDashed,
        iconClass: "text-muted-foreground/60",
        isLocked: false,
      };
  }
};

const getFieldBadgeClass = (code: string): string => {
  switch (code) {
    case "kuning":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
    case "merah":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30";
    case "putih":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-200 border-slate-500/30";
    case "hijau":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "biru":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const badgeIcon = (item: SkkItem): string =>
  item.badge_icon || `/images/skk/${item.icon_key}.svg`;

const frameFor = (item: SkkItem, level: SkkLevel): string =>
  `/images/skk/${level}-${item.color_code}.svg`;

const openDetail = (item: SkkItem, preferredLevel?: SkkLevel) => {
  activeItem.value = item;
  let targetLevel: SkkLevel = "purwa";
  if (preferredLevel) {
    targetLevel = preferredLevel;
  } else if (
    statusOf(item.id, "purwa") === "verified" &&
    statusOf(item.id, "madya") !== "verified"
  ) {
    targetLevel = "madya";
  } else if (
    statusOf(item.id, "madya") === "verified" &&
    statusOf(item.id, "utama") !== "verified"
  ) {
    targetLevel = "utama";
  }
  selectLevel(targetLevel);
  dialogOpen.value = true;
};

const selectLevel = (lvl: SkkLevel) => {
  activeLevel.value = lvl;
  const existing = progressMap.value.get(`${activeItem.value?.id}:${lvl}`);
  notes.value = existing?.notes ?? "";
  const existingPhotos = Array.isArray(existing?.evidence_photos)
    ? existing.evidence_photos.filter((p: unknown) => typeof p === "string" && p)
    : existing?.evidence_url
      ? [existing.evidence_url]
      : [];
  evidencePhotos.value = [...existingPhotos];
};

const currentProgress = computed(() => {
  if (!activeItem.value) return null;
  return progressMap.value.get(`${activeItem.value.id}:${activeLevel.value}`) || null;
});

const activeRequirements = computed<string[]>(() => {
  if (!activeItem.value) return [];
  const lvl = activeLevel.value;
  if (activeItem.value.levels?.[lvl]?.requirements?.length) {
    return activeItem.value.levels[lvl].requirements;
  }
  const anyItem = activeItem.value as any;
  if (anyItem.requirements?.[lvl]?.length) {
    return anyItem.requirements[lvl];
  }
  return [];
});

const uploadedPhotos = computed<string[]>(() => {
  const p = currentProgress.value;
  if (!p) return [];
  if (Array.isArray(p.evidence_photos) && p.evidence_photos.length) {
    return p.evidence_photos.filter((url: unknown) => typeof url === "string" && url.trim().length > 0);
  }
  if (p.evidence_url && typeof p.evidence_url === "string" && p.evidence_url.trim().length > 0) {
    return [p.evidence_url];
  }
  return [];
});

const isCurrentLocked = computed(() => {
  if (!activeItem.value) return false;
  return isLevelLocked(activeItem.value.id, activeLevel.value);
});

const canSubmit = computed(() => {
  if (!activeItem.value) return false;
  if (isCurrentLocked.value) return false;
  if (!evidencePhotos.value.length) return false;
  return !submitting.value && !uploading.value;
});

const handleSubmit = async () => {
  if (!activeItem.value) return;
  if (isCurrentLocked.value) {
    const { toast } = await import("vue-sonner");
    toast.error(lockReason(activeItem.value.id, activeLevel.value));
    return;
  }
  if (!evidencePhotos.value.length) {
    const { toast } = await import("vue-sonner");
    toast.error(t("skk.dialog.evidence_required"));
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
    await refresh();
    selectLevel(activeLevel.value);
  } catch (e: any) {
    const { toast } = await import("vue-sonner");
    toast.error(e?.data?.statusMessage || e?.message || t("skk.dialog.error"));
  } finally {
    submitting.value = false;
  }
};

useHead({
  title: () => t("skk.header.title"),
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});
useSeoMeta({
  description: () => t("seo.skk.description"),
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Page Heading -->
    <div class="relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-sm">
      <div
        class="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-10 blur-2xl pointer-events-none"
        style="background: conic-gradient(#eab308, #dc2626, #f1f5f9, #16a34a, #2563eb)"
      />
      <div class="relative">
        <p class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
          <Star class="w-4 h-4" />
          {{ t("skk.header.badge") }}
        </p>
        <h1 class="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {{ t("skk.header.title") }}
        </h1>
        <p class="text-muted-foreground max-w-3xl leading-relaxed">
          {{ t("skk.header.description") }}
        </p>

        <!-- Color legends -->
        <div class="flex flex-wrap gap-2.5 mt-5">
          <div
            v-for="f in fields.filter((x) => x.value !== 'all')"
            :key="f.value"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/80 text-xs font-medium text-foreground"
          >
            <span
              class="w-3 h-3 rounded-full border border-black/10 shrink-0"
              :style="{ backgroundColor: f.color }"
            />
            {{ t(f.labelKey) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Card -->
    <div class="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Award class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-display font-bold text-lg text-foreground">
              {{ t("skk.progress_card.title") }}
            </h3>
            <p class="text-xs text-muted-foreground">
              {{ t("skk.progress_card.subtitle") }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-muted-foreground">
            <span class="text-primary text-base font-bold">{{ verifiedCount }}</span> / {{ totalTargetCount }} Tingkat Lulus
          </span>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
            {{ percentage }}%
          </span>
        </div>
      </div>
      <!-- Progress Bar -->
      <div class="h-2.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          class="h-full bg-primary rounded-full transition-all duration-500"
          :style="{ width: `${percentage}%` }"
        />
      </div>
    </div>

    <!-- Field filter tabs -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in fields"
          :key="f.value"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
          :class="
            activeField === f.value
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
          "
          @click="activeField = f.value"
        >
          <span
            v-if="f.value !== 'all'"
            class="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
            :style="{ backgroundColor: f.color }"
          />
          {{ t(f.labelKey) }}
        </button>
      </div>

      <div class="text-xs text-muted-foreground font-medium">
        {{ filteredItems.length }} {{ t("skk.table.items_count") }}
      </div>
    </div>

    <!-- TABEL RINGKAS KATALOG TKK -->
    <div class="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-muted/50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th scope="col" class="py-4 px-3 w-14 text-center whitespace-nowrap">
                {{ t("skk.table.no") }}
              </th>
              <th scope="col" class="py-4 px-4 min-w-[260px]">
                {{ t("skk.table.tkk") }}
              </th>
              <th scope="col" class="py-4 px-4 min-w-[170px]">
                {{ t("skk.table.field") }}
              </th>
              <th scope="col" class="py-4 px-4 min-w-[320px]">
                {{ t("skk.table.level_progress") }}
              </th>
              <th scope="col" class="py-4 px-4 w-28 text-center whitespace-nowrap">
                {{ t("skk.table.action") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-sm">
            <!-- Loading State -->
            <tr v-if="loading && !items.length">
              <td colspan="5" class="py-16 text-center">
                <Loader2 class="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p class="text-sm text-muted-foreground">{{ t("skk.table.loading") }}</p>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="!filteredItems.length">
              <td colspan="5" class="py-16 text-center text-muted-foreground">
                {{ t("skk.empty") }}
              </td>
            </tr>

            <!-- Table Rows -->
            <tr
              v-for="(item, index) in filteredItems"
              :key="item.id"
              class="hover:bg-muted/30 transition-colors group"
            >
              <!-- 1. No -->
              <td class="py-4 px-3 text-center text-xs font-semibold text-muted-foreground w-14 align-middle">
                {{ index + 1 }}
              </td>

              <!-- 2. TKK -->
              <td class="py-4 px-4 align-middle">
                <div class="flex items-center gap-3">
                  <div class="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-muted/40 border border-border p-1 flex items-center justify-center">
                    <img
                      :src="frameFor(item, 'purwa')"
                      class="absolute inset-0 w-full h-full object-contain"
                      alt=""
                    />
                    <img
                      :src="badgeIcon(item)"
                      class="absolute inset-0 w-full h-full object-contain p-1.5"
                      :alt="item.name"
                      loading="lazy"
                    />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {{ item.name }}
                      </span>
                      <span
                        v-if="item.is_mandatory"
                        class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30"
                      >
                        {{ t("skk.card.mandatory") }}
                      </span>
                    </div>
                    <p v-if="item.description" class="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- 3. Bidang -->
              <td class="py-4 px-4 align-middle whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  :class="getFieldBadgeClass(item.color_code)"
                >
                  <span
                    class="w-2 h-2 rounded-full border border-black/10 shrink-0"
                    :style="{ backgroundColor: colorHex[item.color_code] }"
                  />
                  {{ t(`skk.fields_badge.${item.color_code}`) }}
                </span>
              </td>

              <!-- 4. Pencapaian Tingkat -->
              <td class="py-4 px-4 align-middle">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    v-for="lvl in skkLevels"
                    :key="lvl"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] border transition-colors cursor-pointer select-none"
                    :class="getLevelStatusInfo(item.id, lvl).class"
                    :title="`${t(`skk.levels.${lvl}`)}: ${getLevelStatusInfo(item.id, lvl).fullLabel}`"
                    @click="openDetail(item, lvl)"
                  >
                    <component
                      :is="getLevelStatusInfo(item.id, lvl).icon"
                      class="w-3 h-3 shrink-0"
                      :class="getLevelStatusInfo(item.id, lvl).iconClass"
                    />
                    <span class="font-semibold capitalize text-foreground/85">
                      {{ t(`skk.levels.${lvl}`) }}:
                    </span>
                    <span>{{ getLevelStatusInfo(item.id, lvl).label }}</span>
                  </span>
                </div>
              </td>

              <!-- 5. Aksi -->
              <td class="py-4 px-4 text-center align-middle whitespace-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  class="h-8 px-3 text-xs font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-none"
                  @click="openDetail(item)"
                >
                  {{ t("skk.table.detail_action") }}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DETAIL & FORM PENGAJUAN UJIAN DIALOG -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <!-- Dialog Header -->
        <DialogHeader class="border-b border-border pb-4">
          <div class="flex items-start gap-4">
            <!-- Ikon TKK Besar (64x64) -->
            <div class="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-muted/40 border border-border p-2 flex items-center justify-center">
              <img
                v-if="activeItem"
                :src="frameFor(activeItem, activeLevel)"
                class="absolute inset-0 w-full h-full object-contain p-1"
                alt=""
              />
              <img
                v-if="activeItem"
                :src="badgeIcon(activeItem)"
                class="absolute inset-0 w-full h-full object-contain p-3"
                :alt="activeItem.name"
              />
            </div>

            <!-- Nama TKK & Bidang -->
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  v-if="activeItem"
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  :class="getFieldBadgeClass(activeItem.color_code)"
                >
                  <span
                    class="w-2 h-2 rounded-full border border-black/10 shrink-0"
                    :style="{ backgroundColor: colorHex[activeItem.color_code] }"
                  />
                  {{ t(`skk.fields_badge.${activeItem.color_code}`) }}
                </span>
                <span
                  v-if="activeItem?.is_mandatory"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30"
                >
                  {{ t("skk.card.mandatory") }}
                </span>
              </div>

              <DialogTitle class="font-display text-xl sm:text-2xl font-bold text-foreground">
                {{ activeItem?.name }}
              </DialogTitle>
              <DialogDescription v-if="activeItem?.description" class="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                {{ activeItem.description }}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <!-- Tabs Pilihan Tingkatan (Purwa | Madya | Utama) -->
        <div class="inline-flex w-full p-1 rounded-xl border border-border bg-muted/40 gap-1">
          <button
            v-for="lvl in skkLevels"
            :key="lvl"
            type="button"
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
              class="w-3.5 h-3.5 text-amber-500 shrink-0"
            />
            <CheckCircle2
              v-else-if="activeItem && statusOf(activeItem.id, lvl) === 'verified'"
              class="w-3.5 h-3.5 text-emerald-500 shrink-0"
            />
            <span>{{ t(`skk.levels.${lvl}`) }}</span>
          </button>
        </div>

        <!-- Warning Banner jika Tingkatan Terkunci -->
        <div
          v-if="activeItem && isCurrentLocked"
          class="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400"
        >
          <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="font-semibold flex items-center gap-2">
              {{ t("skk.lock.title") }}
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                <Lock class="w-3 h-3" />
                {{ t("skk.lock.badge") }}
              </span>
            </p>
            <p class="text-xs leading-relaxed">
              {{ lockReason(activeItem.id, activeLevel) }}
            </p>
          </div>
        </div>

        <!-- Rincian Syarat Kecakapan Lengkap -->
        <div v-if="activeItem" class="space-y-3">
          <div class="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span class="flex items-center gap-1.5">
              <Award class="w-4 h-4 text-primary" />
              {{ t("skk.dialog.requirements") }} ({{ t(`skk.levels.${activeLevel}`) }})
            </span>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border normal-case"
              :class="getLevelStatusInfo(activeItem.id, activeLevel).class"
            >
              <component
                :is="getLevelStatusInfo(activeItem.id, activeLevel).icon"
                class="w-3 h-3"
                :class="getLevelStatusInfo(activeItem.id, activeLevel).iconClass"
              />
              {{ getLevelStatusInfo(activeItem.id, activeLevel).fullLabel }}
            </span>
          </div>

          <div class="rounded-xl border border-border bg-muted/20 p-4">
            <ul class="space-y-2.5">
              <li
                v-for="(req, idx) in activeRequirements"
                :key="idx"
                class="flex gap-3 text-sm text-foreground/90 leading-relaxed"
              >
                <span
                  class="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5"
                >
                  {{ idx + 1 }}
                </span>
                <span class="flex-1">{{ req }}</span>
              </li>
              <li v-if="!activeRequirements.length" class="text-xs text-muted-foreground italic">
                {{ t("skk.dialog.no_requirements") }}
              </li>
            </ul>
          </div>

          <!-- Catatan Penguji jika ada -->
          <div
            v-if="currentProgress?.admin_notes"
            class="text-xs rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-amber-800 dark:text-amber-300"
          >
            <span class="font-semibold">{{ t("skk.dialog.examiner_notes") }}:</span>
            <p class="mt-1 leading-relaxed">{{ currentProgress.admin_notes }}</p>
          </div>
        </div>

        <!-- Form Pengajuan Ujian Langsung di Modal -->
        <form
          v-if="profile"
          class="space-y-4 pt-4 border-t border-border"
          @submit.prevent="handleSubmit"
        >
          <!-- Catatan / Keterangan -->
          <div class="space-y-2">
            <Label for="skk-notes" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {{ t("skk.dialog.notes") }}
            </Label>
            <Textarea
              id="skk-notes"
              v-model="notes"
              :placeholder="t('skk.dialog.notes_placeholder')"
              :disabled="isCurrentLocked"
              class="h-24 resize-none"
            />
          </div>

          <!-- Upload Foto Bukti (Mandatory & Multiple) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {{ t("skk.dialog.evidence") }}
              </Label>
              <span class="text-[11px] text-muted-foreground">
                {{ evidencePhotos.length }}/5 foto
              </span>
            </div>
            <div :class="{ 'pointer-events-none opacity-50': isCurrentLocked }">
              <MultiImageUploader
                v-model="evidencePhotos"
                v-model:loading="uploading"
                :max-photos="5"
              />
            </div>
          </div>

          <!-- Tombol Ajukan -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div class="text-xs text-muted-foreground">
              <span v-if="!evidencePhotos.length" class="text-amber-600 dark:text-amber-400">
                * {{ t("skk.dialog.evidence_required") }}
              </span>
            </div>

            <Button
              type="submit"
              :disabled="!canSubmit"
              class="min-w-[140px]"
            >
              <Loader2
                v-if="submitting || uploading"
                class="w-4 h-4 mr-2 animate-spin"
              />
              <Lock
                v-else-if="isCurrentLocked"
                class="w-4 h-4 mr-2"
              />
              <Send v-else class="w-4 h-4 mr-2" />
              {{ submitting ? t("skk.dialog.sending") : t("skk.dialog.submit") }}
            </Button>
          </div>

          <!-- Galeri Preview Foto Bukti Terunggah (jika pending atau verified) -->
          <div
            v-if="uploadedPhotos.length && (currentProgress?.status === 'pending' || currentProgress?.status === 'verified')"
            class="space-y-2.5 pt-4 border-t border-border/80"
          >
            <div class="flex items-center justify-between">
              <Label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {{ t("skk.dialog.evidence_uploaded") }} ({{ uploadedPhotos.length }})
              </Label>
              <span
                v-if="currentProgress?.status === 'verified'"
                class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                {{ t("skk.dialog.evidence_verified_badge") }}
              </span>
              <span
                v-else-if="currentProgress?.status === 'pending'"
                class="text-[11px] font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1"
              >
                <Clock class="w-3.5 h-3.5" />
                {{ t("skk.dialog.evidence_pending_badge") }}
              </span>
            </div>

            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              <a
                v-for="(url, idx) in uploadedPhotos"
                :key="idx"
                :href="url"
                target="_blank"
                rel="noopener"
                class="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/40 hover:border-primary transition-all shadow-sm"
              >
                <img
                  :src="url"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
      </DialogContent>
    </Dialog>
  </div>
</template>
