<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useGalleryService, type GalleryItem } from '~/services/galleryService'

import { useGalleryNotifications } from '~/composables/useGalleryNotifications'
import { useGalleryDialog } from '~/composables/useGalleryDialog'
import { useGalleryPinboard } from '~/composables/useGalleryPinboard'

import GalleryHeader from '~/components/admin/gallery/GalleryHeader.vue'
import GalleryTabs from '~/components/admin/gallery/GalleryTabs.vue'
import GalleryGrid from '~/components/admin/gallery/GalleryGrid.vue'
import GalleryPinboard from '~/components/admin/gallery/GalleryPinboard.vue'
import GalleryFormDialog from '~/components/admin/gallery/GalleryFormDialog.vue'
import GalleryDeleteDialog from '~/components/admin/gallery/GalleryDeleteDialog.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Kelola Galeri', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { data, loading, fetchAll, insert, update, remove, uploadImage, deleteImage } = useGalleryService()

const activeTab = ref<'grid' | 'pinboard'>('grid')

// Composables
const { showNotification } = useGalleryNotifications()
const {
    dialogOpen, isEditing, confirmOpen, deleteTarget, form, editId, selectedFile,
    openCreate, openEdit, openDelete, onFileSelected
} = useGalleryDialog()

const {
    pinboardCanvas, pinboardWrapper, edgeTop, edgeBottom, edgeLeft, edgeRight, initPinboard, onPinPointerDown
} = useGalleryPinboard(data)

// Local state for actions
const saving = ref(false)
const deleting = ref(false)
const uploading = ref(false)

const galleryPinboardRef = ref<{
    pinboardCanvas: HTMLElement,
    pinboardWrapper: HTMLElement,
    edgeTop: HTMLElement,
    edgeBottom: HTMLElement,
    edgeLeft: HTMLElement,
    edgeRight: HTMLElement
} | null>(null)

const handlePointerDown = (e: PointerEvent, item: GalleryItem) => {
    onPinPointerDown(e, item)
}

watch(activeTab, (tab) => {
    if (tab === 'pinboard') {
        nextTick(() => {
            if (galleryPinboardRef.value) {
                pinboardCanvas.value = galleryPinboardRef.value.pinboardCanvas
                pinboardWrapper.value = galleryPinboardRef.value.pinboardWrapper
                edgeTop.value = galleryPinboardRef.value.edgeTop
                edgeBottom.value = galleryPinboardRef.value.edgeBottom
                edgeLeft.value = galleryPinboardRef.value.edgeLeft
                edgeRight.value = galleryPinboardRef.value.edgeRight
            }
            initPinboard()
        })
    }
})

const generateInitialPosition = (existing: GalleryItem[], canvasWidth = 8000, canvasHeight = 4500) => {
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    // Card is w-40 (160px) + p-4 (32px) ≈ 192px wide, plus margin
    const minDistance = 220

    // Expand search radius based on how many items already exist
    const baseRadius = 300
    const radius = baseRadius + Math.floor(existing.length / 5) * 120

    // Phase 1: Random placement within radius (100 attempts)
    for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * radius
        const x = Math.round(centerX + Math.cos(angle) * dist)
        const y = Math.round(centerY + Math.sin(angle) * dist)

        const isTooClose = existing.some(item => {
            const dx = item.x - x
            const dy = item.y - y
            return Math.abs(dx) < minDistance && Math.abs(dy) < minDistance
        })

        if (!isTooClose) return { x, y }
    }

    // Phase 2: Golden-angle spiral outward from center (even distribution)
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // ~137.5 degrees
    for (let i = 0; i < 200; i++) {
        const angle = i * goldenAngle
        const spiralRadius = minDistance * 0.8 * Math.sqrt(i + 1)
        const x = Math.round(centerX + Math.cos(angle) * spiralRadius)
        const y = Math.round(centerY + Math.sin(angle) * spiralRadius)

        // Stay within canvas bounds
        if (x < 100 || x > canvasWidth - 100 || y < 100 || y > canvasHeight - 100) continue

        const isTooClose = existing.some(item => {
            const dx = item.x - x
            const dy = item.y - y
            return Math.abs(dx) < minDistance && Math.abs(dy) < minDistance
        })

        if (!isTooClose) return { x, y }
    }

    // Phase 3: Grid scan fallback: jaminan tidak tumpang tindih
    const step = minDistance
    for (let gy = step; gy < canvasHeight - step; gy += step) {
        for (let gx = step; gx < canvasWidth - step; gx += step) {
            const isTooClose = existing.some(item => {
                const dx = item.x - gx
                const dy = item.y - gy
                return Math.abs(dx) < minDistance && Math.abs(dy) < minDistance
            })
            if (!isTooClose) return { x: gx, y: gy }
        }
    }

    // Canvas penuh: offset dari titik tengah
    return {
        x: centerX + existing.length * minDistance * 0.3,
        y: centerY
    }
}

const handleSave = async () => {
    try {
        saving.value = true
        let imageUrl = form.value.image_url
        let oldImageUrl: string | null = null

        if (isEditing.value && editId.value) {
            const originalItem = data.value.find(item => item.id === editId.value)
            oldImageUrl = originalItem?.image_url || null
        }

        if (selectedFile.value) {
            uploading.value = true
            imageUrl = await uploadImage(selectedFile.value)
            uploading.value = false
        }

        if (!imageUrl) {
            showNotification('error', 'Silakan pilih gambar')
            saving.value = false
            return
        }

        if (isEditing.value && editId.value) {
            await update(editId.value, { title: form.value.title, description: form.value.description, image_url: imageUrl })
            showNotification('success', 'Foto berhasil diperbarui')
            if (oldImageUrl && oldImageUrl !== imageUrl) {
                await deleteImage(oldImageUrl)
            }
        } else {
            const pos = generateInitialPosition(data.value)
            await insert({
                title: form.value.title,
                description: form.value.description,
                image_url: imageUrl,
                x: pos.x,
                y: pos.y,
                rotation: Math.random() * 6 - 3
            })
            showNotification('success', 'Foto berhasil ditambahkan')
        }
        dialogOpen.value = false
        await fetchAll()
    } catch (e: any) {
        showNotification('error', e.message || 'Gagal menyimpan')
    } finally {
        saving.value = false
        uploading.value = false
    }
}

const handleDelete = async () => {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
        await remove(deleteTarget.value.id, deleteTarget.value.image_url)
        showNotification('success', 'Foto berhasil dihapus')
        confirmOpen.value = false
        await fetchAll()
    } catch (e: any) {
        showNotification('error', e.message || 'Gagal menghapus')
    } finally {
        deleting.value = false
    }
}

onMounted(() => {
    fetchAll();
})
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="sticky top-0 z-25 bg-background flex flex-col gap-2">
            <GalleryHeader @add="openCreate" />
            <GalleryTabs v-model="activeTab" />
        </div>

        <GalleryGrid v-if="activeTab === 'grid'" :data="data" :loading="loading" @edit="openEdit"
            @delete="openDelete" />

        <GalleryPinboard v-show="activeTab === 'pinboard'" ref="galleryPinboardRef" :data="data"
            @pointerdown="handlePointerDown" />

        <GalleryFormDialog v-model="dialogOpen" :is-editing="isEditing" :saving="saving" :uploading="uploading"
            :form="form" @save="handleSave" @file-selected="onFileSelected" />

        <GalleryDeleteDialog v-model="confirmOpen" :deleting="deleting" @confirm="handleDelete" />
    </div>
</template>
