<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const siteUrl = useRuntimeConfig().public.siteUrl as string

useSeoMeta({
  title: () => t('seo.contact.title'),
  description: () => t('seo.contact.description'),
  ogTitle: () => `${t('seo.contact.title')} - Pramuka SMA Negeri 1 Pasawahan`,
  ogDescription: () => t('seo.contact.description'),
  ogImage: `${siteUrl}/images/logo.webp`,
  ogUrl: `${siteUrl}/contact`,
  twitterTitle: () => `${t('seo.contact.title')} - Pramuka SMA Negeri 1 Pasawahan`,
  twitterDescription: () => t('seo.contact.description'),
  twitterImage: `${siteUrl}/images/logo.webp`,
})

const formLoadedAt = ref(Date.now())

const form = reactive({
  full_name: '',
  email: '',
  subject: 'join',
  message: '',
  website: '', // Honeypot (harus tetap kosong)
})

const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const cooldownRemaining = ref(0)

const COOLDOWN_SECONDS = 60
let cooldownInterval: ReturnType<typeof setInterval> | null = null

function startCooldown() {
  cooldownRemaining.value = COOLDOWN_SECONDS
  cooldownInterval = setInterval(() => {
    cooldownRemaining.value--
    if (cooldownRemaining.value <= 0) {
      if (cooldownInterval) clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

function validate(): string | null {
  if (!form.full_name.trim() || form.full_name.trim().length < 2) {
    return 'Nama lengkap wajib diisi (minimal 2 karakter).'
  }
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Alamat email tidak valid.'
  }
  if (!['join', 'collab', 'general'].includes(form.subject)) {
    return 'Subject tidak valid.'
  }
  if (!form.message.trim() || form.message.trim().length < 10) {
    return 'Pesan wajib diisi (minimal 10 karakter).'
  }
  if (form.message.length > 2000) {
    return 'Pesan terlalu panjang (maksimal 2000 karakter).'
  }
  return null
}

async function handleSubmit() {
  errorMessage.value = ''

  // Prevent rapid re-submit
  if (cooldownRemaining.value > 0) {
    errorMessage.value = `Mohon tunggu ${cooldownRemaining.value} detik sebelum mengirim ulang.`
    return
  }

  // Client validation
  const validationError = validate()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  submitting.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
        website: form.website, // Honeypot
        _formLoadedAt: formLoadedAt.value, // Timing check
      },
    })

    submitted.value = true
    startCooldown()

    form.full_name = ''
    form.email = ''
    form.subject = 'join'
    form.message = ''
    form.website = ''
    formLoadedAt.value = Date.now()
  } catch (err: any) {
    const statusCode = err?.statusCode || err?.response?.status
    if (statusCode === 429) {
      errorMessage.value = 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
    } else {
      errorMessage.value = err?.data?.statusMessage || err?.statusMessage || 'Gagal mengirim pesan. Silakan coba lagi.'
    }
  } finally {
    submitting.value = false
  }
}

// Character count for message
const messageCharCount = computed(() => form.message.length)

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-background">
    <!-- Header -->
    <header class="bg-card py-24 border-b border-border">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
        <h1 class="font-display text-5xl md:text-7xl font-bold text-foreground mb-6">{{ $t('contact.title') }}</h1>
        <p class="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {{ $t('contact.description') }}
        </p>
      </div>
    </header>

    <section class="py-24">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl grid md:grid-cols-2 gap-16 lg:gap-24">

        <!-- Contact Info -->
        <div>
          <h2 class="font-display text-3xl font-bold text-foreground mb-8">{{ $t('contact.basecamp') }}</h2>

          <div class="space-y-10">
            <div>
              <p class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">{{
                $t('contact.location') }}</p>
              <p class="text-lg text-foreground font-medium">Sanggar Pramuka SMAN 1 Pasawahan</p>
              <p class="text-foreground/80 mt-1">Jl. Kapten Halim No.1, Pasawahan,<br />Kab. Purwakarta, Jawa Barat
                41172</p>
            </div>

            <div>
              <p class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">{{
                $t('contact.email') }}</p>
              <a href="mailto:pramukasmanpas@gmail.com"
                class="text-lg text-primary hover:underline font-medium">pramukasmanpas@gmail.com</a>
            </div>

            <div>
              <p class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">{{
                $t('contact.social') }}</p>
              <div class="flex gap-4 pt-4">
                <a href="https://www.instagram.com/pramukasmanpas" target="_blank" aria-label="Instagram"
                  class="text-muted-foreground hover:text-accent transition-colors">
                  <img src="/social/instagram.svg" alt="Instagram" class="w-5 h-5">
                </a>
                <a href="https://www.facebook.com/share/g/14aXL3TXarD/" aria-label="Facebook" target="_blank"
                  class="text-muted-foreground hover:text-accent transition-colors">
                  <img src="/social/facebook.svg" alt="Facebook" class="w-5 h-5">
                </a>

                <a href="https://youtube.com/@sman1pasawahan?si=0F5FrQRrsHbuGmhQ" target="_blank" aria-label="YouTube"
                  class="text-muted-foreground hover:text-accent transition-colors">
                  <img src="/social/youtube.svg" alt="YouTube" class="w-5 h-5">
                </a>

                <a href="https://www.tiktok.com/@sman1pasawahanpwk?_r=1&_t=ZS-95cHcPuMxEK" target="_blank"
                  aria-label="TikTok" class="text-muted-foreground hover:text-accent transition-colors">
                  <img src="/social/tiktok.svg" alt="TikTok" class="w-5 h-5">
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="bg-card p-8 md:p-10 rounded-sm border border-border shadow-sm">
          <h2 class="font-display text-2xl font-bold text-foreground mb-8">{{ $t('contact.form.title') }}</h2>

          <!-- Success State -->
          <div v-if="submitted" class="text-center py-12 space-y-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-foreground">{{ $t('contact.form.success_title') }}</h3>
            <p class="text-muted-foreground">{{ $t('contact.form.success_description') }}</p>
            <button @click="submitted = false" :disabled="cooldownRemaining > 0"
              class="inline-flex h-10 items-center justify-center rounded-sm border border-border px-6 text-sm font-medium text-foreground transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed mt-4">
              {{ cooldownRemaining > 0 ? `Kirim Lagi (${cooldownRemaining}s)` : 'Kirim Pesan Lagi' }}
            </button>
          </div>

          <!-- Form -->
          <form v-else class="space-y-6" @submit.prevent="handleSubmit" novalidate>
            <!-- Honeypot field: tidak terlihat bagi pengguna asli, bot akan mengisinya -->
            <div aria-hidden="true"
              style="position: absolute; left: -9999px; top: -9999px; opacity: 0; height: 0; width: 0; overflow: hidden; pointer-events: none;"
              tabindex="-1">
              <label for="website">Website</label>
              <input type="text" id="website" name="website" v-model="form.website" autocomplete="off" tabindex="-1" />
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage"
              class="p-4 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {{ errorMessage }}
            </div>

            <div class="space-y-2">
              <label for="name" class="text-sm font-medium text-foreground">{{ $t('contact.form.name') }}</label>
              <input type="text" id="name" v-model="form.full_name"
                class="flex h-12 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                :placeholder="$t('contact.form.placeholder_name')" maxlength="100" required />
            </div>

            <div class="space-y-2">
              <label for="email" class="text-sm font-medium text-foreground">{{ $t('contact.form.email') }}</label>
              <input type="email" id="email" v-model="form.email"
                class="flex h-12 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                :placeholder="$t('contact.form.placeholder_email')" maxlength="254" required />
            </div>

            <div class="space-y-2">
              <label for="topic" class="text-sm font-medium text-foreground">{{ $t('contact.form.subject') }}</label>
              <select id="topic" v-model="form.subject"
                class="flex h-12 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors">
                <option value="join">{{ $t('contact.form.subjects.join') }}</option>
                <option value="collab">{{ $t('contact.form.subjects.collab') }}</option>
                <option value="general">{{ $t('contact.form.subjects.general') }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="message" class="text-sm font-medium text-foreground">{{ $t('contact.form.message')
                  }}</label>
                <span class="text-xs text-muted-foreground" :class="{ 'text-destructive': messageCharCount > 2000 }">
                  {{ messageCharCount }}/2000
                </span>
              </div>
              <textarea id="message" rows="5" :value="form.message"
                @input="form.message = ($event.target as HTMLTextAreaElement).value"
                class="flex w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors resize-none"
                placeholder="State your purpose here..." maxlength="2000" required></textarea>
            </div>

            <button type="submit" :disabled="submitting"
              class="inline-flex h-12 w-full items-center justify-center rounded-sm bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ submitting ? $t('contact.form.sending') : $t('contact.form.submit') }}
            </button>
          </form>
        </div>

      </div>
    </section>
  </div>
</template>
