<script setup lang="ts">
import { computed } from "vue";
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
} from "lucide-vue-next";
import { useSkuService, type SkuItem } from "~/services/skuService";
import { useSkkService } from "~/services/skkService";
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
const { fetchItems: fetchSkkItems, fetchProgress: fetchSkkProgress } = useSkkService();

useHead({
  title: () => t("member.sidebar.dashboard"),
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { data, pending } = await useAsyncData("member-dashboard", async () => {
  const [
    bantaraItems,
    laksanaItems,
    skuProgress,
    skkItems,
    skkProgress,
  ] = await Promise.all([
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
  () =>
    skkProgress.value.filter((p) => p.status === "verified").length,
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
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Greeting -->
    <div>
      <h1 class="text-2xl lg:text-3xl font-display font-bold tracking-tight">
        {{ t("member.dashboard.greeting", { name: profile?.name || "Anggota" }) }}
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
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {{ stat.label }}
            </p>
            <p class="text-lg sm:text-xl font-bold text-foreground mt-1.5 truncate" :title="stat.value">
              <template v-if="pending">
                <Loader2 class="w-5 h-5 animate-spin text-muted-foreground" />
              </template>
              <template v-else>{{ stat.value }}</template>
            </p>
          </div>
          <div :class="[stat.bg, 'h-10 w-10 rounded-xl flex items-center justify-center shrink-0']">
            <component :is="stat.icon" :class="[stat.accent, 'w-5 h-5']" />
          </div>
        </div>
      </div>
    </div>

    <!-- Progress -->
    <div class="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
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
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
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
          <div class="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <BookOpen class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-display font-bold text-foreground">{{ t("member.sidebar.sku") }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ t("member.dashboard.quickActions.sku_desc") }}</p>
          </div>
          <ArrowRight class="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </NuxtLink>

        <NuxtLink
          :to="localePath('/member/skk')"
          class="group bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Award class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-display font-bold text-foreground">{{ t("member.sidebar.skk") }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ t("member.dashboard.quickActions.skk_desc") }}</p>
          </div>
          <ArrowRight class="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>