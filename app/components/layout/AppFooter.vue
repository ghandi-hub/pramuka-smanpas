<script setup lang="ts">
import { useI18n, useLocalePath } from "#imports"
const { t } = useI18n()
const localePath = useLocalePath()

</script>

<template>
  <footer class="bg-card py-16 border-t border-border/50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
        <!-- Brand / Identity -->
        <div class="md:col-span-1 flex flex-col items-start">
          <NuxtLink :to="localePath('/')" class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 shrink-0 overflow-hidden">
              <img src="/images/logo.webp" alt="Pramuka Logo" class="w-full h-full object-contain" />
            </div>
            <div class="flex flex-col">
              <span
                class="font-display font-semibold text-base leading-tight tracking-tight text-foreground">Pramuka</span>
            </div>
          </NuxtLink>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ t("footer.description") }}
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-display font-semibold text-foreground mb-6 uppercase tracking-wider text-xs">{{ t("footer.explore") }}</h4>
          <ul class="space-y-4">
            <li>
              <NuxtLink :to="localePath('/about')" class="text-sm text-muted-foreground hover:text-primary transition-colors">{{ t("footer.aboutHistory") }}
                </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/activities')" class="text-sm text-muted-foreground hover:text-primary transition-colors">
                {{ t("footer.latestActivities") }}</NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/sku')" class="text-sm text-muted-foreground hover:text-primary transition-colors">{{ t("footer.sku") }}
                </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/skk')" class="text-sm text-muted-foreground hover:text-primary transition-colors">{{ t("footer.skk") }}
                </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-display font-semibold text-foreground mb-6 uppercase tracking-wider text-xs">{{ t("footer.organization") }}</h4>
          <ul class="space-y-4">
            <li>
              <NuxtLink :to="localePath('/members')" class="text-sm text-muted-foreground hover:text-primary transition-colors">{{ t("footer.ambalanHierarchy") }}
                </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/members')" class="text-sm text-muted-foreground hover:text-primary transition-colors">{{ t("footer.dewanAmbalan") }}
                </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/contact')" class="text-sm text-muted-foreground hover:text-primary transition-colors">{{ t("footer.becomeMember") }}
                </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact/Social -->
        <div>
          <h4 class="font-display font-semibold text-foreground mb-6 uppercase tracking-wider text-xs">{{ t("footer.connect") }}</h4>
          <address class="not-italic text-sm text-muted-foreground space-y-4">
            <p>
              {{ t("footer.address_1") }}<br />{{ t("footer.address_2") }}
            </p>
            <p>
              <a href="mailto:pramukasmanpas@gmail.com"
                class="hover:text-primary transition-colors">pramukasmanpas@gmail.com</a>
            </p>
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
          </address>
        </div>
      </div>

      <div
        class="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>&copy; {{ new Date().getFullYear() }} {{ t("footer.copyright") }}.</p>
        <p class="font-medium tracking-wide">SATYAKU KUDARMAKAN, DARMAKU KUBAKTIKAN</p>
      </div>
    </div>
  </footer>
</template>
