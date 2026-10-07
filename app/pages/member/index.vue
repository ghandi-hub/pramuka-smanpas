<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n, useLocalePath } from "#imports";
import {
  BookOpen,
  Award,
  User as UserIcon,
  Layers,
  Sparkles,
  BadgeCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  CircleDashed,
} from "lucide-vue-next";
import Button from "~/components/ui/button/Button.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useSkuService, type SkuItem } from "~/services/skuService";
import {
  useSkkService,
  type SkkItem,
  type SkkLevel,
} from "~/services/skkService";
import {
  SKU_RELIGIONS,
  getPoint1SubPointIds,
  normalizeReligion,
  type ReligionKey,
  type SkuLevelKey,
} from "~~/shared/skuSubpoints";

definePageMeta({ layout: "member", middleware: "member" });

const { t } = useI18n();
const localePath = useLocalePath();
const { profile } = useAdminAuth();
const { fetchItems, fetchProgress } = useSkuService();
const { fetchItems: fetchSkkItems, fetchProgress: fetchSkkProgress } =
  useSkkService();

useHead({
  title: () => t("member.sidebar.dashboard"),
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { data, pending } = await useAsyncData("member-dashboard", async () => {
  const [bantaraItems, laksanaItems, skuProgress, skkItems, skkProgress] =
    await Promise.all([
      fetchItems("bantara"),
      fetchItems("laksana"),
      fetchProgress(),
      fetchSkkItems(),
      fetchSkkProgress(),
    ]);
  return { bantaraItems, laksanaItems, skuProgress, skkItems, skkProgress };
});

const bantaraItems = computed<SkuItem[]>(() => data.value?.bantaraItems ?? []);
const laksanaItems = computed<SkuItem[]>(() => data.value?.laksanaItems ?? []);
const skuProgress = computed<any[]>(() => data.value?.skuProgress ?? []);
const skkItems = computed<SkkItem[]>(() => data.value?.skkItems ?? []);
const skkProgress = computed<any[]>(() => data.value?.skkProgress ?? []);

const selectedReligion = computed<ReligionKey>(() =>
  normalizeReligion(profile.value?.religion || "islam"),
);

const progressMap = computed(() => {
  const map = new Map<string, any>();
  for (const p of skuProgress.value) {
    if (p.point_id) map.set(String(p.point_id), p);
    if (p.sku_item_id) map.set(String(p.sku_item_id), p);
  }
  return map;
});

const isVerified = (id: unknown): boolean =>
  progressMap.value.get(String(id))?.status === "verified";

const countVerified = (items: SkuItem[], level: SkuLevelKey): number => {
  let count = 0;
  for (const item of items) {
    if (item.point_number === 1) {
      const ids = getPoint1SubPointIds(level, selectedReligion.value);
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
};

const bantaraVerified = computed(() =>
  countVerified(bantaraItems.value, "bantara"),
);
const bantaraTotal = computed(() => bantaraItems.value.length || 23);
const laksanaVerified = computed(() =>
  countVerified(laksanaItems.value, "laksana"),
);

const currentLevel = computed<SkuLevelKey>(() =>
  bantaraTotal.value > 0 && bantaraVerified.value >= bantaraTotal.value
    ? "laksana"
    : "bantara",
);

const levelLabel = computed(() =>
  t(`member.dashboard.level.${currentLevel.value}`),
);

const badgeStatus = computed(() => {
  const laksanaTotal = laksanaItems.value.length;
  if (laksanaTotal > 0 && laksanaVerified.value >= laksanaTotal) {
    return t("member.dashboard.badge.laksana");
  }
  if (bantaraTotal.value > 0 && bantaraVerified.value >= bantaraTotal.value) {
    return t("member.dashboard.badge.bantara");
  }
  return t("member.dashboard.badge.none");
});

const skkVerifiedCount = computed(
  () => skkProgress.value.filter((p) => p.status === "verified").length,
);

const religionLabel = computed(
  () =>
    SKU_RELIGIONS.find((r) => r.key === selectedReligion.value)?.label ??
    "Islam",
);

const skuPercentage = computed(() =>
  bantaraTotal.value
    ? Math.round((bantaraVerified.value / bantaraTotal.value) * 100)
    : 0,
);

const stats = computed(() => [
  {
    label: t("member.dashboard.stats.name"),
    value: profile.value?.name || "-",
    icon: UserIcon,
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: t("member.dashboard.stats.level"),
    value: levelLabel.value,
    icon: Layers,
    accent: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    label: t("member.dashboard.stats.religion"),
    value: religionLabel.value,
    icon: Sparkles,
    accent: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    label: t("member.dashboard.stats.sku"),
    value: `${bantaraVerified.value}/${bantaraTotal.value}`,
    icon: BookOpen,
    accent: "text-accent",
    bg: "bg-accent/10",
  },
  {
    label: t("member.dashboard.stats.skk"),
    value: String(skkVerifiedCount.value),
    icon: Award,
    accent: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    label: t("member.dashboard.stats.badge"),
    value: badgeStatus.value,
    icon: BadgeCheck,
    accent: "text-amber-600",
    bg: "bg-amber-500/10",
  },
]);

// SKK yang Dikuasai
interface MasteredSkk {
  item: SkkItem;
  highestLevel: SkkLevel;
  verifiedProgress: any;
  passedLevels: SkkLevel[];
}

const colorHex: Record<string, string> = {
  kuning: "#eab308",
  merah: "#dc2626",
  putih: "#f1f5f9",
  hijau: "#16a34a",
  biru: "#2563eb",
};

const getFieldBadgeClass = (code?: string): string => {
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

const getLevelBadge = (level: SkkLevel) => {
  switch (level) {
    case "utama":
      return {
        label: "Utama",
        shape: "Segi Lima",
        class:
          "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
      };
    case "madya":
      return {
        label: "Madya",
        shape: "Bujur Sangkar",
        class:
          "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
      };
    case "purwa":
    default:
      return {
        label: "Purwa",
        shape: "Lingkaran",
        class:
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      };
  }
};

const badgeIcon = (item: SkkItem): string =>
  item.badge_icon || `/images/skk/${item.icon_key}.svg`;

const frameFor = (item: SkkItem, level: SkkLevel): string =>
  `/images/skk/${level}-${item.color_code || "kuning"}.svg`;

const skkProgressMap = computed(() => {
  const map = new Map<string, any>();
  for (const p of skkProgress.value) {
    const skkId = String(p.skk_id || (p as any).skk_item_id || "");
    const lvl = String(p.level || (p as any).level_name || "").toLowerCase();
    if (skkId && lvl) {
      map.set(`${skkId}:${lvl}`, p);
    }
  }
  return map;
});

const masteredSkkList = computed<MasteredSkk[]>(() => {
  const list: MasteredSkk[] = [];
  const levelsAsc: SkkLevel[] = ["purwa", "madya", "utama"];
  const levelsDesc: SkkLevel[] = ["utama", "madya", "purwa"];

  for (const item of skkItems.value) {
    const itemId = String(item.id);
    const passed: SkkLevel[] = [];
    for (const lvl of levelsAsc) {
      const p = skkProgressMap.value.get(`${itemId}:${lvl}`);
      if (p && p.status === "verified") {
        passed.push(lvl);
      }
    }

    if (passed.length > 0) {
      const highest =
        levelsDesc.find((lvl) => passed.includes(lvl)) ||
        passed[passed.length - 1]!;
      list.push({
        item,
        highestLevel: highest,
        verifiedProgress: skkProgressMap.value.get(`${itemId}:${highest}`),
        passedLevels: passed,
      });
    }
  }

  return list;
});

const selectedMastered = ref<MasteredSkk | null>(null);
const detailDialogOpen = ref(false);

const openMasteredDetail = (entry: MasteredSkk) => {
  selectedMastered.value = entry;
  detailDialogOpen.value = true;
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Greeting -->
    <div>
      <h1 class="text-2xl lg:text-3xl font-display font-bold tracking-tight">
        {{
          t("member.dashboard.greeting", { name: profile?.name || "Anggota" })
        }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ t("member.dashboard.subtitle") }}
      </p>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-card border border-border rounded-2xl p-5 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p
              class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {{ stat.label }}
            </p>
            <p
              class="text-lg sm:text-xl font-bold text-foreground mt-1.5 truncate"
              :title="stat.value"
            >
              <template v-if="pending">
                <Loader2 class="w-5 h-5 animate-spin text-muted-foreground" />
              </template>
              <template v-else>{{ stat.value }}</template>
            </p>
          </div>
          <div
            :class="[
              stat.bg,
              'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
            ]"
          >
            <component :is="stat.icon" :class="[stat.accent, 'w-5 h-5']" />
          </div>
        </div>
      </div>
    </div>

    <!-- Progress -->
    <div class="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <div
            class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
          >
            <BookOpen class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-display font-bold text-base text-foreground">
              {{ t("member.dashboard.progressTitle") }}
            </h3>
            <p class="text-xs text-muted-foreground">
              {{ t("member.dashboard.level.bantara") }}
            </p>
          </div>
        </div>
        <span
          class="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary"
        >
          {{ skuPercentage }}%
        </span>
      </div>
      <div class="h-2.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          class="h-full bg-primary rounded-full transition-all duration-500"
          :style="{ width: `${skuPercentage}%` }"
        />
      </div>
      <p class="text-xs text-muted-foreground mt-3">
        <span class="font-bold text-primary">{{ bantaraVerified }}</span> /
        {{ bantaraTotal }} {{ t("member.dashboard.points") }}
      </p>
    </div>

    <!-- TKK yang Dikuasai -->
    <div class="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0"
          >
            <Award class="w-5 h-5" />
          </div>
          <div>
            <h3
              class="font-display font-bold text-base sm:text-lg text-foreground"
            >
              TKK yang Dikuasai
            </h3>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="masteredSkkList.length"
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
          >
            {{ masteredSkkList.length }} TKK
          </span>
          <NuxtLink
            :to="localePath('/member/skk')"
            class="text-xs font-semibold text-primary hover:underline hidden sm:inline-flex items-center gap-1"
          >
            Katalog SKK &rarr;
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="pending"
        class="py-12 flex flex-col items-center justify-center text-muted-foreground"
      >
        <Loader2 class="w-7 h-7 animate-spin text-primary mb-2" />
        <p class="text-xs">Memuat data TKK...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!masteredSkkList.length"
        class="py-8 px-4 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-muted/20"
      >
        <div
          class="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-2.5"
        >
          <Award class="w-6 h-6" />
        </div>
        <p class="text-sm font-semibold text-foreground">
          Belum ada TKK yang dikuasai
        </p>
        <p class="text-xs text-muted-foreground max-w-sm mt-1 mb-3">
          Ajukan ujian Syarat Kecakapan Khusus (SKK) untuk memperoleh Tanda
          Kecakapan Khusus (TKK).
        </p>
        <NuxtLink
          :to="localePath('/member/skk')"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
        >
          Katalog SKK
          <ArrowRight class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <!-- Grid TKK Dikuasai (5 per baris di mobile) -->
      <div
        v-else
        class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3 pt-1"
      >
        <button
          v-for="entry in masteredSkkList"
          :key="entry.item.id"
          type="button"
          class="group flex flex-col items-center p-1 sm:p-1.5 rounded-xl border border-transparent hover:border-border hover:bg-muted/40 transition-all text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer w-full"
          :title="`${entry.item.name} (${t(`skk.levels.${entry.highestLevel}`)})`"
          @click="openMasteredDetail(entry)"
        >
          <div
            class="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl overflow-hidden bg-muted/40 border border-border p-1 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-primary/50 transition-all"
          >
            <img
              :src="frameFor(entry.item, entry.highestLevel)"
              class="absolute inset-0 w-full h-full object-contain"
              alt=""
            />
            <img
              :src="badgeIcon(entry.item)"
              class="absolute inset-0 w-full h-full object-contain p-1.5"
              :alt="entry.item.name"
              loading="lazy"
            />
          </div>

          <span
            class="text-[10px] sm:text-xs font-semibold text-foreground/90 group-hover:text-primary truncate w-full text-center mt-1 leading-tight"
          >
            {{ entry.item.name }}
          </span>

          <span
            class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border mt-0.5 scale-90"
            :class="getLevelBadge(entry.highestLevel).class"
          >
            {{ entry.highestLevel }}
          </span>
        </button>
      </div>
    </div>

    <!-- Quick actions -->
    <div>
      <h2 class="font-display font-bold text-lg mb-3">
        {{ t("member.dashboard.quickActions.title") }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink
          :to="localePath('/member/sku')"
          class="group bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div
            class="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0"
          >
            <BookOpen class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-display font-bold text-foreground">
              {{ t("member.sidebar.sku") }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ t("member.dashboard.quickActions.sku_desc") }}
            </p>
          </div>
          <ArrowRight
            class="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
          />
        </NuxtLink>

        <NuxtLink
          :to="localePath('/member/skk')"
          class="group bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div
            class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"
          >
            <Award class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-display font-bold text-foreground">
              {{ t("member.sidebar.skk") }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ t("member.dashboard.quickActions.skk_desc") }}
            </p>
          </div>
          <ArrowRight
            class="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Dialog Detail TKK yang Dikuasai -->
    <Dialog v-model:open="detailDialogOpen">
      <DialogContent class="sm:max-w-md p-6">
        <DialogHeader v-if="selectedMastered" class="text-left">
          <div class="flex items-start gap-4">
            <!-- Badge Icon Besar -->
            <div
              class="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-muted/40 border border-border p-2 flex items-center justify-center shadow-sm"
            >
              <img
                :src="
                  frameFor(selectedMastered.item, selectedMastered.highestLevel)
                "
                class="absolute inset-0 w-full h-full object-contain p-1"
                alt=""
              />
              <img
                :src="badgeIcon(selectedMastered.item)"
                class="absolute inset-0 w-full h-full object-contain p-2.5"
                :alt="selectedMastered.item.name"
              />
            </div>

            <!-- Info Header -->
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-1.5 mb-1">
                <!-- Bidang Badge -->
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                  :class="getFieldBadgeClass(selectedMastered.item.color_code)"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full border border-black/10 shrink-0"
                    :style="{
                      backgroundColor:
                        colorHex[selectedMastered.item.color_code],
                    }"
                  />
                  {{
                    t(`skk.fields_badge.${selectedMastered.item.color_code}`)
                  }}
                </span>

                <!-- Tingkat Tertinggi Badge -->
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  :class="getLevelBadge(selectedMastered.highestLevel).class"
                >
                  Tingkat {{ selectedMastered.highestLevel }}
                </span>
              </div>

              <DialogTitle
                class="font-display text-lg sm:text-xl font-bold text-foreground"
              >
                {{ selectedMastered.item.name }}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div v-if="selectedMastered" class="space-y-4 pt-2">
          <!-- Status Tingkatan yang Dicapai -->
          <div>
            <h4
              class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
            >
              Pencapaian Tingkatan
            </h4>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="lvl in ['purwa', 'madya', 'utama'] as SkkLevel[]"
                :key="lvl"
                class="flex flex-col items-center p-2.5 rounded-xl border text-center text-xs transition-all"
                :class="
                  selectedMastered.passedLevels.includes(lvl)
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'bg-muted/30 border-border text-muted-foreground/60'
                "
              >
                <div class="flex items-center gap-1 mb-1">
                  <CheckCircle2
                    v-if="selectedMastered.passedLevels.includes(lvl)"
                    class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                  />
                  <CircleDashed
                    v-else
                    class="w-3.5 h-3.5 text-muted-foreground/40"
                  />
                  <span class="capitalize font-bold">{{
                    t(`skk.levels.${lvl}`)
                  }}</span>
                </div>
                <span class="text-[10px]">
                  {{
                    selectedMastered.passedLevels.includes(lvl)
                      ? "Lulus"
                      : "Belum"
                  }}
                </span>
                <span class="text-[9px] text-muted-foreground mt-0.5">
                  {{ getLevelBadge(lvl).shape }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              class="text-xs"
              @click="detailDialogOpen = false"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
