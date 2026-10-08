<script setup lang="ts">
import Panzoom from "@panzoom/panzoom";
import ImagePin from "./ImagePin.vue";
import { useGalleryService } from "~/services/galleryService";
import { useIntersectionObserver } from "@vueuse/core";

const { data, loading, fetchAll } = useGalleryService();

const canvas = ref();
const wrapper = ref();
const resetView = ref();

// State untuk Modal
const selectedCard = ref<any>(null);
const imageReady = ref(false);

// Refs untuk Edge Hit DOM Nodes bypassing Vue reactivity
const edgeTop = ref<HTMLElement | null>(null);
const edgeRight = ref<HTMLElement | null>(null);
const edgeBottom = ref<HTMLElement | null>(null);
const edgeLeft = ref<HTMLElement | null>(null);

let edgeHitTimeout: ReturnType<typeof setTimeout> | null = null;
let rafId: number | null = null;

const openModal = async (cardData: any) => {
  // Pre-decode image before showing modal to avoid jank
  imageReady.value = false;
  selectedCard.value = cardData;
  document.body.style.overflow = "hidden";

  try {
    const img = new Image();
    img.src = cardData.image_url;
    await img.decode();
  } catch {
    // If decode fails, show anyway
  }
  imageReady.value = true;
};

const closeModal = () => {
  selectedCard.value = null;
  imageReady.value = false;
  document.body.style.overflow = "";
};

onUnmounted(() => {
  document.body.style.overflow = "";
});

onMounted(() => {
  let hasFetched = false;
  useIntersectionObserver(wrapper, (entries) => {
    const isIntersecting = entries[0]?.isIntersecting;
    if (isIntersecting && !hasFetched) {
      hasFetched = true;
      fetchAll();
    }
  });

  const wrapperRect = wrapper.value.getBoundingClientRect();
  const startScale = 0.5;

  // Visual delta to center the 8000x4500 canvas
  const dx = (wrapperRect.width - 8000) / 2;
  const dy = (wrapperRect.height - 4500) / 2;

  // Divide by startScale to compensate for CSS transform-origin scale reductions
  const startX = dx / startScale;
  const startY = dy / startScale;

  const panzoom = Panzoom(canvas.value, {
    maxScale: 3.5,
    minScale: 0.5,
    startScale: startScale,
    startX: startX,
    startY: startY,
    contain: "outside",
    step: 0.1,
    cursor: "grab",
  });
  wrapper.value.addEventListener("wheel", panzoom.zoomWithWheel);

  resetView.value.addEventListener("click", () => panzoom.reset());

  // Edge Hit Logic Optimized (No Vue reactivity loop & RAF throttled)
  canvas.value.addEventListener("panzoompan", () => {
    if (!wrapper.value || !canvas.value) return;

    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      rafId = null;

      const wrapperRect = wrapper.value.getBoundingClientRect();
      const canvasRect = canvas.value.getBoundingClientRect();

      const threshold = 10;
      const tHit = canvasRect.top >= wrapperRect.top - threshold;
      const rHit = canvasRect.right <= wrapperRect.right + threshold;
      const bHit = canvasRect.bottom <= wrapperRect.bottom + threshold;
      const lHit = canvasRect.left >= wrapperRect.left - threshold;

      if (edgeTop.value) edgeTop.value.style.opacity = tHit ? "1" : "0";
      if (edgeRight.value) edgeRight.value.style.opacity = rHit ? "1" : "0";
      if (edgeBottom.value) edgeBottom.value.style.opacity = bHit ? "1" : "0";
      if (edgeLeft.value) edgeLeft.value.style.opacity = lHit ? "1" : "0";
    });

    if (edgeHitTimeout) clearTimeout(edgeHitTimeout);
  });

  canvas.value.addEventListener("panzoomend", () => {
    if (edgeHitTimeout) clearTimeout(edgeHitTimeout);
    edgeHitTimeout = setTimeout(() => {
      if (edgeTop.value) edgeTop.value.style.opacity = "0";
      if (edgeRight.value) edgeRight.value.style.opacity = "0";
      if (edgeBottom.value) edgeBottom.value.style.opacity = "0";
      if (edgeLeft.value) edgeLeft.value.style.opacity = "0";
    }, 500);
  });
});
</script>

<template>
  <div
    class="relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-secondary"
  >
    <!-- Loading Animation -->
    <div
      v-if="loading"
      class="absolute inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-4">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-md"
        ></div>
        <p class="text-sm font-medium text-foreground animate-pulse">
          {{ $t("home.pinboard.loading") }}
        </p>
      </div>
    </div>

    <!-- Edge hit visual indicators -->
    <div
      ref="edgeTop"
      class="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-primary/40 to-transparent pointer-events-none transition-opacity duration-300 z-10 opacity-0"
    ></div>
    <div
      ref="edgeBottom"
      class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-primary/40 to-transparent pointer-events-none transition-opacity duration-300 z-10 opacity-0"
    ></div>
    <div
      ref="edgeLeft"
      class="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-primary/40 to-transparent pointer-events-none transition-opacity duration-300 z-10 opacity-0"
    ></div>
    <div
      ref="edgeRight"
      class="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-primary/40 to-transparent pointer-events-none transition-opacity duration-300 z-10 opacity-0"
    ></div>

    <div
      ref="wrapper"
      class="w-full h-125 overflow-hidden shadow-inner relative will-change-transform"
      style="
        background-image: radial-gradient(
          circle,
          rgb(0, 0, 0) 1px,
          transparent 1px
        );
        background-size: 20px 20px;
      "
    >
      <div
        ref="canvas"
        class="w-[8000px] h-[4500px] relative will-change-transform preserve-3d"
      >
        <ImagePin
          v-for="pramuka in data"
          :key="pramuka.id"
          v-bind="pramuka"
          @open-detail="openModal"
        />
      </div>
    </div>

    <!-- Intruksi -->
    <div
      class="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/50 text-white p-3 rounded-lg text-sm text-center"
    >
      <!-- Desktop -->
      <p class="hidden sm:block">
        {{ $t("home.pinboard.instructions_desktop") }}
      </p>

      <!-- Mobile -->
      <p class="sm:hidden">
        {{ $t("home.pinboard.instructions_mobile") }}
      </p>
    </div>

    <!-- Tombol kontrol zoom -->
    <div class="absolute top-4 right-4 z-40 flex flex-col gap-2">
      <button
        ref="resetView"
        class="w-10 h-10 rounded-lg bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-200 backdrop-blur-sm border border-gray-200 hover:scale-105"
        :title="$t('home.pinboard.reset_view')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v6h6M20 20v-6h-6M20 4a8 8 0 00-14.32 3M4 20a8 8 0 0014.32-3"
          />
        </svg>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedCard"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 overscroll-contain touch-none"
          style="will-change: opacity"
          @click.self="closeModal"
        >
          <div
            class="bg-white max-w-lg w-full overflow-hidden shadow-2xl border-2 border-black"
          >
            <div class="relative p-4">
              <!-- Container mengikuti rasio gambar -->
              <div
                class="w-full overflow-hidden shadow-inner bg-gray-100 border-2 border-black flex items-center justify-center min-h-[200px]"
              >
                <!-- Spinner while image is decoding -->
                <div
                  v-if="!imageReady"
                  class="flex items-center justify-center py-16"
                >
                  <div
                    class="h-8 w-8 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin"
                  ></div>
                </div>

                <img
                  v-show="imageReady"
                  :src="selectedCard.image_url"
                  :alt="selectedCard.title"
                  class="w-full h-auto object-contain"
                />
              </div>

              <button
                @click="closeModal"
                class="absolute top-6 right-6 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full h-10 w-10 flex items-center justify-center transition z-10"
              >
                ✕
              </button>
            </div>

            <div class="text-center pt-0">
              <h2 class="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {{ selectedCard.title }}
              </h2>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
