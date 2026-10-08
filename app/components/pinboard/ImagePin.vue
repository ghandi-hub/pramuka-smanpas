<script setup lang="ts">
const props = defineProps({
  image_url: String,
  x: Number,
  y: Number,
  title: String,
  description: String,
  rotation: Number
})

// Definisikan emit agar bisa didengar oleh parent
const emit = defineEmits(['open-detail'])

// Deteksi perangkat layar sentuh/mobile
const isTouchDevice = () => {
  return window.matchMedia('(pointer: coarse)').matches
}

const handleDoubleClick = () => {
  if (!isTouchDevice()) {
    emit('open-detail', props)
  }
}

const handleClick = () => {
  if (isTouchDevice()) {
    emit('open-detail', props)
  }
}
</script>

<template>
  <div
    class="group absolute w-40 p-4 bg-white shadow-lg transition-all duration-200 ease-in-out z-10 hover:scale-105 hover:shadow-2xl hover:z-20 cursor-pointer select-none border border-black"
    :style="{ left: `${x}px`, top: `${y}px`, rotate: `${rotation}deg` }" @dblclick="handleDoubleClick"
    @click="handleClick">

    <!-- pin -->
    <div
      class="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-600 rounded-full border-[3px] border-white shadow-md z-30 flex items-center justify-center">
      <div class="w-1.5 h-1.5 bg-white/40 rounded-full mb-1 ml-1"></div>
    </div>

    <!-- image container -->
    <div class="w-full flex items-center justify-center overflow-hidden relative bg-gray-100 border-2 border-black">

      <img :src="image_url" :alt="title" class="w-full h-auto object-contain" loading="lazy" />

      <!-- overlay -->
      <div
        class="absolute inset-0 bg-gray-800/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p class="text-white text-xs font-medium text-center px-2 leading-snug">
          Double click<br />for detail
        </p>
      </div>

    </div>

    <div class="text-center">
      <h3 class="m-0 text-base font-bold text-gray-800 leading-tight">
        {{ title }}
      </h3>
    </div>

  </div>
</template>