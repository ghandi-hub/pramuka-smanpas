<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useI18n, useLocalePath } from "#imports"

const { t } = useI18n()
const localePath = useLocalePath()

const { profile, loading, token, fetchProfile } = useAdminAuth()

const isAuthChecking = computed(() => {
  // Jika sedang loading dari fetchProfile
  if (loading.value) return true
  // Jika ada token di cookie tapi profile belum terload (akan difetch di onMounted)
  if (token.value && !profile.value) return true
  return false
})

onMounted(() => {
  if (token.value && !profile.value) {
    fetchProfile()
  }
})

const isMobileMenuOpen = ref(false)

const links = computed(() => [
  { name: t('nav.home'), path: localePath('/') },
  { name: t('nav.about'), path: localePath('/about') },
  { name: t('nav.activities'), path: localePath('/activities') },
  { name: t('nav.sku'), path: localePath('/sku') },
  { name: t('nav.skk'), path: localePath('/skk') },
  { name: t('nav.members'), path: localePath('/members') },
  { name: t('nav.contact'), path: localePath('/contact') },
])

function toggleMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <header
    class="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 transition-colors duration-300">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="flex items-center gap-1 group max-w-fit">
          <div class="w-10 h-10 shrink-0 overflow-hidden">
            <img src="/images/logo.webp" alt="Pramuka Logo" class="w-full h-full object-contain" />
          </div>

          <div class="flex flex-col justify-center">
            <span
              class="font-display font-bold text-base md:text-lg leading-none tracking-tight text-foreground group-hover:text-primary transition-colors">
              Pramuka
            </span>
            <span
              class="text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mt-0.5">
              SMAN 1 Pasawahan
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink v-for="link in links" :key="link.path" :to="link.path"
            class="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            active-class="text-primary after:w-full">
            {{ link.name }}
          </NuxtLink>
        </nav>

        <!-- CTA & Mobile Toggle -->
        <div class="flex items-center gap-4">
          <LanguageSwitcher />

          <NuxtLink :to="profile ? localePath('/admin') : localePath('/auth/login')"
            class="hidden md:inline-flex h-10 min-w-[120px] items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5">
            <svg v-if="isAuthChecking" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>{{ profile ? 'Dashboard' : t('nav.cta') }}</span>
          </NuxtLink>

          <button @click="toggleMenu" class="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 rounded-full"
            aria-label="Toggle menu">
            <span class="block w-6 h-0.5 bg-foreground transition-transform"
              :class="{ 'rotate-45 translate-y-2': isMobileMenuOpen }"></span>
            <span class="block w-6 h-0.5 bg-foreground transition-opacity"
              :class="{ 'opacity-0': isMobileMenuOpen }"></span>
            <span class="block w-6 h-0.5 bg-foreground transition-transform"
              :class="{ '-rotate-45 -translate-y-2': isMobileMenuOpen }"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div v-show="isMobileMenuOpen"
      class="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl absolute top-20 inset-x-0 h-[calc(100vh-5rem)] overflow-y-auto">
      <nav class="flex flex-col p-6 space-y-6 container mx-auto">
        <NuxtLink v-for="link in links" :key="link.path" :to="link.path"
          class="font-display text-3xl font-semibold text-foreground hover:text-primary transition-colors"
          active-class="text-primary" @click="isMobileMenuOpen = false">
          {{ link.name }}
        </NuxtLink>

        <div class="pt-8 mt-8 border-t border-border">
          <NuxtLink :to="profile ? localePath('/admin') : localePath('/auth/login')"
            class="inline-flex h-12 w-full items-center justify-center rounded-sm bg-primary px-8 text-base font-medium text-primary-foreground"
            @click="isMobileMenuOpen = false">
            <svg v-if="isAuthChecking" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>{{ profile ? 'Dashboard' : t('nav.cta') }}</span>
          </NuxtLink>
        </div>
      </nav>
    </div>
  </header>
</template>
