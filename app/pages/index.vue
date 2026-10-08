<script setup lang="ts">
import { useLocalePath, useI18n } from "#imports"
import { useActivityService } from '~/services/activityService';

const PinBoard = defineAsyncComponent(() => import('~/components/pinboard/PinBoard.vue'))

const { t } = useI18n()
const localePath = useLocalePath()
const { data, loading, fetchAll } = useActivityService()

const siteUrl = useRuntimeConfig().public.siteUrl as string

useSeoMeta({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
  ogTitle: () => `${t('seo.home.title')} - Pramuka SMA Negeri 1 Pasawahan`,
  ogDescription: () => t('seo.home.description'),
  ogImage: `${siteUrl}/images/pramuka1.webp`,
  ogUrl: siteUrl,
  twitterTitle: () => `${t('seo.home.title')} - Pramuka SMA Negeri 1 Pasawahan`,
  twitterDescription: () => t('seo.home.description'),
  twitterImage: `${siteUrl}/images/pramuka1.webp`,
})

onMounted(() => {
  fetchAll('created_at', false, 3)
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Hero Section -->
    <section class="relative w-full min-h-[90vh] flex items-center bg-card overflow-hidden">
      <!-- Decorative background: lightweight gradients instead of blur -->
      <div class="absolute inset-0 z-0">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full opacity-60"></div>
        <div class="absolute top-1/2 -left-24 w-72 h-72 bg-accent/10 rounded-full opacity-60"></div>
      </div>

      <div
        class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div class="max-w-2xl">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            {{ $t('home.hero.badge') }}
          </div>

          <h1
            class="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight mb-8">
            {{ $t('home.hero.title_1') }}<br />
            <span class="text-primary">{{ $t('home.hero.title_2') }}</span><br />
            {{ $t('home.hero.title_3') }}
          </h1>

          <p class="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
            {{ $t('home.hero.description') }}
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink :to="localePath('/contact')"
              class="inline-flex h-12 items-center justify-center rounded-sm bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20">
              {{ $t('home.hero.cta_join') }}
            </NuxtLink>

            <NuxtLink :to="localePath('/about')"
              class="inline-flex h-12 items-center justify-center rounded-sm border-2 border-border bg-transparent px-8 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
              {{ $t('home.hero.cta_history') }}
            </NuxtLink>
          </div>
        </div>

        <div class="relative hidden lg:block h-150">
          <div
            class="absolute inset-0 bg-primary/5 rounded-2xl transform rotate-3 scale-105 transition-transform duration-700 hover:rotate-6">
          </div>
          <img src="/images/pramuka1.webp" alt="Kegiatan Ambalan Pramuka SMA Negeri 1 Pasawahan SMANPAS Purwakarta"
            class="relative z-10 w-full h-full object-cover rounded-2xl shadow-2xl grayscale-20 hover:grayscale-0 transition-all duration-700" />
        </div>
      </div>
    </section>

    <!-- Intro Banner -->
    <section class="w-full bg-primary text-primary-foreground py-24 cv-auto">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
        <h2 class="font-display text-3xl md:text-5xl font-bold mb-8 leading-tight">
          {{ $t('home.banner.title') }}<br />
          {{ $t('home.banner.title_2') }}
        </h2>
        <p class="text-lg text-primary-foreground/80 leading-relaxed max-w-3xl mx-auto">
          {{ $t('home.banner.description') }}
        </p>
      </div>
    </section>

    <!-- Pinboard (lazy loaded) -->
    <section class="py-24 bg-background cv-auto">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="max-w-xl mb-4">
          <h2 class="font-display text-4xl font-bold text-foreground mb-4">{{ $t('home.pinboard.title') }}</h2>
          <p class="text-muted-foreground text-lg">{{ $t('home.pinboard.description') }}</p>
        </div>
        <PinBoard />
      </div>
    </section>

    <!-- Intro Motto Ambalan -->
    <section class="w-full bg-primary text-primary-foreground py-24 cv-auto">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
        <h2 class="font-display text-3xl md:text-5xl font-bold mb-8 leading-tight">
          {{ $t('home.motto.title') }}<br />
          {{ $t('home.motto.title_2') }}
        </h2>
        <p class="text-lg text-primary-foreground/80 leading-relaxed max-w-3xl mx-auto">
          {{ $t('home.motto.description') }}
        </p>
      </div>
    </section>

    <!-- Recent Activities -->
    <section class="py-24 bg-background cv-auto">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div class="max-w-xl">
            <h2 class="font-display text-4xl font-bold text-foreground mb-4">{{ $t('home.activities.latest_expedition')
            }}</h2>
            <p class="text-muted-foreground text-lg">{{ $t('home.activities.description') }}</p>
          </div>
          <NuxtLink to="/activities"
            class="group inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors">
            {{ $t('home.activities.view_all') }}
            <span class="transform transition-transform group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article v-for="activity in data" :key="activity.id"
            class="group group/card relative h-112.5 overflow-hidden rounded-sm bg-muted">
            <img :src="activity.cover_image" :alt="`Kegiatan ${activity.title} - Pramuka SMA Negeri 1 Pasawahan SMANPAS`"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              loading="lazy" />
            <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>

            <div class="absolute inset-0 p-8 flex flex-col justify-end">
              <span
                class="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary/90 rounded-sm w-fit">
                KEGIATAN
              </span>
              <h3 class="font-display text-2xl font-bold text-white mb-2">{{ activity.title }}</h3>
              <p class="text-white/80 text-sm mb-4">{{ activity.activity_date }} &bull; {{ activity.location }}</p>

              <div
                class="grid grid-rows-[0fr] group-hover/card:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                <div class="overflow-hidden">
                  <p class="text-white/70 text-sm line-clamp-2 mt-2">
                    {{ activity.description }}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cv-auto {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
</style>
