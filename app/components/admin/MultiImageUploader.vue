<script setup lang="ts">
import { computed, ref } from "vue";
import { UploadCloud, X, Loader2, ImagePlus } from "lucide-vue-next";
import { useImageService } from "~/services/imageService";

const props = defineProps<{
  modelValue?: string[] | null;
  loading?: boolean;
  maxPhotos?: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
  (e: "update:loading", value: boolean): void;
}>();

const { uploadImage, deleteImage } = useImageService();

const maxPhotos = computed(() => props.maxPhotos ?? 5);
const uploadings = ref(0);
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const photos = computed<string[]>(() =>
  Array.isArray(props.modelValue)
    ? props.modelValue.filter((p) => typeof p === "string" && p)
    : [],
);

const busy = computed(() => uploadings.value > 0 || !!props.loading);
const canAdd = computed(() => photos.value.length < maxPhotos.value);

const updatePhotos = (next: string[]) => {
  emit("update:modelValue", next);
};

const processFiles = async (fileList: FileList | File[] | null | undefined) => {
  if (!fileList) return;
  const files = Array.from(fileList).filter((f) =>
    f.type.startsWith("image/"),
  );
  if (!files.length) return;

  const slots = maxPhotos.value - photos.value.length;
  const selected = files.slice(0, Math.max(0, slots));

  for (const file of selected) {
    uploadings.value += 1;
    emit("update:loading", true);
    try {
      const url = await uploadImage(file);
      if (url) updatePhotos([...photos.value, url]);
    } catch (e: any) {
      const { toast } = await import("vue-sonner");
      toast.error(e?.message || "Gagal mengunggah foto bukti");
    } finally {
      uploadings.value -= 1;
      if (uploadings.value === 0) emit("update:loading", false);
    }
  }
};

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  await processFiles(target.files);
  if (target) target.value = "";
};

const handleDrop = async (e: DragEvent) => {
  isDragging.value = false;
  await processFiles(e.dataTransfer?.files);
};

const removePhoto = async (url: string) => {
  updatePhotos(photos.value.filter((p) => p !== url));
  try {
    await deleteImage(url);
  } catch {
    // Abaikan kegagalan hapus agar UI tetap konsisten.
  }
};

const openPicker = () => {
  if (!busy.value && canAdd.value) fileInput.value?.click();
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Thumbnails -->
    <div v-if="photos.length" class="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <div
        v-for="url in photos"
        :key="url"
        class="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group"
      >
        <img :src="url" class="w-full h-full object-cover" alt="Bukti foto" />
        <button
          v-if="!busy"
          type="button"
          class="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          title="Hapus foto"
          @click.prevent="removePhoto(url)"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Add more tile -->
      <button
        v-if="canAdd"
        type="button"
        class="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition-colors"
        :disabled="busy"
        @click.prevent="openPicker"
      >
        <Loader2 v-if="busy" class="w-5 h-5 animate-spin" />
        <ImagePlus v-else class="w-5 h-5" />
        <span class="text-[10px] font-medium">Tambah</span>
      </button>
    </div>

    <!-- Dropzone (empty state) -->
    <div
      v-else
      class="flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors cursor-pointer"
      :class="
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50 bg-background'
      "
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="openPicker"
    >
      <div
        class="flex flex-col items-center gap-2 text-muted-foreground pointer-events-none"
      >
        <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-1">
          <Loader2 v-if="busy" class="h-6 w-6 animate-spin" />
          <UploadCloud v-else class="h-6 w-6" />
        </div>
        <p class="text-sm font-medium">Klik atau seret foto bukti</p>
        <p class="text-xs">Wajib minimal 1 foto, maksimal {{ maxPhotos }}</p>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      {{ photos.length }}/{{ maxPhotos }} foto
      <span v-if="!photos.length" class="text-destructive font-medium">
        &middot; bukti foto wajib diunggah
      </span>
    </p>
  </div>
</template>