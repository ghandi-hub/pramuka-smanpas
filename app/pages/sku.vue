<script setup lang="ts">
definePageMeta({ middleware: "member" });

import { computed, onMounted, ref, watch } from "vue";
import { useI18n, useLocalePath, useRoute } from "#imports";
import {
  CheckCircle2,
  Clock,
  FileWarning,
  CircleDashed,
  Send,
  Loader2,
  ExternalLink,
  Lock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
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
import {
  SKU_RELIGIONS,
  POINT1_SUBPOINTS,
  getPoint1SubPointId,
  getPoint1SubPointIds,
  normalizeReligion,
  type ReligionKey,
  type SkuLevelKey,
} from "~~/shared/skuSubpoints";

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
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
const selectedReligion = computed<ReligionKey>(() =>
  normalizeReligion(profile.value?.religion || "islam"),
);

const { data: skuData, pending: loading, refresh } = await useAsyncData(
  () => `sku-data-${level.value}`,
  async () => {
    const [fetchedItems, fetchedProgress, allBantara] = await Promise.all([
      fetchItems(level.value),
      fetchProgress(),
      fetchItems("bantara"),
    ]);
    return {
      items: fetchedItems || [],
      progress: fetchedProgress || [],
      bantaraItems: allBantara || [],
    };
  },
  {
    watch: [level],
  },
);

const items = computed<SkuItem[]>(() => skuData.value?.items ?? []);
const progress = computed<any[]>(() => skuData.value?.progress ?? []);
const bantaraItems = computed<SkuItem[]>(() => skuData.value?.bantaraItems ?? []);
const submitting = ref(false);

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);

// Modal state
interface ActiveExamTarget {
  id: string;
  point_id: string;
  point_number: number;
  label: string;
  title: string;
  description: string;
  isSubPoint?: boolean;
}

const dialogOpen = ref(false);
const activeTarget = ref<ActiveExamTarget | null>(null);
const notes = ref("");
const evidencePhotos = ref<string[]>([]);
const uploading = ref(false);

const progressMap = computed(() => {
  const map = new Map<string, any>();
  for (const p of progress.value) {
    if (p.point_id) map.set(String(p.point_id), p);
    if (p.sku_item_id) map.set(String(p.sku_item_id), p);
  }
  return map;
});

const isVerified = (id: unknown): boolean =>
  progressMap.value.get(String(id))?.status === "verified";

// Sub-butir Poin 1 untuk tingkatan dan agama terpilih
const currentPoint1SubPoints = computed(() => {
  const lvl = level.value as SkuLevelKey;
  return POINT1_SUBPOINTS[lvl]?.[selectedReligion.value] || [];
});

// Hitung kelulusan Poin 1 Bantara sesuai agama yang dianut user
const isPoint1BantaraVerified = computed(() => {
  if (isVerified("bantara-1")) return true;
  const ids = getPoint1SubPointIds("bantara", selectedReligion.value);
  return ids.length > 0 && ids.every((id) => isVerified(id));
});

// Hitung sisa butir Bantara yang belum lulus
const bantaraRemaining = computed(() => {
  const nonP1 = bantaraItems.value.filter(
    (i) => i.point_number !== 1 && !isVerified(i.id),
  ).length;
  const p1Remaining = isPoint1BantaraVerified.value ? 0 : 1;
  return nonP1 + p1Remaining;
});

// Laksana terkunci jika ada >= 3 butir Bantara yang belum verified
const laksanaLocked = computed(
  () => level.value === "laksana" && bantaraRemaining.value >= 3,
);

const filteredItems = computed(() => {
  if (activeCategory.value === "all") return items.value;
  return items.value.filter((i) => i.category === activeCategory.value);
});

const totalItems = computed(() => filteredItems.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value) || 1);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredItems.value.slice(start, start + pageSize.value);
});

// Hitung total butir yang sudah verified untuk level aktif
const verifiedCount = computed(() => {
  let count = 0;
  for (const item of items.value) {
    if (item.point_number === 1) {
      const ids = getPoint1SubPointIds(
        level.value as SkuLevelKey,
        selectedReligion.value,
      );
      if (
        isVerified(item.id) ||
        (ids.length > 0 && ids.every((id) => isVerified(id)))
      ) {
        count++;
      }
    } else if (isVerified(item.id)) {
      count++;
    }
  }
  return count;
});

const totalCount = computed(() => items.value.length);
const percentage = computed(() =>
  totalCount.value
    ? Math.round((verifiedCount.value / totalCount.value) * 100)
    : 0,
);

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

const getStatusOfId = (id: string): ProgressStatus | "none" => {
  return progressMap.value.get(id)?.status ?? "none";
};

// Hitung status agregat Poin 1 untuk agama terpilih
const getPoint1OverallStatus = (): ProgressStatus | "none" => {
  const ids = getPoint1SubPointIds(
    level.value as SkuLevelKey,
    selectedReligion.value,
  );
  if (!ids.length) return "none";

  const statuses = ids.map((id) => getStatusOfId(id));
  if (statuses.every((s) => s === "verified")) return "verified";
  if (statuses.includes("pending")) return "pending";
  if (statuses.includes("rejected")) return "rejected";
  if (isVerified(`${level.value}-1`)) return "verified";
  return "none";
};

const getPoint1VerifiedCount = (): { verified: number; total: number } => {
  const ids = getPoint1SubPointIds(
    level.value as SkuLevelKey,
    selectedReligion.value,
  );
  const verified = ids.filter((id) => isVerified(id)).length;
  return { verified, total: ids.length };
};

const load = async () => {
  await refresh();
};

watch(level, () => {
  activeCategory.value = "all";
  currentPage.value = 1;
});

watch(activeCategory, () => {
  currentPage.value = 1;
});

// Buka modal untuk butir biasa (Poin 2 - 23)
const openSubmitItem = (item: SkuItem) => {
  activeTarget.value = {
    id: String(item.id),
    point_id: String(item.id),
    point_number: item.point_number,
    label: String(item.point_number),
    title: item.title,
    description: item.description,
    isSubPoint: false,
  };
  const existing = progressMap.value.get(String(item.id));
  notes.value = existing?.notes ?? "";
  evidencePhotos.value = Array.isArray(existing?.evidence_photos)
    ? existing.evidence_photos.filter((p: unknown) => typeof p === "string")
    : existing?.evidence_url
      ? [existing.evidence_url]
      : [];
  dialogOpen.value = true;
};

// Buka modal untuk sub-butir Poin 1 (1.1, 1.2, dst)
const openSubmitSubPoint = (subIdx: number) => {
  const lvl = level.value as SkuLevelKey;
  const sub = currentPoint1SubPoints.value[subIdx];
  if (!sub) return;

  const pointId = getPoint1SubPointId(lvl, selectedReligion.value, subIdx);
  const label = `1.${subIdx + 1}`;

  activeTarget.value = {
    id: pointId,
    point_id: pointId,
    point_number: 1,
    label,
    title: sub.title,
    description: sub.description,
    isSubPoint: true,
  };

  const existing = progressMap.value.get(pointId);
  notes.value = existing?.notes ?? "";
  evidencePhotos.value = Array.isArray(existing?.evidence_photos)
    ? existing.evidence_photos.filter((p: unknown) => typeof p === "string")
    : existing?.evidence_url
      ? [existing.evidence_url]
      : [];
  dialogOpen.value = true;
};

const canSubmit = computed(() => {
  if (!activeTarget.value) return false;
  if (level.value === "laksana" && laksanaLocked.value) return false;
  if (!evidencePhotos.value.length) return false;
  return !submitting.value && !uploading.value;
});

const handleSubmit = async () => {
  if (!activeTarget.value) return;
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
      point_id: activeTarget.value.point_id,
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
    toast.error(e?.data?.statusMessage || e?.message || "Gagal mengajukan ujian");
  } finally {
    submitting.value = false;
  }
};

useHead({ title: () => t("seo.sku.title") });
useSeoMeta({
  description: () => t("seo.sku.description"),
});

onMounted(() => {
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
    <header class="bg-background py-16 md:py-20 border-b border-border">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
        <p
          class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4"
        >
          <BookOpen class="w-4 h-4" />
          {{ t("sku.header.badge") }}
        </p>
        <h1
          class="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4"
        >
          {{ t("sku.header.title") }}
        </h1>
        <p class="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {{ t("sku.header.description") }}
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 py-12">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <!-- Level Switcher -->
        <div class="flex justify-center mb-8">
          <div
            class="inline-flex p-1.5 rounded-2xl bg-background border border-border shadow-sm"
          >
            <button
              v-for="lvl in levels"
              :key="lvl"
              class="px-8 py-3 rounded-xl font-semibold text-sm transition-all capitalize"
              :class="
                level === lvl
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="level = lvl"
            >
              Penegak {{ lvl }}
            </button>
          </div>
        </div>

        <!-- Laksana Lock Warning Banner -->
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

        <!-- Progress Card -->
        <div
          class="bg-background border border-border rounded-2xl p-6 mb-10 shadow-sm"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
              >
                <Award class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-display font-bold text-lg text-foreground capitalize">
                  Buku Syarat Kecakapan Penegak {{ level }}
                </h3>
                <p class="text-xs text-muted-foreground">
                  Format tabel logbook verifikasi uji kecakapan
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-muted-foreground">
                <span class="text-primary text-base font-bold">{{ verifiedCount }}</span> / {{ totalCount }} Butir Lulus
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

        <!-- Filter Categories -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categories"
              :key="cat.value"
              class="px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
              :class="
                activeCategory === cat.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
              "
              @click="activeCategory = cat.value"
            >
              {{ t(cat.key) }}
            </button>
          </div>

          <!-- Page size info -->
          <div class="text-xs text-muted-foreground font-medium">
            Total {{ totalItems }} butir syarat
          </div>
        </div>

        <!-- TABEL BUKU SKU -->
        <div class="bg-background border border-border rounded-2xl shadow-sm overflow-hidden mb-6">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-muted/50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th scope="col" class="py-4 px-4 w-16 text-center">No</th>
                  <th scope="col" class="py-4 px-6 min-w-[320px]">Poin Syarat Kecakapan</th>
                  <th scope="col" class="py-4 px-4 w-36 text-center">Aksi</th>
                  <th scope="col" class="py-4 px-4 w-36 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border text-sm">
                <!-- Loading State -->
                <tr v-if="loading">
                  <td colspan="4" class="py-16 text-center">
                    <Loader2 class="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    <p class="text-sm text-muted-foreground">Memuat buku SKU...</p>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-else-if="!paginatedItems.length">
                  <td colspan="4" class="py-12 text-center text-muted-foreground">
                    {{ t("sku.empty") }}
                  </td>
                </tr>

                <!-- Table Rows -->
                <template v-else v-for="item in paginatedItems" :key="item.id">
                  <!-- ============================================== -->
                  <!-- KHUSUS POIN 1: BUTIR AGAMA DENGAN SUB-BUTIR   -->
                  <!-- ============================================== -->
                  <template v-if="item.point_number === 1">
                    <!-- Baris Induk Poin 1 -->
                    <tr class="bg-muted/20 font-medium">
                      <td class="py-4 px-4 text-center font-bold text-base align-top">
                        1
                      </td>
                      <td colspan="3" class="py-4 px-6">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div>
                            <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent mb-1">
                              {{ item.category }}
                            </span>
                            <h4 class="font-bold text-base text-foreground">
                              {{ item.title }}
                            </h4>
                            <p class="text-xs text-muted-foreground mt-0.5">
                              {{ item.description }}
                            </p>
                          </div>
                          <!-- Ringkasan Kelulusan Poin 1 -->
                          <div class="shrink-0 flex items-center gap-2">
                            <span class="text-xs font-semibold px-2.5 py-1 rounded-lg border" :class="statusMeta[getPoint1OverallStatus()].class">
                              {{ getPoint1VerifiedCount().verified }}/{{ getPoint1VerifiedCount().total }} Sub-butir
                            </span>
                          </div>
                        </div>

                        <!-- Keterangan Agama Berdasarkan Profil Anggota -->
                        <div class="pt-2 border-t border-border/60">
                          <div class="flex flex-wrap items-center justify-between gap-2">
                            <div class="flex items-center gap-2">
                              <span class="text-xs font-semibold text-muted-foreground">
                                Ajaran Agama:
                              </span>
                              <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                {{ SKU_RELIGIONS.find((r) => r.key === selectedReligion)?.label }}
                              </span>
                              <span class="text-[11px] text-muted-foreground hidden sm:inline">
                                (Butir ujian disesuaikan otomatis dengan agama yang dianut)
                              </span>
                            </div>
                            <NuxtLink
                              :to="localePath('/admin/profile')"
                              class="text-[11px] font-semibold text-primary hover:underline"
                            >
                              Ubah di Profil &rarr;
                            </NuxtLink>
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- Sub-baris Butir Agama (1.1, 1.2, 1.3, ...) -->
                    <tr
                      v-for="(sub, subIdx) in currentPoint1SubPoints"
                      :key="`${selectedReligion}-${subIdx}`"
                      class="hover:bg-muted/30 transition-colors border-t border-border/50 bg-background"
                    >
                      <!-- Sub Number -->
                      <td class="py-3 px-4 text-center text-xs font-semibold text-muted-foreground bg-muted/10">
                        1.{{ subIdx + 1 }}
                      </td>
                      <!-- Sub Content -->
                      <td class="py-3 px-6">
                        <div class="font-semibold text-foreground text-sm">
                          {{ sub.title }}
                        </div>
                        <div class="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {{ sub.description }}
                        </div>
                      </td>
                      <!-- Sub Action -->
                      <td class="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          class="rounded-full h-8 px-3 text-xs"
                          :disabled="level === 'laksana' && laksanaLocked"
                          :title="
                            level === 'laksana' && laksanaLocked
                              ? t('sku.lock.tooltip')
                              : undefined
                          "
                          @click="openSubmitSubPoint(subIdx)"
                        >
                          <Lock
                            v-if="level === 'laksana' && laksanaLocked"
                            class="w-3.5 h-3.5 mr-1"
                          />
                          <Send v-else class="w-3.5 h-3.5 mr-1 text-primary" />
                          <span>
                            {{
                              getStatusOfId(getPoint1SubPointId(level, selectedReligion, subIdx)) === 'none'
                                ? 'Uji'
                                : 'Ubah'
                            }}
                          </span>
                        </Button>
                      </td>
                      <!-- Sub Status -->
                      <td class="py-3 px-4 text-center">
                        <span
                          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                          :class="statusMeta[getStatusOfId(getPoint1SubPointId(level, selectedReligion, subIdx))].class"
                        >
                          <component
                            :is="statusMeta[getStatusOfId(getPoint1SubPointId(level, selectedReligion, subIdx))].icon"
                            class="w-3.5 h-3.5"
                          />
                          <span>
                            {{ t(statusMeta[getStatusOfId(getPoint1SubPointId(level, selectedReligion, subIdx))].label) }}
                          </span>
                        </span>
                      </td>
                    </tr>
                  </template>

                  <!-- ============================================== -->
                  <!-- POIN 2 S/D 23: BUTIR REGULER                   -->
                  <!-- ============================================== -->
                  <tr v-else class="hover:bg-muted/20 transition-colors">
                    <!-- Column: No -->
                    <td class="py-4 px-4 text-center font-bold text-base text-foreground align-top">
                      {{ item.point_number }}
                    </td>

                    <!-- Column: Poin Deskripsi -->
                    <td class="py-4 px-6 align-top">
                      <div class="mb-1">
                        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                          {{ item.category }}
                        </span>
                      </div>
                      <h4 class="font-bold text-sm text-foreground mb-1 leading-snug">
                        {{ item.title }}
                      </h4>
                      <p class="text-xs text-muted-foreground leading-relaxed">
                        {{ item.description }}
                      </p>
                    </td>

                    <!-- Column: Aksi -->
                    <td class="py-4 px-4 text-center align-middle">
                      <Button
                        size="sm"
                        variant="outline"
                        class="rounded-full h-8 px-3 text-xs w-full sm:w-auto"
                        :disabled="level === 'laksana' && laksanaLocked"
                        :title="
                          level === 'laksana' && laksanaLocked
                            ? t('sku.lock.tooltip')
                            : undefined
                        "
                        @click="openSubmitItem(item)"
                      >
                        <Lock
                          v-if="level === 'laksana' && laksanaLocked"
                          class="w-3.5 h-3.5 mr-1"
                        />
                        <Send v-else class="w-3.5 h-3.5 mr-1 text-primary" />
                        <span>
                          {{
                            level === 'laksana' && laksanaLocked
                              ? t('sku.lock.badge')
                              : isVerified(item.id)
                                ? 'Ubah'
                                : 'Ajukan'
                          }}
                        </span>
                      </Button>
                    </td>

                    <!-- Column: Status -->
                    <td class="py-4 px-4 text-center align-middle">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                        :class="statusMeta[getStatusOfId(item.id)].class"
                      >
                        <component
                          :is="statusMeta[getStatusOfId(item.id)].icon"
                          class="w-3.5 h-3.5"
                        />
                        <span>{{ t(statusMeta[getStatusOfId(item.id)].label) }}</span>
                      </span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div
            v-if="totalPages > 1"
            class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground"
          >
            <div>
              Menampilkan
              <span class="font-semibold text-foreground">
                {{ (currentPage - 1) * pageSize + 1 }}
              </span>
              -
              <span class="font-semibold text-foreground">
                {{ Math.min(currentPage * pageSize, totalItems) }}
              </span>
              dari
              <span class="font-semibold text-foreground">{{ totalItems }}</span>
              butir
            </div>

            <!-- Page Buttons -->
            <div class="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                class="h-8 px-2.5 text-xs"
                :disabled="currentPage <= 1"
                @click="currentPage--"
              >
                <ChevronLeft class="w-4 h-4 mr-1" />
                Sebelumnya
              </Button>

              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                class="h-8 w-8 rounded-lg font-semibold text-xs transition-colors"
                :class="
                  page === currentPage
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground'
                "
                @click="currentPage = page"
              >
                {{ page }}
              </button>

              <Button
                variant="outline"
                size="sm"
                class="h-8 px-2.5 text-xs"
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
              >
                Berikutnya
                <ChevronRight class="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Form Verifikasi Butir / Sub-butir SKU -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <div class="flex items-center gap-2 mb-1">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary"
            >
              Penegak {{ level }}
            </span>
            <span class="text-xs font-semibold text-muted-foreground">
              Nomor {{ activeTarget?.label }}
            </span>
          </div>
          <DialogTitle class="text-lg leading-snug">
            {{ activeTarget?.title }}
          </DialogTitle>
          <DialogDescription class="text-xs pt-1 leading-relaxed">
            {{ activeTarget?.description }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4 pt-2" @submit.prevent="handleSubmit">
          <!-- Catatan / Keterangan -->
          <div class="space-y-2">
            <Label for="sku-notes">{{ t("sku.dialog.notes") }}</Label>
            <Textarea
              id="sku-notes"
              v-model="notes"
              :placeholder="t('sku.dialog.notes_placeholder')"
              rows="3"
            />
          </div>

          <!-- Upload Foto Bukti (Mandatory & Multiple) -->
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
