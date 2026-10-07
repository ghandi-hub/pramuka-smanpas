<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n, useLocalePath } from "#imports";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-vue-next";
import { SKU_RELIGIONS, normalizeReligion } from "~~/shared/skuSubpoints";

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const { profile, token, fetchProfile, clearProfile } = useAdminAuth();

definePageMeta({ middleware: ["member"] });

const isDark = ref(false);
const collapsed = ref(false);
const mobileOpen = ref(false);

onMounted(() => {
  isDark.value = document.documentElement.classList.contains("dark");
  collapsed.value = localStorage.getItem("member-sidebar-collapsed") === "1";
  if (token.value && !profile.value) fetchProfile().catch(() => {});
});

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  localStorage.setItem("member-sidebar-collapsed", collapsed.value ? "1" : "0");
};

const toggleDark = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
  localStorage.setItem("member-theme", isDark.value ? "dark" : "light");
};

const menuItems = computed(() => [
  {
    label: t("member.sidebar.dashboard"),
    icon: LayoutDashboard,
    to: localePath("/member"),
    exact: true,
  },
  {
    label: t("member.sidebar.sku"),
    icon: BookOpen,
    to: localePath("/member/sku"),
  },
  {
    label: t("member.sidebar.skk"),
    icon: Award,
    to: localePath("/member/skk"),
  },
  {
    label: t("member.sidebar.profile"),
    icon: User,
    to: localePath("/member/profile"),
  },
]);

const isActive = (item: { to: string; exact?: boolean }) => {
  const path = route.path.replace(/\/$/, "");
  const target = item.to.replace(/\/$/, "");
  return item.exact ? path === target : path.startsWith(target);
};

const religionLabel = computed(() =>
  SKU_RELIGIONS.find((r) => r.key === normalizeReligion(profile.value?.religion))
    ?.label ?? "Islam",
);

const initials = computed(() => {
  const name = profile.value?.name || "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
});

const handleLogout = async () => {
  await clearProfile();
  router.push(localePath("/auth/login"));
};
</script>

<template>
  <div class="min-h-screen bg-muted/30 text-foreground">
    <div class="flex min-h-screen">
      <!-- ==================== DESKTOP SIDEBAR ==================== -->
      <aside
        class="hidden lg:flex sticky top-0 h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out shrink-0"
        :class="collapsed ? 'w-[76px]' : 'w-64'"
      >
        <!-- Brand -->
        <div class="flex items-center gap-3 h-16 px-4 border-b border-sidebar-border shrink-0">
          <div class="w-9 h-9 shrink-0 overflow-hidden">
            <img src="/images/logo.webp" alt="Pramuka Logo" class="w-full h-full object-contain" />
          </div>
          <span
            v-if="!collapsed"
            class="font-display font-bold text-sm text-sidebar-foreground tracking-tight whitespace-nowrap"
          >
            Member Area
          </span>
        </div>

        <!-- Profile card -->
        <div class="px-3 py-4 border-b border-sidebar-border">
          <div class="flex items-center gap-3" :class="collapsed ? 'justify-center' : ''">
            <div
              class="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-sidebar-border bg-muted flex items-center justify-center"
            >
              <img
                v-if="profile?.avatar_url"
                :src="profile.avatar_url"
                class="w-full h-full object-cover"
                alt="avatar"
              />
              <span v-else class="text-xs font-bold text-primary">{{ initials || "P" }}</span>
            </div>
            <div v-if="!collapsed" class="min-w-0">
              <p class="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                {{ profile?.name || "Anggota" }}
              </p>
              <p class="text-[10px] text-muted-foreground truncate mt-0.5">{{ religionLabel }}</p>
              <span
                class="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary"
              >
                {{ t("member.sidebar.badge") }}
              </span>
            </div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            :class="[
              isActive(item)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              collapsed ? 'justify-center' : '',
            ]"
            :title="collapsed ? item.label : undefined"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            <span v-if="!collapsed" class="whitespace-nowrap">{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <!-- Footer -->
        <div class="px-2 py-3 border-t border-sidebar-border space-y-1">
          <button
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all w-full"
            :class="collapsed ? 'justify-center' : ''"
            :title="t('member.sidebar.viewPublic')"
            @click="router.push(localePath('/'))"
          >
            <ExternalLink class="w-4 h-4 shrink-0" />
            <span v-if="!collapsed" class="whitespace-nowrap">{{ t("member.sidebar.viewPublic") }}</span>
          </button>
          <button
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all w-full"
            :class="collapsed ? 'justify-center' : ''"
            @click="toggleDark"
          >
            <Sun v-if="isDark" class="w-4 h-4 shrink-0" />
            <Moon v-else class="w-4 h-4 shrink-0" />
            <span v-if="!collapsed" class="whitespace-nowrap">{{ isDark ? "Light Mode" : "Dark Mode" }}</span>
          </button>
          <button
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full"
            :class="collapsed ? 'justify-center' : ''"
            :title="t('member.sidebar.logout')"
            @click="handleLogout"
          >
            <LogOut class="w-4 h-4 shrink-0" />
            <span v-if="!collapsed" class="whitespace-nowrap">{{ t("member.sidebar.logout") }}</span>
          </button>
        </div>
      </aside>

      <!-- ==================== MAIN ==================== -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Mobile top header -->
        <header
          class="lg:hidden sticky top-0 z-30 h-16 border-b border-border bg-background/85 backdrop-blur-md flex items-center justify-between px-4"
        >
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 overflow-hidden">
              <img src="/images/logo.webp" alt="Pramuka Logo" class="w-full h-full object-contain" />
            </div>
            <span class="font-display font-bold text-sm">Member Area</span>
          </div>
          <button
            class="p-2 rounded-lg hover:bg-muted text-foreground/70"
            aria-label="Menu"
            @click="mobileOpen = true"
          >
            <Menu class="w-5 h-5" />
          </button>
        </header>

        <!-- Desktop topbar -->
        <header
          class="hidden lg:flex sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-sm items-center justify-between px-6"
        >
          <button
            class="p-2 -ml-2 rounded-lg hover:bg-muted text-foreground/70 hover:text-foreground transition-colors"
            :title="collapsed ? 'Expand' : 'Collapse'"
            @click="toggleCollapse"
          >
            <ChevronRight v-if="collapsed" class="w-5 h-5" />
            <ChevronLeft v-else class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-3">
            <span
              class="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary"
            >
              {{ t("member.sidebar.badge") }}
            </span>
            <div class="h-9 w-9 rounded-full bg-muted overflow-hidden border border-border flex items-center justify-center">
              <img v-if="profile?.avatar_url" :src="profile.avatar_url" class="w-full h-full object-cover" alt="avatar" />
              <span v-else class="text-[11px] font-bold text-primary">{{ initials || "P" }}</span>
            </div>
          </div>
        </header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 pb-8 w-full max-w-7xl mx-auto">
          <slot />
        </main>
      </div>
    </div>

    <!-- ==================== MOBILE DRAWER ==================== -->
    <Teleport to="body">
      <Transition name="member-backdrop">
        <div
          v-if="mobileOpen"
          class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          @click="mobileOpen = false"
        />
      </Transition>
      <Transition name="member-slide">
        <aside
          v-if="mobileOpen"
          class="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar border-r border-sidebar-border shadow-2xl lg:hidden"
        >
          <div class="flex items-center justify-between px-5 h-16 border-b border-sidebar-border shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 overflow-hidden">
                <img src="/images/logo.webp" alt="Pramuka Logo" class="w-full h-full object-contain" />
              </div>
              <span class="font-display font-bold text-sm">Member Area</span>
            </div>
            <button class="p-1.5 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/70" @click="mobileOpen = false">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Identity -->
          <div class="px-5 py-4 border-b border-sidebar-border">
            <div class="flex items-center gap-3">
              <div class="h-11 w-11 shrink-0 rounded-full overflow-hidden border border-sidebar-border bg-muted flex items-center justify-center">
                <img v-if="profile?.avatar_url" :src="profile.avatar_url" class="w-full h-full object-cover" alt="avatar" />
                <span v-else class="text-xs font-bold text-primary">{{ initials || "P" }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold truncate">{{ profile?.name || "Anggota" }}</p>
                <p class="text-[11px] text-muted-foreground truncate mt-0.5">{{ religionLabel }}</p>
                <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                  {{ t("member.sidebar.badge") }}
                </span>
              </div>
            </div>
          </div>

          <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              :class="
                isActive(item)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              "
              @click="mobileOpen = false"
            >
              <component :is="item.icon" class="w-4 h-4 shrink-0" />
              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="px-3 py-4 border-t border-sidebar-border space-y-1">
            <button
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full"
              @click="() => { mobileOpen = false; router.push(localePath('/')); }"
            >
              <ExternalLink class="w-4 h-4 shrink-0" />
              {{ t("member.sidebar.viewPublic") }}
            </button>
            <button
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 w-full"
              @click="handleLogout"
            >
              <LogOut class="w-4 h-4 shrink-0" />
              {{ t("member.sidebar.logout") }}
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.member-backdrop-enter-active,
.member-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.member-backdrop-enter-from,
.member-backdrop-leave-to {
  opacity: 0;
}
.member-slide-enter-active,
.member-slide-leave-active {
  transition: transform 0.25s ease;
}
.member-slide-enter-from,
.member-slide-leave-to {
  transform: translateX(-100%);
}
</style>