<script setup lang="ts">
import Button from "../ui/button/Button.vue";
import Slider from "../ui/slider/Slider.vue";
import { Card, CardContent } from "../ui/card";

const props = defineProps<{
  frameUrl: string;
  title: string;
}>();

const container = ref<HTMLDivElement | null>(null);
const imageEl = ref<HTMLImageElement | null>(null);

const userImage = ref<string | null>(null);
const isDragging = ref(false);
const imagePosition = ref({ x: 0, y: 0 });
const imageScale = ref(1);
let startX = 0;
let startY = 0;
let initialX = 0;
let initialY = 0;
let initialPinchDistance = 0;
let initialPinchScale = 1;

const frameSize = ref({ width: 0, height: 0 });
const isLocked = ref(false);
const selectedFormat = ref<'1:1' | '9:16'>('1:1');
const isExporting = ref(false);

watch(
  () => props.frameUrl,
  (url) => {
    if (!url) return;
    if (import.meta.client) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        frameSize.value = { width: img.width, height: img.height };
      };
      img.src = url;
    }
  },
  { immediate: true }
);

const containerStyle = computed(() => {
  return {
    width: "fit-content",
    maxHeight: "65vh",
    margin: "0 auto",
    position: "relative" as const,
  };
});

const sliderValue = computed({
  get: () => [imageScale.value],
  set: (val) => {
    if (val && val[0] !== undefined) {
      imageScale.value = val[0];
    }
  },
});

function startDrag(e: MouseEvent | TouchEvent) {
  // Only handle left click for mouse
  if (e instanceof MouseEvent && e.button !== 0) return;

  isDragging.value = true;

  if ("touches" in e) {
    const touch1 = e.touches[0];
    if (!touch1) return;

    if (e.touches.length === 2) {
      const touch2 = e.touches[1];
      if (touch2) {
        initialPinchDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        initialPinchScale = imageScale.value;
      }
    }
    startX = touch1.clientX;
    startY = touch1.clientY;
  } else {
    startX = (e as MouseEvent).clientX;
    startY = (e as MouseEvent).clientY;
    // Prevent default for mouse to avoid selection/drag ghosting
    e.preventDefault();
  }

  initialX = imagePosition.value.x;
  initialY = imagePosition.value.y;
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return;

  if ("touches" in e) {
    // Handle pinch to zoom
    if (e.touches.length === 2 && initialPinchDistance > 0) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (touch1 && touch2) {
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        const factor = currentDistance / initialPinchDistance;
        imageScale.value = Math.max(0.1, Math.min(5, initialPinchScale * factor));
        return;
      }
    }

    // Handle single touch pan
    const touch = e.touches[0];
    if (touch) {
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      imagePosition.value = {
        x: initialX + dx,
        y: initialY + dy,
      };
    }
  } else {
    const mouseEvent = e as MouseEvent;
    const dx = mouseEvent.clientX - startX;
    const dy = mouseEvent.clientY - startY;

    imagePosition.value = {
      x: initialX + dx,
      y: initialY + dy,
    };
  }
}

function endDrag() {
  isDragging.value = false;
  initialPinchDistance = 0;
}

function handleWheel(e: WheelEvent) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  const newScale = Math.max(0.1, Math.min(5, imageScale.value + delta));
  imageScale.value = newScale;
}

function uploadImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Revoke the old URL to free up memory if it exists
  if (userImage.value && userImage.value.startsWith("blob:")) {
    URL.revokeObjectURL(userImage.value);
  }

  // Create a new blob URL instead of base64 for better performance
  userImage.value = URL.createObjectURL(file);
  
  // Reset position when new image is uploaded
  imagePosition.value = { x: 0, y: 0 };
  imageScale.value = 1;
}

// Cleanup object URL when component is destroyed
onUnmounted(() => {
  if (userImage.value && userImage.value.startsWith("blob:")) {
    URL.revokeObjectURL(userImage.value);
  }
});

function resetPosition() {
  imagePosition.value = { x: 0, y: 0 };
  imageScale.value = 1;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith("blob:") && !url.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

async function downloadImage() {
  if (!userImage.value || !props.frameUrl || !imageEl.value || !container.value || isExporting.value)
    return;

  isExporting.value = true;

  try {
    const [frame, img] = await Promise.all([
      loadImage(props.frameUrl),
      loadImage(userImage.value),
    ]);

    const format = selectedFormat.value;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to initialize canvas context");
    }

    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    const imageRatio = imgW / imgH;
    const SQUARE_SIZE = 1080;

    let drawWidth: number;
    let drawHeight: number;

    // object-contain logic for square twibbon
    if (imageRatio > 1) {
      drawWidth = SQUARE_SIZE;
      drawHeight = SQUARE_SIZE / imageRatio;
    } else {
      drawHeight = SQUARE_SIZE;
      drawWidth = SQUARE_SIZE * imageRatio;
    }

    // Apply user scale
    drawWidth *= imageScale.value;
    drawHeight *= imageScale.value;

    // Center the image in 1080x1080
    let x = (SQUARE_SIZE - drawWidth) / 2;
    let y = (SQUARE_SIZE - drawHeight) / 2;

    // Apply user position offset
    const renderedWidth = container.value.offsetWidth || SQUARE_SIZE;
    const displayToCanvasScale = SQUARE_SIZE / renderedWidth;

    x += imagePosition.value.x * displayToCanvasScale;
    y += imagePosition.value.y * displayToCanvasScale;

    if (format === "1:1") {
      canvas.width = SQUARE_SIZE;
      canvas.height = SQUARE_SIZE;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      ctx.drawImage(frame, 0, 0, SQUARE_SIZE, SQUARE_SIZE);
    } else {
      const CANVAS_WIDTH = 1080;
      const CANVAS_HEIGHT = 1920;
      const Y_OFFSET = 420; // (1920 - 1080) / 2 = 420

      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      // 1. Dark base background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, "#0b0f19");
      bgGrad.addColorStop(0.5, "#151e2e");
      bgGrad.addColorStop(1, "#0b0f19");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Blurred & dimmed user photo filling 1080x1920 (cover fit)
      const storyRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
      let bgW: number;
      let bgH: number;

      if (imageRatio > storyRatio) {
        bgH = CANVAS_HEIGHT + 100;
        bgW = bgH * imageRatio;
      } else {
        bgW = CANVAS_WIDTH + 100;
        bgH = bgW / imageRatio;
      }

      const bgX = (CANVAS_WIDTH - bgW) / 2;
      const bgY = (CANVAS_HEIGHT - bgH) / 2;

      ctx.save();
      if ("filter" in ctx) {
        ctx.filter = "blur(40px) brightness(0.4) saturate(1.2)";
      }
      ctx.drawImage(img, bgX, bgY, bgW, bgH);
      ctx.restore();

      // 3. Dark stylish gradient overlay
      const overlayGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      overlayGrad.addColorStop(0, "rgba(10, 15, 26, 0.7)");
      overlayGrad.addColorStop(0.2, "rgba(10, 15, 26, 0.4)");
      overlayGrad.addColorStop(0.8, "rgba(10, 15, 26, 0.4)");
      overlayGrad.addColorStop(1, "rgba(10, 15, 26, 0.7)");
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 4. Subtle depth shadow behind twibbon
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, Y_OFFSET, SQUARE_SIZE, SQUARE_SIZE);
      ctx.restore();

      // 5. Draw user photo clipped to twibbon square bounds
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, Y_OFFSET, SQUARE_SIZE, SQUARE_SIZE);
      ctx.clip();
      ctx.drawImage(img, x, y + Y_OFFSET, drawWidth, drawHeight);
      ctx.restore();

      // 6. Draw twibbon frame centered vertically at Y_OFFSET = 420
      ctx.drawImage(frame, 0, Y_OFFSET, SQUARE_SIZE, SQUARE_SIZE);
    }

    const formatSuffix = format === "9:16" ? "story" : "square";
    const safeTitle = (props.title || "twibbon")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-") || "twibbon";

    const link = document.createElement("a");
    link.download = `twibbon-${safeTitle}-${formatSuffix}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error("Failed to generate twibbon export:", error);
  } finally {
    isExporting.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-8 w-full">
    <!-- Upload Section -->
    <div class="w-full max-w-md">
      <label class="block text-sm font-medium text-foreground mb-2">
        {{ $t('twibbon.upload.label') || 'Upload Foto Anda' }}
      </label>
      <div
        class="relative border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
        <input type="file" accept="image/*" @change="uploadImage"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div class="flex flex-col items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-muted-foreground" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p v-if="!userImage" class="text-sm font-medium text-foreground">
              {{ $t('twibbon.upload.title') }}
            </p>
            <p v-else class="text-sm font-medium text-foreground">
              {{ $t('twibbon.upload.change') }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              {{ $t('twibbon.upload.hint') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Section -->
    <Card class="w-full max-w-xl border-2 shadow-2xl bg-card overflow-hidden">
      <CardContent class="flex flex-col items-center gap-6">
        <!-- Editor -->
        <div class="relative w-full">
          <div v-if="props.frameUrl" ref="container" :style="containerStyle" class="overflow-hidden leading-[0]">
            <!-- Visible spacer to drive container height and width correctly -->
            <img :src="props.frameUrl"
              class="block h-auto w-auto max-w-[300px] sm:max-w-[450px] max-h-[60vh] opacity-0 pointer-events-none mx-auto"
              aria-hidden="true" />

            <img v-if="userImage" ref="imageEl" :src="userImage"
              class="absolute inset-0 w-full h-full object-contain cursor-grab" :class="{
                'cursor-grabbing': isDragging,
                'touch-none': !isLocked,
                'pointer-events-none': isLocked
              }" :style="{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                transformOrigin: 'center center',
              }" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag"
              @touchstart="startDrag" @touchmove="onDrag" @touchend="endDrag" @touchcancel="endDrag"
              @wheel="handleWheel" />

            <img :src="props.frameUrl"
              class="pointer-events-none absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300"
              :class="isDragging ? 'opacity-40' : 'opacity-100'" />

            <div v-if="!userImage" class="absolute inset-0 flex items-center justify-center">
              <p class="text-sm text-muted-foreground">{{ $t('twibbon.upload.placeholder') }}</p>
            </div>
          </div>
        </div>

        <!-- Control Panel -->
        <div v-if="userImage"
          class="w-full flex flex-col gap-5 bg-muted/40 border border-border/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm shadow-sm mt-2">

          <!-- Format Selector Section -->
          <div class="w-full space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-[10px] font-bold uppercase tracking-widest">{{ $t('twibbon.controls.format') }}</span>
              </div>
              <span
                class="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {{ selectedFormat === '1:1' ? '1080×1080' : '1080×1920' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 sm:gap-3">
              <!-- Square 1:1 -->
              <button
                type="button"
                @click="selectedFormat = '1:1'"
                :class="[
                  'flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer',
                  selectedFormat === '1:1'
                    ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm'
                    : 'border-border/60 bg-background/60 hover:bg-muted text-muted-foreground'
                ]">
                <div
                  class="w-9 h-9 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors"
                  :class="selectedFormat === '1:1' ? 'border-primary bg-primary text-primary-foreground font-bold' : 'border-muted-foreground/40 bg-muted/50'">
                  <span class="text-[11px] font-bold font-mono">1:1</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm font-semibold truncate text-foreground">{{ $t('twibbon.controls.formatSquare') }}</p>
                  <p class="text-[11px] text-muted-foreground truncate">{{ $t('twibbon.controls.formatSquareDesc') }}</p>
                </div>
              </button>

              <!-- Story 9:16 -->
              <button
                type="button"
                @click="selectedFormat = '9:16'"
                :class="[
                  'flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer',
                  selectedFormat === '9:16'
                    ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm'
                    : 'border-border/60 bg-background/60 hover:bg-muted text-muted-foreground'
                ]">
                <div
                  class="w-9 h-9 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors"
                  :class="selectedFormat === '9:16' ? 'border-primary bg-primary text-primary-foreground font-bold' : 'border-muted-foreground/40 bg-muted/50'">
                  <span class="text-[11px] font-bold font-mono">9:16</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm font-semibold truncate text-foreground">{{ $t('twibbon.controls.formatStory') }}</p>
                  <p class="text-[11px] text-muted-foreground truncate">{{ $t('twibbon.controls.formatStoryDesc') }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Subtle Divider -->
          <div class="h-px w-full bg-border/40" />

          <!-- Zoom Section -->
          <div class="w-full space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span class="text-[10px] font-bold uppercase tracking-widest">{{ $t('twibbon.controls.zoom') }}</span>
              </div>
              <span
                class="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {{ Math.round(imageScale * 100) }}%
              </span>
            </div>
            <Slider v-model="sliderValue" :min="0.1" :max="5" :step="0.01" class="cursor-pointer" />
          </div>

          <!-- Subtle Divider -->
          <div class="h-px w-full bg-border/40" />

          <!-- Action Buttons Row -->
          <div class="flex flex-wrap items-center justify-between w-full gap-4">
            <!-- Left Group: Zoom & Reset Tools -->
            <div class="flex items-center gap-2">
              <button @click="imageScale = Math.max(0.1, imageScale - 0.1)"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted active:scale-95 transition-all bg-background border shadow-sm cursor-pointer"
                :title="$t('twibbon.controls.zoomOut')">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <button @click="imageScale = Math.min(5, imageScale + 0.1)"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted active:scale-95 transition-all bg-background border shadow-sm cursor-pointer"
                :title="$t('twibbon.controls.zoomIn')">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button @click="resetPosition"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted active:scale-95 transition-all bg-background border shadow-sm cursor-pointer"
                :title="$t('twibbon.controls.reset')">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <!-- Right Group: Download -->
            <div class="flex items-center gap-2 flex-1 sm:flex-none justify-end">
              <Button @click="downloadImage" :disabled="isExporting" size="default"
                class="h-10 px-6 gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 cursor-pointer">
                <svg v-if="isExporting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{{ isExporting ? $t('twibbon.controls.downloading') : $t('twibbon.controls.download') }}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Tips -->
    <div v-if="userImage" class="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 w-full">
      <p class="font-medium text-foreground mb-1">💡 {{ $t('twibbon.tips.title') }}</p>
      <ul class="list-disc list-inside">
        <li>{{ $t('twibbon.tips.zoom') }}</li>
        <li>{{ $t('twibbon.tips.drag') }}</li>
      </ul>
    </div>
  </div>
</template>
