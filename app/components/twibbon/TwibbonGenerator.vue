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

function downloadImage() {
  if (!userImage.value || !props.frameUrl || !imageEl.value || !container.value)
    return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const frame = new Image();
  const img = new Image();

  // Set crossOrigin to handle CORS images
  img.crossOrigin = "anonymous";
  frame.crossOrigin = "anonymous";

  frame.onload = () => {
    const canvasWidth = frame.width;
    const canvasHeight = frame.height;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    img.onload = () => {
      const imageRatio = img.width / img.height;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth: number;
      let drawHeight: number;

      // object-contain logic
      if (imageRatio > canvasRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imageRatio;
      } else {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imageRatio;
      }

      // Apply user scale (zoom)
      drawWidth *= imageScale.value;
      drawHeight *= imageScale.value;

      // Center the image
      let x = (canvasWidth - drawWidth) / 2;
      let y = (canvasHeight - drawHeight) / 2;

      // Apply user position offset
      // renderedWidth is the current DOM width of the container
      const renderedWidth = container.value!.offsetWidth;
      const displayToCanvasScale = canvasWidth / renderedWidth;

      x += imagePosition.value.x * displayToCanvasScale;
      y += imagePosition.value.y * displayToCanvasScale;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      ctx.drawImage(frame, 0, 0, canvasWidth, canvasHeight);

      // Download
      const link = document.createElement("a");
      link.download = `twibbon-${props.title}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = userImage.value!;
  };

  frame.onerror = () => {
    console.error("Failed to load frame image");
  };

  img.onerror = () => {
    console.error("Failed to load user image");
  };

  // Start loading by setting frame source first
  frame.src = props.frameUrl;
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
            <!-- Left Group: Zoom Tools -->
            <div class="flex items-center gap-2">
              <button @click="imageScale = Math.max(0.1, imageScale - 0.1)"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted active:scale-95 transition-all bg-background border shadow-sm"
                :title="$t('twibbon.controls.zoomOut')">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <button @click="imageScale = Math.min(5, imageScale + 0.1)"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted active:scale-95 transition-all bg-background border shadow-sm"
                :title="$t('twibbon.controls.zoomIn')">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <!-- Right Group: Download -->
            <div class="flex items-center gap-2 flex-1 sm:flex-none justify-end">
              <Button @click="downloadImage" size="default"
                class="h-10 px-6 gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ $t('twibbon.controls.download') }}
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
